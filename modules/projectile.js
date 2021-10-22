import Entity from './entity.js';
export default class Projectile extends Entity {
  constructor(position, velocity, slope, timeToLive) {
    super(position, velocity, 12, 2, 'rgb(0, 70, 90)', 0);
    this.slope = slope;
    this.timeToLive = timeToLive;
    this.maxSpeed = 6;
    this.speed = this.maxSpeed;
  }
}