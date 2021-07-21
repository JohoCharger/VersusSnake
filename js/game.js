class Game {
    constructor() {
        this.canvas = document.querySelector("#game-canvas");
        this.context = this.canvas.getContext("2d");
        this.tailTextures1 = [];
        this.headTextures1 = [];
        this.tailTextures2 = [];
        this.headTextures2 = [];
        this.backgroundTexture = null;
        this.appleTexture = null;
        this.snakes = [];
        this.apple = {};
        this.running = false;
        this.gameEndText = "Game over";
    }

    toVector(vectorOrX, y = undefined) {
        if (y !== undefined) {
            return {x: vectorOrX, y: y};
        } else {
            return {x: vectorOrX.x, y: vectorOrX.y};
        }
    }

    createCornerBuffer(color) {
        const temp = document.createElement("canvas");
        temp.width = Config.tileSize;
        temp.height = Config.tileSize;
        const ctx = temp.getContext("2d");
        ctx.fillStyle = color;
        ctx.beginPath();
        const middlePoint = Config.tileSize - Config.snakeGap
        ctx.arc(middlePoint, middlePoint, middlePoint - Config.snakeGap, Math.PI, Math.PI * 1.5);
        ctx.lineTo(middlePoint, middlePoint);
        ctx.lineTo(0, middlePoint);
        ctx.fillRect(middlePoint, Config.snakeGap, Config.snakeGap, middlePoint - Config.snakeGap);
        ctx.fillRect(Config.snakeGap, middlePoint, middlePoint - Config.snakeGap, Config.snakeGap);
        ctx.fill();
        return temp;
    }

    createRotatedContext(reference, times = 1) {
        const temp = document.createElement("canvas");
        temp.width = Config.tileSize;
        temp.height = Config.tileSize;
        const ctx = temp.getContext("2d");
        ctx.save();
        for (let i = 0; i < times; i++) {
            ctx.translate(Config.tileSize, 0);
            ctx.rotate(90 * Math.PI / 180);
        }
        ctx.drawImage(reference, 0, 0);
        ctx.restore();
        return temp;
    }

    createHeadTextures(color, errorSquare) {
        const head = document.createElement("canvas");
        head.width = Config.tileSize;
        head.height = Config.tileSize;
        const ctx = head.getContext("2d");
        ctx.fillStyle = color;
        ctx.fillRect(
            Config.snakeGap,
            Config.tileSize / 2,
            Config.tileSize - Config.snakeGap * 2,
            Config.tileSize / 2
        );
        ctx.beginPath();
        ctx.arc(
            Config.tileSize / 2,
            Config.tileSize / 2,
            (Config.tileSize - Config.snakeGap * 2) / 2,
            Math.PI, 0
        );
        ctx.fill();

        return [
            head,
            this.createRotatedContext(head, 1),
            this.createRotatedContext(head, 2),
            this.createRotatedContext(head, 3),
            errorSquare
        ];
    }

    createTailTextures(color, errorSquare) {
        const verticalStraight = document.createElement("canvas");
        verticalStraight.width = Config.tileSize;
        verticalStraight.height = Config.tileSize;
        let ctx = verticalStraight.getContext("2d");
        ctx.fillStyle = color;
        ctx.fillRect(Config.snakeGap, 0, Config.tileSize - 2 * Config.snakeGap, Config.tileSize);

        const horizontalStraight = document.createElement("canvas");
        horizontalStraight.width = Config.tileSize;
        horizontalStraight.height = Config.tileSize;
        ctx = horizontalStraight.getContext("2d");
        ctx.fillStyle = color;
        ctx.fillRect(0, Config.snakeGap, Config.tileSize, Config.tileSize - 2 * Config.snakeGap);

        const corner = this.createCornerBuffer(color);
        return [
            corner,
            this.createRotatedContext(corner, 1),
            this.createRotatedContext(corner, 2),
            this.createRotatedContext(corner, 3),
            verticalStraight,
            horizontalStraight,
            errorSquare
        ];
    }

    initializeTextures() {

        const errorSquare = document.createElement("canvas");
        errorSquare.width = Config.tileSize;
        errorSquare.height = Config.tileSize;
        let ctx = errorSquare.getContext("2d");
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(0, 0, Config.tileSize, Config.tileSize);

        this.tailTextures1 = this.createTailTextures(Config.snakeColor1, errorSquare);
        this.tailTextures2 = this.createTailTextures(Config.snakeColor2, errorSquare);

        this.headTextures1 = this.createHeadTextures(Config.snakeColor1, errorSquare);
        this.headTextures2 = this.createHeadTextures(Config.snakeColor2, errorSquare);

        this.backgroundTexture = document.createElement("canvas");
        this.backgroundTexture.width = this.canvas.width;
        this.backgroundTexture.height = this.canvas.height;
        ctx = this.backgroundTexture.getContext("2d");
        let color = Config.bgColor1;
        for (let i = 0; i < Config.tileCount; i++) {
            if (Config.tileCount % 2 === 0) {
                color = color === Config.bgColor1 ? Config.bgColor2 : Config.bgColor1;
            }
            for (let j = 0; j < Config.tileCount; j++) {
                color = color === Config.bgColor1 ? Config.bgColor2 : Config.bgColor1;
                ctx.fillStyle = color;
                ctx.fillRect(
                    i * Config.tileSize,
                    j * Config.tileSize,
                    Config.tileSize,
                    Config.tileSize
                );
            }
        }

        this.appleTexture = document.createElement("canvas");
        this.appleTexture.width = Config.tileSize;
        this.appleTexture.height = Config.tileSize;
        ctx = this.appleTexture.getContext("2d");
        ctx.fillStyle = "#DB8979";
        ctx.beginPath();
        ctx.arc(
            Config.tileSize / 2,
            Config.tileSize / 2,
            Config.tileSize / 2 - Config.snakeGap / 2,
            0, Math.PI * 2
        )
        ctx.fill();
    }


    initialize() {
        this.canvas.width = Config.tileCount * Config.tileSize
        this.canvas.height = Config.tileCount * Config.tileSize
        this.canvas.focus();

        this.initializeTextures();

        this.snakes = [
            new Snake(this, Math.floor(Config.tileCount / 3), Config.tileCount - 2, this.headTextures1, this.tailTextures1),
            new Snake(this, Math.floor(Config.tileCount / 3 * 2), Config.tileCount - 2, this.headTextures2, this.tailTextures2)
        ];

        this.apple = {
            x: 0,
            y: 0,
            game: this,
            draw: function () {
                this.game.context.drawImage(
                    this.game.appleTexture,
                    this.x * Config.tileSize,
                    this.y * Config.tileSize
                );
            },
            spawn: function () {
                let positions = [];
                for (let i = 0; i < Config.tileCount; i++) {
                    for (let j = 0; j < Config.tileCount; j++) {
                        if (this.game.snakes[0].collides(i, j)) continue;
                        positions.push(this.game.toVector(i, j));
                    }
                }
                positions.forEach(pos => {
                    let selected = positions[Math.floor(Math.random() * positions.length)];
                    this.x = selected.x;
                    this.y = selected.y;
                }); //WTF ??? TODO: CHECK WTF IS HAPPENING HERE
            }

        }
        this.apple.spawn();
        this.draw();

        Config.setFPS(7);
        this.running = false;
    }

    handleInput(code) {
        if (code === "ArrowUp" ||
            code === "ArrowDown" ||
            code === "ArrowLeft" ||
            code === "ArrowRight"
        ) {
            this.snakes[1].handleInput(code);
        } else if (code !== "KeyW" ||
            code !== "KeyS" ||
            code !== "KeyA" ||
            code !== "KeyD"
        ) {
            this.snakes[0].handleInput(code);
        }
    }

    update(deltaTime) {
        for (let i = 0; i < this.snakes.length; i++) {
            this.snakes[i].update();
            if (this.snakes[i].headCollides(this.apple.x, this.apple.y)) {
                this.snakes[i].grow();
                this.apple.spawn();
            }
        }

        let s1 = this.snakes[0];
        let s2 = this.snakes[1];

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
            this.gameEndText = "Tie!";
            this.running = false;
        } else if (p1died) {
            this.gameEndText = "Player 2 won!";
            this.running = false;
        } else if (p2died) {
            this.gameEndText = "Player 1 won!";
            this.running = false;
        }
    }

    draw() {
        this.context.drawImage(this.backgroundTexture, 0, 0);
        this.apple.draw();
        for (let i = 0; i < this.snakes.length; i++) {
            this.snakes[i].draw();
        }
    }

    getScore() {
        return this.snakes[0].trueLength;
    }
}