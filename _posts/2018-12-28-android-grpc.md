---
layout: post
title:  "[Android] เมื่ออยากให้ Android รับ/ส่งข้อมูลที่มีความเร็วกว่า REST ลองเปลี่ยนมาใช้ gRPC สิ"
short_description: "หลาย ๆ คนอาจจะเขียน Android ต่อกับ REST กัน ซึ่งกว่าเราจะเขียนเชื่อมต่อได้ค่อนข้างใช้พลังเหมือนกัน แต่ว่าถ้าเราใช้ gRPC ตัว Android Studio มัน Generate ส่วนที่เชื่อมต่อกับ gRPC ให้เราเลยโดยไม่ต้องเขียนโค้ด เราทำเพียงแค่เรียกใช้เท่านั้น มาดูกันว่าต้องทำยังไง"
date:   2018-12-28 17:02:19 +0700
categories: [android, grpc]
tags: [android, grpc]
cover_image: /assets/images/android/15.png
author: "Devไปวันๆ"
---

### ไม่ต้องท้าวความอะไรให้มากมายเราเริ่มกันเลยดีกว่า
<br>

ในบล็อคนี้เราจะใช้ Protocol buffers จากบล็อคนี้ [[Golang] มาใช้ gRPC ให้มันคุยกับ Microservice ข้าม platforms กันเถอะ ๆ](https://prongbang.github.io/golang/grpc/2018/08/05/get-started-grpc-go.html) โดยเราจะใช้ตัว  ตัว `helloworld.proto` 

{% highlight proto %}
syntax = "proto3";

// The java definition
option java_multiple_files = true;
option java_package = "io.prongbang.grpc";
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

เราจะเห็นว่ามีการกำหนดค่าเพื่อให้สามารถใช้กับภาษา Java ได้ ซึ่งเราจะกำหนดเป็นอะไรก็ได้ ให้สื่อความหมาย ตามด้านล่างนี้

{% highlight proto %}
// The java definition
option java_multiple_files = true;
option java_package = "io.prongbang.grpc";
option java_outer_classname = "HelloWorldProto";
{% endhighlight %}

และมีการกำหนดค่าเพื่อให้สามารถใช้กับภาษา ObjectiveC ตามด้านล่างนี้

{% highlight proto %}
// The objc definition
option objc_class_prefix = "HLW";
{% endhighlight %}

### Setup protobuf ให้กับ Android Project

- เพิ่ม `protobuf-gradle-plugin` เข้าไปใน `build.gradle` ของโปรเจค

{% highlight gradle %}
buildscript {
    ext.kotlin_version = '1.3.11'
    repositories {
        google()
        jcenter()

        // เพิ่มส่วนนี้เข้ามา
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:3.2.1'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"

        // เพิ่มส่วนนี้เข้ามา
        classpath 'com.google.protobuf:protobuf-gradle-plugin:0.8.6'

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}

allprojects {
    repositories {
        google()
        jcenter()

        // เพิ่มส่วนนี้เข้ามา
        mavenCentral()
    }
}
{% endhighlight %}

- เรียกใช้ `protobuf plugin` และ `library` ใน `app/build.gradle`

{% highlight gradle %}
apply plugin: 'kotlin-android-extensions'

// เพิ่มส่วนนี้เข้ามา
apply plugin: 'com.google.protobuf'

android {

    // เพิ่มส่วนนี้เข้ามา
    lintOptions {
        disable 'GoogleAppIndexingWarning', 'HardcodedText', 'InvalidPackage'
        textReport true
        textOutput "stdout"
    }

}

// เพิ่มส่วนนี้เข้ามา
protobuf {
    protoc { artifact = 'com.google.protobuf:protoc:3.5.1-1' }
    plugins {
        javalite { artifact = "com.google.protobuf:protoc-gen-javalite:3.0.0" }
        grpc { artifact = 'io.grpc:protoc-gen-grpc-java:1.14.0' }
    }
    generateProtoTasks {
        all().each { task ->
            task.plugins {
                javalite {}
                grpc {
                    // Options added to --grpc_out
                    option 'lite'
                }
            }
        }
    }
}

dependencies {
    
    // เพิ่มส่วนนี้เข้ามา
    implementation 'io.grpc:grpc-okhttp:1.14.0'
    implementation 'io.grpc:grpc-protobuf-lite:1.14.0'
    implementation 'io.grpc:grpc-stub:1.14.0'
    implementation 'javax.annotation:javax.annotation-api:1.2'

}
{% endhighlight %}

- นำไฟล์ `helloworld.proto` จากด้านบนไปไว้ภายใต้ `main/proto/helloworld.proto` ถ้ามองภาพไม่ออกให้ดูตามนนี้

{% highlight shell %}
src
├── androidTest
│   └── java
│       └── ...
├── main
│   ├── AndroidManifest.xml
│   ├── java
│   │   └── ...
│   ├── proto
│   │   └── helloworld.proto    // ตรงนี้
│   └── res
│       └── ...
└── test
    └── ...
{% endhighlight %}

เมื่อใส่ครบแล้วให้กด Sync ครั้งนึง มันจะทำการไปดาวน์โหลดพวก library ให้รอจนโหลดเสร็จนะ

<br>

### วิธีที่จะให้ Android Studio มัน Generate class จากไฟล์ `helloworld.proto` เพื่อใช้เชื่อมต่อกับ gRPC

<br>
- ให้ไปที่ `Build -> Rebuild Project` รอสักพัก เมื่อ Success แล้วลองเข้าไปดูที่

{% highlight shell %}
android-grpc/app/build/generated/source/proto/debug/grpc/io/prongbang/grpc
{% endhighlight %}

<img src="/assets/images/android/15-1.png"/>

<br>

เราก็จะเห็นว่ามี class ชื่อ `GreeterGrpc.java` ซึ่งชื่อนี้มันมาจากชื่อ `service Greeter` และชื่อ package `io.prongbang.grpc` ก็ได้มาจากไฟล์ `helloworld.proto` ที่เราได้กำหนดไว้นั่นเอง

<br>

### ต่อไปเราจะมาใช้งาน class ที่มัน gen ให้

- สร้าง class `GrpcService` สำหรับสร้าง channel เพื่อเชื่อมต่อกับ gRPC server 

{% highlight kotlin %}
class GrpcService(private val host: String, private val port: Int) {

    fun createManagedChannel() = ManagedChannelBuilder.forAddress(host, port)
        .executor(Executors.newSingleThreadExecutor())
        .usePlaintext()
        .build()

}
{% endhighlight %}

- สรา้ง class `GreeterRemoteDataSource` เพื่อเชื่อมต่อและส่งข้อมูลไปให้ gRPC server

{% highlight kotlin %}
class GreeterRemoteDataSource constructor(private val grpcService: GrpcService) {

    suspend fun sayHello(message: String) = withContext(Dispatchers.IO) {

        return@withContext try {

            val channel = grpcService.createManagedChannel()

            val stub = GreeterGrpc.newBlockingStub(channel)

            val request = HelloRequest.newBuilder().setName(message).build()

            val reply = stub.sayHello(request)

            channel?.shutdown()?.awaitTermination(1, TimeUnit.SECONDS)

            reply.message
        } catch (e: Exception) {
            String.format("Failed... : %s", e.message)
        }
    }

}
{% endhighlight %}

การเรียกใช้ code บรรทัดนี้

{% highlight kotlin %}
val stub = GreeterGrpc.newBlockingStub(channel)
{% endhighlight %}

คือ protobuff บรรทัดนี้

{% highlight proto %}
// The greeting service definition.
service Greeter {
    //  ...
}
{% endhighlight %}

การเรียกใช้ code บรรทัดนี้

{% highlight kotlin %}
val request = HelloRequest.newBuilder().setName(message).build()
{% endhighlight %}

คือ protobuff บรรทัดนี้

{% highlight proto %}
// The request message containing the user's name
message HelloRequest {
    string name = 1;
}
{% endhighlight %}

การเรียกใช้ code บรรทัดนี้

{% highlight kotlin %}
val reply = stub.sayHello(request)
{% endhighlight %}

คือ protobuff บรรทัดนี้

{% highlight proto %}
// Sends a greeting
rpc SayHello(HelloRequest) returns (HelloResponse) {}
{% endhighlight %}

- สร้าง class `GreeterRepository` สำหรับเรียกใช้งาน DataSource ซึ่งแต่ละ function อาจจะมีได้มากกว่า 1 DataSource แต่ในตัวอย่างนี้มีเพียงตัวเดียว

{% highlight kotlin %}
class GreeterRepository constructor(private val greeterRemoteDataSource: GreeterRemoteDataSource) {

    suspend fun sayHello(message: String): String {

        return greeterRemoteDataSource.sayHello(message)
    }
}
{% endhighlight %}

- สร้าง class `SayHelloUseCase` สำหรับกรณีที่ส่งค่าไปให้ gRPC server โดยส่งค่าผ่าน function `sayHello`

{% highlight kotlin %}
class SayHelloUseCase constructor(
    private val greeterRepository: GreeterRepository
): UseCase<String, String>() {

    override suspend fun execute(parameters: String): String {

        return greeterRepository.sayHello(parameters)
    }

}
{% endhighlight %}

- สร้าง class `GreeterViewModel` เพื่อใช้ในการ control พวก View ซึ่งสามารถมีได้หลาย UseCase โดยในตัวอย่างนี้มีเพียงกรณีเดียวคือ ส่งข้อมูลไปให้ gRPC server แล้วก็รับค่ากลับมา  

{% highlight kotlin %}
class GreeterViewModel constructor(private val sayHelloUseCase: SayHelloUseCase) : ViewModel() {

    private var sayHelloJob: Job? = null

    fun sayHello(message: String): LiveData<Result<String>> {

        val liveDataMerger = MediatorLiveData<Result<String>>()

        sayHelloJob?.cancel()

        sayHelloJob = GlobalScope.launch(Dispatchers.Main) {

            liveDataMerger.addSource(sayHelloUseCase.invoke(message)) { value ->
                liveDataMerger.setValue(value)
            }

        }

        return liveDataMerger
    }

    override fun onCleared() {
        super.onCleared()
        sayHelloJob?.cancel()
    }

}
{% endhighlight %}

- สร้าง class `GreeterViewModelFactory` เพื่อสร้าง GreeterViewModel ให้พร้อมนำไปใช้งานใน Activity หรือ Fragment

{% highlight kotlin %}
class GreeterViewModelFactory(
    private val sayHelloUseCase: SayHelloUseCase
) : ViewModelProvider.Factory {

    override fun <T : ViewModel?> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(GreeterViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return GreeterViewModel(sayHelloUseCase) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }

}
{% endhighlight %}

- สร้าง object `Injector` สำหรับ Provide instance ให้กับ class อื่น ๆ ภายใน greeter

{% highlight kotlin %}
object Injector {

    // Provide GrpcService
    fun provideGrpcService() = GrpcService(
        "192.168.1.9", 
        50051
    )

    // Provide DataSource
    fun provideGreeterRemoteDataSource(grpcService: GrpcService) = GreeterRemoteDataSource(grpcService)

    // Provide Repository
    fun provideGreeterRepository(greeterRemoteDataSource: GreeterRemoteDataSource) = GreeterRepository(
        greeterRemoteDataSource
    )

    // Provide UseCase
    fun provideSayHelloUseCase(greeterRepository: GreeterRepository) = SayHelloUseCase(
        greeterRepository
    )

    // Provide ViewModelFactory
    fun provideGreeterViewModelFactory() = GreeterViewModelFactory(
        provideSayHelloUseCase(
            provideGreeterRepository(
                provideGreeterRemoteDataSource(
                    provideGrpcService()
                )
            )
        )
    )
}
{% endhighlight %}

- เรียกใช้ `GreeterViewModel` ใน Activity

{% highlight kotlin %}
private lateinit var viewModel: GreeterViewModel

override fun onCreate(savedInstanceState: Bundle?) {
    Injector.provideGreeterViewModelFactory().let { factory ->
        viewModel = ViewModelProviders.of(this, factory).get(GreeterViewModel::class.java)
    }

    viewModel.sayHello("gRPC").observe(this, Observer {
        when (it) {
            is Result.Loading -> {
                tvResult.text = ("Sending...")
            }
            is Result.Success -> {
                tvResult.text = it.data
            }
            is Result.Error -> {
                tvResult.text = ("Not receive")
            }
        }
    })
}
{% endhighlight %}

### ต่อไปก็ Start gRPC server

<br>

โดยใช้คำสั่งนี้

{% highlight shell %}
go run main.go
{% endhighlight %}

เมื่อ start แล้วจะขึ้นประมาณนี้

{% highlight shell %}
➜  grpcserver go run main.go
2018/12/28 23:36:19 Server start port :50051
{% endhighlight %}

### ลอง Run แอพ Android

<br>

ถ้าเราใส่ข้อความใน EditText ว่า "gRPC" แล้วได้ข้อความตอบกลับมาตามด้านล่างนี้ก็แสดงว่าเราได้ส่งข้อมูลไปให้ gRPC server ได้แล้ว และมันก็ได้ตอบกลับมาด้วยเช่นกัน

{% highlight shell %}
Hello gRPC
{% endhighlight %}

ส่วนฝั่งของ gRPC server เราก็จะเห็นว่ามีข้อความที่ส่งมาจาก client นั่นก็คือจาก Android ตามด้านล่างนี้

{% highlight shell %}
2018/12/28 23:42:34 Request: gRPC
{% endhighlight %}

เพียงเท่านี้เราก็สามารถรับ/ส่งค่าผ่าน gRPC ได้แล้ว จริง ๆ มันสามารถทำอะไรได้เยอะกว่านี้มากลองเข้าไปอ่านเพิ่มเติมได้ที่ [https://grpc.io/](https://grpc.io/) และสามารถโหลด [Source Code](https://raboninco.com/XBkc) ได้ที่นี่ 

<br>
<br>
