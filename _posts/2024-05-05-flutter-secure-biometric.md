---
layout: post
title: "[Flutter] กับการนำ Cryptography + Biometric มาใช้ให้ปลอดภัยมากขึ้น"
short_description: "สิ่งที่เราต้องทำเพิ่มคือ Android ใช้ BiometricPrompt.CryptoObject ส่วน iOS ใช้วิธีการเข้าถึง Keychain ด้วย Face ID หรือ Touch ID"
date: 2024-05-05 20:24:00 +0700
categories: [flutter]
tags: [flutter]
cover_image: /assets/images/flutter/09.png
author: "Devไปวันๆ"
---

### วิธีการที่นำมาใช้กับ Flutter

- เข้ารหัสข้อมูล และถอดรหัสข้อมูลโดยใช้ Biometric ถ้าสแกนหน้า หรือ สแกนนิ้วมือไม่ผ่านเราก็จะถอดรหัสข้อมูลไม่ได้

### การทำงานระหว่าง Flutter - Server มี 2 ขึ้นตอน

<br>

#### 1. First Login

- 1. Flutter ส่งข้อมูล PIN ไปที่ Server 
- 2. Server ทำการ Validate เมื่อ Validate ผ่าน ก็จะทำการ Generate PIN Token อาจจะใช้ JWT ก็ได้ แล้วส่งกลับไปให้ Flutter
- 2. Flutter ทำการเข้ารหัส PIN Token ที่ได้รับ แล้วเก็บไว้ใน Flutter Secure Storage โดยทำการเข้ารหัสให้อีกชั้น

#### 2. Second Login

- 1. Flutter ทำการถอดรหัส PIN Token ที่เก็บไว้ โดยใช้ Biometric
- 2. Flutter ทำการส่ง PIN Token ที่ที่ Server
- 3. Server ทำการ Validate PIN Token เมื่อ Validate ผ่าน ก็จะทำการ Generate Access Token และ PIN Token ใหม่กลับไปให้ Flutter

### Library สำหรับการทำ Cryptography + Biometric

- Flutter

{% highlight yaml %}
dependencies:
  local_auth_crypto: ^1.1.0
  flutter_secure_storage: ^9.0.0
{% endhighlight %}

### การนำมาใช้งานกับ Android 

- Update code in `MainActivity.kt` file

{% highlight kotlin %}
import io.flutter.embedding.android.FlutterFragmentActivity

class MainActivity : FlutterFragmentActivity()
{% endhighlight %}

- Add use-permissions in `AndroidManifest.xml` file

{% highlight xml %}
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
{% endhighlight %}

- Update `build.gradle` file

{% highlight groovy %}
repositories {
  mavenCentral()
  maven { url 'https://jitpack.io' }
}
{% endhighlight %}

### การนำมาใช้งานกับ iOS

- Add privacy in `info.plist` file

{% highlight dart %}
<dict>
  <key>NSFaceIDUsageDescription</key>
  <string>This application wants to access your TouchID or FaceID</string>
</dict>
{% endhighlight %}

### การจำลองการทำงานฝั่ง Server มี 2 ฟังก์ชั้น

- ฟังก์ชั้น createPin สำหรับ Generate PIN Token เพื่อใช้ตอน Second Login
- ฟังก์ชั้น biometricAuth สำหรับ Validate PIN Token

{% highlight dart %}
class BiometricServer {
  String _pinToken = '';
  final String _uuid = 'UUID';
  final _accessToken = 'TOKEN';
  
  Future<AccessToken> createPin(String pin) async {
      // Simple validate
      if (pin == '123456') {

        // Simple generate pin token
        _pinToken = base64.encode(utf8.encode(const Uuid().v7()));
  
        return AccessToken(_uuid, _pinToken, _accessToken);
      }
  
      throw Exception('Pin not match');
  }
  
  Future<AccessToken> biometricAuth(String uuid, String pinToken) async {
      // Simple validate
      if (_pinToken == pinToken && _uuid == uuid) {

        // Simple generate pin token
        _pinToken = base64.encode(utf8.encode(const Uuid().v7()));
  
        return AccessToken(_uuid, _pinToken, _accessToken);
      }
  
      throw Exception('Pin token mot match');
  }
}
{% endhighlight %}

### การนำมาใช้งานกับ Flutter

- Logic ฝั่ง Flutter 

{% highlight dart %}
class BiometricClient {
  final BiometricServer _biometricServer;
  final LocalAuthCrypto _localAuthCrypto;
  final FlutterSecureStorage _flutterSecureStorage;
  
  BiometricClient(
    this._biometricServer,
    this._localAuthCrypto,
    this._flutterSecureStorage,
  );
  
  final String _key = 'UUID';
  
  void canEvaluatePolicy() async {
    final status = await _localAuthCrypto .evaluatePolicy('Allow biometric to authenticate');
    print('status: $status');
  }
  
  Future<void> createPin() async {
    final response = await _biometricServer.createPin('123456');
    print('uuid: ${response.uuid}');
    print('pin-token: ${response.pinToken}');
    print('access-token: ${response.accessToken}');

    // Encrypt pin token
    final pinTokenEncrypted = await _localAuthCrypto.encrypt(response.pinToken);

    // Save pin token encrypted to secure storage
    await _flutterSecureStorage.write(key: _key, value: pinTokenEncrypted);
  }
  
  Future<void> biometricAuth() async {
    // Get pin token encrypted from secure storage
    final pinTokenEncrypted = await _flutterSecureStorage.read(key: _key) ?? '';
  
    // Decrypt by biometric authentication
    final promptInfo = BiometricPromptInfo(
      title: 'BIOMETRIC',
      subtitle: 'Please scan biometric to decrypt',
      negativeButton: 'CANCEL',
    );
    final pinToken =
        await _localAuthCrypto.authenticate(promptInfo, pinTokenEncrypted);

    // Auth with pin token
    const uuid = '018f446a-c2f1-7804-9867-aa003559f996';
    final response = await _biometricServer.biometricAuth(uuid, pinToken ?? '');
    print('uuid: ${response.uuid}');
    print('pin-token: ${response.pinToken}');
    print('access-token: ${response.accessToken}');

    // Encrypt pin token
    final newPinTokenEncrypted =
        await _localAuthCrypto.encrypt(response.pinToken);

    // Save pin token encrypted to secure storage
    await _flutterSecureStorage.write(key: _key, value: newPinTokenEncrypted);
  }
}
{% endhighlight %}

- First Login

{% highlight dart %}
final _biometricClient = BiometricClient(
  BiometricServer(),
  LocalAuthCrypto.instance,
  const FlutterSecureStorage(),
);

ElevatedButton(
  onPressed: _createPin,
  child: const Text('[1] Create PIN'),
),

void _createPin() async {
  try {
    await _biometricClient.createPin();
    showMessageDialog('Success', 'Create Pin Successfully');
  } catch (e) {
    showMessageDialog('WHOOPS!', '$e');
  }
}
{% endhighlight %}

- Second Login

{% highlight dart %}
final _biometricClient = BiometricClient(
  BiometricServer(),
  LocalAuthCrypto.instance,
  const FlutterSecureStorage(),
);

@override
void initState() {
  _biometricClient.canEvaluatePolicy();
  super.initState();
}

ElevatedButton(
  onPressed: _biometricAuth,
  child: const Text('[2] Biometric Auth'),
),

void _biometricAuth() async {
  try {
    await _biometricClient.biometricAuth();
    showMessageDialog('Success', 'Biometric Auth Successfully');
  } catch (e) {
    showMessageDialog('WHOOPS!', '$e');
  }
}
{% endhighlight %}

หวังว่าจะเป็นประโยชน์ให้กับผู้ที่หลงเข้ามาอ่านนะครับ ตัวอย่าง Source Code ครับ [https://github.com/prongbang/flutter_secure_biometric](https://github.com/prongbang/flutter_secure_biometric)
