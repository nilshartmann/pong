/**
 * Created by markusklink on 13.04.14.
 */



function callbackFunctions(gameCfg, clientCfg) {
    return {
        ackCreateGame: function (data) {
            console.log(data);
            gameCfg.gameId = data.gameId;
            gameCfg.playerId = data.playerId;
            gameCfg.gameTime = data.gameTime;
            clientCfg.timeDelta=0;
            console.log(gameCfg);
        },
        ackJoinGame: function (data) {
            console.log(data);
            gameCfg.gameId = data.game.gameId;
            gameCfg.playerId = data.playerId;
            gameCfg.gameTime = data.gameTime;
            gameCfg.players=data.game.players;
            gameCfg.ball = data.game.ball;
            clientCfg.timeDelta=Date.now()-gameCfg.gameTime+clientCfg.latency;
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
            gameCfg.players=data.game.players;
            gameCfg.ball = data.game.ball;
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

var createGame = function (gameServer,config, cb, cb2) {
    config.gameTime = Date.now();
    config.players.push(createPlayer());
    config.players[0].playerId = 0;
    config.players[0].paddle = {
        pos: 0,
        gameTime: config.gameTime
    };
    gameServer.emit("createGame", {"gameTime": config.gameTime, paddle: config.players[0].paddle, ball: config.ball}, function (data) {
        cb.ackCreateGame(data);
        cb2();
    });
};

var joinGame = function (gameServer,config, cb, cb2) {
    gameServer.emit("joinGame", {
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
var ping = function (gameServer,clientCfg, cb) {
    clientCfg.myTime = Date.now();
    gameServer.emit("ping", Date.now(), function (clientTime, gameTime) {
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

var ballUpdate = function (gameServer,config,clientCfg) {
    config.ball.gameTime=Date.now()-clientCfg.timeDelta;
    gameServer.emit("ballUpdate", {
        ball: config.ball,
        "gameId": config.gameId,
        "playerId": config.playerId
    });
};

var paddleUpdate = function (gameServer,config,clientCfg) {
    config.players[config.playerId].paddle.gameTime=Date.now()-clientCfg.timeDelta;
    config.ball.gameTime=Date.now()-clientCfg.timeDelta;
    gameServer.emit("paddleUpdate", {
        gameId: config.gameId,
        player: config.players[config.playerId]
    });
};

