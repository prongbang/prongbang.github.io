---
layout: post
title:  "[React] มาดูวิธีการส่งค่าผ่าน Props ไปอีก Component ใน React"
short_description: "Component 1 ส่งค่าไปให้ Component 2"
date: 2018-06-14 09:46:00 +0700
categories: react
tags: [react]
cover_image: /assets/images/react/5.png
author: "Devไปวันๆ"
---

### สิ่งที่เราต้องการคือ
<br>

ส่งค่าจาก Component 1 ไปให้ Component 2 ทำการหาพื้นที่สีเหลี่ยมผืนผ้า แล้วส่งผลลัพธ์ที่ได้กลับมาให้ Component 1 ผ่าน props ที่ชื่อว่า `_onAnswer`

- เริ่มจากสร้าง Component 2 ก่อน ตามนี้

{% highlight jsx %}
import React, {Component} from 'react'

export default class Component2 extends Component {

   constructor(props) {
      super(props)
      this.state = {
         length: this.props.length,   
         width: this.props.width     
      }
   }

   componentDidMount() {

       // คำนวณหาพื้นที่สีเหลี่ยมผืนผ้า กว้าง x ยาว
       let answer = this.state.length * this.state.width

       // ส่งผลลัพธ์กลับไปให้ Component 1 ผ่านฟังก์ชันชื่อ onAnswer
       this.props._onAnswer(answer)

   }

   render() {
      // ที่ใส่เป็น null เพราะอยากให้ Component 2 render เป็นค่าว่าง
      return (
          null
      )
   }
}
{% endhighlight %}

- ต่อไปก็สร้าง Component 1 และเรียกใช้งาน Component 2

{% highlight jsx %}
import React, {Component} from 'react'
import Component2 from './Component2'

export default class Component1 extends Component {

   constructor(props) {
      super(props)
      this.state = {
         answer: 0,   // เก็บผลลัพธ์
         length: 4,   // เก็บค่าความยาว
         width: 5     // เก็บค่าความกว้าง
      }
   }   

   onAnswer(answer) {
      // รับค่าจาก Component 2 ผ่าน props _onAnswer
      // update ข้อมูล answer ใน state
      // เมื่อ react รู้ว่า state มีการเปลี่ยนแปลงมันจะทำการ render ให้ใหม่
      this.setState({answer: answer})
   }

   render() {
      const { answer, length, width } = this.state
      return (
         <div>
            {/* ส่งค่าผ่าน props เพื่อให้ Component 2 คำนวณให้ */}
            <Component2 
                length={length} 
                width={width} 
                _onAnswer={this.onAnswer.bind(this)}/>
 
            {/* แสดงผลลัพธ์ */}
            <h1>Answer: {answer}</h1>
         </div>
      )
   }

}
{% endhighlight %}
<br>

ที่ใช้ “bind(this)” เพราะว่าต้องการผูกกับ Component 1 เพื่อให้ใช้อ้างอิงถึง state เราจะได้ update state ใน Component 1 ได้ 
<br>
<br>

`** ถ้าไม่ใส่ “bind(this)” Component 1 มันจะมองว่าฟังก์ชัน onAnswer เป็นของ Component 2`

<br>

** เมื่อ Compoment เพิ่มมากขึ้น การที่เราจะจัดการกับ state ก็จะยากขึ้น การส่งค่าแบบนี้ก็ยิ่งซับซ้อนขึ้น แนวทางแก้ปัญหานี้ก็คือใช้ redux หรือ mobx เข้ามาช่วยจัดการกับ state แทน

<br>