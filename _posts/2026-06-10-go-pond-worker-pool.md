---
layout: post
title: "[Golang] การใช้งาน pond v2 ทำ Worker Pool แบบง่ายและเร็ว"
short_description: "แนะนำการใช้งาน alitto/pond v2 ไลบรารี worker pool สำหรับ Go ตั้งแต่การจำกัด concurrency, submit task, task group, result pool, bounded queue, context, metrics และ panic recovery"
date: 2026-06-10 13:00:00 +0700
categories: [golang]
tags: [golang]
cover_image: /assets/images/golang/19.png
author: "Devไปวันๆ"
---

### pond คืออะไร

`pond` เป็น library สำหรับจัดการ worker pool ใน Go เอาไว้รันงานจำนวนมากแบบ concurrent แต่ยังควบคุมจำนวน goroutine ที่ทำงานพร้อมกันได้ ไม่ปล่อยให้ระบบสร้าง goroutine แบบไม่จำกัดจนไปชน resource เช่น database connection, HTTP API rate limit หรือ memory

จาก source ปัจจุบันของ repo นี้ module คือ

{% highlight text %}
github.com/alitto/pond/v2
{% endhighlight %}

และ `go.mod` ระบุว่าใช้ Go 1.20

จุดเด่นของ v2 คือ API สั้น ใช้ง่าย และเพิ่มของที่ใช้จริงเยอะขึ้น เช่น task ที่รอผลได้, task ที่ return error, result pool แบบ generic, task group, bounded queue, subpool, metrics, resize pool และ panic recovery

---

### ติดตั้ง

ติดตั้งด้วยคำสั่ง

{% highlight shell %}
go get -u github.com/alitto/pond/v2
{% endhighlight %}

แล้ว import

{% highlight go %}
import "github.com/alitto/pond/v2"
{% endhighlight %}

---

### สร้าง Pool แบบจำกัด Concurrency

ตัวอย่างง่าย ๆ สร้าง pool ที่ให้มี worker ทำงานพร้อมกันสูงสุด 10 ตัว

{% highlight go %}
package main

import (
	"fmt"
	"time"

	"github.com/alitto/pond/v2"
)

func main() {
	pool := pond.NewPool(10)

	for i := 0; i < 100; i++ {
		i := i
		pool.Submit(func() {
			fmt.Printf("run task #%d\n", i)
			time.Sleep(100 * time.Millisecond)
		})
	}

	pool.StopAndWait()
}
{% endhighlight %}

`pond.NewPool(10)` คือกำหนด max concurrency ไว้ที่ 10 ดังนั้นต่อให้ submit 100 task ก็จะมีงานที่รันพร้อมกันไม่เกิน 10 งาน

ส่วน `StopAndWait()` คือสั่ง stop pool และรอ task ที่ submit ไปแล้วให้จบก่อน process ออก

---

### Submit แล้วรอ Task จบ

ใน v2 `Submit` จะคืนค่าเป็น `Task` ซึ่งมี `Wait()` และ `Done()`

{% highlight go %}
task := pool.Submit(func() {
	fmt.Println("processing")
})

err := task.Wait()
if err != nil {
	fmt.Println("task failed:", err)
}
{% endhighlight %}

จาก source `Task` ถูกประกาศไว้ประมาณนี้

{% highlight go %}
type Task interface {
	Done() <-chan struct{}
	Wait() error
}
{% endhighlight %}

ดังนั้นถ้า task panic หรือ pool ถูก stop ก็สามารถรับ error ผ่าน `Wait()` ได้ ไม่ต้องทำ channel เองทุกจุด

---

### Task ที่ Return Error

ถ้างานของเรามีโอกาส error ให้ใช้ `SubmitErr`

{% highlight go %}
task := pool.SubmitErr(func() error {
	return doSomething()
})

if err := task.Wait(); err != nil {
	fmt.Println("error:", err)
}
{% endhighlight %}

เหมาะกับงานพวกเรียก external API, อ่านไฟล์, query database หรือ process job ที่ต้อง report error กลับมา

---

### Fire and Forget ด้วย Go

ถ้าไม่ต้องรอ task จบ ใช้ `Go`

{% highlight go %}
err := pool.Go(func() {
	fmt.Println("background task")
})
if err != nil {
	fmt.Println("submit failed:", err)
}
{% endhighlight %}

ต่างจาก `Submit` ตรงที่ `Go` ไม่คืน `Task` ให้รอผล ใช้กับงานที่ไม่ต้องสนใจ completion รายตัว แต่ยังอยากให้ pool คุม concurrency ให้

---

### Result Pool

ถ้าต้องการให้ task return ค่าออกมา ใช้ `NewResultPool[T]`

{% highlight go %}
pool := pond.NewResultPool[string](5)

task := pool.Submit(func() string {
	return "Hello, pond"
})

result, err := task.Wait()
if err != nil {
	fmt.Println("error:", err)
	return
}

fmt.Println(result)
{% endhighlight %}

หรือถ้า task return ทั้ง result และ error

{% highlight go %}
task := pool.SubmitErr(func() (string, error) {
	return callAPI()
})

result, err := task.Wait()
{% endhighlight %}

จาก source `ResultTask[R]` จะมี `Wait() (R, error)` ทำให้ type ของผลลัพธ์ชัดตั้งแต่ compile time

---

### Task Group

ถ้ามีงานหลายตัวที่เป็นชุดเดียวกัน ใช้ `NewGroup()`

{% highlight go %}
pool := pond.NewPool(10)
group := pool.NewGroup()

for i := 0; i < 20; i++ {
	i := i
	group.Submit(func() {
		fmt.Println("task", i)
	})
}

if err := group.Wait(); err != nil {
	fmt.Println("group error:", err)
}
{% endhighlight %}

ถ้าใช้ `SubmitErr` แล้ว task ตัวใดตัวหนึ่ง error ตัว group จะ return error แรกกลับมา

{% highlight go %}
group := pool.NewGroup()

for _, item := range items {
	item := item
	group.SubmitErr(func() error {
		return process(item)
	})
}

err := group.Wait()
{% endhighlight %}

ใน source `TaskGroup` มี `Submit`, `SubmitErr`, `Wait`, `Done`, `Stop` และ `Context` ให้ใช้งาน

---

### Result Task Group

ถ้าต้องการรันงานหลายตัวแล้วเอาผลลัพธ์กลับมาเป็น slice ให้ใช้ result pool คู่กับ group

{% highlight go %}
pool := pond.NewResultPool[string](10)
group := pool.NewGroup()

for _, url := range urls {
	url := url
	group.SubmitErr(func() (string, error) {
		return fetchURL(url)
	})
}

results, err := group.Wait()
if err != nil {
	fmt.Println("fetch failed:", err)
	return
}

for _, result := range results {
	fmt.Println(result)
}
{% endhighlight %}

จาก README และ source ผลลัพธ์ของ result group จะเรียงตามลำดับที่ submit เข้าไป ไม่ใช่ลำดับที่ task ทำเสร็จ

---

### ใช้ Context กับ Pool

ถ้าต้องการให้ pool หยุดตาม context ใช้ `pond.WithContext`

{% highlight go %}
ctx, cancel := context.WithCancel(context.Background())
defer cancel()

pool := pond.NewPool(
	10,
	pond.WithContext(ctx),
)
{% endhighlight %}

เมื่อ context ถูก cancel worker จะหยุดรับงานใหม่ และ queued task ที่ยังไม่ถูก execute จะถูก drain เพื่อให้ shutdown ได้สะอาด

ถ้าต้องการให้ task group มี context ของตัวเอง ใช้ `NewGroupContext`

{% highlight go %}
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

group := pool.NewGroupContext(ctx)
{% endhighlight %}

งานที่ run อยู่จะไม่ถูก kill ทันทีโดย pond เอง ถ้างานยาว ๆ ต้องส่ง `ctx` เข้าไปใน operation ของเราด้วย เช่น HTTP request หรือ database call

---

### Bounded Queue

ค่า default ของ queue ใน v2 คือ unbounded หรือ queue ได้เรื่อย ๆ จนกว่าจะ stop หรือ memory ไม่พอ ถ้าอยากจำกัด queue ให้ใช้ `WithQueueSize`

{% highlight go %}
pool := pond.NewPool(
	4,
	pond.WithQueueSize(100),
)
{% endhighlight %}

ถ้า queue เต็ม default behavior จะ block รอจนมี slot ว่าง แต่ถ้าอยากให้ไม่ block ให้ใช้ `TrySubmit`

{% highlight go %}
task, ok := pool.TrySubmit(func() {
	doSomething()
})
if !ok {
	fmt.Println("queue is full")
	return
}

_ = task.Wait()
{% endhighlight %}

หรือกำหนดทั้ง pool ให้ non-blocking

{% highlight go %}
pool := pond.NewPool(
	4,
	pond.WithQueueSize(100),
	pond.WithNonBlocking(true),
)
{% endhighlight %}

ใน source จะมี `ErrQueueFull` สำหรับกรณี queue เต็ม และ `DroppedTasks()` สำหรับดูจำนวน task ที่ drop เพราะ queue เต็ม

---

### ปิด Queue ไปเลย

ถ้าไม่อยากให้มี backlog ใช้ `WithQueueSize(0)`

{% highlight go %}
pool := pond.NewPool(
	4,
	pond.WithQueueSize(0),
)
{% endhighlight %}

ความหมายคือ task ต้องได้ worker ทันที ถ้า worker ทั้ง 4 ตัวกำลังทำงานอยู่ การ submit แบบ `TrySubmit` จะ fail เลย เหมาะกับงานที่ไม่อยากให้ request ค้างใน queue นาน ๆ

---

### Resize Pool ตอน Runtime

ถ้าต้องการเพิ่มหรือลด max concurrency ตอน runtime ใช้ `Resize`

{% highlight go %}
pool := pond.NewPool(5)

pool.Resize(10) // เพิ่ม worker limit
pool.Resize(3)  // ลด worker limit
{% endhighlight %}

จาก source ถ้าเพิ่มขนาด pool จะ launch worker เพิ่มตามงานที่รออยู่ใน queue ส่วนถ้าลดขนาด worker ที่กำลังรันอยู่จะทำงานให้จบก่อน แล้วหลังจากนั้น pool จะไม่สร้าง worker ใหม่เกิน limit ใหม่

---

### Subpool

Subpool ใช้แบ่ง capacity บางส่วนจาก parent pool

{% highlight go %}
pool := pond.NewPool(10)
subpool := pool.NewSubpool(3)

subpool.Submit(func() {
	fmt.Println("run in subpool")
})

subpool.StopAndWait()
pool.StopAndWait()
{% endhighlight %}

ใน source ถ้า subpool มี parent แล้ว `maxConcurrency` ของ subpool ห้ามมากกว่า parent ไม่งั้นจะ panic

---

### Panic Recovery

pond v2 จะ recover panic ใน task ให้เป็น error โดย default

{% highlight go %}
pool := pond.NewPool(10)

task := pool.Submit(func() {
	panic("boom")
})

err := task.Wait()
if err != nil {
	fmt.Println("task failed:", err)
}
{% endhighlight %}

ถ้าอยากให้ panic ทำงานแบบ goroutine ปกติ คือ panic ออกไปเลย ให้ปิดด้วย `WithoutPanicRecovery`

{% highlight go %}
pool := pond.NewPool(
	10,
	pond.WithoutPanicRecovery(),
)
{% endhighlight %}

ส่วนใหญ่ควรใช้ค่า default ไว้ก่อน เพราะ production worker pool ถ้า panic แล้วได้ error กลับมาจัดการต่อได้จะปลอดภัยกว่า

---

### Metrics

`BasePool` expose metrics หลายตัวให้เรียกได้ตรง ๆ เช่น

{% highlight go %}
pool.RunningWorkers()
pool.SubmittedTasks()
pool.WaitingTasks()
pool.SuccessfulTasks()
pool.FailedTasks()
pool.CanceledTasks()
pool.CompletedTasks()
pool.DroppedTasks()
{% endhighlight %}

ตัวอย่างใช้งานกับ Prometheus

{% highlight go %}
prometheus.MustRegister(prometheus.NewGaugeFunc(
	prometheus.GaugeOpts{
		Name: "pool_workers_running",
		Help: "Number of running worker goroutines",
	},
	func() float64 {
		return float64(pool.RunningWorkers())
	},
))
{% endhighlight %}

ถ้าระบบมี job จำนวนมาก metrics พวกนี้ช่วยดูได้ว่า worker เต็มหรือเปล่า, queue เริ่มสะสมไหม, task fail เยอะผิดปกติไหม และมี task ถูก drop หรือไม่

---

### Default Pool

ถ้าไม่อยากสร้าง pool เอง ใช้ package-level function ได้

{% highlight go %}
err := pond.SubmitErr(func() error {
	fmt.Println("run on default pool")
	return nil
}).Wait()
{% endhighlight %}

จาก source `defaultPool` ถูกสร้างด้วย `newPool(0, nil)` ซึ่ง `maxConcurrency = 0` จะถูกแปลงเป็นไม่จำกัด limit ดังนั้น default pool เหมาะกับงานเล็ก ๆ ที่อยากได้ API สั้น แต่ถ้า production ต้องคุม resource ชัด ๆ แนะนำสร้าง pool เองด้วย `NewPool(maxConcurrency)`

---

### ย้ายจาก pond v1 เป็น v2

ถ้าเคยใช้ v1 ต้องปรับหลัก ๆ คือ

* เปลี่ยน import เป็น `github.com/alitto/pond/v2`
* เปลี่ยน `pond.New(100, 1000)` เป็น `pond.NewPool(100)`
* queue default เป็น unbounded แล้ว ถ้าต้องการจำกัด queue ใช้ `pond.WithQueueSize(...)`
* `pool.Group()` เปลี่ยนเป็น `pool.NewGroup()`
* `pool.GroupContext(...)` เปลี่ยนเป็น `pool.NewGroupContext(...)`
* `pond.Context` เปลี่ยนเป็น `pond.WithContext`

---

### เหมาะกับงานแบบไหน

pond เหมาะกับงานที่ต้อง run งานจำนวนมาก แต่ต้องคุมจำนวน concurrent operation เช่น

* เรียก HTTP API จำนวนมาก แต่ต้องคุม rate/concurrency
* process ไฟล์หรือรูปภาพหลายไฟล์พร้อมกัน
* run background jobs ที่ต้องมี queue
* fan-out request แล้วรอผลกลับมาเป็นชุด
* จำกัดจำนวน database query หรือ external service call พร้อมกัน

ถ้างานน้อยมาก ๆ ใช้ goroutine ธรรมดาอาจพอ แต่ถ้าเริ่มต้องมี limit, wait, result, error, queue, metrics และ shutdown ที่คุมได้ `pond` จะทำให้โค้ดสะอาดกว่าเยอะ

---

### Repository

ดูโค้ดเพิ่มเติมได้ที่ [alitto/pond](https://github.com/alitto/pond)
