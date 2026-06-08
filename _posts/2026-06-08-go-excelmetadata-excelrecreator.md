---
layout: post
title: "[Golang] การใช้งาน ExcelMetadata และ ExcelRecreator"
short_description: "แนะนำวิธีใช้งานไลบรารี ExcelMetadata สำหรับดึงโครงสร้างและข้อมูลจากไฟล์ Excel ออกมาเป็น metadata และใช้ ExcelRecreator สร้างไฟล์ Excel กลับขึ้นมาใหม่จาก metadata เดิม"
date: 2026-06-08 23:59:00 +0700
categories: [golang]
tags: [golang]
cover_image: /assets/images/golang/15.png
author: "Devไปวันๆ"
---

### ExcelMetadata และ ExcelRecreator คืออะไร

ในการทำงานกับไฟล์ Excel บางครั้งเราไม่ได้ต้องการแค่อ่านค่าใน cell เท่านั้น แต่ต้องการเก็บรายละเอียดของไฟล์ไว้ให้ครบ เช่น ชื่อ sheet, merged cell, formula, style, row height, column width, hyperlink หรือ data validation

`ExcelMetadata` เป็นไลบรารีที่ช่วย **extract metadata จากไฟล์ `.xlsx`** ออกมาเป็น struct หรือ JSON ได้ ส่วน `ExcelRecreator` จะทำหน้าที่ตรงกันข้าม คือ **นำ metadata ที่ได้มาสร้างไฟล์ Excel กลับขึ้นมาใหม่** โดยพยายาม preserve โครงสร้าง, ค่า, formula และ style เดิมไว้

ติดตั้งได้ด้วยคำสั่ง

{% highlight shell %}
go get github.com/prongbang/excelmetadata
go get github.com/prongbang/excelrecreator
{% endhighlight %}

ถ้าต้องการใช้งานผ่าน CLI สำหรับ extract metadata สามารถติดตั้งได้ด้วยคำสั่ง

{% highlight shell %}
go install github.com/prongbang/excelmetadata/cmd/excelmetadata@v1.2.8
{% endhighlight %}

---

### แนวคิดหลัก

* ใช้ `excelmetadata.QuickExtract` เพื่ออ่าน metadata จากไฟล์ Excel
* ใช้ `excelmetadata.QuickExtractToJSON` หรือ `QuickExtractToFile` เมื่อต้องการ export เป็น JSON
* ใช้ `excelrecreator.QuickRecreate` เพื่อสร้าง Excel ใหม่จาก metadata struct
* ใช้ `excelrecreator.QuickRecreateFromJSON` เพื่อสร้าง Excel ใหม่จากไฟล์ JSON
* ปรับ options เพื่อเลือกว่าจะ preserve อะไรบ้าง เช่น formula, style, image หรือ data validation

---

### ตัวอย่างการใช้งาน ExcelMetadata

#### 1. Extract metadata จากไฟล์ Excel

{% highlight go %}
package main

import (
  "fmt"
  "log"

  "github.com/prongbang/excelmetadata"
)

func main() {
  metadata, err := excelmetadata.QuickExtract("sample.xlsx")
  if err != nil {
    log.Fatal(err)
  }

  fmt.Printf("File: %s\n", metadata.Filename)
  fmt.Printf("Created by: %s\n", metadata.Properties.Creator)
  fmt.Printf("Sheets: %d\n", len(metadata.Sheets))
}
{% endhighlight %}

ผลลัพธ์ที่ได้จะเป็น metadata ของไฟล์ Excel เช่น properties, sheets, cells, styles, merged cells, images และ defined names

#### 2. Export metadata เป็น JSON

{% highlight go %}
jsonText, err := excelmetadata.QuickExtractToJSON("sample.xlsx", true)
if err != nil {
  log.Fatal(err)
}

fmt.Println(jsonText)

err = excelmetadata.QuickExtractToFile("sample.xlsx", "metadata.json", true)
if err != nil {
  log.Fatal(err)
}
{% endhighlight %}

รูปแบบนี้เหมาะกับงานที่ต้องการเก็บ Excel เป็น metadata ไว้ในระบบ เช่น backup, version control, search หรือส่งต่อไปประมวลผลใน service อื่น

#### 3. Extract เฉพาะข้อมูลที่ต้องการ

{% highlight go %}
options := &excelmetadata.Options{
  IncludeCellData:       true,
  IncludeStyles:         true,
  IncludeImages:         true,
  IncludeDefinedNames:   true,
  IncludeDataValidation: true,
  MaxCellsPerSheet:      1000,
}

extractor, err := excelmetadata.New("large_file.xlsx", options)
if err != nil {
  log.Fatal(err)
}
defer extractor.Close()

metadata, err := extractor.Extract()
if err != nil {
  log.Fatal(err)
}
{% endhighlight %}

ถ้าไฟล์ Excel มีขนาดใหญ่ สามารถใช้ `MaxCellsPerSheet` เพื่อจำกัดจำนวน cell ที่จะ extract ได้ หรือปิด feature ที่ไม่จำเป็น เช่น style หรือ image เพื่อให้ทำงานเร็วขึ้น

---

### ตัวอย่างการใช้งาน ExcelRecreator

#### 1. Recreate จาก metadata struct

{% highlight go %}
package main

import (
  "log"

  "github.com/prongbang/excelmetadata"
  "github.com/prongbang/excelrecreator"
)

func main() {
  metadata, err := excelmetadata.QuickExtract("original.xlsx")
  if err != nil {
    log.Fatal(err)
  }

  err = excelrecreator.QuickRecreate(metadata, "recreated.xlsx")
  if err != nil {
    log.Fatal(err)
  }
}
{% endhighlight %}

จากตัวอย่างนี้จะเป็นการอ่านไฟล์ `original.xlsx` แล้วสร้างไฟล์ใหม่ชื่อ `recreated.xlsx` จาก metadata ที่ extract ได้

#### 2. Recreate จากไฟล์ JSON

{% highlight go %}
err := excelrecreator.QuickRecreateFromJSON("metadata.json", "output.xlsx")
if err != nil {
  log.Fatal(err)
}
{% endhighlight %}

วิธีนี้เหมาะกับกรณีที่เรา extract metadata เก็บไว้ก่อนแล้ว เช่น export จากระบบหนึ่ง แล้วค่อยนำ JSON ไปสร้าง Excel ในอีกระบบหนึ่ง

#### 3. Recreate พร้อม options

{% highlight go %}
options := &excelrecreator.Options{
  PreserveFormulas:       true,
  PreserveStyles:         true,
  PreserveDataValidation: true,
  PreserveImages:         true,
  SkipEmptyCells:         true,
  DefaultSheetName:       "Sheet",
}

recreator, err := excelrecreator.NewFromJSONFile("metadata.json", options)
if err != nil {
  log.Fatal(err)
}

if err := recreator.Recreate(); err != nil {
  log.Fatal(err)
}

if err := recreator.Save("recreated_with_options.xlsx"); err != nil {
  log.Fatal(err)
}
{% endhighlight %}

options เหล่านี้ช่วยควบคุมว่าไฟล์ที่ recreate จะเก็บรายละเอียดอะไรไว้บ้าง เช่น formula, style, image และ data validation

---

### Workflow แบบครบชุด

ตัวอย่างนี้คือ flow แบบ extract metadata, บันทึกเป็น JSON, แก้ไข metadata บางส่วน แล้ว recreate กลับเป็น Excel ใหม่

{% highlight go %}
package main

import (
  "encoding/json"
  "fmt"
  "log"
  "os"

  "github.com/prongbang/excelmetadata"
  "github.com/prongbang/excelrecreator"
)

func main() {
  fmt.Println("Extracting metadata...")

  metadata, err := excelmetadata.QuickExtract("original.xlsx")
  if err != nil {
    log.Fatal(err)
  }

  jsonData, err := json.MarshalIndent(metadata, "", "  ")
  if err != nil {
    log.Fatal(err)
  }

  if err := os.WriteFile("metadata.json", jsonData, 0644); err != nil {
    log.Fatal(err)
  }

  metadata.Properties.Title = "Modified Document"
  metadata.Properties.Creator = "ExcelRecreator"

  fmt.Println("Recreating Excel file...")

  if err := excelrecreator.QuickRecreate(metadata, "recreated.xlsx"); err != nil {
    log.Fatal(err)
  }

  fmt.Println("Success! Created recreated.xlsx")
}
{% endhighlight %}

---

### ใช้งานผ่าน CLI

ถ้าต้องการ extract metadata จาก command line สามารถใช้คำสั่ง

{% highlight shell %}
excelmetadata extract -o sample.metadata.json sample.xlsx
{% endhighlight %}

หรือถ้าต้องการ output เป็น Go file

{% highlight shell %}
excelmetadata extract -o sample_metadata.go sample.xlsx
{% endhighlight %}

---

### เหมาะกับงานแบบไหน

* แปลงไฟล์ Excel เป็น JSON เพื่อให้ระบบอื่นนำไปใช้งานต่อ
* ทำ metadata backup สำหรับไฟล์ Excel สำคัญ
* เปรียบเทียบโครงสร้าง Excel ระหว่าง version
* สร้าง template หรือ recreate ไฟล์ Excel จาก metadata เดิม
* ทำ batch processing จาก JSON metadata กลับเป็น `.xlsx`
* ตรวจสอบว่าไฟล์ Excel ที่รับเข้ามามีโครงสร้างตรงกับ template หรือไม่

---

### ข้อควรรู้

* `ExcelMetadata` รองรับไฟล์ `.xlsx`
* การ extract image จะทำให้ JSON มีขนาดใหญ่ขึ้น เพราะมี binary data
* `ExcelRecreator` ยังไม่รองรับ chart, pivot table และ VBA macro
* ถ้าไฟล์ใหญ่และมี style จำนวนมาก อาจใช้เวลามากขึ้น ควรเปิดเฉพาะ feature ที่จำเป็น

---

### สรุป

ถ้าต้องการอ่านไฟล์ Excel ให้ได้มากกว่าแค่ value ใน cell ให้ใช้ `ExcelMetadata` เพื่อดึงรายละเอียดของไฟล์ออกมาเป็น metadata หรือ JSON จากนั้นถ้าต้องการสร้างไฟล์ Excel กลับขึ้นมาใหม่จากข้อมูลชุดเดิม สามารถใช้ `ExcelRecreator` ต่อได้ทันที

ทั้งสองไลบรารีเหมาะกับงานที่ต้องการเก็บโครงสร้าง Excel อย่างเป็นระบบ เช่น backup, migration, diff, template generation หรือ batch recreate ไฟล์ Excel จาก JSON

สามารถอ่านรายละเอียดเพิ่มเติมได้ที่ [github.com/prongbang/excelmetadata](https://github.com/prongbang/excelmetadata) และ [github.com/prongbang/excelrecreator](https://github.com/prongbang/excelrecreator) ครับ
