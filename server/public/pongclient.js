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
            clientCfg.timeDelta=Date.now()-clientCfg.game.gameTime+clientCfg.latency;
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
            clientCfg.game.players[data.player.playerId].paddle = data.player.paddle;
        },
        playerJoined: function (data) {
            console.log("playerJoined");
            console.log(data);
            clientCfg.game.players=data.game.players;
            clientCfg.game.ball = data.game.ball;
            // TODO gametime
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
    clientCfg.game.gameTime = Date.now();
    clientCfg.game.players.push(createPlayer());
    clientCfg.game.players[0].playerId = 0;
    clientCfg.game.players[0].paddle = {
        pos: 0,
        gameTime: clientCfg.gameTime
    };
    clientCfg.gameServer.emit("createGame", {"gameTime": clientCfg.game.gameTime, paddle: clientCfg.game.players[0].paddle, ball: clientCfg.game.ball}, function (data) {
        clientCfg.callbacks.ackCreateGame(data);
        cb2();
    });
};

var joinGame = function (clientCfg, cb2) {
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
};

/**
 *
 * @param clientCfg
 */
var ping = function (clientCfg, cb) {
    clientCfg.myTime = Date.now();
    clientCfg.gameServer.emit("ping", Date.now(), function (clientTime, gameTime) {
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

var ballUpdate = function (clientCfg) {
    clientCfg.game.ball.gameTime=Date.now()-clientCfg.timeDelta;
    clientCfg.gameServer.emit("ballUpdate", {
        ball: clientCfg.game.ball,
        "gameId": clientCfg.game.gameId,
        "playerId": clientCfg.game.playerId
    });
};

var paddleUpdate = function (clientCfg) {
    clientCfg.game.players[clientCfg.game.playerId].paddle.gameTime=Date.now()-clientCfg.timeDelta;
    clientCfg.game.ball.gameTime=Date.now()-clientCfg.timeDelta;
    clientCfg.gameServer.emit("paddleUpdate", {
        gameId: clientCfg.game.gameId,
        player: clientCfg.game.players[clientCfg.game.playerId]
    });
};

