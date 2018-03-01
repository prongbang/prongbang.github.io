---
layout: post
title:  "ติดตั้ง Flutter บนเครื่อง mac osx"
short_description: "Flutter คือ UI Framework ที่ใช้พัฒนาโมบายแอพพลิเคชั่น ที่อยู่ในหมวดของ Hybrid Native ที่สามารถเขียนทีเดียวแล้วได้ทั้ง IOS และ Android โดยใช้ภาษา Dart"
date:   2018-03-01 18:45:42 +0700
categories: flutter
cover_image: /assets/images/setup-flutter.png
author: "end try"
---
#### สิ่งที่เราจะต้องมี หรืออ่านวิธีติดตั้งเพิ่มเติมได้ที่ [https://flutter.io/setup-macos](https://flutter.io/setup-macos/)
- OS 
- Disk Space: 700 MB
- Tools: bash, mkdir, rm, git, curl, unzip, which

#### ติดตั้ง [Xcode](https://itunes.apple.com/us/app/xcode/id497799835)

#### ติดตั้ง [Android Studio](https://developer.android.com/studio/index.html)

#### ติดตั้ง [IntelliJ IDEA Community Edition](https://www.jetbrains.com/idea/download)

##### จากนั้นติดตั้ง plugins ชื่อ Flutter เพื่อใช้พัฒนาแอพพลิเคชั่น

#### ติดตั้ง [VS Code](https://code.visualstudio.com)

#### ต่อไปให้เราทำการ Clone Flutter มาลงที่เครื่องเราโดยใช้คำสั่งตามนี้

{% highlight bash %}
$ git clone -b beta https://github.com/flutter/flutter.git
$ export PATH=`pwd`/flutter/bin:$PATH
{% endhighlight %}

#### จากนั้นให้ใช้คำสั่งตามนี้เพื่อติดตั้ง Flutter
{% highlight bash %}
$ flutter doctor
{% endhighlight %}

#### เมื่อลงเสร็จแล้ว แล้วได้ประมาณนี้ แสดงว่าลงเสร็จเรียบร้อย
{% highlight bash %}
➜  ~ flutter doctor                     
Doctor summary (to see all details, run flutter doctor -v):
[✓] Flutter (Channel beta, v0.1.5, on Mac OS X 10.12.6 16G1036, locale en-TH)
[✓] Android toolchain - develop for Android devices (Android SDK 27.0.3)
[✓] iOS toolchain - develop for iOS devices (Xcode 9.1)
[✓] Android Studio (version 3.0)
[✓] IntelliJ IDEA Community Edition (version 2017.3.3)
[✓] VS Code (version 1.20.1)
[!] Connected devices
    ! No devices available

! Doctor found issues in 1 category.
➜  ~ 
{% endhighlight %}

*ในส่วนที่มันขึ้น [!] Connected devices นั่นก็เพราะว่าเราไม่ได้ต่อ device กับเครื่องคอมของเรานั่นเอง
