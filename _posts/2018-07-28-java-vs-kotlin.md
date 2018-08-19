---
layout: post
title:  "[Kotlin] มาดูว่าระหว่าง Java กับ Kotlin มีอะไรแตกต่างกันบ้างแบบผ่าน ๆ"
short_description: "เนื่องจาก Kotlin เข้ามาเป็นภาษาที่ใช้ในการพัฒนา Android อย่างเป็นทางการแล้ว ทำให้ใครหลาย ๆ คนอยากจะเปลี่ยนแต่ไม่รู้จะเริ่มยังไง จิ้มเข้ามาดูได้นะ"
date:   2018-07-28 23:44:00 +0700
categories: kotlin
tags: [kotlin]
cover_image: /assets/images/kotlin/01.png
author: "end try"
---

### โพสนี้จะไม่พูดอะไรมาก มาดูกันเลย ๆ
<br>

### Java: ใช้ `;`
<br>

```java
int a = 1;
```
### Kotlin: ไม่ใช้ `;`
<br>

```kotlin
var a = 1
```


`var` เป็นตัวบอกว่าตัวแปรสามารถกำหนดค่าใหม่ได้

`val` เป็นตัวบอกว่าตัวแปรไม่สามารถกำหนดค่าใหม่ได้อีก
<br>
<br>

---

### Java: ค่าคงที่
<br>

```java
final String f = "FINAL";
```

### Kotlin: ค่าคงที่
<br>

```kotlin
val f = "FINAL"
```

---

### Kotlin: lateinit var
<br>

เป็น keyword ที่บอกว่าตัวแปร `data` จะไม่มีการเก็บค่า `null` และจะกำหนดค่าให้ทีหลังนะ แต่ถ้าไม่ได้กำหนดค่าแต่ดันเรียกใช้ attribute หรือ function ก็จะทำให้ error ได้ ต้องระวังด้วย
<br>
<br>


```kotlin
lateinit var data: String
```
---

### Java: ใช้ `new`
<br>

```java
StringBuilder sb = new StringBuilder();
```

### Kotlin: ไม่ใช้ `new`
<br>

```kotlin
val sb = StringBuilder()
```

---

### Kotlin: Scope Functions

- let จะใช้เมื่อต้องการเรียกใช้ function และทำการ return ค่าจากบรรทัดสุดท้ายกลับมาด้วย
<br>

```kotlin
val len = text?.let {
    println("get length of $it")
    it.length    //return value of let
} ?: 0
println("Length of $text is $len")
```
- run จะใช้เมื่อต้องการสั่งให้ function ประมวลผลบางอย่าง และทำการ return ค่าจากบรรทัดสุดท้ายกลับมาด้วย
<br>

```kotlin
val date: Int = Calendar.getInstance().run {
    set(Calendar.YEAR, 2030)
    get(Calendar.DAY_OF_YEAR) //return value of run
}
println(date)
```

- also จะใช้เมื่อทำอะไรบ้างอย่างแล้วต้องการทำอะไรต่ออีก  และทำการ return ตัวมันเองกลับมาด้วย
<br>

```kotlin
val bar: Bar = Bar().also {
    it.foo = "another value"
}
println(bar)
```

- apply จะใช้เมื่อต้องการกำหนดค่า และทำการ return ตัวมันเองกลับมาด้วย
<br>

```kotlin
val bar: Bar = Bar().apply {
    foo1 = Color.RED
    foo2 = "Foo"
}
println(bar)
```

- with จะใช้เมื่อต้องการจัดขอบเขตให้ function ประมวลผลบางอย่าง และทำการ return ค่าจากบรรทัดสุดท้ายกลับมาด้วย
<br>

```kotlin
val s: String = with(StringBuilder("init")) {
    append("some").append("thing")
    println("current value: $this")
    toString()  //return value of with
}
println(s)
```

---

### Java: Variable Types

- String
- Double
- Float
- Long
- Integer
- Short
- Character
- Byte
- double
- float
- long
- int
- short
- char
- byte
- etc.

สิ่งที่แตกต่างกันระหว่าง Types ตัวใหญ่กับตัวเล็กคือ

- ตัวใหญ่ เก็บค่า `null` ได้
- ตัวเล็ก เก็บค่า `null` ไม่ได้

ตัวอย่าง
<br>
<br>


```java
Double a = null;
final double b = 0.5;
List<String> l1 = new ArrayList<>();
List<String> l2 = null;
```

### Kotlin: Variable Types

- Double
- Float	
- Long	
- Int	
- Short	
- Byte	
- Char
- etc.

ถ้าต้องการให้แต่ละ Types เก็บค่า `null` ได้ ให้ใส่ `?` ต่อท้าย
<br>
<br>

ตัวอย่าง
<br>
<br>


```kotlin
var a: Double? = null
val b: Double = 0.5
val l1 = ArrayList<String>()
var l2: List<String>? = null
```

หรือแบบนี้
<br>
<br>


```kotlin
var a = null
val b = 0.5
```
---

### Java: แปลงค่า

- Byte.valueOf();
- Short.valueOf();
- Integer.valueOf();
- Long.valueOf();
- Float.valueOf();
- Double.valueOf();

```java
String data = "1";
Byte.valueOf(data);
Short.valueOf(data);
Integer.valueOf(data);
Long.valueOf(data);
Float.valueOf(data);
Double.valueOf(data);
```

### Kotlin: แปลงค่า

- .toByte(): Byte
- .toShort(): Short
- .toInt(): Int
- .toLong(): Long
- .toFloat(): Float
- .toDouble(): Double

```kotlin
val data = "1"
data.toByte()
data.toShort()
data.toInt()
data.toLong()
data.toFloat()
data.toDouble()
data.toCharArray()
```

---

### Java: if else สายย่อ
<br>

```java
List<String> mDataList = null;
return mDataList == null ? 0 : mDataList.size;
```

### Kotlin: if else สายย่อ
<br>

```kotlin
var mDataList: ArrayList<String>? = null
return mDataList?.size ?: 0
```

---

### Java: if else
<br>

```java
if (condition) {

} else if (condition) {

} else {

}
```

### Kotlin: if else
<br>

```kotlin
if (condition) {

} else if (condition) {

} else {
    
}
```

---

### Java: for `1`
<br>

```java
for (int i = 0; i < 10; i++) {
    System.out.println("index: " + i)
}
```

### Kotlin: for `1`
<br>

```kotlin
for (i in 0..9) {
    println("index: $i")
}
```

หรือ
<br>
<br>


```kotlin
for (i in 0 until 10) {
    println("index: $i")
}
```

---

### Java: for `2`
<br>

```java
int[] data = {1, 2, 3, 4, 5};
for (int i = 0; i < data.length; i++) {
    System.out.println("data: " + data[i]);
}
```

### Kotlin: for `2`
<br>

```kotlin
val data = arrayOf(1, 2, 3, 4, 5)
for (i in data.indices) {
    println("data: ${data[i]}")
}
```

หรือ
<br>
<br>


```kotlin
val datas = arrayOf(1, 2, 3, 4, 5)
for ((i, d) in datas.withIndex()) {
    println("index: $i, data: $d")
}
```

---

### Java: for `3`
<br>

```java
int[] data = {1, 2, 3, 4, 5};
for (int d : data) {
    System.out.println("data: " + d);
}
```

### Kotlin: for `3`
<br>

```kotlin
val data = arrayOf(1, 2, 3, 4, 5)
for (d in data) {
    println("data: $d")
}
```

---

### Java: for `4`
<br>

```java
Map<String, Integer> data = new HashMap<>();
data.put("A", 1);
data.put("B", 2);
data.put("C", 3);
data.put("D", 4);
for (Map.Entry<String, Integer> map : data.entrySet()) {
    System.out.println("key: " + map.getKey() + ", value: " + map.getValue());
}
```

### Kotlin: for `4`
<br>

```kotlin
val data = hashMapOf(
        "A" to 1,
        "B" to 2,
        "C" to 3,
        "D" to 4
)
for (map in data.entries) {
    println("key: ${map.key}, value: ${map.value}")
}
```

---

### Java: while
<br>

```java
while (true) {
    
}
```

### Kotlin: while
<br>

```kotlin
while (true) {
    
}
```

---

### Java: do while
<br>

```java
do {
    
} while (true)
```

### Kotlin: do while
<br>

```kotlin
do {
    
} while (true)
```

---

### Java: switch
<br>

```java
switch (1) {
    case 1: 
        
        break;
    default:
        
        break;
}
```

### Kotlin: switch
<br>

```kotlin
when (1) {
    1 -> {

    }
    else -> {

    }
}
```

หรือ
<br>
<br>


```kotlin
when (1) {
    in 1..2 -> {

    }
    else -> {

    }
}
```

---

### Java: null safety
<br>

```java
String data = null;
if (data != null) {
    data = data.toUpperCase();
}
```

### Kotlin: null safety
<br>

```kotlin
var data: String? = null
data = data?.toUpperCase()
```

---

### Kotlin: ใช้เครื่องหมาย `!!` 
<br>

ใช้เพื่อบอกว่า "ตัวแปรนี้ไม่เป็นค่า null นะ" แต่ถ้าตัวมีค่าเป็น null มันจะทำให้ error ได้
<br>

- แบบที่ควรระวัง
<br>

```kotlin
fun sayHi(): String {
    var data: String? = null

    if (false) data = "SayHi"

    return data!!  // ถ้าแบบนี้จะ error
}
```

- แบบส่งค่าผ่าน fun
<br>

```kotlin
var data: String? = null
data = if (true) {
    "Hi"
} else {
    null
}
fun hello(name: String): String = "Hello $name"
hello(data!!)
```

- ดังนั้นถ้าเราไม่มั่นใจให้ใช้แบบนี้แทน
<br>

```kotlin
var data: String? = null
data = if (true) {
    "Hi"
} else {
    null
}
fun hello(name: String): String = "Hello $name"
hello(data ?: "")
```

หรือใช้ `let` เข้ามาช่วย
<br>
<br>


```kotlin
data?.let {
    hello(it)
}
```

---

### Java: new instance
<br>

```java
class ClassA {
    
    private String data;
    
    ClassA() {

    }

    public ClassA(String data) {
        this.data = data;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }
}
ClassA a = new ClassA();
```

### Kotlin: new instance
<br>

```kotlin
class ClassA {

    var data: String? = null

    constructor() {

    }

    constructor(data: String) {
        this.data = data
    }
}
val a = ClassA()
```

หรือ
<br>
<br>


```kotlin
data class ClassA(var data: String? = null)
val a = ClassA()
```

### Java: Cast an object
<br>

```java
Book book = (Book) obj;
```

### Kotlin: Cast an object
<br>

```java
var book = obj as Book
```
--- 

### Java: instanceof
<br>

```java
if (book instanceof Book) {
    
}
```

### Kotlin: is
<br>

```kotlin
if (book is Book) {

}
```

---

### Java: List
<br>

```java
List<String> data = new ArrayList<>();
data.add("A");
data.add("B");
data.add("C");
data.add("D");
```

### Kotlin: List
<br>

```kotlin
val data = arrayListOf("A", "B", "C", "D")
```

---

### Java: HashMap
<br>

```java
Map<String, Integer> data = new HashMap<>();
data.put("A", 1);
data.put("B", 2);
data.put("C", 3);
data.put("D", 4);
```

### Kotlin: HashMap
<br>

```kotlin
val data = hashMapOf(
    "A" to 1,
    "B" to 2,
    "C" to 3,
    "D" to 4
)
```

หรือ
<br>
<br>


```kotlin
val data = hashMapOf<String, Int>()
data["D"] = 1
data["B"] = 2
data["C"] = 3
data["D"] = 4
```

---

### Java: find
<br>

```java
int index = -1;
int[] data = {1, 2, 3, 4, 5};
for (int i = 0; i < data.length; i++) {
    if (data[i] == 1) {
        index = i;
        break;
    }
}
```

### Kotlin: find
<br>

```kotlin
val data = intArrayOf(1, 2, 3, 4, 5)
val index = data.find { it -> it == 1 }
```

หรือ
<br>
<br>


```kotlin
val data = intArrayOf(1, 2, 3, 4, 5)
val index = data.indexOf(1)
```

---

### Java: filter
<br>

```java
int[] data = {1, 2, 3, 4, 5};
List<Integer> result = new ArrayList<>();
for (int d : data) {
    if (d % 2 != 0) {
        result.add(d);
    }
}
```

### Kotlin: filter
<br>

```kotlin
val data = intArrayOf(1, 2, 3, 4, 5)
val result = data.filter { it -> it % 2 != 0 }
```

---

### Java: map data
<br>

```java
int[] data = {1, 2, 3, 4, 5};
for (int i = 0; i < data.length; i++) {
    data[i] += 50;
}
```

### Kotlin: map data
<br>

```kotlin
val data = intArrayOf(1, 2, 3, 4, 5)
val result = data.map { it -> it + 50 }
```

---

### Java: method `1`
<br>

```java
class ClassA {
    public static String sayHi() {
        return "Hi";
    }

    public String hello() {
        return "Hello";
    }
}
```

### Kotlin: function `1`
<br>

```kotlin
class ClassA {
    fun hello(): String {
        return "Hello"
    }

    companion object {
        fun sayHi(): String {
            return "Hi"
        }
    }
}
```

---

### Java: method `2`
<br>

```java
class ClassA {
    public static String sayHi(String msg) {
        return msg;
    }

    public String hello(String msg) {
        return msg;
    }
}
```

### Kotlin: function `2`
<br>

```kotlin
class ClassA {
    fun hello(msg: String): String {
        return msg
    }

    companion object {
        fun sayHi(msg: String?): String? {
            return msg
        }
    }
}
```

หรือ
<br>
<br>


```kotlin
class ClassA {
    fun hello(msg: String): String = msg

    companion object {
        fun sayHi(msg: String?): String? = msg
    }
}
```

kotlin มันสามารถเขียน function ใน function ได้
<br>
<br>


```kotlin
fun sayHi(): String {
    fun hello(name: String): String = "Hello $name"
    return hello("Hi")
}
```

---

### Lambda Expressions สำหรับสายย่อ 
<br>

เป็นการเขียนโปรแกรมแบบ Functional Programming เพื่อช่วยจัดการ functional ให้กระชับมากขึ้น
<br>
<br>

### Java 7: without lambda expressions
<br>

```java
mButton.setOnClickListener(new View.OnClickListener() {
    @Override
    public void onClick(View v) {
        // do something here
    }
});
```

### Java 8: lambda expressions
<br>

```java
mButton.setOnClickListener((View v) -> {
    // do something here
});
```

### Kotlin: lambda expressions
<br>

```kotlin
mButton.setOnClickListener { it ->
    // do something here
}
```

หรือ
<br>
<br>


```kotlin
mButton.setOnClickListener {
    // do something here
}
```

### Kotlin: มีตัวแปรประเภท function

- แบบไม่มีการรับค่า
<br>

```kotlin
val myFun: () -> Unit = { println("Hello Function") }
myFun()         // Hello Function
myFun.invoke()  // Hello Function
```

- แบบมีการรับค่า
<br>

```kotlin
val sayHi: (String) -> Unit = { name ->  println("Hello $name") }
sayHi("Hi")         // Hello Hi
sayHi.invoke("Hi")  // Hello Hi
```

---

### Java: extends
<br>

```java
class ClassA extends ClassB {

}
```

### Kotlin: extends
<br>

```kotlin
class ClassA : ClassB() {
    
}
```

---

### Java: extends abstract
<br>

```java
abstract class AbstractA {
    abstract String hello();
}

class ClassA extends AbstractA {

}
```

### Kotlin: extends abstract
<br>

```kotlin
abstract class AbstractA {
    abstract fun hello(): String
}

class ClassA : AbstractA() {
    
}
```

---

### Java: implements interface
<br>

```java
interface InterfaceB {
    void hello();
}

class ClassA implements InterfaceB {
    
}
```

### Kotlin: implements interface
<br>

```kotlin
interface InterfaceB {
    fun hello()
}

class ClassA : InterfaceB {
    
}
```

---

### Java: implements interface
<br>

```java
interface InterfaceB {
    void hello();
}

class ClassB {
    private InterfaceB inf;

    public void setInterfaceB(InterfaceB inf) {
        this.inf = inf;
    }
}

class ClassA {

    private ClassB classB;

    public ClassA(ClassB classB) {
        this.classB = classB;
    }

    public void onCreate() {
        if (classB != null) {
            classB.setInterfaceB(new InterfaceB() {
                @Override
                public void hello() {
                    
                }
            });
        }
    }

}
```

### Kotlin: implements interface
<br>

```kotlin
interface InterfaceB {
    fun hello()
}

class ClassB {
    private var inf: InterfaceB? = null

    fun setInterfaceB(inf: InterfaceB) {
        this.inf = inf
    }
}

class ClassA(private val classB: ClassB?) {

    fun onCreate() {
        classB?.setInterfaceB(object : InterfaceB {
            override fun hello() {

            }
        })
    }

}
```

---

### Java: static
<br>

```java
class ClassA {
    static {
        String a = "";
    }
}
```

### Kotlin: init
<br>

```kotlin
class ClassA {
    init {
        var a = ""
    }
}
```

---

### Kotlin: Extension
<br>

```kotlin
open class Base
class Extended: Base()
fun Extended.foo() = "Extended!"
```

---

### Java: Return
<br>

```kotlin
public String sayHi(boolean flag) {
    if (flag) {
        return "True";
    } else {
        return "Else";
    }
}
```

### Kotlin: Return
<br>

```kotlin
fun sayHi(flag: Boolean): String {
    return if (flag) {
        "True"
    } else {
        "Else"
    }
}
```

---

### Java: Generic Type
<br>

```java
public interface OnItemClickListener<T> {
    void onClick(View v, T data);
}
```

### Kotlin: Generic Type
<br>

```kotlin
interface OnItemClickListener<T> {
    fun onClick(v: View, data: T);
}
```
---


ส่วนที่เหลือไว้ไปเรียนรู้ตอนลงงานจริง แฮร่ ๆ
<br>
<br>


