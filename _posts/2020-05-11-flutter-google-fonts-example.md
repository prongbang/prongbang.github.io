---
layout: post
title:  "[Flutter] เปลี่ยน fonts ในแอพที่เขียนด้วย Flutter ด้วย Google Fonts"
short_description: "วิธีใช้งานก็ง่ายมาก ๆ มาดูกันว่าทำยังไง"
date:   2020-05-11 18:37:00 +0700
categories: [flutter]
tags: [flutter]
cover_image: /assets/images/flutter/06.png
author: "end try"
---

### เริ่มจากเพิ่ม dependencies ที่เราต้องใช้ก่อนตามนี้

- pubspec.yaml

{% highlight yaml %}
dependencies:
  google_fonts: ^1.0.0
{% endhighlight %}

จากนั้นกดปุ่ม `Pub get` รอจนกว่าจะโหลดเสร็จ หรือถ้าใครถนัดดูมากกว่า สามารถดูได้ใน Youtube ข้างล่างนี้ได้เลย
<br><br>

<iframe width="100%" height="450" src="https://www.youtube.com/embed/g8-xVw_Lk30" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<br>

### วิธีเรียกใช้

- เรียกใช้งานผ่าน TextTheme โดยใช้ font ที่ชื่อว่า Prompt

{% highlight dart %}
ThemeData(
    textTheme: GoogleFonts.promptTextTheme(Theme.of(context).textTheme),
)
{% endhighlight %}

แบบเต็มก็จะได้ประมาณนี้

{% highlight dart %}
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData(
        textTheme: GoogleFonts.promptTextTheme(Theme.of(context).textTheme),
      ),
      home: MyHomePage(title: 'ใช้งาน Google Fonts แบบง่าย ๆ'),
    );
  }
}
{% endhighlight %}

- เรียกใช้งานผ่าน Style โดยใช้ font ที่ชื่อว่า Prompt

{% highlight dart %}
Text(
    widget.title,
    style: GoogleFonts.prompt(),
)
{% endhighlight %}

แบบเต็มก็จะได้ประมาณนี้

{% highlight dart %}
class _MyHomePageState extends State<MyHomePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.title,
          style: GoogleFonts.prompt(),
        ),
      ),
    );
  }
}
{% endhighlight %}

เพียงแค่นี้ก็เปลี่ยน fonts ในแอพของเราแบบง่าย ๆ ได้แล้ว ตัวอย่าง [Source Code](https://raboninco.com/XDww) สามารถเข้าไปโหลดมาเล่นดูได้ ผิดพลาดตรงไหนขออภัย ณ ที่นั้นด้วยครับ 

<br>

### References

- [The google_fonts package for Flutter](https://pub.dev/packages/google_fonts)

<br>