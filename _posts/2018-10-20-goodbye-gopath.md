---
layout: post
title:  "[Golang] บอกลาการสร้างโปรเจคภายใต้ GOPATH/src ด้วย go module ใน Version 1.11"
short_description: "มาดูว่า go module ทำท่าไหนกัน"
date:   2018-10-20 15:40:00 +0700
categories: golang
tags: [golang]
cover_image: /assets/images/golang/4.png
author: "end try"
---

### ก่อนอื่นต้องลง Go v1.11 ก่อน
<br>
ให้เข้าไปโหลดได้ที่ [https://golang.org](https://golang.org/) จากนั้นกำหนด `GOPATH` ปกติ

<br>

### ลองสร้างโฟลเดอร์ไว้ที่ไหนก็ได้ที่ไม่ใช่ภายใต้ `GOPATH/src` 

{% highlight shell %}
$mkdir ~/Development/Web/himod && ~/Development/Web/himod
{% endhighlight %}

### สั่ง `unset GOPATH` ด้วยคำสั่งนี้ เพราะเราจะใช้ `go module` แทน

{% highlight shell %}
$unset GOPATH
{% endhighlight %}

### ทำให้โปรเจคเราเป็น `go module` ด้วยคำสั่งนี้

{% highlight shell %}
# $go mod init <poject-name>
$go mod init himod
{% endhighlight %}

*`himod` คือ ชื่อโปรเจคของเรา

ถ้าผ่านจะขึ้นประมาณนี้

{% highlight shell %}
➜  himod go mod init himod
go: creating new go.mod: module himod
➜  himod 
{% endhighlight %}

และเราก็จะได้ไฟล์ชื่อ `go.mod` ซึ่งในไฟล์จะมีข้อมูลประมาณนี้

{% highlight shell %}
module himod
{% endhighlight %}

### สร้างไฟล์หลักของโปรเจคในที่นี้จะตั้งชื่อ `main.go`
<br>
โดยเขียนโค้ดประมาณนี้
{% highlight go %}
package main

import (
	"fmt"
	"net/http"
	"os"
	"time"

	_ "github.com/prongbang/goenv"
)

func greet(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello World! %s", time.Now())
}

func main() {
	http.HandleFunc("/", greet)
	http.ListenAndServe(fmt.Sprintf(":%s", os.Getenv("PORT")), nil)
}
{% endhighlight %}

ซึ่งในโปรเจคนี้เราจะมีการดึงค่าจากไฟล์ `.env` โดยใช้ [goenv](https://github.com/prongbang/goenv)

{% highlight shell %}
$go get github.com/prongbang/goenv
{% endhighlight %}

เมื่อโหลดมาแล้วเราจะเห็นประมาณนี้

{% highlight shell %}
➜  himod go get github.com/prongbang/goenv
go: finding github.com/prongbang/goenv v0.0.1
go: downloading github.com/prongbang/goenv v0.0.1
➜  himod
{% endhighlight %}

และมันจะทำการเพิ่ม `goenv` มาไว้ที่ไฟล์ `go.mod` ของเราประมาณนี้

{% highlight shell %}
require github.com/prongbang/goenv v0.0.1
{% endhighlight %}

จากนั้นให้เราทำการสร้างไฟล์ `.env` โดยในที่นี้เราจะเก็บค่า PORT ของเว็บไว้ประมาณนี้

{% highlight shell %}
PORT=8080
{% endhighlight %}

### Build project โดยใช้คำสั่งนี้

{% highlight shell %}
$go build
{% endhighlight %}

### Run project

- Run จาก ไฟล์ที่เรา build แล้ว

{% highlight shell %}
$./himod
{% endhighlight %}

- Run จากไฟล์ `main.go`
{% highlight shell %}
$go run main.go
{% endhighlight %}

จากนั้นลองเข้าไปดูที่ [http://127.0.0.1:8080/](http://127.0.0.1:8080/) ก็เป็นอันเสร็จเรียบร้อย
<br>
<br>
เพียงเท่านี้เราก็สามารถสร้างโปรเจคไว้ที่ไหนก็ได้แล้วละ :)

<br>
<br>
สามารถโหลดโปรเจคตัวอย่างได้ที่ [Source Code](https://raboninco.com/XBa9)