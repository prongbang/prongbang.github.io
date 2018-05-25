---
layout: post
title:  "[React] เมื่ออยากใช้ MobX กับ create-react-app"
short_description: "หลายคนอาจจะติดปัญหาในการ config mobx วันนี้เลยมาเขียนแชร์ประสบการณ์ไว้หน่อย ๆ"
date:   2018-05-25 23:46:00 +0700
categories: react
tags: [react]
cover_image: /assets/images/react/1.png
author: "end try"
---

### เริ่มกันเลย 
- Install `mobx`, `mobx-react` และ `react-app-rewire-mobx`
{% highlight shell %}
$ npm install --save mobx mobx-react react-app-rewire-mobx
{% endhighlight %}

- Install `react-app-rewired`
{% highlight shell %}
$ npm install react-app-rewired --save-dev
{% endhighlight %}

- สร้างไฟล์ `config-overrides.js` ภายใต้โปรเจค หรือ `root` directory 
{% highlight shell %}
+-- your-project
|   +-- config-overrides.js
|   +-- package.json
|   +-- src
{% endhighlight %}

จากนั้นเขียนโค้ดนี้ลงไป
{% highlight javascript %}
const rewireMobX = require('react-app-rewire-mobx');

module.exports = function override(config, env) {
  config = rewireMobX(config, env);
  return config;
}
{% endhighlight %}

- แก้ไขไฟล์ `package.json` ในส่วนของ `script` โดยแก้ตามนี้
{% highlight json %}
{
    "scripts": {
        "start": "react-app-rewired start",
        "build": "react-app-rewired build",
        "test": "react-app-rewired test --env=jsdom",
        "eject": "react-app-rewired eject"
    }
}
{% endhighlight %}

- ลบ `experimentalDecorators warning` ใน VS Code
ให้สร้างไฟล์ `tsconfig.json` ภายใต้โปรเจค หรือ `root` directory 
{% highlight json %}
{
    "compilerOptions": {
        "experimentalDecorators": true,
        "allowJs": true
    }
}
{% endhighlight %}
จากนั้นให้ `Restart VS Code` ใหม่

- รัน `link` กับโปรเจค
{% highlight shell %}
$ npm link
{% endhighlight %}

- รันในโหมด `Dev Server`
{% highlight shell %}
$ npm start
{% endhighlight %}

- สร้างแอปพลิเคชัน
{% highlight shell %}
$ npm run build
{% endhighlight %}

<br>
#### ตัวอย่าง `MobX + React`
- สร้างไฟล์ `CounterStore.jsx` ภายใต้ `your-project/src/store/CounterStore.jsx` เพื่อเก็บข้อมูล `state`
{% highlight jsx %}
import {observable} from 'mobx';

class CounterStore {
  @observable count = 0;
  
  increase() {
    this.count = this.count + 1;
  }
  decrease() {
    this.count = this.count - 1;
  }
}
export default new CounterStore();
{% endhighlight %}

`@observable` คือ decorator ของ mobx ที่ใช้ในการ subscribe ค่า

- สร้างไฟล์ `counter.jsx` ภายใต้ `your-project/src/components/counter.jsx` 
{% highlight jsx %}
import React from 'react';
import {observer} from 'mobx-react';

@observer
class Counter extends React.Component {
    increase = () => {
        this.props.counterStore.increase();
    }
    decrease = () => {
        this.props.counterStore.decrease();
    }
    render() {
        return (
            <div>
                <button onClick={this.increase}>+</button>
                <span>{this.props.counterStore.count}</span>
                <button onClick={this.decrease}>-</button>
            </div>
        );
    }
}
export default Counter;
{% endhighlight %}

`@observer` คือ decorator ของ mobx ที่ใช้ในการสั่งเกตุการณ์ของ state

- เรียกใช้ `CounterStore`
{% highlight jsx %}
import React from 'react';
import Counter from './components/counter';
import counterStore from './store/CounterStore';

export default class App extends React.Component {
    render() {
        return (
            <div>
                <Counter counterStore={counterStore}/>
            </div>
        );
    }
}
{% endhighlight %}

<br>
สามารถดูกว่าตั้งค่าเพิ่มเติมได้ที่ [https://github.com/timarney/react-app-rewired/tree/master/packages/react-app-rewire-mobx](https://github.com/timarney/react-app-rewired/tree/master/packages/react-app-rewire-mobx)

<br>
หากผิดพลาดประการต้องขออภัย ณ ที่ตรงนั้นด้วย...  