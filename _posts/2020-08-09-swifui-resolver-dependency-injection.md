---
layout: post
title:  "[iOS] ใช้งาน Resolver (Dependency Injection) + MVVM + Clean กับ Swift UI"
short_description: "มาดูว่ามันจะทำให้ชีวิตเราง่ายขึ้นได้มากขนาดไหน"
date:   2020-08-09 17:28:09 +0700
categories: [ios]
tags: [ios]
cover_image: /assets/images/ios/01.png
author: "Devไปวันๆ"
---

### เริ่มจากเพิ่ม Resolver ใน `Podfile` ก่อนตามนี้

{% highlight bash %}
pod "Resolver"
{% endhighlight %}

### สร้างไฟล์สำหรับ Registration ชื่อ AppDelegate+Injection.swift ประมาณนี้

{% highlight swift %}
//
//  AppDelegate+Injection.swift
//
import Resolver

extension Resolver: ResolverRegistering {
    public static func registerAllServices() {
        registerAlbums()
    }
}
{% endhighlight %}

### วิธีใช้งานก็ง่าย ๆ ถ้าเราเขียนด้วย MVVM + Clean ก็จะได้ตามนี้

- สร้างไฟล์ Albums+Injection.swift ตั้งชื่อตาม feature เพื่อให้ง่ายในการเพิ่ม แก้ไข ลบ สำหรับทำการ register class ในภายหลัง

{% highlight swift %}
//
//  Albums+Injection.swift
//
import Resolver

extension Resolver {
    
    public static func registerAlbums() {
        register{ MockAlbumsAPI() as AlbumsAPI }
        register(name: "AlbumsRemoteDataSource") { AlbumsRemoteDataSource(albumsAPI: resolve()) as AlbumsDataSource }
        register(name: "AlbumsLocalDataSource") { AlbumsLocalDataSource() as AlbumsDataSource }
        register{
            DefaultAlbumsRepository(
                albumsLocalDataSource: resolve(name: "AlbumsLocalDataSource"),
                albumsRemoteDataSource: resolve(name: "AlbumsRemoteDataSource")
            ) as AlbumsRepository
        }
        register{ DefaultGetAlbumsListUseCase(albumsRepository: resolve()) as GetAlbumsListUseCase }
        register{ AlbumsViewModel() }
    }
}
{% endhighlight %}

- สร้างไฟล์ AlbumsRepository.swift ในตัวอย่างจะจำลองว่าไม่สามารถเชื่อมต่อ internet ได้ จะให้ไปเอาค่าจาก local หรือ cache, database แทน

{% highlight swift %}
//
//  AlbumsRepository.swift
//
import Foundation

protocol AlbumsRepository {
    func getAlbumsList() -> Albums
}

class DefaultAlbumsRepository: AlbumsRepository {
    
    private let isNetworkUnavailable = true
    private let albumsLocalDataSource: AlbumsDataSource
    private let albumsRemoteDataSource: AlbumsDataSource
    
    init(albumsLocalDataSource: AlbumsDataSource, albumsRemoteDataSource: AlbumsDataSource) {
        self.albumsLocalDataSource = albumsLocalDataSource
        self.albumsRemoteDataSource = albumsRemoteDataSource
    }
    
    func getAlbumsList() -> Albums {
        
        if isNetworkUnavailable {
            return self.albumsLocalDataSource.getAlbumsList()
        }
        
        return self.albumsRemoteDataSource.getAlbumsList()
    }
}
{% endhighlight %}

- สร้างไฟล์ AlbumsViewModel.swift ถ้าอยากเรียกใช้ UseCase สามารถใช้ @Injected ได้เลยตามนี้

{% highlight swift %}
//
//  AlbumsViewModel.swift
//
import Foundation
import Resolver
import Combine

class AlbumsViewModel: ObservableObject {
    
    @Published var albumsList = Albums()
    
    @Injected var getAlbumsListUseCase: GetAlbumsListUseCase
    
    func getAlbumsList() {
        self.albumsList = self.getAlbumsListUseCase.execute()
    }
}
{% endhighlight %}

- เรียกใช้ในไฟล์ AlbumsView.swift สามารถเรียกใช้ Resolver.resolve() ได้ตามนี้

{% highlight swift %}
//
//  AlbumsView.swift
//
import SwiftUI
import Combine
import Resolver

struct AlbumsView: View {
    
    @ObservedObject var albumsViewModel: AlbumsViewModel = Resolver.resolve()
    
    var body: some View {
        NavigationView {
            List(self.albumsViewModel.albumsList) { item in
                Text(item.title)
            }
            .navigationBarTitle("Albums")
        }
        .onAppear {
            self.albumsViewModel.getAlbumsList()
        }
    }
    
    struct AlbumsView_Previews: PreviewProvider {
        static var previews: some View {
            AlbumsView()
        }
    }
}
{% endhighlight %}

สำหรับผู้เขียนมองว่ามันง่ายเวลาใช้ แต่อาจจะยุ่งยากเวลาที่เราต้อง register ก่อน หวังว่าตัวอย่างจะดูน้อยไปหน่อย ผู้ที่หลงเข้ามาอ่านสามารถเข้าไปอ่านเพิ่มเติมได้ที่ [Resolver](https://github.com/hmlongco/Resolver) ส่วน [Source Code](https://botemoda.com/2VY2) ของโพสนี้เข้าไปโหลดได้เลยครับ หากผิดพลาดประการใดต้องขออภัย ณ ที่นั้นด้วยครับ

 <br/>