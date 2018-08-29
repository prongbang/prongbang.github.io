---
layout: post
title:  "[Android] จัดการ Build Environment บน Android ด้วย Product Flavors"
short_description: "การพัฒนาแอพส่วนใหญ่มักจะมีการแยก Environment สำหรับการทำงานหลาย ๆ แบบด้วยกัน เช่น Production, UAT, Development เป็นต้น และเนื่องจากทำให้เกิดความยุ่งยากในการเปลี่ยน Environment เราจึงจำเป็นต้องใช้ Product Flavors เข้ามาช่วยนั่นเอง"
date:   2018-08-29 21:33:00 +0700
categories: android
tags: [android]
cover_image: /assets/images/android/12.png
author: "end try"
---

### เริ่มกันเลยดีกว่า
<br>

จากความต้องการของเราคือ อยากให้ Product Flavors กำหนด Environment Production, UAT, Development บลา ๆ ให้เรา โดยท่ีเราแค่เลือก Build Variant ก็สามารถเปลี่ยน Environment ได้ง่าย ๆ แค่คลิก ๆ โดยเราสามารถมาเขียน Config ได้ที่ `build.gradle` 

{% highlight gradle %}
// Specifies one flavor dimension.
flavorDimensions "environment"
productFlavors {
    prod {
        dimension "environment"
        applicationId "com.prongbang.productflavors"
        manifestPlaceholders = [FabricKey: "6cc95ee8b50716891b4efd41f1a789c7ce9bf763"]
        buildConfigField "String", "ENV", '"prod"'
    }

    uat {
        dimension "environment"
        applicationId "com.prongbang.productflavors.uat"
        manifestPlaceholders = [FabricKey: "81589f3120e07093b08b02e9c13bd2d0856d5d87"]
        buildConfigField "String", "ENV", '"uat"'
    }

    dev {
        dimension "environment"
        applicationId "com.prongbang.productflavors.dev"
        manifestPlaceholders = [FabricKey: "81589f3120e07093b08b02e9c13bd2d0856d5d87"]
        buildConfigField "String", "ENV", '"dev"'
    }
}
{% endhighlight %}

### จากการ config ข้างบน เราแยกเป็น 3 environment คือ prod, uat และ dev โดยแต่จะ environment ประกอบไปด้วย 
<br>

- กำหนด flavor dimension ขึ้นอยู่กับเราว่าจะกำหนดเป็นอะไร ซึ่งในที่นี่เรากำหนดเป็น "environment"

{% highlight gradle %}
flavorDimensions "environment"
{% endhighlight %}

- กำหนด applicationId โดยกำหนดตาม environment 

{% highlight gradle %}
applicationId "com.prongbang.productflavors.environment"
{% endhighlight %}

- กำหนด manifestPlaceholders โดยกำหนดคีย์ชื่อ FabricKey เพื่อให้สามารถเรียกใช้งานใน AndroidManifest.xml ได้

{% highlight gradle %}
manifestPlaceholders = [FabricKey: "81589f3120e07093b08b02e9c13bd2d0856d5d87"]
{% endhighlight %}

วิธีเรียกใช้งาน FabricKey ใน AndroidManifest.xml

{% highlight gradle %}
<meta-data android:name="io.fabric.ApiKey" android:value="${FabricKey}" />
{% endhighlight %}

- กำหนดตัวแปร ENV ที่มีไว้เก็บข้อมูลชนิดข้อความ โดยเก็บค่าตาม environment เพื่อให้สามารถนำไปใช้งานต่อไป

{% highlight gradle %}
buildConfigField "String", "ENV", '"dev"'
{% endhighlight %}

โดยเอาไปใช้เช็ค url ตาม environment ประมาณนี้

{% highlight kotlin %}
import com.mypackage.BuildConfig

object EnvConfig {

    fun url(): String {
        return when (BuildConfig.ENV) {
            "prod" -> "http://localhost/prod/api/v1/"
            "uat" -> "http://localhost/uat/api/v1/"
            else -> "http://localhost/dev/api/v1/"
        }
    }

}
{% endhighlight %}

เวลาใช้งานก็จะประมาณนี้

{% highlight kotlin %}
val baseUrl = EnvConfig.url()
{% endhighlight %}

### วิธีเปลี่ยน environment เราก็แค่ไปเปลี่ยนที่ Build Variant ตาม environment ที่เราต้องการ ประมาณรูปนี้

<br>
<br>
<img src="/assets/images/android/12-1.png"/>
<br>
<br>

### ส่วนวิธี Build APK ก็เหมือนกัน ให้เลือกตาม environment ที่เราต้องการ ประมาณรูปนี้

<br>
<br>
<img src="/assets/images/android/12-2.png"/>
<br>
<br>

ต่อไปเราก็จะได้ไม่ต้องไปเปลี่ยน Config แบบ Manual อีกต่อไป 

<br>