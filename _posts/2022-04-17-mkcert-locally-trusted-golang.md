---
layout: post
title: "[Golang] สร้าง Certificate มาใช้กับ Golang เพื่อใช้ https บนเครื่องตัวเองด้วย mkcert"
short_description: "จะมีบางงานที่ต้องใช้ https เพื่อทดสอบแอพบนเครื่องตัวเอง มาดูกันว่าต้องทำยังไง"
date: 2022-04-17 21:36:15 +0700
categories: [golang]
tags: [golang]
cover_image: /assets/images/golang/12.png
author: "Devไปวันๆ"
---

ในโพสนี้จะสอนการใช้งาน mkcert บน macOS เป็นหลักนะครับ สำหรับใครที่หลงเข้ามาใช้ OS อื่นอยู่เข้ามาดูที่นี่ได้ครับ [https://github.com/FiloSottile/mkcert](https://github.com/FiloSottile/mkcert)

<br>

### Install mkcert บน macOS

{% highlight shell %}
brew install mkcert
{% endhighlight %}

ถ้าจะใช้บน Firefox ด้วยกก็ลงงตัวนี้เพิ่ม

{% highlight shell %}
brew install nss
{% endhighlight %}

### Generate Local CA และ Install ลงเครื่อง

{% highlight shell %}
mkcert -install
{% endhighlight %}

จะเห็น log ประมาณนี้

{% highlight shell %}
The local CA is now installed in the system trust store! ⚡️
Warning: "certutil" is not available, so the CA can't be automatically installed in Firefox! ⚠️
Install "certutil" with "brew install nss" and re-run "mkcert -install" 👈
The local CA is now installed in Java's trust store! ☕️
{% endhighlight %}

ถ้าใครไม่อยากลงก็ข้ามขั้นตอนนี้ได้เรย ส่วนใครอยากลง nss ก็พิมพ์ตามนี้

{% highlight shell %}
brew install nss
{% endhighlight %}

พอลง nss เสร็จก็รันคำสั่งนี้ใหม่

{% highlight shell %}
mkcert -install
{% endhighlight %}

ถ้าได้แบบนี้้ก็เรียบร้อย

{% highlight shell %}
The local CA is already installed in the system trust store! 👍
The local CA is already installed in the Firefox trust store! 👍
The local CA is already installed in Java's trust store! 👍
{% endhighlight %}

พอลงทุกอย่างเสร็จก็มาดูว่า rootCA อยู่ที่ไหน เผื่อว่าต้องการนำไปใช้

{% highlight shell %}
mkcert -CAROOT
{% endhighlight %}

จะได้ path มาประมาณนี้

{% highlight shell %}
/Users/xyx/Library/Application\ Support/mkcert
{% endhighlight %}

ลองดูว่ามีไฟล์อะไรบ้าง

{% highlight shell %}
ls /Users/xyx/Library/Application\ Support/mkcert
{% endhighlight %}

จะเห็นว่ามีประมาณนี้

{% highlight shell %}
rootCA-key.pem 
rootCA.pem
{% endhighlight %}


### สร้าง Certificates ที่จะใช้งานบนเครื่องตัวเองง่าย ๆ ด้วยคำสั่ง

- `tls.go.com` คือ กำหนดชื่อ domain ที่เราต้องการ
- `*.tls.go.com` คือ กำหนดชื่อ subdomain ที่เราต้องการ

{% highlight shell %}
mkcert tls.go.com '*.tls.go.com' localhost 127.0.0.1 ::1
{% endhighlight %}

ถ้าได้แบบนี้แสดงว่าสร้างเรียบร้อย

{% highlight shell %}

Created a new certificate valid for the following names 📜
 - "tls.go.com"
 - "*.tls.go.com"
 - "localhost"
 - "127.0.0.1"
 - "::1"

Reminder: X.509 wildcards only go one level deep, so this won't match a.b.tls.go.com ℹ️

The certificate is at "./tls.go.com+4.pem" and the key at "./tls.go.com+4-key.pem" ✅

It will expire on 18 July 2024 🗓

{% endhighlight %}

พอลองเข้าไปดูที่โฟลเดอร์ที่เรารัน mkcert ก่อนหน้านี้ก็จะเห็น cert ที่สร้างแล้วประมาณนี้

{% highlight shell %}
tls.go+4-key.pem
tls.go+4.pem
{% endhighlight %}

ต่อไปก็ขึ้นอยุ่กับเราแล้วว่าเราจะเอา cert ไปใช้ที่ไหนยังไง 

<br>

### ลองเอาไปใช้กับ Golang + Fiber สามารถเขียนสั้น ๆ แบบนี้ได้เลย

- [main.go](https://github.com/prongbang/go-tls/blob/master/main.go)

{% highlight golang %}
app := fiber.New()

// Create tls certificate
cer, _ := tls.LoadX509KeyPair("mkcert/tls.go.com+4.pem", "mkcert/tls.go.com+4-key.pem")

config := &tls.Config{Certificates: []tls.Certificate{cer}}

// Create custom listener
ln, _ := tls.Listen("tcp", ":443", config)

log.Fatal(app.Listener(ln))
{% endhighlight %}

- `mkcert/tls.go.com+4.pem` กำหนด path ของ cert ที่เราได้มาก่อนหน้านี้
- `mkcert/tls.go.com+4-key.pem` กำหนด path ของ key ที่เราได้มาก่อนหน้านี้

<br>

### ไปแก้ไขไฟล์ `/etc/hosts`

- เปิดไฟล์เพื่อแก้ไขด้วย vim

{% highlight shell %}
sudo vim /etc/hosts
{% endhighlight %}

- กดคีย์บอร์ดตัว `A` เพื่อให้แก้ไขไฟล์ได้
- เพิ่มบรรทัดนี้เข้าไปล่างสุดของบรรทัดก็ได้

{% highlight shell %}
127.0.0.1       tls.go.com
{% endhighlight %}

**ตรง `tls.go.com` จะเป็นชื่อเดียวกันกับตอนที่เรา mkcert

- พอเพิ่มเสร็จให้กดคีย์บอร์ดตัว `Esc`
- แล้วพิมพ์ `:wq` เพื่อ Save และออกจาก `vim`

<br>

### ลองรัน Go ด้วยคำสั่ง

{% highlight shell %}
go run main.go
{% endhighlight %}


### ลองเทสผ่าน curl หรือเปิด Chrome แล้วพิมพ์ชื่อ domain เอาก็ได้

{% highlight shell %}
curl https://tls.go.com
{% endhighlight %}

พอยิงเสร็จได้ประมาณนี้ นั่นหมายความว่าเราสามารถใช้งาน https บนเครื่องตัวเองได้แล้ว

{% highlight json %}
{
  "protocol": "https"
}
{% endhighlight %}

เพียงเท่านี้ก็ใช้งาน Certtificate ที่เรา gen ด้วย mkcert ได้แล้ว หากผิดพลาดตรงไหนต้องขออภัยด้วยครับ 

<br>

ตัวอย่าง Source Code ครับ https://github.com/prongbang/go-tls

<br>