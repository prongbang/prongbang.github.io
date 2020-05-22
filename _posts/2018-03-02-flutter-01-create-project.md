---
layout: post
title:  "[Flutter] ตอนที่ 1 สร้างโปรเจค"
short_description: "หลังที่เราได้ติดตั้ง Flutter SDK และ Editor เสร็จแล้ว เราจะมาลองสร้างโปรเจคเพื่อเขียนแอพพลิเคชั่นกัน ซึ่งในตอนนี้ยังเป็น Beta อยู่"
date:   2018-03-02 12:34:42 +0700
categories: flutter
tags: [flutter]
cover_image: /assets/images/flutter/01-0-create-project.png
author: "end try"
---
#### ในที่นี้เราจะใช้โปรแกรม IntelliJ IDEA Community Edition ในการเขียนแอพพลิเคชั่น

##### 1.เมื่อเปิดโปรแกรมขึ้นมาแล้ว ให้เราเลือก Create New Project ตามรูปเลย
<img src="/assets/images/flutter/01-1.png" alt="Create New Project"/>

##### 2.เลือก Flutter จากนั้นก็เลือก Flutter SDK path: ตาม path ที่เราได้ clone flutter มาเก็บไว้ที่เครื่อง จากนั้นให้คลิกปุ่ม Next
<img src="/assets/images/flutter/01-2.png" alt="Flutter SDK path"/>

##### 3.ตั้งชื่อโปรเจค และสร้างโปรเจค
ซึ่งในตัว Editor ท่เราใช้นั่นได้บังคับให้เราตั้งชื่อด้วยตัวเล็กและถ้ามีช่องว่างให้ใส่ underscore(_) แทน โดยในตัวอย่างนี้เราจะตั้งชื่อว่า ```hello_flutter``` จากนั้นก็เลือก Project location: ที่เราต้องการเก็บโปรเจคที่เราสร้างว่าจะไว้ที่ไหน จากนั้นให้เปลี่ยน Organizetion ตามที่เราต้องการเลย ในที่นี้เราจะเลือกภาษา Kotlin และ Swift เนื่องจากภาษามี Syntax ค่อนข้างเหมือนกัน เมื่อเสร็จให้คลิก Finish ได้เลย จากนั้นก็รอแปป...
<img src="/assets/images/flutter/01-3.png" alt="Create Project"/>

###### เมื่อสร้างโปรเจคเสร็จแล้วจะได้หน้าตาประมาณนี้ เราจะเห็นว่ามีโปรเจค android และ ios ด้วย
<img src="/assets/images/flutter/01-4.png" alt="Project Structure"/>

##### 4.รันแอพพลิเคชั่น
###### ในที่นี้เราจะเลือกเป็น Open IOS Simulator ตามรูป
<img src="/assets/images/flutter/01-5.png" alt="Open IOS Simulator"/>

###### จากนั้นก็รอสักพัก... ก็จะได้ Simulator ประมาณนี้
<img src="/assets/images/flutter/01-6.png" alt="Simulator"/>

###### จากนั้นคลิกปุ่มรันสีเขียวตามรูป
<img src="/assets/images/flutter/01-7.png"/>

###### เมื่อรันแล้ว แล้วได้ตามรูป ก็เป็นอันเสร็จเรียบร้อย :')
<img src="/assets/images/flutter/01-0-create-project.png" alt="Running"/>

##### 5.Hot Reload
เมื่อเราเปลี่ยนแปลงอะไรบางอย่างใน code ของเรา แล้วเรากด cmd+S หรือ ctrl+S หรือกดปุมสายฟ้าสีเหลืองตามรูป มันจะเปลี่ยนข้อมูลบนแอพให้ทันที โดยที่เราไม่ต้องกดรันแอพใหม่
<img src="/assets/images/flutter/01-8.png" alt="Hot Reload"/>
