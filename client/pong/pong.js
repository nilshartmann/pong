/**
 *
 */
var pong = pong || {};

// ------------------------------------------------------------------------------------------------------
// ----- B R I C K
// ------------------------------------------------------------------------------------------------------
(function (_extends, SimpleLogic, GameObject, context) {

	function Brick(x, y, w,h, color) {
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

	pong.Brick = Brick;

}(util._extends, game.SimpleLogic, game.GameObject, io.context));

// ------------------------------------------------------------------------------------------------------
// M O V I N G B A L L
// ------------------------------------------------------------------------------------------------------
(function (_extends, _mixin, canvas, GameObject, MovingObject, Ball) {
	"use strict";

	function MovingBall(x,y) {
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

	//MovingBall.prototype.control = control;
	MovingBall.prototype.update = function (deltaT) {
		//this.accelerate(deltaT);
		this.inertiaMove(deltaT);
	};

	pong.MovingBall = MovingBall;

}(util._extends,util._mixin,io.canvas,game.GameObject,game.MovingObject,game.Ball));

// ------------------------------------------------------------------------------------------------------
// ----- P L A Y E R
// ------------------------------------------------------------------------------------------------------
(function (_extends, _mixins, canvas, MovingObject, Brick) {
	"use strict";

	function Player(x,y,simulate) {
		Brick.call(this, x, y, 20, 80, 255, 0, 0);
		this.stepSize = 5;
		this.simulate = simulate;
		if (this.simulate) {
			this.direction = 'down';
		}
	}

	_extends(Player, Brick);
	_extends(Player, Brick);

	Player.prototype.update = function () {

		var pos = this.config.position;

		if (!this.simulate) {
			var c = io.control();
			if (c.up) {
				this.direction = 'up';
			} else if (c.down) {
				this.direction = 'down';
			}
		}


		if ('down' === this.direction) {
			pos.y = pos.y + this.stepSize;
		} else if ('up' === this.direction) {
			pos.y = pos.y - this.stepSize;
		}

		// 20 ist die Höhe des Rahmens oben und unten
		if (pos.y < 20) {
			pos.y = 20;
			if (this.simulate) {
				this.direction = 'down';
			}
		} else if (pos.y > canvas.height - 100) {
			pos.y = canvas.height - 100;
			if (this.simulate) {
				this.direction = 'up';
			}
		}
	};

	// Export Player
	pong.Player = Player;
}(util._extends, util._mixin, io.canvas, game.MovingObject, pong.Brick));

// ------------------------------------------------------------------------------------------------------
// ----- G A M E
// ------------------------------------------------------------------------------------------------------
(function (_extends, SimpleLogic) {
	"use strict";

	function PongGame() {
		PongGame._super.constructor.call(this, {
			gameName: 'pong',
			description: 'Pong'
		});
	}

	_extends(PongGame, SimpleLogic);

	pong.PongGame = PongGame;

}(util._extends, game.SimpleLogic));


