/**
 * Created by rene on 13.04.14.
 */

var util = require('util')

var nextGame=0;

var games = [];


exports.onConnection= function (clientSocket) {
    clientSocket.on('createGame', function (data) {
        createGame(clientSocket,data);
    });
    clientSocket.on('joinGame', function (data) {
        joinGame(clientSocket,data);
    });
    clientSocket.on('ping', function (pongFunction) {
        pongFunction()
    });

}

function createGame(clientSocket,data) {
    var game= {
        id: nextGame++,
        timeDelta: Date.now()-data.time,
        clients: [clientSocket]
    }

    games.push(game);
    clientSocket.emit("ackCreateGame",{ game: game.id, playerid: 0});
    console.log("Create game: " + util.inspect(game));
}

function joinGame(clientSocket,data) {
    var gameId=data;
    var currentGame=games[gameId];
    if(currentGame) {
        currentGame.clients.push(clientSocket);
        var gameTime=gameTime(currentGame);
        clientSocket.emit("ackJoinGame",{
            game: currentGame.id,
            playerid: currentGame.clients.length,
            gametime: gameTime(currentGame)
        });
    }
}

function gameTime(game) {
    return Date.now()-game.timeDelta;
}