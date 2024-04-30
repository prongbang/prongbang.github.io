---
layout: post
title:  "[Flutter] มาใช้ GetIt เพื่อช่วยทำ Service Locator กันเถอะ"
short_description: "เพื่อนำมาแก้ปัญหาการสร้าง Instance ที่ซ้ำซ้อนกัน และทำให้การใช้งานได้ง่ายยิ่งขึ้น มาดูกันว่าต้องทำอย่างไร"
date:   2020-01-09 01:15:00 +0700
categories: [flutter]
tags: [flutter]
cover_image: /assets/images/flutter/04.png
author: "Devไปวันๆ"
---

### เริ่มจากสร้างโปรเจค และวางโครงตามนี้ หรือจะทำแบบที่ตัวเองถนัดก็ได้

<br>
{% highlight bash %}
lib
├── core
│   └── usecase.dart
├── di
│   └── service_locator.dart
├── feature
│   └── post
│       ├── data
│       │   ├── post_datasource.dart
│       │   ├── post_local_datasource.dart
│       │   └── post_repository.dart
│       ├── domain
│       │   ├── get_post_list_usecase.dart
│       │   └── post.dart
│       ├── post_locator.dart
│       └── presenter
│           ├── post_page.dart
│           ├── post_presenter.dart
│           └── post_widget.dart
└── main.dart
{% endhighlight %}

### มาดูว่าแต่ละโฟลเดอร์ และไฟล์ใช้ทำอะไรบ้าง

- `core` เก็บ class หรือ function ที่ให้ที่อื่นมาเรียกใช้งาน
- `di` เก็บ function สำหรับ setup `Service Locator`
- `feature` เก็บ feature ของแอพซึ่งในที่นี้มีแค่ `post`
- `post` ชื่อ feature
- `data` เก็บ class ที่ทำงานเกี่ยวกับข้อมูลใน feature นั้น ๆ
- `domain` เก็บ class ที่ทำงานแบบเฉพาะเจาะใน feture นั้น ๆ
- `presenter` เก็บ class ที่ทำงานเกี่ยวกับการแสดงผล

### จากนั้นให้เราลง get_it โดยให้เราไปเพิ่มที่ไฟล์ `pubspec.yaml` ตามนี้

{% highlight yml %}
dependencies:
  flutter:
    sdk: flutter
  get_it: ^3.1.0
{% endhighlight %}

### จากนั้นก็มาเริ่มเขียน code แบบแต่ละไฟล์ประมาณนี้

- `post_local_datasource.dart` ในที่นี้จะจำลองว่ามีการดึงข้อมูลจาก cache โดยการฟิกค่าไว้

{% highlight dart %}
class PostLocalDataSource implements PostDataSource {
  @override
  List<Post> getPostList() {
    return [
      Post(
        id: 1,
        name: "[Golang] มาใช้ Wire เพื่อช่วยทำ Dependency Injection กันเถอะ",
        detail: "บล็อคนี้ไม่อยากพิมพ์เยอะ เพราะวิธีใช้มันน้อย และง่ายมาก ๆ",
        image: "https://prongbang.github.io/assets/images/golang/9.png",
        date: "By Wachasit Studio, Nov 9, 2019",
      ),
      ...
    ];
  }
}
{% endhighlight %}

- `post_locator.dart` สำหรับ register factory `PostLocalDataSource` เข้าไปที่ `Service Locator`

{% highlight dart %}
class PostLocator {
  static setup() {
    GetIt.I.registerFactory<PostDataSource>(() => PostLocalDataSource(), instanceName: "PostLocalDataSource");
  }
}
{% endhighlight %}

** เนื่องจากเราได้ใช้ abstract class ชื่อ `PostDataSource` เพื่อไม่ให้เกิดเหตุการณ์ที่ register class ซ้ำกัน เราก็เลยต้องตั้งชื่อให้กับ instance โดยตั้งชื่อว่า `PostLocalDataSource`
<br>

- `post_repository.dart` ในที่นี้จะทำการเรียกใช้ datasource อย่างเดียว ยังไม่ logic อะไรเพิ่มเติม

{% highlight dart %}
abstract class PostRepository {
  List<Post> getPostList();
}

class DefaultPostRepository implements PostRepository {
  final PostDataSource _postLocalDataSource;

  DefaultPostRepository(this._postLocalDataSource);

  @override
  List<Post> getPostList() {
    return _postLocalDataSource.getPostList();
  }
}
{% endhighlight %}

- แก้ไขไฟล์ `post_locator.dart` สำหรับ register factory `PostRepository` เข้าไปที่ `Service Locator`

{% highlight dart %}
class PostLocator {
  static setup() {
    GetIt.I.registerFactory<PostDataSource>(() => PostLocalDataSource(), instanceName: "PostLocalDataSource");
    GetIt.I.registerFactory<PostRepository>(() => DefaultPostRepository(GetIt.I.get<PostDataSource>("PostLocalDataSource")));
  }
}
{% endhighlight %}

** เนื่องจาก class `DefaultPostRepository` มีการรับ `PostLocalDataSource` ผ่าน constructor จึงจำเป็นต้องใส่ชื่อ instance ให้มันด้วยตามนี้ `GetIt.I.get<PostDataSource>("PostLocalDataSource"))`
<br>

- `get_post_list_usecase.dart` ในที่นี้จะทำการเรียกใช้ repository อย่างเดียวซึ่งทำหน้าที่แค่ไปดึงข้อมูลของ post ทั้งหมด

{% highlight dart %}
abstract class GetPostListUseCase extends UseCase<Null, List<Post>> {}

class DefaultGetPostListUseCase implements GetPostListUseCase {
  final PostRepository _postRepository;

  DefaultGetPostListUseCase(this._postRepository);

  @override
  List<Post> execute(Null parameter) {
    return _postRepository.getPostList();
  }
}
{% endhighlight %}

- แก้ไขไฟล์ `post_locator.dart` สำหรับ register factory `GetPostListUseCase` เข้าไปที่ `Service Locator`

{% highlight dart %}
class PostLocator {
  static setup() {
    GetIt.I.registerFactory<PostDataSource>(() => PostLocalDataSource(), instanceName: "PostLocalDataSource");
    GetIt.I.registerFactory<PostRepository>(() => DefaultPostRepository(GetIt.I.get<PostDataSource>("PostLocalDataSource")));
    GetIt.I.registerFactory<GetPostListUseCase>(() => DefaultGetPostListUseCase(GetIt.I.get<PostRepository>()));
  }
}
{% endhighlight %}

** ถ้ามั่นใจว่าไม่มี class อื่นไม่มีการ implements `PostRepository` เราสามารถใช้ `GetIt.I.get<PostRepository>()` แบบนี้ได้เลย
<br>

- `post_presenter.dart` ในที่นี้จะทำการเรียกใช้ get_post_list_usecase อย่างเดียว

{% highlight dart %}
abstract class PostPresenter {
  Future<List<Post>> getPostList();
}

class DefaultPostPresenter implements PostPresenter {
  final GetPostListUseCase _getPostListUseCase;

  DefaultPostPresenter(this._getPostListUseCase);

  @override
  Future<List<Post>> getPostList() {
    return Future.value(_getPostListUseCase.execute(null));
  }
}
{% endhighlight %}

- แก้ไขไฟล์ `post_locator.dart` สำหรับ register factory `PostPresenter` เข้าไปที่ `Service Locator`

{% highlight dart %}
class PostLocator {
  static setup() {
    GetIt.I.registerFactory<PostDataSource>(() => PostLocalDataSource(), instanceName: "PostLocalDataSource");
    GetIt.I.registerFactory<PostRepository>(() => DefaultPostRepository(GetIt.I.get<PostDataSource>("PostLocalDataSource")));
    GetIt.I.registerFactory<GetPostListUseCase>(() => DefaultGetPostListUseCase(GetIt.I.get<PostRepository>()));
    GetIt.I.registerFactory<PostPresenter>(() => DefaultPostPresenter(GetIt.I.get<GetPostListUseCase>()));
  }
}
{% endhighlight %}

- `service_locator.dart` สำหรับ setup `Service Locator` ของแต่ละ feature

{% highlight dart %}
final GetIt locator = GetIt.I;

void setupLocator() {
  PostLocator.setup();
}
{% endhighlight %}

### ต่อไปจะเป็นการใช้งาน `Service Locator` โดยเริ่มจาก

- `main.dart` เรียกใช้งาน function `setupLocator();` เพื่อให้ app สามารถใช้งาน instance ที่อยู่ใน `Service Locator` จากที่ไหนก็ได้

{% highlight dart %}
void main() {
  setupLocator();
  runApp(MyApp());
}
{% endhighlight %}

- วิธีการเรียกใช้ instance ของ `PostPresenter` จาก `Service Locator` ก็แค่เขียนประมาณนี้ แต่ถ้าจะเรียกใช้ instance อื่นก็แค่เปลี่ยนตรง `<PostPresenter>` เป็นชื่ือ class ที่ต้องการได้เลย แต่ instance ต้องทำการ register แล้วนะ

{% highlight dart %}
var _postPresenter = locator<PostPresenter>();
{% endhighlight %}

- `post_page.dart` การเรียกใช้งานใน StatefulWidget ก็จะได้ประมาณนี้

{% highlight dart %}
class PostPage extends StatefulWidget {
  @override
  _PostPageState createState() => _PostPageState();
}

class _PostPageState extends State<PostPage> {
  PostPresenter _postPresenter;

  @override
  void initState() {
    _postPresenter = locator<PostPresenter>();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("devไปวันๆ"),
      ),
      body: SafeArea(
        child: Material(
          child: FutureBuilder(
            future: _postPresenter.getPostList(),
            builder: (context, AsyncSnapshot snapshot) {
              if (!snapshot.hasData) {
                return Center(child: CircularProgressIndicator());
              } else {
                return Container(
                  child: ListView.builder(
                    itemCount: snapshot.data.length,
                    scrollDirection: Axis.vertical,
                    itemBuilder: (BuildContext context, int index) {
                      return PostWidget(post: snapshot.data[index]);
                    },
                  ),
                );
              }
            },
          ),
        ),
      ),
    );
  }
}
{% endhighlight %}

เพียงเท่านี้ก็เรียบร้อยสำหรับการใช้งาน GetIt เพื่อช่วยทำ `Service Locator` สำหรับภาษา Dart เพื่อใช้งานใน Flutter หากผิดพลาดประการใดต้องขออภัย ณ ที่นั้นด้วย ส่วน [Source Code](https://raboninco.com/XBto) สามารถจิ้มเข้าไปดูแบบเต็มได้
