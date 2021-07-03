const Config = require("./config");

module.exports = class Snake {
    constructor(game, x, y) {
        this.game = game;
        this.vel = {x: 0, y: -1};
        this.velQueue = [];
        this.pos = {x: x, y: y};
        this.trueLength = 5;
        this.tail = [];

        this.velToTexID = {
            "-10-10": 5,
            "1010": 5,
            "0-10-1": 4,
            "0101": 4,
            "0-110": 2,
            "1001": 3,
            "-100-1": 1,
            "01-10": 0,
            "-1001": 2,
            "0-1-10": 3,
            "0110": 1,
            "100-1": 0,
            "0000": 4,
            "1000": 5,
            "-1000": 5,
            "0100": 4,
            "0-100": 4
        };
    }

    update() {
        let lastVel = { x: this.vel.x, y: this.vel.y };
        if (this.velQueue.length) {
            let nextVel = this.velQueue.shift();
            this.vel = { x: nextVel.x, y: nextVel.y };
        }

        let a = String(this.vel.x) + String(this.vel.y) + String(lastVel.x) + String(lastVel.y);
        let textureID = this.velToTexID[a];
        if (!(a in this.velToTexID)) textureID = 6;

        this.tail.unshift({
            x: this.pos.x,
            y: this.pos.y,
            textureID: textureID
        });

        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;

        if (this.tail.length === this.trueLength) {
            this.tail.pop();
        }
    }

    handleInput(code) {
        if (code === "ArrowLeft" || code === "KeyA") {
            this.queueInput(-1, 0);
        } else if (code === "ArrowRight" || code === "KeyD") {
            this.queueInput(1, 0);
        } else if (code === "ArrowUp" || code === "KeyW") {
            this.queueInput(0, -1);
        } else if (code === "ArrowDown" || code === "KeyS") {
            this.queueInput(0, 1);
        }
    }

    queueInput(x, y) {
        if (this.vel.x === 0 && this.vel.y === 0) {
            this.velQueue.push(this.game.toVector(x, y));
            return;
        }
        if (this.velQueue.length === 0) {
            if (x === this.vel.x || y === this.vel.y)
                return;
            else this.velQueue.push(this.game.toVector(x, y));
        }
        let lastInput = this.velQueue[this.velQueue.length - 1];
        if (x === lastInput.x || y === lastInput.y) return;
        this.velQueue.push(this.game.toVector(x, y));
    }
    /*
    draw() {
        let headTexture = 4;
        if (this.vel.y === -1) {
            headTexture = 0;
        } else if (this.vel.x === 1) {
            headTexture = 1;
        } else if (this.vel.y === 1) {
            headTexture = 2;
        } else if (this.vel.x === -1) {
            headTexture = 3;
        } else if (this.vel.x === 0 && this.vel.y === 0) {
            headTexture = 0;
        }

        this.game.context.drawImage(
            this.headTextures[headTexture],
            this.pos.x * Config.tileSize,
            this.pos.y * Config.tileSize
        );

        this.tail.forEach(tailPiece => {
            this.game.context.drawImage(
                this.tailTextures[tailPiece.textureID],
                tailPiece.x * Config.tileSize,
                tailPiece.y * Config.tileSize
            );
        });
    }*/

    headCollides(x, y) {
        return this.pos.x === x && this.pos.y === y;
    }

    collides(x, y) {
        if (this.pos.x === x && this.pos.y === y) return true;
        for (let i = 0; i < this.tail.length; i++) {
            if (this.tail[i].x === x && this.tail[i].y === y) return true;
        }
        return false;
    }

    collidesBorderOrSelf() {
        if (this.pos.x === -1 ||
            this.pos.y === -1 ||
            this.pos.x === Config.tileCount ||
            this.pos.y === Config.tileCount
        ) return true;
        for (let i = 0; i < this.tail.length; i++) {
            if (this.headCollides(this.tail[i].x, this.tail[i].y)) {
                return true;
            }
        }
    }

    grow() {
        this.trueLength++;
    }

    toString() {
        return {
            tail: this.tail,
            pos: this.pos,
            vel: this.vel
        }
    }
}