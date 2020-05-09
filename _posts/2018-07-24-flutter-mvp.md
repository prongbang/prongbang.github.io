---
layout: post
title:  "[Flutter] ออกแบบ Design Pattern ด้วย MVP (Model View Presenter) ให้กับ Flutter"
short_description: "แน่นอนว่าการที่เราจะเลือกใช้ Design Pattern สักตัวย่อมมีเหตุผล และเหตุผลที่โพสนี้เลือกใช้ MVP คืออะไรมาดูกัน"
date:   2018-07-24 23:03:34 +0700
categories: flutter
tags: [flutter]
cover_image: /assets/images/flutter/03.png
author: "end try"
---

#### ที่เลือกใช้ MVP ก้เพราะว่าอยากให้เขียนเทสได้ง่าย ๆ และให้คนที่เคยเขียน MVP กับ Android อยู่แล้วสามารถมาเขียน Flutter ได้ง่ายขึ้น (ไม่อยากพิมพ์เยอะเริ่มกันเลยดีกว่า)<br><br>

### เริ่มจากวางโครงของ package ของเราประมาณนี้

{% highlight shell %}
lib
├── api
│   └── api.dart
├── di
│   └── injector.dart
├── interactor
│   ├── base_interactor.dart
│   └── user_interactor.dart
├── main.dart
├── model
│   ├── network_status.dart
│   └── user.dart
├── presenter
│   ├── base_presenter.dart
│   └── user_presenter.dart
├── utils
│   └── fetch_data_exception.dart
└── view
    ├── base
    │   └── base_contract_view.dart
    └── user
        ├── user_contract.dart
        └── user_widget.dart
{% endhighlight %}

- `api` ไฟล์ไหนที่มีการทำงานกับ API จะเอามาไว้ที่นี่
- `di` ไฟล์ไหนที่มีการ Provide ค่าเพื่อ Inject ค่าให้กับ Class อื่น ๆ จะเอามาไว้ที่นี่
- `interactor` เก็บไฟล์ที่เป็นตัวกลางระหว่าง API กับ Presenter
- `model` เก็บไฟล์ POJO
- `presenter` เก็บไฟล์ที่มี Business Logic ของแอพทั้งหมดไว้ที่นี้
- `utils` เก็บไฟล์ที่ไว้อำนวยประโยชน์สำหรับแอพไว้ที่นี่
- `view` เก็บส่วนของ view ไว้ที่นี่

### เริ่มจากสร้าง `Contract` 
<br>

เพื่อวางโครง `interface` ของเราก่อนเลย ซึ่งแอพที่เราจะทำคือดึงข้อมูล user จาก api โดยเราจะสร้าง package ชื่อ `user` แล้วสร้างไฟล์ `user_contract.dart` ข้างในก็จะได้ประมาณนี้

{% highlight dart %}
abstract class UserContractInteractor extends BaseInteractor {
  Future<Response> loadUser(int size);
}

abstract class UserContractPresenter extends BasePresenter<UserContractView> {
  void loadUser(int size);
}

abstract class UserContractView extends BaseContractView {
  void onSuccess(List<User> response);
}
{% endhighlight %}

### สร้าง `Function` ที่ไว้ติดต่อกับ API

{% highlight dart %}
class ApiService {

  String _baseUrl = "http://api.randomuser.me/";

  Future<Response> loadUser(int size) {
    return http.get("$_baseUrl?results=$size");
  }

}
{% endhighlight %}

### สร้าง `Interactor` 
<br>

เพื่อติดต่อกับ Class ที่เป็นตัวเชื่อมกับ API

{% highlight dart %}
class UserInteractor implements UserContractInteractor {

  ApiService _api;

  UserInteractor(this._api);

  @override
  Future<Response> loadUser(int size) {
    return _api.loadUser(size);
  }
}
{% endhighlight %}

### สร้าง `Presenter`
<br>

เพื่อติดต่อกับ Interactor และเขียน Business Logic ทั้งหมดไว้ที่นี่

{% highlight dart %}
class UserPresenter implements UserContractPresenter {
  UserContractView _view;
  UserInteractor _userInteractor;
  final JsonDecoder _decoder = new JsonDecoder();

  UserPresenter(this._userInteractor);

  @override
  void loadUser(int size) {
    _userInteractor.loadUser(size).then((Response response) {
      final String jsonBody = response.body;
      final statusCode = response.statusCode;

      if (statusCode < 200 || statusCode >= 300 || jsonBody == null) {
        throw FetchDataException(
            "Error while getting contacts [StatusCode:$statusCode, Error:${response
                .reasonPhrase}]");
      }

      final userContainer = _decoder.convert(jsonBody);
      final List userItems = userContainer['results'];

      return userItems
          .map((contactRaw) => new User.fromMap(contactRaw))
          .toList();
    }).then((List<User> response) {
      if (_view != null) _view.onSuccess(response);
    }).catchError((onError) {
      if (_view != null) _view.onError(onError);
    });
  }

  @override
  void bind(UserContractView view) {
    _view = view;
  }

  @override
  void unbind() {
    _view = null;
  }
}
{% endhighlight %}

### สร้าง `Widget`
<br>

เพื่อติดต่อกับ Presenter เพื่อสั่งให้มันทำงานให้ โดยที่ View ไม่จำเป็นต้องรู้ Logic อะไรเลย คือใช้ให้คนอื่นทำงานให้อย่างเดียว และก็รอรับผลลัพธ์

{% highlight dart %}
class UserWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Users"),
      ),
      body: UserStateWidget(),
    );
  }
}

class UserStateWidget extends StatefulWidget {
  @override
  State<StatefulWidget> createState() {
    return UserListState();
  }
}

class UserListState extends State<UserStateWidget> with WidgetsBindingObserver implements UserContractView {
  UserPresenter _presenter;

  List<User> _users;
  bool _isLoading;

  UserListState() {
    _presenter = Injector.provideUserPresenter();
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _isLoading = true;
    _presenter.bind(this);
    _presenter.loadUser(30);
  }

  @override
  Widget build(BuildContext context) {
    var widget;

    if (_isLoading) {
      widget = Center(
          child: Padding(
              padding: const EdgeInsets.only(left: 16.0, right: 16.0),
              child: CircularProgressIndicator()));
    } else {
      widget = ListView(children: <Widget>[Column(children: _buildUserList())]);
    }

    return widget;
  }

  List<_UserListItem> _buildUserList() {
    return _users.map((contact) => _UserListItem(contact)).toList();
  }

  @override
  void onError(Exception e) {
    print("Exception: $e");
  }

  @override
  void onNetwork(NetworkStatus network) {
    if (NetworkStatus.STRONG == network) {
      print("Network strong");
    } else if (NetworkStatus.WEAK == network) {
      print("Network weak");
    } else {
      print("Network error");
    }
  }

  @override
  void onSuccess(List<User> response) {
    print(response);

    setState(() {
      _users = response;
      _isLoading = false;
    });
  }

  @override
  void dispose() {
    print("-> dispose");
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
    _presenter.unbind();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.inactive:
        print("-> inactive");
        break;
      case AppLifecycleState.paused:
        print("-> paused");
        break;
      case AppLifecycleState.resumed:
        print("-> resumed");
        break;
      case AppLifecycleState.suspending:
        print("-> suspending");
        break;
    }
  }
}

class _UserListItem extends ListTile {
  _UserListItem(User user)
      : super(
            title: Text(user.fullName),
            subtitle: Text(user.email),
            leading: CircleAvatar(child: Text(user.fullName[0])));
}
{% endhighlight %}

### ตัวอย่าง [Source Code](http://raboninco.com/XBS7) สามารถเข้าไปดูได้เลย ๆ ครับ
<br>
ที่เขียนสั้นโดยที่ไม่ค่อยอธิบายอะไรเพราะอยากให้ไปลองด้วยตัวเองมากกว่าการอ่านซึ่งก็เพราะว่า "การเรียนรู้ที่ดีที่สุดคือการได้ลงมือทำด้วยตัวเอง" 

<br><br>