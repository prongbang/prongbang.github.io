---
layout: post
title: "[Rust] การใช้งาน hexagonal-rs โครงโปรเจกต์ Hexagonal Architecture ด้วย Axum"
short_description: "แนะนำการใช้งาน hexagonal-rs โครงโปรเจกต์ Rust สำหรับทำ API แบบ Hexagonal/Clean Architecture โดยแยก api, application, domain, infrastructure และ bootstrap ออกจากกันอย่างชัดเจน"
date: 2026-06-10 11:00:00 +0700
categories: [rust]
tags: [rust]
cover_image: /assets/images/rust/5.png
author: "Devไปวันๆ"
---

### hexagonal-rs คืออะไร

`hexagonal-rs` เป็นโครงโปรเจกต์ Rust สำหรับเขียน API ด้วยแนวคิด Hexagonal/Clean Architecture โดยใช้ `axum` เป็น HTTP layer และแยกส่วนของระบบออกเป็น layer ที่อ่านง่าย เปลี่ยน adapter ได้ง่าย และ test ได้ง่ายขึ้น

จากโค้ดในโปรเจกต์นี้ โครงหลักจะอยู่ประมาณนี้

{% highlight shell %}
src/
├── main.rs
├── bootstrap.rs
├── api/
│   └── mod.rs
├── application/
│   └── mod.rs
├── domain/
│   ├── errors.rs
│   ├── mod.rs
│   ├── model.rs
│   └── ports.rs
├── infrastructure/
│   ├── in_memory_repo.rs
│   └── mod.rs
└── lib.rs
{% endhighlight %}

แนวคิดสำคัญคือ business rule อยู่ใน `domain`, use case อยู่ใน `application`, HTTP อยู่ใน `api`, ส่วน adapter เช่น database หรือ external service อยู่ใน `infrastructure` และให้ `bootstrap.rs` เป็นจุดประกอบทุกอย่างเข้าด้วยกัน

---

### ติดตั้งและรันโปรเจกต์

เริ่มจาก clone repo

{% highlight shell %}
git clone https://github.com/prongbang/hexagonal-rs.git
cd hexagonal-rs
{% endhighlight %}

รัน API ได้ด้วยคำสั่ง

{% highlight shell %}
cargo run
{% endhighlight %}

จาก `src/main.rs` ตัว server จะ bind ที่ `0.0.0.0:8080`

{% highlight rust %}
let app = bootstrap::build_router();

let addr = "0.0.0.0:8080";
tracing::info!("listening on http://{addr}");

let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
axum::serve(listener, app).await?;
{% endhighlight %}

ลองเช็ค health endpoint ได้แบบนี้

{% highlight shell %}
curl http://localhost:8080/health
{% endhighlight %}

ถ้ารันได้ปกติจะได้ผลลัพธ์เป็น

{% highlight text %}
ok
{% endhighlight %}

---

### Dependency ที่ใช้

ใน `Cargo.toml` โปรเจกต์นี้ใช้ dependency หลัก ๆ คือ

* `axum` สำหรับ HTTP routing และ handler
* `tokio` สำหรับ async runtime
* `serde` และ `serde_json` สำหรับ request/response JSON
* `async-trait` สำหรับ trait แบบ async
* `thiserror` สำหรับจัดการ error ใน domain
* `tracing` และ `tracing-subscriber` สำหรับ logging

จุดที่ดีคือ dependency ของ domain ยังน้อย และไม่ได้ผูกกับ web framework โดยตรง ทำให้ย้าย adapter หรือเปลี่ยน delivery layer ได้ง่ายกว่าเอา HTTP หรือ database logic ไปปนใน business rule

---

### Domain Layer

ใน `src/domain/model.rs` มี `User` เป็น domain model และมี validation อยู่ใน constructor

{% highlight rust %}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub name: String,
}

impl User {
    pub fn new(
        id: impl Into<String>,
        name: impl Into<String>
    ) -> Result<Self, crate::domain::errors::DomainError> {
        let id = id.into();
        let name = name.into();
        if name.trim().is_empty() {
            return Err(crate::domain::errors::DomainError::Validation(
                "name is empty".into()
            ));
        }
        Ok(Self { id, name })
    }
}
{% endhighlight %}

ตรงนี้เป็นตัวอย่างที่เห็นภาพดีว่า rule ของระบบไม่ควรไปอยู่ที่ handler เพราะไม่ว่าเราจะเรียก use case ผ่าน HTTP, CLI, queue หรือ test rule นี้ก็ยังทำงานเหมือนเดิม

ส่วน `src/domain/ports.rs` จะประกาศ port ที่ domain ต้องการใช้งาน

{% highlight rust %}
#[async_trait]
pub trait UserRepository: Send + Sync {
    async fn save(&self, user: User) -> Result<(), DomainError>;
    async fn get(&self, id: &str) -> Result<User, DomainError>;
}
{% endhighlight %}

`UserRepository` เป็น trait ไม่ใช่ implementation จริง ทำให้ application layer ไม่จำเป็นต้องรู้ว่า data จะมาจาก memory, Postgres, Redis หรือ service อื่น

---

### Application Layer

`src/application/mod.rs` เป็นชั้น use case ของระบบ โดยมี `UserService` และ `UserServiceImpl`

{% highlight rust %}
#[async_trait]
pub trait UserService: Send + Sync {
    async fn create_user(&self, id: String, name: String) -> Result<(), DomainError>;
    async fn get_user(&self, id: String) -> Result<User, DomainError>;
}

pub struct UserServiceImpl<R: UserRepository> {
    repo: Arc<R>,
}
{% endhighlight %}

เวลาสร้าง user จะให้ domain model ตรวจ validation ก่อน แล้วค่อยส่งต่อไปยัง repository port

{% highlight rust %}
#[async_trait]
impl<R: UserRepository> UserService for UserServiceImpl<R> {
    async fn create_user(&self, id: String, name: String) -> Result<(), DomainError> {
        let user = User::new(id, name)?;
        self.repo.save(user).await
    }

    async fn get_user(&self, id: String) -> Result<User, DomainError> {
        self.repo.get(&id).await
    }
}
{% endhighlight %}

สรุปคือ application layer ทำหน้าที่ orchestrate flow ส่วน rule ที่เป็นแก่นของข้อมูลยังอยู่ใน domain

---

### Infrastructure Layer

ในตัวอย่างนี้ implementation ของ repository เป็น in-memory store ที่อยู่ใน `src/infrastructure/in_memory_repo.rs`

{% highlight rust %}
#[derive(Default)]
pub struct InMemoryUserRepository {
    inner: Arc<RwLock<HashMap<String, User>>>,
}

impl InMemoryUserRepository {
    pub fn new() -> Self { Self::default() }
}
{% endhighlight %}

แล้ว implement `UserRepository` ที่ domain ประกาศไว้

{% highlight rust %}
#[async_trait]
impl UserRepository for InMemoryUserRepository {
    async fn save(&self, user: User) -> Result<(), DomainError> {
        self.inner.write().await.insert(user.id.clone(), user);
        Ok(())
    }

    async fn get(&self, id: &str) -> Result<User, DomainError> {
        self.inner.read().await
            .get(id)
            .cloned()
            .ok_or(DomainError::NotFound)
    }
}
{% endhighlight %}

ถ้าวันหลังจะเปลี่ยนเป็น Postgres ก็เพิ่ม adapter ใหม่ใน `infrastructure` แล้ว implement trait เดิมได้ โดยไม่ต้องแก้ `domain` และ `application`

---

### API Layer

HTTP layer อยู่ใน `src/api/mod.rs` โดย route หลัก ๆ มี 3 endpoint

{% highlight rust %}
axum::Router::new()
    .route("/health", get(health))
    .route("/users/{id}", get(get_user::<U>))
    .route("/users", post(create_user::<U>))
    .with_state(state)
{% endhighlight %}

request สำหรับสร้าง user เป็น DTO แยกจาก domain model

{% highlight rust %}
#[derive(Deserialize)]
pub struct CreateUserReq {
    pub id: String,
    pub name: String,
}
{% endhighlight %}

handler จะรับ request แล้วเรียก service ที่ถูก inject ผ่าน state

{% highlight rust %}
pub async fn create_user<U>(
    State(user_svc): State<UserSvc<U>>,
    Json(req): Json<CreateUserReq>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<ErrorRes>)>
where
    U: UserService + Send + Sync + 'static,
{
    user_svc
        .create_user(req.id, req.name)
        .await
        .map_err(to_http_err)?;
    Ok(Json(serde_json::json!({ "ok": true })))
}
{% endhighlight %}

ส่วน error จาก domain จะถูก map เป็น HTTP status code ที่ `to_http_err`

{% highlight rust %}
fn to_http_err(e: DomainError) -> (StatusCode, Json<ErrorRes>) {
    let (code, msg) = match e {
        DomainError::NotFound => (StatusCode::NOT_FOUND, "not found".to_string()),
        DomainError::Validation(m) => (StatusCode::BAD_REQUEST, m),
        DomainError::Other(_) => (StatusCode::INTERNAL_SERVER_ERROR, "internal error".into()),
    };
    (code, Json(ErrorRes { error: msg }))
}
{% endhighlight %}

ตรงนี้ทำให้ API layer สนใจเฉพาะ HTTP, JSON และ status code ไม่ต้องรู้ว่า repository เก็บข้อมูลไว้ที่ไหน

---

### Bootstrap หรือ Composition Root

จุดที่ประกอบ implementation จริงเข้ากับ port คือ `src/bootstrap.rs`

{% highlight rust %}
pub fn build_services() -> api::Services<UserServiceImpl<InMemoryUserRepository>> {
    let repo = Arc::new(InMemoryUserRepository::new());
    let user_svc = Arc::new(UserServiceImpl::new(repo));
    api::Services { user: user_svc }
}

pub fn build_router() -> axum::Router {
    let services = build_services();
    api::router(services)
}
{% endhighlight %}

นี่คือจุดที่ allowed ให้รู้จักทุก layer เพราะหน้าที่ของมันคือประกอบ app ให้พร้อมรัน ถ้าจะสลับ `InMemoryUserRepository` เป็น repository ตัวอื่น ก็ควรจบที่ไฟล์นี้เป็นหลัก

---

### ลองเรียก API

หลังจาก `cargo run` แล้ว สร้าง user ได้แบบนี้

{% highlight shell %}
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{"id":"u1","name":"Prongbang"}'
{% endhighlight %}

ผลลัพธ์ที่ได้

{% highlight json %}
{"ok":true}
{% endhighlight %}

ดึง user กลับมา

{% highlight shell %}
curl http://localhost:8080/users/u1
{% endhighlight %}

ผลลัพธ์

{% highlight json %}
{"id":"u1","name":"Prongbang"}
{% endhighlight %}

ถ้าส่งชื่อว่างเข้าไป domain validation จะตอบกลับเป็น `400 Bad Request`

{% highlight shell %}
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{"id":"u2","name":""}'
{% endhighlight %}

ผลลัพธ์

{% highlight json %}
{"error":"name is empty"}
{% endhighlight %}

---

### เหมาะกับงานแบบไหน

`hexagonal-rs` เหมาะกับการใช้เป็น starter สำหรับ API ที่อยากวาง boundary ให้ชัดตั้งแต่แรก เช่น

* API ที่มี business rule และต้อง test use case แยกจาก HTTP
* ระบบที่ตอนเริ่มใช้ in-memory หรือ mock ก่อน แล้วค่อยเปลี่ยนเป็น database จริง
* service ที่มี adapter หลายแบบ เช่น database, queue, external API
* โปรเจกต์ที่อยากให้ `domain` และ `application` ไม่ผูกกับ `axum`

ถ้าโปรเจกต์เล็กมาก ๆ มีแค่ไม่กี่ endpoint โครงแบบนี้อาจดูเยอะไปนิด แต่ถ้าเริ่มมี rule, integration และ test มากขึ้น การแยก layer แบบนี้ช่วยให้โค้ดไม่ไหลไปรวมกันใน handler

---

### Repository

ดูโค้ดเพิ่มเติมได้ที่ [prongbang/hexagonal-rs](https://github.com/prongbang/hexagonal-rs)
