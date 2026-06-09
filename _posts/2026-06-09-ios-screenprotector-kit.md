---
layout: post
title: "[iOS] การใช้งาน ScreenProtectorKit ป้องกันข้อมูลสำคัญบนหน้าจอ"
short_description: "แนะนำวิธีใช้งาน ScreenProtectorKit สำหรับช่วยป้องกันข้อมูลสำคัญบน iOS ทั้งการตรวจจับ screenshot, screen recording และการซ่อนข้อมูลใน app switcher ด้วย blur, image หรือ color overlay"
date: 2026-06-09 12:00:00 +0700
categories: [ios]
tags: [ios]
cover_image: /assets/images/ios/02.png
author: "Devไปวันๆ"
---

### ScreenProtectorKit คืออะไร

ScreenProtectorKit เป็นไลบรารีสำหรับ iOS ที่ช่วย **ลดความเสี่ยงข้อมูลสำคัญรั่วผ่านหน้าจอ** เช่น เมื่อผู้ใช้พยายาม screenshot, เปิด screen recording หรือสลับแอปแล้วข้อมูลใน app switcher ยังแสดงอยู่

จากโค้ดของไลบรารี ตัว `ScreenProtectorKit` จะเป็น wrapper ที่เรียกใช้งาน `ScreenPreventerKit.xcframework` อีกที โดยมี API หลักสำหรับเปิด/ปิด screenshot protection, screen recording protection, background protection และ observer ต่าง ๆ

ติดตั้งได้ 2 วิธีหลัก ๆ คือ CocoaPods และ Swift Package Manager

---

### ติดตั้งด้วย CocoaPods

เพิ่มใน `Podfile`

{% highlight ruby %}
pod 'ScreenProtectorKit'
{% endhighlight %}

จากนั้นรัน

{% highlight shell %}
pod install
{% endhighlight %}

---

### ติดตั้งด้วย Swift Package Manager

เพิ่ม package URL นี้ใน Xcode

{% highlight text %}
https://github.com/prongbang/ScreenProtectorKit.git
{% endhighlight %}

หรือเพิ่มใน `Package.swift`

{% highlight swift %}
dependencies: [
  .package(
    url: "https://github.com/prongbang/ScreenProtectorKit.git",
    from: "1.5.1"
  ),
]
{% endhighlight %}

จาก `Package.swift` ของโปรเจกต์นี้ ตัว package target อยู่ที่ iOS 12 ขึ้นไป และใช้ binary target ชื่อ `ScreenPreventerKit.xcframework`

---

### แนวคิดหลัก

* สร้าง `ScreenProtectorKit` โดยส่ง `UIWindow` เข้าไป
* เปิด screenshot protection ด้วย `enabledPreventScreenshot()`
* ปิด screenshot protection ด้วย `disablePreventScreenshot()`
* ใช้ blur, image หรือ color overlay เพื่อซ่อนข้อมูลตอนแอปเข้า background
* ตรวจจับ screenshot ด้วย `screenshotObserver`
* ตรวจจับ screen recording ด้วย `screenRecordObserver`
* เช็กสถานะ screen recording ปัจจุบันด้วย `screenIsRecording()`
* เรียก `removeAllObserver()` หรือ remove observer เฉพาะตัวเมื่อไม่ใช้แล้ว

---

### สร้าง Instance ใน AppDelegate

ตัวอย่างการสร้าง instance แบบพื้นฐาน

{% highlight swift %}
import UIKit
import ScreenProtectorKit

class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  private lazy var screenProtectorKit = {
    return ScreenProtectorKit(window: window)
  }()
}
{% endhighlight %}

จุดสำคัญคือ README ของโปรเจกต์แนะนำว่า **ไม่ควร attach หรือ manipulate UIKit views/layers เองเพื่อทำ screenshot protection** เพราะอาจชนกับ layout ของ `CALayer` และทำให้ crash ได้ ควรใช้ API ของตัว kit หรือ overlay/window แยกตามที่ไลบรารีจัดการให้

---

### เปิด/ปิด Screenshot Protection

เมื่อแอปกลับมา active ให้เปิดการป้องกัน screenshot และเมื่อแอปกำลังจะ resign active ให้ปิดหรือตั้งค่า protection ตาม flow ของแอป

{% highlight swift %}
func applicationDidBecomeActive(_ application: UIApplication) {
  screenProtectorKit.enabledPreventScreenshot()
}

func applicationWillResignActive(_ application: UIApplication) {
  screenProtectorKit.disablePreventScreenshot()
}
{% endhighlight %}

ใน source code มีทั้ง `enabledPreventScreenshot()` และ `enablePreventScreenshot()` โดยทั้งสองตัวจะเรียกไปที่ `screenPreventer` และมีการเรียก workaround สำหรับ iOS 16 ผ่าน `preventIOS16Crash()` ด้วย

ถ้าต้องการกำหนดข้อความหรือรูปภาพสำหรับ protection screen สามารถใช้ overload นี้ได้

{% highlight swift %}
screenProtectorKit.enabledPreventScreenshot(
  text: "Protected",
  image: "LaunchImage"
)
{% endhighlight %}

---

### ป้องกันข้อมูลใน App Switcher ด้วย Blur

กรณีที่แอปเข้า background หรือกำลังจะถูกแสดงใน app switcher เราสามารถแสดง blur overlay เพื่อไม่ให้ข้อมูลสำคัญถูก snapshot ไปแสดงได้

{% highlight swift %}
func applicationDidBecomeActive(_ application: UIApplication) {
  screenProtectorKit.disableBlurScreen()
}

func applicationWillResignActive(_ application: UIApplication) {
  screenProtectorKit.enabledBlurScreen()
}
{% endhighlight %}

ใน source มี method `enabledBlurScreen(style:)` ด้วย แต่ implementation ปัจจุบันส่ง `UIBlurEffect.Style.light` ต่อเข้าไป ดังนั้นถ้าใช้งานทั่วไปเริ่มจาก `enabledBlurScreen()` จะตรงที่สุด

---

### ป้องกันด้วยรูปภาพ

ถ้าอยากให้ app switcher แสดงรูปที่เรากำหนด เช่น launch image หรือภาพ placeholder สามารถใช้ `enabledImageScreen(named:)`

{% highlight swift %}
func applicationDidBecomeActive(_ application: UIApplication) {
  screenProtectorKit.disableImageScreen()
}

func applicationWillResignActive(_ application: UIApplication) {
  screenProtectorKit.enabledImageScreen(named: "LaunchImage")
}
{% endhighlight %}

---

### ป้องกันด้วยสีพื้น

ถ้าไม่ต้องการใช้ blur หรือรูปภาพ สามารถใช้สีพื้นแทนได้

{% highlight swift %}
func applicationDidBecomeActive(_ application: UIApplication) {
  screenProtectorKit.disableColorScreen()
}

func applicationWillResignActive(_ application: UIApplication) {
  screenProtectorKit.enabledColorScreen(hexColor: "#ffffff")
}
{% endhighlight %}

ใน source มี `UIColor` extension สำหรับรับค่า hex string แล้วแปลงเป็นสีให้ใช้งานกับ background protection

---

### ตรวจจับ Screenshot

ถ้าต้องการรับ callback เมื่อผู้ใช้ screenshot สามารถใช้ `screenshotObserver`

{% highlight swift %}
screenProtectorKit.screenshotObserver {
  // Callback when screenshot was taken
}
{% endhighlight %}

ถ้าไม่ใช้แล้วสามารถ remove observer ได้

{% highlight swift %}
screenProtectorKit.removeScreenshotObserver()
{% endhighlight %}

ข้อควรรู้คือบน iOS การ screenshot มักเป็นการ detect หลังเกิด event แล้ว ไม่ใช่การ block การ screenshot ได้สมบูรณ์ทุกกรณี ดังนั้นควรออกแบบ UX ให้เหมาะกับข้อมูลสำคัญ เช่น แจ้งเตือน, hide ข้อมูล หรือ invalidate session ตาม policy ของแอป

---

### ตรวจจับ Screen Recording

สำหรับ iOS 11 ขึ้นไป สามารถเช็กได้ว่าตอนนี้หน้าจอกำลังถูก record อยู่หรือไม่

{% highlight swift %}
if screenProtectorKit.screenIsRecording() {
  // Handle screen recording
}
{% endhighlight %}

หรือ subscribe เป็น observer

{% highlight swift %}
screenProtectorKit.screenRecordObserver { isRecording in
  if isRecording {
    // Show warning or hide sensitive content
  }
}
{% endhighlight %}

ถ้าต้องการป้องกัน screen recording แบบใช้ protection screen สามารถเรียก

{% highlight swift %}
screenProtectorKit.enabledPreventScreenRecording()
{% endhighlight %}

หรือกำหนดข้อความและรูปภาพ

{% highlight swift %}
screenProtectorKit.enabledPreventScreenRecording(
  text: "Protected",
  image: "LaunchImage"
)
{% endhighlight %}

และปิดได้ด้วย

{% highlight swift %}
screenProtectorKit.disablePreventScreenRecording()
{% endhighlight %}

---

### ลบ Observer

ถ้าเพิ่ม observer ไว้ ควรลบเมื่อไม่ใช้งานแล้ว

{% highlight swift %}
screenProtectorKit.removeScreenRecordObserver()
screenProtectorKit.removeScreenshotObserver()
screenProtectorKit.removeAllObserver()
{% endhighlight %}

หรือถ้ามี observer เฉพาะตัว สามารถส่งเข้า `removeObserver(observer:)` ได้

{% highlight swift %}
screenProtectorKit.removeObserver(observer: observer)
{% endhighlight %}

---

### ตัวอย่าง Flow แบบใช้งานจริง

ตัวอย่างนี้ใช้ blur เพื่อป้องกัน app switcher และเปิด screenshot protection ตอนแอป active

{% highlight swift %}
import UIKit
import ScreenProtectorKit

class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  private lazy var screenProtectorKit = {
    return ScreenProtectorKit(window: window)
  }()

  func applicationDidBecomeActive(_ application: UIApplication) {
    screenProtectorKit.disableBlurScreen()
    screenProtectorKit.enabledPreventScreenshot()

    if screenProtectorKit.screenIsRecording() {
      showRecordingWarning()
    }
  }

  func applicationWillResignActive(_ application: UIApplication) {
    screenProtectorKit.enabledBlurScreen()
    screenProtectorKit.disablePreventScreenshot()
  }

  private func showRecordingWarning() {
    // Show alert or hide sensitive data
  }
}
{% endhighlight %}

---

### เหมาะกับงานแบบไหน

* แอปธนาคารหรือ wallet ที่มีข้อมูลบัญชี
* แอปสุขภาพที่มีข้อมูลส่วนตัว
* แอปองค์กรที่มีข้อมูลภายใน
* หน้าจอ profile, transaction, QR code หรือ token
* แอปที่ต้องซ่อนข้อมูลตอนเข้า app switcher
* แอปที่ต้อง detect screen recording เพื่อแจ้งเตือนหรือซ่อนข้อมูล

---

### ข้อควรรู้

* Screenshot prevention บน iOS ควรมองเป็นการช่วยป้องกันและ detect ไม่ใช่ guarantee ว่าจะ block ได้สมบูรณ์ทุกสถานการณ์
* Background protection ช่วยลดโอกาสข้อมูลรั่วผ่าน app switcher snapshot
* Screen recording detection บอกสถานะว่ากำลัง record อยู่หรือไม่ แต่ UX หลังจากนั้นต้องออกแบบเอง
* ควรทดสอบบน iOS หลาย version และหลาย device เพราะ behavior ของระบบอาจต่างกัน
* หลีกเลี่ยงการ manipulate view/layer เองเพื่อทำ screenshot protection เพราะ README ระบุว่าอาจทำให้ crash บางเครื่องได้

---

### สรุป

ScreenProtectorKit เป็นไลบรารีที่ช่วยจัดการเรื่องหน้าจอ sensitive บน iOS ได้ง่ายขึ้น ทั้ง screenshot protection, screen recording detection และการซ่อนข้อมูลใน app switcher ด้วย blur, image หรือ color overlay

ถ้าแอปมีข้อมูลสำคัญที่ไม่ควรปรากฏใน screenshot, recording หรือ app switcher การเพิ่ม ScreenProtectorKit เข้าไปจะช่วยลด boilerplate และทำให้จัดการ flow เหล่านี้ได้เป็นระบบมากขึ้น

สามารถอ่านรายละเอียดเพิ่มเติมได้ที่ [github.com/prongbang/ScreenProtectorKit](https://github.com/prongbang/ScreenProtectorKit) ครับ
