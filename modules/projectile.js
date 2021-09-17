import GameObject from './game_object.js';
export default class Projectile extends GameObject {
  constructor(position, velocity, radius, health, speed, color, teamIdentifier, slope, timeToLive) {
    super(position, velocity, radius, health, speed, color, teamIdentifier);
    this.slope = slope;
    this.timeToLive = timeToLive;
  }
  collide() {

  }
  draw() {

  }
}