---
layout: post
title:  "[Android] ทำ Paging หรือ Load more ด้วย Paging library แบบคร่าว ๆ"
short_description: "Paging library นี่โคตรหล่อเลย เราแทบไม่ต้องไปเขียนโค้ดไปจัดการตอนที่เรา scroll เลย เพียงแค่บอกให้ paging จัดการให้ มันก็จะจัดการกับข้อมูลของเราให้ทุกอย่างเลย"
date:   2018-12-09 12:28:00 +0700
categories: android
tags: [android]
cover_image: /assets/images/android/14.png
author: "Devไปวันๆ"
---

### เริ่มกันเลยดีกว่า
<br>

Paging library นั้นสามารถทำได้ 3 แบบด้วยกันตามนี้

- Network only
- Database only
- Network and database

<img src="https://codelabs.developers.google.com/codelabs/android-paging/img/511a702ae4af43cd.png"/>
<center>ภาพรวมของ Paging library</center>

<br>
<br>
ซึ่งในตัวอย่างนี้เราจะใช้วิธี Network only และเพื่อให้ง่ายต่อการไล่โค้ดให้ไป clone โปรเจคนี้มาเลย ๆ >> [android-paging](https://raboninco.com/XBdS) <<

#### เริ่มกันที่ mock API ก่อน

โดยเข้าไปที่ [android-paging/server](https://raboninco.com/XBe2)

ซึ่งเราจะใช้ json-server มาทำ mock API ซึ่งเราจะต้อง Install ก่อนตามนี้

{% highlight shell %}
npm install -g json-server
{% endhighlight %}

จากนั้นก็ Run เรยโดยใช้คำสั่งนี้

{% highlight shell %}
json-server --host <IP เครื่องเรา> --watch db.json
{% endhighlight %}

** db.json คือ ข้อมูลที่เรา mock

<br>
<br>

เช่น

{% highlight shell %}
json-server --host 192.168.1.9 --watch db.json
{% endhighlight %}

#### วาง Architechture โดยใช้ Clean Architechture ประมาณนี้ 

<br>

<img src="https://cdn-images-1.medium.com/max/1600/1*cWigoCU4Q_O25hscjOq-fg.png"/>

โดยเราจะมองแต่ละหน้าที่เพิ่มเข้ามาเป็น feature และเขียนการทำงานทุกอย่างไว้ใน feature นั้นเท่านั้นเพื่อให้อยู่ง่ายต่อการแก้ไขหรือเลิกใช้งานในอนาคต

{% highlight shell %}
.
├── feature
│   └── user
│       ├── api
│       │   └── UserService.kt
│       ├── data
│       │   ├── UserDataSourceFactory.kt
│       │   ├── UserPageKeyedDataSource.kt
│       │   ├── UserRemoteDataSource.kt
│       │   └── UserRepository.kt
│       ├── di
│       │   └── Injection.kt
│       ├── domain
│       │   └── GetUserByPageUseCase.kt
│       ├── model
│       │   ├── Listing.kt
│       │   ├── NetworkState.kt
│       │   └── User.kt
│       └── ui
│           ├── UserAdapter.kt
│           ├── UserFragment.kt
│           ├── UserViewModel.kt
│           ├── UserViewModelFactory.kt
│           └── holder
│               ├── NetworkStateItemViewHolder.kt
│               └── UserViewHolder.kt
{% endhighlight %}

#### เริ่มจากสร้างส่วนของ "Data Layout"

- UserRemoteDataSource.kt

ส่วนนี้จะเป็นส่วนที่จะไปดึงข้อมูลจาก API โดยจะทำการส่ง page และ limit เพื่อไปขอข้อมูลจาก API

{% highlight kotlin %}
import com.prongbang.paging.feature.user.api.UserService
import com.prongbang.paging.utils.safeApiCall

class UserRemoteDataSource(private val service: UserService) {

    suspend fun getUserByPaged(page: Int, limit: Int) = safeApiCall(service.getUserByPaged(page, limit))

}
{% endhighlight %}

- UserPageKeyedDataSource.kt

ส่วนนี้จะเป็นส่วนที่มาจัดการตอนโหลดข้อมูลซึ่งจะมีอยู่ 3 ฟังก์ชันหลัก ๆ คือ
<br> 
** loadInitial โหลดข้อมูลในครั้งแรก
<br>
** loadBefore  ซึ่งถ้าเราโหลดข้อมูลตอน loadInitial แล้วไม่ต้องใช้ฟังก์ชันนี้ก็ได้
<br>
** loadAfter จะโหลดข้อมูลหลังจากมีการ loadInitial ไปแล้ว
<br>
ซึ่งจากโค้ดนี้เราจะเห็นว่ามีการสืบทอด class ที่ชื่ว่า `PageKeyedDataSource<Int, User>()` โดย Int คือ Key ซึ่งในที่นี้เราจะเก็บเป็นจำนวนของ page ส่วน User คือ Value ที่ได้จากการไปดึงข้อมูลจาก API

<br>
ในการโหลดครั้งแรก loadInitial จะใช้ข้อมูล page ที่ส่งมาผ่าน parameter

{% highlight kotlin %}
val result = dataSource.getUserByPaged(page, limit)
callback.onResult(result.data, null, page + 1)
{% endhighlight %}

** page + 1 คือ จะเก็บค่าของ page ถัดไปเพื่อใช้ในฟังก์ชัน loadAfter

{% highlight kotlin %}
val result = dataSource.getUserByPaged(params.key, limit)
callback.onResult(result.data, params.key + 1)
{% endhighlight %}

** params.key + 1 คือ จะเก็บค่าของ page ถัดไปเพื่อใช้ในฟังก์ชัน loadAfter

<br>
<br>
โค้ดแบบเต็มจะมีการ handle การ retry ด้วยเมื่อไปดึงข้อมูลแล้วเกิด error

{% highlight kotlin %}
class UserPageKeyedDataSource(
    private val page: Int,
    private val limit: Int,
    private val dataSource: UserRemoteDataSource
) : PageKeyedDataSource<Int, User>() {

    // keep a function reference for the retry event
    private var retry: (() -> Any)? = null

    val networkState = MutableLiveData<NetworkState>()
    val initialLoading = MutableLiveData<NetworkState>()

    fun retryAllFailed() {
        val prevRetry = retry
        retry = null
        prevRetry?.let {
            GlobalScope.launch(Dispatchers.IO) {
                it.invoke()
            }
        }
    }

    override fun loadInitial(params: LoadInitialParams<Int>, callback: LoadInitialCallback<Int, User>) {
        GlobalScope.launch(Dispatchers.IO) {
            initialLoading.postValue(NetworkState.LOADING)
            networkState.postValue(NetworkState.LOADING)

            val result = dataSource.getUserByPaged(page, limit)
            when (result) {
                is Results.Success -> {
                    retry = null
                    callback.onResult(result.data, null, page + 1)
                    initialLoading.postValue(NetworkState.LOADED)
                    networkState.postValue(NetworkState.LOADED)
                }
                is Results.ServerError -> {
                    loadInitialRetry(params, callback)
                    onError(NetworkState.serverError(result.exception?.message))
                }
            }
        }
    }

    private fun loadInitialRetry(
        params: LoadInitialParams<Int>,
        callback: LoadInitialCallback<Int, User>
    ) {
        retry = {
            loadInitial(params, callback)
        }
    }

    private fun onError(state: NetworkState) {
        initialLoading.postValue(NetworkState.LOADED)
        networkState.postValue(state)
    }

    override fun loadAfter(params: LoadParams<Int>, callback: LoadCallback<Int, User>) {
        GlobalScope.launch(Dispatchers.IO) {
            initialLoading.postValue(NetworkState.LOADING)
            networkState.postValue(NetworkState.LOADING)

            val result = dataSource.getUserByPaged(params.key, limit)
            when (result) {
                is Results.Success -> {
                    callback.onResult(result.data, params.key + 1)
                    initialLoading.postValue(NetworkState.LOADED)
                    networkState.postValue(NetworkState.LOADED)
                }
                is Results.ServerError -> {
                    loadAfterRetry(params, callback)
                    onError(NetworkState.serverError(result.exception?.message))
                }
            }
        }
    }

    private fun loadAfterRetry(
        params: LoadParams<Int>,
        callback: LoadCallback<Int, User>
    ) {
        retry = {
            loadAfter(params, callback)
        }
    }

    override fun loadBefore(params: LoadParams<Int>, callback: LoadCallback<Int, User>) {
        // ignored, since we only ever append to our initial load
    }

}
{% endhighlight %}

- UserDataSourceFactory.kt

ส้วนนี้จะเป็นตัวสร้าง UserPageKeyedDataSource หรือเรียกว่าโรงงานผลิต DataSource ก็ว่าได้

{% highlight kotlin %}
class UserDataSourceFactory(
    private val page: Int,
    private val limit: Int,
    private val dataSource: UserRemoteDataSource
)  : DataSource.Factory<Int, User>() {

    val sourceLiveData = MutableLiveData<UserPageKeyedDataSource>()

    override fun create(): DataSource<Int, User> {
        val source = UserPageKeyedDataSource(page, limit, dataSource)
        sourceLiveData.postValue(source)
        return source
    }
}
{% endhighlight %}

- UserRepository.kt

ส่วนของ Repository จะเป็นตัวเรียกใช้ DataSource Factory อีกที

{% highlight kotlin %}
interface UserRepository {

    suspend fun getUserByPaged(page: Int, limit: Int): Listing<User>

}

class DefaultUserRepository(
    private val dataSource: UserRemoteDataSource
) : UserRepository {

    override suspend fun getUserByPaged(page: Int, limit: Int): Listing<User> {

        val sourceFactory = UserDataSourceFactory(page, limit, dataSource)

        // We use toLiveData Kotlin extension function here, you could also use LivePagedListBuilder
        val livePagedList = sourceFactory.toLiveData(
            pageSize = limit
        )

        val refreshState = Transformations.switchMap(sourceFactory.sourceLiveData) {
            it.initialLoading
        }

        return Listing(
            pagedList = livePagedList,
            networkState = Transformations.switchMap(sourceFactory.sourceLiveData) {
                it.networkState
            },
            retry = {
                sourceFactory.sourceLiveData.value?.retryAllFailed()
            },
            refresh = {
                sourceFactory.sourceLiveData.value?.invalidate()
            },
            refreshState = refreshState
        )
    }

}
{% endhighlight %}

#### ต่อไปก็สร้างส่วนของ "Domain Layout"
<br>

โดยเราจะสร้าง class ตาม UseCase พูดง่าย ๆ คือ 1 class มีได้ 1 UseCase ในที่นี้มีแค่ดึงข้อมูล User ตาม page และ limit ที่ต้องการ

- GetUserByPageUseCase.kt 

{% highlight kotlin %}
class GetUserByPageUseCase(
    private val repository: UserRepository
) {
    suspend fun getUserByPaged(page: Int, limit: Int): Listing<User> {

        return repository.getUserByPaged(page, limit)
    }

}
{% endhighlight %}

#### ต่อไปก็สร้างส่วนของ "UI Layout" หรือ "Presentation Layout"
<br>

- UserViewModel.kt

ส่วนของ ViewModel สามารถมีได้หลาย UseCase ขึ้นอยู่กับ Requirement

{% highlight kotlin %}
class UserViewModel(
    private val useCase: GetUserByPageUseCase
) : ViewModel() {

    private val page = MutableLiveData<Int>()

    private val results = Transformations.map(page) { page ->
        runBlocking {
            useCase.getUserByPaged(page, 10)
        }
    }

    val users = Transformations.switchMap(results) { it.pagedList }
    val networkState = Transformations.switchMap(results) { it.networkState }
    val refreshState = Transformations.switchMap(results) { it.refreshState }

    private var job: Job? = null

    fun getUserByPage(pageSize: Int) {
        page.value = pageSize
    }

    fun refresh() {
        results.value?.refresh?.invoke()
    }

    fun retry() {
        val listing = results?.value
        listing?.retry?.invoke()
    }

    override fun onCleared() {
        super.onCleared()
        job?.cancel()
    }
}
{% endhighlight %}

- UserAdapter.kt

ส่วนของ Adapter เพื่อจัดการการแสดงข้อมูลหลาย ๆ รายการ

{% highlight kotlin %}
class UserAdapter(
    private val retryCallback: () -> Unit
) : PagedListAdapter<User, RecyclerView.ViewHolder>(DIFF_COMPARATOR) {

    private var networkState: NetworkState? = null

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return when (viewType) {
            R.layout.user_item -> UserViewHolder.create(parent)
            R.layout.network_state_item -> NetworkStateItemViewHolder.create(parent, retryCallback)
            else -> throw IllegalArgumentException("unknown view type $viewType")
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        when (getItemViewType(position)) {
            R.layout.user_item -> (holder as UserViewHolder).bind(getItem(position))
            R.layout.network_state_item -> (holder as NetworkStateItemViewHolder).bindTo(networkState)
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int, payloads: MutableList<Any>) {
        onBindViewHolder(holder, position)
    }

    private fun hasExtraRow() = networkState != null && networkState != NetworkState.LOADED

    override fun getItemViewType(position: Int): Int {
        return if (hasExtraRow() && position == itemCount - 1) {
            R.layout.network_state_item
        } else {
            R.layout.user_item
        }
    }

    override fun getItemCount(): Int {
        return super.getItemCount() + if (hasExtraRow()) 1 else 0
    }

    fun setNetworkState(newNetworkState: NetworkState?) {
        val previousState = this.networkState
        val hadExtraRow = hasExtraRow()
        this.networkState = newNetworkState
        val hasExtraRow = hasExtraRow()
        if (hadExtraRow != hasExtraRow) {
            if (hadExtraRow) {
                notifyItemRemoved(super.getItemCount())
            } else {
                notifyItemInserted(super.getItemCount())
            }
        } else if (hasExtraRow && previousState != newNetworkState) {
            notifyItemChanged(itemCount - 1)
        }
    }

    companion object {
        private val DIFF_COMPARATOR = object : DiffUtil.ItemCallback<User>() {
            override fun areItemsTheSame(oldItem: User, newItem: User): Boolean {
                return oldItem == newItem
            }

            override fun areContentsTheSame(oldItem: User, newItem: User): Boolean {
                return oldItem.id == newItem.id
            }
        }
    }

}
{% endhighlight %}

- UserFragment.kt

และแล้วก็ถึงส่วนที่เรียกใช้งานแล้วประมาณนี้

{% highlight kotlin %}
val viewModel = ViewModelProviders.of(this, Injection.provideUserViewModelFactory()).get(UserViewModel::class.java)

val mAdapter = UserAdapter {
    viewModel.retry()
}

view?.let {
    it.rvUser.apply {
        adapter = mAdapter
        layoutManager = LinearLayoutManager(context)
        isNestedScrollingEnabled = false
    }
}

viewModel.getUserByPage(1)
viewModel.users.observe(this, Observer {
    mAdapter.submitList(it)
})

viewModel.networkState.observe(this, Observer {
    mAdapter.setNetworkState(it)
})

viewModel.refreshState.observe(this, Observer {

})
{% endhighlight %}

นี่เป็นเพียงคร่าว ๆ เท่านั้นในการใช้งาน Paging Library ถ้าอยากจะอ่านหรือศึกษาเพิ่มเติมให้เข้าไปที่ [
Paging library overview](https://developer.android.com/topic/libraries/architecture/paging/)
<br>
<br>