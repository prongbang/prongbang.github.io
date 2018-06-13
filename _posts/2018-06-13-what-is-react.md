---
layout: post
title:  "[React] React คืออะไร ? แบบรวบรัด!"
short_description: "หลาย ๆ อาจจะเคยได้ยินคนเอามาพูกกันเยอะว่ามันคืออะไร ทุกวันนี้มีบริษัทหลายที่ที่ใช้ React กัน เผื่อว่ามีใครอยากเอามาประดับโปรไฟล์ให้เท่ ๆ"
date: 2018-06-13 19:58:00 +0700
categories: react
tags: [react]
cover_image: /assets/images/react/2.png
author: "end try"
---

### React คือ JavaScript Library ที่ไว้จัดการหน้า View จะมีอยู่ 3 Concept คือ

1. Component (ส่วนประกอบ)
<br>

React มันจะมองส่วนต่าง ๆ ในหน้าเว็บเป็น `Component` ทั้งหมด เพื่อรองรับการ Reuse โดยที่เราไม่ต้องมาเขียน code ใหม่ เช่น button, header, footer, ... เป็นต้น

2. State
<br>

React มันจะเก็บข้อมูลต่าง ๆ ที่อยู่ใน `Component` นั้น ๆ ไว้ที่ State ถ้าพูดง่าย ๆ State ก็คือ ตัวเก็บข้อมูลของ `Component` นั้น ๆ นั่นเอง  (ใครงงยกมือเลยครับ) โดย State จะประกาศไว้ใน constructor ลองดูตาม code นี้
{% highlight js %}
class MyComponent extends Component {

    constructor() {
       super(); // คือการอ้างอิงไปยัง class แม่ก็คือ class Component
       this.state = {
          isState: "",
          myState: ""
       };
    }   

}
{% endhighlight %}

ถ้าเราต้องการเปลี่ยนแปลงค่าใน state ที่ชื่อว่า isState เราก็แค่เรียกใช้ฟังก์ชัน setState ตามนี้
{% highlight js %}
this.setState({isState: "Update State"});
{% endhighlight %}

หรือถ้าเราต้องการเปลี่ยนแปลงค่าใน state หลาย ๆ ค่าเราก็สามารถทำได้ ตามนี้
{% highlight js %}
this.setState({isState: "Update State", myState: "Update My State"});
{% endhighlight %}

3. Props (Properties)
<br>

เป็นการกำหนดคุณสมบัติให้กับ Component นั้น ๆ เพื่อใช้ส่งข้อมูลจาก Component หนึ่ง ไปให้อีก Component หนึ่ง ถ้ามองภาพไม่ออก ลองดูจาก  code นี้
{% highlight js %}
<MyComponent myProperties={"I'm properties"} />
{% endhighlight %}

จะเห็นว่ามีการกำหนดคุณสมบัติให้กับ Component ชื่อว่า myProperties โดยกำหนดค่าเป็น “I’m properties” ซึ่งเป็นการเขียนแบบ JSX ([JavaScript Syntax Extension](https://facebook.github.io/jsx/)) เป็นการเขียนที่คล้ายกับ XML โดยที่เราสามารถนำชื่อ class มาใช้เป็น tag ได้ ซึ่งจากตัวอย่าง “MyComponent” ก็คือชื่อ class นั่นเอง และยังสามารถแทรก JavaScript โดยใช้ {} ได้อีกด้วย

<br>

### React มันยังสามารถเขียน Mobile App Cross Platform ได้ทั้ง Android และ IOS หรือเรียกว่า “React Native” ซึ่งมี Concept เหมือนกันกับ ReactJS เลย จะต่างกันที่วิธีเขียน Component และวิธีการรัน เช่น
<br>

- ReactJS จะใช้แท็กเดียวกันกับ html และใช้ className แทน class
{% highlight js %}
<div className="container"><h1>Hello ReactJS</h1></div>
{% endhighlight %}

- React Native จะใช้ [Component](https://facebook.github.io/react-native/docs/button.html) ที่ React Native เตรียมมาให้ซึ่งแต่ละ Platform จะมี Component ต่างกันบางตัว และใช้ style แทน class ซึ่งจะเขียนในรูปแบบ JSON + CSS และใช้ ‘ แทน “ และจะใช้ backgroundColor แทน background-color โดยจะเอา - ออกให้ให้ตัวถัดไปเป็นตัวพิมพ์ใหญ่
{% highlight js %}
var style = {
    background: {
        backgroundColor:'#841584'
    }
};
<View>
  
  <Text style={style.background}>Hello React Native</Text>
  
  <Button   
    onPress={onPressLearnMore}   
    title="Learn More"   
    color="#841584"   
    accessibilityLabel="Learn more about this purple button" />

</View>
{% endhighlight %}

### จุดเด่นของ React
<br>
- Render ได้ทั้งฝั่ง Server และ Client จึงทำให้ React สามารถเขียนเว็บแบบ “Isomorphic JavaScript” หรือ “Universal JavaScript” ได้ 

“Isomorphic JavaScript” หรือ “Universal JavaScript”  คือ รูปแบบการเขียนโค้ดด้วยภาษา JavaScript ทั้งฝั่ง Server และ Client 

<br>

### จุดเด่นของ “Isomorphic JavaScript” หรือ “Universal JavaScript”
- สามารถทำ SEO ได้
- โหลดเว็บแบบ SPA ครั้งแรกไม่กระตุก เนื่องจาก Server และ Client ช่วยกัน Render
- ใช้โค้ดด้วยภาษา JavaScript ทั้งฝั่ง Server และ Client 

<br>
เท่านี้ก่อนแล้วกันเดี๊ยวจะเบื่อไปซะก่อน ~


{% highlight js %}

{% endhighlight %}