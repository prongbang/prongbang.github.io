---
layout: post
title: "[Flutter] การใช้งาน lazysecret เข้ารหัสด้วย libsodium SecretBox"
short_description: "แนะนำ prongbang/lazysecret Flutter plugin สำหรับใช้ libsodium secret_box, key exchange, random nonce, hex converter และรองรับ Android, iOS, Web"
date: 2026-06-11 14:00:00 +0700
categories: [flutter]
tags: [flutter]
cover_image: /assets/images/flutter/11.png
author: "Devไปวันๆ"
---

ถ้าต้องเข้ารหัสข้อความใน Flutter แบบให้ใช้ได้ทั้ง Android, iOS และ Web สิ่งที่มักจะเจอคือแต่ละ platform มีวิธีเรียก native crypto ไม่เหมือนกัน และถ้าจะใช้ libsodium ก็ต้องจัดการ binding เพิ่มอีกชั้น

`lazysecret` เป็น Flutter plugin ที่ห่อการใช้งาน libsodium `secret_box` ให้เรียกจาก Dart ได้ง่ายขึ้น โดยมี API สำหรับสร้าง key pair, ทำ shared key, สุ่ม nonce, แปลง hex/bin และ encrypt/decrypt ข้อความ

Repository: [github.com/prongbang/lazysecret](https://github.com/prongbang/lazysecret)

## lazysecret คืออะไร

จาก README และโค้ดปัจจุบัน `lazysecret` เป็น Flutter plugin ที่ใช้ libsodium secret-key cryptography ผ่าน `secret_box`

ฝั่ง platform ที่รองรับใน `pubspec.yaml`

- Android: ใช้ `MethodChannel` ไปหา Kotlin plugin
- iOS: ใช้ Flutter plugin ฝั่ง Swift และเวอร์ชัน `1.0.6` migrate ไป Swift Package Manager แล้ว
- Web: ใช้ `lazysecret_web.dart` เรียก `sodium.js` ผ่าน JS interop

ใน `pubspec.yaml` เวอร์ชันปัจจุบันเป็น `1.0.6`

{% highlight yaml %}
name: lazysecret
description: Lazysecret is a comprehensive Flutter implementation of the libsodium using secret_box library.
version: 1.0.6

environment:
  sdk: '>=2.19.0 <4.0.0'
  flutter: ">=3.3.0"
{% endhighlight %}

## ติดตั้ง

เพิ่ม dependency ใน `pubspec.yaml`

{% highlight yaml %}
dependencies:
  lazysecret: ^1.0.6
{% endhighlight %}

แล้วเรียก

{% highlight shell %}
flutter pub get
{% endhighlight %}

## เริ่มใช้งาน

API หลักอยู่ที่ singleton `LazySecret.instance`

{% highlight dart %}
import 'package:lazysecret/lazysecret.dart';

final lazysecret = LazySecret.instance;
{% endhighlight %}

ถ้าใช้งานบน Web README แนะนำให้เรียก `LazySecret.init()` ก่อน `runApp`

{% highlight dart %}
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await LazySecret.init();

  runApp(const MyApp());
}
{% endhighlight %}

จากโค้ดใน `lib/lazysecret.dart` ตัว `init` เป็น delay สั้น ๆ เพื่อรอให้ environment พร้อม โดยเฉพาะฝั่ง Web ที่ต้องโหลด `sodium.js`

{% highlight dart %}
static init({Duration? duration}) async {
  await Future.delayed(duration ?? const Duration(seconds: 1));
}
{% endhighlight %}

## API ที่มีให้

จาก abstract class `LazySecret` มี function หลักประมาณนี้

{% highlight dart %}
Future<Uint8List> randomBytesBuf(int size)

Future<String> toHex(Uint8List bytes)

Future<Uint8List> toBin(String hexString)

Future<String> cryptoBoxBeforeNm(KeyPair keyPair)

Future<String> cryptoSecretBoxEasy(
  String plaintext,
  String nonce,
  String key,
)

Future<String> cryptoSecretBoxOpenEasy(
  String ciphertext,
  String nonce,
  String key,
)

Future<KeyPair> cryptoKxKeyPair()

Future<int> cryptoSecretBoxKeyBytes()

Future<int> cryptoSecretBoxNonceBytes()

Future<int> cryptoSecretBoxMacBytes()
{% endhighlight %}

ชื่อ function จะใกล้กับ libsodium มาก เช่น `crypto_secretbox_easy`, `crypto_secretbox_open_easy`, `crypto_kx_keypair`

## ดูขนาด Key, Nonce และ MAC

ก่อน encrypt ควรถามขนาดจาก platform แทนการ hardcode

{% highlight dart %}
final keySize = await lazysecret.cryptoSecretBoxKeyBytes();
final nonceSize = await lazysecret.cryptoSecretBoxNonceBytes();
final macSize = await lazysecret.cryptoSecretBoxMacBytes();

print('key[$keySize]');
print('nonce[$nonceSize]');
print('mac[$macSize]');
{% endhighlight %}

Android implementation คืนค่าจาก `SecretBox.KEYBYTES`, `SecretBox.NONCEBYTES`, `SecretBox.MACBYTES`

{% highlight kotlin %}
if (call.method == SECRET_BOX_KEY_BYTES_METHOD) {
    result.success(SecretBox.KEYBYTES)
} else if (call.method == SECRET_BOX_NONCE_BYTES_METHOD) {
    result.success(SecretBox.NONCEBYTES)
} else if (call.method == SECRET_BOX_MAC_BYTES_METHOD) {
    result.success(SecretBox.MACBYTES)
}
{% endhighlight %}

ฝั่ง iOS ก็คืนค่าจาก `sodium.secretBox`

{% highlight swift %}
public func cryptoSecretBoxMacBytes() -> Int {
    return sodium.secretBox.MacBytes
}

public func cryptoSecretBoxNonceBytes() -> Int {
    return sodium.secretBox.NonceBytes
}

public func cryptoSecretBoxKeyBytes() -> Int {
    return sodium.secretBox.KeyBytes
}
{% endhighlight %}

## สุ่ม Nonce แล้วแปลงเป็น Hex

ตัวอย่างใน `example/lib/main.dart` เริ่มจากถาม nonce size แล้วสุ่ม bytes

{% highlight dart %}
final nonceSize = await lazysecret.cryptoSecretBoxNonceBytes();

final nonceByte = await lazysecret.randomBytesBuf(nonceSize);
final nonce = await lazysecret.toHex(nonceByte);
final bytesNonce = await lazysecret.toBin(nonce);

print('nonce[${nonceByte.length}:$nonceSize]: $nonceByte');
print('nonce[${nonce.length}]: $nonce');
print('nonce[${bytesNonce.length}:${nonceByte.length}]: $bytesNonce');
{% endhighlight %}

ในงานจริง nonce ต้องไม่ reuse กับ key เดิม การใช้ `randomBytesBuf(nonceSize)` ทุกครั้งก่อน encrypt เลยเป็น pattern ที่ควรทำ

## สร้าง KeyPair

`cryptoKxKeyPair()` คืน `KeyPair` ที่มี `pk` และ `sk` เป็น hex string

{% highlight dart %}
final clientKeyPair = await lazysecret.cryptoKxKeyPair();
final serverKeyPair = await lazysecret.cryptoKxKeyPair();

print(clientKeyPair.pk);
print(clientKeyPair.sk);
{% endhighlight %}

class ฝั่ง Dart หน้าตาเรียบ ๆ

{% highlight dart %}
class KeyPair {
  final String pk;
  final String sk;

  KeyPair({required this.pk, required this.sk});
}
{% endhighlight %}

บน Android ใช้ `lazySodium.cryptoKxKeypair()`

{% highlight kotlin %}
fun cryptoKxKeypair(): KeyPair {
    return lazySodium.cryptoKxKeypair()
}
{% endhighlight %}

บน iOS ใช้ `sodium.keyExchange.keyPair()`

{% highlight swift %}
public func cryptoKxKeyPair() -> KeyPair? {
    guard let keyPair = sodium.keyExchange.keyPair() else { return nil }

    return KeyPair(pk: keyPair.publicKey, sk: keyPair.secretKey)
}
{% endhighlight %}

## ทำ Shared Key

ใน example app มี client keypair และ server keypair แล้วสลับ public/private key เพื่อทำ shared key สองฝั่ง

{% highlight dart %}
final clientKx = KeyPair(pk: serverKeyPair.pk, sk: clientKeyPair.sk);
final serverKx = KeyPair(pk: clientKeyPair.pk, sk: serverKeyPair.sk);

final clientSharedKey = await lazysecret.cryptoBoxBeforeNm(clientKx);
final serverSharedKey = await lazysecret.cryptoBoxBeforeNm(serverKx);

print('clientSharedKey: $clientSharedKey');
print('serverSharedKey: $serverSharedKey');
{% endhighlight %}

แนวคิดคือ client ใช้ private key ของตัวเองกับ public key ของ server ส่วน server ใช้ private key ของตัวเองกับ public key ของ client แล้ว shared key ที่ได้ต้องตรงกัน

ฝั่ง iOS เรียก `sodium.box.beforenm`

{% highlight swift %}
public func cryptoBoxBeforeNm(keyPair: KeyPair) -> String {
    guard let bytes = sodium.box.beforenm(
        recipientPublicKey: keyPair.pk,
        senderSecretKey: keyPair.sk
    ) else {
        return ""
    }

    return toHex(bytes: bytes)
}
{% endhighlight %}

ฝั่ง Android ก็ส่ง `KeyPair` เข้า `cryptoBoxBeforeNm`

{% highlight kotlin %}
val keyPair = KeyPair(
    lazySecret.fromHexString(pk),
    lazySecret.fromHexString(sk),
)
val sharedKey = lazySecret.cryptoBoxBeforeNm(keyPair).lowercase()
{% endhighlight %}

## Encrypt ด้วย cryptoSecretBoxEasy

เมื่อมี `message`, `nonce` และ `sharedKey` แล้ว encrypt ได้เลย

{% highlight dart %}
const message = 'Lazysecret ทดสอบ';

final ciphertext = await lazysecret.cryptoSecretBoxEasy(
  message,
  nonce,
  clientSharedKey,
);

print('ciphertext: $ciphertext');
{% endhighlight %}

ใน Android method channel จะรับ `plaintext`, `nonce`, `key` เป็น string แล้วแปลง nonce/key จาก hex ก่อนส่งไป libsodium

{% highlight kotlin %}
val data = lazySecret.cryptoSecretBoxEasy(
    plaintext = plaintext,
    nonce = lazySecret.toBin(nonce),
    key = lazySecret.fromHexString(key),
).lowercase()
{% endhighlight %}

ใน iOS ก็แปลง plaintext เป็น bytes แล้วใช้ `sodium.secretBox.seal`

{% highlight swift %}
let message = Bytes(plaintext.utf8)
let nonceBytes = toBin(hexString: nonce)
let keyBytes = toBin(hexString: key)

guard let cipherBytes = sodium.secretBox.seal(
    message: message,
    secretKey: keyBytes,
    nonce: nonceBytes
) else {
    return ""
}

return toHex(bytes: cipherBytes)
{% endhighlight %}

ผลลัพธ์ `ciphertext` เป็น hex string ของ authenticated ciphertext ที่ libsodium secret_box สร้างให้

## Decrypt ด้วย cryptoSecretBoxOpenEasy

ตอน decrypt ใช้ ciphertext, nonce เดิม และ shared key ของอีกฝั่ง

{% highlight dart %}
final plaintext = await lazysecret.cryptoSecretBoxOpenEasy(
  ciphertext,
  nonce,
  serverSharedKey,
);

print('plaintext: $plaintext');
{% endhighlight %}

ฝั่ง iOS ใช้ `sodium.secretBox.open`

{% highlight swift %}
guard let decrypted = sodium.secretBox.open(
    authenticatedCipherText: cipherBytes,
    secretKey: keyBytes,
    nonce: nonceBytes
) else { return "" }

return String(bytes: decrypted, encoding: .utf8) ?? ""
{% endhighlight %}

ถ้า key, nonce หรือ ciphertext ไม่ตรงกัน จะได้ string ว่างกลับมาในหลาย platform ดังนั้นถ้างาน production ต้องแยก case error เพิ่มในชั้น application เอง

## ใช้งานบน Web

สำหรับ Flutter Web ต้องเตรียม `sodium.js`

1. ดาวน์โหลด `sodium.js`

{% highlight shell %}
https://raw.githubusercontent.com/jedisct1/libsodium.js/master/dist/browsers-sumo/sodium.js
{% endhighlight %}

2. วางไว้ในโฟลเดอร์ `web`

{% highlight shell %}
web
└── sodium.js
{% endhighlight %}

3. เพิ่ม script ใน `web/index.html`

{% highlight html %}
<script src="sodium.js"></script>
{% endhighlight %}

4. เรียก `LazySecret.init()` ก่อน `runApp`

{% highlight dart %}
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await LazySecret.init();

  runApp(const MyApp());
}
{% endhighlight %}

ใน repo ฝั่ง web ใช้ `LazySecretWeb` override singleton แล้วเรียก libsodium.js ผ่าน `interop`

{% highlight dart %}
class LazySecretWeb extends LazySecret {
  static void registerWith(Registrar registrar) {
    LazySecret.instance = LazySecretWeb();
  }

  @override
  Future<Uint8List> randomBytesBuf(int size) async {
    return interop.randombytes_buf(size);
  }
}
{% endhighlight %}

ส่วน encrypt/decrypt บน Web ก็ยังใช้ API เดิมเหมือน Android/iOS

## Android Proguard

README มี proguard rules สำหรับ JNA เพราะ Android ใช้ `lazysodium-android` และ `net.java.dev.jna:jna`

{% highlight proguard %}
-keep class com.sun.jna.** { *; }
-keep class * implements com.sun.jna.** { *; }
-dontwarn java.awt.*
-keepclassmembers class * extends com.sun.jna.* { public *; }
-keepclassmembers class * extends com.sun.jna.** {
    <fields>;
    <methods>;
}
{% endhighlight %}

ถ้า build release แล้วเจอปัญหา native/JNA ถูก shrink หาย ให้เช็คส่วนนี้ก่อน

## iOS และ Swift Package Manager

จาก `CHANGELOG.md` เวอร์ชัน `1.0.6` ระบุว่า migrate ไป Swift Package Manager แล้ว

ใน `ios/lazysecret/Package.swift` ใช้ Swift tools 5.9, iOS 12 และ dependency `swift-sodium`

{% highlight swift %}
let package = Package(
    name: "lazysecret",
    platforms: [
        .iOS("12.0")
    ],
    dependencies: [
        .package(name: "FlutterFramework", path: "../FlutterFramework"),
        .package(url: "https://github.com/jedisct1/swift-sodium.git", .upToNextMajor(from: "0.9.1"))
    ]
)
{% endhighlight %}

จุดนี้ทำให้ฝั่ง iOS ไม่ได้มีแค่ CocoaPods path เดิม แต่มี SwiftPM package ใน repo แล้ว

## ข้อควรระวัง

- `nonce` ต้องสุ่มใหม่ทุกครั้งที่ encrypt และต้องส่งคู่กับ ciphertext ให้ฝั่ง decrypt
- `key`, `nonce`, `ciphertext`, `pk`, `sk` ใน API หลักเป็น hex string
- `cryptoBoxBeforeNm` ต้องใส่ public key ของอีกฝั่งกับ secret key ของฝั่งตัวเอง
- ถ้า decrypt ไม่สำเร็จ implementation หลายจุดคืน `""` จึงควรตรวจผลลัพธ์เสมอ
- บน Web ต้องมี `sodium.js` ใน `web/index.html` ไม่อย่างนั้น interop จะเรียก libsodium ไม่ได้
- Android release build ต้องระวัง proguard/JNA ตาม rules ใน README

## สรุป

`lazysecret` เหมาะกับ Flutter app ที่อยากใช้ libsodium `secret_box` แบบ API เดียวกันทั้ง Android, iOS และ Web

flow หลักคือสร้าง key pair สองฝั่ง, ทำ shared key ด้วย `cryptoBoxBeforeNm`, สุ่ม nonce ด้วย `randomBytesBuf`, encrypt ด้วย `cryptoSecretBoxEasy` และ decrypt ด้วย `cryptoSecretBoxOpenEasy`

ตัว library ช่วยซ่อนรายละเอียด native binding ให้เยอะ แต่เรื่อง protocol เช่น key storage, nonce lifecycle, error handling และการส่ง nonce/ciphertext ระหว่าง client-server ยังต้องออกแบบให้ดีในชั้น application เอง
