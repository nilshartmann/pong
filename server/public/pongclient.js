/**
 * Created by markusklink on 13.04.14.
 */

/**
 * Location of the game server
 * @type {*|io.Socket}
 */
var gameServer1 = io.connect('http://localhost:3000');
var gameServer2 = io.connect('http://localhost:3000');

/**
 * Configuration object.
 */
var gameCfg1 = createGameConfig();
var clientCfg1 = createClientConfig();
var callbackFunctions1 = callbackFunctions(gameCfg1)

var gameCfg2 = createGameConfig();
var clientCfg2 = createClientConfig();
var callbackFunctions2 = callbackFunctions(gameCfg2)


var setConfig = function (config, data) {
    config.gameId = data.gameId;
    config.playerId = data.playerId;
    config.gameTime = data.gameTime;
};

var callbackFunctions = function (gameCfg) {
    return {
        ackCreateGame: function (data) {
            console.log(data);
            setConfig(gameCfg, data);
            console.log(gameCfg);
        },
        ackJoinGame: function (data) {
            console.log(data);
            gameCfg = data.game;
            // TODO gametime
        },
        ballUpdate: function (data) {
            console.log("ballUpdate");
            console.log(data);
            console.log("TODO");
            ball = data.ball;
            console.log("TODO gametime?");
            console.log(ball);
        },
        paddleUpdate: function (data) {
            console.log("paddleUpdate");
            console.log(data);
            gameCfg.players[data.player.playerId].paddle = data.player.paddle;
        },
        playerJoined: function (data) {
            console.log("playerJoined");
            console.log(data);
            console.log("TODO");
            // TODO gametime
            gameCfg = data.game;
        }
    }
};

var registerCallbacks = function (gameServer, gameCfg, cb) {
    gameServer.on("ballUpdate", cb.ballUpdate);
    gameServer.on("paddleUpdate", cb.paddleUpdate);
    gameServer.on("playerJoined", cb.playerJoined)
}

var createGame = function (config, cb, cb2) {
    config.gameTime = Date.now();
    config.players.push(createPlayer());
    config.players[0].playerId = 0;
    config.players[0].paddle = {
        pos: 0,
        gameTime: config.gameTime
    };
    gameServer2.emit("createGame", {"gameTime": config.gameTime, paddle: config.players[0].paddle}, function (data) {
        cb.ackCreateGame(data);
        cb2();
    });
};

var joinGame = function (config, cb, cb2) {
    gameServer2.emit("joinGame", {
        gameId: config.gameId,
        paddle: {
            pos: 0,
            gameTime: undefined
        }
    }, function (data) {
        cb.ackJoinGame(data);
        cb2();
    });
};

/**
 *
 * @param clientCfg
 */
var ping = function (clientCfg, cb) {
    clientCfg.myTime = Date.now();
    gameServer2.emit("ping", Date.now(), function (clientTime, gameTime) {
        console.log("pong");
        var currentLatenz = Date.now() - clientTime;
        console.log("Current-Latenz: " + currentLatenz);
        if (clientCfg.latency) {
            clientCfg.latency = ( clientCfg.latency + currentLatenz ) / 2;
        } else {
            clientCfg.latency = currentLatenz;
        }
        console.log("Latenz: " + clientCfg.latency);
        console.log("Client Config " + clientCfg);
        if (cb) {
            cb(clientCfg.latency);
        }
    })
};

var ballUpdate = function (config) {
    gameServer2.emit("ballUpdate", {
        ball: config.ball,
        "gameId": config.gameId,
        "playerId": config.playerId
    });
};

var paddleUpdate = function (config) {
    gameServer2.emit("paddleUpdate", {
        gameId: config.gameId,
        player: config.players[config.playerId]
    });
};

registerCallbacks(gameServer1, gameCfg1, callbackFunctions1);
registerCallbacks(gameServer2, gameCfg2, callbackFunctions2);

createGame(gameCfg1, callbackFunctions1, function () {
    gameCfg2.gameId = gameCfg1.gameId;
    ping(clientCfg2);
    ping(clientCfg2);
    ping(clientCfg2, function (latency) {
        joinGame(gameCfg2, callbackFunctions1, function () {
            gameCfg2.ball.x = 1;
            gameCfg2.ball.y = 1;

            ballUpdate(gameCfg2);

            paddleUpdate(gameCfg2);
        });
    });


});


