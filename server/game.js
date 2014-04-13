/**
 * Created by rene on 13.04.14.
 */

var util = require('util')

var nextGame=0;

var serverGames = [];


exports.onConnection= function (clientSocket) {
    clientSocket.on('ping', clientTime, function (pongFunction) {
        pongFunction(clientTime)
    });
    clientSocket.on('createGame', function (data) {
        createGame(clientSocket,data);
    });
    clientSocket.on('joinGame', function (data) {
        joinGame(clientSocket,data);
    });
    clientSocket.on('ballUpdate', function (data) {
        ballUpdate(clientSocket,data);
    });
    clientSocket.on('paddleUpdate', function (data) {
        paddleUpdate(clientSocket,data);
    });
}

function calcGameTime(game) {
    return Date.now()-game.timeDelta;
}

function createGame(clientSocket,data) {
    var player = {
        playerId: 0,
        paddle: data.paddle
    }

    var game= {
        id: nextGame++,
        players: [player],
        ball: undefined
    }

    var servergame = {
        game: game,
        timeDelta: Date.now()-data.gameTime,
        clients: [clientSocket]
    }

    serverGames.push(servergame);
    clientSocket.emit("ackCreateGame",{
        gameId: game.gameid,
        playerId: 0
    });
    console.log("Create game: " + util.inspect(game));
}

function joinGame(clientSocket,data) {
    var gameId=data.gameId;
    var serverGame=serverGames[gameId];

    if(serverGame) {
        var player = {
            playerId: serverGame.game.players.length+1,
            paddle: data.paddle
        }

        var gameTime=calcGameTime(serverGame);
        player.paddle.gameTime=gameTime;

        serverGame.game.players.push(player),
        serverGame.clients.push(clientSocket);
        clientSocket.emit("ackJoinGame",{
            gameId: serverGame.id,
            playerId: player.playerId,
            gameTime: gameTime,
            game: serverGame.game
        });

        for(var clientId=0;clientId<serverGame.clients.length-1;clientId++) {
            serverGame.clients[clientId].emit("playerJoined", {
                game: serverGame.game
            });
        }

        console.log("Join game: " + util.inspect(serverGame));
    }
}

function ballUpdate(clientSocket,data) {
    console.log("Ball Update: " + util.inspect(data));
    var gameId=data.gameId;
    var playerid=data.playerId;
    var serverGame=serverGames[gameId];
    serverGame.game.ball=data.ball;

    if(serverGame) {
        for(var clientId=0;clientId<serverGame.clients.length;clientId++) {
            if(clientId!=playerid) {
                serverGame.clients[clientId].emit("ballUpdate",data);
            }
        }
    }
}

function paddleUpdate(clientSocket,data) {
    console.log("Paddle Update: " + util.inspect(data));
    var gameId=data.gameid;
    var serverGame=serverGames[gameId];
    serverGame.game.players[data.player.playerId].paddle=data.player.paddle;
    if(serverGame) {
        for(var clientId=0;clientId<serverGame.clients.length;clientId++) {
            if(clientId!=playerid) {
                serverGame.clients[clientId].client.emit("paddleUpdate",data);
            }
        }
    }
}


