---
layout: post
title:  "[Android] เก็บ password ของ Signing Config ไว้ในไฟล์ keystore.properties"
short_description: "เพื่อไม่ให้ password ของ keystore ซึ่งจากเดิมจะอยู่ในไฟล์ build.gradle หลุดเราจึงมีความจำเป็นที่จะต้องเปลี่ยนที่อยู่ให้มัน"
date:   2018-04-14 21:32:02 +0700
categories: android
tags: [android]
cover_image: /assets/images/android/1.png
author: "end try"
---
#### จากเดิมจะอยู่ในไฟล์ `build.gradle` แบบนี้
```gradle
android {

    signingConfigs {
        config {
            keyAlias 'alias'
            keyPassword 'password'
            storeFile '/usr/local/myKeystore'
            storePassword 'password'
        }
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.config
        }
    }

}
```
ซึ่งการเขียนแบบนี้มันก็ใช้งานได้แต่ว่ามันเห็น password แบบโล่งโจ้งเกินไป

#### เราจึงต้องเปลี่ยนมาเป็นแบบนี้แทน

##### Step 1. สร้างไฟล์ `keystore.properties` ไว้ในระดับเดียวกับกับไฟล์ `local.properties` หรือ root project เพื่อเก็บ password ของ Keystore ประมาณนี้
```properties
storePassword=myStorePassword
keyPassword=mykeyPassword
keyAlias=myKeyAlias
storeFile=myStoreFileLocation
```
โดยเราจะเก็บในรูปแบบของ `Key=Value` แทนเพื่อดึงค่าตาม Key

##### Step 2. ดึงค่าจากไฟล์ `keystore.properties` ตาม `Key` ที่เรากำหนด หน้าตามันจะประมาณนี้
```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
keystoreProperties.load(new FileInputStream(keystorePropertiesFile))

android {

    signingConfigs {
        config {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.config
        }
    }

}
```

ถ้าเราต้องการไม่ให้ไฟล์ `keystore.properties` อยู่บน remote (Git) เราสามารถละเว้นมันได้ โดยการเอาชื่อไฟล์ไปใส่ในไฟล์ `.gitignore` ตามนนี้
```
keystore.properties
```