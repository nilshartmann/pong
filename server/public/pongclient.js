/**
 * Created by markusklink on 13.04.14.
 */

var gameServer = io.connect('http://localhost:3000');

var player = {
    id: 0,
    paddlePos: 0
}

var ball = {
    x : 0,
    y : 0,
    dx : 0,
    dy : 0,
    speed : 0
}

var config = {
    gameId : 0,
    playerId: 0,
    myTime : Date.now(),
    gameTime : Date.now(),
    latenz : 0
}

var setConfig = function(config, data) {
    config.gameId = data.gameId
    config.playerId = data.playerId
}

gameServer.on("ackGame", function(data){
    console.log(data)
    setConfig(config, data)
    console.log(config)
})

gameServer.on("ackJoin", function(data){
    console.log(data)
    setConfig(config, data)
    console.log(config)

})

var createGame = function() {
    var time = Date.now()
    gameServer.emit("createGame", {"time" : time })
    gameServer.on("ackCreateGame", function(data) {
        console.log(data);
    })
}

var ping = function(config) {
    config.myTime = Date.now()
    gameServer.emit("ping" , function() {
        console.log("pong")
        var timeNow = Date.now()
        config.latenz = timeNow - config.myTime
        console.log(config)
    })
}


ping(config)

