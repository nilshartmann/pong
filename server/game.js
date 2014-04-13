/**
 * Created by rene on 13.04.14.
 */

var nextGame=0;

var games = [];


exports.onConnection= function (clientSocket) {
    clientSocket.on('createGame', function (data) {
        createGame(clientSocket,data);
    });
    clientSocket.on('joinGame', function (data) {
        joinGame(clientSocket,data);
    });

}

function createGame(clientSocket,data) {
    var game= {
        id: nextGame++,
        timeDelta: Date.now()-data.basetime,
        clients: [clientSocket]
    }

    games.push(game);

    clientSocket.emit("ackCreateGame",{ game: game.id, playerid: 0});
}

function joinGame(clientSocket,data) {
    var gameId=data;
    var game=games[gameId];
    if(game) {
        game.clients.push(clientSocket);
        clientSocket.emit("ackJoinGame",{ game: game.id, playerid:game.clients.length});
    }
}