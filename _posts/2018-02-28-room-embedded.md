---
layout: post
title:  "[Android] ว่าด้วยเรื่องการใช้งาน Embedded และการ Convert type บน Room database"
short_description: "เราจะมาลอง Insert Object ที่มี Object และ ArrayList ซ้อนกันอยู่ใน Class นั้น ๆ โดยที่ไม่ต้องทำ Relations โดยการ Embedded และการ Convert type กัน"
date:   2018-02-28 20:11:37 +0700
categories: android
tags: [android]
cover_image: /assets/images/room-embedded.png
author: "end try"
---
#### เริ่มจากความต้องการที่จะเอาก้อน Object มายัดลง room database โดยที่ไม่ต้องมาทำ relation เหมือนกับที่ realm ทำได้
จากที่ลอง research อยู่สักพักก็ดันไปเจอเจ้าตัว [Embedded](https://developer.android.com/reference/android/arch/persistence/room/Embedded.html) เข้าให้ แต่ทว่ามันดัน Embedded ได้แค่ Class ที่ไม่ใช้ List น่ะสิ แต่ดันไปเจอแสงสว่างปลายยอดหญ้า คือเจ้า [TypeConverter](https://developer.android.com/reference/android/arch/persistence/room/TypeConverter.html) เข้าอย่างจังซึ่งมันจะมาช่วยในการ Convert Type ให้มันสามารถ insert object ที่เป็น List ลง database ได้นั่นเอง

#### เราจะใช้งานมันยังไง ถ้าเราต้องการเอาข้อมูลแบบนี้ลง database
{% highlight json %}
{
  "id": 1,
  "title": "Hello room embedded",
  "content": {
    "details": "Hello room embedded details...",
    "cover": "http://127.0.0.1/api/v1/image/cover.jpg",
    "images": [
      {
        "id": 1,
        "url": "http://127.0.0.1/api/v1/image/image-1.jpg",
        "description": "Description 1"
      },
      {
        "id": 3,
        "url": "http://127.0.0.1/api/v1/image/image-2.jpg",
        "description": "Description 2"
      },
      {
        "id": 4,
        "url": "http://127.0.0.1/api/v1/image/image-3.jpg",
        "description": "Description 3"
      },
      {
        "id": 5,
        "url": "http://127.0.0.1/api/v1/image/image-4.jpg",
        "description": "Description 4"
      },
      {
        "id": 6,
        "url": "http://127.0.0.1/api/v1/image/image-5.jpg",
        "description": "Description 5"
      }
    ]
  },
  "telephone": [
    {
      "icon": "http://127.0.0.1/api/v1/image/call-1.png",
      "number": "087-234-6754"
    },
    {
      "icon": "http://127.0.0.1/api/v1/image/call-3.png",
      "number": "083-234-6759"
    },
    {
      "icon": "http://127.0.0.1/api/v1/image/call-3.png",
      "number": "085-234-6757"
    }
  ]
}
{% endhighlight %}

##### เริ่มจากการสร้าง Class โดยใช้ plugin ตัวนี้ [Generate Kotlin data classes from JSON](https://plugins.jetbrains.com/plugin/10054-generate-kotlin-data-classes-from-json) เข้าช่วยเพื่อความรวดเร็ว
เมื่อ Generate class เสร็จเรียบร้อยแล้ว เราจะได้ class มาทั้งหมด 4 class ตามนี้ แต่ว่าเราจะต้องเปลี่ยน val เป็น var เพื่อให้ object นั้น ๆ เก็บค่า null ได้
- Content.kt
{% highlight kotlin %}
data class Content(
        @SerializedName("cover")
        var cover: String = "",

        @SerializedName("images")
        var images: ArrayList<Image>?,

        @SerializedName("details")
        var details: String = ""
)
{% endhighlight %}
- Image.kt
{% highlight kotlin %}
data class Image(
        @SerializedName("description")
        var description: String = "description",

        @SerializedName("id")
        var id: Int = 0,

        @SerializedName("url")
        var url: String = ""
)
{% endhighlight %}
- Telephone.kt
{% highlight kotlin %}
data class Telephone(
        @SerializedName("number")
        var number: String,
        @SerializedName("icon")
        var icon: String
)
{% endhighlight %}
- Post.kt
{% highlight kotlin %}
@Entity(tableName = "post")
data class Post(
        @PrimaryKey(autoGenerate = true)
        @ColumnInfo(name = "id")
        var id: Int,

        @SerializedName("title")
        @ColumnInfo(name = "title")
        var title: String = "",

        @SerializedName("content")
        @Embedded(prefix = "content_")
        var content: Content,

        @SerializedName("telephone")
        @ColumnInfo(name = "telephone")
        var telephone: ArrayList<Telephone>?
)
{% endhighlight %}

###### อธิบาย ColumnInfo และ SerializedName
- @ColumnInfo(name = "attribute_name") คือการกำหนดชื่อ attribute ใน table
- @SerializedName("name") เป็นตัวกำหนดชื่อให้แต่ละ attribute กรณีที่เราใช้ proguard แล้วทำให้ชื่อ attribute เปลี่ยนไป แต่ยังสามารถ map ข้อมูล json เข้ามาที่ object ได้

###### อธิบายเพิ่มเติมเฉพาะ class Post 

- ใส่ annotation @Entity(tableName = "post") ไว้ข้างบน class โดยตั้งชื่อ table ว่า "post" เพื่อให้ตัว room รู้จักแล้วนำไปสร้างเป็น table นั่นเอง
- ใส่ @PrimaryKey(autoGenerate = true) เพื่อกำหนดว่าให้ attribute ชื่อ id เป็น Primary Key และให้ generate ค่าขึ้นมาเอง
- ใส่ @Embedded(prefix = "content_") เพื่อบอกว่าเราจะฝัง object นี้เข้าไปใน table ด้วย โดยกำหนด prefix เป็น content_ โดยจะนำไปต่อกับ attribute ภายใน class เช่น content_cover, content_images, content_details
- ส่วน attribute ชื่อ telephone ที่เป็น ArrayList เราจะใช้วิธีการ Convert Type ด้วย @TypeConverter

###### ถ้าใน class ไหนมี attribute แบบ ArrayList เราต้องเขียน class เพื่อ Convert Type ด้วย

###### ต่อไปจะเป็นการเขียน Type Converter เพื่อแปลง class ArrayList<Telephone> ขึ้นมาเอง

###### สร้าง BaseListConverter.kt
{% highlight kotlin %}
abstract class BaseListConverter<T> {

    @TypeConverter
    abstract fun fromString(value: String): ArrayList<T>

    @TypeConverter
    fun fromArrayList(value: ArrayList<T>): String {
        val json = GsonBuilder().create().toJson(value)
        return json ?: ""
    }
}
{% endhighlight %}

###### สร้าง TelephoneListConverter.kt
{% highlight kotlin %}
class TelephoneListConverter: BaseListConverter<Telephone>() {

    @TypeConverter
    override fun fromString(value: String): ArrayList<Telephone> {
        val typeToken = object : TypeToken<ArrayList<Telephone>>() {}
        val type = typeToken.type as ParameterizedType
        val list = GsonBuilder().create().fromJson<ArrayList<Telephone>>(value, type)
        return list ?: ArrayList()
    }
}
{% endhighlight %}

###### ต่อไปจะเป็นการเขียน Type Converter เพื่อแปลง class ArrayList<Image> ขึ้นมาเอง

###### สร้าง ImageListConverter.kt
{% highlight kotlin %}
class ImageListConverter : BaseListConverter<Image>() {

    @TypeConverter
    override fun fromString(value: String): ArrayList<Image> {
        val typeToken = object : TypeToken<ArrayList<Image>>() {}
        val type = typeToken.type as ParameterizedType
        val list = GsonBuilder().create().fromJson<ArrayList<Image>>(value, type)
        return list ?: ArrayList()
    }

}
{% endhighlight %}

#### ต่อไปเป็นการสร้าง class AppDatabase
{% highlight kotlin %}
@Database(entities = [Post::class], version = 1)
@TypeConverters(value = [ImageListConverter::class, TelephoneListConverter::class])
abstract class AppDatabase : RoomDatabase() {

    abstract fun postDao(): PostDao

    companion object {

        private var INSTANCE: AppDatabase? = null
        private val LOCK_INMEM = Any()

        fun getInMemoryDatabase(context: Context): AppDatabase {
            if (INSTANCE == null) {
                synchronized(LOCK_INMEM) {
                    INSTANCE = Room.inMemoryDatabaseBuilder(context.applicationContext, AppDatabase::class.java)
                            .fallbackToDestructiveMigration()
                            .build()
                }
            }
            return INSTANCE!!
        }
    }
}
{% endhighlight %}

##### ใส่ Entity
{% highlight kotlin %}
@Database(entities = [Post::class], version = 1)
{% endhighlight %}

##### ใส่ code การเรียกใช้งาน TypeConverter บนชื่อ class AppDatabase
{% highlight kotlin %}
@TypeConverters(value = [ImageListConverter::class, TelephoneListConverter::class])
{% endhighlight %}

##### ขอข้ามการสร้าง Repository, ViewModel ไปเลยนะ เราจะมาดู Schemas ที่ได้จากการ Run App กันเลย
{% highlight json %}
{
  "formatVersion": 1,
  "database": {
    "version": 1,
    "identityHash": "1362ecd37803d1b53b44ef59f125bfd8",
    "entities": [
      {
        "tableName": "post",
        "createSql": "CREATE TABLE IF NOT EXISTS `${TABLE_NAME}` (`id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, `title` TEXT NOT NULL, `telephone` TEXT, `content_cover` TEXT NOT NULL, `content_images` TEXT, `content_details` TEXT NOT NULL)",
        "fields": [
          {
            "fieldPath": "id",
            "columnName": "id",
            "affinity": "INTEGER",
            "notNull": true
          },
          {
            "fieldPath": "title",
            "columnName": "title",
            "affinity": "TEXT",
            "notNull": true
          },
          {
            "fieldPath": "telephone",
            "columnName": "telephone",
            "affinity": "TEXT",
            "notNull": false
          },
          {
            "fieldPath": "content.cover",
            "columnName": "content_cover",
            "affinity": "TEXT",
            "notNull": true
          },
          {
            "fieldPath": "content.images",
            "columnName": "content_images",
            "affinity": "TEXT",
            "notNull": false
          },
          {
            "fieldPath": "content.details",
            "columnName": "content_details",
            "affinity": "TEXT",
            "notNull": true
          }
        ],
        "primaryKey": {
          "columnNames": [
            "id"
          ],
          "autoGenerate": true
        },
        "indices": [],
        "foreignKeys": []
      }
    ],
    "setupQueries": [
      "CREATE TABLE IF NOT EXISTS room_master_table (id INTEGER PRIMARY KEY,identity_hash TEXT)",
      "INSERT OR REPLACE INTO room_master_table (id,identity_hash) VALUES(42, \"1362ecd37803d1b53b44ef59f125bfd8\")"
    ]
  }
}
{% endhighlight %}

##### เราจะเห็นว่า columns telephone มี Type เป็น TEXT และการที่เราเขียน TypeConverter เองนั้น ก็เพราะเพื่อแปลงค่า Object ให้เป็น Text แล้วแปลงจาก Text เป็น Object นั่นเอง
สามารถดูตัวอย่างแอพแบบเต็ม ๆ ได้ที่ [GitHub](https://raboninco.com/XBGX) เลยครับ
