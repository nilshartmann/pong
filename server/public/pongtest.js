/**
 * Created by rene on 13.04.14.
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
var callbackFunctions1 = callbackFunctions(gameCfg1,clientCfg1);

var gameCfg2 = createGameConfig();
var clientCfg2 = createClientConfig();
var callbackFunctions2 = callbackFunctions(gameCfg2,clientCfg2);


registerCallbacks(gameServer1, gameCfg1, callbackFunctions1);
registerCallbacks(gameServer2, gameCfg2, callbackFunctions2);

createGame(gameServer1,gameCfg1, callbackFunctions1, function () {
    gameCfg2.gameId = gameCfg1.gameId;
    ping(gameServer2,clientCfg2);
    ping(gameServer2,clientCfg2);
    ping(gameServer2,clientCfg2, function (latency) {
        joinGame(gameServer2,gameCfg2, callbackFunctions2, function () {
            gameCfg2.ball.x = 1;
            gameCfg2.ball.y = 1;

            ballUpdate(gameServer2,gameCfg2);

            gameCfg1.players[0].paddle.pos=10;
            gameCfg2.players[1].paddle.pos=20;
            paddleUpdate(gameServer2,gameCfg2);
            paddleUpdate(gameServer1,gameCfg1);

            gameCfg1.ball.x = 2;
            gameCfg1.ball.y = 2;

            ballUpdate(gameServer1,gameCfg1);
        });
    });


});


