---
layout: post
title:  "[React] ทำความรู้จักกับวงจรชีวิตของ React Component (Component Lifecycle)"
short_description: "มาดูว่าตั้งแต่เกิดจนโตแล้วก็ตายไปเจ้าตัว React ต้องเจอเหตุการณ์อะไรบ้าง"
date: 2018-06-13 21:28:00 +0700
categories: react
tags: [react]
cover_image: /assets/images/react/3.png
author: "Devไปวันๆ"
---

### Component Lifecycle ของ React มีอยู่หลายท่าเหมือนกัน ดูนี่ ๆ

- จะทำงานเมื่อ Component นั้น ๆ ถูกโหลดขึ้นมาทำงานก่อน render
{% highlight js %}
componentWillMount?(): void;
{% endhighlight %}

- จะทำงานเมื่อ Component นั้น ๆ ทำการ render เสร็จแล้ว
{% highlight js %}
componentDidMount?(): void;
{% endhighlight %}

- จะทำงานเมื่อ Component นั้น ๆ ได้รับ props ค่าใหม่
{% highlight js %}
componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void;
{% endhighlight %}

- จะทำงานเมื่อมีการ update state หรือ props โดยจะทำงานก่อน render
{% highlight js %}
componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void;
{% endhighlight %}

- จะทำงานเมื่อมีการ update state หรือ props โดยจะทำงานหลังจาก render เสร็จแล้ว
{% highlight js %}
componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, prevContext: any): void;
{% endhighlight %}

- จะทำงานเมื่อ Component นั้น ๆ ถูกปิดลง หรือถูกเอาออกจาก DOM
{% highlight js %}
componentWillUnmount?(): void;
{% endhighlight %}

<br>
สามารถลองของได้ที่นี้ [กดตรงนี้](https://reactjs.org/)