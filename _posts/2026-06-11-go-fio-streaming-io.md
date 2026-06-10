---
layout: post
title: "[Golang] การใช้งาน fio จัดการ Streaming I/O แบบมี Session และ Auto Cleanup"
short_description: "แนะนำการใช้งาน dreamph/fio ไลบรารี Go สำหรับจัดการ streaming I/O ด้วย source type-safe, memory/file storage, session cleanup, reusable input, ReaderAt conversion และ helper สำหรับ copy/read/process"
date: 2026-06-11 10:00:00 +0700
categories: [golang]
tags: [golang]
cover_image: /assets/images/golang/20.png
author: "Devไปวันๆ"
---

### fio คืออะไร

`fio` เป็น package สำหรับจัดการงาน streaming I/O ใน Go ให้เขียนโค้ดชุดเดียวแล้วเลือกได้ว่าจะเก็บ output ไว้ใน memory หรือ temp file โดยมี `IoManager` และ `IoSession` ช่วยจัดการ temp directory และ cleanup ให้อัตโนมัติ

จาก source ปัจจุบัน module คือ

{% highlight text %}
github.com/dreamph/fio
{% endhighlight %}

และ `go.mod` ระบุว่าใช้ Go 1.24

จุดที่น่าสนใจคือ source input ถูกห่อเป็น type-safe `Source` เช่น file path, URL, bytes, reader, multipart file หรือ output/input เดิม แล้วเอาไปใช้กับ API เดียวกันได้ เช่น `Copy`, `Read`, `Process`, `DoOut`, `ToReaderAt`

---

### ติดตั้ง

ติดตั้งด้วยคำสั่ง

{% highlight shell %}
go get github.com/dreamph/fio
{% endhighlight %}

แล้ว import

{% highlight go %}
import "github.com/dreamph/fio"
{% endhighlight %}

---

### สร้าง IoManager และ Session

เริ่มจากสร้าง manager โดยเลือก base temp directory และ storage backend

{% highlight go %}
mgr, err := fio.NewIoManager("./temp", fio.Memory)
if err != nil {
	panic(err)
}
defer mgr.Cleanup()

ses, err := mgr.NewSession()
if err != nil {
	panic(err)
}
defer ses.Cleanup()

ctx := fio.WithSession(context.Background(), ses)
{% endhighlight %}

`IoManager` ใช้สร้าง session และ cleanup base directory ส่วน `IoSession` ใช้แทน scope ของ operation หนึ่ง ๆ เมื่อเรียก `ses.Cleanup()` output หรือ temp file ที่ session สร้างไว้จะถูกล้างให้

---

### เลือก Memory หรือ File Storage

`fio` มี storage type หลัก 2 แบบ

{% highlight go %}
fio.Memory
fio.File
{% endhighlight %}

ถ้าใช้ memory storage output จะเก็บใน buffer แต่ถ้าใช้ file storage output จะเป็น temp file ใน session directory

{% highlight go %}
mgr, _ := fio.NewIoManager("./temp", fio.File)
ses, _ := mgr.NewSession()
ctx := fio.WithSession(context.Background(), ses)
{% endhighlight %}

ถ้าต้องการเริ่มจาก memory แต่ให้สลับเป็น file เมื่อขนาดเกิน threshold ใช้ `WithThreshold`

{% highlight go %}
mgr, _ := fio.NewIoManager(
	"./temp",
	fio.Memory,
	fio.WithThreshold(10*fio.MB(1)),
)
{% endhighlight %}

จาก source `resolveStorageType` จะดู `sizeHint` แล้วเลือก file เมื่อขนาดมากกว่าหรือเท่ากับ threshold ที่กำหนดไว้

---

### Copy แบบง่าย

ตัวอย่าง copy file เป็น output

{% highlight go %}
out, err := fio.Copy(
	ctx,
	fio.PathSource("input.txt"),
	fio.Out(fio.Txt),
)
if err != nil {
	panic(err)
}

data, err := out.Bytes()
if err != nil {
	panic(err)
}

fmt.Println(string(data))
{% endhighlight %}

ข้อดีคือไม่ต้องสนใจว่า output อยู่ใน memory หรือ file เพราะ `Output.Bytes()` และ `Output.OpenReader()` ใช้ API เดียวกัน

---

### Source Types

ใน source ของ `fio.go` constructor ของ `Source` มีหลายแบบ

{% highlight go %}
fio.PathSource("/path/to/file.txt")
fio.URLSource("https://example.com/file.txt")
fio.BytesSource([]byte("hello"))
fio.ReaderSource(reader)
fio.ReadCloserSource(readCloser)
fio.FileSource(file)
fio.MultipartSource(fileHeader)
fio.OutputSource(output)
fio.InputSource(input)
{% endhighlight %}

แต่ละ source จะเปิดออกมาเป็น `io.ReadCloser` พร้อม metadata เช่น size, kind และ path ทำให้ function อย่าง `Read`, `Copy`, `Process` รับ input ได้หลายรูปแบบโดยไม่ต้องแตก if/else เอง

---

### อ่านข้อมูลด้วย Read

ถ้าอยาก consume input อย่างเดียว ใช้ `Read`

{% highlight go %}
err := fio.Read(ctx, fio.PathSource("data.json"), func(r io.Reader) error {
	var data MyData
	if err := json.NewDecoder(r).Decode(&data); err != nil {
		return err
	}

	fmt.Println(data)
	return nil
})
{% endhighlight %}

ถ้าต้องการ return result ออกมาด้วย ใช้ generic `ReadResult`

{% highlight go %}
result, err := fio.ReadResult(ctx, fio.BytesSource([]byte("hello")), func(r io.Reader) (*string, error) {
	b, err := io.ReadAll(r)
	if err != nil {
		return nil, err
	}

	s := strings.ToUpper(string(b))
	return &s, nil
})
{% endhighlight %}

จาก source `ReadResult[T]` จะใช้ `Do` และ `Scope` เพื่อเปิด source แล้ว cleanup หลังใช้งาน

---

### Process Input เป็น Output

ถ้าอยากแปลง input ไปเขียน output ใช้ `Process`

{% highlight go %}
out, err := fio.Process(
	ctx,
	fio.PathSource("input.txt"),
	fio.Out(fio.Txt),
	func(r io.Reader, w io.Writer) error {
		_, err := io.Copy(w, r)
		return err
	},
)
{% endhighlight %}

ถ้าต้องการ return metadata พร้อม output ใช้ `ProcessResult`

{% highlight go %}
type Metadata struct {
	Size int64
}

out, meta, err := fio.ProcessResult(
	ctx,
	fio.PathSource("input.txt"),
	fio.Out(fio.Txt),
	func(r io.Reader, w io.Writer) (*Metadata, error) {
		n, err := io.Copy(w, r)
		if err != nil {
			return nil, err
		}
		return &Metadata{Size: n}, nil
	},
)
{% endhighlight %}

เหมาะกับงานแปลงไฟล์, resize image, parse แล้วเขียนไฟล์ใหม่ หรือ pipeline ที่ต้องมีทั้ง output และผลลัพธ์ประกอบ

---

### ใช้ Do และ DoOut แบบ Scoped

`Do` ใช้สำหรับ read-only scope

{% highlight go %}
result, err := fio.Do(ctx, func(s *fio.Scope) (*string, error) {
	r, err := s.Use(fio.PathSource("input.txt"))
	if err != nil {
		return nil, err
	}

	b, err := io.ReadAll(r)
	if err != nil {
		return nil, err
	}

	text := string(b)
	return &text, nil
})
{% endhighlight %}

ส่วน `DoOut` ใช้สำหรับ scope ที่ต้องเขียน output

{% highlight go %}
out, err := fio.DoOut(ctx, fio.Out(fio.Txt), func(ctx context.Context, s *fio.OutScope, w io.Writer) error {
	r, err := s.Use(fio.PathSource("input.txt"))
	if err != nil {
		return err
	}

	_, err = io.Copy(w, r)
	return err
})
{% endhighlight %}

จุดดีคือ scope จะช่วยปิด reader และ cleanup resource ที่เปิดไว้ใน scope ให้ ลดโอกาสลืม close ตอนเขียน flow ยาว ๆ

---

### Output ใช้งานยังไง

`Output` มี method หลัก ๆ แบบนี้

{% highlight go %}
data, _ := out.Bytes()
raw := out.Data()
r, _ := out.OpenReader()
w, _ := out.OpenWriter()
n, _ := out.WriteTo(dst)
err := out.SaveAs("/path/to/output.txt")
out.Keep()
path := out.Path()
st := out.StorageType()
size := out.Size()
{% endhighlight %}

ถ้า output เป็น memory, `Data()` จะคืน raw byte slice แต่ถ้า output เป็น file จะได้ `nil` ให้ใช้ `OpenReader`, `Bytes`, `WriteTo` หรือ `SaveAs` แทน

ถ้าต้องการให้ temp file ไม่ถูกลบตอน session cleanup ให้เรียก `Keep()`

{% highlight go %}
out.Keep()
fmt.Println(out.Path())
{% endhighlight %}

---

### Reusable Input

โดยปกติ stream อ่านแล้วหมด ถ้าต้องอ่าน source เดิมหลายรอบให้เปิดด้วย `Reusable()`

{% highlight go %}
in, err := fio.OpenIn(ctx, fio.PathSource("data.txt"), fio.Reusable())
if err != nil {
	panic(err)
}
defer in.Close()

out1, _ := fio.Copy(ctx, fio.InputSource(in), fio.Out(fio.Txt))

if err := in.Reset(); err != nil {
	panic(err)
}

out2, _ := fio.Copy(ctx, fio.InputSource(in), fio.Out(fio.Txt))
{% endhighlight %}

จาก source ถ้า input เป็น file จะพยายามใช้ `ReaderAt`/`SectionReader` เพื่อ reset ได้ ถ้าเป็น non-file จะ buffer ข้อมูลไว้ใน memory

---

### แปลง Reader เป็น ReaderAt

บาง library ต้องการ `io.ReaderAt` เช่น parser บางตัวหรือ workflow ที่ต้อง random access แต่ input ที่ได้มาเป็น `io.Reader` ธรรมดา ให้ใช้ `ToReaderAt`

{% highlight go %}
result, err := fio.ToReaderAt(
	ctx,
	reader,
	fio.WithMaxMemoryBytes(8<<20),
	fio.WithTempDir("./temp"),
)
if err != nil {
	panic(err)
}
defer result.Cleanup()

ra := result.ReaderAt()
size := result.Size()
source := result.Source()
{% endhighlight %}

จาก source `ToReaderAt` จะทำงานประมาณนี้

* ถ้า reader รองรับ `io.ReaderAt` อยู่แล้ว จะ return direct
* ถ้าข้อมูลยังไม่เกิน `WithMaxMemoryBytes` จะเก็บใน memory
* ถ้าเกิน threshold จะ spill ไป temp file

บน Darwin, Linux และ BSD จะมี `mmap` fast path ผ่าน `mmap_unix.go` ส่วน platform อื่นจะ fallback เป็น standard file I/O

---

### อ่านทีละบรรทัด

มี helper สำหรับอ่าน line ด้วย

{% highlight go %}
err := fio.ReadLines(ctx, fio.PathSource("file.txt"), func(line string) error {
	fmt.Println(line)
	return nil
})
{% endhighlight %}

หรือใช้ path ตรง ๆ

{% highlight go %}
err := fio.ReadFileLines(ctx, "file.txt", func(line string) error {
	fmt.Println(line)
	return nil
})
{% endhighlight %}

ใน source ใช้ `bufio.Scanner` และตั้ง buffer สูงสุดไว้ที่ 1MB

---

### เขียนไฟล์ตรง ๆ

ถ้าแค่อยากเขียน reader หรือ source ไปเป็น file ใช้ helper ได้เลย

{% highlight go %}
n, err := fio.WriteFile(reader, "/path/to/output.txt")
{% endhighlight %}

หรือ

{% highlight go %}
n, err := fio.WriteStreamToFile(
	fio.BytesSource([]byte("hello")),
	"/path/to/output.txt",
)
{% endhighlight %}

function พวกนี้เหมาะกับจุดเล็ก ๆ ที่ไม่จำเป็นต้องเปิด session เอง

---

### Configure HTTP Client

`URLSource` ใช้ HTTP client global ของ package ถ้าต้องการ set timeout หรือ custom transport ให้ config ตอนเริ่ม app

{% highlight go %}
fio.Configure(fio.NewConfig(&http.Client{
	Timeout: 60 * time.Second,
}))
{% endhighlight %}

ใน source default timeout คือ 30 วินาที และ README แนะนำว่า `Configure` ควรถูกเรียกตอน app startup

---

### Output Config ที่ใช้บ่อย

กำหนด output ง่าย ๆ ด้วย extension

{% highlight go %}
out := fio.Out(fio.Json)
{% endhighlight %}

บังคับ storage ได้

{% highlight go %}
out := fio.Out(fio.Json, fio.Memory)
out := fio.Out(fio.Json, fio.File)
{% endhighlight %}

ตั้ง spill threshold เฉพาะ output

{% highlight go %}
out := fio.Out(fio.Json, fio.WithSpillThreshold(32<<20))
{% endhighlight %}

หรือ reuse output เดิม

{% highlight go %}
var cached *fio.Output
out := fio.Out(fio.Json, fio.OutReuse(&cached))
{% endhighlight %}

จาก test ของ repo ถ้าใช้ `OutReuse` กับ memory output รอบถัดไปจะใช้ output pointer เดิม และข้อมูลจะถูกเขียนทับเป็นค่าล่าสุด

---

### Error ที่ควรรู้

`fio` มี sentinel errors ให้ใช้กับ `errors.Is` เช่น

{% highlight go %}
fio.ErrNilSource
fio.ErrNoSession
fio.ErrIoManagerClosed
fio.ErrIoSessionClosed
fio.ErrDownloadFailed
fio.ErrFileStorageUnavailable
fio.ErrOutputCleaned
fio.ErrInputNotReusable
fio.ErrCannotResetInput
fio.ErrCannotGetReaderAt
{% endhighlight %}

ตัวอย่าง

{% highlight go %}
if errors.Is(err, fio.ErrDownloadFailed) {
	// handle URL download error
}
{% endhighlight %}

---

### เหมาะกับงานแบบไหน

`fio` เหมาะกับงานที่ต้องรับ input ได้หลายแบบ แล้วอยากให้ processing logic เหลือแค่ทำงานกับ `io.Reader` หรือ `io.Writer` เช่น

* upload file แล้ว process ต่อ
* download URL แล้วแปลงเป็น output
* แปลง stream เป็น temp file เมื่อขนาดใหญ่
* อ่านไฟล์หลายรอบด้วย reusable input
* ใช้ parser ที่ต้องการ `io.ReaderAt`
* เขียน pipeline ที่ต้อง auto cleanup temp file หลังจบ request

ถ้าเป็นงาน `io.Copy` ง่าย ๆ ครั้งเดียว standard library ก็พอ แต่ถ้าเริ่มมี memory/file backend, temp cleanup, source หลายแบบ และ scope ที่ต้องปิด resource ให้ถูก `fio` จะช่วยทำให้โค้ดฝั่ง I/O เป็นระเบียบขึ้นเยอะ

---

### Repository

ดูโค้ดเพิ่มเติมได้ที่ [dreamph/fio](https://github.com/dreamph/fio)
