---
layout: post
title:  "[Golang] มาเขียน RESTful API หรือ Microservice โดยใช้ Clean Architecture กัน"
short_description: "เพื่อรองรับความซับซ้อนที่จะเกิดขึ้นในอนาคต จำเป็นอย่างยิ่งที่จะต้องเอา Design Pattern ตัวใดตัวหนึ่งมาแก้ปัญหาในเรื่องนั้น ๆ ซึ่งโพสนี้เราจะมาใช้ Clean Architecture กัน ๆ"
date:   2019-01-09 21:26:00 +0700
categories: golang
tags: [golang]
cover_image: /assets/images/golang/5.png
author: "end try"
---

### ก่อนอื่นมาดู Architecture ของ Clen ก่อนเลย ตามภาพด้านล่าง

<br>

<img src="http://blog.cleancoder.com/uncle-bob/images/2012-08-13-the-clean-architecture/CleanArchitecture.jpg"/>

<center>ภาพจาก blog.cleancoder.com</center>

<br>

### เพื่อนำมาประยุกต์ใช้กับโปรเจ็คของเรา เราจึงจัดกลุ่มใหม่โดยแบ่งเป็น 3 Layer คือ
<br>

#### - Presentations Layer โดยประกอบไปด้วย

- Gateways, Presenters, Controllers เป็นส่วนของการประมวลผลเมื่อมี action มาจาก user หรือ machine โดยการทำ Route ของเว็บจะอยู่ส่วนนี้

#### - Domain Layer โดยประกอบไปด้วย

- Use Cases เป็นส่วนที่เก็บ Business Logic

#### - Data Layer โดยประกอบไปด้วย

- Repository เป็นส่วนที่ใช้จัดการกับ DataSource ให้มันอยู่เป็นที่เป็นทาง
- Frameworks & Drivers หรือ DataSource เป็นส่วนที่ใช้ในการติดต่อกับ Database, Microservice, Web Service เป็นต้น

### เริ่มวางโครงโปรเจ็ค
<br>

เพื่อให้ง่ายต่อการจัดการ เราจะสร้างส่วนของ Gateways, Domain, Data ภายใต้ folder ของ feature ที่เราจะทำ เช่น 
<br>

{% highlight shell %}
promotion   // ชื่อ feature
├── api
│   └── v1
│       └── promotion
│           ├── data
│           │   ├── datasource
│           │   │   └── promotion_datasource.go
│           │   └── repository
│           │       └── promotion_repos.go
│           ├── di
│           │   └── injector.go
│           ├── domain
│           │   └── promotion_usecase.go
│           ├── gateway
│			│	├── handler
│           │   │   └── promotion_handler.go
│			│	└── route
│           │       └── promotion_route.go
│           └── model
│               └── promotion.go
└── main.go
{% endhighlight %}

<br>

### มาเริ่มเขียนโค้ดกันเลยดีกว่า

- สร้าง Model ซึ่งใน go เราจะต้องสร้างเป็น struct และถ้าเรามีชุดข้อมูล json แบบนี้

{% highlight json %}
{
    "id": 1,
    "code": "sd-promo",
    "name": "Sunday promotion",
    "priority": 4,
    "exclusive": false,
    "used": 0,
    "couponBased": false,
    "rules": [],
    "actions": [],
    "createdAt": "2017-02-28T12:05:12+0100",
    "updatedAt": "2017-02-28T12:05:13+0100",
    "channels": [],
    "_links": {
        "self": {
            "href": "\/api\/v1\/promotions\/sd-promo"
        }
    }
}
{% endhighlight %}

และเพื่อความรวดเร็วในการสร้าง struct ของ golang แนะนำให้ใช้ Extension นี้ [js to golang](https://chrome.google.com/webstore/detail/js-to-golang/adibamafcjbolhaaccnhdebpncglaohb) ถ้า gen เสร็จแล้วเราก็จะได้แบบนี้

<br>
ตั้งชื่อไฟล์ว่า `promotion.go`

{% highlight golang %}
// Promotion is the model
type Promotion struct {
	ID          int           `json:"id" db:"id"`
	Code        string        `json:"code" db:"code"`
	Name        string        `json:"name" db:"name"`
	Priority    int           `json:"priority" db:"priority"`
	Exclusive   bool          `json:"exclusive" db:"exclusive"`
	Used        int           `json:"used" db:"used"`
	CouponBased bool          `json:"couponBased" db:"coupon_based"`
	Rules       []interface{} `json:"rules" db:"rules"`
	Actions     []interface{} `json:"actions" db:"actions"`
	CreatedAt   string        `json:"createdAt" db:"created_at"`
	UpdatedAt   string        `json:"updatedAt" db:"updated_at"`
	Channels    []interface{} `json:"channels" db:"channels"`
	Links       struct {
		Self struct {
			Href string `json:"href" db:"href"`
		} `json:"self" db:"self"`
	} `json:"_links" db:"_links"`
}
{% endhighlight %}

และเพื่อไม่ให้มัน Warning แนะนำให้ใส่ comment บน struct ของเราด้วยประมาณนี้ `// Promotion is the model`

- สร้าง DataSource ส่วนที่ใช้ติดต่อกับ Database, API, gRPC เป็นต้น

<br>
ตั้งชื่อไฟล์ว่า `promotion_datasource.go` ซึ่งใน Code จะมีอยู่หลายส่วนด้วยกันคือ
<br>1. Mock Database
{% highlight golang %}
// GetDatabaseMock is the Mock database in memory
func GetDatabaseMock() DatabaseHelper {
	return DatabaseHelper{
		Store: make(map[int]model.Promotion),
	}
}

// DatabaseHelper is the struct
type DatabaseHelper struct {
	Store map[int]model.Promotion
}
{% endhighlight %}
<br>2. สร้าง Interface ของ DataSource โดยเราจะกำหนดความสามารถของ DataSource ชุดนี้คือ 1. เพิ่มข้อมูลได้ 2. ดึงข้อมูลของโปรโมชั่นทั้งหมด 3. ดึงข้อมูลโปรโมชั่นตาม ID
{% highlight golang %}
// PromotionDataSource is the interface
type PromotionDataSource interface {
	Add(data *model.Promotion) error
	GetAll() ([]model.Promotion, error)
	Get(id int) (model.Promotion, error)
}
{% endhighlight %}
<br>3. Implement Interface ของ DataSource โดยมีการประกาศ struct ชื่อ promotionDataSource เพื่อใช้สำหรับ Implement interface ของ PromotionDataSource และเพื่อให้อยู่ในรูปแบบของ Encapsulated จึงจำเป็นต้องประกาศเป็น Private หรือตั้งชื่อตัวอักษรตัวแรกเป็นตัวพิมพ์เล็ก
{% highlight golang %}
// Encapsulated Implementation of DataSource Interface
type promotionDataSource struct {
	Db DatabaseHelper
}

// NewPromotionDataSource is the new promotion datasource
func NewPromotionDataSource(db DatabaseHelper) PromotionDataSource {
	return &promotionDataSource{
		Db: db,
	}
}

func (repo *promotionDataSource) Add(data *model.Promotion) error {

	repo.Db.Store[data.ID] = *data

	return nil
}

func (repo *promotionDataSource) GetAll() ([]model.Promotion, error) {

	data := []model.Promotion{}
	for _, value := range repo.Db.Store {
		data = append(data, value)
	}

	return data, nil
}

func (repo *promotionDataSource) Get(id int) (model.Promotion, error) {

	return repo.Db.Store[id], nil
}
{% endhighlight %}

- สร้าง Repository ซึ่งหลักการสร้างจะเหมือน ๆ กันกับการสร้าง DataSource จะต่างกันที่มีการรับค่า PromotionDataSource ที่เป็น interface ขึ้นอยู่กับการเขียนของแต่ละคน โดยมีโค้ดรวม ๆ ประมาณนี้

<br>
ตั้งชื่อไฟล์ว่า `promotion_repos.go`

{% highlight golang %}
// PromotionRepository is the interface
type PromotionRepository interface {
	Add(data *model.Promotion) error
	GetAll() ([]model.Promotion, error)
	Get(id int) (model.Promotion, error)
}

// Encapsulated Implementation of Repository Interface
type promotionRepository struct {
	Ds datasource.PromotionDataSource
}

// NewPromotionRepository is the function
func NewPromotionRepository(ds datasource.PromotionDataSource) PromotionRepository {
	return &promotionRepository{
		Ds: ds,
	}
}

func (repo *promotionRepository) Add(data *model.Promotion) error {

	return repo.Ds.Add(data)
}

func (repo *promotionRepository) GetAll() ([]model.Promotion, error) {

	return repo.Ds.GetAll()
}

func (repo *promotionRepository) Get(id int) (model.Promotion, error) {

	return repo.Ds.Get(id)
}
{% endhighlight %}

- สร้าง UseCase ซึ่งหลักการสร้างจะเหมือน ๆ กันกับการสร้าง DataSource จะต่างกันที่มีการรับค่า PromotionRepository ที่เป็น interface ขึ้นอยู่กับการเขียนของแต่ละคน โดยมีโค้ดรวม ๆ ประมาณนี้

<br>
ตั้งชื่อไฟล์ว่า `promotion_usecase.go`

{% highlight golang %}
// PromotionUseCase is the interface
type PromotionUseCase interface {
	Add(data *model.Promotion) error
	GetAll() ([]model.Promotion, error)
	Get(id int) (model.Promotion, error)
}

// Encapsulated Implementation of UseCase Interface
type promotionUseCase struct {
	Repo repository.PromotionRepository
}

// NewPromotionUseCase is the function new promotion use case
func NewPromotionUseCase(repo repository.PromotionRepository) PromotionUseCase {
	return &promotionUseCase{
		Repo: repo,
	}
}

func (uc *promotionUseCase) Add(data *model.Promotion) error {
	if err := uc.Repo.Add(data); err == nil {
		promo, err := uc.Get(data.ID)
		*data = promo

		return err
	}

	return fmt.Errorf("Not found")
}

func (uc *promotionUseCase) GetAll() ([]model.Promotion, error) {

	return uc.Repo.GetAll()
}

func (uc *promotionUseCase) Get(id int) (model.Promotion, error) {

	return uc.Repo.Get(id)
}
{% endhighlight %}

- สร้าง Gateway ในส่วนของ Handler จะเป็นส่วนที่ใช้จัดการกับข้อมูลที่ผู้ใช้ หรือว่า machine ได้ส่งข้อมูลมาให้ ซึ่งหลักการสร้างจะเหมือน ๆ กันกับการสร้าง DataSource จะต่างกันที่มีการรับค่า PromotionUseCase ที่เป็น interface ขึ้นอยู่กับการเขียนของแต่ละคน โดยมีโค้ดรวม ๆ ประมาณนี้

<br>
ตั้งชื่อไฟล์ว่า `promotion_handler.go`

{% highlight golang %}
// PromotionHandler is the interface
type PromotionHandler interface {
	Add(c echo.Context) error
	GetAll(c echo.Context) error
	Get(c echo.Context) error
}

// Encapsulated Implementation of Handler Interface
type promotionHandler struct {
	UseCase domain.PromotionUseCase
}

// NewPromotionHandler is the function new promotion handler
func NewPromotionHandler(useCase domain.PromotionUseCase) PromotionHandler {

	return &promotionHandler{
		UseCase: useCase,
	}
}

func (h *promotionHandler) Add(c echo.Context) error {
	var promotion model.Promotion
	if err := c.Bind(&promotion); err != nil {
		return c.JSON(http.StatusBadGateway, echo.Map{
			"message": "Data not found!",
		})
	}

	if err := h.UseCase.Add(&promotion); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"message": err,
		})
	}

	return c.JSON(http.StatusCreated, promotion)
}

func (h *promotionHandler) GetAll(c echo.Context) error {

	promotions, err := h.UseCase.GetAll()
	if err == nil {
		return c.JSON(http.StatusOK, promotions)
	}
	return c.JSON(http.StatusOK, []model.Promotion{})
}

func (h *promotionHandler) Get(c echo.Context) error {
	id := c.Param("id")
	if id != "" {
		idInt, iErr := strconv.Atoi(id)
		if idInt > 0 && iErr == nil {
			promotion, err := h.UseCase.Get(idInt)
			if err == nil {
				return c.JSON(http.StatusOK, promotion)
			}
			return c.JSON(http.StatusNotFound, err)
		}
	}
	return c.JSON(http.StatusBadGateway, echo.Map{
		"message": "Required parameter id",
	})
}
{% endhighlight %}

- สร้าง Gateway ในส่วนของ Route จะเป็นส่วนที่ใช้กำหนดเส้นทางของ API ว่าจะให้มีอะไรบ้าง ซึ่งหลักการสร้างจะเหมือน ๆ กันกับการสร้าง DataSource จะต่างกันที่มีการรับค่า PromotionHandler ที่เป็น interface ขึ้นอยู่กับการเขียนของแต่ละคน โดยมีโค้ดรวม ๆ ประมาณนี้

<br>
ตั้งชื่อไฟล์ว่า `promotion_route.go`

{% highlight golang %}
// PromotionRoute is the interface
type PromotionRoute interface {
	Initial(e *echo.Echo)
}

type promotionRoute struct {
	Handle handler.PromotionHandler
}

// NewPromotionRoute is the function new promotion route
func NewPromotionRoute(handler handler.PromotionHandler) PromotionRoute {
	return &promotionRoute{
		Handle: handler,
	}
}

func (r *promotionRoute) Initial(e *echo.Echo) {
	v1 := e.Group("/api/v1")
	v1.GET("/promotion", r.Handle.GetAll)
	v1.POST("/promotion", r.Handle.Add)
	v1.GET("/promotion/:id", r.Handle.Get)
}
{% endhighlight %}

- สร้าง Injector หรือ Dependencies Injection เพื่อ Provide ค่าให้กับแต่ละ method ได้นำไปใช้ เมื่อเขียน Provide มาทั้งหมดก็จะได้ประมาณนี้

{% highlight golang %}
// ProvideDatabaseHelper is the Provide Database
func ProvideDatabaseHelper() datasource.DatabaseHelper {

	return datasource.GetDatabaseMock()
}

// ProvidePromotionDataSource is the Provide DataSource
func ProvidePromotionDataSource() datasource.PromotionDataSource {

	return datasource.NewPromotionDataSource(ProvideDatabaseHelper())
}

// ProvidePromotionRepository is the Provide Repository
func ProvidePromotionRepository() repository.PromotionRepository {

	return repository.NewPromotionRepository(ProvidePromotionDataSource())
}

// ProvidePromotionUseCase is the Provide UseCase
func ProvidePromotionUseCase() domain.PromotionUseCase {

	return domain.NewPromotionUseCase(ProvidePromotionRepository())
}

// ProvidePromotionHandler is the Provide Handler
func ProvidePromotionHandler() handler.PromotionHandler {

	return handler.NewPromotionHandler(ProvidePromotionUseCase())
}
{% endhighlight %}

- เรียกใช้งานใน main.go ประมาณนี้

{% highlight golang %}
func main() {
	e := echo.New()

	// Routes
	route.NewPromotionRoute(di.ProvidePromotionHandler()).Initial(e)

	// Listener
	e.Logger.Fatal(e.Start(":1323"))
}
{% endhighlight %}

เพียงเท่านี้ก็เรียบร้อยสำหรับการนำ Clean Architechture มาประยุกต์เพื่อใช้งานกับโปรเจ็คของเรา โพสนี้อาจจะเขียนอธิบายน้อยไปหน่อย ๆ หากผิดพลาดประการใด ขออภัย ณ ที่นั้นด้วยครับ และตัวอย่าง [Source Code](https://github.com/prongbang/goclean) สามารถเข้าไป Download มาเล่นได้เลย ๆ

<br>