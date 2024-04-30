---
layout: post
title:  "[Flutter] ลองใช้งาน Null-Aware Operators ในภาษา Dart 1.12"
short_description: "จัดการค่า null อย่างไรให้ปลอดภัย และกระชับ ต้องเขียนยังไงมาดูกัน ๆ"
date:   2020-08-10 18:37:00 +0700
categories: [flutter]
tags: [flutter]
cover_image: /assets/images/flutter/07.png
author: "Devไปวันๆ"
---

### Null-Aware Operators ท่าที่ผมใช้บ่อย ๆ

- ใช้ท่า ??

{% highlight dart %}
expr1 ?? expr2
{% endhighlight %}

ถ้า `expr1` เป็น `null` จะเอาค่าของ `expr2` มาใช้ <br>
ถ้า `expr1` ไม่เป็น `null` จะเอาค่าของ `expr1` มาใช้

{% highlight dart %}
var a = null ?? 'Hello';    // a = 'Hello'
var b = 'World' ?? 'Hello'; // b = 'World'
{% endhighlight %}

- ใช้ท่า ??= 

{% highlight dart %}
v ??= expr
{% endhighlight %}

ถ้าค่า `v` เป็น `null` จะเอาค่าของ `expr` ไปกำหนดค่าใหม่ให้กับ `v`

{% highlight dart %}
var x = null;
x ??= 'John Wick';          // x = 'John Wick'
{% endhighlight %}

- ใช้ท่า x?.fields

{% highlight dart %}
v = x?.fields
{% endhighlight %}

ถ้าค่า `v` เป็น `null` แล้วมีการเรียกใช้ `fields` ใด ๆ จะไม่ throw exception แต่จะได้ค่า `null` มาแทน

{% highlight dart %}
var x = null;
var v = x?.foo              // v = null
{% endhighlight %}


- ใช้ท่า x?.fun()

{% highlight dart %}
v = x?.fun()
{% endhighlight %}

ถ้าค่า `v` เป็น `null` แล้วมีการเรียกใช้ `function` ใด ๆ จะไม่ throw exception แต่จะได้ค่า `null` มาแทน

{% highlight dart %}
var x = null;
var v = x?.bar()            // v = null
{% endhighlight %}

หวังว่าจะมีประโยชน์กับผู้ที่หลงเข้ามาอ่านไม่มากก็น้อยนะครับ หากผิดพลาดประการใดต้องขออภัย ณ ที่นั้นด้วยนะครับ 

<br>