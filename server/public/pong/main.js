function setupGame(clientConfig) {


	var pongGame = new pong.PongGame(clientConfig);

	var borderTop = new pong.Brick(0,0,io.canvas.width, 20, 0, 0,0 );
	var borderBottom = new pong.Brick(0,io.canvas.height-20, io.canvas.width, 20, 0, 0, 0);

	// MITTEL-LINIE =====================================================
	var center = (io.canvas.height-15) / 2;
	var no = io.canvas.height/30;
	for (var j = 0;j<no;j++) {
		var b = new pong.Brick(center, j*30, 20, 20, 0,0,0);
		pongGame.addObject(b);
	}


	// Wenn ich Master bin, stehe ich links und aktualisiere die Rechte Seite über die Updates
	var master = clientConfig.game.playerId === 0;
	if (master) {
		console.log("ERZEUGE MASTER SPIELER");
	} else {
		console.log("ERZEUGE MITSPIELER");
	}

    // Ball erzeugen
    var movingBall = new pong.MovingBall(master,pongGame,100,100);


	var playerLeft = new pong.PlayerWall(0, pongGame, movingBall, 0, 20, 20, io.canvas.height-20, 'blue');
	var playerRight = new pong.PlayerWall(1, pongGame, movingBall, io.canvas.width-20, 20, 20, io.canvas.height-20, 'gray');

	/*
	playerLeft.setOtherPlayer(playerRight);
	playerRight.setOtherPlayer(playerLeft);
	*/

//var playerWallLeft = new pong.PlayerWall(0,20,20, io.canvas.height-20)



	pongGame.addObject(pongGame);
	pongGame.addObject(borderTop);
	pongGame.addObject(borderBottom);
	pongGame.addObject(playerLeft);
	pongGame.addObject(playerRight);
	pongGame.addObject(movingBall);

	console.log("START!");
	pongGame.start();


}

///////////////////////////

function newGame() {

	console.log("new Game...");
	var gameServer = io.connect('http://localhost:3000');
	var clientCfg = createClientConfig(gameServer);

	createGame(clientCfg, function() {
		document.getElementById("game").style.visibility="visible";
		setupGame(clientCfg);

	});
}

function joinExistingGame() {
	var gameId = document.getElementById('inputGameId').value;

	console.log("gameId: " + gameId);
	var gameServer = io.connect('http://localhost:3000');
	var clientCfg = createClientConfig(gameServer);
	clientCfg.game.gameId = gameId;

	joinGame(clientCfg, function() {
		console.log("JOINED!");
		document.getElementById("game").style.visibility="visible";
		setupGame(clientCfg);
	});

}




///////////////////////////

