---
layout: post
title:  "[Android] อยากเขียนแอพ Android เพื่อใช้งานจริงต้องรู้อะไรบ้าง"
short_description: "ไม่ยากอย่างที่ใครบอกไว้ เพียงแค่ค่อย ๆ ศึกษากันไป"
date:   2018-05-22 21:51:43 +0700
categories: android
tags: [android]
cover_image: /assets/images/android/5.png
author: "Devไปวันๆ"
---

### พื้นฐานที่เราต้องรู้
- ภาษา [Java](https://www.udacity.com/learn/java) หรือ [Kotlin](https://www.udacity.com/course/ud9011)
- [Activity Lifecycle](http://www.akexorcist.com/2016/04/why-do-we-need-to-know-about-activity-life-cycle-th.html) 
- [Fragment Lifecycle](http://www.akexorcist.com/2014/11/lets-fragment-lifecycle.html)

### Design Pattern
- MVC
- MVP
- MVVM

สามาถอ่านความหมายของแต่ละ Design Pattern เพิ่มเติมได้[ที่นี่](https://medium.com/@leelorz6/mvc-mvp-mvvm-%E0%B8%84%E0%B8%B7%E0%B8%AD%E0%B8%AD%E0%B8%B0%E0%B9%84%E0%B8%A3-%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%95%E0%B9%88%E0%B8%B2%E0%B8%87%E0%B8%81%E0%B8%B1%E0%B8%99%E0%B8%AD%E0%B8%A2%E0%B9%88%E0%B8%B2%E0%B8%87%E0%B9%84%E0%B8%A3-ca16a19631dc)

<br>
### Architecture เค้าว่ากันว่าตัวนี้เกิดมาเพื่อให้ developer เขียนโค้ดไปในทิศทางเดียวกัน
- [Android Architecture Components](https://developer.android.com/topic/libraries/architecture)

### Library ยอดนิยม
- [Retrofit](http://square.github.io/retrofit/) คือ HTTP client ที่ใช้ติดต่อรับส่งข้อมูลกับ API
- [Glide](https://github.com/bumptech/glide) เอาไว้โหลดรูปมาแสดงในแอพ
- [Data Binding](https://developer.android.com/topic/libraries/data-binding/) เอา Binding View โดยไม่ต้องเขียน `findViewById` 
- [Dexter](https://github.com/Karumi/Dexter) เป็นไลบรารีที่ช่วยลดขั้นตอนการขอสิทธิ์ในการรันไทม์ 
- [Dagger2](https://github.com/google/dagger) เอามาจัดการ Dependency Injection
- Etc.

เด๊ยวจะต้องศึกษาเยอะเกินไปเอาเท่านี้ก่อน