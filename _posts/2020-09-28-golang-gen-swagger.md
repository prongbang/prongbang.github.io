---
layout: post
title:  "[Golang] ใช้ Tools สร้าง Swagger โดยไม่ต้องเขียน Config ของ Swagger"
short_description: "คำเตือน บล็อคนี้ไม่เหมาะกับคนขยันที่เขียน Config ของ Swagger เอง เหมาะกับคนขี้เขียจ"
date:   2020-09-28 16:56:00 +0700
categories: [golang]
tags: [golang]
cover_image: /assets/images/golang/11.png
author: "Devไปวันๆ"
---

### Download swag

{% highlight bash %}
$ go get -u github.com/swaggo/swag/cmd/swag
{% endhighlight %}

### Download echo-swagger เพื่อใช้กับ Echo Framework

{% highlight bash %}
$ go get github.com/swaggo/echo-swagger
{% endhighlight %}

### สั่งรัน swag เพื่อสร้าง swagger.yml และ swagger.json

สั่งรันที่ `root` ของโปรเจค หรือตำแหน่งเดียวกันกับไฟล์ `main.go` เมื่อสั่งรันแล้ว config ต่าง ๆ จะไปอยู่ที่ `./docs` 

{% highlight bash %}
$ swag init
{% endhighlight %}

### กำหนดค่า swagger

{% highlight golang %}
package main

import (
    "github.com/labstack/echo/v4"
	_ "github.com/prongbang/goclean/docs"   // เรียกใช้ package ที่ได้จากการรัน `swag init`
	echoSwagger "github.com/swaggo/echo-swagger"
)

// @title GoClean API
// @version 1.0
// @description This is a swagger for GoClean API
// @termsOfService http://swagger.io/terms/
// @contact.name API Support
// @contact.url https://prongbang.github.io
// @license.name MIT License
// @license.url https://github.com/prongbang/goclean/blob/master/LICENSE
// @host localhost:1323
// @BasePath /
// @securityDefinitions.apikey APIKeyAuth
// @in header
// @name X-API-KEY
func main() {
	e := echo.New()

	// Routes
	e.GET("/swagger/*", echoSwagger.WrapHandler)

	// Listener
	e.Logger.Fatal(e.Start(":1323"))
}
{% endhighlight %}

### เมื่อมีการแก้ไข config ต่าง ๆ ให้สั่งรัน swag ใหม่ทุกครั้ง

{% highlight bash %}
$ swag init
{% endhighlight %}

### การกำหนด Header, Parameter, Response ไม่ขออธิบายนะครับลองรันโปรเจคแล้วสั่งเกตุดูเองน่าจะเข้าใช้ได้ง่ายกว่า

### กำหนด Router `/api/v1/promotion [post]`

{% highlight golang %}
// @Tags promotions
// @Summary Create promotion
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer Token"
// @Param promotion body model.Promotion true "Promotion"
// @Success 201 {object} model.Promotion
// @Failure 400 {object} core.Error
// @Security APIKeyAuth
// @Router /api/v1/promotion [post]
func (h *promotionHandler) Add(c echo.Context) error {
    // code
}
{% endhighlight %}

### กำหนด Router `/api/v1/promotion [get]`

{% highlight golang %}
// @Tags promotions
// @Summary List promotion
// @Accept json
// @Produce json
// @Success 200 {object} model.Promotion
// @Security APIKeyAuth
// @Router /api/v1/promotion [get]
func (h *promotionHandler) GetAll(c echo.Context) error {
    // code
}
{% endhighlight %}

### อีกรอบเมื่อมีการแก้ไข config ต่าง ๆ ให้สั่งรัน swag ใหม่ทุกครั้ง

{% highlight bash %}
$ swag init
{% endhighlight %}

ถ้ารันแล้วได้ประมาณนี้ ยินดีด้วยคุณมาถูกทางแล้ว
<br>

{% highlight bash %}
2020/09/28 17:56:20 Generate swagger docs....
2020/09/28 17:56:20 Generate general API Info, search dir:./
2020/09/28 17:56:20 Generating model.Promotion
2020/09/28 17:56:20 Generating core.Error
2020/09/28 17:56:20 create docs.go at docs/docs.go
2020/09/28 17:56:20 create swagger.json at docs/swagger.json
2020/09/28 17:56:20 create swagger.yaml at docs/swagger.yaml
{% endhighlight %}

### ลองสั่งรันโปรเจค

{% highlight bash %}
$ go run main.go
{% endhighlight %}

เมื่อรันแล้วให้เข้าไปที่ลิ้งด้านล่างนี้ได้เลย [http://localhost:1323/swagger/index.html](http://localhost:1323/swagger/index.html)
 <br>
เพียงเท่านี้เราก็จะได้ Swagger มาให้ Mobile, Web, QA และคนอื่น ๆ มาใช้งานได้แบบง่าย ๆ ได้เลย

<br>

### Source Code

[Click Me](https://botemoda.com/2VcR)

<br>

ฝากติดตามเพจdevไปวันๆด้วยนะครับ หากผิดพลาดอะไร ขออภัย ณ ที่นั้นด้วยนะครับ

<br>