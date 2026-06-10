---
layout: post
title: "[Golang] ใช้ goecdsa ตรวจ Signature จาก Flutter local_auth_signature"
short_description: "แนะนำการใช้งาน goecdsa ฝั่ง server คู่กับ local_auth_signature ฝั่ง Flutter app สำหรับสร้าง key pair, sign payload ด้วย biometric และ verify signature ด้วย public key บน server"
date: 2026-06-10 12:00:00 +0700
categories: [golang, flutter]
tags: [golang, flutter]
cover_image: /assets/images/golang/18.png
author: "Devไปวันๆ"
---

### ภาพรวม

รอบนี้จะเป็นการใช้งาน 2 library คู่กัน

* [goecdsa](https://github.com/prongbang/goecdsa) ใช้ฝั่ง server สำหรับ generate key pair, sign และ verify ECDSA signature
* [local_auth_signature](https://github.com/prongbang/local_auth_signature) ใช้ฝั่ง Flutter app สำหรับสร้าง key pair และ sign payload โดย private key ถูกเก็บไว้ใน Android Keystore หรือ iOS Keychain/Secure Enclave และต้องผ่าน biometric ก่อนใช้งาน

flow ที่เหมาะกับการใช้งานจริงจะประมาณนี้

{% highlight text %}
Flutter App
  ├── createKeyPair() -> publicKey
  ├── ส่ง publicKey ไปผูกกับ user ที่ server
  ├── sign(payload) -> signature
  └── ส่ง payload + signature ไป server

Go Server
  ├── ดึง publicKey ของ user
  ├── verify publicKey + payload + signature
  └── ถ้า valid ค่อยทำ action ต่อ
{% endhighlight %}

จุดสำคัญคือ private key ไม่ควรถูกส่งออกจากเครื่อง user ส่วน server เก็บแค่ public key เพื่อใช้ verify เท่านั้น

---

### ฝั่ง Flutter ติดตั้ง local_auth_signature

เพิ่ม package ใน `pubspec.yaml`

{% highlight yaml %}
dependencies:
  local_auth_signature: ^1.0.12
{% endhighlight %}

แล้ว import มาใช้งาน

{% highlight dart %}
import 'package:local_auth_signature/local_auth_signature.dart';
{% endhighlight %}

จาก `pubspec.yaml` ของ library ตัวนี้รองรับ Dart SDK `>=2.18.0 <4.0.0` และ Flutter `>=2.5.0`

---

### ตั้งค่า Android

Android ต้องใช้ `FlutterFragmentActivity` เพราะ plugin ต้องการ `FragmentActivity` สำหรับ biometric prompt

{% highlight kotlin %}
import io.flutter.embedding.android.FlutterFragmentActivity

class MainActivity : FlutterFragmentActivity()
{% endhighlight %}

เพิ่ม permission ใน `AndroidManifest.xml`

{% highlight xml %}
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
{% endhighlight %}

ใน source ฝั่ง Android plugin จะใช้ method channel ชื่อ `local_auth_signature` และเรียก native library `com.github.prongbang:android-biometric-signature:1.0.7` เพื่อสร้าง key, sign, verify และตรวจ biometric changed

---

### ตั้งค่า iOS

เพิ่ม `NSFaceIDUsageDescription` ใน `Info.plist`

{% highlight xml %}
<key>NSFaceIDUsageDescription</key>
<string>This application wants to access your TouchID or FaceID</string>
{% endhighlight %}

จาก podspec ของ plugin ฝั่ง iOS ใช้ dependency `SignatureBiometricSwift` และ minimum platform คือ iOS 11.0

---

### สร้าง Key Pair บน Flutter App

เริ่มจาก instance และ key name ที่จะใช้เก็บ key ในเครื่อง

{% highlight dart %}
final localAuthSignature = LocalAuthSignature.instance;
final key = 'com.yourapp.signature.key';
{% endhighlight %}

สร้าง key pair ด้วย biometric prompt

{% highlight dart %}
final publicKey = await localAuthSignature.createKeyPair(
  key,
  AndroidPromptInfo(
    title: 'BIOMETRIC',
    subtitle: 'Please allow biometric',
    negativeButton: 'CANCEL',
    invalidatedByBiometricEnrollment: true,
  ),
  IOSPromptInfo(reason: 'Please allow biometric'),
);
{% endhighlight %}

ค่าที่ได้จาก `createKeyPair` คือ `publicKey` แบบ string ให้นำค่านี้ส่งไปเก็บที่ server ผูกกับ user account ส่วน private key จะอยู่ใน secure storage ของ platform

ถ้าเปิด `invalidatedByBiometricEnrollment` บน Android key จะถูก invalid เมื่อมีการเปลี่ยน biometric enrollment เช่น เพิ่มนิ้วใหม่

---

### ตรวจว่า Biometric เปลี่ยนหรือยัง

ก่อน sign payload สามารถเช็คได้ว่า biometric เปลี่ยนไปจากตอนสร้าง key หรือไม่

{% highlight dart %}
final status = await localAuthSignature.isBiometricChanged(key);

if (status == KeyChangedStatus.changed) {
  // ให้ user สร้าง key pair ใหม่ แล้วส่ง publicKey ใหม่ไป server
}
{% endhighlight %}

ใน source ของ plugin method channel จะ return string เป็น `changed` หรือ `unchanged` แล้ว Dart แปลงกลับมาเป็น `KeyChangedStatus`

สำหรับ iOS มี `resetBiometricChanged()` เพิ่มเติม

{% highlight dart %}
await localAuthSignature.resetBiometricChanged();
{% endhighlight %}

---

### Sign Payload บน Flutter App

payload ควรเป็นข้อมูลที่ server ตรวจซ้ำได้ เช่น action, user id, timestamp, nonce หรือ request id และควร serialize ให้รูปแบบนิ่งเสมอ

ตัวอย่างแบบง่าย

{% highlight dart %}
final payload = '{"action":"transfer","amount":1000,"nonce":"abc-123"}';

final signature = await localAuthSignature.sign(
  key,
  payload,
  AndroidPromptInfo(
    title: 'Sign Request',
    subtitle: 'Authenticate to continue',
    negativeButton: 'CANCEL',
    invalidatedByBiometricEnrollment: true,
  ),
  IOSPromptInfo(reason: 'Authenticate to sign request'),
);
{% endhighlight %}

หลังจากได้ `signature` แล้วให้ส่ง `payload` และ `signature` ไปที่ server

{% highlight json %}
{
  "payload": "{\"action\":\"transfer\",\"amount\":1000,\"nonce\":\"abc-123\"}",
  "signature": "MEUCIQDx..."
}
{% endhighlight %}

ข้อควรระวังคือ server ต้อง verify bytes ของ payload ชุดเดียวกับที่ client sign ถ้าฝั่ง client sign string หนึ่ง แต่ server เอา JSON ไป marshal ใหม่จน field order หรือ whitespace เปลี่ยน signature ก็อาจ verify ไม่ผ่าน

---

### ฝั่ง Server ติดตั้ง goecdsa

ติดตั้ง package

{% highlight shell %}
go get github.com/prongbang/goecdsa
{% endhighlight %}

จาก source ปัจจุบันของ `goecdsa` จะมี curve ให้เลือก 4 ตัว

{% highlight go %}
goecdsa.P224
goecdsa.P256
goecdsa.P384
goecdsa.P521
{% endhighlight %}

สำหรับใช้คู่กับ `local_auth_signature` ให้ใช้ `P256` เพราะ Flutter plugin ระบุว่าใช้ NIST P-256 EC key pair

---

### Verify Signature ที่ Server

สมมติ server มี public key ของ user อยู่แล้ว ตอนรับ request ให้ verify แบบนี้

{% highlight go %}
package main

import (
	"fmt"

	"github.com/prongbang/goecdsa"
)

func main() {
	publicKey := "PUBLIC_KEY_FROM_FLUTTER"
	payload := []byte(`{"action":"transfer","amount":1000,"nonce":"abc-123"}`)
	signature := "SIGNATURE_FROM_FLUTTER"

	match, err := goecdsa.VerifyASN1(
		publicKey,
		payload,
		signature,
		goecdsa.P256,
	)
	if err != nil {
		panic(err)
	}

	fmt.Println("verified:", match)
}
{% endhighlight %}

ใน source ของ `goecdsa` ตัว `VerifyASN1` จะทำงานประมาณนี้

* parse public key จาก Base64 ด้วย `x509.ParsePKIXPublicKey`
* hash payload ตาม curve ที่ส่งเข้าไป
* decode signature จาก Base64
* verify ด้วย `ecdsa.VerifyASN1`

ถ้า signature ที่ได้จาก mobile เป็น ASN.1 DER encoded signature ให้ใช้ `VerifyASN1` จะตรงที่สุด

---

### ตัวอย่าง Handler แบบสั้น

ตัวอย่าง endpoint สำหรับรับ signed request

{% highlight go %}
type SignedRequest struct {
	UserID    string `json:"userId"`
	Payload   string `json:"payload"`
	Signature string `json:"signature"`
}

func VerifySignedRequest(req SignedRequest) error {
	publicKey, err := FindPublicKeyByUserID(req.UserID)
	if err != nil {
		return err
	}

	ok, err := goecdsa.VerifyASN1(
		publicKey,
		[]byte(req.Payload),
		req.Signature,
		goecdsa.P256,
	)
	if err != nil {
		return err
	}
	if !ok {
		return fmt.Errorf("invalid signature")
	}

	return nil
}
{% endhighlight %}

หลัง verify ผ่านแล้วค่อย parse `Payload` เพื่อทำ action ต่อ เช่น transfer, approve หรือ confirm login

---

### Generate Key Pair ด้วย goecdsa

ถ้าต้องการทดสอบฝั่ง server โดยไม่ผ่าน mobile app สามารถ generate key pair ด้วย Go ได้

{% highlight go %}
keyPair, err := goecdsa.GenerateKeyPair(goecdsa.P256)
if err != nil {
	panic(err)
}

publicKey, err := keyPair.PublicKeyString()
if err != nil {
	panic(err)
}

privateKey, err := keyPair.PrivateKeyString()
if err != nil {
	panic(err)
}
{% endhighlight %}

จาก source ปัจจุบัน `PublicKeyString()` จะ marshal public key เป็น PKIX DER แล้ว Base64 encode ส่วน `PrivateKeyString()` จะ marshal private key เป็น EC private key DER แล้ว Base64 encode

---

### Sign และ Verify ด้วย goecdsa

ตัวอย่างสำหรับเขียน test ฝั่ง Go

{% highlight go %}
message := []byte("GO ECDSA")
keyPair, _ := goecdsa.GenerateKeyPair(goecdsa.P256)
publicKey, _ := keyPair.PublicKeyString()

signature, err := goecdsa.SignASN1(
	keyPair.PrivateKey,
	message,
	goecdsa.P256,
)
if err != nil {
	panic(err)
}

match, err := goecdsa.VerifyASN1(
	publicKey,
	message,
	signature,
	goecdsa.P256,
)
if err != nil {
	panic(err)
}

fmt.Println(match)
{% endhighlight %}

ใน `digest.go` จะเลือก hash ตาม curve เช่น `P256` ใช้ `sha256.Sum256`, `P384` ใช้ `sha512.Sum384` และ `P521` ใช้ `sha512.Sum512`

---

### Error ที่ควร handle ใน Flutter

ฝั่ง Flutter ควร handle `PlatformException` เพราะ user อาจ cancel biometric, เครื่องไม่ได้ enroll biometric หรือ key invalid

{% highlight dart %}
try {
  final signature = await localAuthSignature.sign(
    key,
    payload,
    androidPrompt,
    iosPrompt,
  );
} on PlatformException catch (e) {
  if (e.isCanceled) {
    // user cancel
  } else if (e.isLockedOut || e.isPermanentlyLockedOut) {
    // biometric locked
  } else if (e.isNotEnrolled || e.isNotAvailable) {
    // device not ready
  } else {
    // other error
  }
}
{% endhighlight %}

`local_auth_signature` มี extension สำหรับเช็ค error code เช่น `isCanceled`, `isLockedOut`, `isPermanentlyLockedOut`, `isNotEnrolled`, `isNotAvailable`, `isAuthenticationFailed`

---

### สรุป

ถ้าจะใช้ biometric signature สำหรับยืนยัน action สำคัญใน app ให้แยกหน้าที่แบบนี้

* Flutter app สร้าง key pair และเก็บ private key ไว้ในเครื่อง
* Flutter app ส่ง public key ไปลงทะเบียนกับ server
* Flutter app sign payload หลัง user ผ่าน biometric
* Go server ใช้ `goecdsa.VerifyASN1` กับ `goecdsa.P256` เพื่อตรวจ signature
* server ต้องตรวจ nonce, timestamp หรือ request id เพิ่ม เพื่อกัน replay attack

แนวทางนี้ช่วยให้ server ยืนยันได้ว่า request ถูก sign จาก key ที่ผูกกับเครื่องและ biometric ของ user โดยไม่ต้องส่ง private key ออกจากเครื่องเลย

---

### Repository

ดูโค้ดเพิ่มเติมได้ที่

* [prongbang/goecdsa](https://github.com/prongbang/goecdsa)
* [prongbang/local_auth_signature](https://github.com/prongbang/local_auth_signature)
