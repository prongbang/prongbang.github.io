---
layout: post
title:  "[Docker] อยากจัดการ Docker แบบ GUI ใช่มั้ย ใช้ Portainer สิรอไร"
short_description: "หลาย ๆ คนอาจจะเคยเล่น Docker มาสักพักแล้วรู้สึกว่าตัวเองจำคำสั่ง Docker ไม่ค่อยได้ แต่ว่า Portainer ช่วยเราได้"
date:   2018-12-15 19:14:19 +0700
categories: [docker, portainer]
tags: [docker, portainer]
cover_image: /assets/images/docker/1.png
author: "end try"
---

### เริ่มกันเลยดีกว่า
<br>

ถ้าใครอยากเล่นตัว demo ก่อนที่จะ Install ที่เครื่องของตัวเองให้เข้าไปที่ [http://demo.portainer.io](http://demo.portainer.io) โดยให้ใส่ username และ password ตามนี้

{% highlight shell %}
username: admin
password: tryportainer
{% endhighlight %}

### ในที่นี้เราจะ Install ผ่าน docker-compose นะโดยให้สร้างโฟลเดอร์และไฟล์ตามนี้ภายใต้โฟลเดอร์ portainer

{% highlight shell %}
portainer
├── docker-compose.yml
└── volumes
    └── data
{% endhighlight %}

- แล้วเขียนโค้ด config docker ใน docker-compose.yml ตามนนี้

{% highlight yml %}
version: '3.5'
services: 
  portainer:
    image: portainer/portainer
    container_name: portainer
    ports: 
      - "9000:9000"
    volumes: 
      - "/var/run/docker.sock:/var/run/docker.sock"
      - "./volumes/data:/data"
    restart: always
{% endhighlight %}

จากนั้นสั่ง Start เลยด้วยคำสั่งนี้

{% highlight shell %}
docker-compose up -d
{% endhighlight %}

จากนั้นให้เข้าไปที่ [localhost:9000](http://localhost:9000) เพียงเท่านี้ก็เรียบร้อย สามารถดาวน์โหลดโปรเจคได้ที่นี่ [portainer](https://github.com/prongbang/portainer)
<br>
<br>