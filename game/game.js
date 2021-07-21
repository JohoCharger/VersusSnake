const Config = require("./config.js");
const Snake = require("./snake.js")

module.exports = class Game {
    constructor(io, code) {
        this.code = code;
        this.io = io;
        this.running = false;
        this.shouldQuit = false;
        this.player1 = null;
        this.player2 = null;
        this.player1Ready = false;
        this.player2Ready = false;
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
        this.apple.spawn();
    }

    update() {
        if (!this.running) {
            return;
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

        let s1 = this.snake1;
        let s2 = this.snake2;

        let p1died = false;
        let p2died = false;

        if (s1.headCollides(s2.pos.x + s2.vel.x, s2.pos.y + s2.vel.y)) {
            p1died = true;
            p2died = true;
        }
        for (let i = 0; i < s2.tail.length; i++) {
            if (s1.headCollides(s2.tail[i].x, s2.tail[i].y)) {
                p1died = true;
            }
        }
        for (let i = 0; i < s1.tail.length; i++) {
            if (s2.headCollides(s1.tail[i].x, s1.tail[i].y)) {
                p2died = true;
            }
        }
        if (s1.collidesBorderOrSelf()) {
            p1died = true;
        }
        if (s2.collidesBorderOrSelf()) {
            p2died = true;
        }

        if (p1died && p2died) {
            this.io.to(this.code).emit("display_message", "Tie!");
            this.running = false;
            this.shouldQuit = true;
        } else if (p1died) {
            this.player2.emit("display_message", "You won!");
            this.player1.emit("display_message", "You lost!");
            this.running = false;
            this.shouldQuit = true;
        } else if (p2died) {
            this.player1.emit("display_message", "You won!");
            this.player2.emit("display_message", "You lost!");
            this.running = false;
            this.shouldQuit = true;
        }

        this.player1.emit("update_length", this.snake1.trueLength);
        this.player2.emit("update_length", this.snake2.trueLength);
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

            this.player1.on("get_game_state", () => {
                this.player1.emit("game_state", JSON.stringify(this.toString()));
            });

            this.player1.on("game_input", code => {
                if (this.running) {
                    this.snake1.handleInput(code);
                } else {
                    this.player1Ready = true;
                    if (!this.player2Ready) {
                        this.player1.emit("display_message", "Waiting for player 2");
                    }
                    this.tryStart();
                }
            });

            this.player1.on("disconnect", () => {
                this.player1 = null;
                this.shouldQuit = true;
                this.io.to(this.code).emit("display_message","Player 1 disconnected");
            });
            this.player1.emit("display_message", "instructions");

        } else if (!this.player2) {
            this.player2 = socket;
            this.player2.on("get_game_state", () => {
                this.player2.emit("game_state", JSON.stringify(this.toString()));
            });

            this.player2.on("game_input", code => {
                if (this.running) {
                    this.snake2.handleInput(code);
                } else {
                    this.player2Ready = true;
                    if (!this.player1Ready) {
                        this.player2.emit("display_message", "Waiting for player 1");
                    }
                    this.tryStart();
                }
            });

            this.player2.on("disconnect", () => {
                this.player2 = null;
                this.shouldQuit = true;
                this.io.to(this.code).emit("display_message", "Player 2 disconnected");
            });
            this.player2.emit("display_message", "instructions");
        } else {
            return false;
        }
        return true;
    }

    isFull() {
        return (this.player1 && this.player2);
    }

    tryStart() { //TODO: Annoying bug
        if (this.player1Ready && this.player2Ready) {
            this.io.to(this.code).emit("display_message", "3");
            setTimeout(() => {
                this.io.to(this.code).emit("display_message", "2");
            }, 1000);
            setTimeout(() => {
                this.io.to(this.code).emit("display_message", "1");
            }, 2000);
            setTimeout(() => {
                this.io.to(this.code).emit("display_message", "GO!");
            }, 3000);
            setTimeout(() => {
                this.running = true;
                this.io.to(this.code).emit("display_message", "");
            }, 4000);
        }
    }
}