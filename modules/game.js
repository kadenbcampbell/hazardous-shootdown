import Hazard from './hazard.js';
import Turret from './turret.js';
import Projectile from './projectile.js';
export default class Game {
  constructor(width, height) {
    this.score = 0;
    this.difficulty = 1;
    this.entities = {};
    this.entityIndex = 0;

    this.createEntity(new Turret({ x: width / 2, y: height / 2 }, { x: 0, y: 0 }));

    this.createEntity(new Hazard({ x: width * 0.8, y: height / 2 }, { x: 0, y: 0 }, 16, 4, 2, 'rgb(230, 80, 80)', ['attacksTurrets'], 0, 60));
  }
  createEntity(entity) {
    // create entity
    this.entities[this.entityIndex] = entity;

    const entityReference = this.entities[this.entityIndex];

    // assign game reference and entity index to entity
    entityReference.gameReference = this;
    entityReference.entityIndex = this.entityIndex;

    // increment entity index
    this.entityIndex++;
  }
  deleteEntity(index) {
    delete this.entities[index];
  }
  draw(p5) {
    for (const index in this.entities) {
      const entity = this.entities[index];
      entity.draw(p5);
      entity.animate();
    }
  }
}