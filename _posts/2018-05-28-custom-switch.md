---
layout: post
title:  "[Android] อยาก Customize ให้ Switch สวยขึ้นต้องทำยังไง"
short_description: "เมื่อ widget Switch ของ android ที่เป็น default ไม่เหมือนกับ Switch ที่ Designer ได้ออกแบบมา"
date:   2018-05-28 16:28:01 +0700
categories: android
tags: [android]
cover_image: /assets/images/android/6.png
author: "end try"
---

### คงไม่ต้องอธิบายอะไรให้มากความ บล็อคนี้เน้นแต่เนื้อ ๆ
- สร้างไฟล์ `switch_thumb.xml` ในโพลเดอร์ `drawable` เพื่อสร้างส่วนหัวกลม ๆ ของ `switch` โดยเราจะเขียน `xml` ประมาณนี้

{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<selector xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:state_checked="true">
        <shape android:shape="rectangle">
            <size android:width="30dp" android:height="30dp" />
            <padding
                android:left="5dp"
                android:right="5dp"
                android:bottom="10dp"
                android:top="10dp" />
            <solid android:color="#fff" />

            <corners android:radius="20dp" />

            <stroke android:color="#2b3c92" android:width="3dp"/>
        </shape>
    </item>

    <item android:state_checked="false">
        <shape android:shape="rectangle" >
            <size android:width="30dp" android:height="30dp" />
            <padding
                android:left="5dp"
                android:right="5dp"
                android:bottom="10dp"
                android:top="10dp" />
            <solid android:color="#fff" />

            <corners android:radius="20dp" />

            <stroke android:color="#eeeeee" android:width="3dp"/>
        </shape>
    </item>
</selector>
{% endhighlight %}

- สร้างไฟล์ `switch_track.xml` ในโพลเดอร์ `drawable` เพื่อสร้างรางให้กับส่วนหัวกลม ๆ ของ `switch` วิ่งไปมา ๆ โดยเราจะเขียน `xml` ประมาณนี้

{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<selector xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:state_checked="true">
        <shape android:shape="rectangle">
            <size android:width="50dp" android:height="30dp" />
            <padding
            android:left="5dp"
            android:right="5dp"
            android:bottom="10dp"
            android:top="10dp" />
            <solid android:color="#2b3c92" />

            <corners android:radius="20dp" />
        </shape>
    </item>

    <item android:state_checked="false">
        <shape android:shape="rectangle" >
            <size android:width="50dp" android:height="30dp" />
            <padding
                android:left="5dp"
                android:right="5dp"
                android:bottom="10dp"
                android:top="10dp" />
            <solid android:color="#eeeeee" />

            <corners android:radius="20dp" />
        </shape>
    </item>
</selector>
{% endhighlight %}

### การเรียกใช้ไฟล์ `switch_thumb.xml` และ `switch_track.xml` 
ในตัวอย่างนี้เราจะ Custom ตัว widget ที่ชื่อว่า `SwitchCompat` ส่วนวิธี custom นั้นให้ดูโค้ดด้านล่างเลย

{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <android.support.v7.widget.SwitchCompat
        android:id="@+id/swCustom"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:thumb="@drawable/switch_thumb"
        app:track="@drawable/switch_track"/>

</LinearLayout>
{% endhighlight %}

เพียงเท่านี้เราก็จะได้ `Switch` ตามที่เราต้องการแล้ว (ผลลัพธ์ที่ได้เหมือนภาพ cover ด้านบน)