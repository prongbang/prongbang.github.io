---
layout: post
title:  "[Golang] มาใช้ gRPC ให้มันคุยกับ Microservice ข้าม platforms กันเถอะ ๆ"
short_description: "หลาย ๆ คนคงจะบอกว่าให้มันคุยกันผ่าน REST ก้ได้หนิ ซึ่งมันได้ก็จริง แต่ว่ามันก็มี limit ของมัน แล้วมันคืออะไรละมาดูกัน ๆ"
date:   2018-08-05 11:44:00 +0700
categories: [golang, grpc]
tags: [golang, grpc]
cover_image: /assets/images/golang/3.png
author: "end try"
---

### gRPC คืออะไร
<br>
gRPC คือ RPC (Remote Procedure Call) framework ที่ Google พัฒนาขึ้นมาใหม่ในแบบฉบับของตัวเองเพื่อเรียกใช้คำสั่งข้าม Platforms โดยเป็นสื่อกลางระหว่างระบบต่าง ๆ และ สามารถรองรับการเรียกคำสั่งเป็นหลัก `หมื่นล้าน` คำสั่งต่อวินาที แน่นอนว่ามันย่อม`รับ/ส่ง`ข้อมูลได้เร็วกว่าการส่งข้อมูลแบบ REST อยู่แล้วละ โดยตัว gRPC รองรับภาษา C++, Java, PHP, Go, Node, Ruby, Python, C# สามารถเข้าไปดูข้อมูลเพิ่มเติมได้[ที่นี่](https://grpc.io)

<br>

### Protocol buffers คืออะไร

<br>
Protocol buffers เป็นภาษาและแพลตฟอร์มที่เป็นกลางสำหรับกำหนดโครงสร้างข้อมูล และสามารถ generate โค้ดเพื่อใช้ในการ`รับ/ส่ง`ข้อมูลให้ด้วย โดยเขียนโครงสร้างข้อมูลไว้ในไฟล์ `.proto` และมีหน้าตาคร่าว ๆ ประมาณนี้

{% highlight proto %}
message Person {
  required string name = 1;
  required int32 id = 2;
  optional string email = 3;
}
{% endhighlight %}

### มาเริ่มติดตั้งกันเลยดีกว่า

- Install gRPC โดยใช้คำสั่งตามนี้

{% highlight shell %}
$ go get -u google.golang.org/grpc
{% endhighlight %}

- Install Protocol Buffers v3

โดยเข้าไปโหลดตาม platform(protoc-version-platform.zip) ได้ที่ [https://github.com/google/protobuf/releases](https://github.com/google/protobuf/releases)
<br>

จากนั้นก็แตกไฟล์ โดยเปลี่ยนชื่อโฟลเดอร์เป็น `protoc` แล้วก็ set PATH ให้มันซะ ประมาณนี้ (ใช้ zsh)

{% highlight shell %}
$ open ~/.zshrc
{% endhighlight %}
<br>

จากนั้นพิมพ์คำนี้เข้าไปในไฟล์ `.zshrc` แล้วก็ Save
{% highlight shell %}
export PATH=$HOME/Development/protoc/bin:$PATH
{% endhighlight %}

<br>
ต่อไปก็ Install `protoc` plugin สำหรับ Go ตามนี้

{% highlight shell %}
$ go get -u github.com/golang/protobuf/protoc-gen-go
{% endhighlight %}

### มาลองเขียน Service helloworld ด้วย Go กัน ๆ

- สร้างโฟลเดอร์ `helloworld` ภายใต้ `$GOPATH/src/github.com/prongbang/grpc-kid`

{% highlight shell %}
$ mkdir helloworld && cd helloworld && mkdir helloworld
{% endhighlight %}

- สร้างไฟล์ `helloworld.proto` แล้วพิมพ์ตามนี้

{% highlight proto %}
syntax = "proto3";

// The java definition
option java_multiple_files = true;
option java_package = "io.grpc.examples.helloworld";
option java_outer_classname = "HelloWorldProto";

// The objc definition
option objc_class_prefix = "HLW";

package helloworld;

// The greeting service definition.
service Greeter {
    // Sends a greeting
    rpc SayHello(HelloRequest) returns (HelloResponse) {}
    
    // Sends another greeting
    rpc SayHelloAgain (HelloRequest) returns (HelloResponse) {}
}

// The request message containing the user's name
message HelloRequest {
    string name = 1;    // ระบุ tag ที่ไม่ให้ซ้ำกันเพื่อใช้ในการทำ binary endcode
}

// The response message cotaining the gretting
message HelloResponse {
    string message = 1; // ระบุ tag ที่ไม่ให้ซ้ำกันเพื่อใช้ในการทำ binary endcode
}
{% endhighlight %}

- Generate `gRPC` code โดยใช้คำสั่งนี้

{% highlight shell %}
$ protoc -I . helloworld.proto --go_out=plugins=grpc:.
{% endhighlight %}

เมื่อ Run แล้วจะได้ไฟล์ชื่อ `helloworld.pb.go`

- ต่อไปมาสร้างส่วนของ `Server` เพื่อเรียกใช้ `protobuf` ที่เราสร้างก่อนหน้านี้ ตามนี้

{% highlight shell %}
$ mkdir greeter_server && cd greeter_server && touch main.go
{% endhighlight %}

จากนั้นใส่ code นี้ลงไป

{% highlight go %}
package main

import (
	"context"
	"log"
	"net"

	"google.golang.org/grpc/reflection"

	pb "github.com/prongbang/grpc-kid/helloworld/helloworld"
	"google.golang.org/grpc"
)

const port = ":50051"

// server is used to implement helloworld.GreetrServer
type server struct{}

func (s *server) SayHello(ctx context.Context, in *pb.HelloRequest) (*pb.HelloResponse, error) {
  log.Printf("Request: %s", in.Name)
	return &pb.HelloResponse{Message: "Hello " + in.Name}, nil
}

func (s *server) SayHelloAgain(ctx context.Context, in *pb.HelloRequest) (*pb.HelloResponse, error) {
	return &pb.HelloResponse{Message: "Hello again " + in.Name}, nil
}

func main() {

	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	s := grpc.NewServer()
	pb.RegisterGreeterServer(s, &server{})

	// Register reflection service on gRPC server.
	reflection.Register(s)
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}

}
{% endhighlight %}

- ต่อไปมาสร้างส่วนของ `Client` เพื่อเชื่อมต่อกับ `Server` ตามนี้

{% highlight shell %}
$ mkdir greeter_client && cd greeter_client && touch main.go
{% endhighlight %}

จากนั้นใส่ code นี้ลงไป

{% highlight go %}
package main

import (
	"context"
	"log"
	"os"
	"time"

	pb "github.com/prongbang/grpc-kid/helloworld/helloworld"
	"google.golang.org/grpc"
)

const (
	address     = "localhost:50051"
	defaultName = "World"
)

func main() {

	// Set up a connection to the server
	conn, err := grpc.Dial(address, grpc.WithInsecure())
	if err != nil {
		log.Fatalf("did not connect: %v", err)
	}
	defer conn.Close()
	c := pb.NewGreeterClient(conn)

	// Contact the server and print out its response.
	name := defaultName
	if len(os.Args) > 1 {
		name = os.Args[1]
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()
	r, err := c.SayHello(ctx, &pb.HelloRequest{Name: name})
	if err != nil {
		log.Fatalf("could not greet: %v", err)
	}
	log.Printf("Greeting: %s", r.Message)

	rs, errs := c.SayHelloAgain(ctx, &pb.HelloRequest{Name: name})
	if errs != nil {
		log.Fatalf("could not greet: %v", errs)
	}
	log.Printf("Greeting: %s", rs.Message)

}
{% endhighlight %}

### ลองรันดูสักหน่อย ๆ

- Run server

{% highlight shell %}
$ go run greeter_server/main.go
{% endhighlight %}

- Run client

{% highlight shell %}
$ go run greeter_client/main.go

// or
$ go run greeter_client/main.go prongbang
{% endhighlight %}

Request ที่ได้จาก Client

{% highlight shell %}
2018/08/05 16:27:10 Request: World
{% endhighlight %}

Response ที่ได้จาก Server

{% highlight shell %}
2018/08/05 16:27:10 Greeting: Hello World
2018/08/05 16:27:10 Greeting: Hello again World
{% endhighlight %}

### ลองสร้าง Service pingpong ด้วย Python

- สร้างโฟลเดอร์

{% highlight shell %}
$ mkdir pingpong && cd pingpong
{% endhighlight %}

- สร้างโฟลเดอร์และไฟล์สำหรับวางโครงสร้างของ service ของเราโดยใช้ protocol buffers

{% highlight shell %}
$ cd pingpong && mkdir proto && touch pingpong.proto
{% endhighlight %}

จากนั้นเขียนตามนี้
<br>

{% highlight proto %}
syntax = "proto3";

package pingpong;

// The pingpong service definition
service Pingponger {
    // Sends a ping
    rpc Ping(PingRequest) returns (PongResponse) {}
}

// The request message containing the ping name
message PingRequest {
    string name = 1;    // ระบุ tag ที่ไม่ให้ซ้ำกันเพื่อใช้ในการทำ binary endcode
}

// The response message containing the ping
message PongResponse {
    string message = 1; // ระบุ tag ที่ไม่ให้ซ้ำกันเพื่อใช้ในการทำ binary endcode
}
{% endhighlight %}

- Generate `gRPC` code โดยใช้คำสั่งนี้

{% highlight shell %}
$ python -m grpc_tools.protoc -I./proto --python_out=. --grpc_python_out=. ./proto/pingpong.proto
{% endhighlight %}

เมื่อ Run แล้วจะได้ไฟล์ชื่อ `pingpong_pb2.py` และ `pingpong_pb2_grpc.py`

- สร้างไฟล์สำหรับทำ server โดยใช้ python

{% highlight shell %}
$ touch server.py
{% endhighlight %}

จากนั้นใส่โค้ดตามนี้
<br>

{% highlight python %}
from concurrent import futures
import time
import math

import grpc

import pingpong_pb2
import pingpong_pb2_grpc

_ONE_DAY_IN_SECONDS = 60 * 60 * 24

class Pingponger(pingpong_pb2_grpc.PingpongerServicer):

    def Ping(self, request, context):
        print("Request: %s" % request.name)
        return pingpong_pb2.PongResponse(message='%s, Pong' % request.name)


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    pingpong_pb2_grpc.add_PingpongerServicer_to_server(Pingponger(), server)
    server.add_insecure_port('[::]:50052')
    server.start()
    try:
        while True:
            time.sleep(_ONE_DAY_IN_SECONDS)
    except KeyboardInterrupt:
        server.stop(0)


if __name__ == '__main__':
    serve()
{% endhighlight %}

โอเคสร้าง service ด้วย python เรียบร้อย
<br>
<br>

### ถ้าเราอยากให้ service `helloworld` เรียกใช้ service `pingpong` ละจะทำยังไง

- วิธีทำคือเอาไฟล์ `pingpong.proto` มา Grenerate `gRPC` code ของภาษาที่เราจะใช้ซึ่งในที่นี่คือ Go โดยใช้คำสั่งนี้

{% highlight shell %}
$ protoc -I. pingpong/pingpong.proto --go_out=plugins=grpc:.
{% endhighlight %}

เมื่อ Run แล้วจะได้ไฟล์ชื่อ `pingpong.pb.go`

- วิธีเรียกใช้งาน function ของ service `pingpong` ให้เราไปแก้ไฟล์ greeter_server/main.go ตามนี้

{% highlight golang %}
func main() {

	// Set up a connection to the pingpong server
	conn, err := grpc.Dial("localhost:50052", grpc.WithInsecure())
	if err != nil {
		log.Fatalf("did not connect: %v", err)
	}
	defer conn.Close()
	c := pingpong.NewPingpongerClient(conn)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()
	r, err := c.Ping(ctx, &pingpong.PingRequest{Name: "Ping"})
	if err != nil {
		log.Fatalf("could not pingpong: %v", err)
	}
	log.Printf("Pingpong: %s", r.Message)

	// Listener the server
	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	
	...

}
{% endhighlight %}

### ลองรันดูสักหน่อยว่า `helloworld` -> `pingpong` สามารถเรียกใช้งานได้มั้ยผ่าน `gRPC`

- Run service `pingpong`

{% highlight shell %}
$ cd pingpong && python server.py
{% endhighlight %}

- Run service `helloworld`

{% highlight shell %}
$ cd helloworld && go run greeter_server/main.go
{% endhighlight %}

- Output Response ที่ได้จาก service `pingpong` จะประมาณนี้

{% highlight shell %}
2018/08/06 22:55:27 Pingpong: Ping, Pong
{% endhighlight %}

- Output ที่ได้จาก service `helloworld` Request มาที่ service `pingpong` จะประมาณนี้

{% highlight shell %}
Request: Ping
{% endhighlight %}

<br>
สรุปที่เขียนมาทั้งหมดก็เพื่อ output มีกี่บรรทัดนี่เอง ฮ่า ๆ และจะเห็นได้ว่า Service เรียกใช้งานข้าม Service ได้โดยใช้ gRPC ซึ่งถ้าโปรดัคของเราเน้นเรื่อง Preformance แล้วดันไปให้ Service คุยกันผ่าน RESTful ก็ค่อย ๆ เปลี่ยนมาใช้ gRPC แทนนะครับ ถ้าผิดพลาดอะไรก็แล้ว ๆ กันไปเนอะ ถ้ามีวิธีที่ดีกว่านี้ หรือวิธีทำที่ถูกต้องโปรดช่วยชี้แนะด้วยนะครับ ขอบคุณครับ (เด๊กน้อยกำลังหัดเล่น) และนี่คือ [Source Code](http://raboninco.com/XBWu) ที่เขียนมา

<br>
<br>

### Reference

- [https://grpc.io/docs/](https://grpc.io/docs)
- [https://developers.google.com/protocol-buffers/docs/proto3](https://developers.google.com/protocol-buffers/docs/proto3?hl=th)
