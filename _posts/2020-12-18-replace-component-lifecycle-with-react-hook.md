---
layout: post
title: "[React] เปลี่ยน Component Lifecycle มาใช้ useEffect ใน React Hook แทน"
short_description: "เปรียบเทียบว่าการเขียน Component Lifecycle กับ useEffect ใน React Hook ว่าใช้งานกันยังไง"
date: 2020-12-18 09:40:44 +0700
categories: react
tags: [react]
cover_image: /assets/images/react/7.png
author: "Devไปวันๆ"
---

### การใช้งาน Hook จะต้องเรียกใช้ใน function components ประมาณนี้

{% highlight jsx %}
const ExampleHook = () => {
    useEffect(() => {
        console.log('Hello World');
    }, [])
}
{% endhighlight %}

### เปลี่ยน Component Lifecycle มาใช้ useEffect

<br/>

#### 1. componentDidMount

{% highlight jsx %}
// Component Lifecycle
class ExampleHook extends Component {
    componentDidMount() {
        console.log('Hello World');
    }
}

// useEffect
const ExampleHook = () => {
    useEffect(() => {
        console.log('Hello World');
    }, [])
}
{% endhighlight %}

#### 2. componentDidUpdate

{% highlight jsx %}
// Component Lifecycle
componentDidUpdate(prevProps) {
    console.log(`Hello World ${prevProps}`);
}

// useEffect
useEffect(() => {
    console.log('Hello World');
}, [prevProps])
{% endhighlight %}

#### 3. componentWillUnmount

{% highlight jsx %}
// Component Lifecycle
componentWillUnmount() {
    console.log('Hello World');
}

// useEffect
useEffect(() => {
    console.log('Hello World');
    return () => {
        console.log('Do something...');
    }
}, [])
{% endhighlight %}

### ถ้าถนัดใช้งานแบบ Component Lifecycle สามารถใช้แบบนี้ได้

{% highlight tsx %}
import { useEffect, useRef, EffectCallback, DependencyList } from "react";

export const componentDidMount = (handler: EffectCallback) => useEffect(() => handler(), []);

export const componentDidUpdate = (handler: EffectCallback, deps: DependencyList) => {
    const isInitialMount = useRef(true);
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        return handler();
    }, deps);
};

export const componentWillUnmount = (handler: EffectCallback) => useEffect(() => {
    return () => handler()
}, []);
{% endhighlight %}

<br>
การเปรียบเทียบการใช้งานระหว่าง Component Lifecycle กับการใช้ useEffect ใน React Hook มีเพียงเท่านี้หวังว่าจะเป็นประโยชน์กับคนที่หลงเข้ามาอ่านนะ Happy Coding ครับ
<br>