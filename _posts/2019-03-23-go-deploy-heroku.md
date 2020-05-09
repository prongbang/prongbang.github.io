---
layout: post
title:  "[Golang] มา Deploy Golang บน Heroku กันเถอะ"
short_description: "ของฟรีก็มีในโลกนะ (ที่จริงก็มีมานานแล้ว แต่เพิ่งเอามาเขียน T^T)"
date:   2019-03-23 19:27:00 +0700
categories: [golang, heroku]
tags: [golang, heroku]
cover_image: /assets/images/golang/7.png
author: "end try"
---

### เริ่มกันเลยดีกว่า

<br>

ก่อนอื่นต้องไปสมัครสมาชิกก่อนนะตามลิ้งนี้ [https://signup.heroku.com](https://signup.heroku.com/) เมื่อสมัครแล้ว login เข้าไปก็จะเจอหน้าตาสวย ๆ ประมาณนี้

<br>

<img src="/assets/images/golang/7-1.png"/>

<br>

จากนั้นเลือก New -> Create new app แล้วใส่ App name และเลือก region จากนั้นก็กด Create ตามภาพ

<br>

<img src="/assets/images/golang/7-2.png"/>

<br>

เมื่อ Create เสร็จแล้วก็จะเจอกับหน้าตาประมาณนี้

<br>

<img src="/assets/images/golang/7-3.png"/>

<br>

ในตัวอย่างนี้เราจะเลือก Deployment method เป็น Heroku Git แล้วทำการ Install Heroku CLI โดยคลิกที่ Heroku CLI ตามที่ในเค้าบอกเลย หรือจะคลิกที่นี้ก็ได้ [https://devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli) จากนั้นก็เลือก Download แล้วก็ Install เมื่อลงเสร็จ ให้ทำการ login โดยมันจะให้ใส่ email และ password ตามนี้

{% highlight bash %}
$ heroku login
{% endhighlight %}

ต่อไปก็มาวางโปรเจ็คของเรากันประมาณนี้

{% highlight bash %}
gest-to
├── Procfile
├── handler.go
└── main.go
{% endhighlight %}

หรือมาดูตัวอย่างของ heroku ได้ที่ [https://github.com/heroku/go-getting-started](https://github.com/heroku/go-getting-started)

ต่อไปก็มาเขียน code กัน โดยเริ่มจาก ทำให้โปรเจคของเราเป็น gomodule ก่อน

{% highlight bash %}
$ export GO111MODULE=on
$ go mod init gest-to
{% endhighlight %}

เราก็จะได้ไฟล์เพิ่มจึ้นมา 1 ไฟล์ คือ `go.mod` ต่อไปก็มาลง `gin web framework`

{% highlight bash %}
$ go get -u github.com/gin-gonic/gin
{% endhighlight %}

เมื่อลงเสร็จแล้วมันจะมีไฟล์เพิ่มขึ้นมาอีก 1 ไฟล์คือ `go.sum` จากนั้นให้ทำการใช้คำสั่งตามนี้

{% highlight bash %}
$ go mod vendor
{% endhighlight %}

แล้วจะมีโฟลเดอร์เพิ่มขึ้นมาอีก 1 โฟลเดอร์คือ `vendor` ซึ่งมันจะเก็บ package ต่าง ๆ ที่แอพเราใช้ โดยมีภาพรวมโปรเจคคร่าว ๆ ประมาณนี้ 

{% highlight bash %}
gest-to
├── Makefile
├── Procfile
├── go.mod
├── go.sum
├── handler.go
├── main.go
└── vendor
    ├── github.com
    │   ├── gin-contrib
    │   │   └── sse
    │   │       ├── sse-decoder.go
    │   │       ├── sse-encoder.go
    │   ├── gin-gonic
    │   │   └── ect.
	│   └── ect.
	└── ect.
{% endhighlight %}

เริ่มเขียน code กันได้สักทีนะ เริ่มจาก

- `handler.go` ส่วนนี้ก็ไม่มีอะไรมาก เป็นแค่ส่วนจัดการกับ request ที่ client ส่งมาแล้วจะทำอะไรต่อ ก็ขึ้นอยู่กับเรา

{% highlight golang %}
package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// MyHandler is the interface
type MyHandler interface {
	HelloWorld(c *gin.Context)
}

type myHandler struct {
}

// NewMyHandler is a function new instance
func NewMyHandler() MyHandler {
	return &myHandler{}
}

func (h *myHandler) HelloWorld(c *gin.Context) {
	c.JSON(http.StatusOK, map[string]interface{}{
		"message": fmt.Sprintf("Hello World! %s", time.Now()),
	})
}
{% endhighlight %}

- `main.go` ส่วนไฟล์นี้ก็ตามชื่อเลย

{% highlight golang %} 
package main

import (
	"fmt"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	router := gin.New()
	router.Use(gin.Logger())

	handler := NewMyHandler()
	router.GET("/", handler.HelloWorld)

	router.Run(fmt.Sprintf(":%s", port))
}
{% endhighlight %}

ถ้าอยาก run แบบ local ก็แค่ใช้คำสั่งตามนี้

{% highlight bash %}
$ go run main.go
{% endhighlight %}

- `Procfile` เป็นตัวบอกให้ heroku รู้ว่าจะต้อง run คำสั่งอะไรเมื่อเราทำการ deploy ขึ้นไปแล้ว

{% highlight bash %}
web: bin/gest-to
{% endhighlight %}

ต่อไปเป็นส่วนของ git โดยใช้คำสั่งตามนี้ เพื่อทำการ remote ไปหา git ของ heroku

{% highlight bash %}
$ cd gest-to/
$ git init
$ heroku git:remote -a gest-to
{% endhighlight %}

และแล้วก็มาถึงขั้นตอนการ Deploy สักที ซึ่งวิธีที่ heroku ใช้คือ git โดยใช้คำสั่งพื้นฐานตามนี้

{% highlight bash %}
$ git add .
$ git commit -am "make it better"
$ git push heroku master
{% endhighlight %}

ในส่วนของการ deploy เราจะเจอกับหน้าตาประมาณนี้

{% highlight bash %}
➜  gest-to git:(master) git push heroku master
Counting objects: 567, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (549/549), done.
Writing objects: 100% (567/567), 1.46 MiB | 344.00 KiB/s, done.
Total 567 (delta 143), reused 0 (delta 0)
remote: Compressing source files... done.
remote: Building source:
remote: 
remote: -----> Go app detected
remote: -----> Fetching jq... done
remote:        
remote: -----> Detected go modules - go.mod
remote:        
remote:  !!    The go.mod file for this project does not specify a Go version
remote:  !!    
remote:  !!    Defaulting to go1.12.1
remote:  !!    
remote:  !!    For more details see: https://devcenter.heroku.com/articles/go-apps-with-modules#build-configuration
remote:  !!    
remote: -----> Installing go1.12.1
remote: -----> Fetching go1.12.1.linux-amd64.tar.gz... done
remote:  !!    Installing package '.' (default)
remote:  !!    
remote:  !!    To install a different package spec add a comment in the following form to your `go.mod` file:
remote:  !!    // +heroku install ./cmd/...
remote:  !!    
remote: -----> Running: go install -v -tags heroku -mod=vendor . 
remote: github.com/gin-gonic/gin/json
remote: github.com/gin-contrib/sse
{% endhighlight %}

และถ้าเรา Deploy ผ่านเราจะเจอหน้าตาประมาณนี้

{% highlight bash %}
remote: gest-to
remote: 
remote: Compiled the following binaries:
remote:        ./bin/gest-to
remote: 
remote: -----> Discovering process types
remote:        Procfile declares types -> web
remote: 
remote: -----> Compressing...
remote:        Done: 8.9M
remote: -----> Launching...
remote:        Released v3
remote:        https://gest-to.herokuapp.com/ deployed to Heroku
{% endhighlight %}

และลองเข้าไปที่ [https://gest-to.herokuapp.com/](https://gest-to.herokuapp.com/) เราก็จะเห็นว่า api ของเราสามารถทำงานได้ตามที่เราต้องการเรียบร้อยแล้ว และนี่คือ [Source Code](http://raboninco.com/XBqc)
 ของโปรเจ็คนี้
<br>
<br>













