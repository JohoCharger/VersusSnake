const express = require("express");
const path = require("path");
const http = require("http");
const Config = require("./game/config.js");
const Game = require("./game/game.js");
const { Server } = require("socket.io");

const PORT = 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const game = new Game();
game.apple.spawn();

setInterval(() => {
    game.update();
    io.emit("game_state", JSON.stringify(game.toString()));
}, 500);

io.on("connection", socket => {
    console.log("A client connected");

    socket.on("get_game_config", () => {
        socket.emit("game_config", JSON.stringify({
            tileSize: Config.tileSize,
            tileCount: Config.tileCount,
            snakeGap: Config.snakeGap,
            snakeColor1: Config.snakeColor1,
            snakeColor2: Config.snakeColor2,
            bgColor1: Config.bgColor1,
            bgColor2: Config.bgColor2,
        }));
    });

    socket.on("get_game_state", () => {
        socket.emit("game_state", JSON.stringify(game.toString()));
    });

    socket.on("game_input", message => {
    });
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"))

app.use(express.static(path.join(__dirname, "./static")));

app.get("/", (request, response) => {
    response.render("game")
});

server.listen(PORT, () => { console.log(`Server listening on ${PORT}`) });