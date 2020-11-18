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
var taskclients = make(map[*websocket.Conn]bool)

// クライアントのメッセージを格納
var broadcast = make(chan Message)

// 交信用
var upgrader = websocket.Upgrader{}

type Message struct {
	Message string `json:message`
	Testdate string `json:testdate`
}

//公衆のタスク
var publictasks = make(map[int]Task)
var taskNo = 0

var publishtask = make(chan Task)

type Task struct{
	No int `json:no`
	Title string `json:title`
	Content string `json:content`
	Person string `json:person`
	Level string `json:level`
	Status bool `json:status`
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

	taskclients[websocket] = true

	for {
		var message Message

		err:= websocket.ReadJSON(&message)
		fmt.Println("getmessage",message.Testdate)
		

		if err != nil {
			log.Printf("error occurred while reading message: %v", err)
            delete(taskclients, websocket)
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
		for client :=  range taskclients{
			fmt.Println("write json")
			err := client.WriteJSON(message)

			if err != nil {
				log.Printf("error occurred while writing message to client: %v",err)
				client.Close()
				delete(taskclients,client)
			}
		}
	}
}


func TaskPubliser(w http.ResponseWriter, r *http.Request)  {
	//ごルーチンで起動
	go broadcastTaskToClients()

	//状態更新
	websocket, err := upgrader.Upgrade(w,r,nil)
	fmt.Println("upgrade")
	if err != nil {
		log.Fatal("error upgrading Get request to a websocket::",err)
	}

	defer websocket.Close()

	taskclients[websocket] = true

	for task := range publictasks{
		fmt.Println(publictasks[task])
		websocket.WriteJSON(publictasks[task])
	}

	for {
		var task Task

		err:= websocket.ReadJSON(&task)
		fmt.Println("getmessage",task)

		if err != nil {
			log.Printf("error occurred while reading message: %v", err)
            delete(taskclients, websocket)
            break
		}

		if  !task.Status {
			publictasks[taskNo] = task
			taskNo += 1
			task.No = taskNo
		}else {
			delete(publictasks,task.No)
		}

		// メッセージ受け取り
		fmt.Println("push message")
		publishtask <- task
	}
}
func broadcastTaskToClients()  {
	for {
		//メッセージ受け取り
		task := <- publishtask
		//クライアント数だけループ
		for client :=  range taskclients{
			fmt.Println("write task")
			err := client.WriteJSON(task)

			if err != nil {
				log.Printf("error occurred while writing message to client: %v",err)
				client.Close()
				delete(taskclients,client)
			}
		}
	}
}

var userclients = make(map[*websocket.Conn]bool)
type User struct{
	User string `json:string`
	Level int `json:int`
}
var publicUsers = make(map[int]User)
var broadcastUser = make(chan User)
var Usernumber = 0

func UserPubliser(w http.ResponseWriter, r *http.Request)  {
	//ごルーチンで起動
	go broadcastUserToClients()

	//状態更新
	websocket, err := upgrader.Upgrade(w,r,nil)
	fmt.Println("upgrade")
	if err != nil {
		log.Fatal("error upgrading Get request to a websocket::",err)
	}

	defer websocket.Close()

	userclients[websocket] = true

	for user := range publicUsers{
		fmt.Println(publicUsers[user])
		websocket.WriteJSON(publicUsers[user])
	}

	for {
		var user User

		err:= websocket.ReadJSON(&user)
		fmt.Println("getmessage",user)

		if err != nil {
			log.Printf("error occurred while reading message: %v", err)
            delete(userclients, websocket)
            break
		}

		firstflug := true
		for no := range publicUsers{
			if publicUsers[no].User == user.User{
				u,ok := publicUsers[no]
				if ok {
					u.Level = user.Level
				}
				publicUsers[no] = u
				firstflug = false
				break
			}
		}
		if firstflug {
			publicUsers[Usernumber] = user
			Usernumber += 1
		}

		// メッセージ受け取り
		fmt.Println("push message")
		broadcastUser <- user
	}
}
func broadcastUserToClients()  {
	for {
		//メッセージ受け取り
		user := <- broadcastUser
		//クライアント数だけループ
		for client :=  range userclients{
			fmt.Println("write task")
			err := client.WriteJSON(user)

			if err != nil {
				log.Printf("error occurred while writing message to client: %v",err)
				client.Close()
				delete(userclients,client)
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

func setCookies(w http.ResponseWriter, r *http.Request){

	cookie := &http.Cookie{
		Name: "myname",
		Value: r.FormValue("uname"),
   }
   
   http.SetCookie(w, cookie)

   w.Header().Set("Content-Type", "text/html")
   w.Header().Set("location", "Gamefication.html")
   w.WriteHeader(http.StatusMovedPermanently)
}

func main(){

	http.Handle("/",http.FileServer(http.Dir("./../")))

	http.HandleFunc("/setcookie",setCookies)
	http.HandleFunc("/chat",HandleClients)
	http.HandleFunc("/task",TaskPubliser)
	http.HandleFunc("/user",UserPubliser)
	fmt.Printf("Server running\n")
	err := http.ListenAndServe(":8080",nil)
	if err != nil {
		log.Fatal("error starting http server::", err)
        return
	}
}