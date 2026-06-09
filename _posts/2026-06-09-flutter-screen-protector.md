---
layout: post
title: "[Flutter] การใช้งาน screen_protector ป้องกัน Screenshot และ App Switcher"
short_description: "แนะนำวิธีใช้งาน package screen_protector สำหรับช่วยป้องกันข้อมูลสำคัญบน Flutter ทั้ง Android และ iOS เช่น prevent screenshot, protect app switcher, ตรวจจับ screen recording และ listener สำหรับ screenshot บน iOS"
date: 2026-06-09 13:00:00 +0700
categories: [flutter]
tags: [flutter]
cover_image: /assets/images/flutter/10.png
author: "Devไปวันๆ"
---

### screen_protector คืออะไร

`screen_protector` เป็น Flutter plugin สำหรับช่วย **ลดความเสี่ยงข้อมูลสำคัญรั่วผ่านหน้าจอ** ทั้งบน Android และ iOS เช่น ป้องกัน screenshot, ซ่อนข้อมูลตอนเข้า app switcher และตรวจจับ screen recording

จากโค้ดของ package ตัว Dart API จะเรียก native ผ่าน `MethodChannel('screen_protector')` โดยฝั่ง Android ใช้ `WindowManager.LayoutParams.FLAG_SECURE` ส่วนฝั่ง iOS ใช้ `ScreenProtectorKit` เพื่อจัดการ screenshot protection, background protection และ observer ต่าง ๆ

ติดตั้งได้ด้วยคำสั่ง

{% highlight shell %}
flutter pub add screen_protector
{% endhighlight %}

จากนั้น import

{% highlight dart %}
import 'package:screen_protector/screen_protector.dart';
{% endhighlight %}

---

### ข้อควรรู้เรื่อง Version

ใน README มี note สำคัญว่า version `1.4.4` ถึง `1.4.13` อาจทำให้ crash บาง device ได้ แนะนำให้ใช้ `1.4.3` หรือต่ำกว่า หรือ upgrade เป็น `1.5.1` ขึ้นไป

จาก `pubspec.yaml` ปัจจุบัน package อยู่ที่ version `1.5.2` และรองรับ Dart SDK `>=2.12.0 <4.0.0` กับ Flutter `>=2.5.0`

---

### แนวคิดหลัก

* Android ใช้ `protectDataLeakageOn()` หรือ `preventScreenshotOn()` เพื่อเปิด `FLAG_SECURE`
* Android ใช้ `protectDataLeakageOff()` หรือ `preventScreenshotOff()` เพื่อ clear `FLAG_SECURE`
* iOS ใช้ `preventScreenshotOn()` / `preventScreenshotOff()` สำหรับ screenshot protection
* iOS ใช้ `protectDataLeakageWithBlur`, `protectDataLeakageWithImage` หรือ `protectDataLeakageWithColor` เพื่อซ่อนข้อมูลใน app switcher
* iOS มี `addListener` สำหรับรับ callback เมื่อ screenshot หรือ screen recording เปลี่ยนสถานะ
* iOS มี `isRecording()` สำหรับเช็กว่า screen กำลังถูก record อยู่หรือไม่

---

### Android: เปิด/ปิด Screenshot Protection

บน Android ตัว plugin จะ set flag ที่ window โดยตรง

{% highlight kotlin %}
activity?.window?.setFlags(
  WindowManager.LayoutParams.FLAG_SECURE,
  WindowManager.LayoutParams.FLAG_SECURE,
)
{% endhighlight %}

ดังนั้นสามารถใช้งานจาก Flutter ได้แบบนี้

{% highlight dart %}
@override
void initState() {
  super.initState();
  ScreenProtector.protectDataLeakageOn();
}

@override
void dispose() {
  ScreenProtector.protectDataLeakageOff();
  super.dispose();
}
{% endhighlight %}

หรือจะใช้ชื่อ method แบบ prevent screenshot ก็ได้ เพราะฝั่ง Android map ไป behavior เดียวกัน

{% highlight dart %}
await ScreenProtector.preventScreenshotOn();
await ScreenProtector.preventScreenshotOff();
{% endhighlight %}

---

### iOS: เปิด/ปิด Prevent Screenshot

บน iOS สามารถเปิด screenshot protection ได้ด้วย

{% highlight dart %}
@override
void initState() {
  super.initState();
  ScreenProtector.preventScreenshotOn();
}

@override
void dispose() {
  ScreenProtector.preventScreenshotOff();
  super.dispose();
}
{% endhighlight %}

ใน native code ฝั่ง iOS เมื่อเรียก `preventScreenshotOn` จะไปเปิด `ScreenProtectorKit.enabledPreventScreenshot()` และเก็บ state ไว้ใน `isPreventScreenshotEnabled`

---

### iOS: Protect App Switcher ด้วย Blur

ถ้าต้องการซ่อนข้อมูลตอนแอปเข้า background หรือถูกแสดงใน app switcher สามารถใช้ blur ได้

{% highlight dart %}
@override
void initState() {
  super.initState();
  ScreenProtector.protectDataLeakageWithBlur();
}

@override
void dispose() {
  ScreenProtector.protectDataLeakageWithBlurOff();
  super.dispose();
}
{% endhighlight %}

จาก source ฝั่ง iOS ตัว plugin จะจำ `protectMode` ไว้ และเมื่อ `applicationWillResignActive` จะ apply protection ส่วนเมื่อ `applicationDidBecomeActive` จะ clear overlay ออก

---

### iOS: Protect App Switcher ด้วยรูปภาพ

ถ้าต้องการให้ app switcher แสดงรูปภาพแทนหน้าจอจริง เช่น `LaunchImage` สามารถเรียก

{% highlight dart %}
await ScreenProtector.protectDataLeakageWithImage('LaunchImage');
{% endhighlight %}

และปิดได้ด้วย

{% highlight dart %}
await ScreenProtector.protectDataLeakageWithImageOff();
{% endhighlight %}

ชื่อรูปที่ส่งเข้าไปควรเป็น asset ฝั่ง iOS เช่น image set ใน `Assets.xcassets`

---

### iOS: Protect App Switcher ด้วยสีพื้น

ถ้าต้องการใช้สีพื้นแทน blur หรือ image สามารถส่ง `Color` จาก Flutter ได้

{% highlight dart %}
await ScreenProtector.protectDataLeakageWithColor(Colors.white);
{% endhighlight %}

และปิดได้ด้วย

{% highlight dart %}
await ScreenProtector.protectDataLeakageWithColorOff();
{% endhighlight %}

จาก source ฝั่ง Dart จะ convert `Color` เป็น hex ด้วย extension `toHex()` แล้วส่งไปที่ native ผ่าน key `hexColor`

---

### ปิด Data Leakage Protection ทั้งหมด

ถ้าต้องการปิด mode ที่ตั้งไว้ ให้เรียก

{% highlight dart %}
await ScreenProtector.protectDataLeakageOff();
{% endhighlight %}

บน iOS method นี้จะ set `protectMode` เป็น `.none` และ clear blur, image, color overlay ทั้งหมด ส่วนบน Android จะ clear `FLAG_SECURE`

---

### iOS: Listener สำหรับ Screenshot และ Screen Recording

`addListener` รองรับเฉพาะ iOS โดยฝั่ง Dart จะตั้ง `MethodCallHandler` เพื่อรับ callback จาก native

{% highlight dart %}
ScreenProtector.addListener(() {
  debugPrint('Screenshot');
}, (isRecording) {
  debugPrint('Screen recording: $isRecording');
});
{% endhighlight %}

ถ้าไม่ใช้งานแล้วให้ remove listener

{% highlight dart %}
ScreenProtector.removeListener();
{% endhighlight %}

ใน native code ฝั่ง iOS จะเรียกกลับมาที่ Dart ด้วย method `onScreenshot` และ `onScreenRecord`

---

### iOS: เช็กว่า Screen กำลังถูก Record อยู่หรือไม่

สามารถเช็กสถานะปัจจุบันได้ด้วย

{% highlight dart %}
final isRecording = await ScreenProtector.isRecording();

if (isRecording) {
  debugPrint('Screen Recording...');
}
{% endhighlight %}

บน Android method นี้ยังไม่รองรับ และ native จะ return `false`

---

### ตัวอย่างใช้งานแยกตาม Platform

จาก example ของ package จะเช็ก platform ก่อนเลือก method ที่เหมาะสม

{% highlight dart %}
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:screen_protector/screen_protector.dart';

class SecurePage extends StatefulWidget {
  const SecurePage({super.key});

  @override
  State<SecurePage> createState() => _SecurePageState();
}

class _SecurePageState extends State<SecurePage> {
  @override
  void initState() {
    super.initState();
    _protect();
  }

  @override
  void dispose() {
    ScreenProtector.protectDataLeakageOff();
    ScreenProtector.preventScreenshotOff();
    ScreenProtector.removeListener();
    super.dispose();
  }

  Future<void> _protect() async {
    if (Platform.isAndroid) {
      await ScreenProtector.protectDataLeakageOn();
    } else if (Platform.isIOS) {
      await ScreenProtector.preventScreenshotOn();
      await ScreenProtector.protectDataLeakageWithBlur();

      ScreenProtector.addListener(() {
        debugPrint('Screenshot');
      }, (isRecording) {
        debugPrint('Screen recording: $isRecording');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Text('Secure Screen'),
      ),
    );
  }
}
{% endhighlight %}

---

### Android 12+ Optional

ใน README มี note เพิ่มเติมสำหรับ Android 12+ ว่าสามารถใช้ library ฝั่ง native เพิ่มเติมได้ที่ `prongbang/screen-protector`

ตัวอย่างใน README

{% highlight kotlin %}
import com.prongbang.screenprotect.AndroidScreenProtector

class MainActivity : FlutterFragmentActivity() {

  private val screenProtector by lazy {
    AndroidScreenProtector.newInstance(this)
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    screenProtector.process(hasFocus.not())
  }
}
{% endhighlight %}

ส่วน example ปัจจุบันของ package นี้ยังเป็น `FlutterActivity` ปกติ ดังนั้นส่วน Android 12+ นี้ถือเป็น optional เฉพาะกรณีที่ต้องการ protection เพิ่มเติมตาม README

---

### Lifecycle Helper

ใน package มี `LifecycleState` และ `LegacyLifecycleState` สำหรับช่วยจัดการ app lifecycle ด้วย `WidgetsBindingObserver`

`LifecycleState` จะ map state ใหม่ของ Flutter เช่น `resumed`, `inactive`, `hidden`, `paused`, `detached` และมี callback เช่น

* `onResumed`
* `onInactive`
* `onHidden`
* `onPaused`
* `onDetached`
* `onRestart`
* `onShow`
* `onExitRequested`

ถ้าในแอปต้องเปิด protection ตอนเข้า secure page และปิดตอนออกจาก page การใช้ lifecycle ให้ถูกจะช่วยลดโอกาสเปิด flag ค้างไว้บนหน้าจอที่ไม่ต้องการ

---

### เหมาะกับงานแบบไหน

* แอป Flutter ที่มีข้อมูลการเงิน, token, QR code หรือข้อมูลส่วนตัว
* หน้าจอที่ไม่อยากให้ถูก screenshot บน Android
* หน้าจอ iOS ที่ต้องการซ่อนข้อมูลใน app switcher ด้วย blur, image หรือ color
* แอปที่ต้อง detect screenshot หรือ screen recording บน iOS
* แอปที่ต้องเปิด protection เฉพาะบางหน้าแล้วปิดเมื่อออกจากหน้านั้น

---

### ข้อควรรู้

* Android ใช้ `FLAG_SECURE` ซึ่งมีผลกับทั้ง screenshot และ app switcher preview
* iOS แยก concept ระหว่าง prevent screenshot และ protect data leakage ตอนเข้า background
* `addListener` และ `isRecording` ใช้งานจริงเฉพาะ iOS ส่วน Android จะไม่ทำอะไรหรือ return `false`
* ควรปิด protection ใน `dispose` ถ้าเปิดเฉพาะบางหน้า ไม่อย่างนั้นอาจมีผลกับหน้าถัดไป
* สำหรับ iOS image protection ต้องเตรียม asset name ให้ถูก เช่น `LaunchImage`
* version `1.4.4` ถึง `1.4.13` มี warning เรื่อง crash ควรเลี่ยงตาม README

---

### สรุป

`screen_protector` เป็น package ที่ช่วยให้ Flutter app จัดการเรื่องหน้าจอ sensitive ได้ง่ายขึ้น โดย Android ใช้ `FLAG_SECURE` ส่วน iOS ใช้ `ScreenProtectorKit` เพื่อจัดการ screenshot protection, app switcher overlay และ screen recording listener

ถ้าแอปมีหน้าจอที่ไม่ควรถูก capture หรือไม่ควรแสดงข้อมูลใน app switcher package นี้ช่วยลดงาน native bridge ไปได้เยอะ และ API ฝั่ง Flutter ก็เรียกใช้งานได้ตรงไปตรงมามาก

สามารถอ่านรายละเอียดเพิ่มเติมได้ที่ [github.com/prongbang/screen_protector](https://github.com/prongbang/screen_protector) ครับ
