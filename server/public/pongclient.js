/**
 * Created by markusklink on 13.04.14.
 */

/**
 * Location of the game server
 * @type {*|io.Socket}
 */
var gameServer = io.connect('http://localhost:3000');

/**
 * Configuration object.
 */
var gameCfg = createGameConfig()
var clientCfg = createClientConfig()


var setConfig = function (config, data) {
    config.gameId = data.gameId
    config.playerId = data.playerId
    config.gameTime = data.gameTime
}

var registerCallbacks = function () {
    gameServer.on("ackCreateGame", function (data) {
        console.log(data)
        setConfig(config, data)
        console.log(config)
    })

    gameServer.on("ackJoinGame", function (data) {
        console.log(data)
        setConfig(config, data)
        console.log(config)
    })

    gameServer.on("ballUpdate", function (data) {
        console.log(data)
        console.log("TODO")
        ball = data.ball
        console.log("TODO gametime?")
        console.log(ball)
    })
}

var createGame = function () {
    config.gameTime = Date.now()
    gameServer.emit("createGame", {"gameTime": config.gameTime })
}

var joinGame = function () {
    gameServer.emit("joinGame", {"gameTime": config.gameTime })
}

/**
 *
 * @param clientCfg
 */
var ping = function (clientCfg) {
    config.myTime = Date.now()
    gameServer.emit("ping", Date.now(), function (clientTime) {
        console.log("pong")
        var currentLatenz = Date.now() - clientTime
        if (config.latency) {
            config.latency = ( config.latency + currentLatenz ) / 2
        } else {
            config.latency = currentLatenz
        }
        console.log("Client Config " + config)
    })
}

var ballUpdate = function (config) {
    gameServer.emit("ballUpdate", {
        "ball": config.ball,
        "gameId": config.gameId,
        "playerId": config.playerId
    })
}

var paddleUpdate = function (config) {
    gameServer.emit("paddleUpdate", config.players[config.playerId])
}

registerCallbacks()

createGame()

joinGame()

ping(config)

ping(config)

ballUpdate(ball, config)

paddleUpdate(player, config)
