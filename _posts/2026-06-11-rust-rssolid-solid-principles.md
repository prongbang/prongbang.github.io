---
layout: post
title: "[Rust] การใช้งาน rssolid ตัวอย่าง S.O.L.I.D Principles ในภาษา Rust"
short_description: "แนะนำ repo prongbang/rssolid สำหรับเรียนรู้การประยุกต์ใช้ S.O.L.I.D ใน Rust ผ่าน trait, struct, generic และ dependency inversion แบบอ่านจากโค้ดจริง"
date: 2026-06-11 12:00:00 +0700
categories: [rust]
tags: [rust]
cover_image: /assets/images/rust/6.png
author: "Devไปวันๆ"
---

ถ้าเคยอ่านเรื่อง S.O.L.I.D จากฝั่ง OOP อย่าง Java, Kotlin, C# หรือ Go แล้วพอมาเขียน Rust อาจจะงงนิดหน่อยว่า หลักการเดียวกันนี้จะเอามาวางในโลกของ `struct`, `trait`, generic และ ownership ยังไงดี

`rssolid` เป็น repo ตัวอย่างขนาดเล็กที่เอา S.O.L.I.D ทั้ง 5 ข้อมาทำเป็น Rust module แยกกัน อ่านง่ายมาก เพราะไม่มี dependency เพิ่ม และใน `main.rs` เรียกตัวอย่างทั้ง 5 ตัวตรง ๆ

Repository: [github.com/prongbang/rssolid](https://github.com/prongbang/rssolid)

## โครงสร้างโปรเจค

ใน `Cargo.toml` เป็น Rust edition 2021 และไม่มี dependency เพิ่ม

{% highlight toml %}
[package]
name = "rssolid"
version = "0.1.0"
edition = "2021"

[dependencies]
{% endhighlight %}

โครงสร้าง source แยกตามหลัก S.O.L.I.D

{% highlight shell %}
src
├── main.rs
├── srp
│   └── mod.rs
├── ocp
│   └── mod.rs
├── lsp
│   └── mod.rs
├── isp
│   └── mod.rs
└── dip
    └── mod.rs
{% endhighlight %}

ไฟล์ `main.rs` คือจุดรวมที่เรียกทุกตัวอย่าง

{% highlight rust %}
mod dip;
mod isp;
mod lsp;
mod ocp;
mod srp;

fn main() {
    // 1. Single Responsibility Principle
    srp::example();

    // 2. Open/Closed Principle
    ocp::example();

    // 3. Liskov Substitution Principle
    lsp::example();

    // 4. Interface Segregation Principle
    isp::example();

    // 5. Dependency Inversion Principle
    dip::example();
}
{% endhighlight %}

ถ้าจะลองรันก็ clone repo แล้วใช้คำสั่งนี้ได้เลย

{% highlight shell %}
cargo run
{% endhighlight %}

## 1. Single Responsibility Principle

Single Responsibility Principle หรือ SRP คือ code หนึ่งส่วนควรมีเหตุผลในการเปลี่ยนแปลงแค่อย่างเดียว พูดง่าย ๆ คืออย่ายัดหน้าที่หลายเรื่องไว้ใน type เดียว

ใน `src/srp/mod.rs` มี `Employee` เป็นข้อมูลหลัก แล้วแยกหน้าที่การแก้ชื่อกับแก้อีเมลออกเป็น trait คนละตัว

{% highlight rust %}
#[derive(Debug)]
struct Employee {
    name: String,
    email: String,
}

trait NameUpdater {
    fn update_name(&self, employee: &mut Employee, name: &str);
}

trait EmailUpdater {
    fn update_email(&self, employee: &mut Employee, email: &str);
}
{% endhighlight %}

จากนั้นมี implementation แยกกัน

{% highlight rust %}
struct NameUpdaterImpl;
struct EmailUpdaterImpl;

impl NameUpdater for NameUpdaterImpl {
    fn update_name(&self, employee: &mut Employee, name: &str) {
        employee.name = name.to_string();
    }
}

impl EmailUpdater for EmailUpdaterImpl {
    fn update_email(&self, employee: &mut Employee, email: &str) {
        employee.email = email.to_string();
    }
}
{% endhighlight %}

เวลาใช้งานก็สร้าง updater แต่ละตัว แล้วส่ง mutable reference ของ `Employee` เข้าไป

{% highlight rust %}
pub fn example() {
    println!("Single Responsibility Principle:");

    let mut emp = Employee {
        name: String::new(),
        email: String::new(),
    };

    let email_updater = EmailUpdaterImpl {};
    let name_updater = NameUpdaterImpl {};

    name_updater.update_name(&mut emp, "Devไปวันๆ");
    email_updater.update_email(&mut emp, "name@email.dev");

    println!(" > {:?}", &emp);
}
{% endhighlight %}

จุดที่น่าสังเกตคือ Rust บังคับให้การแก้ค่า `Employee` ต้องผ่าน `&mut Employee` ทำให้เห็นชัดมากว่า function ไหนกำลังเปลี่ยน state ของ object

## 2. Open/Closed Principle

Open/Closed Principle หรือ OCP คือ code ควรเปิดให้ขยายได้ แต่ไม่ควรต้องแก้ของเดิมทุกครั้งที่เพิ่ม behavior ใหม่

ใน `src/ocp/mod.rs` ใช้ `Logger` trait เป็น contract กลาง

{% highlight rust %}
trait Logger {
    fn log(&self, msg: &str);
}
{% endhighlight %}

จากนั้นเพิ่ม logger ปลายทางใหม่ด้วย struct ใหม่ที่ implement trait เดิม

{% highlight rust %}
struct FileLogger;

impl Logger for FileLogger {
    fn log(&self, msg: &str) {
        println!("> Log to file: {}", msg);
    }
}

struct DatabaseLogger;

impl Logger for DatabaseLogger {
    fn log(&self, msg: &str) {
        println!("> Log to database: {}", msg);
    }
}
{% endhighlight %}

เวลาเรียกใช้งาน

{% highlight rust %}
pub fn example() {
    println!("Open/Closed Principle");

    let f_log = FileLogger;
    let d_log = DatabaseLogger;

    f_log.log("Devไปวันๆ");
    d_log.log("Devไปวันๆ");
}
{% endhighlight %}

ถ้าวันหลังอยากเพิ่ม `ConsoleLogger` หรือ `KafkaLogger` ก็เพิ่ม struct ใหม่แล้ว implement `Logger` โดยไม่ต้องไปแก้ `FileLogger` หรือ `DatabaseLogger`

## 3. Liskov Substitution Principle

Liskov Substitution Principle หรือ LSP คือ type ที่อยู่ใต้ abstraction เดียวกันควรแทนกันได้โดยไม่ทำให้ behavior เพี้ยน

ตัวอย่างใน `src/lsp/mod.rs` แยกความสามารถเป็น `Flyer` และ `Walker`

{% highlight rust %}
trait Flyer {
    fn fly(&self);
}

trait Walker {
    fn walk(&self);
}
{% endhighlight %}

`Bird` ทำได้ทั้งบินและเดิน

{% highlight rust %}
struct Bird;

impl Flyer for Bird {
    fn fly(&self) {
        println!("> Flying bird is flying");
    }
}

impl Walker for Bird {
    fn walk(&self) {
        println!("> Working bird is walking");
    }
}
{% endhighlight %}

`Duck` ใช้ composition โดยถือ `Bird` ไว้ข้างใน และ forward behavior การบินไปให้ `Bird`

{% highlight rust %}
struct Duck {
    bird: Bird,
}

impl Flyer for Duck {
    fn fly(&self) {
        self.bird.fly();
    }
}

impl Walker for Duck {
    fn walk(&self) {
        println!("> Working duck is walking");
    }
}
{% endhighlight %}

ส่วน `Penguin` implement เฉพาะ `Walker` เพราะตัวอย่างนี้ไม่ให้มันฝืน implement `Flyer`

{% highlight rust %}
struct Penguin;

impl Walker for Penguin {
    fn walk(&self) {
        println!("> Working penguin is walking");
    }
}
{% endhighlight %}

นี่คือจุดที่ Rust ทำให้ LSP ดูเป็นธรรมชาติ เพราะเราสามารถประกาศความสามารถเป็น trait ย่อย ๆ แล้วให้แต่ละ type implement เฉพาะสิ่งที่ทำได้จริง

## 4. Interface Segregation Principle

Interface Segregation Principle หรือ ISP คืออย่าบังคับให้ type implement method ที่ตัวเองไม่ได้ใช้

ใน Rust คำว่า interface มักจะมาในรูปของ `trait` ตัวอย่างใน `src/isp/mod.rs` เลยแยก trait เป็น 3 ชิ้น

{% highlight rust %}
trait Worker {
    fn work(&self);
}

trait Sleeper {
    fn sleep(&self);
}

trait Eater {
    fn eat(&self);
}
{% endhighlight %}

`HumanWorker` ทำได้ทั้งทำงาน นอน และกิน

{% highlight rust %}
struct HumanWorker;

impl Worker for HumanWorker {
    fn work(&self) {
        println!("> Humen wark");
    }
}

impl Sleeper for HumanWorker {
    fn sleep(&self) {
        println!("> Humen sleep");
    }
}

impl Eater for HumanWorker {
    fn eat(&self) {
        println!("> Humen eat");
    }
}
{% endhighlight %}

แต่ `RobotWorker` ทำแค่ `Worker` ก็พอ

{% highlight rust %}
struct RobotWorker;

impl Worker for RobotWorker {
    fn work(&self) {
        println!("> Robot wark");
    }
}
{% endhighlight %}

ถ้าเขียนเป็น trait ใหญ่ตัวเดียว เช่น `trait Worker { work, sleep, eat }` จะทำให้ robot ต้องมี method ที่ไม่สมเหตุสมผล พอแยก trait เล็ก ๆ แล้วแต่ละ type เลือก implement ตามความสามารถจริงได้

## 5. Dependency Inversion Principle

Dependency Inversion Principle หรือ DIP คือ high-level module ไม่ควรผูกกับ low-level module โดยตรง แต่ควรผูกผ่าน abstraction

ใน `src/dip/mod.rs` เริ่มจาก `User` และ `UserRepository` trait

{% highlight rust %}
struct User {
    id: i32,
}

trait UserRepository {
    fn get_user(&self, id: i32) -> Result<User, Box<dyn std::error::Error>>;
}
{% endhighlight %}

implementation จริงคือ `DatabaseUserRepository`

{% highlight rust %}
struct DatabaseUserRepository;

impl UserRepository for DatabaseUserRepository {
    fn get_user(&self, id: i32) -> Result<User, Box<dyn std::error::Error>> {
        if id == 1 {
            Ok(User { id: 1 })
        } else {
            Ok(User { id: 0 })
        }
    }
}
{% endhighlight %}

ส่วน `UserService` ไม่ได้รู้จัก database โดยตรง แต่รับ type generic ที่ implement `UserRepository`

{% highlight rust %}
struct UserService<T: UserRepository> {
    repo: T,
}

impl<T: UserRepository> UserService<T> {
    fn register_user(&self, user: User) -> Result<(), Box<dyn std::error::Error>> {
        let u = self.repo.get_user(user.id)?;
        if u.id == 0 {
            println!("> Registered user id: {}", user.id);
            Ok(())
        } else {
            println!("> User already exists");
            Err("User already exists".into())
        }
    }
}
{% endhighlight %}

ตอนใช้งานจึงประกอบ dependency จากข้างนอก

{% highlight rust %}
pub fn example() {
    println!("Dependency Inversion Principle");

    let usr_repo = DatabaseUserRepository;
    let usr_svc = UserService { repo: usr_repo };
    let usr = User { id: 1 };

    let _ = usr_svc.register_user(usr);
}
{% endhighlight %}

ถ้าจะ test `UserService` เราสามารถทำ fake repository ที่ implement `UserRepository` ได้ โดยไม่ต้องแตะ database จริง

{% highlight rust %}
struct InMemoryUserRepository;

impl UserRepository for InMemoryUserRepository {
    fn get_user(&self, id: i32) -> Result<User, Box<dyn std::error::Error>> {
        Ok(User { id })
    }
}
{% endhighlight %}

นี่คือประโยชน์หลักของ DIP ใน Rust คือ service ชั้นบนยึดกับ trait ส่วนรายละเอียดว่าจะอ่านจาก database, memory, file หรือ API เป็นเรื่องของ implementation ข้างล่าง

## สิ่งที่เรียนรู้จาก rssolid

- Rust ใช้ `trait` แทน abstraction/interface ได้ดีมาก
- SRP มองเห็นชัดขึ้นเมื่อ mutation ต้องใช้ `&mut`
- OCP ทำได้ด้วยการเพิ่ม struct ใหม่แล้ว implement trait เดิม
- LSP และ ISP ไปด้วยกันได้ดี ถ้าเราแยก trait ตามความสามารถจริง
- DIP ใน Rust ใช้ได้ทั้ง generic bound แบบ `T: Trait` และ dynamic dispatch แบบ `Box<dyn Trait>` แล้วแต่ use case

## ถ้าจะต่อยอดในโปรเจคจริง

ตัวอย่างใน repo ตั้งใจให้สั้นเพื่ออธิบายหลักการ ถ้าเอาไปใช้กับงานจริง อาจต่อยอดได้ประมาณนี้

- ย้าย trait ไปอยู่ชั้น domain หรือ application
- ให้ implementation ของ repository อยู่ชั้น infrastructure
- เขียน unit test โดยสร้าง fake struct ที่ implement trait
- แยก error type เฉพาะของ domain แทนการใช้ `Box<dyn std::error::Error>` ทุกจุด
- ใช้ generic เมื่ออยากได้ static dispatch และใช้ `Box<dyn Trait>` เมื่ออยากสลับ implementation runtime

## สรุป

`prongbang/rssolid` เป็น repo สั้น ๆ ที่เหมาะกับการอ่านเพื่อทำความเข้าใจว่า S.O.L.I.D ใน Rust หน้าตาเป็นยังไง

หัวใจของตัวอย่างคือใช้ `trait` เป็น abstraction, ใช้ `struct` เป็น implementation, ใช้ composition แทน inheritance และใช้ generic เพื่อกลับทิศ dependency ให้ service ชั้นบนไม่ผูกกับรายละเอียดข้างล่าง

ถ้าเคยเรียน S.O.L.I.D จากภาษา OOP แล้วอยากเห็นเวอร์ชัน Rust repo นี้เป็นจุดเริ่มต้นที่ดี เพราะโค้ดเล็กพอที่จะอ่านจบได้ในไม่กี่นาที แต่มีตัวอย่างครบทั้ง 5 หลักการ
