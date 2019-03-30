---
layout: post
title:  "[Golang] มาดูว่าเขียน API ด้วย Golang ที่ Deploy บน Docker ว่าจะต้องใช้ทรัพยากรเครื่องไปเท่าไร เมื่อเทียบกับ Ktor ที่เขียนด้วย Kotlin"
short_description: "เพื่อเป็นทางเลือกให้กับใครหลาย ๆ คนตัดสินใจได้ง่ายขึ้น ว่าถ้างบมีน้อยควรเก็บอะไรไว้เป็นตัวเลือกบ้าง"
date:   2019-03-30_ 20:53:00 +0700
categories: golang
tags: [golang, kotlin]
cover_image: /assets/images/golang/8.png
author: "end try"
---

### เริ่มกันเลยดีกว่า

<br>

เริ่มจากไป clone โปรเจคตามลิ้งนี้มาก่อนเลย -> [https://github.com/prongbang/govsktor](https://github.com/prongbang/govsktor) แล้วนำโปรเจคไปวางไว้ที่ `$GOPATH/src/github.com/prongbang/govsktor` จากนั้นให้ทำการรันตัว `golang-api` โดยใช้คำสัง

{% highlight bash %}
$ docker-compose up -d --build
{% endhighlight %}

จากนั้นก็รัน `ktor-api` โดยใช้คำสัง

{% highlight bash %}
$ cd example-ktor
$ docker-compose up -d --build
{% endhighlight %}

แล้วลองเข้าไปที่เปิดดูใน [portainer](https://prongbang.github.io/docker/portainer/2018/12/15/install-portainer-on-docker.html) โดยเราจะเข้าไปดู API ของ `Ktor` ก่อน โดยเข้าไปที่ `"Containers > ktor-api > Stats"` เราก็จะเห็นประมาณภาพนี้

<br>

<img src="/assets/images/golang/8-1.png"/>

<br>

จากภาพได้มีการทดลองเข้าไปที่ [http://localhost:8000](http://localhost:8000) และพอมาดูที่ `portainer` ก็จะเห็นว่ามีการใช้ Memory และ Cache ไปประมาณ 55 MB มีการใช้ CPU ไปประมาณ 20% และ Network ประมาณ 5 kB

<br>

ทีนี้เรามาดูที่ API ของ `Golang` กันต่อ โดยเข้าไปที่ `"Containers > golang-api > Stats"` เราก็จะเห็นประมาณภาพนี้

<br>

<img src="/assets/images/golang/8-2.png"/>

<br>

จากภาพได้มีการทดลองเข้าไปที่ [http://localhost:5000](http://localhost:5000) และพอมาดูที่ `portainer` ก็จะเห็นว่ามีการใช้ Cache ไปประมาณ 5 MB ส่วน Memory อยู่เท่าเดิม(ดูด้วยตาเปล่า) มีการใช้ CPU ไปประมาณ 0.0% และ Network ประมาณ 4 kB ซึ่งในการทดสอบครั้งนี้ทดสอบบนเครื่อง MacBook Pro 15, CPU Intel Core i7, RAM 16GB อาจมีความแตกต่างกันมากกว่านี้ขึ้นอยู่กับเครื่องด้วย

<br>

สรุป สำหรับใครที่ต้องการ API ที่กินทรัพยากรเครื่องน้อย ๆ ตัว Golang ก็เป็นอีกทางเลือกหนึ่งที่น่าสนใจ และถึงแม้ว่าตัว Ktor จะดูเหมือนกินทรัพยากรเครื่องไปเยอะกว่า Golang แต่ถ้าจะเทียบกับตัว framework ในตระกูลที่เขียนด้วย Kotlin หรือ Java ตัวอื่น ๆ ถือว่าเจ้า Ktor กินทรัพยากรน้อยกว่าเยอะเลย และสำหรับใครที่สนใจตัว Ktor สามารถมาศึกษาได้ที่ [https://ktor.io/](https://ktor.io/) สิ่งที่น่าสนใจของตัว Ktor ก็ตรงนี้ละเพราะเจ้าตัวนี้มันมีของมาให้เยอะพอตัวดูจากภาพได้ แต่ว่าต้องลง plugin ตัวนี้ก่อนนะ [https://ktor.io/quickstart/quickstart/intellij-idea.html](https://ktor.io/quickstart/quickstart/intellij-idea.html)

<br>

<img src="/assets/images/golang/8-3.png"/>

<br>

หากผิดพลาดประการใดขออภัย ณ ที่นั้นด้วย

<br>
<br>
