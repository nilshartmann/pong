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

var createClientConfig = function() {
    return {
        latency: undefined,

    }
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