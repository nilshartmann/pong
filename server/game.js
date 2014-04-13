/**
 * Created by rene on 13.04.14.
 */

var nextGame=0;

var games = [];

exports.createGame=function(data) {

    var game= {
        id: nextGame++,
        timeDelta: Date.now()-data.basetime
    }

    games.push(game);

    return { game: game.id};
}