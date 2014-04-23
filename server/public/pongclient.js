/**
 * Created by markusklink on 13.04.14.
 */


var createGameConfig = function () {
    return {
        gameId: 0,
        playerId: 0,
        gameTime: undefined,
        players: [],
        ball: {
            x: 0,
            y: 0,
            dx: 0,
            dy: 0,
            gameTime: undefined
        }};
}

var createClientConfig = function(gameServer) {
    var config= {
        game: createGameConfig(),
        gameServer: gameServer,
        latency: undefined
    }

    config.callbacks=createCallbackFunctions(config);
    registerCallbacks(config);
    return config;
}

var createPlayer = function() {
    return {
        playerId : undefined,
        paddle : {
            pos: undefined,
            gameTime: undefined
        }
    }
}


function createCallbackFunctions(clientCfg) {
    var callbacks= {
        ackCreateGame: function (data) {
            console.log(data);
            clientCfg.game.gameId = data.gameId;
            clientCfg.game.playerId = data.playerId;
            clientCfg.game.gameTime = data.gameTime;
            clientCfg.timeDelta=0;
            console.log(clientCfg.game);
        },
        ackJoinGame: function (data) {
            console.log(data);
            clientCfg.game.gameId = data.game.gameId;
            clientCfg.game.playerId = data.playerId;
            clientCfg.game.gameTime = data.gameTime;
            clientCfg.game.players=data.game.players;
            clientCfg.game.ball = data.game.ball;
            clientCfg.timeDelta=Date.now()-(clientCfg.game.gameTime+clientCfg.latency);
            console.log("TimeDelta: " +clientCfg.timeDelta);
        },
        ballUpdate: function (data) {
            console.log("ballUpdate");
            clientCfg.game.ball = data.ball;
            console.log(clientCfg.game.ball);

            if (clientCfg.callbacks.onBallUpdate) {
                clientCfg.callbacks.onBallUpdate();
            }
        },
        paddleUpdate: function (data) {
            console.log("paddleUpdate received:" + data.player.paddle.pos);
            clientCfg.game.players[data.player.playerId].paddle = data.player.paddle;
			if (clientCfg.callbacks.onPaddleUpdate) {
				clientCfg.callbacks.onPaddleUpdate();
			}


        },
        playerJoined: function (data) {
            console.log("playerJoined");
            console.log(data);
            clientCfg.game.players=data.game.players;
            clientCfg.game.ball = data.game.ball;
            data.game.playerId=clientCfg.game.playerId;
            clientCfg.game = data.game;
        }
    }
 return callbacks;
};

var registerCallbacks = function (clientCfg) {
    clientCfg.gameServer.on("ballUpdate", clientCfg.callbacks.ballUpdate);
    clientCfg.gameServer.on("paddleUpdate", clientCfg.callbacks.paddleUpdate);
    clientCfg.gameServer.on("playerJoined", clientCfg.callbacks.playerJoined)
}

var createGame = function (clientCfg, cb2) {
    for(var i=0;i<5;i++) {
        ping(clientCfg);
    }
    ping(clientCfg, function(latency) {
        clientCfg.game.gameTime = Date.now()+latency;
        clientCfg.game.players.push(createPlayer());
        clientCfg.game.players[0].playerId = 0;
        clientCfg.game.players[0].paddle = {
            pos: 0,
            gameTime: clientCfg.game.gameTime
        };
        clientCfg.gameServer.emit("createGame", {"gameTime": clientCfg.game.gameTime, paddle: clientCfg.game.players[0].paddle, ball: clientCfg.game.ball}, function (data) {
            clientCfg.callbacks.ackCreateGame(data);
            cb2();
        });
    });
};

var joinGame = function (clientCfg, cb2) {
    for(var i=0;i<5;i++) {
        ping(clientCfg);
    }
    ping(clientCfg, function(latency) {
        clientCfg.gameServer.emit("joinGame", {
            gameId: clientCfg.game.gameId,
            paddle: {
                pos: 0,
                gameTime: undefined
            }
        }, function (data) {
            clientCfg.callbacks.ackJoinGame(data);
            cb2();
        });
    });
};

/**
 *
 * @param clientCfg
 */
var ping = function (clientCfg, cb) {
    clientCfg.gameServer.emit("ping", Date.now(), function (clientTime) {
        console.log("pong");
        var currentLatenz = (Date.now() - clientTime) / 2;
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

var ballUpdate = function (clientCfg) {
    clientCfg.game.ball.gameTime=getGametime(clientCfg);
    clientCfg.gameServer.emit("ballUpdate", {
        ball: clientCfg.game.ball,
        "gameId": clientCfg.game.gameId,
        "playerId": clientCfg.game.playerId
    });
};

var paddleUpdate = function (clientCfg) {
    clientCfg.game.players[clientCfg.game.playerId].paddle.gameTime=getGametime(clientCfg);
    clientCfg.gameServer.emit("paddleUpdate", {
        gameId: clientCfg.game.gameId,
        player: clientCfg.game.players[clientCfg.game.playerId]
    });
};

var getGametime = function(clientCfg) {
    return Date.now()-clientCfg.timeDelta;
};

