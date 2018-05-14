---
layout: post
title:  "[Android] ทำอย่างไรให้ RealmList ส่งค่าผ่าน Parcelable แล้วค่าไม่หาย"
short_description: "มาดูกันว่าต้องทำยังไง เชื่อว่าหลาย ๆ คนที่ใช้ Realm อาจเคยเจอเคสแบบนี้ ซึ่งมันทำให้ปวดหัวเอาซะจริง ๆ"
date:   2018-05-14 23:20:12 +0700
categories: android
tags: [android]
cover_image: /assets/images/android/3.png
author: "end try"
---

### 1. เริ่มจากเพื่มโค้ดด้านล่างนี้ใน `Person(Parcel in)` Constructer

{% highlight java %}
this.mRealmList = new RealmList<>();
this.mRealmList.addAll(in.createTypedArrayList(Child.CREATOR)); 
{% endhighlight %}

<br>
### 2. เพิ่มโค้ดด้านล่างนี้ใน Method `writeToParcel`

{% highlight java %}
dest.writeTypedList(this.mRealmList);
{% endhighlight %}

<br>
### มาดูกันว่าโค้ดที่ได้จะหน้าตาเป็นยังไง
- Person.java

{% highlight java %}
import android.os.Parcel;
import android.os.Parcelable;

import io.realm.RealmList;
import io.realm.RealmObject;
import io.realm.annotations.PrimaryKey;

/**   
 * Created by prongbang on 8/2/2017 AD.   
 */
public class Person extends RealmObject implements Parcelable {

    @PrimaryKey
    private long id;

    private RealmList<Child> mRealmList;

    public Person() { }

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeLong(this.id);
        dest.writeTypedList(this.mRealmList); // <-- add here
    }

    protected Person(Parcel in) {
        this.id = in.readLong();
        this.mRealmList = new RealmList<>();  // <-- add here
        this.mRealmList.addAll(in.createTypedArrayList(Child.CREATOR)); // <-- add here
    }

    public static final Parcelable.Creator<Person> CREATOR = new Parcelable.Creator<Person>() {
        @Override
        public Person createFromParcel(Parcel source) {
            return new Person(source);
        }

        @Override
        public Person[] newArray(int size) {
            return new Person[size];
        }
    };
}
{% endhighlight %}

- Child.java

{% highlight java %}
import android.os.Parcel;
import android.os.Parcelable;

import io.realm.RealmObject;
import io.realm.annotations.PrimaryKey;

/**
 * Created by prongbang on 8/2/2017 AD.
 */

public class Child extends RealmObject implements Parcelable {

    @PrimaryKey
    private int id;
    private String name;

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeInt(this.id);
        dest.writeString(this.name);
    }

    public Child() {
    }

    protected Child(Parcel in) {
        this.id = in.readInt();
        this.name = in.readString();
    }

    public static final Parcelable.Creator<Child> CREATOR = new Parcelable.Creator<Child>() {
        @Override
        public Child createFromParcel(Parcel source) {
            return new Child(source);
        }

        @Override
        public Child[] newArray(int size) {
            return new Child[size];
        }
    };
}
{% endhighlight %}

 เพียงเท่านี้การส่งค่าผ่าน Parcelable ข้านไปอีก Activity หนึ่ง หรือข้ามไปที่ Fragment หนึ่ง ก็จะไม่หายไปแล้ว

