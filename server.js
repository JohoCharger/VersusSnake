const express = require("express");
const cookieSession = require('cookie-session')
const bodyParser = require('body-parser');
const path = require("path");
const http = require("http");
const Config = require("./game/config.js");
const Game = require("./game/game.js");
const { Server } = require("socket.io");

const PORT = 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

function updateGames() {
    games.forEach(game => {
        game.update();
    });
}

const gameUpdateInterval = setInterval(updateGames, Config.frameTime);
const games = new Map();

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

    socket.on("join_game", code => {
        code = "test"
        socket.join(code);
        if (games.has(code)) {
            games.get(code).join(socket);
        } else {
            games.set(code, new Game(io, code));
            games.get(code).join(socket);
        }
    });

    socket.on("get_game_state", () => {
        //socket.emit("game_state", JSON.stringify(game.toString()));
    });

    socket.on("game_input", message => {
    });
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"))
app.set("trust proxy", 1)

app.use(cookieSession({
    name: "session",
    keys: ["fdöskaflkdsavmsdakaädasdlas", "fjdlakfndsvkhsdatjsdagnfdm", "fhdsjflsdanvnsdaj"]
}));

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static(path.join(__dirname, "./static")));

app.get("/", (request, response) => {
    response.render("landing");
})
app.post("/", (request, response) => {
    request.session.code = request.body.code;
    response.redirect("/play");
});

app.get("/play", (request, response) => {
    response.render("game");
});

server.listen(PORT, () => { console.log(`Server listening on ${PORT}`) });