/**
 *
 */
var pong = pong || {};

// ------------------------------------------------------------------------------------------------------
// ----- B R I C K
// ------------------------------------------------------------------------------------------------------
(function (_extends, SimpleLogic, GameObject, context) {

	function Brick(config) {
		GameObject.call(this, config);
	}

    function Brick(xOrConfig, y, w, h, color) {
        if(arguments.length>1) {
            var config = {
                position: {
                    x: xOrConfig,
                    y: y
                },
                width: w,
                height: h,
                color: color || 'black'
            };
            GameObject.call(this, config);
        } else {
            GameObject.call(this, xOrConfig);
        }
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

	function MovingBall(master,pongGame, x, y) {
        var config =         {
            r: 10,
            color: 'red',
            velocity: {
                x: 100,
                y: 10
            },
            maxSpeed: 2,
            position: {
                x: x,
                y: y
            },
            gravity: 0.00,
            acceleration: 0.1,
            friction: 0
        };

        MovingObject.call(this, config);
        Ball.call(this, config);

        this.master=master;
        this.pongGame=pongGame;

        var me=this;
        this.pongGame.clientConfig.callbacks.onBallUpdate = function () {
            me.position.x=me.pongGame.clientConfig.game.ball.x;
            me.position.y=me.pongGame.clientConfig.game.ball.y;
            me.velocity.x=me.pongGame.clientConfig.game.ball.dx;
            me.velocity.y=me.pongGame.clientConfig.game.ball.dy;
            var deltaT=getGametime(me.pongGame.clientConfig)-me.pongGame.clientConfig.game.ball.gameTime;
            me.inertiaMove(deltaT);
        };
	}

	_extends(MovingBall, Ball);
	_mixin(MovingBall, MovingObject);

	MovingBall.prototype.update = function (deltaT) {
		this.inertiaMove(deltaT);
	};

	MovingBall.prototype.bounceOnEdges = function () {
        var changed=false;
		if (this.position.x < this.r) {
			this.position.x = io.canvas.width - this.r;
            changed=true;
		}
		if (this.position.x > io.canvas.width - this.r) {
			this.position.x = this.r;
            changed=true;
		}
		if (this.position.y < this.r + 20) {
			this.position.y = 20 + this.r;
			this.velocity.y = -this.velocity.y;
            changed=true;
		}
		if (this.position.y >= io.canvas.height - this.r - 20) {
			this.position.y = io.canvas.height - this.r - 20;
			this.velocity.y = -this.velocity.y;
            changed=true;
		}

        if(this.master && changed) {
            this.pongGame.clientConfig.game.ball.x=this.position.x;
            this.pongGame.clientConfig.game.ball.y=this.position.y;
            this.pongGame.clientConfig.game.ball.dx=this.velocity.x;
            this.pongGame.clientConfig.game.ball.dy=this.velocity.y;
            ballUpdate(this.pongGame.clientConfig);
        }
	};

	pong.MovingBall = MovingBall;

}(util._extends, util._mixin, io.canvas, game.GameObject, game.MovingObject, game.Ball));

// ------------------------------------------------------------------------------------------------------
// ----- P L A Y E R W A L L
// ------------------------------------------------------------------------------------------------------
(function (_extends, _mixins, context, canvas, MovingObject, Brick) {
	"use strict";

	function PlayerWall(playerId, pongGame, ball, x, y, w, h, color) {
        var config = {
            position: {
                x: x,
                y: (io.canvas.height - 20) /2
            },
            width: 20,
            height: 80,
            color: color
        };
		Brick.call(this, config);
		this.stepSize = 5;
		this.points = 10;
		this.pongGame = pongGame;
		this.ball = ball;
		this.playerId = playerId; //lokale PlayyerId


        var pointConfig = {
            position: {
                x: x,
                y: y
            },
            width: w,
            height: h,
            color: 'white'
        };

        this.pointWall = new Brick(pointConfig);

		var me = this;
        this.pongGame.clientConfig.callbacks.onPaddleUpdate = function () {
            me.pongGame.clientConfig.game.players.forEach(function (p) {
                if (p.playerId === me.playerId) {
                    var newPaddlePos = p.paddle.pos;

                    console.log("newPaddlePos: " + newPaddlePos);
                    me.paddle.config.position.y = newPaddlePos;
                }
            });
        };
	}

	_extends(PlayerWall, Brick);

	PlayerWall.prototype.points = function () {
		return this.points;
	};


	PlayerWall.prototype.draw = function () {
		Brick.prototype.draw.call(this);

		io.context.fillStyle = 'black';
		io.context.font = '12px sans-serif';
		var x = (this.config.position.x === 0 ? 0 : 500);
		io.context.fillText("Punkte: " + this.points, x, io.canvas.height - 40);
	};

	PlayerWall.prototype.bounceOnPaddleCollision = function () {

		var ball = this.ball;
		var pos = this.config.position;
        var changed=false;

		if (ball.velocity.x < 0 && ball.position.x - ball.r < pos.x + this.config.width) {
			ball.velocity.x = -ball.velocity.x;
			ball.position.x = pos.x + this.config.width + ball.r;
            changed=true;
		}else if (ball.velocity.x > 0 && ball.position.x + ball.r > pos.x) {
			ball.position.x = pos.x - ball.r;
			ball.velocity.x = -ball.velocity.x;
            changed=true;
			// return;   ??????????????????????????????????????
		}

		if (ball.x + ball.r >= pos.x) {
			ball.x = pos.x - ball.r;
			ball.velocity.x = -ball.velocity.x;
            changed=true;
		} else if (pos.y < ball.r) {
			ball.y = ball.r;
			ball.velocity.y = -ball.velocity.y;
            changed=true;
		}
		if (pos.y >= io.canvas.height - ball.r - 20) {
			ball.y = io.canvas.height - ball.r - 20;
			ball.velocity.y = -ball.velocity.y;
            changed=true;
		}

        if(this.playerId===this.pongGame.clientConfig.game.playerId && changed) {
            this.pongGame.clientConfig.game.ball.x=ball.position.x;
            this.pongGame.clientConfig.game.ball.y=ball.position.y;
            this.pongGame.clientConfig.game.ball.dx=ball.velocity.x;
            this.pongGame.clientConfig.game.ball.dy=ball.velocity.y;
            ballUpdate(this.pongGame.clientConfig);
        }
	};

	PlayerWall.prototype.update = function () {

		if (this.collidesWith(this.ball)) {
			this.bounceOnPaddleCollision();
			return;
		}

		if (this.pointWall.collidesWith(this.ball)) {
			if (!this.inWall) {
				this.points--;
			}

			this.inWall = true;
		} else {
			this.inWall = false;
		}


		if (this.playerId===this.pongGame.clientConfig.game.playerId) {
			var c = io.control();
			if (c.up) {
				this.direction = 'up';
			} else if (c.down) {
				this.direction = 'down';
			}

            var pos = this.config.position;
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

			if (oldY !== pos.y) {
				console.log("VERSENDE NEUE PADDLE POSITION: " + oldY + " -> " + pos.y);
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


