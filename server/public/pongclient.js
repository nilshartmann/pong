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
    latenz : undefined
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

gameServer.on("ballUpdate", function(data){
    console.log(data)
    console.log("TODO")
    ball = data.ball
    console.log("TODO gametime?")
    console.log(ball)
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
        var currentLatenz = Date.now() - config.myTime
        if (config.latenz) {
           config.latenz = ( config.latenz + currentLatenz ) / 2
        } else {
            config.latenz = currentLatenz
        }
        console.log(config)
    })
}

var ballUpdate = function(ball, config) {
    gameServer.emit("ballUpdate", {
        "ball" : ball,
        "gameTime": config.gameTime,
        "gameId" : config.gameId,
        "playerId": config.playerId
    })
}

var paddleUpdate = function(paddle, config) {
    gameServer.emit("paddleUpdate", player)
}


createGame()

ping(config)

ballUpdate(ball, config)

paddleUpdate(player, config)
