---
layout: post
title: "[Git] ว่าด้วยเรื่องรูปแบบการ Commit Message"
short_description: "เป็นส่วนหนึ่งที่สำคัญที่เราอาจมองข้ามไป และมีรูปแบบหนึ่งที่นิยมใช้และน่าสนใจ คือ AngularJS commit message format."
date: 2024-06-08 22:36:00 +0700
categories: [git]
tags: [git]
cover_image: /assets/images/git/01.jpg
author: "Devไปวันๆ"
---

### Git Commit Message Format ประกอบด้วย 3 ส่วนคือ: `header`, `body`, `footer`

{% highlight shell %}
<header>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
{% endhighlight %}


#### 1. `Header` จะมีรูปแบบประมาณนี้ซึ่งจะประกอบไปด้วย `<type>`, `(<scope>)`, `<short summary>`

<br/>
ซึ่ง `<type>` และ `<short summary>` เป็นส่วนบังคับที่จะต้องกำหนด ส่วน `(<scope>)` ไม่ได้บังคับ จะมี หรือ ไม่มี ก็ได้

{% highlight shell %}
<type>(<scope>): <short summary>
│       │             │
│       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
│       │
│       └─⫸ Commit Scope: animations|bazel|benchpress|common|compiler|compiler-cli|core|
│                          elements|forms|http|language-service|localize|platform-browser|
│                          platform-browser-dynamic|platform-server|router|service-worker|
│                          upgrade|zone.js|packaging|changelog|docs-infra|migrations|
│                          devtools
│
└─⫸ Commit Type: build|ci|docs|feat|fix|perf|refactor|improve|test|chore|style
{% endhighlight %}

#### `<type>` เป็นสิ่งที่บอกประเภทของ commit message นั้นๆว่าเกี่ยวกับอะไร ซึ่งจะขึ้นอยู่กับว่าเราจะกำหนดและนิยามให้เป็นอะไรบ้าง เช่น 

- `build`: การเปลี่ยนแปลงที่มีผลกระทบต่อระบบสร้างหรือการพึ่งพาภายนอก (ตัวอย่างขอบเขต: gulp, broccoli, npm)
- `ci`: การเปลี่ยนแปลงในไฟล์กำหนดค่าและสคริปต์ CI ของเรา (ตัวอย่าง: CircleCi, SauceLabs, Jenkinefile, GitLab CI)
- `docs`: การเปลี่ยนแปลงเอกสารเท่านั้น
- `feat`: คุณสมบัติใหม่ (feature)
- `fix`: การแก้ไขบั๊ก (bug)
- `perf`: การเปลี่ยนแปลงโค้ดที่ปรับปรุงประสิทธิภาพ (performance)
- `refactor`: การเปลี่ยนแปลงโค้ดที่ไม่ได้แก้ไขบั๊กหรือเพิ่มคุณสมบัติใหม่ (feature)
- `improve`: การเปลี่ยนแปลงโค้ดเพื่อปรับปรุงระบบ แต่ไม่ใช่การเพิ่มคุณสมบัติใหม่หรือแก้ไขบั๊ก (bug)
- `test`: การเพิ่มการทดสอบที่ขาดหายไปหรือการแก้ไขการทดสอบที่มีอยู่
- `chore`: การเปลี่ยนแปลงโค้ดที่ไม่ได้เพิ่มคุณสมบัติใหม่หรือแก้บั๊ก แต่เป็นการปรับปรุงประสิทธิภาพการทำงานโดยรวม การปรับปรุงสคริปต์ dependencies ต่าง ๆ การทำความสะอาดและเพิ่มความเป็นระเบียบให้กับโครงการ (project)
- `style`: การเปลี่ยนแปลงประเภท (style) จะเกี่ยวข้องกับการปรับปรุงรูปแบบการเขียนโค้ดให้มีความเป็นมาตรฐานเป็นระเบียบ และง่ายต่อการอ่านและบำรุงรักษา โดยไม่กระทบต่อความสามารถในการทำงานของโปรแกรม
- อื่นๆ

#### `<scope>` เป็นสิ่งที่บอกขอบเขตของ commit message นั้นๆเพื่อเจาะจงสิ่งที่ได้แก้ไขหรือเปลี่ยนแปลงไปครอบคลุมหรือได้รับผลกระทบที่ส่วนไหนบ้าง หรือจะระบุถึง feature ก็ได้เช่นกัน ซึ่งจะขึ้นอยู่กับว่าเราจะกำหนดและนิยามให้เป็นอะไรบ้าง เช่น

- `animations`: การทำ animation ต่าง ๆ
- `localize`: การทำเกี่ยวกับภาษาต่าง ๆ
- `docs-infra`: การทำเกี่ยวกับโครงสร้างพื้นฐานต่าง ๆ
- migrations: การโยกย้ายหรือการเปลี่ยนแปลง ต่าง ๆ
- `router`: การเปลี่ยนแปลงการทำ router ต่าง ๆ
- `devtools`: การเปลี่ยนแปลงการทำ devtools ต่าง ๆ
- `packaging`: การเปลี่ยนแปลง packaging ต่าง ๆ
- อื่นๆ

#### `<short summary>` เป็นคำอธิบายโดยย่อของการเปลี่ยนแปลงของ commit message นั้น ๆ และไม่ขึ้นต้นด้วยตัวพิมพ์ใหญ่ เช่น

{% highlight shell %}
update links to the new docs (angular.dev) (#56138)
{% endhighlight %}

#### 2. `Body` ส่วนที่ใช้อธิบายเหตุผลของการเปลี่ยนแปลงโค้ดว่าทำไมจึงทำการเปลี่ยนแปลง หรือเปรียบเทียบการทำงานก่อนและหลังการเปลี่ยนแปลงเพื่อแสดงผลกระทบได้ เช่น

{% highlight shell %}
This PR replaces all links available within the devtools to point to the new docs.
The links to Input/Output (decorators) have been replaced with their function (signal) counterparts: input, output.
{% endhighlight %}

#### 3. `Footer` ระบุการเปลี่ยนแปลงที่ทำให้เสียหาย การเลิกใช้งาน และเป็นที่อ้างอิง github or gitlab issues, jira tickets และ pr อื่นๆ ที่เกี่ยวข้อง เช่น

{% highlight shell %}
PR Close #56138
{% endhighlight %}

#### เมื่อนำทั้ง 3 ส่วนมารวมร่างกันก็จะได้ประมาณนี้

- แบบที่มี `<scope>`

{% highlight shell %}
refactor(devtools): update links to the new docs (angular.dev) (#56138)

This PR replaces all links available within the devtools to point to the new docs.
The links to Input/Output (decorators) have been replaced with their function (signal) counterparts: input, output.

PR Close #56138
{% endhighlight %}

- แบบที่ไม่มี `<scope>`

{% highlight shell %}
ci: migrate snapshot publishing from CircleCI to GHA (#51957)

Migrate the snapshot publishing from CircleCI to GHA

PR Close #51957
{% endhighlight %}

หวังว่าจะเป็นประโยชน์ให้กับผู้ที่หลงเข้ามาอ่านนะครับ หากมีอะไรผิดพลาดตรงไหนขออภัยด้วยครับ เอกสารอ้างอิงครับ [AngularJS commit message format](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-commit-message-format)
