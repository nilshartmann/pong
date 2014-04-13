/**
 * Created by markusklink on 13.04.14.
 */

var gameServer = io.connect('http://localhost:3000');

var pingServer = function() {
    var time = Date.now()
    gameServer.emit("createGame", {"time" : time })
    gameServer.on("ackCreateGame", function(data) {
        console.log(data);
    })

}

pingServer()