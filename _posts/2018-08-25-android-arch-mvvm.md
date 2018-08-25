---
layout: post
title:  "[Android] Architecture Components MVVM แบบเร่งรัด"
short_description: "เพื่อให้เหล่านักพัฒนาแอพ Android เขียนโค้ดในทิศทางเดียวกัน ทาง Google จึงได้จัดชุดนี้มาให้ซะเลย เรามาดูว่าจะใช้ท่าไหน"
date:   2018-08-25 16:32:34 +0700
categories: android
tags: [android]
cover_image: /assets/images/android/11.png
author: "end try"
---

### สิ่งที่ควรรู้คร่าว ๆ

- Data Binding Library : เป็น Library ที่ใช้ Bind UI โดยใช้ไม่ต้องเขียน findViewById วิธีใช้แค่ไปเปิดใช้งานใน build.gradle ประมาณนี้

{% highlight gradle %}
android {
    ...
    dataBinding {
        enabled = true
    }
}
{% endhighlight %}

- Handling lifecycles : ไว้จัดการ lifecycle ให้กับ class ของเราให้ง่ายขึ้น หน้าตาของมันจะประมาณนี้

{% highlight kotlin %}
import android.arch.lifecycle.Lifecycle
import android.arch.lifecycle.LifecycleObserver
import android.arch.lifecycle.OnLifecycleEvent
import android.content.Context
import android.os.Bundle
import android.support.v7.app.AppCompatActivity

class MyActivity : AppCompatActivity() {
    
    private lateinit var myLocationListener: MyLocationListener
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        myLocationListener = MyLocationListener(this, lifecycle, object : MyLocationListener.Callback {
            override fun onResult() {

            }
        })
        myLocationListener.enable()
    }
}

class MyLocationListener(private val context: Context,
                         private val lifecycle: Lifecycle,
                         private val callback: Callback) : LifecycleObserver {

    private var enabled = false


    @OnLifecycleEvent(Lifecycle.Event.ON_START)
    fun start() {
        if (enabled) {
            // connect
        }
    }

    fun enable() {
        enabled = true
        if (lifecycle.currentState.isAtLeast(Lifecycle.State.STARTED)) {
            // connect if not connected
        }
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
    fun stop() {
        // disconnect if connected
    }

    interface Callback {
        fun onResult()
    }
}
{% endhighlight %}

- LiveData : เป็นตัวที่คอย observable data และ notify data หรือใช้ในการรับส่งค่า เหมือน ๆ กับ Rx
- ViewModel : เพื่อจัดเก็บ และจัดการข้อมูลที่เกี่ยวข้องกับ UI ใน lifecycle ถึงแม้ว่าจะมีการหมุนหน้าจอไปมามันก็ไม่ตาย แต่มันจะตายตอน activity ถูกทำลาย และนี่คือหน้าตาของมัน

<center>
<img src="https://developer.android.com/images/topic/libraries/architecture/viewmodel-lifecycle.png"/>
</center>
<br>
<center>ภาพจาก <a target="_blank" href="https://developer.android.com">https://developer.android.com</a></center>

- Room Persistence Library : ที่ช่วยทำให้เราสามารถเก็บข้อมูลไว้ใน SQLite ได้แบบง่าย ๆ ลดการเขียนโค้ดได้ค่อนข้างเยอะ หน้าตาของมันจะประมาณนี้

{% highlight kotlin %}
@Dao
interface WordDao {

    @Insert
    fun insert(word: Word)

    @Query("DELETE FROM word_table")
    fun deleteAll()

    @Query("SELECT * from word_table ORDER BY word ASC")
    fun getAllWords() : LiveData<List<Word>>
}
{% endhighlight %}

- Dagger2 : มาช่วยจัดการ Dependency Injection เพื่อให้ code มันอิสระต่อกัน และ วิธีใช้งานก็แค่ใส่ Annotation @Inject ข้างบนชื่อ Class ประมาณนี้

{% highlight kotlin %}
@Inject
lateinit var helloViewModel: HelloViewModel
{% endhighlight %}

- Retrofit2 : เป็น HTTP client สำหรับ call API หน้าตาของมันจะประมาณนี้

{% highlight kotlin %}
interface GitHubService {
  @GET("users/{user}/repos")
  fun listRepos(@Path("user") user: String) : Call<List<Repo>>
}
{% endhighlight %}

- Glide : ใช้โหลดรูปและทำ caching หน้าตาของมันจะประมาณนี้

{% highlight kotlin %}
GlideApp.with(this).load("http://goo.gl/gEgYUd").into(imageView);
{% endhighlight %}

### เริ่มกันเลยดีกว่า
<br>

ในตัวอย่างนนี้เราจะทำแอพที่ไปดึงข้อมูล User จาก API ของ Github แล้วนำมาแสดงที่แอพของเรา โดยเราจะวางโครงของโปรเจคของเราประมาณนี้

{% highlight shell %}
java
└── com
    └── prongbang
        └── archmvvm
            ├── MainApplication.kt
            ├── api
            │   └── เก็บไฟล์ที่ทำหน้าที่เกี่ยวกับ API
            ├── binding
            │   └── เก็บไฟล์ที่ทำหน้าที่เกี่ยวกับการ binding adapter
            ├── dao
            │   └── เก็บไฟล์ที่ทำหน้าที่เกี่ยวกับ DAO
            ├── db
            │   ├── เก็บไฟล์ที่ทำหน้าที่เกี่ยวกับ Database
            │   └── convertor
            │       └── เก็บไฟล์ที่ทำหน้าที่เกี่ยวกับการ Convert ข้อมูลให้สามารถเก็บลง Table ได้
            ├── di
            │   └── เก็บไฟล์ที่ทำหน้าที่เกี่ยวกับการ config dependencies injection
            ├── jni
            │   └── เก็บไฟล์ที่ทำหน้าที่เกี่ยวกับการติดต่อกับภาษา C++
            ├── prefs
            │   └── เก็บไฟล์ที่ทำหน้าที่เกี่ยวกับการ Share Preference
            ├── repository
            │   └── เก็บไฟล์ที่ทำหน้าที่เกี่ยวกับการติดต่อกันระหว่าง API และ DAO
            ├── ui
            │   ├── SplashScreenActivity.kt
            │   ├── base
            │   │   ├── BaseAppCompatActivity.kt
            │   │   └── BaseFragment.kt
            │   ├── main
            │   │   └── MainActivity.kt
            │   └── user
            │       ├── UserAdapter.kt
            │       ├── UserFragment.kt
            │       └── UserViewModel.kt
            ├── utils
            │   └── เก็บไฟล์ที่ทำหน้าที่เกี่ยวกับ Utility
            ├── viewmodel
            │   └── เก็บไฟล์ที่ทำหน้าที่เกี่ยวกับการทำ Factory ให้กับ ViewModel
            └── vo
                └── เก็บไฟล์ที่ทำหน้าที่เกี่ยวกับ Value Object หรือ POJO หรือ Model
{% endhighlight %}

### สร้างส่วนที่ติดต่อกับ API
<br>

ถ้าข้อมูล API users เป็นแบบนี้
```
GET: https://api.github.com/users
```

Response
{% highlight json %}
[
    {
        login: "mojombo",
        id: 1,
        node_id: "MDQ6VXNlcjE=",
        avatar_url: "https://avatars0.githubusercontent.com/u/1?v=4",
        gravatar_id: "",
        url: "https://api.github.com/users/mojombo",
        html_url: "https://github.com/mojombo",
        followers_url: "https://api.github.com/users/mojombo/followers",
        following_url: "https://api.github.com/users/mojombo/following{/other_user}",
        gists_url: "https://api.github.com/users/mojombo/gists{/gist_id}",
        starred_url: "https://api.github.com/users/mojombo/starred{/owner}{/repo}",
        subscriptions_url: "https://api.github.com/users/mojombo/subscriptions",
        organizations_url: "https://api.github.com/users/mojombo/orgs",
        repos_url: "https://api.github.com/users/mojombo/repos",
        events_url: "https://api.github.com/users/mojombo/events{/privacy}",
        received_events_url: "https://api.github.com/users/mojombo/received_events",
        type: "User",
        site_admin: false
    }
]
{% endhighlight %}

ต่อไปให้เอาข้อมูล json ชุดนี้ไป generate เป็น data class โดยใช้ plugin ที่ชื่อว่า [Generate Kotlin data classes from JSON](https://plugins.jetbrains.com/plugin/10054-generate-kotlin-data-classes-from-json) โดยให้เราสร้าง class ชื่อว่า User ไว้ภายใต้ package `vo` โดยดูวิธี Genterate ประมาณนี้ 
<br><br>

<center><img src="https://plugins.jetbrains.com/files/10054/screenshot_17853.png"/></center>
<center>ภาพจาก <a target="_blank" href="https://plugins.jetbrains.com/plugin/10054-generate-kotlin-data-classes-from-json">https://plugins.jetbrains.com</a></center>

ถ้า Generate ผ่านจะได้ประมาณนี้

{% highlight kotlin %}
import com.google.gson.annotations.SerializedName

data class User(
        @SerializedName("id")
        var id: Int = 0,
        @SerializedName("gists_url")
        var gistsUrl: String = "",
        @SerializedName("repos_url")
        var reposUrl: String = "",
        @SerializedName("following_url")
        var followingUrl: String = "",
        @SerializedName("starred_url")
        var starredUrl: String = "",
        @SerializedName("login")
        var login: String = "",
        @SerializedName("followers_url")
        var followersUrl: String = "",
        @SerializedName("type")
        var type: String = "",
        @SerializedName("url")
        var url: String = "",
        @SerializedName("subscriptions_url")
        var subscriptionsUrl: String = "",
        @SerializedName("received_events_url")
        var receivedEventsUrl: String = "",
        @SerializedName("avatar_url")
        var avatarUrl: String = "",
        @SerializedName("events_url")
        var eventsUrl: String = "",
        @SerializedName("html_url")
        var htmlUrl: String = "",
        @SerializedName("site_admin")
        var siteAdmin: Boolean = false,
        @SerializedName("gravatar_id")
        var gravatarId: String = "",
        @SerializedName("node_id")
        var nodeId: String = "",
        @SerializedName("organizations_url")
        var organizationsUrl: String = ""
)
{% endhighlight %}

ต่อไปก็สร้าง method สำหรับ call API /users โดยต้องดูว่า API รองรับการ Request ด้วย Method อะไร ซึ่งในที่นี่เป็น Method GET ทีนี้เราก็จะรู้แล้วว่าเราต้องใส่ Annotation `@GET("users")` บนชื่อ Method จากนั้นเราก็มาดูต่อว่า API /users มีการคืนค่ามาเป็น Array และแน่นอนเราต้องใช้ List หรือว่า ArrayList ภายใน `Call<List<User>>` แบบนี้ และเมื่อเอามารวมกันก็จะได้แบบนี้

{% highlight kotlin %}
interface ApiService {
    @GET("users")
    fun getUser(): Call<List<User>>
}
{% endhighlight %}

### Config Room Database

- เริ่มจากกำหนด class `User` ที่เราสร้างก่อนหน้านี้ให้เป็น Entity หรือ Table เพื่อเก็บข้อมูลลง Database โดยให้เราใส่ Annotation `@Entity(tableName = "user")` บน class และกำหนด `@PrimaryKey` ให้กับ attribute และกำหนด `@ColumnInfo(name = "attribute_name")` หรือไม่ต้องกำหนดก็ได้ตัว Room มันจะรู้เองว่าจะใช้ชื่อ columns ตามชื่อ attribute ของเรา เมื่อนำมารวมกันเราจะได้ประมาณนี้

{% highlight kotlin %}
import android.arch.persistence.room.ColumnInfo
import android.arch.persistence.room.Entity
import android.arch.persistence.room.Ignore
import android.arch.persistence.room.PrimaryKey
import com.google.gson.annotations.SerializedName

@Entity(tableName = "user")
data class User(
        @PrimaryKey
        @ColumnInfo(name = "id")
        @SerializedName("id")
        var id: Int = 0,
        @ColumnInfo(name = "gists_url")
        @SerializedName("gists_url")
        var gistsUrl: String = "",
        @ColumnInfo(name = "repos_url")
        @SerializedName("repos_url")
        var reposUrl: String = "",
        @ColumnInfo(name = "following_url")
        @SerializedName("following_url")
        var followingUrl: String = "",
        @ColumnInfo(name = "starred_url")
        @SerializedName("starred_url")
        var starredUrl: String = "",
        @ColumnInfo(name = "login")
        @SerializedName("login")
        var login: String = "",
        @ColumnInfo(name = "followers_url")
        @SerializedName("followers_url")
        var followersUrl: String = "",
        @ColumnInfo(name = "type")
        @SerializedName("type")
        var type: String = "",
        @ColumnInfo(name = "url")
        @SerializedName("url")
        var url: String = "",
        @ColumnInfo(name = "subscriptions_url")
        @SerializedName("subscriptions_url")
        var subscriptionsUrl: String = "",
        @ColumnInfo(name = "received_events_url")
        @SerializedName("received_events_url")
        var receivedEventsUrl: String = "",
        @ColumnInfo(name = "avatar_url")
        @SerializedName("avatar_url")
        var avatarUrl: String = "",
        @ColumnInfo(name = "events_url")
        @SerializedName("events_url")
        var eventsUrl: String = "",
        @ColumnInfo(name = "html_url")
        @SerializedName("html_url")
        var htmlUrl: String = "",
        @ColumnInfo(name = "site_admin")
        @SerializedName("site_admin")
        var siteAdmin: Boolean = false,
        @ColumnInfo(name = "gravatar_id")
        @SerializedName("gravatar_id")
        var gravatarId: String = "",
        @ColumnInfo(name = "node_id")
        @SerializedName("node_id")
        var nodeId: String = "",
        @ColumnInfo(name = "organizations_url")
        @SerializedName("organizations_url")
        var organizationsUrl: String = "") {
    @Ignore
    constructor() : this(0, "", "", "", "", "", "", "", "", "", "", "," +
            "", "", "", false, "", ",", "")
}
{% endhighlight %}

- สร้าง DAO ของ User เพื่อจัดการข้อมูลของ User โดยสร้าง abstract class ภายใต้ package `dao` แล้วก็ทำการ entends `BaseDao<User>` และใส่ Annotation @Dao บน class ด้วย ซึ่งในที่นี้เราทำการเขียน Query ข้อมูล User ทั้งหมด และใส่ @Transaction บนชื่อ Method เพื่อบอกว่าให้รองรับการ Query ข้อมูลแบบ transaction แล้วให้ LiveData<List<User>> รับค่าที่ได้จากการ Query ที่เลือกใช้ LiveData ก็เพราะว่าต้องการ Observe ข้อมูล หากว่ามีข้อมูล User ได้ถูก Insert เข้ามาใหม่ใครก็ตามที่เรียกใช้ Method นี้อยู่ก็จะได้รับข้อมูล User ใหม่ได้แบบ Realtime ขึ้นอยู่กับจุดประสงค์ จะใช้หรือไม่ใช้ก็ได้ โค้ดที่ได้ก็จะประมาณนี้

{% highlight kotlin %}
import android.arch.lifecycle.LiveData
import android.arch.persistence.room.Dao
import android.arch.persistence.room.Query
import android.arch.persistence.room.Transaction
import com.prongbang.archmvvm.vo.User

@Dao
abstract class UserDao : BaseDao<User>() {

    @Transaction
    @Query("SELECT * FROM user")
    abstract fun getUsers(): LiveData<List<User>>

}
{% endhighlight %}

- สร้าง class ที่เก็บการ config ทั้งของ database โดยสร้างภายใต้ package `db` 
<br>

** เมื่อสร้าง Entity แล้วให้เรามา Config ที่ class นี้ด้วย <br>
** เมื่อสร้าง DAO แล้วให้เรามา Config ที่ class นี้ด้วย

{% highlight kotlin %}
import android.arch.persistence.db.SupportSQLiteDatabase
import android.arch.persistence.room.Database
import android.arch.persistence.room.Room
import android.arch.persistence.room.RoomDatabase
import android.arch.persistence.room.TypeConverters
import android.arch.persistence.room.migration.Migration
import android.content.Context
import com.prongbang.archmvvm.dao.UserDao
import com.prongbang.archmvvm.vo.User

@Database(entities = [
    User::class
], version = 1)
abstract class AppDatabase : RoomDatabase() {

    abstract fun userDao(): UserDao

    // Other dao here..

    companion object {

        private val DATABASE_FILENAME = "database-name.db"
        private var INSTANCE: AppDatabase? = null
        private val LOCK = Any()
        private val LOCK_INMEM = Any()

        fun getInMemory(context: Context): AppDatabase {
            if (INSTANCE == null) {
                synchronized(LOCK_INMEM) {
                    INSTANCE = Room.inMemoryDatabaseBuilder(context.applicationContext, AppDatabase::class.java)
                            // To simplify the codelab, allow queries on the main thread.
                            // Don't do this on a real app! See PersistenceBasicSample for an example.
                            .allowMainThreadQueries()
                            .fallbackToDestructiveMigration()
                            .build()
                }
            }
            return INSTANCE!!
        }

        fun getInDatabase(context: Context): AppDatabase {
            if (INSTANCE == null) {
                synchronized(LOCK) {
                    INSTANCE = Room.databaseBuilder(context.applicationContext, AppDatabase::class.java, DATABASE_FILENAME)
                            .addMigrations(object : Migration(2, 3) {
                                override fun migrate(supportSQLiteDatabase: SupportSQLiteDatabase) {

                                }
                            })
                            .allowMainThreadQueries()
                            .fallbackToDestructiveMigration()
                            .build()
                }
            }

            return INSTANCE!!
        }

        fun create(context: Context, useInMemory: Boolean): AppDatabase {

            return if (useInMemory) getInMemory(context) else getInDatabase(context)
        }

        fun destroyInstance() {
            if (INSTANCE != null) INSTANCE!!.close()
            INSTANCE = null
        }
    }

}
{% endhighlight %}

### Config ViewModelFactory เพื่อให้ Dagger inject ค่าให้กับ ViewModel ของเรา 
<br>

โดยเราจะสร้างไฟล์ไว้ภายใต้ package `viewmodel` ตามนี้
<br>

** @Singleton เป็นตัวบอกว่าให้ new Instance นี้แค่ครั้งเดียว <br>
** @Inject เป็นตัวบอกให้ Dagger นำค่าที่ provide ที่ module มาใช้ให้กับ class หรือ method ที่มีการเรียกใช้งาน

{% highlight kotlin %}
@Singleton
class ViewModelFactory @Inject constructor(private val creators: Map<Class<out ViewModel>,
        @JvmSuppressWildcards Provider<ViewModel>>) : ViewModelProvider.Factory {

    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        val creator = creators[modelClass] ?: creators.entries.firstOrNull {
            modelClass.isAssignableFrom(it.key)
        }?.value ?: throw IllegalArgumentException("unknown model class $modelClass")
        try {
            @Suppress("UNCHECKED_CAST")
            return creator.get() as T
        } catch (e: Exception) {
            throw RuntimeException(e)
        }

    }

}
{% endhighlight %}

### Config Dagger
<br>

โดยเราจะสร้างไฟล์ภายใต้ package `di` โดยสร้างไฟล์ประมาณนี้

- สร้าง Annotation `ViewModelKey`

{% highlight kotlin %}
import android.arch.lifecycle.ViewModel
import dagger.MapKey
import kotlin.reflect.KClass

@MustBeDocumented
@Target(
    AnnotationTarget.FUNCTION,
    AnnotationTarget.PROPERTY_GETTER,
    AnnotationTarget.PROPERTY_SETTER
)
@Retention(AnnotationRetention.RUNTIME)
@MapKey
annotation class ViewModelKey(val value: KClass<out ViewModel>)
{% endhighlight %}

- สร้าง Interface `Injectable` สำหรับ Marks ใน fragment เพื่อให้ Dagger รู้ว่า fragment นี้ต้องการใช้งาน dagger นะ

{% highlight kotlin %}
/**
 * Marks an activity / fragment injectable.
 */
interface Injectable
{% endhighlight %}

- สร้าง Module `ViewModelModule` สำหรับจัดกลุ่ม Provide ของ ViewModel
<br>

** นำ ViewModelFactory ที่เราสร้างก่อนหน้านี้มา bind ที่นี่ด้วย<br>
** ถ้ามีการสร้าง ViewModel ขึ้นมาใหม่ให้มาเพิ่มที่นี่ด้วยอย่าลืม โดยเขียนประมาณนี้

{% highlight kotlin %}
import android.arch.lifecycle.ViewModel
import android.arch.lifecycle.ViewModelProvider
import com.prongbang.archmvvm.ui.user.UserViewModel
import com.prongbang.archmvvm.viewmodel.ViewModelFactory
import dagger.Binds
import dagger.Module
import dagger.multibindings.IntoMap

@Suppress("unused")
@Module
abstract class ViewModelModule {

    @Binds
    abstract fun bindAppViewModelFactory(factory: ViewModelFactory): ViewModelProvider.Factory

    @Binds
    @IntoMap
    @ViewModelKey(UserViewModel::class)
    abstract fun bindUserViewModel(userViewModel: UserViewModel): ViewModel

}
{% endhighlight %}

- สร้าง Module `FragmentBuildersModule` สำหรับจัดกลุ่ม Provide ของ Fragment

** ต้องการให้ Fragment สามารถใช้งาน Dagger ได้ ต้องมาเพิ่มที่นี่ด้วย เช่น UserFragment ตามนี้

{% highlight kotlin %}
import com.prongbang.archmvvm.ui.user.UserFragment
import dagger.Module
import dagger.android.ContributesAndroidInjector

@Suppress("unused")
@Module
abstract class FragmentBuildersModule {

    @ContributesAndroidInjector
    abstract fun contributeUserFragment(): UserFragment

}
{% endhighlight %}

- สร้าง Module `MainActivityModule` สำหรับจัดกลุ่ม Provide ของ Activity
<br>

** ถ้าต้องการให้ Activity สามารถใช้งาน Dagger ได้ ต้องมาเพิ่มที่นี่ด้วย เช่น MainActivity ตามนี้

{% highlight kotlin %}
import com.prongbang.archmvvm.ui.main.MainActivity
import dagger.Module
import dagger.android.ContributesAndroidInjector

@Suppress("unused")
@Module
abstract class MainActivityModule {

    @ContributesAndroidInjector(modules = [FragmentBuildersModule::class])
    abstract fun contributeMainActivity(): MainActivity

}
{% endhighlight %}

- สร้าง Module `AppModule` สำหรับจัดกลุ่ม Provide โดยให้ตัว @Provide เป็นตัวบอก Dagger ว่าให้เอา Instance นั้น ๆ ใช้เมื่อมีการใช้งาน @Inject

{% highlight kotlin %}
import android.app.Application
import android.content.Context
import com.prongbang.archmvvm.api.ApiService
import com.prongbang.archmvvm.api.ServiceGenerator
import com.prongbang.archmvvm.dao.AccessTokenDao
import com.prongbang.archmvvm.db.AppDatabase
import com.prongbang.archmvvm.jni.JniHelper
import com.prongbang.archmvvm.prefs.PrefsHelper
import com.prongbang.archmvvm.utils.LiveNetworkMonitor
import com.prongbang.archmvvm.utils.NetworkMonitor
import com.prongbang.archmvvm.vo.AccessToken
import com.prongbang.archmvvm.vo.Config
import dagger.Module
import dagger.Provides
import okhttp3.HttpUrl
import javax.inject.Singleton

@Module(includes = [ViewModelModule::class])
class AppModule {

    @Singleton
    @Provides
    fun provideDb(app: Application): AppDatabase = AppDatabase.create(app, false)

    @Provides
    fun provideApiSerivce(app: Application, networkMonitor: NetworkMonitor, prefsHelper: PrefsHelper, accessTokenDao: AccessTokenDao): ApiService {

        return ServiceGenerator.create(
                app.applicationContext,
                networkMonitor,
                Config(
                        HttpUrl.parse(JniHelper.apiService()) as HttpUrl,
                        prefsHelper.language,
                        accessTokenDao.getLast() ?: AccessToken()
                ),
                ApiService::class.java
        )
    }

    @Singleton
    @Provides
    fun provideContext(app: Application): Context = app.applicationContext

    @Singleton
    @Provides
    fun providePrefsHelper(app: Application): PrefsHelper = PrefsHelper(app)

    @Singleton
    @Provides
    fun provideNetworkMonitor(app: Application): NetworkMonitor = LiveNetworkMonitor(app)

    @Singleton
    @Provides
    fun provideAccessTokenDao(db: AppDatabase): AccessTokenDao = db.accessTokenDao()

}
{% endhighlight %}

- สร้าง Component `AppComponent` เพื่อเป็นตัวกลางไว้ควบคุมการทำ Dependency Injection

{% highlight kotlin %}
import android.app.Application
import com.prongbang.archmvvm.MainApplication
import dagger.BindsInstance
import dagger.Component
import dagger.android.AndroidInjectionModule
import javax.inject.Singleton

@Singleton
@Component(
        modules = [
            AndroidInjectionModule::class,
            AppModule::class,
            MainActivityModule::class
        ]
)
interface AppComponent {

    @Component.Builder
    interface Builder {
        @BindsInstance
        fun application(application: Application): Builder

        fun build(): AppComponent
    }

    fun inject(myApplication: MainApplication)
}
{% endhighlight %}

- สร้าง Injector `AppInjector` สำหรับกำหนดค่าเริ่มต้นให้กับ Dagger 

{% highlight kotlin %}
import android.app.Activity
import android.app.Application
import android.os.Bundle
import android.support.v4.app.Fragment
import android.support.v4.app.FragmentActivity
import android.support.v4.app.FragmentManager
import com.prongbang.archmvvm.MainApplication
import dagger.android.AndroidInjection
import dagger.android.support.AndroidSupportInjection
import dagger.android.support.HasSupportFragmentInjector

/**
 * Helper class to automatically inject fragments if they implement [Injectable].
 */
object AppInjector {

    fun init(myApplication: MainApplication) {

        DaggerAppComponent.builder().application(myApplication).build().inject(myApplication)

        myApplication.registerActivityLifecycleCallbacks(object : Application.ActivityLifecycleCallbacks {

            override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {
                handleActivity(activity)
            }

            override fun onActivityStarted(activity: Activity) {

            }

            override fun onActivityResumed(activity: Activity) {

            }

            override fun onActivityPaused(activity: Activity) {

            }

            override fun onActivityStopped(activity: Activity) {

            }

            override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle?) {

            }

            override fun onActivityDestroyed(activity: Activity) {

            }
        })
    }

    private fun handleActivity(activity: Activity) {
        if (activity is HasSupportFragmentInjector) {
            AndroidInjection.inject(activity)
        }
        if (activity is FragmentActivity) {
            activity.supportFragmentManager
                    .registerFragmentLifecycleCallbacks(
                            object : FragmentManager.FragmentLifecycleCallbacks() {
                                override fun onFragmentCreated(
                                        fm: FragmentManager,
                                        f: Fragment,
                                        savedInstanceState: Bundle?
                                ) {
                                    if (f is Injectable) {
                                        AndroidSupportInjection.inject(f)
                                    }
                                }
                            }, true
                    )
        }
    }
}
{% endhighlight %}

- สร้าง class `MainApplication` เพื่อ config ให้แอพเรารู้จักกับ Dagger โดยเรียกใช้งานประมาณนี้

{% highlight kotlin %}
import android.app.Activity
import android.app.Application
import com.prongbang.arch_mvvm.BuildConfig
import com.prongbang.archmvvm.di.AppInjector
import dagger.android.DispatchingAndroidInjector
import dagger.android.HasActivityInjector
import timber.log.Timber
import javax.inject.Inject

class MainApplication : Application(), HasActivityInjector {

    @Inject
    lateinit var dispatchingAndroidInjector: DispatchingAndroidInjector<Activity>

    override fun onCreate() {
        super.onCreate()
        if (BuildConfig.DEBUG) {
            Timber.plant(Timber.DebugTree())
        }
        AppInjector.init(this)
    }

    override fun activityInjector() = dispatchingAndroidInjector
}
{% endhighlight %}

- เรียกใช้ `MainApplication` ใน `AndroidManifest.xml`

{% highlight kotlin %}
<application
        android:name="com.prongbang.archmvvm.MainApplication">
    ...
</application>
{% endhighlight %}

### Config ให้ Fragment สามารถใช้งาน Dagger ได้
<br>

เพื่อเป็นการลดการเขียนโค้ดที่ซ้ำ ๆ กัน ก็เลยสร้าง BaseFragment ขึ้นมาเพื่อ Config ให้ Fragment สามารถใช้งาน Dagger ได้ ก็จะได้โค้ดประมาณนี้

{% highlight kotlin %}
import android.arch.lifecycle.ViewModelProvider
import android.support.v4.app.Fragment
import com.prongbang.archmvvm.di.Injectable
import javax.inject.Inject

open class BaseFragment : Fragment(), Injectable {

    @Inject
    lateinit var viewModelFactory: ViewModelProvider.Factory

}
{% endhighlight %}

และถ้าหากเราต้องการให้ Fragment ของเราสามารถใช้งาน Dagger ได้ให้เรา extends BaseFragment ตามนี้

{% highlight kotlin %}
import android.arch.lifecycle.Observer
import android.arch.lifecycle.ViewModelProviders
import android.databinding.DataBindingUtil
import android.os.Bundle
import android.support.v4.app.Fragment
import android.support.v7.widget.LinearLayoutManager
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import com.prongbang.arch_mvvm.R
import com.prongbang.arch_mvvm.databinding.FragmentUserBinding
import com.prongbang.archmvvm.binding.FragmentDataBindingComponent
import com.prongbang.archmvvm.ui.base.BaseFragment
import com.prongbang.archmvvm.utils.Status
import kotlinx.android.synthetic.main.fragment_user.*

class UserFragment : BaseFragment() {

    private lateinit var userViewModel: UserViewModel

    companion object {
        fun newInstance(): UserFragment {
            return UserFragment()
        }
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        // Inflate the layout for this fragment
        val mBinding = DataBindingUtil.inflate<FragmentUserBinding>(inflater, R.layout.fragment_user, container, false)

        userViewModel = ViewModelProviders.of(this, viewModelFactory).get(UserViewModel::class.java)

        // ...

        return mBinding.root
    }
}
{% endhighlight %}

### Config ให้ Activity สามารถใช้งาน Dagger ได้
<br>

เพื่อเป็นการลดการเขียนโค้ดที่ซ้ำ ๆ กัน ก็เลยสร้าง BaseAppCompatActivity ขึ้นมาเพื่อ Config ให้ Activity สามารถใช้งาน Dagger ได้ ก็จะได้โค้ดประมาณนี้

{% highlight kotlin %}
import android.annotation.SuppressLint
import android.support.v4.app.Fragment
import android.support.v7.app.AppCompatActivity
import dagger.android.AndroidInjector
import dagger.android.DispatchingAndroidInjector
import dagger.android.support.HasSupportFragmentInjector
import javax.inject.Inject

@SuppressLint("Registered")
open class BaseAppCompatActivity : AppCompatActivity(), HasSupportFragmentInjector {

    @Inject
    lateinit var dispatchingAndroidInjector: DispatchingAndroidInjector<Fragment>

    override fun supportFragmentInjector(): AndroidInjector<Fragment> {
        return dispatchingAndroidInjector
    }
}
{% endhighlight %}

และถ้าหากเราต้องการให้ Activity ของเราสามารถใช้งาน Dagger ได้ให้เรา extends BaseAppCompatActivity ตามนี้

{% highlight kotlin %}
import android.os.Bundle
import com.prongbang.arch_mvvm.R
import com.prongbang.archmvvm.ui.base.BaseAppCompatActivity
import com.prongbang.archmvvm.ui.user.UserFragment
import com.prongbang.archmvvm.utils.replace

class MainActivity : BaseAppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        if (savedInstanceState == null) {
            supportFragmentManager.replace(R.id.container, UserFragment.newInstance())
        }
    }
}
{% endhighlight %}

### สร้าง Repository `UserRepository` 
<br>

เราจะเขียน Business logic ที่จัดการกับ Call API และทำการ insert ข้อมูล user ลง database ไว้ที่นี่

{% highlight kotlin %}
class UserRepository @Inject constructor(private val appExecutors: AppExecutors,
                                         private val appDatabase: AppDatabase,
                                         private val apiService: ApiService) {

    fun getUsers(): LiveData<Resource<List<User>>> {
        val data = MutableLiveData<Resource<List<User>>>()

        data.postValue(Resource.loading(null))

        NetworkBoundResource(appExecutors, object : NetworkBoundResource.Callback<List<User>, List<User>>() {

            override fun onUnauthorized() {
                data.postValue(Resource.unauthorized("", null))
            }

            override fun onCreateCall(): Call<List<User>> = apiService.getUser()

            override fun onResponse(code: Int, message: String, item: List<User>?) {
                when (code) {
                    in 200..201 -> {
                        if (item != null) {
                            appExecutors.diskIO().execute {
                                // create or update
                                for (u in item) {
                                    appDatabase.userDao().insert(u)
                                }
                                data.postValue(Resource.success(item))
                            }
                        } else {
                            data.postValue(Resource.error(message, null))
                        }
                    }
                    else -> {
                        data.postValue(Resource.error(message, null))
                    }
                }
            }

            override fun onError(t: Throwable) {
                Timber.e("onError: ${t.message}")
                data.postValue(Resource.error(t.message!!, null))
            }

            override fun onWarning(t: Throwable) {
                Timber.e("onWarning: ${t.message}")
                data.postValue(Resource.warning(t.message!!, null))
            }

            override fun onNetworkUnavailable(t: NoNetworkException) {
                Timber.e("onNetworkUnavailable: ${t.message}")
                data.postValue(Resource.network(t.message!!, null))
            }

            override fun enableLoadFromDb(): Boolean = NetworkBoundResource.LOAD_FROM_DB_ENABLE

            override fun onLoadFromDb(): LiveData<List<User>> = appDatabase.userDao().getUsers()

            override fun onDatabaseResponse(item: List<User>?) {
                item?.apply {
                    data.postValue(Resource.success(item))
                }
            }

        })

        return data
    }
}
{% endhighlight %}

### สร้าง ViewModel `UserViewModel`
<br>

เราจะเขียน Business logic ที่จัดการกับ UI ของเราไว้ที่นี่

{% highlight kotlin %}
import android.arch.lifecycle.LiveData
import android.arch.lifecycle.ViewModel
import com.prongbang.archmvvm.repository.UserRepository
import com.prongbang.archmvvm.utils.Resource
import com.prongbang.archmvvm.vo.User
import javax.inject.Inject

class UserViewModel @Inject constructor(private val userRepository: UserRepository) : ViewModel() {

    private var userData: LiveData<Resource<List<User>>>?=null

    fun getUsers(): LiveData<Resource<List<User>>> {
        if (userData == null) {
            userData = userRepository.getUsers()
        }
        return userData!!
    }

    override fun onCleared() {
        super.onCleared()
        userData = null
    }
}
{% endhighlight %}

### เรียกใช้งาน UserViewModel ใน Activity หรือ Fragment ก็จะเหมือน ๆ กัน ซึ่ง Activity และ Fragment เป็นส่วนที่เรียกว่า View จะไม่รู้ Logic อะไรเลยแค่สั่งให้ ViewModel ทำงานให้ ประมาณนี้

{% highlight kotlin %}
class UserFragment : BaseFragment() {

    private lateinit var userViewModel: UserViewModel

    companion object {
        fun newInstance(): UserFragment {
            return UserFragment()
        }
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        // Inflate the layout for this fragment
        val mBinding = DataBindingUtil.inflate<FragmentUserBinding>(inflater, R.layout.fragment_user, container, false)

        userViewModel = ViewModelProviders.of(this, viewModelFactory).get(UserViewModel::class.java)

        val adapter = UserAdapter(FragmentDataBindingComponent(this))
        mBinding.rvUser.apply {
            layoutManager = LinearLayoutManager(context)
            isNestedScrollingEnabled = false
            setAdapter(adapter)
        }

        userViewModel.getUsers().observe(this, Observer {
            when (it?.status) {
                Status.LOADING -> {
                    pbLoading.show()
                }
                Status.SUCCESS -> {
                    pbLoading.hide()
                    adapter.submitList(it.data)
                }
                Status.WARNING -> {
                    pbLoading.hide()
                    Toast.makeText(context, "Warning: ${it.message}", Toast.LENGTH_SHORT).show()
                }
                Status.UNAUTHORIZED -> {
                    pbLoading.hide()
                    Toast.makeText(context, "Unauthorized: ${it.message}", Toast.LENGTH_SHORT).show()
                }
                Status.ERROR -> {
                    pbLoading.hide()
                    Toast.makeText(context, "Error: ${it.message}", Toast.LENGTH_SHORT).show()
                }
                Status.NETWORK -> {
                    pbLoading.hide()
                    Toast.makeText(context, "Network: ${it.message}", Toast.LENGTH_SHORT).show()
                }
                else -> {
                    pbLoading.hide()
                    Toast.makeText(context, "Other: ${it?.message}", Toast.LENGTH_SHORT).show()
                }
            }
        })

        return mBinding.root
    }

}
{% endhighlight %}

การเขียนแบบ MVVM ในแบบเร่งรัดก็จะประมาณนี้ ส่วนที่เหลือต้องลองทำเองดู และยังมีส่วนที่ไม่ได้ยกมาเขียนอีกเยอะเลยลองเข้าไปอ่านได้ที่นี่ [คลิกตรง ๆ](https://developer.android.com/jetpack)

<br><br>
