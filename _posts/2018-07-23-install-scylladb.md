---
layout: post
title:  "[Database] ลองติดตั้ง Scylla DB บน Docker ดูสักหน่อย ๆ"
short_description: "เป็น Real-Time Big Data Database ที่น่าสนใจอีกตัวที่อยากให้ลองมาเล่นกัน ๆ"
date:   2018-07-23 21:13:01 +0700
categories: database
tags: [database]
cover_image: /assets/images/database/1.png
author: "end try"
---

### จุดเด่นของ Scylla ที่เป็น Real-Time Big Data Database ที่สามารถ Scale-up ได้ง่าย และเป็น Open Source สามารถติดตังได้หลายช่องทาง ดังนี้
<br>

Docker, AWS, RHEL 7, CentOS 7, Debian 8, Virtual Box, Ubuntu สามารถเข้ามาดูข้อมูลเพิ่มเติมได้[ที่นี่](https://www.scylladb.com/)

<br>

### ในโพสนี้เราจะมาติดตั้งบน Docker ใครยังไม่ลงนี่พลาดมาก ๆ รีบโหลดมาลงเลย[จิ้มตรงนี้](https://docs.docker.com/docker-for-mac/)

- เริ่มจากแบบ Single Scylla Node

{% highlight shell %}
$ docker run --name some-scylla -d scylladb/scylla
{% endhighlight %}

ถ้าลงเสร็จแล้ว ลองเช็คโปรเซสก่อนว่ามี Container อะไรบ้างที่ทำงานอยู่โดยใช้คำสั่งนี้

{% highlight shell %}
$ docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                                                    NAMES
31b4bd940a5a        scylladb/scylla     "/docker-entrypoint.…"   8 seconds ago       Up 11 seconds       7000-7001/tcp, 9042/tcp, 9160/tcp, 9180/tcp, 10000/tcp   some-scylla
{% endhighlight %}

ถ้าอยากจะดู logs ให้รันคำสั่งนี้

{% highlight shell %}
$ docker logs some-scylla  | tail
INFO  2018-07-23 15:25:26,633 [shard 0] database - Setting compaction strategy of system_traces.node_slow_log_time_idx to SizeTieredCompactionStrategy
INFO  2018-07-23 15:25:26,653 [shard 1] compaction - Compacted 2 sstables to [/var/lib/scylla/data/system_schema/keyspaces-abac5682dea631c5b535b3d6cffd0fb6/system_schema-keyspaces-ka-35-Data.db:level=0, ]. 66318 bytes to 61407 (~92% of original) in 48ms = 1.22MB/s. ~256 total partitions merged to 4.
INFO  2018-07-23 15:25:38,668 [shard 0] storage_service - Starting listening for CQL clients on 172.17.0.2:9042 (unencrypted)
INFO  2018-07-23 15:25:38,669 [shard 0] storage_service - Thrift server listening on 172.17.0.2:9160 ...
INFO  2018-07-23 15:25:40,097 [shard 0] standard_role_manager - Created default superuser role 'cassandra'.
{% endhighlight %}

ถ้าอยากจะตรวจสอบสถานะเซิร์ฟเวอร์ด้วย Nodetool

{% highlight shell %}
$ docker exec -it some-scylla nodetool status
Datacenter: datacenter1
=======================
Status=Up/Down
|/ State=Normal/Leaving/Joining/Moving
--  Address     Load       Tokens       Owns    Host ID                               Rack
UN  172.17.0.2  520.96 KB  256          ?       2ea504dd-e462-4720-a61e-6d986b5127cc  rack1
{% endhighlight %}

ถ้าอยาก cqlsh tool (Cassandra Query Language Shell) 

{% highlight shell %}
$ docker exec -it some-scylla cqlsh
{% endhighlight %}

และเราจะสามารถรัน Query ประมาณนี้ได้

{% highlight shell %}
cqlsh> SELECT cluster_name FROM system.local

 cluster_name
--------------


(1 rows)
{% endhighlight %}

- แบบ Cluster

{% highlight shell %}
$ docker run --name some-scylla2 -d scylladb/scylla --seeds="$(docker inspect --format='{ { .NetworkSettings.IPAddress } }' some-scylla)"
{% endhighlight %}

ถ้าจะดู Status ของ Cluster ให้ใช้คำสั่งนี้

{% highlight shell %}
$ docker exec -it some-scylla nodetool status
Datacenter: datacenter1
=======================
Status=Up/Down
|/ State=Normal/Leaving/Joining/Moving
--  Address     Load       Tokens       Owns    Host ID                               Rack
UJ  172.17.0.3  ?          256          ?       d2d2f3c3-0986-4559-ab8a-af96cb3e5d28  rack1
UN  172.17.0.2  520.96 KB  256          ?       2ea504dd-e462-4720-a61e-6d986b5127cc  rack1
{% endhighlight %}

เพียงเท่านี้ก็เรียบร้อย และนี่ก็เป็นเพียงตัวอย่างแบบง่าย ๆ เท่านั้นเอง ส่วนการนำไปใช้ติดตามโพสต่อไป ๆ

<br>
<br>

