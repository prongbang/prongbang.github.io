---
layout: post
title: "[Golang] กับการประยุกต์ใช้หลักการ S.O.L.I.D"
short_description: "S.O.L.I.D เป็นชุดหลักการในการออกแบบวิธีการเขียนโค้ดภาษาโปรแกรมเชิงวัตถุ (Object-Oriented Design) ให้มีโครงสร้างที่ดีของคุณ Robert C. Martin เพื่อให้ง่ายต่อการบำรุงรักษาในอนาคต"
date: 2024-04-30 21:33:00 +0700
categories: [golang]
tags: [golang]
cover_image: /assets/images/golang/12.png
author: "Devไปวันๆ"
---

### S.O.L.I.D เป็นคำย่อมาจาก 5 หลักการ ดังนี้

1. `S` - Single Responsibility Principle (SRP) - หลักการแยกหน้าที่ความรับผิดชอบ
2. `O` - Open/Closed Principle (OCP) - หลักการเปิดกว้างสำหรับการขยายแต่ปิดสำหรับการแก้ไข
3. `L` - Liskov Substitution Principle (LSP) - หลักการแทนที่ได้ของ Liskov
4. `I` - Interface Segregation Principle (ISP) - หลักการแยกวิธีบังคับใช้
5. `D` - Dependency Inversion Principle (DIP) - หลักการกลับหน้าที่ความสัมพันธ์

<br>

### 1. Single Responsibility Principle (SRP) - หลักการแยกหน้าที่ความรับผิดชอบ

- คลาสหรือโมดูลควรมีหน้าที่รับผิดชอบเพียงหนึ่งหน้าที่เท่านั้น

ฝ่าฝืน: เนื่องจาก Employee มีหน้าที่รับผิดชอบมากว่าหนึ่ง

{% highlight go %}
type Employee struct {
  Name    string
  Email   string
}

func (e *Employee) UpdateName(name string) {
  // TODO implement update name logic
}

func (e *Employee) UpdateEmail(email string) {
  // TODO implement update email logic
}
{% endhighlight %}

สอดคล้อง:

{% highlight go %}
type Employee struct {
  Name    string
  Email   string
}

type NameUpdater struct{}

func (u *NameUpdater) UpdateName(e *Employee, name string) {
  // TODO implement update name logic
}

type EmailUpdater struct{}

func (u *EmailUpdater) UpdateEmail(e *Employee, email string) {
  // TODO implement update email logic
}
{% endhighlight %}


### 2. Open/Closed Principle (OCP) - หลักการเปิดกว้างสำหรับการขยายแต่ปิดสำหรับการแก้ไข

- Modules, Object, Class ควรเปิดกว้างสำหรับการขยายฟังก์ชันการทำงาน แต่ปิดสำหรับการแก้ไขโค้ดภายใน

ฝ่าฝืน: เนื่องจากสามารถแก้ไขได้ถ้าต้องการเพิ่ม Destination ใหม่เข้าไป

{% highlight go %}
type Logger struct {
  Destination string // "file" or "database"
}

func (l *Logger) Log(msg string) {
  if l.Destination == "file" {
    // log to file
  } else if l.Destination == "database" {
    // log to database
  }
}
{% endhighlight %}

สอดคล้อง:

{% highlight go %}
type Logger interface {
  Log(msg string)
}

type FileLogger struct{}

func (l *FileLogger) Log(msg string) {
  // TODO implement log to file
}

type DatabaseLogger struct{}

func (l *DatabaseLogger) Log(msg string) {
  // TODO implement log to database
}
{% endhighlight %}

### 3. Liskov Substitution Principle (LSP) - หลักการแทนที่ได้ของ Liskov

- Object ของ Class ลูกควรสามารถนำมาใช้แทน Object ของ Class แม่ได้โดยไม่ทำให้คุณสมบัติหรือฟังก์ชันการทำงานผิดเพี้ยนไป

ฝ่าฝืน: เนื่องจาก Penguin ไม่สามารถบินได้

{% highlight go %}
type Bird interface {
  Fly()
  Walk()
}

type Duck struct{}

func (d *Duck) Fly() {
  fmt.Println("Duck is flying")
}

func (d *Duck) Walk() {
  fmt.Println("Duck is walking")
}

type Penguin struct{}

func (p *Penguin) Fly() {
  fmt.Println("Sadly, I can't fly")
}

func (p *Penguin) Walk() {
  fmt.Println("Penguin is walking")
}
{% endhighlight %}

สอดคล้อง:

{% highlight go %}
type FlyingBird interface {
  Fly()
}

type WalkingBird interface {
  Walk()
}

type Duck struct{}

func (d *Duck) Fly() {
  fmt.Println("Duck is flying")
}

func (d *Duck) Walk() {
  fmt.Println("Duck is walking")
}

type Penguin struct{}

func (p *Penguin) Walk() {
  fmt.Println("Penguin is walking")
}
{% endhighlight %}

### 4. Interface Segregation Principle (ISP) - หลักการแยกวิธีบังคับใช้

- ไม่ควรบังคับให้คลาสรับผิดชอบมากเกินความจำเป็น คลาสควรเกี่ยวข้องกับวิธีการที่ตนจำเป็นต้องใช้เท่านั้น

ฝ่าฝืน: เนื่องจาก Robot ไม่มีการนอน และ กินอาหารเหมือนกับคน

{% highlight go %}
type Worker interface {
  Work()
  Sleep()
  Eat()
}

type HumanWorker struct{}

func (h *HumanWorker) Work() {
  // TODO implement work logic
}

func (h *HumanWorker) Sleep() {
  // TODO implement sleep logic
}

func (h *HumanWorker) Eat() {
  // TODO implement eat logic
}

type RobotWorker struct{}

func (r *RobotWorker) Work() {
  // TODO implement work logic
}

func (r *RobotWorker) Sleep() {
  // robots don't sleep
}

func (r *RobotWorker) Eat() {
  // robots don't eat
}
{% endhighlight %}

สอดคล้อง:

{% highlight go %}
type Worker interface {
  Work()
}

type Sleeper interface {
  Sleep()
}

type Eater interface {
  Eat()
}

type HumanWorker struct{}

func (h *HumanWorker) Work() {
  // TODO implement work logic
}

func (h *HumanWorker) Sleep() {
  // TODO implement sleep logic
}

func (h *HumanWorker) Eat() {
  // TODO implement eat logic
}

type RobotWorker struct{}

func (r *RobotWorker) Work() {
  // TODO implement work logic
}
{% endhighlight %}


### 5. Dependency Inversion Principle (DIP) - หลักการกลับหน้าที่ความสัมพันธ์

- โมดูลระดับสูงไม่ควรขึ้นตรงกับโมดูลระดับต่ำ แต่ทั้งคู่ควรขึ้นตรงกับนามธรรม (Abstraction หรือ Interface) เพื่อให้มีความยืดหยุ่น

ฝ่าฝืน: เนื่องจาก repo ใน struct ไม่ได้ขึ้นตรงจาก Abstraction หรือ Interface

{% highlight go %}
type User struct {
  ID int
}

type UserRepository struct {
  // TODO implement database 
}

func (r *UserRepository) GetUser(id int) (User, error) {
  // TODO implement get user from database
}

type UserService struct {
  repo *UserRepository
}

func (s *UserService) RegisterUser(user User) error {
  u, err := s.repo.GetUser(user.ID)
  if u.ID == 0 {
    fmt.Println("Registered user id:", user.ID)
    return nil
  }
  return errors.New("User exist")
}
{% endhighlight %}

สอดคล้อง:

{% highlight go %}

type User struct {
  ID int
}

type UserRepository interface {
  GetUser(id int) (User, error)
}

type DatabaseUserRepository struct {
  // TODO implement database
}

func (r *DatabaseUserRepository) GetUser(id int) (User, error) {
  if id == 1 {
    return User{ID: 1}, nil
  }
  return User{}, nil
}

type UserService struct {
  repo UserRepository
}

func (s *UserService) RegisterUser(user User) error {
  u, err := s.repo.GetUser(user.ID)
  if u.ID == 0 {
    fmt.Println(" > Registered user id:", user.ID)
    return nil
  }
  return err
}
{% endhighlight %}

การปฏิบัติตามหลักการ S.O.L.I.D จะช่วยให้โค้ดที่เขียนมีคุณภาพดี ง่ายต่อการบำรุงรักษา และขยายความสามารถ ลดความซับซ้อน และเพิ่มประสิทธิภาพการทำงานได้ หากผิดพลาดประการใดต้อง ขออภัย ณ ที่นั้นด้วยคับ

<br>

หากต้องการดูตัวอย่างการนำมาใช้งานสามารถเข้าไปดูได้ที่ 

<br>

#### Reference

- [S.O.L.I.D](https://en.wikipedia.org/wiki/SOLID)
