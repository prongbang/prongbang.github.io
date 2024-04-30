---
layout: post
title:  "[Flutter] ตอนที่ 2 การใช้งาน Buttons"
short_description: "ลองใช้งาน Buttons ต่าง ๆ และใช้งาน Event เมื่อมีการคลิกปุ่ม"
date:   2018-03-03 11:32:02 +0700
categories: flutter
tags: [flutter]
cover_image: /assets/images/flutter/02-0-button.png
author: "Devไปวันๆ"
---
#### จะมีอยู่ 2 theme ด้วยกันคือ Material (Android) กับ Cupertino (iOS)

##### 1.ส่วนของ Material (Android) จะมีอยู่ประมาณ 6 แบบ คือ
- RaisedButton การเรียกใช้งานก็ประมาณนี้ โดยใส่ข้อความปุ่มว่า RaisedButton และเมื่อมีการคลิกที่ปุ่มมันจะทำงานที่ onPressed เพื่อปริ้นคำว่า RaisedButton
{% highlight dart %}
new RaisedButton(
    onPressed: () => print("RaisedButton"),
    child: new Text('RaisedButton'),
),
{% endhighlight %}

- FloatingActionButton การเรียกใช้งานก็ประมาณนี้ โดยมีการใส่ Icon ที่ปุ่ม และเมื่อมีการคลิกที่ปุ่มมันจะทำงานที่ onPressed เพื่อปริ้นคำว่า FloatingActionButton
{% highlight dart %}
new FloatingActionButton(
    onPressed: () => print("FloatingActionButton"),
    child: new Icon(Icons.add),
),
{% endhighlight %}

- FlatButton การเรียกใช้งานก็ประมาณนี้ โดยใส่ข้อความปุ่มว่า FlatButton และเมื่อมีการคลิกที่ปุ่มมันจะทำงานที่ onPressed เพื่อปริ้นคำว่า FlatButton
{% highlight dart %}
new FlatButton(
    onPressed: () => print("FlatButton"),
    child: new Text("FlatButton")
),
{% endhighlight %}

- IconButton การเรียกใช้งานก็ประมาณนี้ โดยมีการใส่ Icon ที่ปุ่ม และเมื่อมีการคลิกที่ปุ่มมันจะทำงานที่ onPressed เพื่อปริ้นคำว่า IconButton Clear
{% highlight dart %}
new IconButton(
    icon: new Icon(Icons.clear),
    onPressed: () => print("IconButton Clear")
),
{% endhighlight %}

- ButtonBar การเรียกใช้งานก็ประมาณนี้ ตัวนี้สามารถมี Widget ได้หลายตัว ซึ่งแต่ละตัวสามารถดักจับ event ของตัวเองได้ เช่น การคลิกปุ่ม เป็นต้น
{% highlight dart %}
new ButtonBar(
    children: <Widget>[
    new IconButton(
        icon: new Icon(Icons.adb),
        onPressed: () => print("IconButton ADB")),
    new IconButton(
        icon: new Icon(Icons.add),
        onPressed: () => print("IconButton Add")),
    new IconButton(
        icon: new Icon(Icons.clear),
        onPressed: () => print("IconButton Clear")),
    ],
),
{% endhighlight %}

- PopupMenuButton การเรียกใช้งานก็ประมาณนี้ เมื่อมีการเลือกเมนูมันเข้ามาทำงานที่ onSelected เพื่อปริ้นค่า title ที่ได้เลือก
{% highlight dart %}
new PopupMenuButton<Choice>(
    // overflow menu
    onSelected: (Choice choice) => print(choice.title),
    itemBuilder: (BuildContext context) {
        return choices.skip(2).map((Choice choice) {
        return new PopupMenuItem<Choice>(
            value: choice,
            child: new Text(choice.title),
        );
        }).toList();
    },
),
{% endhighlight %}

##### 2.ส่วนของ Cupertino (iOS) จะมีอยู่แบบเดียว คือ

- CupertinoButton แบบแรกจะเป็นปุ่มที่ไม่มี Background การเรียกใช้งานก็ประมาณนี้ โดยใส่ข้อความปุ่มว่า Button และเมื่อมีการคลิกที่ปุ่มมันจะทำงานที่ onPressed เพื่อปริ้นคำว่า Button

{% highlight dart %}
new CupertinoButton(
    onPressed: () => print("Button"),
    child: new Text('Button'),
),
{% endhighlight %}

- CupertinoButton แบบที่สองจะเป็นปุ่มที่มี Background สีฟ้า การเรียกใช้งานก็ประมาณนี้ โดยใส่ข้อความปุ่มว่า Button Color และเมื่อมีการคลิกที่ปุ่มมันจะทำงานที่ onPressed เพื่อปริ้นคำว่า Button Color
{% highlight dart %}
new CupertinoButton(
    onPressed: () => print("Button Color"),
    child: new Text('Button Color'),
    color: new Color(0xFF1E88E5),
),
{% endhighlight %}

##### Source code ที่ใช้สำหรับทดลองเขียนในโพสนี้ ตามนี้เลย
{% highlight dart %}
// FileName: buttons.dart
import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';

class MyButtonPage extends StatefulWidget {
  String title;

  MyButtonPage({Key key, this.title}) : super(key: key);

  @override
  State<StatefulWidget> createState() {
    return new _MyButtonPageState();
  }
}

class _MyButtonPageState extends State<MyButtonPage> {
  void _select(Choice choice) {
    print(choice.title);
  }

  @override
  Widget build(BuildContext context) {

    return new Scaffold(
      appBar: new AppBar(
        title: new Text(widget.title),
        actions: <Widget>[
          new PopupMenuButton<Choice>(
            // overflow menu
            onSelected: _select,
            itemBuilder: (BuildContext context) {
              return choices.skip(2).map((Choice choice) {
                return new PopupMenuItem<Choice>(
                  value: choice,
                  child: new Text(choice.title),
                );
              }).toList();
            },
          ),
        ],
      ),
      body:
    new Center(
        child:
        new Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: <Widget>[
            new Row(
              children: <Widget>[
                new Column(
                  children: <Widget>[
                    new Text(
                      "Material",
                      style: new TextStyle(fontSize: 18.0),
                    ),
                    new RaisedButton(
                      onPressed: () => print("RaisedButton"),
                      child: new Text('RaisedButton'),
                    ),
                    new FloatingActionButton(
                      onPressed: () => print("FloatingActionButton"),
                      child: new Icon(Icons.add),
                    ),
                    new FlatButton(
                        onPressed: () => print("FlatButton"),
                        child: new Text("FlatButton")),
                    new IconButton(
                        icon: new Icon(Icons.clear),
                        onPressed: () => print("IconButton Clear")),
                    new ButtonBar(
                      children: <Widget>[
                        new IconButton(
                            icon: new Icon(Icons.adb),
                            onPressed: () => print("IconButton ADB")),
                        new IconButton(
                            icon: new Icon(Icons.add),
                            onPressed: () => print("IconButton Add")),
                        new IconButton(
                            icon: new Icon(Icons.clear),
                            onPressed: () => print("IconButton Clear")),
                      ],
                    )
                  ],
                ),
              ],
            ),
            new Row(
              children: <Widget>[
                new Column(
                  children: <Widget>[
                    new Text(
                      "Cupertino",
                      style: new TextStyle(
                        fontSize: 18.0,
                      ),
                    ),
                    new CupertinoButton(
                      onPressed: () => print("Button"),
                      child: new Text('Button'),
                    ),
                    new CupertinoButton(
                      onPressed: () => print("Button"),
                      child: new Text('Button Color'),
                      color: new Color(0xFF1E88E5),
                    ),
                  ],
                ),
              ],
            )
          ],
        ),
      ),
    );
  }
}

class Choice {
  const Choice({this.title, this.icon});

  final String title;
  final IconData icon;
}

const List<Choice> choices = const <Choice>[
  const Choice(title: 'Car', icon: Icons.directions_car),
  const Choice(title: 'Bicycle', icon: Icons.directions_bike),
  const Choice(title: 'Boat', icon: Icons.directions_boat),
  const Choice(title: 'Bus', icon: Icons.directions_bus),
  const Choice(title: 'Train', icon: Icons.directions_railway),
  const Choice(title: 'Walk', icon: Icons.directions_walk),
];
{% endhighlight %}