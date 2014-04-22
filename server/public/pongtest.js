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
var clientCfg1 = createClientConfig(gameServer1);
var clientCfg2 = createClientConfig(gameServer2);

createGame(clientCfg1, function () {
    clientCfg2.game.gameId = clientCfg1.game.gameId;
    joinGame(clientCfg2, function () {
        clientCfg2.game.ball.x = 1;
        clientCfg2.game.ball.y = 1;

        ballUpdate(clientCfg2);

        clientCfg1.game.players[0].paddle.pos = 10;
        clientCfg2.game.players[1].paddle.pos = 20;
        paddleUpdate(clientCfg1);
        paddleUpdate(clientCfg2);

        clientCfg1.game.ball.x = 2;
        clientCfg1.game.ball.y = 2;

        ballUpdate(clientCfg1);
    });
});


