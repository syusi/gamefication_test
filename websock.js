

var socket = new WebSocket("ws://" + window.location.host + "/task");
let publicCards = [];
let publicholder = 0;

socket.onopen = function() {
    console.log("Connection OK\n");
};


socket.onmessage = function(e) {
    let getjson = JSON.parse(e.data);
    if (getjson.Status) {
        if (getjson.Person == selfName) {
            moneyup((levels[getjson.Level]/2));
        }
        return;
    }
    
    if (publicCards.length % 3 == 0) {
        holderdiv = document.getElementById("othertask");
        newholder = document.createElement("div");
        newholder.setAttribute("class","card-deck py-5");
        publicholder += 1;
        newholder.setAttribute("id","public-card-deck"+publicholder);
        holderdiv.appendChild(newholder);
    }
    let newcard = {
        no:getjson.No,
        title:getjson.Title,
        content:getjson.Content,
        person:getjson.Person,
        level:getjson.Level,
        status:false,
    };
    publicCards.push(newcard);

    makePublicCard(document.getElementById("public-card-deck"+publicholder),newcard);
};

function sendtask(no) {

    const card = cards.find((card) => {
        return (card.no === no);
    });

    socket.send(JSON.stringify(
        {
            no:card.no,
            title:card.title,
            content:card.content,
            person:card.person,
            level:card.level,
            status:false,
        }
    ));
};
function sendFinish(no) {
    
    const card = publicCards.find((card) => {
        return (card.no === no);
    });

    getExp();
    moneyup((levels[card.level]/2));

    socket.send(JSON.stringify(
        {
            no:card.no,
            title:card.title,
            content:card.content,
            person:card.person,
            level:card.level,
            status:true,
        }
    ));
}
// type Task struct{
// 	No int `json:no`
// 	Title string `json:title`
// 	Content string `json:content`
// 	Person string `json:person`
// 	Level string `json:level`
// 	Status bool `json:status`
// }