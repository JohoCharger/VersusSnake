module.exports = {
    tileSize: 32,
    tileCount: 20,
    snakeGap: 5, //TODO: More descriptive name??
    snakeColor1: "#CEA4DB",
    snakeColor2: "#FCBA03",
    bgColor1: "#9ADBC1",
    bgColor2: "#8EDB91",
    FPS: 0,
    frameTime: 0,
    setFPS: function setFPS(fps) {
        this.FPS = fps;
        this.frameTime = 1000/fps;
    }
}