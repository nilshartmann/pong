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

}

function createGame(clientSocket,data) {
    var game= {
        id: nextGame++,
        timeDelta: Date.now()-data.time,
        clients: [clientSocket]
    }

    games.push(game);
    clientSocket.emit("ackCreateGame",{
        gameid: game.gameid,
        playerid: 0
    });
    console.log("Create game: " + util.inspect(game));
}

function joinGame(clientSocket,data) {
    var gameId=data.gameid;
    var currentGame=games[gameId];
    if(currentGame) {
        currentGame.clients.push(clientSocket);
        var gameTime=gameTime(currentGame);
        clientSocket.emit("ackJoinGame",{
            game: currentGame.id,
            playerid: currentGame.clients.length,
            gametime: gameTime(currentGame)
        });

        console.log("Join game: " + util.inspect(currentGame));
    }
}

function ballUpdate(clientSocket,data) {
    console.log("Ball Update: " + util.inspect(data));
    var gameId=data.gameid;
    var playerid=data.playerid;
    var currentGame=games[gameId];
    if(currentGame) {
        for(var player=0;player<currentGame.clients.length;player++) {
            if(player!=playerid) {
                clientSocket.emit("ballUpdate",data);
            }
        }
    }
}


function gameTime(game) {
    return Date.now()-game.timeDelta;
}