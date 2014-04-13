/**
 * Created by markusklink on 13.04.14.
 */

var gameServer = io.connect('http://localhost:3000');

var pingServer = function() {
    var time = Date.now()
    gameServer.emit("clientTime", {"time" : time })

}

pingServer()