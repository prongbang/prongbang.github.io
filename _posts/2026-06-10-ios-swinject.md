---
layout: post
title: "[iOS] การใช้งาน Swinject ทำ Dependency Injection ใน Swift"
short_description: "แนะนำวิธีใช้งาน Swinject ไลบรารี Dependency Injection สำหรับ Swift ตั้งแต่การ register service, resolve dependency, named registration, argument injection, object scope, initCompleted, Assembler และการใช้งานแบบ thread-safe"
date: 2026-06-10 10:00:00 +0700
categories: [ios]
tags: [ios]
cover_image: /assets/images/ios/03.png
author: "Devไปวันๆ"
---

### Swinject คืออะไร

Swinject เป็น dependency injection framework สำหรับ Swift ที่ช่วยให้เราแยกการสร้าง object และ dependency ออกจาก business logic ได้ง่ายขึ้น ทำให้ component ต่าง ๆ loosely coupled, test ง่ายขึ้น และเปลี่ยน implementation ได้สะดวกกว่าเขียน `init` หรือ singleton กระจายอยู่หลายที่

จากโค้ดของ Swinject แกนหลักจะอยู่ที่ `Container` ซึ่งใช้เก็บ registration ของ service และใช้ `Resolver` เพื่อ resolve instance กลับมาใช้งาน โดย `register` จะคืน `ServiceEntry` เพื่อให้เราตั้งค่าเพิ่มได้ เช่น object scope หรือ `initCompleted`

ติดตั้งด้วย Swift Package Manager ได้แบบนี้

{% highlight swift %}
dependencies: [
  .package(
    url: "https://github.com/Swinject/Swinject.git",
    from: "2.8.0"
  )
]
{% endhighlight %}

หรือใช้ CocoaPods

{% highlight ruby %}
pod 'Swinject'
{% endhighlight %}

---

### แนวคิดหลัก

* `Container` ใช้เก็บ service registration
* `register` ใช้กำหนดว่า protocol หรือ type หนึ่ง ๆ จะถูกสร้างจาก factory closure แบบไหน
* `resolve` ใช้ดึง instance ที่ register ไว้กลับมาใช้งาน
* `Resolver` ที่ส่งเข้า factory closure ใช้ resolve dependency ตัวอื่น
* `ServiceEntry` ใช้ chain config เพิ่ม เช่น `.inObjectScope()` หรือ `.initCompleted()`
* default object scope ของ `Container` คือ `.graph`
* ถ้าต้อง resolve จากหลาย thread ควรใช้ `container.synchronize()` หลัง register เสร็จ

---

### ตัวอย่างพื้นฐาน

เริ่มจากสร้าง protocol และ implementation

{% highlight swift %}
protocol Animal {
  var name: String { get }
}

final class Cat: Animal {
  let name: String

  init(name: String) {
    self.name = name
  }
}

protocol Person {
  func play()
}

final class PetOwner: Person {
  private let pet: Animal

  init(pet: Animal) {
    self.pet = pet
  }

  func play() {
    print("I'm playing with \(pet.name).")
  }
}
{% endhighlight %}

จากนั้น register service เข้า `Container`

{% highlight swift %}
import Swinject

let container = Container()

container.register(Animal.self) { _ in
  Cat(name: "Mimi")
}

container.register(Person.self) { resolver in
  PetOwner(
    pet: resolver.resolve(Animal.self)!
  )
}
{% endhighlight %}

เวลาใช้งานให้ resolve service ที่ต้องการ

{% highlight swift %}
let person = container.resolve(Person.self)!
person.play()
{% endhighlight %}

จุดสำคัญคือ `PetOwner` ไม่ต้องรู้เองว่า `Animal` จะเป็น `Cat`, `Dog` หรือ implementation อื่น เพราะหน้าที่สร้าง dependency ถูกย้ายไปไว้ที่ `Container`

---

### Register ใน AppDelegate

ถ้าไม่ได้ใช้ `SwinjectStoryboard` วิธีพื้นฐานคือ register dependency ตอนเริ่มแอป เช่นใน `AppDelegate`

{% highlight swift %}
final class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  let container: Container = {
    let container = Container()

    container.register(Animal.self) { _ in
      Cat(name: "Mimi")
    }

    container.register(Person.self) { resolver in
      PetOwner(
        pet: resolver.resolve(Animal.self)!
      )
    }

    container.register(PersonViewController.self) { resolver in
      let controller = PersonViewController()
      controller.person = resolver.resolve(Person.self)
      return controller
    }

    return container
  }()
}
{% endhighlight %}

แล้วตอนสร้าง root view controller

{% highlight swift %}
window?.rootViewController = container.resolve(PersonViewController.self)
{% endhighlight %}

---

### Named Registration

ถ้า service type เดียวกันมีหลาย implementation ให้ใช้ `name` เพื่อแยก registration

{% highlight swift %}
container.register(Animal.self, name: "cat") { _ in
  Cat(name: "Mimi")
}

container.register(Animal.self, name: "dog") { _ in
  Dog(name: "Hachi")
}
{% endhighlight %}

ตอน resolve ก็ระบุ name เดียวกัน

{% highlight swift %}
let cat = container.resolve(Animal.self, name: "cat")
let dog = container.resolve(Animal.self, name: "dog")
{% endhighlight %}

จาก source และ documentation ของ Swinject registration key จะประกอบด้วย service type, name และ argument type ดังนั้น service type เดียวกันสามารถอยู่ร่วมกันได้ถ้า name หรือ argument ต่างกัน

---

### Resolve พร้อม Argument

บาง dependency ต้องการ runtime value เช่น user id, token หรือ configuration เฉพาะหน้า สามารถ register factory ที่รับ argument ได้

{% highlight swift %}
final class Horse: Animal {
  let name: String
  let running: Bool

  init(name: String, running: Bool) {
    self.name = name
    self.running = running
  }
}

container.register(Animal.self) { _, name in
  Horse(name: name, running: false)
}

container.register(Animal.self) { _, name, running in
  Horse(name: name, running: running)
}
{% endhighlight %}

ตอน resolve argument เดียวใช้ `argument`

{% highlight swift %}
let animal = container.resolve(
  Animal.self,
  argument: "Spirit"
)
{% endhighlight %}

ถ้ามีมากกว่า 1 argument ใช้ `arguments`

{% highlight swift %}
let animal = container.resolve(
  Animal.self,
  arguments: "Lucky", true
)
{% endhighlight %}

ข้อควรระวังคือ type ของ argument ต้องตรงกับตอน register เช่น `String`, `NSString`, `String?` ถือเป็นคนละ key กัน

---

### Object Scope

จาก source `ObjectScope.swift` มี scope หลัก ๆ ดังนี้

* `.transient` สร้าง instance ใหม่ทุกครั้งที่ resolve
* `.graph` เป็น default scope แชร์ instance เฉพาะระหว่างสร้าง object graph เดียวกัน
* `.container` แชร์ instance ภายใน container และ child container เทียบได้กับ singleton
* `.weak` แชร์ instance ตราบใดที่ยังมี strong reference อยู่ ถ้า reference หายไป resolve รอบถัดไปจะสร้างใหม่

ตัวอย่างการใช้ `.container`

{% highlight swift %}
container.register(APIClient.self) { _ in
  APIClient(baseURL: "https://api.example.com")
}
.inObjectScope(.container)
{% endhighlight %}

ถ้าต้องการล้าง instance ใน scope หนึ่ง สามารถเรียก

{% highlight swift %}
container.resetObjectScope(.container)
{% endhighlight %}

หรือ reset เฉพาะ service type

{% highlight swift %}
container.resetObjectScope(
  .container,
  serviceType: APIClient.self
)
{% endhighlight %}

---

### Property Injection ด้วย initCompleted

ถ้าต้อง inject property หลัง init เสร็จ ใช้ `initCompleted`

{% highlight swift %}
final class ProfileViewModel {
  var analytics: Analytics?
}

container.register(ProfileViewModel.self) { _ in
  ProfileViewModel()
}
.initCompleted { resolver, viewModel in
  viewModel.analytics = resolver.resolve(Analytics.self)
}
{% endhighlight %}

จาก source `ServiceEntry` จะเก็บ `initCompletedActions` ไว้ และเรียกหลัง factory closure สร้าง instance เสร็จแล้ว เหมาะกับ property injection, method injection หรือบางกรณีของ circular dependency

---

### จัดกลุ่มด้วย Assembly และ Assembler

ถ้าโปรเจกต์ใหญ่ขึ้น การ register ทั้งหมดในไฟล์เดียวจะเริ่มดูแลยาก ให้แยกเป็น `Assembly`

{% highlight swift %}
final class NetworkAssembly: Assembly {
  func assemble(container: Container) {
    container.register(APIClient.self) { _ in
      APIClient(baseURL: "https://api.example.com")
    }
    .inObjectScope(.container)
  }
}

final class FeatureAssembly: Assembly {
  func assemble(container: Container) {
    container.register(ProfileViewModel.self) { resolver in
      ProfileViewModel(
        apiClient: resolver.resolve(APIClient.self)!
      )
    }
  }
}
{% endhighlight %}

สร้าง `Assembler`

{% highlight swift %}
let assembler = Assembler([
  NetworkAssembly(),
  FeatureAssembly()
])

let viewModel = assembler.resolver.resolve(ProfileViewModel.self)
{% endhighlight %}

จาก source `Assembler` จะ run `assemble(container:)` ของทุก assembly ก่อน แล้วค่อยเรียก `loaded(resolver:)` ให้แต่ละ assembly หลัง container ถูกประกอบเสร็จ

---

### Thread Safety

ถ้าต้อง resolve dependency จากหลาย thread ควรเรียก `synchronize()` หลัง register service เสร็จ

{% highlight swift %}
let container = Container()

container.register(APIClient.self) { _ in
  APIClient(baseURL: "https://api.example.com")
}
.inObjectScope(.container)

let resolver = container.synchronize()
{% endhighlight %}

จาก source `synchronize()` จะคืนค่าเป็น `Resolver` ไม่ใช่ `Container` ตัวเดิม และมี note ว่าควรเรียกหลัง register เสร็จ เพราะการ register เพิ่มหลัง synchronize อาจทำให้ graph scope แตกต่างจากที่คาด

---

### เหมาะกับงานแบบไหน

* แอป iOS ที่ต้องแยก business logic, network, storage และ view model ออกจากกัน
* โปรเจกต์ที่ต้อง mock dependency ใน unit test
* แอปที่มีหลาย feature module และอยากแยก registration เป็น assembly
* งานที่ต้องเปลี่ยน implementation ตาม environment เช่น dev, staging, production
* งานที่ต้องควบคุม lifecycle ของ object เช่น transient, graph หรือ container scope

---

### ข้อควรรู้

* `resolve` คืนค่า optional ถ้าไม่ได้ register service ไว้จะได้ `nil`
* ถ้าใช้ `!` กับ `resolve` ควรมั่นใจว่า registration ถูก setup แล้ว
* default scope คือ `.graph` ไม่ใช่ singleton
* `.container` คือ scope ที่ใช้เมื่อต้องการแชร์ instance แบบ singleton
* argument type ต้องตรงกับตอน register ไม่อย่างนั้น resolve ไม่เจอ
* ถ้าต้องการ thread-safe resolver ให้ register ให้ครบก่อน แล้วค่อยใช้ `synchronize()`
* ถ้าใช้หลาย module แนะนำให้แยก `Assembly` มากกว่ารวมทุกอย่างไว้ใน `AppDelegate`

---

### สรุป

Swinject ช่วยให้การจัดการ dependency ใน Swift เป็นระบบมากขึ้น โดยให้เรา register service ไว้ใน `Container` แล้ว resolve กลับมาใช้งานเมื่อจำเป็น พร้อมรองรับ named registration, argument injection, object scope, property injection ผ่าน `initCompleted` และการแยก module ด้วย `Assembly`

ถ้าโปรเจกต์เริ่มมี dependency หลายชั้น หรืออยากให้ unit test เปลี่ยน implementation ได้ง่าย Swinject เป็นตัวเลือกที่ดีในการจัดระเบียบการสร้าง object โดยไม่ผูกทุกอย่างไว้กับ concrete class โดยตรง

สามารถอ่านรายละเอียดเพิ่มเติมได้ที่ [github.com/Swinject/Swinject](https://github.com/Swinject/Swinject) ครับ
