---
layout: post
title: "[Docker] อยากมีระบบจัดการ photos, videos, log files, backups ใช่มั้ย ใช้ Minio สิรอไร"
short_description: "ลดพลังงานการ Coding ได้เยอะเลยมาดูว่าเราจะใช้งานมันยังไง"
date: 2018-12-16 12:32:19 +0700
categories: [docker, minio]
tags: [docker, minio]
cover_image: /assets/images/docker/2.png
author: "Devไปวันๆ"
---

### Minio คืออะไร

<br>

Minio เป็นเซิร์ฟเวอร์ ที่เก็บข้อมูลพวก photos, videos, log files, backups เป็นต้น แถมยังเป็น open source และเข้ากันได้กับ Amazon S3 APIs อีกด้วย

<br>
### ติดตั้งเพื่อใช้งานบน Docker

<br>
ในที่นี้เราจะ Install ผ่าน docker-compose นะโดยให้สร้างโฟลเดอร์และไฟล์ตามนี้ภายใต้โฟลเดอร์ minio

{% highlight shell %}
minio
├── docker-compose.yaml
└── volumes
    └── minio-storage
{% endhighlight %}

- แล้วเขียนโค้ด config docker ใน docker-compose.yml ตามนนี้

{% highlight shell %}
version: "3.5"

services:
  minio:
    image: minio/minio
    container_name: minio-storage
    volumes:
      - "./volumes/minio-storage:/export"
    ports:
      - "9000:9000"
    environment:
      MINIO_ACCESS_KEY: 6DVY3Pkc4z
      MINIO_SECRET_KEY: FAAmZ0Evr7
    command: server /export
{% endhighlight %}

แนะนำให้เปลี่ยน `MINIO_ACCESS_KEY` และ `MINIO_SECRET_KEY` ด้วย

{% highlight shell %}
MINIO_ACCESS_KEY: ใส่ Access Key ของเราเป็นอะไรก็ได้แต่ขอให้เดายากหน่อย
MINIO_SECRET_KEY: ใส่ Secret Key ของเราเป็นอะไรก็ได้แต่ขอให้เดายากหน่อย
{% endhighlight %}

จากนั้นสั่ง Start เลยด้วยคำสั่งนี้

{% highlight shell %}
docker-compose up -d
{% endhighlight %}

จากนั้นให้เข้าไปที่ [localhost:9000](http://localhost:9000) เพียงเท่านี้ก็เรียบร้อย แล้วเราก็จะได้หน้าตาแบบนี้

<br>
<br>

<img src="/assets/images/docker/2-1.png"/>

<br>
<br>

เราสามารถสร้าง Bucket และ Upload file ขึ้น Minio ได้เลยโดยไม่ต้องเขียนโค้ดแม้แต่น้อย และถ้าอยาก Upload ด้วยโค้ดก็สามารถทำได้โดยใช้ Minio SDK ซึ่งรองรับหลายภาษา เช่น JavaScript, Java, Python, Golang, .NET อ่านข้อมูลเพิ่มเติมได้ที่ [https://docs.minio.io/docs/golang-client-quickstart-guide.html](https://docs.minio.io/docs/golang-client-quickstart-guide.html)

<br>

### ลอง Upload รูปขึ้น Minio ด้วยการใช้ Minio SDK ด้วย Golang

<br>
ก่อนอื่นให้สร้างโฟลเดอร์และไฟล์ตามนี้ภายใต้โฟลเดอร์ minio

{% highlight shell %}
minio
├── client
│   ├── image
│   │   └── minio.png
│   └── main.go
...
{% endhighlight %}

โดยเราจะกำหนด Requirement คือ <br>

1. สร้าง Bucket
2. Upload รูป
3. ดึง URL ของรูป

มาเริ่มเขียนแต่ละ Requirement กัน ๆ

- ก่อนอื่นให้เราไปโหลด minio-go มาก่อนโดนใช้คำสั่ง

{% highlight go %}
go get -u github.com/minio/minio-goo
{% endhighlight %}

จากนั้นให้ใส่ import ประมาณนี้

{% highlight go %}
import (
minio "github.com/minio/minio-go"
)
{% endhighlight %}

- สร้างการเชื่อมต่อกับ Minio ก่อนประมาณนี้ ซึ่งให้เราใส่ `accessKey` และ `secretAccess` ให้เหมือนกันกับที่เราใส่ใน `docker-compose.yml`

{% highlight go %}
endpoint := "localhost:9000"
accessKeyID := "6DVY3Pkc4z"
secretAccessKey := "FAAmZ0Evr7"
useSSL := false

// Initialize minio client object.
minioClient, err := minio.New(endpoint, accessKeyID, secretAccessKey, useSSL)
if err != nil {
log.Fatalln(err)
}
{% endhighlight %}

- สร้าง Bucket

{% highlight go %}
// Make a new bucket called anim.
bucketName := "anim"
location := "us-east-1"

err = minioClient.MakeBucket(bucketName, location)
if err != nil {
// Check to see if we already own this bucket (which happens if you run this twice)
exists, err := minioClient.BucketExists(bucketName)
if err == nil && exists {
log.Printf("We already own %s\n", bucketName)
} else {
log.Fatalln(err)
}
} else {
log.Printf("Successfully created %s\n", bucketName)
}
{% endhighlight %}

- Upload รูป

{% highlight go %}
// Upload the image file
objectName := "minio.png"
filePath := "./image/minio.png"
contentType := "application/octet-stream"

// Upload the image file with FPutObject
n, err := minioClient.FPutObject(bucketName, objectName, filePath, minio.PutObjectOptions{ContentType: contentType})
if err != nil {
log.Fatalln(err)
}
log.Printf("Successfully uploaded %s of size %d\n", objectName, n)
{% endhighlight %}

- ดึง URL ของรูป

{% highlight go %}
// Set request parameters
reqParams := make(url.Values)

// Gernerate presigned get object url.
presignedURL, err := minioClient.PresignedGetObject(bucketName, objectName, time.Duration(1000)\*time.Second, reqParams)
if err != nil {
log.Fatalln(err)
}
log.Println(presignedURL)
{% endhighlight %}

จากนั้นลองรันดูด้วยคำสั่ง

{% highlight go %}
go run main.go
{% endhighlight %}

ถ้าสามารถสร้าง Bucket, Upload รูป และ ดึง URL ได้จะได้ประมาณนี้

{% highlight shell %}
2018/12/23 21:07:49 Successfully created anim
2018/12/23 21:07:49 Successfully uploaded minio.png of size 47030
2018/12/23 21:07:49 http://localhost:9000/anim/minio.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=6DVY3Pkc4z%2F20181223%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20181223T140749Z&X-Amz-Expires=1000&X-Amz-SignedHeaders=host&X-Amz-Signature=e0e01c67adfc1da0ed9d5b88bd41bb300dcc731ff852e27ae62bf66c5d742a55
{% endhighlight %}

แล้วลองเข้าไปที่ [http://127.0.0.1:9000/minio/anim/](http://127.0.0.1:9000/minio/anim/) ก็จะเห็นว่ามีรูปที่เรา Upload ขุ้นไปแล้ว

<br>

- [Source code](https://raboninco.com/XBgy)

#### Reference

- [https://docs.minio.io/](https://docs.minio.io/)

<br>
