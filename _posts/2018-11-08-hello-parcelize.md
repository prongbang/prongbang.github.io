---
layout: post
title:  "[Android] ลด Boilerplate ของ Parcelable ให้กระทัดรัดด้วย @Parcelize ใน Kotlin"
short_description: "ช่วยทำให้ชีวิตขาวเดฟ Android ง่ายขึ้นเยอะ มาดูว่าต้อง config อะไรบ้างเพื่อใช้งาน"
date:   2018-11-18 15:53:00 +0700
categories: android
tags: [android]
cover_image: /assets/images/android/13.png
author: "end try"
---

### สำหรับใครไม่รู้ว่าตัว @Parcelize เข้ามาช่วยลด Boilerplate โค้ดยังไงให้มาดูตัวอย่างนี้

- แบบที่ไม่ได้ใช้ @Parcelize

{% highlight kotlin %}
import android.os.Parcel
import android.os.Parcelable

data class Todo(
        var completed: Boolean?,
        var id: Int?,
        var title: String?,
        var userId: Int?
) : Parcelable {
    constructor(source: Parcel) : this(
            source.readValue(Boolean::class.java.classLoader) as Boolean?,
            source.readValue(Int::class.java.classLoader) as Int?,
            source.readString(),
            source.readValue(Int::class.java.classLoader) as Int?
    )

    override fun describeContents() = 0

    override fun writeToParcel(dest: Parcel, flags: Int) = with(dest) {
        writeValue(completed)
        writeValue(id)
        writeString(title)
        writeValue(userId)
    }

    companion object {
        @JvmField
        val CREATOR: Parcelable.Creator<Todo> = object : Parcelable.Creator<Todo> {
            override fun createFromParcel(source: Parcel): Todo = Todo(source)
            override fun newArray(size: Int): Array<Todo?> = arrayOfNulls(size)
        }
    }
}
{% endhighlight %}

- แบบที่ใช้ @Parcelize

{% highlight kotlin %}
import android.os.Parcelable
import kotlinx.android.parcel.Parcelize

@Parcelize
data class Todo(
        var completed: Boolean?,
        var id: Int?,
        var title: String?,
        var userId: Int?
) : Parcelable
{% endhighlight %}

เพียงเท่านี้ก็น่าจะทำให้รู้แล้วว่าตัว @Parcelize ทำให้ชีวิตง่ายขึ้นเยอะ ช่วยลดโค้ดไปเยอะเลย
