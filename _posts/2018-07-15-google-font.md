---
layout: post
title:  "[Android] ใช้งานฟอต์นง่าย ๆ จาก Google Font"
short_description: "เพิ่มความสะดวกสบายในการเปลี่ยนฟอต์นให้กับ TextView ขึ้นเยอะเลย จะง่ายขนาดไหนมาดู ๆ"
date:   2018-07-15 18:35:01 +0700
categories: android
tags: [android]
cover_image: /assets/images/android/10.png
author: "end try"
---

### เริ่มจากเปิดไฟล์ Layout ของเราจากนั้นให้เลือกที่แท็บ `Design` จากนั้นให้คลิกที่ตัว `TextView` ของเราแล้วเลือกตามภาพ
<br>

<img src="/assets/images/android/10-1.png"/>
<br>
<br>

เมื่อเลือกตามภาพแล้วเราจะเจอกับหน้าจอแบบนี้ตามภาพ
<br>
<br>

<img src="/assets/images/android/10-2.png"/>
<br>
<br>

ต่อไปก็ค้นหาฟอต์นที่เราต้องการเลย ซึ่งในตัวอย่างนี้เราจะใช้ฟอต์นชื่อ `Kanit` และเลือกเป็น `ExtraLight` ตามภาพ จากนั้นก็คลิก `OK` ไป 

<br>
<img src="/assets/images/android/10-3.png"/>
<br>
<br>

โดยสิ่งที่เราจะได้มาคือ โฟลเดอร์ `font` โดยมีไฟล์ฟอต์นในรูปแบบ `XML` ชื่อ `kanit_extralight.xml` หน้าตาของมันก็ประมาณนี้ ๆ

{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<font-family xmlns:app="http://schemas.android.com/apk/res-auto"
        app:fontProviderAuthority="com.google.android.gms.fonts"
        app:fontProviderPackage="com.google.android.gms"
        app:fontProviderQuery="name=Kanit&amp;weight=200"
        app:fontProviderCerts="@array/com_google_android_gms_fonts_certs">
</font-family>
{% endhighlight %}

### แล้วจะเรียกใช้ยังไงละ 
<br>

วิธีเรียกใช้ฟอต์นง่าย ๆ เลยประมาณแบบนี้
<br>
{% highlight xml %}
android:fontFamily="@font/kanit_extralight"
{% endhighlight %}

โดยเอา Attributes ของ `fontFamily` มาใส่ไว้ใน `TextView` ของเราก็จะได้ประมาณนี้

{% highlight xml %}
<TextView
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:fontFamily="@font/kanit_extralight"
    android:gravity="center"
    android:text="@string/hello_blank_fragment"
    android:textColor="#000000"
    android:textSize="35sp" />
{% endhighlight %}

เพียงเท่านี้ก็เรียบร้อย วิธีการใช้งานฟอต์นจาก `Google Font`
<br>
<br>
<br>