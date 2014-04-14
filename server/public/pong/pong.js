/**
 *
 */
var pong = pong || {};

// ------------------------------------------------------------------------------------------------------
// ----- B R I C K
// ------------------------------------------------------------------------------------------------------
(function (_extends, SimpleLogic, GameObject, context) {

	function Brick(x, y, w, h, color) {
		var config = {
			position: {
				x: x,
				y: y
			},
			width: w,
			height: h,
			color: color || 'black'
		};
		GameObject.call(this, config);
	}

	_extends(Brick, GameObject);

	Brick.prototype.draw = function () {
		context.fillStyle = this.config.color;
		context.fillRect(this.config.position.x, this.config.position.y, this.config.width, this.config.height);
	};

	Brick.prototype.collidesWith = function (ball) {
		var pos = this.config.position;
		pos.w = this.config.width;
		pos.h = this.config.height;
		var distX = Math.abs(ball.position.x - pos.x - pos.w / 2);
		var distY = Math.abs(ball.position.y - pos.y - pos.h / 2);

		if (distX > (pos.w / 2 + ball.r)) {
			return false;
		}
		if (distY > (pos.h / 2 + ball.r)) {
			return false;
		}

		if (distX <= (pos.w / 2)) {
			return true;
		}
		if (distY <= (pos.h / 2)) {
			return true;
		}

		var dx = distX - pos.w / 2;
		var dy = distY - pos.h / 2;
		return (dx * dx + dy * dy <= (ball.r * ball.r));
	};


	pong.Brick = Brick;

}(util._extends, game.SimpleLogic, game.GameObject, io.context));

// ------------------------------------------------------------------------------------------------------
// M O V I N G B A L L
// ------------------------------------------------------------------------------------------------------
(function (_extends, _mixin, canvas, GameObject, MovingObject, Ball) {
	"use strict";

	function MovingBall(x, y) {
		this.velocity = {
			x: 10,
			y: 100
		};
		this.maxSpeed = 2;
		this.gravity = 0;
		this.acceleration = 0.1;
		this.friction = 0;

		var config = {
			position: {
				x: x,
				y: y
			},
			r: 10,
			color: 'red'
		};


		GameObject.call(this, config);
		Ball.call(this, config);

		this.x = config.position.x;
		this.y = config.position.y;
	}

	_extends(MovingBall, Ball);
	_mixin(MovingBall, MovingObject);

	MovingBall.prototype.update = function (deltaT) {
		//this.inertiaMove(deltaT);
	};

	MovingBall.prototype.bounceOnEdges = function () {
		if (this.position.x < this.r) {
			this.position.x = io.canvas.width - this.r;
		}
		if (this.position.x > io.canvas.width - this.r) {
			this.position.x = this.r;
		}
		if (this.position.y < this.r + 20) {
			this.position.y = 20 + this.r;
			this.velocity.y = -this.velocity.y;
		}
		if (this.position.y >= io.canvas.height - this.r - 20) {
			this.position.y = io.canvas.height - this.r - 20;
			this.velocity.y = -this.velocity.y;
		}
	};

	pong.MovingBall = MovingBall;

}(util._extends, util._mixin, io.canvas, game.GameObject, game.MovingObject, game.Ball));

// ------------------------------------------------------------------------------------------------------
// ----- P L A Y E R W A L L
// ------------------------------------------------------------------------------------------------------
(function (_extends, _mixins, context, canvas, MovingObject, Brick) {
	"use strict";

	function PlayerWall(remotePlayer, pongGame, ball, x, y, w, h, color) {
		Brick.call(this, x, y, w, h, 'white');
		this.stepSize = 5;
		this.points = 10;
		this.pongGame = pongGame;
		this.ball = ball;
		this.remotePlayer = remotePlayer;

		this.paddle = new Brick(x, (io.canvas.height - 20) / 2, 20, 80, color);

		var me = this;
		this.master = this.pongGame.clientConfig.game.playerId === 0;

		if (this.remotePlayer) {
			this.pongGame.clientConfig.callbacks.onPaddleUpdate = function () {
				me.pongGame.clientConfig.game.players.forEach(function (p) {
					if (p.playerId !== me.pongGame.clientConfig.game.playerId) {
						var newPaddlePos = p.paddle.pos;

						// sollte immer remote sein
						console.log((me.remotePlayer ? "REMOTE" : "ICH") + " newPaddlePos: " + newPaddlePos);
						me.paddle.config.position.y = newPaddlePos;
					}
				});
			};
		}
	}

	_extends(PlayerWall, Brick);

	PlayerWall.prototype.points = function () {
		return this.points();
	};

	PlayerWall.prototype.setOtherPlayer = function (player) {
		this.otherPlayer = player;
	};


	PlayerWall.prototype.draw = function () {
		//Brick.prototype.draw.call(this);
		// Nur den "Paddle" zeichnen

		this.paddle.draw();

		io.context.fillStyle = 'black';
		io.context.font = '12px sans-serif';
		var x = (this.config.position.x === 0 ? 0 : 500);
		io.context.fillText("Punkte: " + this.points, x, io.canvas.height - 40);
	};

	PlayerWall.prototype.bounceOnPaddleCollision = function () {

		var ball = this.ball;
		var pos = this.paddle.config.position;

		var oldX = ball.position.x,
			oldY = ball.position.y,
			oldVelocityX = ball.velocity.x,
			oldVelocityY = ball.velocity.y;

		if (ball.velocity.x < 0 && ball.position.x - ball.r < pos.x + this.paddle.width) {
			ball.velocity.x = -ball.velocity.x;
			ball.position.x = pos.x + this.paddle.width + ball.r;
		}

		if (ball.velocity.x > 0 && ball.position.x + ball.r > pos.x) {
			ball.position.x = pos.x - ball.r;
			ball.velocity.x = -ball.velocity.x;

			// return;   ??????????????????????????????????????
		}

		if (ball.x + ball.r >= pos.x) {
			ball.x = pos.x - ball.r;
			ball.velocity.x = -ball.velocity.x;
		}
		if (pos.y < ball.r) {
			ball.y = ball.r;
			ball.velocity.y = -ball.velocity.y;
		}
		if (pos.y >= io.canvas.height - ball.r - 20) {
			ball.y = io.canvas.height - ball.r - 20;
			ball.velocity.y = -ball.velocity.y;
		}

		/*
		 this.pongGame.clientConfig.game.ball.x = ball.x;
		 this.pongGame.clientConfig.game.ball.y = ball.y;
		 this.pongGame.clientConfig.game.ball.dx = ball.velocity.x;
		 this.pongGame.clientConfig.game.ball.dy = ball.velocity.y;
		 */
		// this.pongGame.clientConfig.ballUpdate(this.pongGame.clientConfig);
	};

	PlayerWall.prototype.update = function () {

		var pos = this.paddle.config.position;
		if (this.paddle.collidesWith(this.ball)) {
			this.bounceOnPaddleCollision();
			return;
		}

		if (this.collidesWith(this.ball)) {
			if (!this.inWall) {
				this.points--;
			}

			this.inWall = true;
		} else {
			this.inWall = false;
		}


		if (!this.remotePlayer) {
			var c = io.control();
			if (c.up) {
				this.direction = 'up';
			} else if (c.down) {
				this.direction = 'down';
			}

			var oldY = pos.y;

			if ('down' === this.direction) {
				pos.y = pos.y + this.stepSize;
			} else if ('up' === this.direction) {
				pos.y = pos.y - this.stepSize;
			}

			// 20 ist die Höhe des Rahmens oben und unten
			if (pos.y < 20) {
				pos.y = 20;
			} else if (pos.y > canvas.height - 100) {
				pos.y = canvas.height - 100;
			}

			// WORKAROUND (Bewegen nur, wenn Taste gedrückt ist)
			this.direction = null;

			if (oldY !== pos.y) {
				console.log((this.left ? "LINKS" : "RECHT") + " NEUE PADDLE POSITION: " + oldY + " -> " + pos.y);
				this.pongGame.clientConfig.game.players[this.pongGame.clientConfig.game.playerId].paddle.pos = pos.y;
				paddleUpdate(this.pongGame.clientConfig)
			}
		}
	};


	// Export PlayerWall
	pong.PlayerWall = PlayerWall;
}(util._extends, util._mixin, io.context, io.canvas, game.MovingObject, pong.Brick));

// ------------------------------------------------------------------------------------------------------
// ----- G A M E
// ------------------------------------------------------------------------------------------------------
(function (_extends, SimpleLogic) {
	"use strict";

	function PongGame(clientConfig) {
		PongGame._super.constructor.call(this, {
			gameName: 'pong',
			description: 'Pong'
		});

		this.clientConfig = clientConfig;
	}

	_extends(PongGame, SimpleLogic);

	PongGame.prototype.draw = function () {
		io.context.fillStyle = 'black';
		io.context.font = '12px sans-serif';
		io.context.fillText("GameId: " + this.clientConfig.game.gameId, 20, 60);
	};
	pong.PongGame = PongGame;

}(util._extends, game.SimpleLogic));


