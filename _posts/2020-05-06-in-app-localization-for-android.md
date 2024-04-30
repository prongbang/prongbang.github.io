---
layout: post
title:  "[Android] เขียนแอพ Android ให้รองรับการเปลี่ยนภาษาภายในแอพ (Multiple Language Support in Android)"
short_description: "สอนใช้ Multiple Language Library แทนการเขียนโค้ดจัดการการเปลี่ยนภาษาหลาย ๆ ภาษาเอง"
date:   2020-05-06 19:00:00 +0700
categories: [android]
tags: [android]
cover_image: /assets/images/android/16.png
author: "Devไปวันๆ"
---

### เริ่มจากเพิ่ม dependencies ที่เราต้องใช้ก่อนตามนี้

- project/build.gradle

{% highlight gradle %}
allprojects {
    repositories {
        maven { url 'https://jitpack.io' }
    }
}
{% endhighlight %}

- project/app/build.gradle

{% highlight gradle %}
dependencies {
    implementation 'com.github.prongbang:localization:2.1.0'
}
{% endhighlight %}

จากนั้นสั่งรันก็กด Sync ไปหนึ่งที แล้วก็รอจนกว่าจะเสร็จ
<br>
<br>

### สร้างไฟล์สำหรับ Application

- MainApplication.kt

{% highlight kotlin %}
import com.prongbang.localization.LocalizationApplication

class MainApplication : LocalizationApplication()
{% endhighlight %}

### วิธีใช้ก็แค่ให้ Activity สืบทอดคลาส LocalizationAppCompatActivity ประมาณนี้

- MainActivity.kt

{% highlight kotlin %}
import com.prongbang.localization.LocalizationAppCompatActivity

class MainActivity : LocalizationAppCompatActivity() {

}
{% endhighlight %}

### ตอนที่เปลี่ยนภาษาก็แค่เรียกใช้ประมาณนี้

- SettingActivity.kt

{% highlight kotlin %}
import com.prongbang.localization.THAI
import com.prongbang.localization.ENGLISH
import com.prongbang.localization.Localize
import com.prongbang.localization.LocalizationAppCompatActivity

class SettingActivity : LocalizationAppCompatActivity() {

	override fun onCreate(savedInstanceState: Bundle?) {
		tvThai.setOnClickListener { 
			setLocale(Localize.THAI) 
		}
		tvEnglish.setOnClickListener { 
			setLocale(Localize.ENGLISH) 
		}
	}

	override fun onConfigurationChanged(newConfig: Configuration) {
		openPrepareLocalize() // used only in setting activity
		super.onConfigurationChanged(newConfig)
	}

}
{% endhighlight %}

ถ้าอยากจะให้ขึ้นหน้า Loading ตอนที่เปลี่ยนภาษาก็แค่เรียกใช้ `openPrepareLocalize()` หรือจะ Custom เองก็ได้ ประมาณนี้

{% highlight kotlin %}
override fun onConfigurationChanged(newConfig: Configuration) {
    openPrepareLocalize() // used only in setting activity
    super.onConfigurationChanged(newConfig)
}
{% endhighlight %}

### สร้าง String Resources

- `values/strings.xml` สำหรับ `en` (English)

{% highlight xml %}
<resources>
	<string name="hello_world">Hello World!</string>
	<string name="language_english">English</string>
	<string name="language_thai">Thai</string>
	<string name="select_language">SELECT LANGUAGE</string>
</resources>
{% endhighlight %}

- `values-th/strings.xml` สำหรับ `th` (ภาษาไทย)

{% highlight xml %}
<resources>
	<string name="hello_world">สวัสดีชาวโลก!</string>
	<string name="language_english">อังกฤษ</string>
	<string name="language_thai">ไทย</string>
	<string name="select_language">เลือกภาษา</string>
</resources>
{% endhighlight %}

### ในไฟล์ XML ก็เรียกใช้ @string/hello_world ตามชื่อปกติไม่ต้องทำอะไรประมาณนี้

{% highlight xml %}
<androidx.appcompat.widget.AppCompatTextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@string/hello_world" />
{% endhighlight %}

การใช้งานก็ประมาณนี้สามารถเข้ามาอ่านเพิ่มเติมได้ที่นี่ [Localization Library for Android](https://raboninco.com/XBxt) ถ้ามี Bug หรืออยาก improve อะไร merge request มาได้นะครับ
<br>
<br>