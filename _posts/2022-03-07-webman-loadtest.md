---
layout: post
title: "[PHP] ลองเล่น Webman Framework เขียนด้วย PHP ที่บอกว่าเร็ว มาดูว่าจะเร็วแค่ไหน"
short_description: "ด้วยความที่อยากรู้แล้วก็อยากลองใช้ดู ก็เลยจะลองโหลดเทสดูสักหน่อย"
date: 2022-03-07 09:40:44 +0700
categories: php
tags: [php]
cover_image: /assets/images/php/1.png
author: "end try"
---

## ก่อนที่จะใช้งาน [Webman](https://www.workerman.net/doc/webman/install.html) มาเตรียมความพร้อมกันก่อน

<br>

### 1. ติดตั้ง composer

<br>

เข้าไปติดตั้งตามนี้ [https://getcomposer.org/download/](https://getcomposer.org/download/)

<br>

#### ถ้าเครื่องเป็น macOS ลงแบบนี้ง่ายดี

{% highlight shell %}
brew install composer
{% endhighlight %}

### 2. ตั้งค่า proxy composer

{% highlight shell %}
composer config -g repo.packagist composer https://mirrors.aliyun.com/composer/
{% endhighlight %}

### 3. ลองสร้างโปรเจค

{% highlight shell %}
composer create-project workerman/webman ชื่อโปรเจค
{% endhighlight %}

ถ้ารันได้ประมาณนี้แสดงว่าเราไดด้โปรเจค webman แล้วเรียบร้อย

{% highlight shell %}
➜  PHP composer create-project workerman/webman webman-loadtest                       
Creating a "workerman/webman" project at "./webman-loadtest"
Info from https://mirrors.aliyun.com/composer: #StandWithUkraine
Installing workerman/webman (v1.2.5)
  - Installing workerman/webman (v1.2.5): Extracting archive
Created project in /Users/PHP/webman-loadtest
Loading composer repositories with package information
Updating dependencies
Lock file operations: 6 installs, 0 updates, 0 removals
  - Locking monolog/monolog (2.3.5)
  - Locking nikic/fast-route (v1.3.0)
  - Locking psr/container (1.1.1)
  - Locking psr/log (1.1.4)
  - Locking workerman/webman-framework (v1.2.7)
  - Locking workerman/workerman (v4.0.30)
Writing lock file
Installing dependencies from lock file (including require-dev)
Package operations: 6 installs, 0 updates, 0 removals
  - Installing psr/log (1.1.4): Extracting archive
  - Installing monolog/monolog (2.3.5): Extracting archive
  - Installing workerman/workerman (v4.0.30): Extracting archive
  - Installing psr/container (1.1.1): Extracting archive
  - Installing nikic/fast-route (v1.3.0): Extracting archive
  - Installing workerman/webman-framework (v1.2.7): Extracting archive
> support\Plugin::install
> support\Plugin::install
> support\Plugin::install
> support\Plugin::install
> support\Plugin::install
> support\Plugin::install
15 package suggestions were added by new dependencies, use `composer suggest` to see details.
Generating autoload files
3 packages you are using are looking for funding.
Use the `composer fund` command to find out more!
{% endhighlight %}


### 4. Run โปรเจค

#### Run แบบ debug mode (สำหรับ development และ debugging) 

{% highlight shell %}
php start.php start
{% endhighlight %}

#### Run แบบ deamon mode (สำหรับ production)

{% highlight shell %}
php start.php start -d
{% endhighlight %}

### 4.1 เข้าไปที่โปรเจคแล้วสร้าง Dockerfile ตามนี้

{% highlight shell %}
FROM php:7.4-cli

# Install various PHP extensions
RUN docker-php-ext-configure pcntl --enable-pcntl \
    && docker-php-ext-install pcntl

COPY . /usr/src/myapp
WORKDIR /usr/src/myapp
EXPOSE 8787
CMD [ "php", "./start.php", "start" ]
{% endhighlight %}

### 4.2 ลอง build image ตามนี้

{% highlight shell %}
docker build -t webman-loadtest .
{% endhighlight %}

### 4.3 ลองรัน container ตามนี้

{% highlight shell %}
docker run -p 8787:8787 -it --rm --name webman-loadtest-running webman-loadtest
{% endhighlight %}

ถ้ารันผ่านก็จะได้ประมาณนี้

{% highlight shell %}
Workerman[./start.php] start in DEBUG mode
----------------------------------------- WORKERMAN -----------------------------------------
Workerman version:4.0.30          PHP version:7.4.28
------------------------------------------ WORKERS ------------------------------------------
proto   user            worker          listen                 processes    status           
tcp     root            webman          http://0.0.0.0:8787    12            [OK]            
tcp     root            monitor         none                   1             [OK]            
---------------------------------------------------------------------------------------------
Press Ctrl+C to stop. Start success.
{% endhighlight %}

### 4.4 ลอง curl ดูตามนี้

{% highlight shell %}
curl http://localhost:8787/
{% endhighlight %}

ก็จะได้

{% highlight shell %}
hello webman
{% endhighlight %}

## ลอง loadtest ดูสักหน่อยย

<br>

เครื่องที่ใช้ทำ loadtest สเปคตามนี้

{% highlight shell %}
- MacBook Pro (15-inch, 2018)
- CPU 2.2 GHz 6-Core Intel Core i7
- RAM 16 GB 2400 MHz DDR4
{% endhighlight %}

### เริ่ม!

### ดู stats ก่อนโหลดเทส

{% highlight shell %}
docker stats
{% endhighlight %}

จะได้ประมาณนี้

{% highlight shell %}
CONTAINER ID   NAME                      CPU %     MEM USAGE / LIMIT     MEM %     NET I/O           BLOCK I/O    PIDS
6d2334237383   webman-loadtest-running   0.7%     27.05MiB / 1.939GiB   1.36%     6.13kB / 6.26kB   0B / 4.1kB   14
{% endhighlight %}

### ลองยิงละนะ

<br>

เราจะใช้ [wrk](https://github.com/wg/wrk) นะใครสนใจจิ้มไปดูได้

<br>

Options ที่จะใช้ตามนี้

{% highlight shell %}
-t 12  --> 12 Thread
-c 400 --> 400 connections
-d 30s --> 30 วินาที
{% endhighlight %}

### ลองยิงจริง ๆ ละนะ

{% highlight shell %}
wrk -t 12 -c 400 -d 30s http://localhost:8787/
{% endhighlight %}

### จังหวะที่ยิง stats ขึ้นมาประมาณนี้

{% highlight shell %}
CONTAINER ID   NAME                      CPU %     MEM USAGE / LIMIT     MEM %     NET I/O           BLOCK I/O       PIDS
395785a04e1a   webman-loadtest-running   160.50%   30.89MiB / 1.939GiB   1.56%     52.4MB / 74.9MB   4.1kB / 4.1kB   14
{% endhighlight %}

### ผลการ loadtest สำหรับเจ้าของบล็อคเป็นที่น่าพอใจเลยคับ

{% highlight shell %}
Running 30s test @ http://localhost:8787/
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    29.84ms   16.85ms 277.08ms   76.70%
    Req/Sec     1.14k   215.82     1.91k    69.64%
  409774 requests in 30.07s, 51.98MB read
  Socket errors: connect 0, read 362, write 0, timeout 0
Requests/sec:  13626.48
Transfer/sec:      1.73MB
{% endhighlight %}

### ใครสนใจลองมาเล่นดูได้ที่

<br>

[https://www.workerman.net/doc/webman/install.html](https://www.workerman.net/doc/webman/install.html) หวังว่าจะเป็นประโยชน์สำหรับสาย PHP ที่กำลังมองหา PHP Framework อยู่นะครับ หากผิดพลาดตรงไหนต้องขออภัย ณ ที่นั้นด้วยครับ

<br>

#### ตัวอย่าง Source Code ที่ทำในโพสนี้ครับ

<br>

[https://github.com/prongbang/webman-loadtest](https://github.com/prongbang/webman-loadtest)

<br>
<br>