

var usersocket = new WebSocket("ws://" + window.location.host + "/user");
let publicUser = [];

usersocket.onopen = function() {
    console.log("UserConnection OK\n");
};


usersocket.onmessage = function(e) {
    let getjson = JSON.parse(e.data);
    
    let upUser = publicUser.find((user) => {
        return (user.user == getjson.User)
    });
    if (upUser == undefined) {
        publicUser.push({
            user:getjson.User,
            level:getjson.Level
        });
    }else{
        upUser.level = getjson.Level;
    }
    renderRank();
    console.log(publicUser);
};

function sendLevel() {

    usersocket.send(JSON.stringify(
        {
            user:selfName,
            level:level,
        }
    ));
};