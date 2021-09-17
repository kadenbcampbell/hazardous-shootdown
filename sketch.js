/// <reference path='p5.d.ts' />

import GameObject from './modules/game_object';
import Hazard from './modules/hazard';

function sketch(p5) {
  const game = {
    objects: {},
    objectIndex: 0,
    createObject: function (object) {
      this.objects[this.objectIndex] = object;
      this.objects[this.objectIndex].index = this.objectIndex;
      this.objects[this.objectIndex].parentObject = this.objects;
      this.objectIndex++;
    },
    deleteObject: function (index) {
      delete this.objects[index];
    },
  };

  p5.setup = function () {
    game.createObject(new Hazard({ x: 200, y: 200, }, { x: 0, y: 0, }, 10, 5, 2, 'rgb(255, 0, 0)', 0, ['evadesProjectiles'], 300));
  };
  p5.draw = function () {

  };
};

new p5(sketch);