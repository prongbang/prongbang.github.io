---
layout: post
title:  "[React] มาดูวิธีใช้งาน Redux ใน React กัน แบบ Step by Step"
short_description: "การที่จะเข้าใจ Redux ได้นั้นมันยากยิ่งนัก ซึ่งทำให้ใครหลาย ๆ คนล้มเลิกที่จะเขียน React ไปซะส่วนใหญ่ แต่วันนี้เราจะมาจีบ Redux แบบบ้าน ๆ กัน"
date: 2018-06-17 20:19:44 +0700
categories: react
tags: [react]
cover_image: /assets/images/react/6.png
author: "end try"
---

### ก่อนจะเริ่มเรามาดูความหมายของ Redux กันก่อน
<br>

Redux เป็นไลบรารี่ที่เข้ามาช่วยจัดการกับ State โดยการรวม State ทั้งหมดมาไว้ที่เดียวกัน เพื่อให้แต่ละ Component สามารถเรียกใช้งาน State ได้อย่างอิสระ และเมื่อไหร่ที่ข้อมูลใน `state` มีการเปลี่ยนแปลงใน `store` Component ไหนที่มีการ subscribe `state` อยู่ก็จะทำการ `render` เพื่ออัพเดทค่าให้โดยอัตโนมัติ

<br>
### 4 คำที่เราต้องรู้แบบไม่ต้องเน้นหลักการอะไรให้มากมาย

- `State`     คือ ข้อมูลที่เก็บไว้ใน `Store`
- `Store`     คือ ที่เก็บ `State` ซึ่งสามารถเก็บได้หลาย `State`
- `Reducer`   คือ ตัวจัดการ `State` ภายใน `Store` ซึ่งแต่ละ `Reducer` จะจัดการกับ `State` ของตัวเองเท่านั้น
- `Action`    คือ เป็นตัวบอกว่าจะให้ `Reducer` ทำอะไรกับ `State` ที่อยู่ใน `Store`

### ทำความรู้จักกับ `State` 
<br>

`State` ข้อมูลที่ไม่ตายตัว เช่น ข้อความ, Object, Array เป็นต้น 
<br><br>
ตัวอย่างของ `State` แบบ `Object`
{% highlight json %}
{ data: "State" }
{% endhighlight %}

### ทำความรู้จักกับ `Action`
<br>
จะเป็นตัวกำหนดว่าถ้าใช้ `Key` นี้จะให้ Reducer ทำอะไร และนี่คือหน้าตาของ `Action` ที่กำหนด `Key` ชื่อว่า `'INCREMENT'`
{% highlight js %}
const INCREMENT = 'INCREMENT'
{% endhighlight %}

เวลาเราจะสั่งให้ `Reducer` ทำงานเราเรียกใช้ผ่านตัวนี้ โดยส่งชื่อ `Key` ชื่อ `INCREMENT` ของเราเข้าไป และถ้าอย่างส่งค่าเข้าไปด้วยก็จะส่งแบบนี้ 
{% highlight js %}
dispatch({
  type: INCREMENT,
  text: 'Hello Redux'
})
{% endhighlight %}

** ชื่อ Key `type` หรือ `text` อาจจะเป็นชื่ออื่นก็ได้ แต่ว่าชื่อนี้เราจะต้องนำไปใช้ที่ `Reducer` ด้วย ถ้าอยากจะเปลี่ยนเป็นชื่ออื่นก็ให้ไปเปลี่ยนที่ `Reducer` ด้วยนะครับ
<br>
<br>

### ทำความรู้จักกับ `Reducer`
<br>
ในทางเทคนิค `Reducer` เป็นฟังก์ชันที่มีการรับค่า Parametor อยู่ 2 ตัวด้วยกัน คือ `(state, action)` โดยจะรับค่า `State` ล่าสุดมา และ `Action` ที่เราส่งมาว่าจะให้มันทำอะไร เดี๋ยวจะยกตัวอย่างให้ดูว่าหน้าตาของ `Reducer` แบบโง่ ๆ ให้ดูตามนี้
{% highlight js %}
// reducers/counter.js
var initialState = { couter: 0, text: "" }

function counterReducer(state = initialState, action) {
  switch (action.type) {
  case 'INCREMENT':
    return {
        couter: state.couter + 1,
        text: action.text
    }
  case 'DECREMENT':
    return {
        couter: state.couter - 1,
        text: action.text
    }
  default:
    return state
  }
}

export default counterReducer;
{% endhighlight %}

** ถ้าใครเป็นคนช่างสังเก็ดเราจะเห็นว่าในโค้ดมีการเรียกใช้ `action.type` ซึ่งก็หมายความว่า มันอยากรู้ว่าเราส่ง `Action` อะไรมาให้นั่นเอง และมีการเรียกใช้ `action.text` ซึ่งก็หมายความว่า มันดึงเอาค่าที่เราส่งมาจาก `Action` นั่นเอง
<br>

- การทำงานของ Reducer คือ จะทำงานก็ต่อเมื่อมีการส่ง `Action` มาให้ ถ้ามีการส่ง `Action` มาให้ แล้วเป็นการทำงานในครั้งแรกมันจะใช้ค่า `initialState` เป็นค่าเริ่มต้น จากนั้นมันก็จะทำการเช็คค่าก่อนว่า `Key` ของ `Action` ที่ส่งมาเข้าเงื่อนไขไหน เช่น ถ้าเข้าเงื่อนไข `INCREMENT` มันจะทำการดึงค่าของ `State` ล่าสุดมาใช้นั่นคือ `state.couter` แล้วเพิ่มค่าไปอีก 1  และดึงค่าจาก Action ที่ส่งมาด้วยคือ `action.text` จากนั้นก็ส่งค่ากลับไปเก็บไว้ที่ `Store` ส่วนใครที่ทำการ `subscribe` ข้อมูลใน `Store` ไว้ก็จะได้ข้อมูลของ `State` แบบ `Realtime` เลยทีเดียว โคตรคูล! ส่วนเงื่อนไขอื่น ๆ ก็จะคล้าย ๆ กัน
<br>
<br>
** ว่าแต่ในแอพของเรามันไม่ได้มี `Reducer` แค่ตัวเดียว แล้วเราจะจัดการยังไงกับตัว `Reducer` ตัวอื่น ๆ ละ ไม่ต้องกังกลไปเจ้า `Redux` มันมีตัวรวม `Reducer` มาให้ชื่อว่า `combineReducers` นั่นเอง มาดูว่ามันเอาแต่ละ `Reducer` มารวมกันยังไง วิธีรวมของมันจะเป็นประมาณนี้คือ กำหนด `key:reducer` ตามโค้ดด้านล่างนี้ 

{% highlight js %}
// reducers/index.js
import { combineReducers } from 'redux'
import counterReducer from './counter'
import authReducer from './auth'

export default combineReducers({
    counter: counterReducer,
    auth: authReducer
})
{% endhighlight %}

หรือจะไม่กำหนดเป็น `key:reducer` ก้ได้โดยใช้แบบนี้แทน

{% highlight js %}
// reducers/index.js
import { combineReducers } from 'redux'
import counterReducer from './counter'
import authReducer from './auth'

export default combineReducers({
    counterReducer,
    authReducer
})
{% endhighlight %}

### ทำความรู้จักกับ `Store` 
<br>
วิธีการสร้าง `Store` ตามนี้เลย นี่เป็นเพียงตัวอย่างแบบง่าย ๆ คือเรียกใช้ฟังก์ชัน `createStore` แล้วส่งฟังก์ชันของ `reducer` เข้าไปเพื่อสร้าง `Store` ที่มีความสามารถในการจัดการกับข้อมูลตามความสามารถของแต่ละ `Reducer`
{% highlight js %}
import reducer from './reducers'
import { createStore } from 'redux'

const store = createStore(reducer)
{% endhighlight %}

** `reducer` คือ ชื่อฟังก์ชันที่เป็น `combineReducers` ที่เราสร้างเพื่อรวม Reducer ก่อนหน้านี้

<br>
### การเรียกใช้งาน
<br>

มาดูว่าการเรียกใช้งาน `Store`, `Reducer`, `Action` และ `State` จะใช้ท่าไหนมาดูเป็น `Code` เลยแล้วกัน

- สร้างโปรเจคโดยใช้ `create-react-app` การที่เราจะใช้คำสั่งนี้ได้เราต้องลง Node.js ก่อนนะ
{% highlight shell %}
npx create-react-app easy-redux
{% endhighlight %}

- การที่เราจะใช้ `redux` ได้นั้น เราต้องลงไลบรารีเพิ่มตามนี้
{% highlight shell %}
npm install --save redux
npm install --save react-redux
{% endhighlight %}

- เริ่มวางโครงสร้างของโปรเจค โดยในที่นี่เราจะสร้างประมาณนี้ใน `src`
{% highlight shell %}
src
├── App.js
├── actions
│   └── index.js
├── components
│   └── counter.js
├── index.js
├── reducers
│   ├── counter.js
│   └── index.js
{% endhighlight %}

### ใน `actions` เราจะเก็บ Key ที่เป็น action โดยสร้างไฟล์ชื่อว่า `index.js` เพื่อเป็น index ไฟล์ในโฟล์เดอร์ เวลาเราเรียกใช้ตอน `import` จะได้ไม่ต้องอ้างถึงชื่อไฟล์
{% highlight jsx %}
export default class Action {

    static INCREMENT = 'INCREMENT'
    static DECREMENT = 'DECREMENT'

}
{% endhighlight %}

### ใน `components` เราจะเก็บไฟล์ที่เป็น Component เพื่อให้หน้าอื่น ๆ สามารถหยิบไปใช้งานได้ โดยในที่นี้เราจะสร้างไฟล์ชื่อ `counter.js` โดยมีการทำงานคือ 1.แสดงค่า 2.ปุ่มเพิ่มค่า 3.ปุ่มลดค่า โดยมีการรับค่าผ่าน `props` ตามนี้
{% highlight jsx %}
import React from 'react'

class Counter extends React.Component {
  render() {
    const { value, onIncrement, onDecrement } = this.props
    return (
      <p>
        <br/>
        Clicked: {JSON.stringify(value)} times
        <br/>
        <br/>
        <button className="ampstart-btn ampstart-btn-secondary" onClick={onIncrement}>
          +
        </button>
        {' '}
        <button className="ampstart-btn ampstart-btn-secondary" onClick={onDecrement}>
          -
        </button>
      </p>
    )
  }
}

export default Counter
{% endhighlight %}

### ใน `reducers` เราจะเก็บไฟล์ที่ทำหน้าที่จัดการกับ `state` ต่าง ๆ ในแอพของเรา ​ซึ่งมีได้หลาย `reducer` โดยในที่นี่จะมีอยู่ 2 ไฟล์ด้วยกันคือ `counter.js` และ `index.js` 

<br>
ไฟล์ `counter.js` คือ `reducer` ที่มีหน้าที่จัดการกับ `state` ของ couter หน้าตาของมันจะประมาณนี้
{% highlight jsx %}
import Action from '../actions' 

var initialState = {
    couter: 0,
    text: ""
}

function counterReducer(state = initialState, action) {
    switch (action.type) {
        case Action.INCREMENT:
            return {
                couter: state.couter + 1,
                text: action.text
            }
        case Action.DECREMENT:
            return {
                couter: state.couter - 1,
                text: action.text
            }
        default:
            return state
    }
}

export default counterReducer;
{% endhighlight %}

<br>
ไฟล์ `index.js` คือ `combineReducers` ที่ทำหน้าที่รวม `Reducer` หน้าตาของมันจะประมาณนี้
{% highlight jsx %}
import { combineReducers } from 'redux'
import counterReducer from './counter'

export default combineReducers({
    counter: counterReducer
})
{% endhighlight %}

### ต่อไปจะเป็นส่วนของการสร้าง `store` และการนำไปใช้งาน โดยเราจะไปเขียนเรียกใช้งานในไฟล์ `index.js` หน้าตาของมันจะประมาณนี้
{% highlight jsx %}
...

import { createStore } from 'redux'
import { Provider } from 'react-redux'
import reducer from './reducers'

const store = createStore(reducer)

ReactDOM.render(  
    <Provider store={store}>
        <App />
    </Provider>, 
    document.getElementById('root')
);

...
{% endhighlight %}

** โดยการทำงานของมันคือ สร้าง `store` ผ่านฟังก์ชัน `createStore` โดยส่ง `combineReducers` เข้าไป จากนั้นก็ส่ง `store` เข้าไปใน `Provider` ผ่าน `props` ที่ชื่อว่า `store` เพื่อให้ `Component` ทั้งหมดในแอพของเราสามารถเรียกใช้งาน `store` ได้
<br>
<br>

### ต่อไปจะเป็นส่วนของการเรียกใช้งานใน Component ในที่นี้เราจะเรียกใช้งานใน Component ที่ชื่อว่า `App` ก่อนที่เราจะเรียกใช้เรามารู้จักกับ 3 คำนี้ก่อน

- `mapStateToProps` คือ ฟังก์ชันที่ทำหน้าที่ยัด `state` เข้าไปใน `props` 
- `mapDispatchToProps` คือ ฟังก์ชันที่ทำหน้าที่ยัด `ฟังก์ชันของ action` ที่เป็นตัวไปบอกให้ `reducer` ทำงานตามที่กำหนดผ่าน `dispatch` เข้าไปใน `props` 
- `connect` คือ ฟังก์ชันที่ทำหน้าที่ยัด `mapStateToProps` และ `mapDispatchToProps` เพื่อให้ `Component` ที่ `connect` กับ `store` สามารถเข้าถึง `state` และ `ฟังก์ชันที่เป็น dispatch` ผ่าน `props` ได้นั้นเอง

<br>
ถ้ามองไม่เป็นภาพว่ามันเรียกใช้งานยังไงมาดูโค้ดของแต่ละส่วนกันโดยเราจะเริ่มตามลำดับตามนี้

- `mapStateToProps` มีวิธีเรียกใช้งานประมาณนี้
{% highlight jsx %}
const mapStateToProps = state => ({
  counter: state.counter
});
{% endhighlight %}
** การยัด `state` เข้าไปใน `props` มันมีหลักการเรียกใช้คือ "คีย์ของ state : state.ชื่อคีย์ที่เรากำหนดไว้ใน combineReducers" ถ้าเราเอามาแทนค่าจะได้แบบนี้

- `คีย์ของ state` <-> `counter` (เราควรตั้งชื่อคีย์ที่สื่อความหมายตาม state ของเรา)
- `state.ชื่อคีย์ที่เรากำหนดไว้ใน combineReducers` <-> `state.counter` (คือส่วนนี้ `counter: counterReducer`)

เมื่อเอามารวมกันก็จะได้แบบนี้
{% highlight jsx %}
counter: state.counter
{% endhighlight %}

- `mapDispatchToProps` สามารถทำได้อยู่ 2 วิธีด้วยกันคือ `dispatch` กับ `bindActionCreators` แล้วสองตัวนี้ต่างกันยังไงมาดู
<br>
<br>
การใช้ `dispatch` เราจะต้องกำหนดฟังก์ชันของ `action` ประมาณนี้
{% highlight jsx %}
const mapDispatchToProps = dispatch => ({
    increment: () => dispatch({type: Action.INCREMENT, text: "INCREMENT Redux"}),
    decrement: () => dispatch({type: Action.DECREMENT, text: "DECREMENT Redux"}),
});
{% endhighlight %}

วิธีเรียกใช้จะประมาณนี้
{% highlight jsx %}
this.props.increment();
this.props.decrement();
{% endhighlight %}

ส่วนการใช้ `bindActionCreators` เราจะต้องกำหนดฟังก์ชันประมาณนี้ มันคือการเขียน `action` เป็นแบบฟังก์ชัน โดยส่งเข้าไปให้ `bindActionCreators` ทำการ `bind` ฟังก์ชันเข้าไปใน `props`
{% highlight jsx %}
import { bindActionCreators } from 'redux'
import * as counterActions from '../action/counter'

const mapDispatchToProps = dispatch => ({
  counterActions: bindActionCreators(counterActions, dispatch)
})
{% endhighlight %}

แต่ว่าเราจะต้องสร้างฟังก์ชันที่เป็น `action` ของ `couter` ประมาณนี้
{% highlight jsx %}
// action/counter.js
import Action from './';

export function increment(data) {
    return {
        type: Action.INCREMENT,
        text: data
    }
}

export function decrement(data) {
    return {
        type: Action.DECREMENT,
        text: data
    }
}
{% endhighlight %}

วิธีเรียกใช้จะประมาณนี้
{% highlight jsx %}
// this.props.ชื่อคีย์.ชื่อฟังก์ชันของaction();
this.props.counterActions.increment("Increment Redux");
this.props.counterActions.decrement("Decrement Redux");
{% endhighlight %}

- `connect` มีวิธีเรียกใช้งานประมาณนี้
{% highlight jsx %}
export default connect(mapStateToProps, mapDispatchToProps)(App);
{% endhighlight %}

<br>
มาดูโค้ดแบบเต็ม ๆ กัน
{% highlight jsx %}
import { connect } from 'react-redux'
...
import Action from './actions';
import Counter from './components/counter';

class App extends Component {

  render() {
    return (
      <div className="App">
        <Counter
          value={this.props.counter}
          onIncrement={() => this.props.increment()}
          onDecrement={() => this.props.decrement()}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  counter: state.counter
});

const mapDispatchToProps = dispatch => ({
    increment: () => dispatch({type: Action.INCREMENT, text: "INCREMENT Redux"}),
    decrement: () => dispatch({type: Action.DECREMENT, text: "DECREMENT Redux"}),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
{% endhighlight %}

นี่คือหน้าตาของแอพที่เราอธิบายการทำงานของ Redux โคตรช็อคมีแค่นีเหรอ ~
<img src="/assets/images/react/6-1.png"/>

<br>
"จบแล้วครับ หากผิดพลาดประการใดขออภัยณที่นั้นด้วย"
<br>
<br>

** สามารถดูโค้ดแบบเต็ม ๆ ไดที่นี่เลยครับ[จิ้มเลย](https://raboninco.com/XBQK)

<br>