//https://qiita.com/taizo/items/bf1ec35a65ad5f608d45
//https://www.yoheim.net/blog.php?q=20170403

package main

import(
	"log"
	"fmt"
	"net/http"
	"github.com/gorilla/websocket"
	//"bufio"
)

type Page struct{
	Title string
	Count int
}

// クライアント
var clients = make(map[*websocket.Conn]bool)

// クライアントのメッセージを格納
var broadcast = make(chan Message)

// 交信用
var upgrader = websocket.Upgrader{}

type Message struct {
	Message string `json:message`
	Testdate string `json:testdate`
}

type Task struct{
	Title string `json:title`
	Content string `json:content`
	Person string `json:person`
	Level string `json:level`
}

func HandleClients(w http.ResponseWriter, r *http.Request)  {
	//ごルーチンで起動
	go broadcastMessagesToClients()

	//状態更新
	websocket, err := upgrader.Upgrade(w,r,nil)
	fmt.Println("upgrade")
	if err != nil {
		log.Fatal("error upgrading Get request to a websocket::",err)
	}

	defer websocket.Close()

	clients[websocket] = true

	for {
		var message Message

		err:= websocket.ReadJSON(&message)
		fmt.Println("getmessage",message.Testdate)
		if err != nil {
			log.Printf("error occurred while reading message: %v", err)
            delete(clients, websocket)
            break
		}
		// メッセージ受け取り
		fmt.Println("push message")
		broadcast <- message
	}
}

func broadcastMessagesToClients()  {
	for {
		//メッセージ受け取り
		message := <- broadcast
		//クライアント数だけループ
		for client :=  range clients{
			fmt.Println("write json")
			err := client.WriteJSON(message)

			if err != nil {
				log.Printf("error occurred while writing message to client: %v",err)
				client.Close()
				delete(clients,client)
			}
		}
	}
}

// func viewHandler(w http.ResponseWriter, r *http.Request){
// 	page := Page{"Hell wild.",1}
// 	tmpl, err := template.ParseFiles("../gamification/Gamification.html")
// 	if err != nil{
// 		panic(err)
// 	}
// 	tmpl.Execute(w,page)
// }

type String string

func main(){
	http.Handle("/",http.FileServer(http.Dir("./../")))

	http.HandleFunc("/chat",HandleClients)
	fmt.Printf("Server running\n")
	err := http.ListenAndServe("localhost:8080",nil)
	if err != nil {
		log.Fatal("error starting http server::", err)
        return
	}
}