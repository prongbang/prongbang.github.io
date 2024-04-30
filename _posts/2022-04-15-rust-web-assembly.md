---
layout: post
title: "[Rust] เขียนฟังก์ชันด้วย Rust แล้ว pack เป็น WebAssmbly ให้ Web Apps เรียกใช้งาน"
short_description: "ในบางงานอาจจะต้องมาใช้วิธีนี้ มาดูกันครับว่าต้องทำยังไง"
date: 2022-04-15 15:15:15 +0700
categories: [rust, javascript, wasm]
tags: [rust, javascript, wasm]
cover_image: /assets/images/rust/4.png
author: "Devไปวันๆ"
---

WebAssembly คืออะไรนั้นลองเข้าไปดูได้ที่ [https://webassembly.org/](https://webassembly.org/) จะขอข้ามทฤษฎีไปลงมือเลยนะครับ ซึ่งในโพสนี้จะลองสร้างฟังก์ชั้น `Entropy` มาใช้วัดความวุ่นวายของระบบ หรือ ความไม่เป็นระบบ แบบง่ายๆกันครับ

<br>

### เริ่มติดตั้ง `wasm-pack` ด้วยคำสั่ง

{% highlight shell %}
cargo install wasm-pack
{% endhighlight %}


### สร้างโปรเจคชื่อ `entropy-wasm`

{% highlight shell %}
cargo new --lib entropy-wasm 
{% endhighlight %}

สร้างเสร็จก็จะได้ประมาณนี้

{% highlight shell %}
➜  entropy-wasm
├── Cargo.lock
├── Cargo.toml
└── src
    └── lib.rs
{% endhighlight %}


เข้าไปแก้ Cargo.toml 

{% highlight shell %}
[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
{% endhighlight %}

เข้าไปแก้ไฟล์ `src/lib.rs` โดยเพิ่มฟังก์ชัน `entropy` เข้าไป สามารถเข้ามาดู ฟังก์ชันของภาษาอื่น ๆได้ที่ [https://rosettacode.org/wiki/Entropy](https://rosettacode.org/wiki/Entropy)

{% highlight shell %}
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn entropy(arg: &str) -> f32 {
    let byt: &[u8] = arg.as_bytes();
    let mut histogram = [0u64; 256];

    for &b in byt {
        histogram[b as usize] += 1;
    }

    histogram
        .iter()
        .cloned()
        .filter(|&h| h != 0)
        .map(|h| h as f32 / byt.len() as f32)
        .map(|ratio| -ratio * ratio.log2())
        .sum()
}
{% endhighlight %}

เพียงแค่เราใส่ #[wasm_bindgen] ที่ฟังก์ชันที่เราต้องการ เพื่อให้ `wasm-pack` ในขั้นตอนต่อไปสร้างฟังก์ชันให้สามารถเรียกใช้ได้

<br>

### สั่ง Build package ไปเป็น WebAsseembly

{% highlight shell %}
wasm-pack build --target web
{% endhighlight %}


ถ้าเจอ log ประมาณนี้ก็ยินดีด้วยครับคุณได้ไปต่่อ

{% highlight shell %}
[INFO]: 🎯  Checking for the Wasm target...
[INFO]: 🌀  Compiling to Wasm...
   Compiling proc-macro2 v1.0.37
   ...
   Compiling entropy-wasm v0.1.0 (/Users/Rust/Workspaces/entropy-wasm)
    Finished release [optimized] target(s) in 15.71s
[INFO]: ⬇️  Installing wasm-bindgen...
[INFO]: Optimizing wasm binaries with `wasm-opt`...
[INFO]: ✨   Done in 2m 25s
[INFO]: 📦   Your wasm pkg is ready to publish at /Users/Rust/Workspaces/entropy-wasm/pkg.
{% endhighlight %}

แล้วเราก็จะเห็นโฟลเดอร์ `pkg` โผล่ขึ้นมาแล้วข้างในมีประมาณนี้

{% highlight shell %}
➜  pkg
├── entropy_wasm.d.ts
├── entropy_wasm.js
├── entropy_wasm_bg.wasm
├── entropy_wasm_bg.wasm.d.ts
└── package.json
{% endhighlight %}


### ปรับขนาดไฟล์ให้เล็กลง

<br>

ถ้าต้องการลดขนาดไฟล์ก็ทำขั้นตอนนี้ต่อ หรือข้ามไปขั้นตอนอื่นได้เลย

- ดูขนาด ณ ปัจจุบัน

{% highlight shell %}
wc -c pkg/entropy_wasm_bg.wasm
   9444 pkg/entropy_wasm_bg.wasm
{% endhighlight %}

- ปรับขนาดให้เล็กลง โดยเข้าไปแก้แไขไฟล์ Cargo.toml แล้วใส่สิ่งนี้เข้าไป

{% highlight shell %}
[profile.release]
lto = true
opt-level = 'z'
{% endhighlight %}

- ทำการ build package ใหม่อีกรอบ

{% highlight shell %}
wasm-pack build --target web
{% endhighlight %}

- ดูขนาดที่ build มาใหม่ก็จะเห็นว่าขนาดลดลงแล้ว

{% highlight shell %}
wc -c pkg/entropy_wasm_bg.wasm
   8381 pkg/entropy_wasm_bg.wasm
{% endhighlight %}

### ลองเรียกใช้ WebAssembly ที่เราได้ build

- สร้างไฟล์ index.html ที่ root ของโปรเจคแล้วเขียนประมาณนี้

{% highlight shell %}
<div>
    <div>entropy("123456") = <span id="result"></span></div>
    <script type="module">
      import init, {entropy} from "./pkg/entropy_wasm.js";
      init()
        .then(() => {
          let value = entropy("123456");
          document.getElementById("result").innerText = value;
        });
    </script>
</div>
{% endhighlight %}

- Run server ด้วย

{% highlight shell %}
python3 -m http.server
{% endhighlight %}

- เปิิดเว็บ browser เข้าไปที่ [http://localhost:8000](http://localhost:8000) หรือรันคำสั่งนี้

{% highlight shell %}
open http://localhost:8000
{% endhighlight %}

เมื่อเข้าไปแล้วก็จะเห็นประมาณนี้

{% highlight shell %}
entropy("123456") = 2.5849626064300537
{% endhighlight %}

เพียงเท่านี้เราก็สามารถใช้งาน WebAssmbly บนเว็บเราได้แล้ว หากผิดพลาดตรงไหนต้องขออภัยด้วยนะครับ ตัวอย่าง Source Code มาดูที่นี่ได้ครับ [https://github.com/prongbang/entropy-wasm](https://github.com/prongbang/entropy-wasm)
