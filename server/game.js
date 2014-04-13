/**
 * Created by rene on 13.04.14.
 */

var util = require('util')

var nextGame=0;

var games = [];


exports.onConnection= function (clientSocket) {
    clientSocket.on('ping', function (pongFunction) {
        pongFunction()
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

    games.push(servergame);
    clientSocket.emit("ackCreateGame",{
        gameId: game.gameid,
        playerId: 0
    });
    console.log("Create game: " + util.inspect(game));
}

function joinGame(clientSocket,data) {
    var gameId=data.gameId;
    var currentGame=games[gameId];

    if(currentGame) {
        var player = {
            playerId: currentGame.game.players.length+1,
            paddle: data.paddle
        }

        currentGame.game.players.push(player),
        currentGame.clients.push(clientSocket);
        var gameTime=gameTime(currentGame);
        clientSocket.emit("ackJoinGame",{
            gameId: currentGame.id,
            playerId: player.playerId,
            gameTime: gameTime(currentGame),
            game: currentGame.game
        });

        for(var clientId=0;clientId<currentGame.clients.length-1;clientId++) {
            currentGame.clients[clientId].emit("playerJoined", currentGame.game);
        }

        console.log("Join game: " + util.inspect(currentGame));
    }
}

function ballUpdate(clientSocket,data) {
    console.log("Ball Update: " + util.inspect(data));
    var gameId=data.gameId;
    var playerid=data.playerId;
    var currentGame=games[gameId];
    currentGame.game.ball=data.ball;

    if(currentGame) {
        for(var player=0;player<currentGame.clients.length;player++) {
            if(player!=playerid) {
                currentGame.clients[player].emit("ballUpdate",data);
            }
        }
    }
}

function paddleUpdate(clientSocket,data) {
    console.log("Paddle Update: " + util.inspect(data));
    var gameId=data.gameid;
    var playerid=data.playerid;
    var currentGame=games[gameId];
    currentGame.game.players[playerid].paddle=data.paddle;
    if(currentGame) {
        for(var player=0;player<currentGame.clients.length;player++) {
            if(player!=playerid) {
                currentGame.clients[player].client.emit("paddleUpdate",data);
            }
        }
    }
}


function gameTime(game) {
    return Date.now()-game.timeDelta;
}