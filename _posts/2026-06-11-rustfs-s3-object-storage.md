---
layout: post
title: "[Rust] การใช้งาน RustFS ทำ Object Storage แบบ S3-Compatible"
short_description: "แนะนำ rustfs/rustfs สำหรับทำ S3-compatible object storage ด้วย Rust, รันด้วย Docker, เข้า Console, ใช้ S3 API และดูโครงสร้าง crate ที่อยู่ข้างใน"
date: 2026-06-11 15:00:00 +0700
categories: [rust]
tags: [rust]
cover_image: /assets/images/rust/8.png
author: "Devไปวันๆ"
---

ถ้าต้องการ Object Storage ที่คุยด้วย S3 API ได้ แต่ยังอยากได้ระบบที่เขียนด้วย Rust และมีของที่จำเป็นสำหรับงาน production อย่าง erasure coding, bitrot protection, IAM, metrics, tracing, logging และ console สำหรับจัดการ bucket

`RustFS` เป็นอีกตัวที่น่าสนใจ เพราะออกแบบมาให้เป็น S3-compatible object storage สำหรับงาน data lake, AI, big data และ cloud-native application

Repository: [github.com/rustfs/rustfs](https://github.com/rustfs/rustfs)

## RustFS คืออะไร

จาก README ของโปรเจค RustFS เป็น distributed object storage ที่เขียนด้วย Rust และทำ API ให้ compatible กับ S3

ภาพรวมที่ควรรู้

- ใช้ S3-compatible API เป็นทางหลักในการ upload/download object
- มี Console สำหรับจัดการ bucket, object, user, policy
- รองรับ Single Node Mode และกำลังมี Distributed Mode อยู่ในสถานะ testing
- มีระบบ versioning, logging, event notification, bucket replication, multi-tenancy
- มี bitrot protection และ erasure coding สำหรับเก็บข้อมูลแบบทนทานขึ้น
- มี observability ผ่าน metrics, tracing และ logs
- License เป็น Apache-2.0

README ของ RustFS ระบุว่า project นี้ตั้งใจรวมความเรียบง่ายแบบ MinIO เข้ากับ memory safety และ performance ของ Rust

## สถานะฟีเจอร์จาก README

ใน README มีตารางสถานะฟีเจอร์ไว้ค่อนข้างชัด

| Feature | สถานะ |
| --- | --- |
| S3 Core | Available |
| Upload / Download | Available |
| Versioning | Available |
| Logging | Available |
| Event Notifications | Available |
| Kubernetes Helm Charts | Available |
| Keystone Auth | Available |
| Swift API | Available |
| Bitrot Protection | Available |
| Single Node Mode | Available |
| Bucket Replication | Available |
| Multi-Tenancy | Available |
| Lifecycle Management | Under Testing |
| Distributed Mode | Under Testing |
| RustFS KMS | Under Testing |
| Swift Metadata Ops | Partial |

ตรงนี้สำคัญ เพราะถ้าเอาไปใช้จริงควรแยกให้ออกว่า feature ไหนพร้อมแล้ว และ feature ไหนยังควรทดสอบกับ workload ของตัวเองก่อน

## รันด้วย Docker แบบเร็วสุด

README แนะนำให้เตรียม directory สำหรับ data และ logs ก่อน เพราะ container ใช้ user id `10001`

{% highlight shell %}
mkdir -p data logs
sudo chown -R 10001:10001 data logs
{% endhighlight %}

แล้วรัน container

{% highlight shell %}
docker run -d \
  --name rustfs \
  -p 9000:9000 \
  -p 9001:9001 \
  -v $(pwd)/data:/data \
  -v $(pwd)/logs:/logs \
  rustfs/rustfs:latest
{% endhighlight %}

Port ที่ต้องจำมี 2 ตัว

- `9000` สำหรับ S3 API
- `9001` สำหรับ Web Console

เข้า Console ได้ที่

{% highlight shell %}
http://localhost:9001
{% endhighlight %}

ค่าเริ่มต้นใน README และ docker compose คือ

{% highlight text %}
Access Key: rustfsadmin
Secret Key: rustfsadmin
{% endhighlight %}

สำหรับ local test ใช้ได้ แต่ถ้าจะเปิดออก network จริงควรเปลี่ยนทันที

## สร้าง Bucket และลอง Upload

หลังจากเข้า Console ที่ `http://localhost:9001` แล้ว ให้สร้าง bucket ก่อน เช่น `demo`

จากนั้นสามารถ upload object ผ่าน Console ได้เลย หรือจะใช้ S3-compatible client ก็ได้ เช่น AWS CLI

{% highlight shell %}
export AWS_ACCESS_KEY_ID=rustfsadmin
export AWS_SECRET_ACCESS_KEY=rustfsadmin
export AWS_DEFAULT_REGION=us-east-1

aws --endpoint-url http://localhost:9000 s3 mb s3://demo
aws --endpoint-url http://localhost:9000 s3 cp ./hello.txt s3://demo/hello.txt
aws --endpoint-url http://localhost:9000 s3 ls s3://demo
{% endhighlight %}

แนวคิดคือ application ไม่จำเป็นต้องรู้ว่า backend เป็น RustFS ขอแค่ client นั้นคุย S3 API ได้ ก็ชี้ endpoint มาที่ `http://localhost:9000` ได้เลย

## รันด้วย Docker Compose

ใน repo มี `docker-compose-simple.yml` ที่ตั้งค่าพื้นฐานมาให้ครบกว่า `docker run`

ค่าที่น่าสนใจใน compose file

{% highlight yaml %}
ports:
  - "9000:9000" # S3 API port
  - "9001:9001" # Console port

environment:
  - RUSTFS_VOLUMES=/data/rustfs{0...3}
  - RUSTFS_ADDRESS=0.0.0.0:9000
  - RUSTFS_CONSOLE_ADDRESS=0.0.0.0:9001
  - RUSTFS_CONSOLE_ENABLE=true
  - RUSTFS_ACCESS_KEY=rustfsadmin
  - RUSTFS_SECRET_KEY=rustfsadmin
  - RUSTFS_OBS_LOGGER_LEVEL=info
  - RUSTFS_OBJECT_CACHE_ENABLE=true
  - RUSTFS_OBJECT_CACHE_TTL_SECS=300
{% endhighlight %}

จุดที่ดีคือ compose แยก volume เป็น 4 ชุด

{% highlight yaml %}
volumes:
  - rustfs_data_0:/data/rustfs0
  - rustfs_data_1:/data/rustfs1
  - rustfs_data_2:/data/rustfs2
  - rustfs_data_3:/data/rustfs3
{% endhighlight %}

และมี service `volume-permission-helper` สำหรับ `chown` volume ให้ user `10001:10001`

{% highlight shell %}
docker compose -f docker-compose-simple.yml up -d
{% endhighlight %}

ถ้าต้องการ stack ที่มี observability จาก README สามารถใช้ profile ได้

{% highlight shell %}
docker compose --profile observability up -d
{% endhighlight %}

profile นี้เหมาะตอนอยากดู metrics, tracing และ logs ผ่านเครื่องมืออย่าง Prometheus, Grafana และ Jaeger

## รันจาก Source

ใน `scripts/run.sh` มี flow สำหรับ dev local อยู่ประมาณนี้

- ถ้ายังไม่มี `rustfs/static/index.html` จะ download console bundle มาก่อน
- build binary ด้วย `cargo build -p rustfs --bins`
- สร้าง volume test 4 ชุดใน `./target/volume/test{1..4}`
- เปิด S3 API ที่ `:9000`
- เปิด Console ที่ `:9001`
- เปิด scanner, heal, object cache และ config observability บางส่วน

คำสั่งหลัก

{% highlight shell %}
./scripts/run.sh
{% endhighlight %}

ค่าที่ script ตั้งไว้ เช่น

{% highlight shell %}
export RUSTFS_VOLUMES="./target/volume/test{1...4}"
export RUSTFS_ADDRESS=":9000"
export RUSTFS_CONSOLE_ENABLE=true
export RUSTFS_CONSOLE_ADDRESS=":9001"
export RUSTFS_SCANNER_ENABLED=true
export RUSTFS_HEAL_ENABLED=true
export RUSTFS_OBJECT_CACHE_ENABLE=true
{% endhighlight %}

ถ้าต้องการข้าม build เพราะ build แล้ว

{% highlight shell %}
SKIP_BUILD=1 ./scripts/run.sh
{% endhighlight %}

บน macOS ถ้า cross compile แล้วเจอ error เกี่ยวกับ file descriptor จาก README แนะนำให้เพิ่ม limit ก่อน

{% highlight shell %}
ulimit -n 4096
{% endhighlight %}

## Build Image เอง

README มี script สำหรับ build multi-platform image ด้วย Docker Buildx

{% highlight shell %}
./docker-buildx.sh --build-arg RELEASE=latest
./docker-buildx.sh --push
./docker-buildx.sh --release v1.0.0 --push
./docker-buildx.sh --registry your-registry.com --namespace yourname --push
{% endhighlight %}

หรือใช้ Makefile

{% highlight shell %}
make docker-buildx
make docker-buildx-push
make docker-buildx-version VERSION=v1.0.0
make help-docker
{% endhighlight %}

ถ้าทีมต้องการ pin version ของ image เอง การ build แล้ว push เข้า registry ภายในจะคุม release ได้ง่ายกว่าใช้ `latest`

## โครงสร้าง Workspace

RustFS ไม่ได้เป็น binary ก้อนเดียว แต่แยก workspace เป็น crate ย่อยหลายตัว

จาก root `Cargo.toml` โปรเจคใช้ Rust edition `2024`, กำหนด `rust-version` เป็น `1.93.0` และมี lint `unsafe_code = "deny"`

crate หลักบางส่วนที่เห็นจาก workspace

- `rustfs` เป็น binary หลักของ server
- `rustfs-ecstore` ดูแล storage, endpoint, erasure และ bucket operation
- `rustfs-filemeta` ดูแล metadata ของ file/object
- `rustfs-heal` ดูแล self-healing
- `rustfs-iam` ดูแล identity และ access management
- `rustfs-kms` สำหรับ key management
- `rustfs-keystone` สำหรับ Keystone auth
- `rustfs-metrics` สำหรับ metrics
- `rustfs-notify` สำหรับ notification
- `rustfs-obs` สำหรับ observability
- `rustfs-policy` สำหรับ policy
- `rustfs-protocols` สำหรับ protocol เสริม เช่น Swift และ FTPS
- `rustfs-s3select-api` และ `rustfs-s3select-query` สำหรับ S3 Select
- `rustfs-scanner` สำหรับ data scanner

ใน `rustfs/src/main.rs` startup flow จะ parse config, init license, init observability, init TLS ถ้ามี `RUSTFS_TLS_PATH`, init credentials, parse volume endpoint, init disk, init lock client, แล้วค่อยเริ่ม service หลัก

ส่วน dependency ที่ใช้ก็ตรงกับงาน server/storage เช่น `tokio`, `axum`, `hyper`, `tower`, `rustls`, `s3s`, `aws-sdk-s3`, `datafusion`, `opentelemetry` และ `reed-solomon-simd`

## Config สำคัญที่มักได้ใช้

ค่าพื้นฐานจาก compose และ run script ที่ควรรู้

{% highlight shell %}
RUSTFS_VOLUMES=/data/rustfs{0...3}
RUSTFS_ADDRESS=0.0.0.0:9000
RUSTFS_CONSOLE_ADDRESS=0.0.0.0:9001
RUSTFS_CONSOLE_ENABLE=true
RUSTFS_ACCESS_KEY=rustfsadmin
RUSTFS_SECRET_KEY=rustfsadmin
RUSTFS_OBS_LOGGER_LEVEL=info
RUSTFS_TLS_PATH=/opt/tls
RUSTFS_OBJECT_CACHE_ENABLE=true
RUSTFS_OBJECT_CACHE_TTL_SECS=300
{% endhighlight %}

ถ้าจะเปิด HTTPS ให้เตรียม certificate directory แล้วชี้ `RUSTFS_TLS_PATH` ตามเอกสาร TLS ของ RustFS

## ใช้ Nix

README มีวิธีรันผ่าน Nix ด้วย

{% highlight shell %}
nix run github:rustfs/rustfs
{% endhighlight %}

หรือ build ก่อน

{% highlight shell %}
nix build github:rustfs/rustfs
./result/bin/rustfs --help
{% endhighlight %}

เหมาะกับคนที่อยากทดลอง binary แบบไม่ต้องจัด environment เองเยอะ

## ข้อควรระวัง

ถ้าจะใช้งานจริงควรเช็ค release ล่าสุดของ `rustfs/rustfs` และอ่าน changelog ก่อนเสมอ เพราะ project storage มักมีรายละเอียดเรื่อง format, config และ compatibility ที่ควร lock version ให้ชัดเจน

default credential `rustfsadmin/rustfsadmin` ใช้ได้สำหรับ local เท่านั้น ไม่ควรปล่อยไว้บน server

directory หรือ volume ที่ mount ให้ container ต้องเขียนได้โดย user `10001` ไม่อย่างนั้นจะเจอ permission error ตอน start

feature บางตัวใน README ยังอยู่ในสถานะ `Under Testing` หรือ `Partial` เช่น Distributed Mode, Lifecycle Management, RustFS KMS และ Swift Metadata Ops ดังนั้น workload ที่ใช้ฟีเจอร์เหล่านี้ควรมี staging test ก่อน

Object Storage ไม่ใช่ filesystem mount ธรรมดา pattern การใช้งานควรเป็น bucket/object ผ่าน S3 API หรือ Console

## สรุป

RustFS เหมาะกับคนที่ต้องการ S3-compatible object storage ที่เขียนด้วย Rust และมี ecosystem สำหรับงาน storage จริง เช่น bucket, object, IAM, policy, replication, event notification, metrics, tracing, logging และ self-healing

ถ้าแค่ลองเล่น เริ่มจาก Docker แล้วเข้า Console ที่ `http://localhost:9001` ได้เลย

ถ้าจะเอาไปใช้จริง ให้เริ่มจากการ lock version image, เปลี่ยน credential, วาง TLS, ตั้ง observability, ทดสอบ backup/restore และตรวจ feature status ที่ต้องใช้ก่อนขึ้น production
