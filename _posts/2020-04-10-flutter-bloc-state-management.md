---
layout: post
title:  "[Flutter] จัดการ State ด้วย BloC Pattern + Clean Architecture แบบไม่เน้นทฤษฎี"
short_description: "ชื่อเต็มคือ Business Logic Component เพื่อจัดการกับ State ภายในแอพซึ่งข้อมูลจะวิ้งไหลผ่าน Rx และ Stream"
date:   2020-04-10 21:57:00 +0700
categories: [flutter]
tags: [flutter]
cover_image: /assets/images/flutter/05.png
author: "end try"
---

### เริ่มจากเพิ่ม dependencies ที่เราต้องใช้ก่อนตามนี้

{% highlight yaml %}
dependencies:
    flutter_bloc: ^3.2.0
    http: ^0.12.0+4
    equatable: ^1.0.0
    get_it: ^4.0.1
{% endhighlight %}

จากนั้นสั่งรัน

{% highlight yaml %}
$ flutter pub get
{% endhighlight %}

### สำหรับคำที่ต้องทำความรู้จักในโพสนี้มี 5 คำ (ที่จริงมีเยอะกว่านี้)

- `Bloc`    ตัวที่คอยจัดการกับ `Event` และ `State`
- `Event`   เหตุการณ์ที่ใช้บอก `Bloc` ว่าจะให้ทำอะไร และให้ส่ง `State` ออกมาเป็นอะไร
- `State`   ชุดข้อมูลที่ได้จาก `Event` สั่งให้ `Bloc` ทำอะไรสักอย่าง
- `BlocProvider`    สำหรับสร้าง `Bloc` ให้ `child` สามารถเรียกใช้งาน `Bloc` นั้นได้
- `BlocBuilder`     สำหรับรับค่า `State` ที่ได้จาก `Bloc` เพื่อแสดงผลตาม `State` ที่ได้มา

### Requirement

- ดึงข้อมูล Post จาก API [https://jsonplaceholder.typicode.com/posts](https://jsonplaceholder.typicode.com/posts)
- เก็บข้อมูล Post ใน Memory หลังจากโหลดข้อมูลสำเร็จ
- แสดงรายการข้อมูลของ Post
- มี Loading ระหว่างที่รอข้อมูลที่โหลดจาก API
- แสดง Error เมื่อโหลดข้อมูลไม่สำเร็จ

### วางโครงสร้างโดยใช้ Clean Architecture ประมาณนี้

{% highlight yaml %}
lib
├── core
│   └── usecase.dart
├── di
│   └── service_locator.dart
├── main.dart
└── post
    ├── bloc
    │   ├── post_bloc.dart
    │   ├── post_event.dart
    │   └── post_state.dart
    ├── data
    │   ├── local
    │   │   └── post_local_datasource.dart
    │   ├── post_datasource.dart
    │   ├── post_repository.dart
    │   └── remote
    │       ├── post_api.dart
    │       └── post_remote_datasource.dart
    ├── domain
    │   └── get_post_list_usecase.dart
    ├── post_locator.dart
    └── presentation
        ├── post_list_widget.dart
        ├── post_page.dart
        └── post_widget.dart
{% endhighlight %}

### สร้าง Event ของ Post ซึ่งในที่นี้มีแค่ `FetchPost`

- post_event.dart

{% highlight dart %}
import 'package:equatable/equatable.dart';

abstract class PostEvent extends Equatable {}

class FetchPost extends PostEvent {
  @override
  List<Object> get props => [];
}
{% endhighlight %}

### สร้าง State ของ Post ซึ่งในที่นี้จะสร้างตาม Requirement ก็จะได้

- post_state.dart

{% highlight dart %}
import 'package:equatable/equatable.dart';

abstract class PostState extends Equatable {}

class PostLoading extends PostState {
  @override
  List<Object> get props => [];
}

class PostLoaded extends PostState {
  final List<dynamic> items;

  PostLoaded(this.items);

  @override
  List<Object> get props => [items];
}

class PostError extends PostState {
  @override
  List<Object> get props => [];
}
{% endhighlight %}

### สร้าง BloC ของ Post

<br>
ใน BloC จะมีการกำหนด state เริ่มต้น และทำการเช็คว่า Event เป็นอะไร จากนั้นก็จะสั่งให้ usecase ไปทำอะไรสักอย่างเพื่อให้ได้ผลลัพธ์ และทำการส่ง state ไปบอก BlocBuilder

- post_bloc.dart

{% highlight dart %}
import 'package:flutter_bloc/flutter_bloc.dart';

class PostBloc extends Bloc<PostEvent, PostState> {
  final GetPostListUseCase getPostListUseCase;

  PostBloc(this.getPostListUseCase);

  @override
  PostState get initialState => PostLoading();

  @override
  Stream<PostState> mapEventToState(PostEvent event) async* {
    if (event is FetchPost) {
      try {
        yield PostLoaded(await getPostListUseCase.execute(null));
      } catch (_) {
        yield PostError();
      }
    }
  }
}
{% endhighlight %}

### ใช้งาน BlocProvider

<br>
โดยทำการส่ง `PostBloc` ให้กับ BlocProvider เพื่อให้ `PostWidget` และ child สามารถใช้งาน `PostBloc` ได้

- post_page.dart

{% highlight dart %}
import 'package:flutter_bloc/flutter_bloc.dart';

class PostPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Flutter BloC Demo"),
      ),
      body: BlocProvider<PostBloc>(
        create: (context) => getIt.get<PostBloc>(),
        child: PostWidget(),
      ),
    );
  }
}
{% endhighlight %}

### ใช้งาน BlocBuilder

<br>
ตัว `BlocBuilder` จะทำการรอรับ state จาก `PostBloc` โดยทำการเช็คว่า state เป็นอะไร จากนั้นก็แสดง UI ตามที่ต้องการ 

- post_widget.dart

{% highlight dart %}
import 'package:flutter_bloc/flutter_bloc.dart';

class PostWidget extends StatefulWidget {
  @override
  _PostWidgetState createState() => _PostWidgetState();
}

class _PostWidgetState extends State<PostWidget> {
  @override
  void initState() {
    context.bloc<PostBloc>().add(FetchPost());
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PostBloc, PostState>(
      builder: (context, state) {
        if (state is PostLoading) {
          return Center(child: CircularProgressIndicator());
        }
        if (state is PostLoaded) {
          return PostListWidget(items: state.items);
        }
        return Center(child: Text('Something went wrong!'));
      },
    );
  }
}
{% endhighlight %}

- `state.items` คือการดึงข้อมูลจาก state ที่ชื่อว่า `PostLoaded` 
- `context.bloc<PostBloc>().add(FetchPost());` คือการบอก `PostBloc` ให้ทำงานตาม Event

### ใช้งาน GetIt

<br>
สามารถอ่านวิธี่ใช้ได้ที่ [[Flutter] มาใช้ GetIt เพื่อช่วยทำ Service Locator กันเถอะ](https://prongbang.github.io/flutter/2020/01/08/flutter-getit-service-locator.html)
<br>
<br>


### Clean Architecture แบบคร่าว ๆ เฉพาะส่วนที่ใช้ในโพสนี้คือ

<br>

#### - `Domain Layer` โดยประกอบไปด้วย

- Use Cases เป็นส่วนที่เก็บ Business Logic ที่เฉพาะเจาะจง

#### - `Data Layer` โดยประกอบไปด้วย

- Repository เป็นส่วนที่ใช้จัดการกับ DataSource ให้มันอยู่เป็นที่เป็นทาง เช่น จะเลือกใช้ข้อมูลจาก Cache หรือว่า API ก็จะอยู่ที่ส่วนนี้
- Frameworks & Drivers หรือ DataSource เป็นส่วนที่ใช้ในการติดต่อกับ Database Local, API, gRPC, Socket เป็นต้น

#### - `Presentation Layer` โดยประกอบไปด้วย

- Presenters เป็นส่วนของการแสดงผลหรือประมวลผลเมื่อมี event มาจาก user 

สามารถอ่านเพิ่มเติมได้ที่ [The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

<br>

### หน้าตาของ App ที่ได้จากโพสนี้

<br>

|                  Android                   |                     iOS                    |
|--------------------------------------------|--------------------------------------------|
|<img src="/assets/images/flutter/05-1.png"/>|<img src="/assets/images/flutter/05-2.png"/>|

สามารถเข้ามาดู [Source Code](https://github.com/prongbang/bloc_clean_example) ได้ตามลิ้งที่แปะให้ได้เลย ถ้ามีอะไรผิดพลาดต้องขออภัย​ ณ ที่นั่นด้วยครับ <br>
ฝากกดไลค์เพจ ["เดฟไปวันๆ"](https://fb.me/async.true) เพื่อเป็นกำลังใจในการเขียนด้วยนะครับ ขอบคุณครับ

<br>

#### Reference

- [ภาพจาก Pragmatic State Management in Flutter (Google I/O'19)](https://youtu.be/d_m5csmrf7I?t=778)
- [Flutter BloC](https://pub.dev/packages/flutter_bloc)
