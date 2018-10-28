---
layout: post
title:  "[Firebase] รู้ยังว่า Firebase Realtime Database สามารถทำให้เป็น REST API ได้โดยไม่ต้องเขียน Code"
short_description: "มาดูว่าต้องทำยังไงกัน ๆ"
date:   2018-10-28 15:00:00 +0700
categories: firebase
tags: [firebase]
cover_image: /assets/images/firebase/1.png
author: "end try"
---

### Create an account
<br>
เข้าไปที่ [Firebase console](https://console.firebase.google.com/u/0/?hl=th)
<br><br>

### Create project
<br>
ให้เราใส่ชื่อโปรเจคของเรา จากก็เลือกยอมรับข้อกำหนดของการใช้งานของ firebase แล้วก็คลิกปุ่มสร้างโปรเจคไป

<br>
### Setup Realtime Database
<br>
ให้เราไปสร้าง Database ตาม step และเมื่อสร้างเสร็จแล้ว เราจะมากทำการเก็บข้อมูลของ Users โดยมีโครงสร้างประมาณนี้

{% highlight json %}
{
  "users": {
    "prongbang": {
      "first_name": "โปร่ง",
      "last_name": "บาง"
    },
    "endtry": {
        "first_name": "End",
        "last_name": "Try"
    }
  }
}
{% endhighlight %}

ซึ่งเราจะเก็บข้อมูลของ user ของแต่ละคนไว้ภายใต้ `users` และเมื่อเราเพิ่มข้อมูลลง Realtime Database แล้วเราก็จะได้หน้าประมาณนี้

<img src="/assets/images/firebase/2.png"/>

### Config Role
<br>
ในตัวอย่างนี้เราจะใช้โหมดพัฒนา โดยให้เราไป config role เพื่อให้เราสามารถเข้าถึงข้อมูลได้โดยใครก็ได้

{% highlight json %}
{
    "rules": {
        ".read": true,
        ".write": true
    }
}
{% endhighlight %}
<br>

### การที่เราจะเรียกใช้งาน REST API ของ Realtime Database โดยไม่ต้องเขียนโค้ด เพียงแค่เพิ่ม `.json` ต่อท้าย key ที่อยู่ใน Database 
<br>

#### Filtering Data

- ลองดึงข้อมูล users ทั้งหมดมาดู เช่น ข้อมูลเราเป็นแบบนี้

{% highlight json %}
{
    "users": {
        "prongbang": {
            "first_name": "โปร่ง",
            "last_name": "บาง"
        },
        "endtry": {
            "first_name": "End",
            "last_name": "Try"
        }
    }
}
{% endhighlight %}

เราสามารถดึงข้อมูล users ทั้งหมดโดยใช้ท่านี้

{% highlight json %}
curl 'https://[PROJECT_ID].firebaseio.com/users.json'
{% endhighlight %}

ข้อมูลที่ได้ก็จะประมาณนี้

{% highlight json %}
{"endtry":{"first_name":"End","last_name":"Try"},"prongbang":{"first_name":"โปร่ง","last_name":"บาง"}}
{% endhighlight %}

และถ้าอยากให้ format json สวย ๆ หน่อย ให้ใส่ `print=pretty` ต่อท้าย ประมาณนี้

{% highlight json %}
curl 'https://[PROJECT_ID].firebaseio.com/users.json?print=pretty'
{% endhighlight %}

ข้อมูลที่ได้ก็จะประมาณนี้

{% highlight json %}
{
  "endtry" : {
    "first_name" : "End",
    "last_name" : "Try"
  },
  "prongbang" : {
    "first_name" : "โปร่ง",
    "last_name" : "บาง"
  }
}
{% endhighlight %}

- ลองดึงข้อมูลเฉพาะ user ที่ต้องการก็จะใช้ท่านี้

{% highlight json %}
curl 'https://[PROJECT_ID].firebaseio.com/users/prongbang.json?print=pretty'
{% endhighlight %}

ข้อมูลที่ได้ก็จะประมาณนี้

{% highlight json %}
{
  "first_name" : "โปร่ง",
  "last_name" : "บาง"
}
{% endhighlight %}
<br>

#### Saving Data

- ลองเพิ่มข้อมูล user ที่ยังไม่เคยมีอยู่ใน database จะใช้ท่านี้ 

{% highlight json %}
curl -X POST -d '{
    "first_name" : "User",
    "last_name" : "Number 1"
}' 'https://[PROJECT_ID].firebaseio.com/users.json'
{% endhighlight %}

จะได้ข้อมูลที่เป็นคีย์ของข้อมูลชุดนั้นมาประมาณนี้

{% highlight json %}
{"name":"-LPttBUYwV05Aht_G9Te"}
{% endhighlight %}

- กรณีที่มีข้อมูลอยู่แล้วมันจะทำการ update ถ้ายังไม่เคยมีมันจะทำการเพิ่มให้ใหม่ และยังสามารถกำหนดคีย์ของเราได้เองด้วย โดยจะใช้ท่านี้

{% highlight json %}
curl -X PUT -d '{
    "first_name": "โปร่ง",
    "last_name": "บาง"
}' 'https://[PROJECT_ID].firebaseio.com/users/prongbang.json'
{% endhighlight %}

ข้อมูลที่ได้ก็จะประมาณนี้

{% highlight json %}
{"first_name":"โปร่ง","last_name":"บาง"}
{% endhighlight %}

- ถ้าจะ update แค่ `first_name` ให้ใช้ท่านี้ 

{% highlight json %}
curl -X PUT -d '"bang"' 'https://[PROJECT_ID].firebaseio.com/users/prongbang/first_name.json'
{% endhighlight %}

ข้อมูลที่ได้ก็จะประมาณนี้

{% highlight json %}
"bang"
{% endhighlight %}

- ถ้าอยากจะเพิ่ม field ให้กับ user ของเราให้ใช้ท่านี้

{% highlight json %}
curl -X PATCH -d '{
  "nickname": "M"
}' 'https://[PROJECT_ID].firebaseio.com/users/prongbang.json'
{% endhighlight %}

ข้อมูลที่ได้ก็จะประมาณนี้

{% highlight json %}
{"nickname":"M"}
{% endhighlight %}

- ถ้าอยากเพิ่ม field ให้กับ user อื่นด้วยให้ใช้ท่านี้

{% highlight json %}
curl -X PATCH -d '{
  "prongbang/nickname": "M",
  "endtry/nickname": "B"
}' 'https://[PROJECT_ID].firebaseio.com/users.json'
{% endhighlight %}

ข้อมูลที่ได้ก็จะประมาณนี้

{% highlight json %}
{"prongbang":{"nickname":"M"},"endtry":{"nickname":"B"}}
{% endhighlight %}

- ลบข้อมูล user ที่ต้องการ

{% highlight json %}
curl -X DELETE 'https://[PROJECT_ID].firebaseio.com/users/endtry.json'
{% endhighlight %}

ข้อมูลที่ได้ก็จะประมาณนี้

{% highlight json %}
null
{% endhighlight %}

<br><br>
สามารถดูข้อมูลเพิ่มเติมได้ที่ [https://firebase.google.com/docs/database/rest/start](https://firebase.google.com/docs/database/rest/start?hl=th)
<br><br>