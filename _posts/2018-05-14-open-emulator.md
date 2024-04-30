---
layout: post
title:  "[Android] Run Emulator ผ่าน Terminal (MacOS)"
short_description: "มาดูกันว่าต้องทำยังไงถึงจะเปิด Emulator มาใช้งานได้โดยไม่ต้องเปิดผ่าน Android Studio"
date:   2018-05-14 23:04:22 +0700
categories: android
tags: [android]
cover_image: /assets/images/android/2.png
author: "Devไปวันๆ"
---

### ก่อนอื่นให้เปิด Terminal เข้าไปตาม directory นี้
{% highlight bash %}
cd ~/Library/Android/sdk/tools
{% endhighlight %}

<br>
### ดูว่ามีตัว Emulator อะไรบ้างที่ใช้งานได้
{% highlight bash %}
emulator -list-avds 
{% endhighlight %}

ตัวอย่างผลลัพธ์ที่ได้
{% highlight bash %}
Nexus_5X_API_24
Nexus_6P_API_26
Nexus_9_API_26
{% endhighlight %}

<br>
### รันตัว Emulator ที่เราต้องการ
{% highlight bash %}
emulator -avd {AVD_NAME}
{% endhighlight %}

**โดย {AVD_NAME} คือ ชื่อ emulator เช่น `Nexus_5X_API_24` ถ้าเอาชื่อ emulator มาแทนค่าก็จะได้ประมาณนี้
{% highlight bash %}
emulator -avd Nexus_6P_API_26
{% endhighlight %}