---
layout: post
title: "[Rust/JavaScript] การใช้งาน Lazy XChaCha และ Lazy ChaCha สำหรับเข้ารหัสข้อความ"
short_description: "แนะนำ lazyxchacha-rs, npm lazyxchacha และ lazychacha-rs สำหรับทำ X25519 key exchange แล้วเข้ารหัสด้วย XChaCha20-Poly1305 หรือ ChaCha20-Poly1305"
date: 2026-06-11 13:00:00 +0700
categories: [rust, javascript]
tags: [rust, javascript]
cover_image: /assets/images/rust/7.png
author: "Devไปวันๆ"
---

เวลาอยากเข้ารหัสข้อมูลระหว่าง client กับ server แบบไม่อยากส่ง key เดียวกันไปมาโดยตรง pattern ที่เจอบ่อยคือให้ทั้งสองฝั่งสร้าง key pair ของตัวเอง แล้วเอา public key ของอีกฝั่งมาทำ shared key ด้วย X25519 จากนั้นเอา shared key ไปเข้ารหัสข้อความด้วย AEAD อย่าง ChaCha20-Poly1305 หรือ XChaCha20-Poly1305

ชุดนี้มี 3 ตัวที่เกี่ยวข้องกัน

- [prongbang/lazyxchacha-rs](https://github.com/prongbang/lazyxchacha-rs) สำหรับ Rust ใช้ XChaCha20-Poly1305
- [lazyxchacha](https://www.npmjs.com/package/lazyxchacha) สำหรับ JavaScript/TypeScript ใช้ XChaCha20-Poly1305
- [prongbang/lazychacha-rs](https://github.com/prongbang/lazychacha-rs) สำหรับ Rust ใช้ ChaCha20-Poly1305

ถ้าใช้งานข้าม Rust server กับ JavaScript web แนะนำเริ่มจาก `lazyxchacha` ก่อน เพราะมีทั้ง Rust crate และ npm package ที่ใช้ XChaCha20-Poly1305 pattern เดียวกัน

## ภาพรวม Algorithm

จาก README และโค้ดของทั้งสอง repo ฝั่ง Rust ใช้แนวคิดเดียวกัน

- Key exchange: `X25519`
- Encryption: `XChaCha20` หรือ `ChaCha20`
- Authentication: `Poly1305`

ความต่างสำคัญคือ nonce

- `lazyxchacha-rs` ใช้ `XChaCha20Poly1305` และ slice nonce ออกมา `24 bytes`
- `lazychacha-rs` ใช้ `ChaCha20Poly1305` และ slice nonce ออกมา `12 bytes`
- npm `lazyxchacha` ใช้ `@stablelib/xchacha20poly1305` และ `NONCE_LENGTH` ของ stablelib ซึ่งเป็น XChaCha nonce

เวลา encrypt library จะสร้าง nonce แบบ random แล้วเอา `nonce + ciphertext` มาต่อกัน ก่อน encode เป็น hex string

เวลา decrypt library จะ decode hex กลับมาเป็น bytes แล้วแยก nonce ช่วงแรกออกก่อนเปิด ciphertext

## ใช้ XChaCha บน Rust

เพิ่ม dependency

{% highlight toml %}
[dependencies]
lazyxchacha = "0.1.2"
{% endhighlight %}

ใน `lazyxchacha-rs` มี module หลัก 2 ตัว

- `keypair` สำหรับสร้าง key pair และ shared key
- `lazyxchacha` สำหรับ encrypt/decrypt

ตัวอย่างการสร้าง key pair

{% highlight rust %}
use lazyxchacha::keypair::KeyPair;

let client_kp = KeyPair::new();
let server_kp = KeyPair::new();

let client_pk = client_kp.pk_string();
let server_pk = server_kp.pk_string();
{% endhighlight %}

`pk_string()` จะ encode public key เป็น hex string ขนาด 32 bytes หรือ 64 ตัวอักษร

## ทำ Shared Key ด้วย X25519

ฝั่ง client เอา private key ของตัวเองกับ public key ของ server มาทำ shared key

{% highlight rust %}
use lazyxchacha::keypair::{KeyPair, SharedKey};

let client_kp = KeyPair::new();
let server_kp = KeyPair::new();

let server_pk = server_kp.pk_string();
let shared_key = SharedKey::new(server_pk, client_kp.sk);
{% endhighlight %}

ฝั่ง server ก็ทำกลับกัน

{% highlight rust %}
let client_pk = client_kp.pk_string();
let server_shared_key = SharedKey::new(client_pk, server_kp.sk);
{% endhighlight %}

จาก test ใน repo ทั้งสองฝั่งต้องได้ shared key เหมือนกัน

{% highlight rust %}
assert_eq!(client_shared_key, server_shared_key);
{% endhighlight %}

ข้อควรจำคือ `KeyPair` ใช้ `EphemeralSecret` ซึ่งถูก consume ตอนเรียก `SharedKey::new` ดังนั้นเหมาะกับ key exchange แบบใช้ครั้งเดียวมากกว่าเก็บ secret key ยาว ๆ

## Static KeyPair ใน lazyxchacha-rs

`lazyxchacha-rs` มี `StaticKeyPair` และ `StaticSharedKey` เพิ่มมาให้ด้วย ซึ่งต่างจาก `lazychacha-rs` ที่มีเฉพาะ ephemeral key pair

{% highlight rust %}
use lazyxchacha::keypair::{StaticKeyPair, StaticSharedKey};

let client_kp = StaticKeyPair::new();
let server_kp = StaticKeyPair::new();

let server_pk = server_kp.pk_string();
let client_sk = client_kp.sk_string();

let shared_key = StaticSharedKey::new(server_pk, client_sk);
{% endhighlight %}

แบบนี้ secret key จะถูกแปลงเป็น hex string ได้ด้วย `sk_string()` เหมาะกับกรณีที่ต้องส่งต่อค่า หรือเก็บ key ไว้ใน config ที่จัดการเอง

แต่ถ้าเป็น production ต้องระวังเรื่องการเก็บ secret key ให้ดี เพราะ library ช่วยทำ crypto flow ให้สั้นลง ไม่ได้ช่วยจัดการ key storage ให้ปลอดภัยแทนเรา

## Encrypt ด้วย LazyXChaCha

สร้าง instance ด้วย `LazyXChaCha::new()` ซึ่งในโค้ดคืนค่าเป็น `Arc<dyn Cryptography>`

{% highlight rust %}
use lazyxchacha::lazyxchacha::LazyXChaCha;
use lazyxchacha::keypair::{KeyPair, SharedKey};

let lazyxchacha = LazyXChaCha::new();

let client_kp = KeyPair::new();
let server_kp = KeyPair::new();
let server_pk = server_kp.pk_string();

let shared_key = SharedKey::new(server_pk, client_kp.sk);
let plaintext = r#"{"message": "hi"}"#;

let ciphertext = lazyxchacha.encrypt(plaintext, &shared_key);
{% endhighlight %}

ผลลัพธ์ `ciphertext` เป็น hex string ที่ภายในประกอบด้วย

{% highlight shell %}
nonce 24 bytes + encrypted payload + Poly1305 tag
{% endhighlight %}

จากโค้ดจริงใน `encrypt_bytes`

{% highlight rust %}
let nonce = XChaCha20Poly1305::generate_nonce(&mut OsRng);
let ciphertext = cipher.encrypt(&nonce, plaintext.as_ref()).unwrap_or(Vec::new());

let mut combined = Vec::<u8>::with_capacity(nonce.len() + ciphertext.len());
combined.extend_from_slice(&nonce);
combined.extend_from_slice(&ciphertext);
{% endhighlight %}

แล้ว `encrypt` จะเอา bytes ที่รวมแล้วไป hex encode

{% highlight rust %}
fn encrypt(&self, plaintext: &str, key: &str) -> String {
    let combined = self.encrypt_bytes(plaintext, key);

    hex::encode(combined)
}
{% endhighlight %}

## Decrypt ด้วย LazyXChaCha

ตอน decrypt ให้ใช้ shared key ฝั่งตรงข้ามที่ได้จาก X25519 เหมือนกัน

{% highlight rust %}
let plaintext = lazyxchacha.decrypt(&ciphertext, &shared_key);
{% endhighlight %}

ภายในโค้ดจะ decode hex แล้วแยก nonce 24 bytes แรกออกมา

{% highlight rust %}
let ciphertext = hex::decode(ciphertext);

let nonce = &ciphertext[0..24];
let nonce = GenericArray::from_slice(nonce);
let ciphertext = &ciphertext[24..];

let plaintext = cipher.decrypt(nonce, ciphertext).unwrap_or(Vec::new());
{% endhighlight %}

ถ้า decrypt ไม่สำเร็จ implementation จะคืน bytes ว่าง แล้วแปลงเป็น string ว่าง ดังนั้นในงานจริงควรตรวจว่า plaintext ว่างผิดปกติหรือไม่ และควรออกแบบ error handling เพิ่มเองถ้าต้องแยก case key ผิด, ciphertext เสีย หรือ format ไม่ครบ

## ใช้ npm lazyxchacha บน JavaScript

ติดตั้ง package ปัจจุบันจาก npm

{% highlight shell %}
npm install lazyxchacha
{% endhighlight %}

จาก npm metadata ตอนอ่านบทความนี้ package ล่าสุดคือ `1.0.1` และ source repo คือ `prongbang/lazyxchacha-web`

API หลักมี 4 ตัว

- `generateKeyPair()`
- `sharedKey(sk, pk)`
- `encrypt(data, key)`
- `decrypt(data, key)`

ตัวอย่างจาก README

{% highlight js %}
import * as xChaCha from 'lazyxchacha'

const clientKp = xChaCha.generateKeyPair();
const serverKp = xChaCha.generateKeyPair();

const clientSharedKey = xChaCha.sharedKey(clientKp.sk, serverKp.pk);
const serverSharedKey = xChaCha.sharedKey(serverKp.sk, clientKp.pk);

const message = 'Hello';
const ciphertext = xChaCha.encrypt(message, clientSharedKey);
const plaintext = xChaCha.decrypt(ciphertext, serverSharedKey);
{% endhighlight %}

จาก test ใน repo `generateKeyPair()` คืน `pk` และ `sk` เป็น hex string ความยาว 64 ตัวอักษร

{% highlight js %}
const keypair = xChaCha.generateKeyPair();

expect(keypair.pk.length).toBe(64);
expect(keypair.sk.length).toBe(64);
{% endhighlight %}

## โครงสร้าง encrypt ฝั่ง JavaScript

ใน `src/index.ts` ฝั่ง web ใช้ stablelib

{% highlight ts %}
import * as x25519 from '@stablelib/x25519';
import { NONCE_LENGTH, XChaCha20Poly1305 } from "@stablelib/xchacha20poly1305";
import { randomBytes } from "@stablelib/random";
import * as hex from "@stablelib/hex";
{% endhighlight %}

สร้าง key pair แล้ว encode เป็น hex

{% highlight ts %}
export function generateKeyPair(): { pk: string, sk: string } {
    const kp = x25519.generateKeyPair();
    return {
        pk: hex.encode(kp.publicKey),
        sk: hex.encode(kp.secretKey),
    };
}
{% endhighlight %}

ทำ shared key

{% highlight ts %}
export function sharedKey(sk: string, pk: string): string {
    const publicKey = hex.decode(pk);
    const secretKey = hex.decode(sk);
    const key = x25519.sharedKey(secretKey, publicKey);
    return hex.encode(key);
}
{% endhighlight %}

ตอน encrypt ก็สร้าง nonce ด้วย `randomBytes(NONCE_LENGTH)` แล้วรวม nonce กับ ciphertext ก่อนคืนเป็น hex

{% highlight ts %}
export function encrypt(data: string, key: string): string {
    const keyBytes = hex.decode(key);
    const xChaCha = new XChaCha20Poly1305(keyBytes);
    const nonce = randomBytes(NONCE_LENGTH);
    const plaintext = new TextEncoder().encode(data);

    const ciphertext = xChaCha.seal(nonce, plaintext);

    return hex.encode(new Uint8Array([...nonce, ...ciphertext]));
}
{% endhighlight %}

ตอน decrypt ก็ slice nonce ช่วงแรกออกมาเหมือนฝั่ง Rust

{% highlight ts %}
export function decrypt(data: string, key: string): string {
    const keyBytes = hex.decode(key);
    const xChaCha = new XChaCha20Poly1305(keyBytes);

    const cipherBytes = hex.decode(data);
    const nonce = cipherBytes.slice(0, NONCE_LENGTH);
    const ciphertext = cipherBytes.slice(NONCE_LENGTH);

    const plaintext = xChaCha.open(nonce, ciphertext);

    if (plaintext == null) return "";

    return new TextDecoder().decode(plaintext)
}
{% endhighlight %}

จุดนี้ทำให้ ciphertext format ของ Rust `lazyxchacha-rs` และ npm `lazyxchacha` คุยกันได้ เพราะทั้งคู่ใช้ shared key เป็น hex และใช้ payload format แบบ nonce นำหน้า ciphertext

ใน test ของ npm มีเคส decrypt ciphertext จาก server ด้วย

{% highlight js %}
let plaintext = xChaCha.decrypt(ciphertextFromServer, key);

expect(plaintext).toBe(expected);
{% endhighlight %}

## ใช้ LazyChaCha ฝั่ง Rust

ถ้าไม่ได้ต้องคุยกับ npm package หรืออยากใช้ ChaCha20-Poly1305 แบบ nonce 12 bytes ก็ใช้ `lazychacha-rs`

เพิ่ม dependency

{% highlight toml %}
[dependencies]
lazychacha = "0.1.1"
{% endhighlight %}

สร้าง key pair และ shared key

{% highlight rust %}
use lazychacha::keypair::{KeyPair, SharedKey};

let client_kp = KeyPair::new();
let server_kp = KeyPair::new();
let server_pk = server_kp.pk_string();

let shared_key = SharedKey::new(server_pk, client_kp.sk);
{% endhighlight %}

encrypt/decrypt

{% highlight rust %}
use lazychacha::lazychacha::LazyChaCha;

let lazychacha = LazyChaCha::new();
let plaintext = r#"{"message": "hi"}"#;

let ciphertext = lazychacha.encrypt(plaintext, &shared_key);
let decrypted = lazychacha.decrypt(&ciphertext, &shared_key);
{% endhighlight %}

ภายใน `lazychacha-rs` ใช้ `ChaCha20Poly1305::generate_nonce` และตอน decrypt จะแยก nonce 12 bytes แรก

{% highlight rust %}
let nonce = &ciphertext[0..12];
let nonce = GenericArray::from_slice(nonce);
let ciphertext = &ciphertext[12..];
{% endhighlight %}

ดังนั้น ciphertext ของ `lazychacha-rs` กับ `lazyxchacha-rs` เอามา decrypt ข้ามกันไม่ได้ เพราะใช้ algorithm และ nonce length คนละแบบ

## เลือกตัวไหนดี

ถ้าต้องทำ Rust server กับ JavaScript web ให้เลือก `lazyxchacha-rs` + npm `lazyxchacha`

เหตุผลคือทั้งคู่ใช้ XChaCha20-Poly1305, shared key จาก X25519, key/nonce/ciphertext เป็น hex format ที่โค้ดจัดการใกล้กัน และมี test ฝั่ง npm ที่ decrypt ciphertext จาก server

ถ้าเป็น Rust-only และอยากใช้ ChaCha20-Poly1305 แบบ nonce 12 bytes ก็ใช้ `lazychacha-rs`

แต่ต้องไม่เอา ciphertext สองชุดนี้มาปนกัน เช่น server encrypt ด้วย `lazychacha-rs` แล้ว web decrypt ด้วย npm `lazyxchacha` แบบนี้ไม่ตรง protocol

## ข้อควรระวัง

- shared key ต้องเป็น hex ของ 32 bytes ถ้าส่ง string ผิด format โค้ดปัจจุบันไม่ได้ return error แบบละเอียด
- decrypt failure ใน implementation จะคืน string ว่างในหลายจุด ทำให้ควรตรวจ error condition เพิ่มในชั้น application
- ciphertext format เป็น convention ของ library คือ `nonce + ciphertext/tag` แล้ว hex encode ต้องส่งทั้งก้อนนี้ไปให้ครบ
- `KeyPair` แบบ ephemeral ถูกออกแบบให้ใช้แล้วจบ ไม่ควร reuse แบบถาวร
- ถ้าต้องเก็บ static secret key ต้องจัดการ storage, rotation และ permission เอง
- ห้าม reuse nonce กับ key เดิม ในโค้ด library ใช้ random nonce ให้แล้ว แต่อย่าไปแกะ format แล้วนำ nonce เดิมกลับมาใช้เอง

## สรุป

`lazyxchacha-rs`, npm `lazyxchacha` และ `lazychacha-rs` เป็นชุด library ที่ทำให้ flow เข้ารหัสแบบ X25519 + ChaCha family สั้นลงมาก

ถ้าอยากทำ encrypted message ระหว่าง Rust server กับ JavaScript client ให้ใช้ XChaCha ชุดเดียวกัน คือ `lazyxchacha-rs` ฝั่ง Rust และ `lazyxchacha` ฝั่ง npm

ถ้าอยู่ใน Rust ล้วนและต้องการ ChaCha20-Poly1305 ธรรมดา `lazychacha-rs` ก็ใช้ง่ายกว่า แต่ต้องจำไว้ว่ามันไม่ใช่ ciphertext format เดียวกับ XChaCha เพราะ nonce length ไม่เท่ากัน
