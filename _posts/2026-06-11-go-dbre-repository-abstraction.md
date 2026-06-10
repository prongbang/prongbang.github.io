---
layout: post
title: "[Golang] การใช้งาน dbre ทำ Repository กลางสำหรับ Bun และ Gorm"
short_description: "แนะนำการใช้งาน dreamph/dbre ไลบรารี Go สำหรับทำ repository abstraction ด้วย generic DB[T], adapter สำหรับ Bun/Gorm/ClickHouse, WhereBuilder, pagination, raw query และ transaction"
date: 2026-06-11 11:00:00 +0700
categories: [golang]
tags: [golang]
cover_image: /assets/images/golang/21.png
author: "Devไปวันๆ"
---

เวลาเขียน Go แล้วต้องทำ CRUD กับฐานข้อมูล สิ่งที่มักจะซ้ำ ๆ คือ Repository แต่ละตัวจะมีเมธอดคล้ายกันมาก เช่น `Create`, `Update`, `FindByPK`, `Delete`, `List`, `Count` หรือ query แบบมีเงื่อนไข

ถ้าโปรเจคใช้ ORM/Query Builder ตัวเดียวตลอดก็ยังพอจัดการได้ แต่พออยากให้ชั้น use case ไม่ผูกกับ Bun หรือ Gorm โดยตรง เราจะเริ่มอยากได้ interface กลางสักตัวที่ทำให้ repository คุยกับ database ได้แบบเดิม แต่เปลี่ยน adapter ได้ง่ายขึ้น

`dbre` เป็น library ที่ช่วยจัดระเบียบตรงนี้ โดยแกนหลักคือ generic interface `DB[T]` ที่รวม operation พื้นฐานสำหรับ entity หนึ่งตัว และมี adapter ให้ใช้งานกับ Bun, Gorm รวมถึง ClickHouse

Repository: [github.com/dreamph/dbre](https://github.com/dreamph/dbre)

## dbre ทำอะไร

โครงสร้างหลักของ `dbre` อยู่ที่ interface `DB[T any]` ซึ่งเป็น contract กลางสำหรับ query entity แต่ละตัว

{% highlight go %}
type DB[T any] interface {
	WithTx(tx AppIDB) DB[T]

	Create(ctx context.Context, obj *T) (int64, error)
	CreateList(ctx context.Context, objs *[]T) (int64, error)

	Update(ctx context.Context, obj *T) (int64, error)
	UpdateForce(ctx context.Context, obj *T) (int64, error)
	UpdateList(ctx context.Context, objs *[]T) (int64, error)

	Upsert(ctx context.Context, obj *T) (int64, error)
	UpsertList(ctx context.Context, objs *[]T) (int64, error)

	FindByPK(ctx context.Context, obj *T) (*T, error)
	FindOne(ctx context.Context, params []interface{}) (*T, error)
	FindOneWhere(ctx context.Context, whereCauses []WhereCause) (*T, error)

	Delete(ctx context.Context, obj *T) (int64, error)
	DeleteList(ctx context.Context, objs *[]T) (int64, error)
	DeleteWhere(ctx context.Context, whereCauses []WhereCause) (int64, error)

	Count(ctx context.Context) (int64, error)
	CountWhere(ctx context.Context, whereCauses []WhereCause) (int64, error)

	List(ctx context.Context, limit *Limit) (*[]T, int64, error)
	ListWhere(ctx context.Context, whereCauses []WhereCause, limit *Limit) (*[]T, int64, error)
	QueryListWhere(ctx context.Context, whereCauses []WhereCause, limit *Limit, sort []string) (*[]T, int64, error)

	RawExec(ctx context.Context, sqlQuery string, params []interface{}) (int64, error)
	RawQuery(ctx context.Context, sql string, params []interface{}, resultPtr interface{}) error
}
{% endhighlight %}

แนวคิดคือให้ use case หรือ repository ชั้นบนมองเห็นแค่ `dbre.DB[Entity]` ส่วนข้างล่างจะใช้ Bun หรือ Gorm ก็เปลี่ยนตอนประกอบ dependency

## ติดตั้ง

เริ่มจากดึง package หลักก่อน

{% highlight bash %}
go get github.com/dreamph/dbre
{% endhighlight %}

จากนั้นเลือก adapter ที่จะใช้ เช่น Bun หรือ Gorm

{% highlight go %}
import (
	"github.com/dreamph/dbre"
	dbrebun "github.com/dreamph/dbre/adapters/bun"
	bunpg "github.com/dreamph/dbre/adapters/bun/connectors/pg"

	dbregorm "github.com/dreamph/dbre/adapters/gorm"
	gormpg "github.com/dreamph/dbre/adapters/gorm/connectors/pg"
)
{% endhighlight %}

## สร้าง Model

ตัวอย่างใน repo ใช้ `Country` เป็น entity และใส่ tag ให้ทั้ง Bun และ Gorm เพื่อให้ model ตัวเดียวใช้งานกับ adapter คนละตัวได้

{% highlight go %}
package domain

import (
	"github.com/uptrace/bun"
	"gopkg.in/guregu/null.v4"
)

type Country struct {
	bun.BaseModel `bun:"table:country,alias:c" swaggerignore:"true" json:"-"`

	Id          string      `bun:"id,pk" gorm:"primary_key;column:id;type:VARCHAR;" json:"id"`
	Code        string      `bun:"code" gorm:"column:code;type:VARCHAR;" json:"code"`
	Name        string      `bun:"name" gorm:"column:name;type:VARCHAR;" json:"name"`
	Status      int32       `bun:"status" gorm:"column:status;type:INTEGER;" json:"status"`
	Description null.String `bun:"description" gorm:"column:description;type:VARCHAR;" json:"description"`
	OtherField  null.String `bun:"-" gorm:"-" json:"otherField"`
}

func (c *Country) TableName() string {
	return "country"
}
{% endhighlight %}

จุดสำคัญคือ field ที่ใช้กับ database ต้อง map column ให้ถูก เพราะ `dbre` ไม่ได้สร้าง schema magic ให้เราเอง มันทำหน้าที่เป็น abstraction ให้ adapter ไปเรียก ORM/Query Builder ต่ออีกที

## เชื่อมต่อด้วย Bun

ถ้าใช้ Bun กับ PostgreSQL ใน repo มี connector `adapters/bun/connectors/pg` เตรียมไว้ให้แล้ว

{% highlight go %}
func newBunDB(logger bunpg.Logger) (dbre.AppIDB, dbre.DBTx, error) {
	bunDB, err := bunpg.Connect(&bunpg.Options{
		Host:           "127.0.0.1",
		Port:           "5432",
		DBName:         "dream",
		User:           "dream",
		Password:       "password",
		ConnectTimeout: 2000,
		Logger:         logger,
	})
	if err != nil {
		return nil, nil, err
	}

	appDB := dbrebun.NewIDB(bunDB)
	dbTx := dbrebun.NewDBTx(bunDB)

	return appDB, dbTx, nil
}
{% endhighlight %}

`AppIDB` เป็น interface เล็ก ๆ ที่ซ่อน database object จริงไว้ข้างใน ส่วน `DBTx` ใช้สำหรับเปิด transaction ผ่าน adapter

## เชื่อมต่อด้วย Gorm

ฝั่ง Gorm ก็มี connector PostgreSQL เช่นกัน โดยรับ option ใกล้เคียงกัน และสามารถส่ง plugin เพิ่มได้

{% highlight go %}
func newGormDB(logger gormpg.Logger) (dbre.AppIDB, dbre.DBTx, error) {
	gormDB, err := gormpg.Connect(&gormpg.Options{
		Host:           "127.0.0.1",
		Port:           "5432",
		DBName:         "dream",
		User:           "dream",
		Password:       "password",
		ConnectTimeout: 2000,
		Logger:         logger,
	})
	if err != nil {
		return nil, nil, err
	}

	appDB := dbregorm.NewIDB(gormDB)
	dbTx := dbregorm.NewDBTx(gormDB)

	return appDB, dbTx, nil
}
{% endhighlight %}

พอได้ `appDB` แล้ว ขั้นต่อไปคือสร้าง query object จาก adapter ที่เลือก

## สร้าง DB[T]

ถ้าใช้ Bun

{% highlight go %}
countryDB := dbrebun.New[domain.Country](appDB)
{% endhighlight %}

ถ้าใช้ Gorm

{% highlight go %}
countryDB := dbregorm.New[domain.Country](appDB)
{% endhighlight %}

หลังจากนี้ code ชั้นบนสามารถเรียกผ่าน `countryDB` ด้วย method ชุดเดียวกันได้

## CRUD พื้นฐาน

ตัวอย่างการเพิ่มข้อมูล

{% highlight go %}
country := &domain.Country{
	Id:     "TH",
	Code:   "TH",
	Name:   "Thailand",
	Status: 1,
}

rowsAffected, err := countryDB.Create(ctx, country)
if err != nil {
	return err
}

fmt.Println(rowsAffected)
{% endhighlight %}

ค้นหาด้วย primary key

{% highlight go %}
country, err := countryDB.FindByPK(ctx, &domain.Country{
	Id: "TH",
})
if err != nil {
	return err
}

fmt.Println(country.Name)
{% endhighlight %}

แก้ไขข้อมูล

{% highlight go %}
country.Name = "Kingdom of Thailand"

_, err = countryDB.Update(ctx, country)
if err != nil {
	return err
}
{% endhighlight %}

ถ้าต้องการ update แบบไม่ข้าม zero value ให้ใช้ `UpdateForce`

{% highlight go %}
country.Status = 0

_, err = countryDB.UpdateForce(ctx, country)
if err != nil {
	return err
}
{% endhighlight %}

ฝั่ง Bun adapter ตัว `Update` จะใช้ `OmitZero()` ส่วน `UpdateForce` จะ update ตาม model โดยไม่ omit zero value ขณะที่ฝั่ง Gorm adapter ใช้ `Updates()` และ `Select("*").Updates()` ตามลำดับ

ลบข้อมูล

{% highlight go %}
_, err = countryDB.Delete(ctx, &domain.Country{
	Id: "TH",
})
if err != nil {
	return err
}
{% endhighlight %}

และถ้าต้องการ insert หรือ update เมื่อ key ซ้ำ ใช้ `Upsert`

{% highlight go %}
_, err = countryDB.Upsert(ctx, &domain.Country{
	Id:     "TH",
	Code:   "TH",
	Name:   "Thailand",
	Status: 1,
})
if err != nil {
	return err
}
{% endhighlight %}

ใน Bun adapter ตอนทำ `UpsertList` มี logic แยกตาม database dialect โดยรองรับ PostgreSQL, MySQL และ SQLite ส่วน MSSQL/Oracle จะ return error ว่ายังไม่ support

## Query ด้วย WhereBuilder

`dbre` มี `WhereBuilder` ไว้ช่วยประกอบเงื่อนไขแบบ AND/OR โดยยังให้เราเขียน SQL fragment เองและส่ง parameter แยกออกมา

{% highlight go %}
where := dbre.NewWhereBuilder()
where.
	Where("status = ?", 1).
	WhereOr("code = ?", "TH")

country, err := countryDB.FindOneWhere(ctx, where.WhereCauses())
if err != nil {
	return err
}

fmt.Println(country.Name)
{% endhighlight %}

ถ้า query เป็น list พร้อม pagination ให้ส่ง `Limit`

{% highlight go %}
where := dbre.NewWhereBuilder()
where.Where("status = ?", 1)

countries, total, err := countryDB.ListWhere(ctx, where.WhereCauses(), &dbre.Limit{
	Offset:   0,
	PageSize: 10,
})
if err != nil {
	return err
}

fmt.Println(total, len(*countries))
{% endhighlight %}

ถ้าต้องการ sort ไปพร้อมกัน ใช้ `QueryListWhere`

{% highlight go %}
countries, total, err := countryDB.QueryListWhere(
	ctx,
	where.WhereCauses(),
	&dbre.Limit{Offset: 0, PageSize: 10},
	[]string{"name ASC"},
)
if err != nil {
	return err
}

fmt.Println(total, countries)
{% endhighlight %}

## Sort แบบ Mapping Field

อีก utility ที่มีประโยชน์คือ `SortSQL` ซึ่งช่วย map field จาก request ไปเป็น column จริง

{% highlight go %}
sortSQL, err := dbre.SortSQL(&dbre.SortParam{
	SortFieldMapping: map[string]string{
		"name":      "name",
		"createdAt": "created_at",
	},
	Sort: &dbre.Sort{
		SortBy:        "name",
		SortDirection: dbre.ASC,
	},
	DefaultSort: &dbre.Sort{
		SortBy:        "createdAt",
		SortDirection: dbre.DESC,
	},
})
if err != nil {
	return err
}

countries, total, err := countryDB.QueryListWhere(
	ctx,
	where.WhereCauses(),
	&dbre.Limit{Offset: 0, PageSize: 10},
	[]string{sortSQL},
)
{% endhighlight %}

ถ้า client ส่ง `sortBy` ที่ไม่ได้อยู่ใน `SortFieldMapping` ตัว helper จะ return error กลับมา ทำให้เราไม่ต้องเอาชื่อ field จาก request ไปต่อ SQL ตรง ๆ

## Raw Query และ SQLQueryBuilder

บางงานไม่เหมาะกับ CRUD method เช่น report, aggregate หรือ query ที่ join หลายตาราง ตรงนี้ใช้ `RawQuery` ได้

{% highlight go %}
type CountryReport struct {
	Code  string `bun:"code" json:"code"`
	Name  string `bun:"name" json:"name"`
	Total int64  `bun:"total" json:"total"`
}

builder := dbre.NewSQLQueryBuilder()
builder.AddQuery("SELECT code, name, COUNT(*) AS total FROM country")
builder.AddQueryWithParam("WHERE status = ?", 1)
builder.AddQuery("GROUP BY code, name")

var reports []CountryReport
err := countryDB.RawQuery(
	ctx,
	builder.ToSQLQuery(),
	builder.GetQueryParams(),
	&reports,
)
if err != nil {
	return err
}
{% endhighlight %}

หรือถ้าเป็นคำสั่งที่ไม่ต้อง map result ใช้ `RawExec`

{% highlight go %}
rowsAffected, err := countryDB.RawExec(
	ctx,
	"UPDATE country SET status = ? WHERE code = ?",
	[]interface{}{0, "TH"},
)
if err != nil {
	return err
}

fmt.Println(rowsAffected)
{% endhighlight %}

## Transaction

`DBTx` มี method `WithTx` สำหรับเปิด transaction แล้วส่ง `AppIDB` ของ transaction เข้า callback

{% highlight go %}
err := dbTx.WithTx(ctx, func(ctx context.Context, txDB dbre.AppIDB) error {
	txCountryDB := countryDB.WithTx(txDB)

	_, err := txCountryDB.Create(ctx, &domain.Country{
		Id:     "JP",
		Code:   "JP",
		Name:   "Japan",
		Status: 1,
	})
	if err != nil {
		return err
	}

	_, err = txCountryDB.Create(ctx, &domain.Country{
		Id:     "SG",
		Code:   "SG",
		Name:   "Singapore",
		Status: 1,
	})
	return err
})
if err != nil {
	return err
}
{% endhighlight %}

จากโค้ด adapter ทั้ง Bun และ Gorm จะ rollback เมื่อ callback return error หรือ panic และจะ commit เมื่อทุกอย่างผ่าน

## ตั้งค่า Connection Pool

ใน package หลักมีค่า default สำหรับ connection pool

{% highlight go %}
var DbPoolDefault = &DbPoolOptions{
	MaxIdleConns:    5,
	MaxOpenConns:    10,
	ConnMaxLifetime: 10 * time.Minute,
}
{% endhighlight %}

ถ้าต้องการกำหนดเอง สามารถส่ง `PoolOptions` เข้า connector ได้

{% highlight go %}
bunDB, err := bunpg.Connect(&bunpg.Options{
	Host:     "127.0.0.1",
	Port:     "5432",
	DBName:   "dream",
	User:     "dream",
	Password: "password",
	PoolOptions: &dbre.DbPoolOptions{
		MaxIdleConns:    10,
		MaxOpenConns:    50,
		ConnMaxLifetime: 30 * time.Minute,
	},
})
{% endhighlight %}

connector จะเรียก `dbre.SetConnectionsPool` เพื่อ set ค่าเหล่านี้ให้ `*sql.DB`

## เอาไปวางใน Clean Architecture

รูปแบบที่ใช้งานจริงคือให้ repository รับ `dbre.DB[T]` แทนการรับ Bun/Gorm โดยตรง

{% highlight go %}
type CountryRepository interface {
	FindActive(ctx context.Context, limit *dbre.Limit) (*[]domain.Country, int64, error)
}

type countryRepository struct {
	db dbre.DB[domain.Country]
}

func NewCountryRepository(db dbre.DB[domain.Country]) CountryRepository {
	return &countryRepository{db: db}
}

func (r *countryRepository) FindActive(ctx context.Context, limit *dbre.Limit) (*[]domain.Country, int64, error) {
	where := dbre.NewWhereBuilder()
	where.Where("status = ?", 1)

	return r.db.QueryListWhere(ctx, where.WhereCauses(), limit, []string{"name ASC"})
}
{% endhighlight %}

ตอนประกอบ dependency ค่อยเลือก adapter

{% highlight go %}
appDB, _, err := newBunDB(logger)
if err != nil {
	return err
}

countryDB := dbrebun.New[domain.Country](appDB)
countryRepo := NewCountryRepository(countryDB)
{% endhighlight %}

ถ้าวันหนึ่งอยากเปลี่ยนจาก Bun เป็น Gorm ก็เปลี่ยนเฉพาะจุดประกอบ dependency และ tag/model ให้พร้อม ส่วน use case ที่เรียก repository ไม่ต้องรู้รายละเอียดข้างใน

## ข้อควรระวัง

- `WhereBuilder` ยังรับ SQL fragment จากเราเอง ดังนั้นควรใช้ placeholder และส่ง parameter แยกเสมอ
- model ต้องมี tag ที่ถูกกับ adapter ที่เลือก เช่น Bun ใช้ `bun` tag ส่วน Gorm ใช้ `gorm` tag
- behavior บางอย่างขึ้นกับ adapter เช่น update zero value หรือ upsert ของแต่ละ database dialect
- ใน repo มี ClickHouse adapter ด้วย แต่ตัวอย่างใน README หลักเน้น Bun/Gorm กับ PostgreSQL
- `dbre` เหมาะกับ CRUD/repository pattern ถ้า query มี business logic ซับซ้อนมาก อาจต้องแยก method เฉพาะและใช้ `RawQuery` หรือ query builder ของ adapter โดยตรง

## สรุป

`dreamph/dbre` เป็น library ที่ช่วยทำ repository abstraction ให้ Go โดยใช้ generic `DB[T]` เป็น interface กลาง แล้วให้ adapter ของ Bun/Gorm/ClickHouse เป็นคน implement รายละเอียดการคุยกับ database

จุดที่น่าใช้คือ CRUD method มาครบ, มี helper สำหรับ where/limit/sort, รองรับ raw query และมี transaction wrapper ให้ใช้ pattern เดียวกันทั้ง Bun และ Gorm

ถ้าโปรเจคมีหลาย service ที่เขียน repository ซ้ำ ๆ หรืออยากให้ use case ไม่ผูกกับ ORM มากเกินไป `dbre` เป็นอีกตัวที่ช่วยทำให้ code สะอาดขึ้นแบบไม่ต้องสร้าง abstraction เองทุกโปรเจค
