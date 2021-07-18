const Config = require("./config.js");
const Snake = require("./snake.js")

module.exports = class Game {
    constructor(io, code) {
        this.code = code;
        this.io = io;
        this.running = false;
        this.player1 = null;
        this.player2 = null;
        this.snake1 = new Snake(this, Math.floor(Config.tileCount / 3), Config.tileCount - 2);
        this.snake2 = new Snake(this, Math.floor(Config.tileCount / 3 * 2), Config.tileCount - 2);
        this.apple = {
            x: 0,
            y: 0,
            game: this,
            spawn: function () {
                let positions = [];
                for (let i = 0; i < Config.tileCount; i++) {
                    for (let j = 0; j < Config.tileCount; j++) {
                        if (this.game.snake1.collides(i, j) || this.game.snake2.collides(i, j)) continue;
                        positions.push({x: i, y: j});
                    }
                }
                let selected = positions[Math.floor(Math.random() * positions.length)];
                this.x = selected.x;
                this.y = selected.y;
            },
            toString: function () {
                return {
                    x: this.x,
                    y: this.y
                }
            }
        }
    }

    update() {
        if (!this.running) {
            return false;
        }

        this.snake1.update();
        if (this.snake1.headCollides(this.apple.x, this.apple.y)) {
            this.snake1.grow();
            this.apple.spawn();
        }

        this.snake2.update();
        if (this.snake2.headCollides(this.apple.x, this.apple.y)) {
            this.snake2.grow();
            this.apple.spawn();
        }
        this.io.to(this.code).emit("game_state", JSON.stringify(this.toString()));
    }

    toString() {
        return {
            snake1: this.snake1.toString(),
            snake2: this.snake2.toString(),
            apple: this.apple.toString()
        }
    }

    join(socket) {
        if (!this.player1) {
            this.player1 = socket;
        } else if (!this.player2) {
            this.player2 = socket;
        } else {
            return false;
        }

        if (this.player1 && this.player2) {
            this.running = true;
        }
        return true;
    }
}