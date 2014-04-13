/**
 * Created by markusklink on 13.04.14.
 */

var initialConfig = function () {
    return {
        gameId: 0,
        playerId: 0,
        gameTime: Date.now(),
        latenz: undefined,
        players: [],
        ball: {
            x: 0,
            y: 0,
            dx: 0,
            dy: 0,
            speed: 0
        }};
}