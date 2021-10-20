/// <reference path='p5.d.ts' />

import Game from './modules/game.js';

const game = new Game();

function sketch(p5) {
  p5.setup = function () {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.background(0);
  };
  p5.draw = function () {
    game.draw();
  };
};

new p5(sketch);