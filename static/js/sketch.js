const scoreCounter = document.querySelector(".score-counter"); //TODO: Color scheme??
const messageBox = document.querySelector(".message-box");
let player1readyText =  null;
let player2readyText = null;

let game;

let player1ready = false;
let player2ready = false;

let lastTime = 0;
let accumulator = 0;
function run(time=performance.now()) {
    const deltaTime = time - lastTime;
    lastTime = time;
    if (game.running) {
        accumulator += deltaTime;
        if (accumulator >= Config.frameTime) {
            while (accumulator >= Config.frameTime && game.running) {
                accumulator -= Config.frameTime;
                game.update(deltaTime);
            }
            scoreCounter.textContent = String(game.getScore());
            game.draw();
        }
    } else {
        gameOver();
        return;
    }

    requestAnimationFrame(run);
}

function gameOver() {
    setMessageBoxContents("#game-over-template");
    document.querySelector("#game-over-text").textContent = game.gameEndText;
    showMessageBox();
}

function firstKeystrokeListener(event) {
    let code = event.code;

    if (code === "KeyW" ||
        code === "KeyS" ||
        code === "KeyA" ||
        code === "KeyD"
    ) {

        player1ready = true;
        player1readyText.style.color = "green";
    }

    if (code === "ArrowUp" ||
        code === "ArrowDown" ||
        code === "ArrowLeft" ||
        code === "ArrowRight"
    ) {
        player2ready = true;
        player2readyText.style.color = "green";
    }

    if (player1ready && player2ready) {
        document.querySelector(".instructions").style.display = "none";
        document.querySelector(".timer").style.display = "block";
        const timer = document.querySelector("#game-start-timer");
        setTimeout(() => {
            timer.textContent = "2";
        }, 1000);
        setTimeout(() => {
            timer.textContent = "1";
        }, 2000);
        setTimeout(() => {
            hideMessageBox();
            window.removeEventListener("keydown", firstKeystrokeListener);
            window.addEventListener("keydown", e => { game.handleInput(e.code); });
            game.running = true;
            lastTime = performance.now();
            run();
        }, 3000);
    }
}

function hideMessageBox() {
    messageBox.style.display = "none";
}

function showMessageBox() {
    messageBox.style.display = "block";
}

function setMessageBoxContents(templateID) {
    let templateContents = document.querySelector(templateID);
    messageBox.innerHTML = "";
    messageBox.appendChild(templateContents.content.cloneNode(true));
}

function start() {
    game = new Game();
    game.initialize();

    setMessageBoxContents("#instructions-template");
    showMessageBox();

    player1readyText = document.querySelector("#player1-ready");
    player2readyText = document.querySelector("#player2-ready");

    window.addEventListener("keydown", firstKeystrokeListener);

}

window.onload = start;