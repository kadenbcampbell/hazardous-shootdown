import Hazard from './hazard.js';
import Turret from './turret.js';
import Projectile from './projectile.js';
export default class Game {
  constructor() {
    this.score = 0;
    this.difficulty = 1;
    this.objects = {};
    this.objectIndex = 0;

    // this.createObject(new Turret());

    // this.createObject(new Hazard({ x: 200, y: 200, }, { x: 0, y: 0, }, 10, 5, 2, 'rgb(255, 0, 0)', 0, 0, ['attacksTurrets'], 300));
  }
  createObject(object) {
    this.objects[this.objectIndex] = object;
    this.objects[this.objectIndex].game = this;
    this.objects[this.objectIndex].index = this.objectIndex;
    this.objectIndex++;
  }
  deleteObject(index) {
    delete this.objects[index];
  }
  draw() {
    for (const index in this.objects) {
      const object = this.objects[index];
      object.draw();
      object.animate();
    }
  }
}