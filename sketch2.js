/// <reference path='p5.d.ts' />

import Game from './modules/game.js';

let game;

function sketch(p5) {
  p5.setup = function () {
    game = new Game(p5.windowWidth, p5.windowHeight);
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
  };
  p5.draw = function () {
    p5.background(0);
    game.draw(p5);
  };
};

new p5(sketch);