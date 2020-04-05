---
layout: post
title:  "[Golang] มาลองใช้ Wiremock ที่เขียนด้วย Golang สำหรับทำ Mock API โดยเขียนแค่ YAML และ JSON แค่นั้นเอง"
short_description: "เคยเจอกับตัวกันบ้างมั้ยว่ากว่า API จะทำเสร็จก็กลาง Sprint แล้ว ฉะนั้นเรามาใช้ Wiremock เพื่อให้เราสามารถ Dev รอ API ได้กันเถอะ ๆ"
date:   2020-04-05 20:23:00 +0700
categories: [golang]
tags: [golang]
cover_image: /assets/images/golang/10.png
author: "end try"
---

### Wiremock มีให้ใช้งาน 2 แบบ คือ Docker และ Golang library

<br>
ก่อนที่จะมาดูว่า Docker และ Golang library งานกันยังไงมาดูการ setup โปรเจคกันก่อนว่าต้องทำอะไรบ้าง 
<br>
<br>

#### สมมติว่าเราต้องการ API Spec ประมาณนี้

- Login

Request:

{% highlight json %}
POST http://localhost:8000/api/v1/login
{% endhighlight %}

Response: 

{% highlight json %}
Status Code: 200
{% endhighlight %}

{% highlight json %}
{
    "message": "success"
}
{% endhighlight %}

- Create User

Request:

{% highlight json %}
POST http://localhost:8000/api/v1/user
{% endhighlight %}

Response:

{% highlight json %}
Status Code: 201
{% endhighlight %}

{% highlight json %}
{
    "message": "success"
}
{% endhighlight %}

- Get User By Id

Request:

{% highlight json %}
GET http://localhost:8000/api/v1/user/{id:[0-9]+}
{% endhighlight %}

Response:

{% highlight json %}
Status Code: 200
{% endhighlight %}

{% highlight json %}
[
  {
    "id": 1,
    "name": "Leanne Graham",
    "username": "Bret",
    "email": "Sincere@april.biz",
    "address": {
      "street": "Kulas Light",
      "suite": "Apt. 556",
      "city": "Gwenborough",
      "zipcode": "92998-3874",
      "geo": {
        "lat": "-37.3159",
        "lng": "81.1496"
      }
    },
    "phone": "1-770-736-8031 x56442",
    "website": "hildegard.org",
    "company": {
      "name": "Romaguera-Crona",
      "catchPhrase": "Multi-layered client-server neural-net",
      "bs": "harness real-time e-markets"
    }
  }
]
{% endhighlight %}

### เมื่อเรารู้ว่าอยากได้แบบไหนแล้วแล้วมาเริ่ม setup โปรเจคกัน

<br>
โดยตัวโปรเจคที่ Wiremock ต้องการโครงสร้างแบบนี้ แต่ส่วนที่ต้องใช้ชื่อนั้นเท่านั้นคือ `mock`, `response`, `route.yml` ส่วนที่สามารถตั้งเป็นอะไรก็ได้แต่ต้องเป็นภาษาอังกฤษเท่านั้นคือ `user`, `login` ในที่นี้จะตั้งชื่อตาม domain แยกเป็นของใครของมัน
<br>

{% highlight shell %}
project
└── mock
    ├── login
    │   └── route.yml
    └── user
        ├── response
        │   └── user.json
        └── route.yml
{% endhighlight %}

ตัว Wiremock นั้นใช้ gorilla/mux ในการช่วยทำ [Matching Routes](https://github.com/gorilla/mux#matching-routes) เพราะฉะนั้นถ้ามีการทำใช้ URL ท่าแปลก ๆ ให้เข้าไปดูตัวอย่างการใช้งานได้
<br>
<br>

### มาเริ่มเขียน Wiremock กันดีกว่า

<br>

#### เริ่มจาก Login โดยให้สร้าง folder และไฟล์ตามนี้

{% highlight shell %}
project
└── mock
    └── login
       └── route.yml
{% endhighlight %}

เมื่อวางโครงสร้างเสร็จแล้วก็มาเขียนไฟล์ `route.yml` ซึ่งจะอ้างอิงตาม API Spec `Login` ข้างบนก็จะได้ประมาณนี้

{% highlight yaml %}
routes:
  login:
    request:
      method: "POST"
      url: "/api/v1/login"
    response:
      status: 200
      body: >
        {"message": "success"}
{% endhighlight %}
<br>

#### ต่อมาก็ User โดยให้สร้าง folder และไฟล์ตามนี้

{% highlight shell %}
project
└── mock
    └── user
        ├── response
        │   └── user.json
        └── route.yml
{% endhighlight %}

เมื่อวางโครงสร้างเสร็จแล้วก็มาเขียนไฟล์ `route.yml` ซึ่งจะอ้างอิงตาม API Spec `User` ข้างบนก็จะได้ประมาณนี้

{% highlight yaml %}
routes:
  get_user:
    request:
      method: "GET"
      url: "/api/v1/user/{id:[0-9]+}"
    response:
      status: 200
      body_file: user.json

  create_user:
    request:
      method: "POST"
      url: "/api/v1/user"
    response:
      status: 201
      body: >
        {"message": "success"}
{% endhighlight %}
<br>

#### อธิบายเพิ่มเติม

- `url: "/api/v1/user/{id:[0-9]+}"` นี้เป็นแบบนี้ก็เพราะว่าต้องการให้ Wiremock รับค่าตัวเลขใด ๆ ได้
- `body_file: user.json"` เป็นการบอกให้ Wiremock รู้ว่าให้ใช้ข้อมูลในไฟล์ `user.json` ที่อยู่ใน `user/response/user.json`

### ต่อไปก็วิธีรัน Wiremock ซึ่งมีอยู่ 2 วิธีคือ

- ติดตั้ง golang library โดยใช้คำสั่งตามนี้

{% highlight shell %}
$ go get -u github.com/prongbang/wiremock
{% endhighlight %}

จากนั้นเข้าไปใน project แล้วใช้คำสั่ง

{% highlight shell %}
$ wiremock
{% endhighlight %}

ถ้าเราเห็นประมาณนี้แสดงว่าเรารันผ่าน

{% highlight shell %}
  _      ___                        __  
 | | /| / (_)______ __ _  ___  ____/ /__
 | |/ |/ / / __/ -_)  ' \/ _ \/ __/  '_/
 |__/|__/_/_/  \__/_/_/_/\___/\__/_/\_\


 -> wiremock server started on :8000
{% endhighlight %}

- ใช้กับ Docker Compose โดยสร้างไฟล์ `docker-compose.yml` ใน project ประมาณนี้

{% highlight yaml %}
project
├── docker-compose.yml
└── mock
    ├── login
    │   └── route.yml
    └── user
        ├── response
        │   └── user.json
        └── route.yml
{% endhighlight %}

และเขียน config ใน ไฟล์ `docker-compose.yml` ประมาณนี้

{% highlight yaml %}
version: '3.7'
services:
  app_wiremock:
    image: prongbang/wiremock
    ports:
      - "8000:8000"
    volumes:
      - "./mock:/mock"
{% endhighlight %}

ลองรัน Docker Compose โดยใช้คำสั่งนี้

{% highlight shell %}
$ docker-compose up
{% endhighlight %}

ถ้าเราเห็นประมาณนี้แสดงว่าเรารันผ่าน

{% highlight shell %}
app_wiremock_1  | 
app_wiremock_1  |   _      ___                        __  
app_wiremock_1  |  | | /| / (_)______ __ _  ___  ____/ /__
app_wiremock_1  |  | |/ |/ / / __/ -_)  ' \/ _ \/ __/  '_/
app_wiremock_1  |  |__/|__/_/_/  \__/_/_/_/\___/\__/_/\_\
app_wiremock_1  | 
app_wiremock_1  | 
app_wiremock_1  |  -> wiremock server started on :8000
app_wiremock_1  | 
{% endhighlight %}

### ทดสอบใช้งานด้วย cURL หรือ Postman หรืออะไรก็ได้ที่ถนัด ในที่จะใช้ cURL

- ลองยิง Login ตามนี้

{% highlight shell %}
$ curl -d '{"username": "test", "password": "pass"}' http://localhost:8000/api/v1/login
{% endhighlight %}

และก็ได้ Response ประมาณนี้

{% highlight json %}
{"message": "success"}
{% endhighlight %}

- ลองยิง Create User ตามนี้

{% highlight shell %}
$ curl -d '{"username": "hello", "password": "world"}' http://localhost:8000/api/v1/user
{% endhighlight %}

และก็ได้ Response ประมาณนี้

{% highlight json %}
{"message": "success"}
{% endhighlight %}

- ลองยิง Get User ตาม Id ที่ส่งไปกับ URL ตามนี้

{% highlight shell %}
$ curl http://localhost:8000/api/v1/user/1
{% endhighlight %}

และก็ได้ Response ประมาณนี้

{% highlight json %}
[
  {
    "id": 1,
    "name": "Leanne Graham",
    "username": "Bret",
    "email": "Sincere@april.biz",
    "address": {
      "street": "Kulas Light",
      "suite": "Apt. 556",
      "city": "Gwenborough",
      "zipcode": "92998-3874",
      "geo": {
        "lat": "-37.3159",
        "lng": "81.1496"
      }
    },
    "phone": "1-770-736-8031 x56442",
    "website": "hildegard.org",
    "company": {
      "name": "Romaguera-Crona",
      "catchPhrase": "Multi-layered client-server neural-net",
      "bs": "harness real-time e-markets"
    }
  }
]
{% endhighlight %}

และวิธีใช้งาน Wiremock แบบคร่าว ๆ ก็ประมาณนี้ สามารถเข้าไปดู Source Code ได้ที่นี่ [wiremock-example](https://github.com/prongbang/wiremock-example) ถ้าตกหล่นอะไรขออภัยณที่นั่นด้วย
<br>
<br>