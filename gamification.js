
let holdernumber = 0;
let levels = {easy:10,normal:20,hard:50};
let colors = {easy:'primary',normal:'success',hard:'danger'};
let cards = [];
let selfName = "自分";

function init() {

    var cookies = document.cookie;
    selfName = cookies.split("=")[1].replace(";","");

    cards = [
        {no:1,title:"テストタスク",content:"タスクの詳細",person:selfName,level:"easy"},
        {no:2,title:"テストタスク2",content:"タスクの詳細",person:selfName,level:"normal"},
        {no:3,title:"テストタスク3",content:"タスクの詳細",person:selfName,level:"hard"}
    ];

    let carddeck = document.getElementById("card-deck");
    
    cards.forEach(card => {
        makeCard(carddeck,card);
    });

    sendLevel();

    document.getElementById("levelupAudio").volume = 0.1;
    document.getElementById("moneyaudio").volume = 0.1;
}

function makeTask() {
    let nametag = document.getElementById("tasktitle");
    let detailtag = document.getElementById("taskdetail");
    let difftag = document.getElementById("taskdiffculty");

    let newcard = {
        no:cards.length+1,
        title:nametag.value,
        content:detailtag.value,
        person:selfName,
        level:difftag.value,
    };

    if (cards.length % 3 == 0) {
        holderdiv = document.getElementById("mytask");
        newholder = document.createElement("div");
        newholder.setAttribute("class","card-deck py-5");
        holdernumber += 1;
        newholder.setAttribute("id","card-deck"+holdernumber);
        holderdiv.appendChild(newholder);
    }

    nametag.value = "";
    detailtag.value = "";
    difftag.value = "easy";

    cards.push(newcard);
    makeCard(document.getElementById("card-deck"+holdernumber),newcard);

}


function makeCard(parentElem,cardObj) {
    let carddiv = document.createElement("div");
    cardclassstring = colors[cardObj['level']];
    carddiv.setAttribute("class","card text-left card-border font-weight-bold border-"+cardclassstring);
    parentElem.appendChild(carddiv);

    let cardimage = document.createElement("img");
    cardimage.setAttribute("class","card-img card-image-fit");
    cardimage.setAttribute("src","./material/card.png");
    carddiv.appendChild(cardimage);


    let cardbody = document.createElement("div");
    // cardbody.setAttribute("class","card-body card-img-overlay");
    cardbody.setAttribute("class","card-img-overlay");
    carddiv.appendChild(cardbody);

    let title = document.createElement("h5");
    title.setAttribute("class","card-title");
    title.innerText = cardObj["title"];
    cardbody.appendChild(title);

    let c_text = document.createElement("p");
    c_text.setAttribute("class","card-text");
    c_text.innerText = cardObj["content"]+"\n担当者："+cardObj["person"]+"\n"
    c_text.innerHTML += '<span class="text-'+cardclassstring+'">難易度：'+cardObj["level"]+'</span>';
    cardbody.appendChild(c_text);

    let donebutton = document.createElement("button");
    donebutton.textContent = "完了"
    donebutton.setAttribute("onclick","countUp("+ levels[cardObj["level"]] +")");
    donebutton.setAttribute("class","btn btn-primary card-link");
    cardbody.appendChild(donebutton);

    let taskbutton = document.createElement("button");
    taskbutton.textContent = "依頼"
    taskbutton.setAttribute("onclick","sendtask("+ cardObj["no"] +")");
    taskbutton.setAttribute("class","btn btn-danger card-link");
    cardbody.appendChild(taskbutton);    
}

function makePublicCard(parentElem,cardObj) {
    let carddiv = document.createElement("div");
    cardclassstring = colors[cardObj['level']];
    carddiv.setAttribute("class","card text-left card-border font-weight-bold border-"+cardclassstring);
    parentElem.appendChild(carddiv);

    let cardimage = document.createElement("img");
    cardimage.setAttribute("class","card-img card-image-fit");
    cardimage.setAttribute("src","./material/card.png");
    carddiv.appendChild(cardimage);


    let cardbody = document.createElement("div");
    // cardbody.setAttribute("class","card-body card-img-overlay");
    cardbody.setAttribute("class","card-img-overlay");
    carddiv.appendChild(cardbody);

    let title = document.createElement("h5");
    title.setAttribute("class","card-title");
    title.innerText = cardObj["title"];
    cardbody.appendChild(title);

    let c_text = document.createElement("p");
    c_text.setAttribute("class","card-text");
    c_text.innerText = cardObj["content"]+"\n担当者："+cardObj["person"]+"\n"
    c_text.innerHTML += '<span class="text-'+cardclassstring+'">難易度：'+cardObj["level"]+'</span>';
    cardbody.appendChild(c_text);

    let donebutton = document.createElement("button");
    donebutton.textContent = "完了"
    donebutton.setAttribute("onclick","sendFinish("+ cardObj["no"] +")");
    donebutton.setAttribute("class","btn btn-primary card-link");
    cardbody.appendChild(donebutton);

}
window.onload = init;

let level = 1;
let totalmoney = 0;
function countUp(taskmoney) {
    getExp();
    moneyup(taskmoney);
}
function getExp() {
    let expMater = document.getElementById("exp");
    let now = Number(expMater.getAttribute("aria-valuenow"));
    let max = Number(expMater.getAttribute("aria-valuemax"));
    now += 1;

    if(now >= max){
        document.getElementById("levelupAudio").play();
        max += 10;
        now = 0;

        level += 1;
        document.getElementById("level-content").innerText = (level-1)+" → "+level;
        //document.getElementById("level-content").setAttribute("class","modal-body");
        document.getElementById("level").innerText = "LV："+level;
        $('#modal1').modal('show');
        sendLevel();
    }
    let proggress = parseInt((now/max)*100,10) + "%";

    expMater.setAttribute("aria-valuenow",now);
    expMater.setAttribute("aria-valuemax",max);
    expMater.setAttribute("style","width:"+proggress)
    expMater.innerText = proggress;
}
function moneyup(taskmoney) {
    totalmoney += taskmoney
    up = document.getElementById("moneyup");

    //audio
    moneyaudio = document.getElementById("moneyaudio");
    moneyaudio.pause();
    moneyaudio.currentTime = 0;
    moneyaudio.play();
    
    // animation
    up.classList.remove('moneyup');
    // instead of up.offsetWidth = up.offsetWidth
    //don't work this line. but i have no idea
    void up.offsetWidth;
    up.classList.add('moneyup');
    up.innerText = '+' + taskmoney + '↑'

    // up.addEventListener('animationend',()=>{
    //   up.classList.remove('moneyup');
    // },false);

    total = document.getElementById("totalmoney");
    total.innerText = totalmoney+'マネー'
}
function renderRank() {
    let rank = 1;
    
    publicUser.sort((a,b) =>{
        if (a.level > b.level) return -1;
        if (a.level > b.level) return 1;
        return 0;
    });

    rankDiv = document.getElementById("exprank");
    rankDiv.textContent = null;
    
    publicUser.forEach((user) => {
        tag = document.createElement("div");
        if (rank == 1) {
            tag.setAttribute("class","gold");
        }else if (rank == 2) {
            tag.setAttribute("class","silver");
        }else if (rank == 3){
            tag.setAttribute("class","blonze");
        }else {
            tag.setAttribute("class","otherrank");
        }
        tag.innerText = rank+"位 Level"+user.level+"："+user.user;
        rankDiv.appendChild(tag);
        rank += 1;
    });
}