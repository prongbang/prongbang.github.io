---
layout: post
title: "[Flutter][Golang] ปกป้องข้อมูลที่มีความสำคัญด้วย End-to-End Encryption"
short_description: "เพิ่มความปลอดภัยให้กับข้อมูลทั้งฝั่ง Client และ Server เพื่อป้องกันการถูกดักจับข้อมูล และแก้ไขข้อมูล"
date: 2024-04-21 17:09:15 +0700
categories: [flutter,golang]
tags: [flutter,golang]
cover_image: /assets/images/flutter/08.png
author: "Devไปวันๆ"
---

โดยกระบวนการจะเริ่มจาก

1. ทั้งฝั่ง Client และ Server ที่ต้องการจะคุยกัน จะต้องสร้าง KeyPair ก่อน แล้วจะได้ Public Key และ Private Key
2. ทำการแลกเปลี่ยนกุญแจสาธารณะ (Public Key) ระหว่าง Client กับ Server
3. เมื่อแลกเปลี่ยนกุญแจสาธารณะ (Public Key) แล้วทั้ง Client และ Server จะได้ Shared Key มา
4. นำ Shared Key มาใช้ในการ Encrypt และ Decrypt ข้อมูลระหว่าง Client และ Server

<br>

### รายละเอียด Algorithm ที่เราจะใช้

- Key exchange: X25519
- Encryption: AES
- Authentication: GCM

### Library สำหรับการทำ Encrypt และ Decrypt

- Flutter

{% highlight yaml %}
dependencies:
  lazyaesgcm: ^1.0.0
{% endhighlight %}

- Golang

{% highlight shell %}
go get github.com/prongbang/lazyaesgcm
{% endhighlight %}

### 1. ทั้งฝั่ง Client และ Server ที่ต้องการจะคุยกัน จะต้องสร้าง KeyPair ก่อน แล้วจะได้ Public Key และ Private Key

- Flutter

{% highlight dart %}
final clientKeyPair = await KeyPair.newKeyPair();
{% endhighlight %}

- Golang

{% highlight go %}
serverKeyPair := lazyaesgcm.NewKeyPair()
{% endhighlight %}

### 2/3. ทำการแลกเปลี่ยนกุญแจสาธารณะ (Public Key) ระหว่าง Client กับ Server เมื่อแลกเปลี่ยนกุญแจสาธารณะ (Public Key) แล้วทั้ง Client และ Server จะได้ Shared Key มา

- Flutter

{% highlight dart %}
final clientSharedKey = await clientKeyPair.sharedKey(serverKeyPair.pk);
{% endhighlight %}

- Golang

{% highlight go %}
serverKx := serverKeyPair.Exchange(clientKeyPair.Pk)
serverSharedKey, err := serverKx.Secret()
{% endhighlight %}


### 4. นำ Shared Key มาใช้ในการ Encrypt และ Decrypt ข้อมูลระหว่าง Client และ Server

- Flutter

{% highlight dart %}
final lazyaesgcm = LazyAesGcm.instance;
const plaintext = '{"message": "Hi"}';
final ciphertext = await lazyaesgcm.encrypt(plaintext, clientSharedKey);
{% endhighlight %}

- Golang

{% highlight go %}
lazyAesGcm := lazyaesgcm.New()
key, _ := hex.DecodeString(serverSharedKey)
plaintext, err := lazyAesGcm.Decrypt(ciphertext, key)
{% endhighlight %}

<br>

ถึงแม้ว่าจะมีการดักจับข้อมูลระหว่างการส่งได้ก็ตาม เนื่องจากข้อมูลจะยังคงอยู่ในสภาพที่เข้ารหัสอยู่ จึงไม่สามารถอ่านได้ แต้ก็มีโอกาสที่จะถูกแกะอ่านข้อมูลได้ ถ้าถูกขโมย Private Key ดั้งนั้นเราต้องเก็บไว้ให้ดี และต้องทำการแลกเปลี่ยนคีย์ (Key Exchange) กันบ่อย ๆ

<br>

กระบวนการทำงานคร่าว ๆ จะประมาณนี้ แต่ถ้าอยากรู้ว่าจะนำไปใช้งานจริง ๆ ต้องทำยังไงสามารถเข้าไปดูได้ที่นี่เลยครับ มี Source Code ตัวอย่าง ทั้ง Flutter และ Golang >> 
[https://buymeacoffee.com/prongbang/end-end-encryption-flutter-golang-backend](https://buymeacoffee.com/prongbang/end-end-encryption-flutter-golang-backend)
ขอบคุณครับ :)
