package main

import(
	"fmt"
)

var ch = make(chan int)
var ch2 = make(chan string)



func main(){
	go func() {
		select {
		case a := <-ch:
			fmt.Println("input number :",a)
		case a := <- ch2:
			fmt.Println("input string :",a)
		}

	}()
	fmt.Println("run gorutin")
	ch <- 1
}