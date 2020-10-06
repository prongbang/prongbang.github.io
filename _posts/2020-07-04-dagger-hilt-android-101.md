---
layout: post
title:  "[Android] ใช้งาน Hilt (ด้ามจับของ) Dagger + MVVM + Clean แบบไม่เน้นทฤษฎี"
short_description: "วิธีใช้งานก็ง๊ายง่าย ถ้าเทียบกับ Dagger ที่ไม่มีด้ามจับ (Hilt)"
date:   2020-07-04 22:43:09 +0700
categories: [android]
tags: [android]
cover_image: /assets/images/android/17.png
author: "end try"
---

### เริ่มจากเพิ่ม dependencies ของ hilt-dagger ก่อนตามนี้

- เข้าไปแก้ไฟล์ `my-project/build.gradle` โดยเพิ่มตามนี้

{% highlight groovy %}
buildscript {
    dependencies {
        classpath 'com.google.dagger:hilt-android-gradle-plugin:2.28-alpha'
    }
}
{% endhighlight %}

- เข้าไปแก้ไฟล์ `my-project/app/build.gradle` โดยเพิ่มตามนี้

{% highlight groovy %}
apply plugin: 'kotlin-kapt'
apply plugin: 'dagger.hilt.android.plugin'

dependencies {
    implementation "com.google.dagger:hilt-android:2.28-alpha"
    kapt "com.google.dagger:hilt-android-compiler:2.28-alpha"
    implementation 'androidx.hilt:hilt-lifecycle-viewmodel:1.0.0-alpha01'
    kapt 'androidx.hilt:hilt-compiler:1.0.0-alpha01'
}
{% endhighlight %}

### มาใช้งานกันเลย ทฤษฎีไม่ต้อง

- เปิดใช้งาน Hilt ก็แค่ใส่ `@HiltAndroidApp` ใน class Application ของเราตามนี้

{% highlight kotlin %}
@HiltAndroidApp
class MainApplication : Application()
{% endhighlight %}

- อยากใช้งาน Context ก็แค่ใส่ `@ApplicationContext` นี้มาใส่ เดี๋ยว dagger มันจะ inject ให้เราเอง

{% highlight kotlin %}
class LiveNetworkConnection @Inject constructor(
		@ApplicationContext private val context: Context
) : NetworkConnection
{% endhighlight %}

- เลือกใช้งาน `@InstallIn` ซึ่งสามารถใช้ Components ได้อยุ่ 7 ตัว (ขอใช้อธิบายเป็นภาษาอังกฤษตาม Hilt) คือ

A Hilt component that has the lifetime of the application.

{% highlight kotlin %}
@InstallIn(ApplicationComponent::class)
{% endhighlight %}

A Hilt component that has the lifetime of the service.

{% highlight kotlin %}
@InstallIn(ServiceComponent::class)
{% endhighlight %}

A Hilt component that has the lifetime of a configuration surviving activity.

{% highlight kotlin %}
@InstallIn(ActivityRetainedComponent::class)
{% endhighlight %}

A Hilt component that has the lifetime of the activity.

{% highlight kotlin %}
@InstallIn(ActivityComponent::class)
{% endhighlight %}

A Hilt component that has the lifetime of the fragment.

{% highlight kotlin %}
@InstallIn(FragmentComponent::class)
{% endhighlight %}

A Hilt component that has the lifetime of the view.

{% highlight kotlin %}
@InstallIn(ViewComponent::class)
{% endhighlight %}

A Hilt component that has the lifetime of the view.

{% highlight kotlin %}
@InstallIn(ViewWithFragmentComponent::class)
{% endhighlight %}

ซึ่งลำดับของ Component ตามนี้

<center>
<img src="https://developer.android.com/images/training/dependency-injection/hilt-hierarchy.svg"/>
</center>
<br>
<center>ภาพจาก <a target="_blank" href="https://developer.android.com/training/dependency-injection/hilt-android">https://developer.android.com/training/dependency-injection/hilt-android</a></center>

- สร้าง `NetworkModule` และทำการ `@Binds` instance ตามที่เราต้องการ ซึ่ง `@Binds` จะใช้กับ interface

{% highlight kotlin %}
@Module
@InstallIn(ApplicationComponent::class)
abstract class NetworkModule {

	@Binds
	abstract fun bindLiveNetworkConnection(
        liveNetworkConnection: LiveNetworkConnection): NetworkConnection
}
{% endhighlight %}

- หรือจะใช้ท่านี้ก็ได้ ถ้า constructor ไม่ถูก inject ค่าให้ หรือต้องการ Provide ค่าให้กับ interface จะใช้ `@Provides`

{% highlight kotlin %}
@Module
@InstallIn(ApplicationComponent::class)
object NetworkModule {

	@Provides
	fun provideLiveNetworkConnection(
        liveNetworkConnection: LiveNetworkConnection): NetworkConnection = liveNetworkConnection
}
{% endhighlight %}

- สร้าง `MainModule` และทำการ `@Binds` instance ตามที่เราต้องการ

{% highlight kotlin %}
@Qualifier
annotation class RemoteMain

@Qualifier
annotation class LocalMain

@InstallIn(ActivityComponent::class)
@Module
abstract class MainModule {

	@Binds
	abstract fun bindRestApi(api: RestMainApi): MainApi

	@RemoteMain
	@Binds
	abstract fun bindMainRemoteDataSource(dataSource: MainRemoteDataSource): MainDataSource

	@LocalMain
	@Binds
	abstract fun bindMainLocalDataSource(dataSource: MainLocalDataSource): MainDataSource

	@Binds
	abstract fun bindMainRepository(repository: DefaultMainRepository): MainRepository

	@Binds
	abstract fun bindCowSayUseCase(useCase: CowSayUseCase): UseCase<Unit, String>
}
{% endhighlight %}

- อยาก inject ค่าให้กับ ViewModel ก็แค่ใส่ `@ViewModelInject` ตามนี้

{% highlight kotlin %}
class MainViewModel @ViewModelInject constructor(
		private val mainRepository: MainRepository
) : ViewModel()
{% endhighlight %}

- อยาก inject ค่า ViewModel มาใช้ใน Activity ก็แค่ใส่ `@AndroidEntryPoint` และใช้ตามนี้

{% highlight kotlin %}
@AndroidEntryPoint
class MainActivity : AppCompatActivity() {

	private val mainViewModel: MainViewModel by viewModels()
}
{% endhighlight %}

### เมื่อทำการ สร้าง @Module เพื่อ @Binds และ @Provides เสร็จให้ทำตามนี้

{% highlight bash %}
ทำการกด `Make Project` หรือ `Build > Rebuild Project`
{% endhighlight %}

ถ้าเขียนไม่ถูกจะมี Error พ่นออกมาด่าเรา ถ้าไม่มีก็ยินดีด้วยคุณมาถูกทางแล้ว :) อาจจะเขียนน้อยไปหน่อยเพราะช่วงนี้ไม่ค่อยมีเวลาเท่าไร หากผิดพลาดประการใดต้องขออภัย ณ ที่นั่นด้วยครับ
และ [Source Code](https://raboninco.com/1FJYs/) สามารถเข้าไปดูได้ที่นี่เลยครับ 

<br>