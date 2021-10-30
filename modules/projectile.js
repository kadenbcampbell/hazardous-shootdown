import Entity from './entity.js';
export default class Projectile extends Entity {
  constructor(p5, gameRef, entityIndex, position, velocity, acceleration, slope, timeToLive) {
    super(p5, gameRef, entityIndex, position, velocity, acceleration, 12, 2, 'rgb(0, 70, 90)', 0, 6);
    Object.assign(this, { slope, timeToLive });
    this.maxSpeed = 6;
    this.speed = this.maxSpeed;
  }
}