---
layout: post
title:  "[Golang] เขียน API ด้วย Golang นี่มันจะง่ายไปไหน"
short_description: "ถ้าคนเคยเขียน API ด้วย Java จะพบกับความยุ่งยากมากมาย มาดูว่า go จะง่ายขนาดไหน"
date:   2018-06-10 21:02:01 +0700
categories: golang
tags: [golang]
cover_image: /assets/images/golang/2.png
author: "end try"
---

### เริ่มจากติดตั้ง Library
<br>
ในโพสนี้เราจะใช้ [Echo Framework](https://echo.labstack.com/guide) ในการเขียน API สามารถติดตั้งโดยใช้คำสั่งตามนี้
{% highlight shell %}
go get -u github.com/labstack/echo
{% endhighlight %}

### สร้างไฟล์ `main.go` 
<br>
ไฟล์นี้จะเป็นไฟล์หลักที่เราจะใช้ Run เป็น Server โดยเราจะกำหนด Route ตามนี้
- GET `/api/chat` สำหรับดึงข้อมูล chat ทั้งหมดผ่าน Method `GET`
- POST `/api/chat` สำหรับเพิ่มข้อมูล chat ผ่าน Method `POST`
<br>
มาดูว่าโค้ดจะมีหน้าตาเป็นยังไง
{% highlight go %}
package main

import (
	"net/http"

	"github.com/labstack/echo"
)

func main() {
	e := echo.New()
	e.GET("/api/chat", func(c echo.Context) error {
		return c.JSON(http.StatusOK, Message{Text: "Hello"})
	})
	e.POST("/api/chat", func(c echo.Context) error {
		var msg Message
		if err := c.Bind(&msg); err == nil {
			return c.JSON(http.StatusOK, msg)
		}
		return c.JSON(http.StatusBadRequest, c.Map{"message": "Bad Request"})
	})

	e.Logger.Fatal(e.Start(":1323"))
}

type Message struct {
	Text string `json:"text"`
}
{% endhighlight %}

### อธิบายการทำงานแบบคร่าว ๆ
<br>
- สร้าง `instance` ของ Echo
{% highlight go %}
e := echo.New()
{% endhighlight %}

- สร้าง `struct` ชื่อ `Message` เก็บข้อมูลตามโครงสร้างข้อมูลที่เรากำหนด เพื่อใช้ในการแมพค่า json ที่ส่งมาจาก `client` และใช้ในการส่ง response กลับไป
{% highlight go %}
type Message struct {
	Text string `json:"text"`
}
{% endhighlight %}

- สร้าง Route `/api/chat` สำหรับดึงข้อมูล chat ทั้งหมดผ่าน Method `GET` ซึ่งในตัวอย่างจะทำการฟิกข้อมูลที่จะ Response ไว้ ซึ่งถ้าจะเอาค่าจาก Database มาก็สามารถทำได้แค่เขียนโค้ดเพิ่มนิดหน่อย
{% highlight go %}
e.GET("/api/chat", func(c echo.Context) error {
	return c.JSON(http.StatusOK, Message{Text: "Hello"})
})
{% endhighlight %}

- สร้าง Route `/api/chat` สำหรับเพิ่มข้อมูล chat ผ่าน Method `POST` ซึ่งในตัวอย่างจะทำการรับข้อมูลแบบ json จากนั้นก็จะเอาข้อมูลที่รับค่ามา Response กลับไป และถ้าข้อมูลที่ส่งมาไม่ถูกต้องก็จะส่ง Response ไปบอกว่า "Bad Request"
{% highlight go %}
e.POST("/api/chat", func(c echo.Context) error {
	var msg Message
	if err := c.Bind(&msg); err == nil {
		return c.JSON(http.StatusOK, msg)
	}
	return c.JSON(http.StatusBadRequest, c.Map{"message": "Bad Request"})
})
{% endhighlight %}

- Start Server โดยใช้ port `1323` และ show logs
{% highlight go %}
e.Logger.Fatal(e.Start(":1323"))
{% endhighlight %}

### วิธีรันตามนี้เลย
{% highlight shell %}
go run main.go
{% endhighlight %}

ถ้ารันผ่านจะขึ้นหน้าตาประมาณนี้
{% highlight shell %}
   ____    __
  / __/___/ /  ___
 / _// __/ _ \/ _ \
/___/\__/_//_/\___/ v3.3.dev
High performance, minimalist Go web framework
https://echo.labstack.com
____________________________________O/_______
                                    O\
⇨ http server started on [::]:1323

{% endhighlight %}

### ลองใช้งาน API ตาม Route ที่เราเขียนโดยใช้ `Postman`
<br>
- ดึงข้อมูล `chat` จาก `API` ผ่าน Method `GET`
{% highlight shell %}
http://localhost:1323/api/chat
{% endhighlight %}

และเราก็จะได้ Response มาประมาณนี้
{% highlight json %}
{
    "text": "Hello"
}
{% endhighlight %}

- ส่งข้อมูล `chat` ไปให้ `API` ผ่าน Method `POST`
{% highlight shell %}
http://localhost:1323/api/chat
{% endhighlight %}

โดยเราจะส่งข้อมูลแนบไปกับ Body ด้วยแบบนี้
{% highlight json %}
{
    "text": "Create Message"
}
{% endhighlight %}

และเราก็จะได้ Response มาประมาณนี้ ถ้าเราส่งค่าไปถูกต้อง
{% highlight json %}
{
    "text": "Create Message"
}
{% endhighlight %}

ถ้าเราส่งค่าไม่ถูกต้องเราก็จะได้ Response มาประมาณนี้ 
{% highlight json %}
{
    "message": "Bad Request"
}
{% endhighlight %}

นี่เป็นแค่ส่วนหนึ่งของการเขียน API เท่านั้น เพื่อให้คนที่หลงเข้ามาอ่านได้เห็นว่าการเขียน API ด้วยภาษา Go มันง่ายมาก ๆ เท่านั้นเอง