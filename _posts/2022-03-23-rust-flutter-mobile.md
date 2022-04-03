---
layout: post
title: "[Rust] สร้าง Flutter Plugin และเรียกใช้ Library ที่เขียนด้วยภาษา Rust มาใช้งานบน Android และ iOS"
short_description: "ไม่อยากเขียน Swift/Kotlin, Gradle, CMake แต่อยากเขียน Rust กับ Dart ก็เลยมาลงเอยที่ท่านี้"
date: 2022-03-23 11:13:44 +0700
categories: rust
tags: [rust]
cover_image: /assets/images/rust/1.png
author: "end try"
---

### ทำไมเราถึงใช้วิธีนี้ก็เพราะว่า เราไม่ต้องทำสิ่งเหล่านี้นั่นเอง

- ไม่ต้องสร้าง Swift/Kotlin Wrappers
- ไม่มี `async/await` บน Dart
- ไม่ต้องไปแก้ไข `Gradle` หรือ `CMake` บน Android
- ไม่ต้องสร้าง `.aar` bundles หรือ `.framework’s`

### เริ่มต้นด้วยการสร้างโปรเจค Flutter โดยตั้งชื่อว่า flutter_ffi_rust หรือจะเป็นชื่ออื่นก็ได้

{% highlight shell %}
flutter create --org com.prongbang --template=plugin --platforms=android,ios -i swift -a kotlin flutter_ffi_rust
{% endhighlight %}

### ต่อไปก็สร้างไลบรารี Rust โดยเข้าไปที่โฟลเดอร์ `flutter_ffi_rust` ก่อน

{% highlight shell %}
cd flutter_ffi_rust
cargo new --lib --name greeter rust
{% endhighlight %}

จะได้ประมาณนี้

{% highlight shell %}
rust
├── Cargo.toml
└── src
    └── lib.rs
{% endhighlight %}

### เข้าไปแก้ไขไฟล์ `rust/Cargo.toml` โดยเพิ่มประมาณนี้

{% highlight toml %}
[lib]
name = "rust_greeter"
crate-type = ["staticlib", "cdylib"]
{% endhighlight %}

### รูปแบบการประกาศพังก์ชัน

{% highlight rust %}
#[no_mangle]
pub extern "C" fn rust_something(...) -> ... {
  // ...
}
{% endhighlight %}

### ลองเชียนฟังกฺชันง่าย ๆ ตามนี้ที่ไฟล์ `rust/src/lib.rs`

{% highlight rust %}
use std::ffi::{CStr, CString};
use std::os::raw::c_char;

#[no_mangle]
pub extern fn rust_greeting(to: *const c_char) -> *mut c_char {
    let c_str = unsafe { 
        CStr::from_ptr(to)
    };
    let recipient = match c_str.to_str() {
        Err(_) => "there",
        Ok(string) => string,
    };
    CString::new("Hello ".to_owned() + recipient).unwrap().into_raw()
}
{% endhighlight %}

### ทำการติดตั้ง rust target โดยเปิด terminal แล้วรันตามนี้

- ในส่วนของ Android

{% highlight shell %}
rustup target add aarch64-linux-android armv7-linux-androideabi x86_64-linux-android i686-linux-android
{% endhighlight %}

- ในส่วนของ iOS

{% highlight shell %}
rustup target add aarch64-apple-ios armv7-apple-ios armv7s-apple-ios x86_64-apple-ios i386-apple-ios
{% endhighlight %}

**ถ้าติดตั้งแล้วมี error ให้ลบตัวที่ error ออก

<br>

### ทำการติดตั้ง `lipo` และ `cbindgen` เพื่อสร้าง C header เพื่อ binding

{% highlight shell %}
cargo install cargo-lipo
cargo install cbindgen
{% endhighlight %}

### รวบรวมไฟล์ rust เพื่อให้ Android และ iOS ใช้งาน
<br>

#### สำหรับ iOS

{% highlight shell %}
cargo lipo --release
{% endhighlight %}

ถ้าไม่ error จะได้แบบนี้

{% highlight shell %}
target
├── aarch64-apple-ios
├── release
├── universal
└── x86_64-apple-ios
{% endhighlight %}

ซึ่งผลลัพธ์ที่เราสนใจจากการรันคือไฟล์นี้ 

{% highlight shell %}
target/universal/release/librust_greeter.a
{% endhighlight %}

จากนั้นรันคำสั่งนี้เพื่อสร้าง header ไฟล์ หรือไฟล์ `.h`

<br>
ต้องไปสร้างไฟล์ [`cbindgen.toml`](https://github.com/eqrion/cbindgen/blob/master/template.toml) ภายใต้ `root ของโปรเจค` แล้วใส่ config ประมาณนี้

{% highlight shell %}
language = "C"
autogen_warning = "// NOTE: Append the lines below to ios/Classes/FlutterFfiRustPlugin.h"

[defines]
"target_os = ios" = "TARGET_OS_IOS"
"target_os = macos" = "TARGET_OS_MACOS"
{% endhighlight %}

ทำการ gen ไฟล์ `.h` โดยใช้คำสั่งนี้

{% highlight shell %}
cbindgen ./src/lib.rs -c cbindgen.toml | grep -v \#include | uniq > target/rust_greeting.h
{% endhighlight %}

ถ้ารันผ่านก็จะได้ไฟล์ประมาณนี้

{% highlight shell %}
target
└── rust_greeting.h
{% endhighlight %}

ถ้าลองเข้าไปดูในไฟล์ `rust_greeting.h` จะเห็นประมาณนี้

{% highlight shell %}
// NOTE: Append the lines below to ios/Classes/FlutterFfiRustPlugin.h

char *rust_greeting(const char *to);
{% endhighlight %}

และผลลัพธ์ที่เราสนใจจากการรันคือไฟล์นี้ 

{% highlight shell %}
target/rust_greeting.h
{% endhighlight %}

**สรุปของ iOS ไฟล์ที่เราสนใจจะมีไฟล์ดังนี้

{% highlight shell %}
target/universal/release/librust_greeter.a
target/rust_greeting.h
{% endhighlight %}

#### สำหรับ Android

<br>

**แนะนำให้ติดตั้ง [Android NDK](https://developer.android.com/studio/projects/install-ndk) Version `22.xx` ถ้าลงสูงกว่านี้คุณจะเจอ Error ประมาณนี้ `Error running cargo ndk: ld: error: unable to find library -lgcc` ซึ่งเจ้าของบล็อคเองก็งมจนไก่ตาแกกกว่าจะเจอสาเหตุ


{% highlight shell %}
cargo install cargo-ndk
{% endhighlight %}

จากนั้นก็รันตามนี้สำหรับ 32-bit และ 64-bit ARM systems ถ้าต้องการใส่เพิ่มก็แค่ใส่ `-t xx` ต่อท้าย

{% highlight shell %}
cargo ndk -t armeabi-v7a -t arm64-v8a -t x86 -o ./jniLibs build --release
{% endhighlight %}

ถ้าไม่ error จะได้แบบนี้

{% highlight shell %}
jniLibs
├── arm64-v8a
│   └── librust_greeter.so
├── armeabi-v7a
│   └── librust_greeter.so
└── x86
    └── librust_greeter.so
{% endhighlight %}

**สรุปของ Android ไฟล์ที่เราสนใจจะมีไฟล์ดังนี้

{% highlight shell %}
jniLibs/arm64-v8a/librust_greeter.so
jniLibs/armeabi-v7a/librust_greeter.so
jniLibs/x86/librust_greeter.so
{% endhighlight %}


### การนำ library ที่ได้ไปใช้งาน กับ Android และ iOS

<br>

#### ในส่วนของ Android จะนำ `jniLibs` ที่ได้ มาไว้ที่ `android/src/main` โดยไว้ประมาณนี้

{% highlight shell %}
src
└── main
    └── jniLibs
        ├── arm64-v8a
        │   └── librust_greeter.so
        ├── armeabi-v7a
        │   └── librust_greeter.so
        └── x86
            └── librust_greeter.so
{% endhighlight %}

#### ในส่วนของ iOS

- ทำการนำไฟล์ `librust_greeter.a` มาไว้ที่โปรเจค ios โดยเราจะต้องไปที่โปรเจคของ ios ของเราก่อนแล้วรัน 

{% highlight shell %}
cd ios
cp ../rust/target/universal/release/librust_greeter.a .
{% endhighlight %}

ผลลัพธ์ที่ได้คือ

{% highlight shell %}
ios
├── Assets
├── Classes
├── flutter_ffi_rust.podspec
└── librust_greeter.a
{% endhighlight %}

- ทำการนำเอาโค้ดที่อยู่ใน `rust_greeting.h` มาต่อท้ายที่ไฟล์ `ios/Classes/FlutterFfiRustPlugin.h` ด้วยคำสั่ง

{% highlight shell %}
cd ios
cat ../rust/target/rust_greeting.h >> Classes/FlutterFfiRustPlugin.h
{% endhighlight %}

ถ้าลองเข้ามาดูที่ไฟล์ `FlutterFfiRustPlugin.h` จะเห็นว่าโค้ดที่อยู่ใน `rust_greeting.h` มาต่อท้ายแล้ว

{% highlight shell %}
#import <Flutter/Flutter.h>

@interface FlutterFfiRustPlugin : NSObject<FlutterPlugin>
@end
// NOTE: Append the lines below to ios/Classes/FlutterFfiRustPlugin.h

char *rust_greeting(const char *to);
{% endhighlight %}

- ทำการแก้ไขไฟล์ `SwiftFlutterFfiRustPlugin.swift` เพื่อจำลองการเรียกใช้งานฟังก์ชันโดยเพิ่มโค้ดประมาณนี้

{% highlight shell %}
public func dummyMethodToEnforceBundling() {
    // This will never be executed
    rust_greeting("");
}
{% endhighlight %}

ทำการแก้ไขไฟล์ `flutter_ffi_rust.podspec` ประมาณนี้

{% highlight shell %}
s.source                = { :path => '.' }
s.public_header_files   = 'Classes**/*.h'   // Add here
s.source_files          = 'Classes/**/*'    
s.static_framework      = true              // Add here
s.vendored_libraries    = "**/*.a"          // Add here
s.dependency            'Flutter'
s.platform              = :ios, '9.0'
{% endhighlight %}

### เขียนโค้ดเพื่อเรียกใช้งาน `Library` ที่เราเพิ่มเข้าไปใน Android และ iOS บน Flutter

<br>

#### เข้าไปแก้ไขไฟล์ `pubspec.yaml` โดยเพิ่มตามนี้ เพื่อ gen ffi

{% highlight yml %}
dependencies:
  ffigen: ^4.1.3
  ffi: ^1.1.2
{% endhighlight %}

- ทำการ config `ffigen`

- กำหนดชื่อ class `RustGreetingNativeLibrary`

- กำหนดชื่อไฟล์ `rust_greeting_native_library.dart` ถ้า gen เสร็จจะ save ไว้ที่ `lib`

- กำหนดไฟล์ header ชื่อ `rust_greeting.h`

{% highlight yml %}
dependencies:
    ffigen: ^4.1.3

ffigen:
  name: RustGreetingNativeLibrary
  description: Bindings to `rust/target/rust_greeting.h`.
  output: 'lib/rust_greeting_native_library.dart'
  headers:
    entry-points:
      - 'rust/target/rust_greeting.h'
{% endhighlight %}

#### ใช้คำสั่งเพื่อ gen ตามนี้ใน terminal ที่ root โปรเจค

{% highlight shell %}
dart run ffigen
{% endhighlight %}

ถ้า gen เสร็จจะได้ประมาณนี้

{% highlight dart %}
// AUTO GENERATED FILE, DO NOT EDIT.
//
// Generated by `package:ffigen`.
import 'dart:ffi' as ffi;

/// Bindings to `rust/target/rust_greeting.h`.
class RustGreetingNativeLibrary {
  /// Holds the symbol lookup function.
  final ffi.Pointer<T> Function<T extends ffi.NativeType>(String symbolName)
      _lookup;

  /// The symbols are looked up in [dynamicLibrary].
  RustGreetingNativeLibrary(ffi.DynamicLibrary dynamicLibrary)
      : _lookup = dynamicLibrary.lookup;

  /// The symbols are looked up with [lookup].
  RustGreetingNativeLibrary.fromLookup(
      ffi.Pointer<T> Function<T extends ffi.NativeType>(String symbolName)
          lookup)
      : _lookup = lookup;

  ffi.Pointer<ffi.Int8> rust_greeting(
    ffi.Pointer<ffi.Int8> to,
  ) {
    return _rust_greeting(
      to,
    );
  }

  late final _rust_greetingPtr = _lookup<
      ffi.NativeFunction<
          ffi.Pointer<ffi.Int8> Function(
              ffi.Pointer<ffi.Int8>)>>('rust_greeting');
  late final _rust_greeting = _rust_greetingPtr
      .asFunction<ffi.Pointer<ffi.Int8> Function(ffi.Pointer<ffi.Int8>)>();

  void cstring_free(
    ffi.Pointer<ffi.Int8> str,
  ) {
    return _cstring_free(
      str,
    );
  }

  late final _cstring_freePtr =
      _lookup<ffi.NativeFunction<ffi.Void Function(ffi.Pointer<ffi.Int8>)>>(
          'cstring_free');
  late final _cstring_free =
      _cstring_freePtr.asFunction<void Function(ffi.Pointer<ffi.Int8>)>();
}
{% endhighlight %}

#### เขียนโค้ดเพื่อเรียกใช้งาน ที่ class `FlutterFfiRust` ประมาณนี้

{% highlight dart %}
import 'dart:async';
import 'dart:ffi';

import 'package:ffi/ffi.dart';
import 'package:flutter_ffi_rust/rust_greeting_native_library.dart';

class FlutterFfiRust {
  static Future<String> rustGreeting() async {
    final DynamicLibrary dynamicLibrary = Platform.isAndroid
        ? DynamicLibrary.open('librust_greeter.so')
        : DynamicLibrary.process();
    final rustGreeting = RustGreetingNativeLibrary(dynamicLibrary);

    // Prepare the parameters
    const nameStr = "John Smith";
    final Pointer<Int8> namePtr = nameStr.toNativeUtf8().cast<Int8>();
    print("- Calling rust_greeting with argument: $namePtr");

    // Call rust_greeting
    final Pointer<Int8> resultPtr = rustGreeting.rust_greeting(namePtr);
    print("- Result pointer: $resultPtr");

    // Handle the result pointer
    final String greetingStr = resultPtr.cast<Utf8>().toDartString();
    print("- Response string: $greetingStr");

    return greetingStr;
  }
}
{% endhighlight %}

- ถ้าเป็น Android จะทำการเรียกใช้ไฟล์ `librust_greeter.so`


#### ลองเรียกใช้งานก็ประมาณนี้

{% highlight dart %}
final result = await FlutterFfiRust.rustGreeting();
print(result);
{% endhighlight %}


### ผลการรัน Android ยน Android Studio

{% highlight shell %}
I/flutter (30468): - Calling rust_greeting with argument: Pointer<Int8>: address=0xd8866ba0
I/flutter (30468): - Result pointer: Pointer<Int8>: address=0xd8854978
I/flutter (30468): - Response string: Hello John Smith
{% endhighlight %}

![Android.png](/assets/images/rust/2.png)


### ผลการรัน iOS บน Xcode

{% highlight shell %}
2022-04-03 22:16:30.447237+0700 Runner[51822:454633] flutter: - Calling rust_greeting with argument: Pointer<Int8>: address=0x600002c54e00
2022-04-03 22:16:30.454483+0700 Runner[51822:454633] flutter: - Result pointer: Pointer<Int8>: address=0x600002e17960
2022-04-03 22:16:30.455992+0700 Runner[51822:454633] flutter: - Response string: Hello John Smith
{% endhighlight %}

![iOS.png](/assets/images/rust/3.png)

<br>
<br>
เพียงเท่านี้ก็สามารถเรียกใช้งาน library ที่เขียนด้วย Rust ได้แล้วครับ หากผิดพลาดตรงไหนต้องขออภัย ด้วยครับ ขอบคุณครับ