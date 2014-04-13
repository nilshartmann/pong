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

var playerLeft = new pong.Player(0, 20, 20, io.canvas.height-20, 'blue');
var playerRight = new pong.Player(io.canvas.width-20, io.canvas.height-20, 'gray', true);

//var playerWallLeft = new pong.PlayerWall(0,20,20, io.canvas.height-20)

var movingBall = new pong.MovingBall(100,100);

pongGame.addObject(borderTop);
pongGame.addObject(borderBottom);
pongGame.addObject(playerLeft);
pongGame.addObject(playerRight);
pongGame.addObject(movingBall);
pongGame.start();