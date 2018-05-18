---
layout: post
title:  "[Android] Hamburger Menu ในแบบฉบับของตัวเอง โดยไม่ใช้ DrawerLayout"
short_description: "ในโลกของการเขียนแอพ Android เพื่อให้ได้มาซึ่งแอพที่ไม่เหมือนใคร เราล้วนจำเป็นที่จะต้องเขียนมันขึ้นมาเองในฉบับของเจ้าของบล็อค"
date:   2018-05-15 22:04:42 +0700
categories: android
tags: [android]
cover_image: /assets/images/android/4.png
author: "end try"
---

### เริ่มจากดู Design แล้วมาวิเคราะห์ว่าเราควรจัด Layout กันยังไง (อ้างอิงจากภาพด้านบน)

เมื่อวิเคราะห์แล้วเราจะแบ่ง Layout เป็นแบบนี้เริ่มจากแบ่ง view ออกเป็นส่วน ๆ ดังนี้

- สร้างวงกลมสีหลักของแอพ `bg_circle_primary.xml`

{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="oval">
    <solid android:color="@color/colorPrimary"/>
    <corners android:radius="@dimen/common_circle_width"/>
</shape>
{% endhighlight %}

- สร้างวงกลมสีขาว `bg_circle_white.xml`

{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="oval">
    <solid android:color="@color/colorWhite"/>
    <corners android:radius="@dimen/common_circle_width"/>
</shape>
{% endhighlight %}

- สร้างสี่เหลี่ยมขอบมล `bg_nav_redius.xml`

{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <solid android:color="@color/colorPrimaryDark" />
    <corners
        android:bottomRightRadius="@dimen/radius_button"
        android:topRightRadius="@dimen/radius_button" />
</shape>
{% endhighlight %}

- สร้าง Menu Icon ด้วย Vector `ic_menu_left.xml`

{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="11dp"
    android:viewportWidth="24.45"
    android:viewportHeight="11.854">
    <path
        android:pathData="M2.223,0L22.227,0A2.223,2.223 0,0 1,24.45 2.223L24.45,2.223A2.223,2.223 0,0 1,22.227 4.445L2.223,4.445A2.223,2.223 0,0 1,0 2.223L0,2.223A2.223,2.223 0,0 1,2.223 0z"
        android:fillColor="#fff"/>
    <path
        android:pathData="M2.223,7.409L14.077,7.409A2.223,2.223 0,0 1,16.3 9.632L16.3,9.632A2.223,2.223 0,0 1,14.077 11.854L2.223,11.854A2.223,2.223 0,0 1,0 9.632L0,9.632A2.223,2.223 0,0 1,2.223 7.409z"
        android:fillColor="#fff"/>
</vector>
{% endhighlight %}

- สร้าง Layout ของหน้าหลักของแอพ `activity_main.xml` ซึ่งในที่นี้เราจะใช้ `weight` ในการแบ่งสัดส่วนของ layout โดยในที่นี่จะใช้ `android:weightSum="6"` ในการกำหนดว่าจะแบ่งเป็นกี่ส่วน ส่วนวิธีแบ่งส่วนเราจะใช้ `android:layout_weight="1"` เพิ่มเข้าไปใน `LinearLayout` ตัวแรกโดยตั้งชื่อ id ว่า `android:id="@+id/vNavMenu"` และ `LinearLayout` ตัวที่สองชื่อ id ว่า `android:id="@+id/vNavMain"` เพียงแค่นี้เราก็จะได้ layout ตาม design แล้ว สามารถดูโค้ดการกำหนด layout ตามโค้ดข้างล่างนี้

{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:animateLayoutChanges="true"
    android:background="@color/colorBlueDark"
    android:orientation="horizontal"
    android:weightSum="6">

    <LinearLayout
        android:id="@+id/vNavMenu"
        android:layout_width="wrap_content"
        android:layout_height="match_parent"
        android:layout_marginBottom="@dimen/activity_vertical_margin"
        android:layout_marginEnd="@dimen/activity_vertical_margin"
        android:layout_marginTop="@dimen/activity_vertical_margin"
        android:layout_weight="1"
        android:background="@drawable/bg_nav_circle"
        android:elevation="4dp"
        android:visibility="visible">

        <RelativeLayout
            android:layout_width="wrap_content"
            android:layout_height="match_parent">

            <LinearLayout
                android:id="@+id/vProfile"
                android:layout_width="match_parent"
                android:layout_height="300dp"
                android:layout_alignParentStart="true"
                android:layout_alignParentTop="true"
                android:gravity="center"
                android:orientation="vertical">

                <include layout="@layout/item_profile" />

            </LinearLayout>

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="match_parent"
                android:layout_below="@+id/vProfile"
                android:layout_margin="@dimen/button_margin_vertical">

                <include layout="@layout/item_menu" />

            </LinearLayout>

        </RelativeLayout>

    </LinearLayout>

    <LinearLayout
        android:id="@+id/vNavMain"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:layout_weight="1"
        android:background="@color/colorPrimary"
        android:orientation="vertical">

        <RelativeLayout
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:orientation="vertical">

            <RelativeLayout
                android:id="@+id/vHeader"
                android:layout_width="match_parent"
                android:layout_height="120dp">

                <android.support.v7.widget.AppCompatImageView
                    android:id="@+id/ivMenuLeft"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_alignParentStart="true"
                    android:layout_centerVertical="true"
                    android:background="?attr/selectableItemBackgroundBorderless"
                    android:padding="16dp"
                    app:srcCompat="@drawable/ic_menu_left" />

                <LinearLayout
                    android:layout_width="200dp"
                    android:layout_height="20dp"
                    android:layout_centerHorizontal="true"
                    android:layout_centerVertical="true">

                    <View
                        android:layout_width="match_parent"
                        android:layout_height="@dimen/placeholder_text_height"
                        android:background="@color/placeholder_bg" />
                </LinearLayout>

            </RelativeLayout>

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:layout_below="@+id/vHeader">

                <include layout="@layout/item_feed" />

            </LinearLayout>

        </RelativeLayout>

    </LinearLayout>

</LinearLayout>
{% endhighlight %}

กรณีที่เราอยากให้ menu เลื่อนแบบ animation เราก็แค่ใส่ attributes นี้เข้าไป

{% highlight xml %}

android:animateLayoutChanges="true"

{% endhighlight %}

เพื่อแยก layout ไม่ให้มันดูยากเลยแยกมันออกมาเลยแล้วกันแล้วค่อยใช้วิธี include เอาโดยแยกออกมาตามนี้

- `item_feed.xml`

{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="200dp"
        android:layout_marginBottom="@dimen/button_margin_vertical"
        android:layout_marginEnd="@dimen/button_margin_vertical"
        android:layout_marginStart="@dimen/button_margin_vertical"
        android:orientation="horizontal"
        android:weightSum="2">

        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="match_parent"
            android:layout_marginEnd="8dp"
            android:layout_weight="1"
            android:orientation="vertical">

            <View
                android:layout_width="match_parent"
                android:layout_height="140dp"
                android:background="@color/placeholder_bg" />

            <View
                android:layout_width="match_parent"
                android:layout_height="@dimen/placeholder_text_height"
                android:layout_marginEnd="100dp"
                android:layout_marginTop="8dp"
                android:background="@color/placeholder_bg" />

            <View
                android:layout_width="match_parent"
                android:layout_height="13dp"
                android:layout_marginEnd="30dp"
                android:layout_marginTop="8dp"
                android:background="@color/placeholder_bg" />
        </LinearLayout>

        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="match_parent"
            android:layout_marginStart="8dp"
            android:layout_weight="1"
            android:orientation="vertical">

            <View
                android:layout_width="match_parent"
                android:layout_height="140dp"
                android:background="@color/placeholder_bg" />

            <View
                android:layout_width="match_parent"
                android:layout_height="@dimen/placeholder_text_height"
                android:layout_marginEnd="100dp"
                android:layout_marginTop="8dp"
                android:background="@color/placeholder_bg" />

            <View
                android:layout_width="match_parent"
                android:layout_height="13dp"
                android:layout_marginEnd="30dp"
                android:layout_marginTop="8dp"
                android:background="@color/placeholder_bg" />
        </LinearLayout>
    </LinearLayout>

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="200dp"
        android:layout_marginBottom="@dimen/button_margin_vertical"
        android:layout_marginEnd="@dimen/button_margin_vertical"
        android:layout_marginStart="@dimen/button_margin_vertical"
        android:orientation="horizontal"
        android:weightSum="2">

        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="match_parent"
            android:layout_marginEnd="8dp"
            android:layout_weight="1"
            android:orientation="vertical">

            <View
                android:layout_width="match_parent"
                android:layout_height="140dp"
                android:background="@color/placeholder_bg" />

            <View
                android:layout_width="match_parent"
                android:layout_height="@dimen/placeholder_text_height"
                android:layout_marginEnd="100dp"
                android:layout_marginTop="8dp"
                android:background="@color/placeholder_bg" />

            <View
                android:layout_width="match_parent"
                android:layout_height="13dp"
                android:layout_marginEnd="30dp"
                android:layout_marginTop="8dp"
                android:background="@color/placeholder_bg" />
        </LinearLayout>

        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="match_parent"
            android:layout_marginStart="8dp"
            android:layout_weight="1"
            android:orientation="vertical">

            <View
                android:layout_width="match_parent"
                android:layout_height="140dp"
                android:background="@color/placeholder_bg" />

            <View
                android:layout_width="match_parent"
                android:layout_height="@dimen/placeholder_text_height"
                android:layout_marginEnd="100dp"
                android:layout_marginTop="8dp"
                android:background="@color/placeholder_bg" />

            <View
                android:layout_width="match_parent"
                android:layout_height="13dp"
                android:layout_marginEnd="30dp"
                android:layout_marginTop="8dp"
                android:background="@color/placeholder_bg" />
        </LinearLayout>
    </LinearLayout>
</LinearLayout>
{% endhighlight %}

- `item_menu.xml`

{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:orientation="vertical" android:layout_width="match_parent"
    android:layout_height="match_parent">
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical">

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:layout_marginBottom="8dp"
            android:layout_marginStart="@dimen/button_margin_vertical"
            android:layout_marginTop="8dp"
            android:gravity="center_vertical"
            android:orientation="horizontal">

            <View
                android:layout_width="30dp"
                android:layout_height="30dp"
                android:background="@drawable/bg_circle_primary" />

            <View
                android:layout_width="match_parent"
                android:layout_height="@dimen/button_margin_vertical"
                android:layout_gravity="center_vertical"
                android:layout_marginEnd="50dp"
                android:layout_marginStart="8dp"
                android:background="@color/colorPrimary" />
        </LinearLayout>

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:layout_marginBottom="8dp"
            android:layout_marginStart="@dimen/button_margin_vertical"
            android:layout_marginTop="8dp"
            android:gravity="center_vertical"
            android:orientation="horizontal">

            <View
                android:layout_width="30dp"
                android:layout_height="30dp"
                android:background="@drawable/bg_circle_primary" />

            <View
                android:layout_width="match_parent"
                android:layout_height="@dimen/button_margin_vertical"
                android:layout_gravity="center_vertical"
                android:layout_marginEnd="50dp"
                android:layout_marginStart="8dp"
                android:background="@color/colorPrimary" />
        </LinearLayout>

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:layout_marginBottom="8dp"
            android:layout_marginStart="@dimen/button_margin_vertical"
            android:layout_marginTop="8dp"
            android:gravity="center_vertical"
            android:orientation="horizontal">

            <View
                android:layout_width="30dp"
                android:layout_height="30dp"
                android:background="@drawable/bg_circle_primary" />

            <View
                android:layout_width="match_parent"
                android:layout_height="@dimen/button_margin_vertical"
                android:layout_gravity="center_vertical"
                android:layout_marginEnd="50dp"
                android:layout_marginStart="8dp"
                android:background="@color/colorPrimary" />
        </LinearLayout>

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:layout_marginBottom="8dp"
            android:layout_marginStart="@dimen/button_margin_vertical"
            android:layout_marginTop="8dp"
            android:gravity="center_vertical"
            android:orientation="horizontal">

            <View
                android:layout_width="30dp"
                android:layout_height="30dp"
                android:background="@drawable/bg_circle_primary" />

            <View
                android:layout_width="match_parent"
                android:layout_height="@dimen/button_margin_vertical"
                android:layout_gravity="center_vertical"
                android:layout_marginEnd="50dp"
                android:layout_marginStart="8dp"
                android:background="@color/colorPrimary" />
        </LinearLayout>
    </LinearLayout>
</LinearLayout>
{% endhighlight %}

- `item_profile.xml`

{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:gravity="center_horizontal"
    android:orientation="vertical">

    <LinearLayout
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginBottom="@dimen/button_margin_vertical"
        android:background="@drawable/bg_circle_white"
        android:padding="3dp">

        <android.support.v7.widget.AppCompatImageView
            android:id="@+id/ivProfile"
            android:layout_width="140dp"
            android:layout_height="140dp"
            android:background="@drawable/bg_circle_primary"
            android:padding="3dp" />
    </LinearLayout>

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:gravity="center"
        android:weightSum="2">

        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_marginEnd="8dp"
            android:layout_weight="1"
            android:gravity="end">

            <View
                android:layout_width="80dp"
                android:layout_height="16dp"
                android:layout_marginTop="@dimen/button_margin_vertical"
                android:background="@color/colorPrimary" />
        </LinearLayout>

        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_marginStart="8dp"
            android:layout_weight="1">

            <View
                android:layout_width="80dp"
                android:layout_height="16dp"
                android:layout_marginTop="@dimen/button_margin_vertical"
                android:background="@color/colorPrimary" />
        </LinearLayout>
    </LinearLayout>

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="@dimen/button_margin_vertical"
        android:gravity="center_horizontal">

        <View
            android:layout_width="220dp"
            android:layout_height="@dimen/button_margin_vertical"
            android:layout_marginTop="@dimen/button_margin_vertical"
            android:background="@color/colorPrimary" />
    </LinearLayout>
</LinearLayout>
{% endhighlight %}

สามารถดูโค้ดแบบเต็ม ๆ ได้ที่ [CustomHamburgerMenu](https://github.com/prongbang/CustomHamburgerMenu)
