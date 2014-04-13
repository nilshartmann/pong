/**
 *
 */
var pong = pong || {};

(function() {

	pong.CONSTANTS = {



	}

}());

// ------------------------------------------------------------------------------------------------------
// ----- B R I C K
// ------------------------------------------------------------------------------------------------------
(function (_extends, SimpleLogic, GameObject, context) {

	function Brick(x, y, w,h, r, g, b) {
		var config = {
			position: {
				x: x,
				y: y
			},
			width: w,
			height: h,
			color: 'rgb(' + r + ',' + g + ',' + b + ')'
		};
		GameObject.call(this, config);
	}

	_extends(Brick, GameObject);

	Brick.prototype.draw = function () {
		context.fillStyle = this.config.color;
		context.fillRect(this.config.position.x, this.config.position.y, 70, 30);
	};

	pong.Brick = Brick;

}(util._extends, game.SimpleLogic, game.GameObject, io.context));

// ------------------------------------------------------------------------------------------------------
// ----- P L A Y E R
// ------------------------------------------------------------------------------------------------------
(function (_extends, Brick, canvas) {
	"use strict";

	function Player() {
		Brick.call(this, (canvas.height - 20) / 2, canvas.height - 40, 255, 0, 0);
		this.stepSize = 5;
	}

	_extends(Player, Brick);

	Player.prototype.update = function () {
		var c = io.control();
		var pos = this.config.position;

		if (c.right) {
			this.direction = 'right';
		} else if (c.left) {
			this.direction = 'left';
		}

		if ('right' === this.direction) {
			pos.x = pos.x + this.stepSize;
		} else if ('left' === this.direction) {
			pos.x = pos.x - this.stepSize;
		}

		if (pos.x < 1) {
			pos.x = 1;
			this.direction = 'right';
		} else if (pos.x > canvas.width - 70) {
			pos.x = canvas.width - 70;
			this.direction = 'left';
		}
	};

	// Export Player
	pong.Player = Player;

})(util._extends, pong.Brick, io.canvas, io.context);

// ------------------------------------------------------------------------------------------------------
// ----- G A M E
// ------------------------------------------------------------------------------------------------------
(function (_extends, SimpleLogic, Ball, canvas) {
	"use strict";

	function PongGame() {
		PongGame._super.constructor.call(this, {
			gameName: 'pong',
			description: 'Pong'
		});
	}

	_extends(PongGame, SimpleLogic);

	pong.PongGame = PongGame;

}(util._extends, game.SimpleLogic, game.Ball, io.canvas));


