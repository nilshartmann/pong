///////////////////////////

function newGame() {

	var gameServer = io.connect('http://localhost:3000');


}




///////////////////////////


var pongGame = new pong.PongGame();

var borderTop = new pong.Brick(0,0,io.canvas.width, 20, 0, 0,0 );
var borderBottom = new pong.Brick(0,io.canvas.height-20, io.canvas.width, 20, 0, 0, 0);

var  center = (io.canvas.height-15) / 2;
var no = io.canvas.height/30;

console.log("no: " + no);
console.log("center: " + center);

for (var j = 0;j<no;j++) {
	var b = new pong.Brick(center, j*30, 20, 20, 0,0,0);
	pongGame.addObject(b);
}

var movingBall = new pong.MovingBall(100,100);
var playerLeft = new pong.PlayerWall(movingBall, 0, 20, 20, io.canvas.height-20, 'blue');
var playerRight = new pong.PlayerWall(movingBall, io.canvas.width-20, 20, 20, io.canvas.height-20, 'gray');

//var playerWallLeft = new pong.PlayerWall(0,20,20, io.canvas.height-20)



pongGame.addObject(borderTop);
pongGame.addObject(borderBottom);
pongGame.addObject(playerLeft);
pongGame.addObject(playerRight);
pongGame.addObject(movingBall);
pongGame.start();