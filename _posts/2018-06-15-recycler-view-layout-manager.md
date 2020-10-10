---
layout: post
title:  "[Android] วิธีใช้ Layout Manager ใน Recycler View"
short_description: "เนื่องจากมีความต้องการที่จะจัดการกับ Item ให้มันเป็น Column ก็เลยมาเขียนตัวอย่างให้ดูแบบจะ ๆ เลยว่าสามารถทำได้กี่แบบ"
date:   2018-06-15 20:30:01 +0700
categories: android
tags: [android]
cover_image: /assets/images/android/9.png
author: "end try"
---

### ก่อนจะเริ่มทำเราควรมารู้จักกับ Layout Manager ใน Recycler View กันก่อน ซึ่งสามารถเข้าไปอ่านได้[ที่นี่เลย](http://www.akexorcist.com/2015/10/the-introduction-layout-manager-in-recycler-view.html)ซึ่งพี่เค้าเขียนไว้ดีมาก ๆ (ไอดอล)
<br>
<br>

โดยในบทความนี้จะมาสอนการใช้งาน 3 Layout แบบคร่าว ๆ เริ่มกันที่

<br>
### Linear Layout Manager

<img src="/assets/images/android/9-1.png">

<br>
- สร้าง `layout` แล้วเรียกใช้ `RecyclerView` ตามนี้ โดยเราจะให้เจ้าตัว `RecyclerView` เป็นคนแสดงข้อมูลแบบ List ให้กับเรา

{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<android.support.constraint.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    tools:context=".ui.linear.LinearLayoutFragment">

    <android.support.v7.widget.RecyclerView
        android:id="@+id/rvLinear"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent"
        tools:listitem="@layout/item_grid_layout" />

</android.support.constraint.ConstraintLayout>
{% endhighlight %}

- สร้าง `item_lnear_layout.xml` โดยเราจะมองส่วนนี้คือ Item หรือส่วนที่เราเรียกว่า Custom List View ที่ใช้แสดงข้อมูลของแต่ละรายการ โดยในตัวอย่างนี้เราจะใช้ `CardView` ก็เพราะว่ามันสามารถกำหนดค่าต่าง ๆ ได้ง่าย เช่น ใส่เงา ทำขอบมน เป็นต้น และถ้าเราใช้ `ConstraintLayout` เป็น `Root View` เราจะสามารถกำหนด `Ratio` ได้ ซึ่งมันจะไปจัดการกับ Item ของเราให้เหมาะสมกับขนาดหน้าจอให้เลยโดยที่เราไม่ต้องมาเขียนโค้ดเช็คอะไรให้ยุ่งยาก

{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<android.support.constraint.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="wrap_content">

    <android.support.v7.widget.CardView
        android:id="@+id/cvItem"
        android:layout_margin="3dp"
        android:layout_width="0dp"
        android:layout_height="0dp"
        android:layout_gravity="center"
        app:layout_constraintDimensionRatio="H,16:9"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintHorizontal_bias="0.0"
        app:layout_constraintLeft_toLeftOf="parent"
        app:layout_constraintRight_toRightOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:cardCornerRadius="4dp"
        app:cardMaxElevation="1dp"
        app:contentPadding="0dp"
        app:cardPreventCornerOverlap="true"
        app:cardUseCompatPadding="true"
        app:cardElevation="1dp">

        <android.support.v7.widget.AppCompatImageView
            android:id="@+id/ivImage"
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:scaleType="centerCrop"/>
    </android.support.v7.widget.CardView>

</android.support.constraint.ConstraintLayout>
{% endhighlight %}

- สร้าง `Item.kt` เป็น `data class` เพื่อใช้เก็บข้อมูลในรูปแบบของ `class` โดยเราจะเก็บข้อมูลประมาณนี้
{% highlight kotlin %}
package com.prongbang.recyclerviewlayoutmanager.model

import android.support.annotation.DrawableRes

data class Item(
        var id: Int,
        @DrawableRes
        var image: Int,
        var message: String
)
{% endhighlight %}

- สร้าง `LinearLayoutViewHolder.kt` เพื่อมาช่วยจัดการกับ View ใน `Adapter` ซื่งก็คือตัว `item_lnear_layout.xml` ที่เราสร้างก่อนหน้านี่เอง หน้าตาของมันจะประมาณนี้ ซึ่งมาการส่งค่าผ่าน `constructor` 3 ตัว คือ Context เพื่อใช้ในการดึงค่าจาก drawable มาใช้, View เพื่อนำมาใช้ในการ `bind` กับ `view`, OnItemClickListener<Item> เพื่อ Callback ค่ากลับไปให้ตัวที่เรียกใช้งานตอนที่เราแตะที่ Item

{% highlight kotlin %}
package com.prongbang.recyclerviewlayoutmanager.ui.linear

import android.content.Context
import android.support.v4.content.ContextCompat
import android.support.v7.widget.RecyclerView
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.prongbang.recyclerviewlayoutmanager.R
import com.prongbang.recyclerviewlayoutmanager.model.Item
import com.prongbang.recyclerviewlayoutmanager.utils.OnItemClickListener
import kotlinx.android.synthetic.main.item_linear_layout.view.*

class LinearLayoutViewHolder(private val context: Context,
                             private val view: View,
                             private val  onItemClickListener: OnItemClickListener<Item>?): RecyclerView.ViewHolder(view) {

    fun bind(item: Item) {

        view.ivImage.setImageDrawable(ContextCompat.getDrawable(context, item.image))

        view.setOnClickListener {
            onItemClickListener?.onClick(it, item)
        }

    }

    companion object {

        fun create(parent: ViewGroup, onItemClickListener: OnItemClickListener<Item>?): LinearLayoutViewHolder {

            val view = LayoutInflater.from(parent.context).inflate(R.layout.item_linear_layout, parent, false)

            return LinearLayoutViewHolder(parent.context, view, onItemClickListener)
        }

    }
}
{% endhighlight %}

<br>
"เราจะเห็นว่าทำไมไม่เห็นใช้ findViewById เลยละ ซึ่งที่มันไม่มีก็เพราะว่าเราใช้ความสามารถของ kotlin android extension ในการ bind นั่นเอง ซึ่งมันสามารถเรียกใช้ผ่าน `id` ของ `Widget` นั่น ๆ ได้เลย"
<br>
<br>

ที่มันสามารถ bind ได้ก็เพราะบรรทัดนี้เลย และสังเกตุเห็นว่ามันเรียกใช้ `item_linear_layout` ซึ่งก็คือ `layout` ของเรานั่นเอง **ถ้าเราไปเรียกใช้ `layout` อื่นอาจจะทำให้แอพตายได้นะ มันจะเกิดขึ้นตอนที่เราไป copy โค้ดจากไฟล์อื่น ยังไงก็ระวังด้วย ๆ

{% highlight kotlin %}
import kotlinx.android.synthetic.main.item_linear_layout.view.*
{% endhighlight %}

- สร้าง `LinearLayoutAdapter.kt` เป็นเหมือนตัวรวม Data เข้ากับ View ที่เรากำหนดไว้ หรือพูดง่าย ๆ คือเปรียบเสมือนกับการใช้ For loop เอา Data ใส่เข้าไปใน Table นั่นเอง โดยในตัวอย่างนี้เราจะไปสืบทอด class `ListAdapter` เพื่อให้มันจัดการกับข้อมูลของเรา กรณีที่เราส่งข้อมูลใหม่เข้าไป มันจะไปเช็คว่าเป็นตัวที่มีอยู่แล้ว หรือว่ายังไม่มี ซึ่งเราจะต้องกำหนดให้มันรู้โดยใช้ `DIFF_COMPARATOR` นั่นเอง โดยใช้ `id` เป็น `key` ในการเช็คตามโค้ดข้างล่างนี้

{% highlight kotlin %}
package com.prongbang.recyclerviewlayoutmanager.ui.linear

import android.support.v7.recyclerview.extensions.ListAdapter
import android.support.v7.util.DiffUtil
import android.view.ViewGroup
import com.prongbang.recyclerviewlayoutmanager.model.Item
import com.prongbang.recyclerviewlayoutmanager.utils.OnItemClickListener

class LinearLayoutAdapter : ListAdapter<Item, LinearLayoutViewHolder>(DIFF_COMPARATOR) {

    private var onItemClickListener: OnItemClickListener<Item>? = null

    override fun onCreateViewHolder(p0: ViewGroup, p1: Int): LinearLayoutViewHolder {
        return LinearLayoutViewHolder.create(p0, onItemClickListener)
    }

    override fun onBindViewHolder(p0: LinearLayoutViewHolder, p1: Int) {
        p0.bind(getItem(p1))
    }

    fun setOnItemClickListener(onItemClickListener: OnItemClickListener<Item>) {
        this.onItemClickListener = onItemClickListener
    }

    companion object {

        private val DIFF_COMPARATOR = object : DiffUtil.ItemCallback<Item>(){
            override fun areItemsTheSame(p0: Item, p1: Item): Boolean {
                return p0 == p1
            }

            override fun areContentsTheSame(p0: Item, p1: Item): Boolean {
                return p0.id == p1.id
            }

        }

    }
}
{% endhighlight %}

<br>
ส่ง `View` ให้กับ `Adapter` ซึ่งตัว `LinearLayoutViewHolder` จะเป็นคัวสร้าง `View` ให้ และมีการทำ `Listener` ให้ด้วย กรณีที่เราแตะที่ `Item`

{% highlight kotlin %}
override fun onCreateViewHolder(p0: ViewGroup, p1: Int): LinearLayoutViewHolder {
    return LinearLayoutViewHolder.create(p0, onItemClickListener)
}
{% endhighlight %}

<br>
`Bind` ViewHolder ใน `Adapter` โดยจะ `bind` ตามตำแหน่งของ `Array` และมีการส่งค่าไปให้ `LinearLayoutViewHolder` ผ่านฟังก์ชัน `bind(item)` เพื่อนำข้อมูลไปแสดงบน `View` ที่เรากำหนดไว้

{% highlight kotlin %}
override fun onBindViewHolder(p0: LinearLayoutViewHolder, p1: Int) {
    p0.bind(getItem(p1))
}
{% endhighlight %}

- เรียกใช้งาน `LinearLayoutAdapter` และ `RecyclerView` ใน `Fragment` ทั้งหมดจะมีหน้าตาประมาณนี้

{% highlight kotlin %}
package com.prongbang.recyclerviewlayoutmanager.ui.linear

import android.os.Bundle
import android.support.v4.app.Fragment
import android.support.v7.widget.LinearLayoutManager
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast

import com.prongbang.recyclerviewlayoutmanager.R
import com.prongbang.recyclerviewlayoutmanager.model.Item
import com.prongbang.recyclerviewlayoutmanager.utils.OnItemClickListener
import kotlinx.android.synthetic.main.fragment_linear_layout.view.*

class LinearLayoutFragment : Fragment() {

    companion object {

        fun newInstance(): Fragment {
            return LinearLayoutFragment()
        }

    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        // Inflate the layout for this fragment
        val view = inflater.inflate(R.layout.fragment_linear_layout, container, false)

        val items = ArrayList<Item>().apply {
            add(Item(1, R.drawable.item_1, "Item 1"))
            add(Item(2, R.drawable.item_2, "Item 2"))
            add(Item(3, R.drawable.item_3, "Item 3"))
            add(Item(4, R.drawable.item_4, "Item 4"))
            add(Item(5, R.drawable.item_5, "Item 5"))
            add(Item(6, R.drawable.item_6, "Item 6"))
            add(Item(7, R.drawable.item_7, "Item 7"))
        }

        val adapter = LinearLayoutAdapter().apply {
            setOnItemClickListener(object : OnItemClickListener<Item>{
                override fun onClick(v: View, data: Item) {
                    Toast.makeText(context, data.message, Toast.LENGTH_SHORT).show()
                }
            })
            submitList(items)
        }

        val reverse = false
        view.rvLinear.apply {
            setAdapter(adapter)
            layoutManager = LinearLayoutManager(context, LinearLayoutManager.VERTICAL, reverse)
            isNestedScrollingEnabled = false
        }

        return view
    }

}
{% endhighlight %}

<br>
"ถ้าเรียกใช้งานใน Activity เราไม่ต้องอ้างถึง view.ชื่อ id เราสามารถใช้ id ได้เลย เช่น ใน Fragment ใช้ view.rvLinear.apply{} ส่วน Activity ก็จะใช้ rvLinear.apply{} ประมาณนี้"
<br><br>
`apply` คืออะไรทำงานยังไง ตัว apply มันตัวที่มาช่วยให้เราสามารถจัด `scope` การทำงานได้นั่นเอง หรือเรียกว่า "Scopeing Function" ถ้าไม่เข้าใจสามารถไปอ่านได้[ที่นี่เลย](https://blog.nextzy.me/%E0%B9%84%E0%B8%82%E0%B8%82%E0%B9%89%E0%B8%AD%E0%B8%AA%E0%B8%87%E0%B8%AA%E0%B8%B1%E0%B8%A2%E0%B8%82%E0%B8%AD%E0%B8%87-also-apply-let-run-%E0%B9%81%E0%B8%A5%E0%B8%B0-with-%E0%B9%83%E0%B8%99-kotlin-bcc5746d7be1)

<br><br>
การเรียกใช้งาน `LinearLayoutAdapter` โดยการทำงานของมันคือ สร้าง `Instance` ขึ้นมาใหม่ จากนั้นก็ทำการเรียกใช้ฟังก์ชัน `setOnItemClickListener` เพื่อรอรับข้อมูลเมื่อมีการแตะที่ `Item` และมีการส่งข้อมูลไปให้ `LinearLayoutAdapter` ผ่านฟังก์ชัน `submitList` จากนั้นตัว `Adapter` มันจะจัดการทุกอย่างให้เอง

{% highlight kotlin %}
val adapter = LinearLayoutAdapter().apply {
    setOnItemClickListener(object : OnItemClickListener<Item>{
        override fun onClick(v: View, data: Item) {
            Toast.makeText(context, data.message, Toast.LENGTH_SHORT).show()
        }
    })
    submitList(items)
}
{% endhighlight %}

<br>
การเรียกใช้งาน `RecyclerView` ที่มี id ชื่อ `rvLinear` โดยการทำงานของมันคือ กำหนดค่า `LinearLayoutAdapter` ให้กับ `rvLinear` ผ่านฟังก์ชัน `setAdapter` เพื่อให้ `RecyclerView` แสดงข้อมูลออกมาเป็น List นั่นเอง จากนั้นก็กำหนด `layoutManager` เป็น `LinearLayoutManager` ที่แสดงข้อมูลเป็นแนวตั่ง(LinearLayoutManager.VERTICAL) โดยเรียงข้อมูลจากหน้าไปหลัง(reverse = false) และกำหนดว่าไม่ใช้การเลื่อนแบบซ้อนกัน

{% highlight kotlin %}
val reverse = false
view.rvLinear.apply {
    setAdapter(adapter)
    layoutManager = LinearLayoutManager(context, LinearLayoutManager.VERTICAL, reverse)
    isNestedScrollingEnabled = false
}
{% endhighlight %}
<br>
และเรายังสามารถกำหนดได้หลายแบบตามนี้
<br><br>

> -แสดงข้อมูลเป็น`แนวตั่ง`โดยเรียงข้อมูลจาก`หน้าไปหลัง`
<br>
{% highlight kotlin %}
LinearLayoutManager(context, LinearLayoutManager.VERTICAL, false)
{% endhighlight %}

> -แสดงข้อมูลเป็น`แนวตั้ง`โดยเรียงข้อมูลจาก`หลังไปหน้า`
<br>
{% highlight kotlin %}
LinearLayoutManager(context, LinearLayoutManager.VERTICAL, true)
{% endhighlight %}

> -แสดงข้อมูลเป็น`แนวนอน`โดยเรียงข้อมูลจาก`หน้าไปหลัง`
<br>
{% highlight kotlin %}
LinearLayoutManager(context, LinearLayoutManager.HORIZONTAL, false)
{% endhighlight %}

> -แสดงข้อมูลเป็น`แนวนอน`โดยเรียงข้อมูลจาก`หลังไปหน้า`
<br>
{% highlight kotlin %}
LinearLayoutManager(context, LinearLayoutManager.HORIZONTAL, true)
{% endhighlight %}
<br>



### Grid Layout Manager

<img src="/assets/images/android/9-2.png">
<br>
<br>

ขั้นตอนการสร้าง View, Adapter, ViewHolder ก็จะเหมือน ๆ กันกับ `LinearLayoutManager` แต่สิ่งที่แตกต่างกัน คือ การกำหนด `layoutManager` ให้กับตัว `RecyclerView` นั่นเอง
<br>

- เรียกใช้งาน `GridLayoutAdapter` และ `RecyclerView` ใน Fragment ทั้งหมดจะมีหน้าตาประมาณนี้
{% highlight kotlin %}
package com.prongbang.recyclerviewlayoutmanager.ui.grid

import android.os.Bundle
import android.support.v4.app.Fragment
import android.support.v7.widget.GridLayoutManager
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast

import com.prongbang.recyclerviewlayoutmanager.R
import com.prongbang.recyclerviewlayoutmanager.model.Item
import com.prongbang.recyclerviewlayoutmanager.utils.OnItemClickListener
import kotlinx.android.synthetic.main.fragment_grid_layout.view.*

class GridLayoutFragment : Fragment() {

    companion object {

        fun newInstance(): Fragment {
            return GridLayoutFragment()
        }

    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        // Inflate the layout for this fragment
        val view = inflater.inflate(R.layout.fragment_grid_layout, container, false)

        val items = ArrayList<Item>().apply {
            add(Item(1, R.drawable.item_1, "Item 1"))
            add(Item(2, R.drawable.item_2, "Item 2"))
            add(Item(3, R.drawable.item_3, "Item 3"))
            add(Item(4, R.drawable.item_4, "Item 4"))
            add(Item(5, R.drawable.item_5, "Item 5"))
            add(Item(6, R.drawable.item_6, "Item 6"))
            add(Item(7, R.drawable.item_7, "Item 7"))
        }

        val adapter = GridLayoutAdapter().apply {
            setOnItemClickListener(object : OnItemClickListener<Item> {
                override fun onClick(v: View, data: Item) {
                    Toast.makeText(context, data.message, Toast.LENGTH_SHORT).show()
                }
            })
            submitList(items)
        }

        val reverse = false
        view.rvGrid.apply {
            setAdapter(adapter)
            layoutManager = GridLayoutManager(context, 2, GridLayoutManager.VERTICAL, reverse)
            isNestedScrollingEnabled = false
        }

        return view
    }

}
{% endhighlight %}
<br>

การเรียกใช้งาน `GridLayoutAdapter` ก็จะเหมือน ๆ กันกับ `LinearLayoutAdapter` เลย ส่วนนี้จะขอข้ามไปนะ
<br>
<br>
การเรียกใช้งาน `RecyclerView` ที่มี id ชื่อ `rvGrid` โดยการทำงานของมันคือ กำหนดค่า `GridLayoutAdapter` ให้กับ `rvGrid` ผ่านฟังก์ชัน `setAdapter` เพื่อให้ `RecyclerView` แสดงข้อมูลออกมาเป็น List นั่นเอง จากนั้นก็กำหนด `layoutManager` เป็น `GridLayoutManager` ที่แสดงข้อมูลเป็นแนวตั่ง(GridLayoutManager.VERTICAL) และกำหนดคอลลั่มเป็น 2 โดยเรียงข้อมูลจากหน้าไปหลัง(reverse = false) และกำหนดว่าไม่ใช้การเลื่อนแบบซ้อนกัน

{% highlight kotlin %}
val reverse = false
view.rvGrid.apply {
    setAdapter(adapter)
    layoutManager = GridLayoutManager(context, 2, GridLayoutManager.VERTICAL, reverse)
    isNestedScrollingEnabled = false
}
{% endhighlight %}
<br>
และเรายังสามารถกำหนดได้หลายแบบตามนี้
<br><br>

> -แสดงข้อมูลเป็น`แนวตั่ง 2 คอลลั่ม` โดยเรียงข้อมูลจาก`หน้าไปหลัง`
<br>
{% highlight kotlin %}
GridLayoutManager(context, 2, GridLayoutManager.VERTICAL, false)
{% endhighlight %}

> -แสดงข้อมูลเป็น`แนวตั้ง 2 คอลลั่ม` โดยเรียงข้อมูลจาก`หลังไปหน้า`
<br>
{% highlight kotlin %}
GridLayoutManager(context, 2, GridLayoutManager.VERTICAL, true)
{% endhighlight %}

> -แสดงข้อมูลเป็น`แนวนอน 2 แถว` โดยเรียงข้อมูลจาก`หน้าไปหลัง`
<br>
{% highlight kotlin %}
GridLayoutManager(context, 2, GridLayoutManager.HORIZONTAL, false)
{% endhighlight %}

> -แสดงข้อมูลเป็น`แนวนอน 2 แถว` โดยเรียงข้อมูลจาก`หลังไปหน้า`
<br>
{% highlight kotlin %}
GridLayoutManager(context, 2, GridLayoutManager.HORIZONTAL, true)
{% endhighlight %}
<br>

### Staggered Grid Layout Manager

<img src="/assets/images/android/9-3.png">
<br>
<br>

ขั้นตอนการสร้าง View, Adapter, ViewHolder ก็จะเหมือน ๆ กันกับ `LinearLayoutManager` และ `GridLayoutManager` แต่สิ่งที่แตกต่างกัน คือ การกำหนด `layoutManager` ให้กับตัว `RecyclerView` นั่นเอง และก็ `item` ของ `view`
<br>

- สร้าง `item_staggered_grid_layout.xml` โดยเราจะมองส่วนนี้คือ Item หรือส่วนที่เราเรียกว่า Custom List View ที่ใช้แสดงข้อมูลของแต่ละรายการ โดยในตัวอย่างนี้เราจะใช้ `CardView` ก็เพราะว่ามันสามารถกำหนดค่าต่าง ๆ ได้ง่าย เช่น ใส่เงา ทำขอบมน เป็นต้น โดยสิ่งที่แตกต่างกันคือต้องทำให้ View แสดงขอมูลออกมาตาม `Retio` เราก็จะได้ `layout` ประมาณนี้

{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<android.support.constraint.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="wrap_content">

    <android.support.v7.widget.CardView
        android:id="@+id/cvItem"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_gravity="center"
        android:layout_margin="3dp"
        app:cardCornerRadius="4dp"
        app:cardElevation="1dp"
        app:cardMaxElevation="1dp"
        app:cardPreventCornerOverlap="true"
        app:cardUseCompatPadding="true"
        app:contentPadding="0dp">

        <android.support.v7.widget.AppCompatImageView
            android:id="@+id/ivImage"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:adjustViewBounds="true"
            app:srcCompat="@drawable/item_1" />

    </android.support.v7.widget.CardView>

</android.support.constraint.ConstraintLayout>
{% endhighlight %}

- เรียกใช้งาน `StaggeredGridLayoutAdapter` และ `RecyclerView` ใน Fragment ทั้งหมดจะมีหน้าตาประมาณนี้

{% highlight kotlin %}
package com.prongbang.recyclerviewlayoutmanager.ui.staggered

import android.os.Bundle
import android.support.v4.app.Fragment
import android.support.v7.widget.StaggeredGridLayoutManager
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast

import com.prongbang.recyclerviewlayoutmanager.R
import com.prongbang.recyclerviewlayoutmanager.model.Item
import com.prongbang.recyclerviewlayoutmanager.utils.OnItemClickListener
import kotlinx.android.synthetic.main.fragment_staggered_grid_layout.view.*

class StaggeredGridLayoutFragment : Fragment() {

    companion object {
        fun newInstance(): Fragment {
            return StaggeredGridLayoutFragment()
        }
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        // Inflate the layout for this fragment
        val view = inflater.inflate(R.layout.fragment_staggered_grid_layout, container, false)

        val items = ArrayList<Item>().apply {
            add(Item(1, R.drawable.item_1, "Item 1"))
            add(Item(2, R.drawable.item_2, "Item 2"))
            add(Item(3, R.drawable.item_3, "Item 3"))
            add(Item(4, R.drawable.item_5, "Item 4"))
            add(Item(5, R.drawable.item_4, "Item 5"))
            add(Item(6, R.drawable.item_6, "Item 6"))
            add(Item(7, R.drawable.item_7, "Item 7"))
        }

        val adapter = StaggeredGridLayoutAdapter().apply {
            setOnItemClickListener(object : OnItemClickListener<Item>{
                override fun onClick(v: View, data: Item) {
                    Toast.makeText(context, data.message, Toast.LENGTH_SHORT).show()
                }
            })
            submitList(items)
        }

        view.rvStaggeredGrid.apply {
            setAdapter(adapter)
            layoutManager = StaggeredGridLayoutManager(2, StaggeredGridLayoutManager.VERTICAL)
            isNestedScrollingEnabled = false
        }

        return view
    }

}
{% endhighlight %}
<br>

การเรียกใช้งาน `StaggeredGridLayoutAdapter` ก็จะเหมือน ๆ กันกับ `LinearLayoutAdapter` และ `GridLayoutManager` เลย ส่วนนี้จะขอข้ามไปนะ
<br>
<br>
การเรียกใช้งาน `RecyclerView` ที่มี id ชื่อ `rvStaggeredGrid` โดยการทำงานของมันคือ กำหนดค่า `StaggeredGridLayoutAdapter` ให้กับ `rvStaggeredGrid` ผ่านฟังก์ชัน `setAdapter` เพื่อให้ `RecyclerView` แสดงข้อมูลออกมาเป็น List นั่นเอง จากนั้นก็กำหนด `layoutManager` เป็น `StaggeredGridLayoutManager` ที่แสดงข้อมูลเป็นแนวตั่ง(StaggeredGridLayoutManager.VERTICAL) และกำหนดคอลลั่มเป็น 2 โดยเรียงข้อมูลต่อ ๆ กันโดยไม่ให้เหลือพื้นที่ว่างไว้ และกำหนดว่าไม่ใช้การเลื่อนแบบซ้อนกัน

{% highlight kotlin %}
view.rvStaggeredGrid.apply {
    setAdapter(adapter)
    layoutManager = StaggeredGridLayoutManager(2, StaggeredGridLayoutManager.VERTICAL)
    isNestedScrollingEnabled = false
}
{% endhighlight %}
<br>
และเรายังสามารถกำหนดได้หลายแบบตามนี้
<br><br>

> -แสดงข้อมูลเป็น`แนวตั่ง 2 คอลลั่ม` โดยเรียงข้อมูลต่อ ๆ กันไม่ให้เหลือพื้นที่ว่างไว้ 
<br>
{% highlight kotlin %}
StaggeredGridLayoutManager(2, StaggeredGridLayoutManager.VERTICAL)
{% endhighlight %}

> -แสดงข้อมูลเป็น`แนวนอน 2 แถว` โดยเรียงข้อมูลต่อ ๆ กันไม่ให้เหลือพื้นที่ว่างไว้ 
<br>
{% highlight kotlin %}
StaggeredGridLayoutManager(2, StaggeredGridLayoutManager.HORIZONTAL)
{% endhighlight %}

### เขียนมาซะเยอะเลย ถ้ามองไม่เห็นภาพลองเข้าไปโหลด [Source Code](https://raboninco.com/XBOl) มาเล่นดูได้เลย

<br>