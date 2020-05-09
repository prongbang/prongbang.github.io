---
layout: post
title:  "[Golang] หาส่วนของ code ที่ไม่ถูกทดสอบด้วย Test Coverage กันเถอะ"
short_description: "เป็นเครื่องมือที่ช่วยทำให้นักพัฒนาได้เห็นว่าส่วนไหนที่ยังไม่ได้เขียน Test บ้าง มาดูว่าต้องทำยังไง"
date:   2019-01-15 24:09:00 +0700
categories: golang
tags: [golang]
cover_image: /assets/images/golang/6.png
author: "end try"
---

### เริ่มกันเลยดีกว่า

<br>

ในโพสนี้เราจะมาเขียน API ดึงค่า PM 2.5 จาก [air4thai.pcd.go.th](http://air4thai.pcd.go.th/forappV2/getAQI_JSON.php) กัน โดยเริ่มจากวางโครงโปรเจคกันก่อนซึ่งในตัวอย่างนี้ เราจะวางโครงประมาณนี้ (ขึ้นอยู่กับความถนัดของแต่ละคนนะครับ)

{% highlight bash %}
go-testcov
├── Makefile
├── main.go
└── pm25
    ├── core
    │   ├── http_request.go
    │   └── http_request_test.go
    ├── data
    │   ├── datasource
    │   │   ├── datasource.go
    │   │   └── datasource_test.go
    │   └── repository
    │       └── repository.go
    ├── di
    │   └── injector.go
    ├── domain
    │   └── usecase.go
    ├── gateway
    │   ├── handler
    │   │   ├── handler.go
    │   │   └── handler_test.go
    │   └── route
    │       └── route.go
    └── model
        └── pm.go
{% endhighlight %}

- ก่อนอื่นให้สร้าง Makefile ก่อนเพื่อง่ายต่อการ run คำสั่งต่าง ตามนี้

{% highlight bash %}
run:
	go run main.go
	
cover:
	go test -cover ./... -coverprofile=cover.out
	go tool cover -html=cover.out -o coverage.html

test:
	go test -v ./...
{% endhighlight %}

- ต่อไปก็สร้างส่วนของ datasource กันก่อน โดยสร้างไฟล์ชื่อ `datasource.go` ซึ่งทำหน้าที่ดึงข้อมูลจาก API จากที่อื่นโดยเขียน code ประมาณนี้

{% highlight golang %}
package datasource

import (
	"github.com/prongbang/go-testcov/pm25/core"
	"github.com/prongbang/go-testcov/pm25/model"
)

// PmDataSource is the interface
type PmDataSource interface {
	GetAQI(url string) (model.Aqi, error)
}

type pmDataSource struct {
	Request core.HTTPRequest
}

// NewPmDataSource is new instance
func NewPmDataSource(req core.HTTPRequest) PmDataSource {
	return &pmDataSource{
		Request: req,
	}
}

func (ds *pmDataSource) GetAQI(url string) (model.Aqi, error) {

	response := new(model.Aqi)

	err := ds.Request.GetJSON(url, response)

	return *response, err
}
{% endhighlight %}

จากนั้นก็ทำการเขียน test ในส่วนของ datasource โดยตั้งชื่อว่า `datasource_test.go` โดยเราจะเขียน test ประมาณนี้

{% highlight golang %}
package datasource_test

import (
	"encoding/json"
	"testing"

	"github.com/prongbang/go-testcov/pm25/core"
)

func responseMock() string {
	return `{ "stations": [{ "stationID": "03t", "nameTH": "ริมถนนทางหลวงหมายเลข 3902 ", "nameEN": "Highway NO.3902 km.13 +600", "areaTH": "ริมถนนกาญจนาภิเษก เขตบางขุนเทียน, กรุงเทพฯ", "areaEN": "Kanchanaphisek Rd, Bang Khun Thian, Bangkok", "stationType": "GROUND", "lat": "13.636514", "long": "100.414262", "AQILast": { "date": "2019-02-17", "time": "14:00", "PM25": { "color_id": "2", "aqi": "26", "value": "26" }, "PM10": { "color_id": "2", "aqi": "26", "value": "51" }, "O3": { "color_id": "1", "aqi": "8", "value": "11" }, "CO": { "color_id": "1", "aqi": "3", "value": "0.54" }, "NO2": { "color_id": "1", "aqi": "13", "value": "30" }, "SO2": { "color_id": "0", "aqi": "-999", "value": "-1" }, "AQI": { "color_id": "2", "aqi": "26", "param": "PM10" } } }] }`
}

type httpRequestMock struct {
}

func NewHTTPRequestMock() core.HTTPRequest {
	return &httpRequestMock{}
}

func (h *httpRequestMock) GetJSON(url string, target interface{}) error {

	return json.Unmarshal([]byte(responseMock()), target)
}

func TestGetAQI(t *testing.T) {

}
{% endhighlight %}

จากนั้นลอง run คำสั่งนี้ เพื่อ test coverage

{% highlight base %}
$ make cover
{% endhighlight %}

เมื่อ run เสร็จแล้วมันจะได้ไฟล์ที่ชื่อว่า `coverage.html` เมื่อลองเปิดดูบน browser ก็จะเห็นว่ามีส่วนของ code ที่เป็นสีแดงอยู่นั่นก็เพราะว่าเรายังไม่ได้เขียน test นั่นเอง ตามภาพด้านล่าง

<br>

<img src="/assets/images/golang/6-1.png"/>

<br>

จากนั้นลองเพิ่ม code ส่วนนี้เข้าไปในฟังก์ชัน `TestGetAQI` ตามนี้

{% highlight base %}
func TestGetAQI(t *testing.T) {

	req := NewHTTPRequestMock()
	dataSource := datasource.NewPmDataSource(req)
	response, _ := dataSource.GetAQI("http://air4thai.pcd.go.th/forappV2/getAQI_JSON.php")

	if len(response.Stations) == 0 {
		t.Error("Is Empty")
	}
}
{% endhighlight %}

แล้วลอง run test coverage ใหม่

{% highlight base %}
$ make cover
{% endhighlight %}

แล้วลอง Refresh browser ใหม่ก็จะเห็นว่ามี code ที่เป็นสีเขียวทั้งหมดแล้วก็แสดงว่าเราเขียน test ครอบคลุมแล้วตามรูปด้านล่าง แต่ถ้าหากมีสีแดงกับสีเขียวก็แสดงว่าเรายังเขียน test ไม่ครอบคลุม

<br>

<img src="/assets/images/golang/6-2.png"/>

<br>

ส่วนการ test ส่วนอื่น ๆ สามารถดาวน์โหลด [Source Code](http://raboninco.com/XBni) ได้ที่นี่ หวังว่าอาจจะเป็นแนวทางให้กับ Gopher ได้บ้าง ผิดถูกยังไงขออภัย ณ ที่นั่นด้วย และสามารถอ่านข้อมูลเพิ่มเติมได้ที่ [https://blog.golang.org/cover](https://blog.golang.org/cover)

<br>
<br>












