import Game from './modules/game.js';
let game;
function sketch(p5) {
  let roboto;
  p5.preload = function () {
    roboto = p5.loadFont("assets/Roboto-Black.ttf");
  };
  p5.setup = function () {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.strokeWeight(5);
    p5.frameRate(60);
    p5.textFont(roboto);
    p5.textAlign('center', 'center');
    game = new Game(p5);
  };
  p5.draw = function () {
    p5.background(255);
    game.draw(p5, roboto);
  };
  p5.keyPressed = function () {
    game.keyPressed(p5);
  };
  p5.keyReleased = function () {
    game.keyReleased(p5);
  };
};
new p5(sketch);