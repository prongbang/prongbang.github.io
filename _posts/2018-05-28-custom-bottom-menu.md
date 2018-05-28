---
layout: post
title:  "[Android] อยาก Customize ให้ Menu มาอยู่ข้างล่างต้องทำยังไง"
short_description: "เมื่อมีความจำเป็นที่จะต้องย้ายเมนูมาอยู่ข้างล่างหน้าจอตาม design"
date: 2018-05-28 17:38:21 +0700
categories: android
tags: [android]
cover_image: /assets/images/android/7.png
author: "end try"
---

### มีอยู่หลายวิธีที่จะทำเมนูให้อยู่ข้างล่าง คือ
1. ใช้ `android.support.design.widget.BottomNavigationView` ซึ่งมีคนเขียนอธิบายการใช้งานเยอะแล้วเราจะไม่เขียนลองจิ้มเข้าไปดูที่ [https://developer.android.com/reference/android/support/design/widget/BottomNavigationView](https://developer.android.com/reference/android/support/design/widget/BottomNavigationView)
<br>
<br>
2. เราจะใช้วิธีนี้แทนมันอาจจะไม่ใช่วิธีที่ดีที่สุดแต่ว่ามันสามารถ custom ได้ง่ายเมื่อมี requirement มาให้แก้ bottom menu ใหม่ให้เพิ่มนั่นนี่ เรามาดูกันว่าใช้ท่าไหน

### สร้าง `main_activity.xml` จากนั้นเขียนโค้ดนี้ลงไป

{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <FrameLayout
        android:id="@+id/vContent"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:layout_above="@+id/vNavigation" />

    <LinearLayout
        android:id="@+id/vNavigation"
        android:layout_width="match_parent"
        android:layout_height="50dp"
        android:layout_alignParentBottom="true"
        android:background="#00c2e1"
        android:orientation="horizontal"
        android:weightSum="4">

        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="match_parent"
            android:layout_weight="1"
            android:gravity="center">

            <android.support.v7.widget.AppCompatImageView
                android:id="@+id/ivHome"
                android:layout_width="wrap_content"
                android:layout_height="match_parent"
                android:layout_gravity="center"
                android:background="?attr/selectableItemBackgroundBorderless"
                android:padding="12dp"
                app:srcCompat="@drawable/ic_store" />

        </LinearLayout>

        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="match_parent"
            android:layout_weight="1"
            android:gravity="center">

            <android.support.v7.widget.AppCompatImageView
                android:id="@+id/ivCat"
                android:layout_width="wrap_content"
                android:layout_height="match_parent"
                android:layout_gravity="center"
                android:background="?attr/selectableItemBackgroundBorderless"
                android:padding="12dp"
                app:srcCompat="@drawable/ic_store" />

        </LinearLayout>

        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="match_parent"
            android:layout_weight="1"
            android:gravity="center">

            <android.support.v7.widget.AppCompatImageView
                android:id="@+id/ivProfile"
                android:layout_width="wrap_content"
                android:layout_height="match_parent"
                android:layout_gravity="center"
                android:padding="12dp"
                app:srcCompat="@drawable/ic_store" />

        </LinearLayout>

        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="match_parent"
            android:layout_weight="1"
            android:gravity="center">

            <android.support.v7.widget.AppCompatImageView
                android:id="@+id/ivMore"
                android:layout_width="wrap_content"
                android:layout_height="match_parent"
                android:layout_gravity="center"
                android:background="?attr/selectableItemBackgroundBorderless"
                android:padding="12dp"
                app:srcCompat="@drawable/ic_store" />

        </LinearLayout>

    </LinearLayout>

</RelativeLayout>
{% endhighlight %}

จากนั้นเราจะเห็นว่ามี error ที่บรรทัด `app:srcCompat="@drawable/ic_store"` ก็เพราะว่ามันหาไฟล์รูปที่เป็น `vector` ไม่เจอ วิธีแก้คือ

- สร้างไฟล์ `ic_store.xml` ในโฟลเดอร์ `drawable` เพื่อกำหนด `level` ให้กับรูปภาพเพื่อใช้กำหนดตอนที่มีการกดที่ menu ว่าจะใช้ `level` ที่ 0 หรือ 1 (ซึ่ง 0 คือ รูปเริ่มต้น และ 1 คือ รูปที่เลือก) โดยใส่โค้ดตามนี้
{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<level-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@drawable/ic_store_default" android:maxLevel="0"/>
    <item android:drawable="@drawable/ic_store_active" android:maxLevel="1"/>
</level-list>
{% endhighlight %}

- สร้างไฟล์ `ic_store_default.xml` ในโฟลเดอร์ `drawable` หรือเป็นรูป ซึ่งในที่นี้เราจะใช้แบบ `vector` ซึ่งมันมีขนาดเล็กกว่ารูป จากนั้นใส่โค้ดตามนี้
{% highlight xml %}
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:tint="#017d91"
    android:viewportHeight="24.0"
    android:viewportWidth="24.0">
    <path
        android:fillColor="#FF000000"
        android:pathData="M20,4L4,4v2h16L20,4zM21,14v-2l-1,-5L4,7l-1,5v2h1v6h10v-6h4v6h2v-6h1zM12,18L6,18v-4h6v4z" />
</vector>
{% endhighlight %}

- สร้างไฟล์ `ic_store_active.xml` ในโฟลเดอร์ `drawable` หรือเป็นรูป ซึ่งในที่นี้เราจะใช้แบบ `vector` ซึ่งมันมีขนาดเล็กกว่ารูป จากนั้นใส่โค้ดตามนี้
{% highlight xml %}
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:tint="#FFFFFF"
    android:viewportHeight="24.0"
    android:viewportWidth="24.0">
    <path
        android:fillColor="#FF000000"
        android:pathData="M20,4L4,4v2h16L20,4zM21,14v-2l-1,-5L4,7l-1,5v2h1v6h10v-6h4v6h2v-6h1zM12,18L6,18v-4h6v4z" />
</vector>
{% endhighlight %}

### สร้าง `MainActivity.kt` จากนั้นเขียนโค้ดนี้ลงไป

{% highlight kotlin %}
import android.os.Bundle
import android.support.v7.app.AppCompatActivity
import android.support.v7.widget.AppCompatImageView
import android.view.View
import kotlinx.android.synthetic.main.menu.*

class MenuActivity : AppCompatActivity(), View.OnClickListener {

    private val mMenu = arrayListOf<AppCompatImageView>(ivHome, ivCat, ivProfile, ivMore)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.main_activity)

        ivHome.setOnClickListener(this)
        ivCat.setOnClickListener(this)
        ivProfile.setOnClickListener(this)
        ivMore.setOnClickListener(this)
    }

    override fun onClick(v: View?) {
        active(mMenu, v)
    }

    private fun active(mMenu: ArrayList<AppCompatImageView>, view: View?) {
        for (iv in mMenu) {
            if (iv == view) {
                iv.setImageLevel(1)
            } else {
                iv.setImageLevel(0)
            }
        }
    }

}
{% endhighlight %}

จากโค้ดข้างบนทำหน้าที่แค่ `active` รูปเมนูที่ `click` และ คืนค่ารูปเริ่มต้น ส่วนการนำไปต่อยอดก็ขึ้นอยู่กับความต้องการของคนที่หลงเข้ามาอ่านเลย