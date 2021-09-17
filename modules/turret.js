import GameObject from './game_object.js';
export default class Turret extends GameObject {
  constructor(position, velocity, radius, health, speed, color, teamIdentifier) {
    super(position, velocity, radius, health, speed, color, teamIdentifier);
  }
  collide() {

  }
  draw() {

  }
}