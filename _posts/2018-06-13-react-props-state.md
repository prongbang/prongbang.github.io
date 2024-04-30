---
layout: post
title:  "[React] ทำความรู้จักกับ Props และ State ใน React"
short_description: "เป็นสิ่งที่เราไม่ควรมองข้ามอย่างยิ่ง เพราะมันจำเป็นอย่างยิ่ง"
date: 2018-06-13 21:45:20 +0700
categories: react
tags: [react]
cover_image: /assets/images/react/4.png
author: "Devไปวันๆ"
---

### Props คืออะไร ?
<br>

`props` ย่อมาจาก `properties` มันเป็นตัวที่ทำให้ React `Component` นึง สามารถส่งข้อมูลต่างๆ ไปอีก `component` นึงได้ มันสามารถส่งค่าเป็น “Integer, Float, String, Object, Array หรือแม้แต่ Function” ก็ยังได้
<br>
<br>

### หน้าตาของการส่งค่าผ่าน `props` ใน React ก็จะประมาณนี้

- ส่งค่า String
{% highlight js %}
<MyComponent myPropsString={"Send data"} />
{% endhighlight %}

- ส่งค่า Float
{% highlight js %}
<MyComponent myPropsFloat={3.42} />
{% endhighlight %}

- ส่งค่า Integer
{% highlight js %}
<MyComponent myPropsInteger={342} />
{% endhighlight %}

- ส่งค่า Object
{% highlight js %}
let obj = {id:1, name: 'i am object'};
<MyComponent myPropsObject={obj} />
{% endhighlight %}

- ส่งค่า Array
{% highlight js %}
let arr = [{id:1, name: 'i am array'}];
<MyComponent myPropsObject={arr} />
{% endhighlight %}

- ส่งค่า Function
{% highlight js %}
iAmFunction() {
   // todo something ...
}

<MyComponent myPropsFunction={this.iAmFunction.bind(this)} />
{% endhighlight %}

### ส่วนการรับค่าของ `props` นั่นแสนง่าย เพียงแค่ใช้ “this.props.ชื่อของ `props` ที่เราส่งผ่าน component” เช่น เราถ้าเราส่งค่าผ่าน `props` ชื่อ “iAmProps” ดูจาก code ข้างล่างนี้

- เราจะส่งค่า "Hello props" ผ่าน `props` ชื่อ `iAmProps`
{% highlight js %}
<MyComponent iAmProps={"Hello props"} />
{% endhighlight %}

- ตอนรับค่าก็จะได้ประมาณนี้
{% highlight js %}
let message = this.props.iAmProps;
{% endhighlight %}
<br>

### State คืออะไร ?

`state` คือ การเก็บข้อมูลใน `Component` ของ React ซึ่งจะเก็บข้อมูลในรูปแบบของ JavaScript object นั่นเอง 

- วิธีการใช้ state ให้เราไปประกาศค่าเริ่มต้นของ state ใน constructor ก่อน ตามนี้
{% highlight js %}
constructor(props) {
   super(props)

   this.state = {
      iAmState: "Hello",
      // กำหนดค่าเริ่มต้นให้กับ state ที่ชื่อว่า iAmState เท่ากับ "Hello" 
      helloState: "State"
   }
}
{% endhighlight %}

- วิธีดึงค่าจาก state เราก็แค่เรียกใช้ “this.state.ชื่อ state ที่เราต้องการ” เช่น
{% highlight js %}
let iAmState = this.state.iAmState;
{% endhighlight %}

- วิธีการเปลี่ยนแปลงข้อมูลใน state เราจะต้องใช้ฟังก์ชัน “setState” โดยเราต้องระบุ key  ของ object ที่เป็นชื่อ state และข้อมูลที่ต้องการเปลี่ยนแปลง เช่น
{% highlight js %}
this.setState({iAmState: "Hello State"})
{% endhighlight %}

- ถ้าต้องการเปลี่ยนแปลงข้อมูล state หลายตัว เราสามารถใช้แบบนี้ได้
{% highlight js %}
this.setState({iAmState: "Hello State", helloState: "Update State"})
{% endhighlight %}

### ** ข้อควรระวังกับการใช้ “setState” 

- ไม่สามารถ “setState” ในฟังก์ชัน render และใน constructor ได้  

<br>