import GameObject from './game_object.js';
export default class Hazard extends GameObject {
  constructor(position, velocity, radius, health, speed, color, slope, abilities, timeToLive) {
    super(position, velocity, radius, health, speed, color);
    this.slope = slope;
    this.timeToLive = timeToLive;
    this.evadesProjectiles = abilities.includes('evadesProjectiles');
    this.spawnsHazards = abilities.includes('spawnsHazards');
    this.splitsOnDeath = abilities.includes('splitsOnDeath');
    this.hasSplit = false;
    this.hazardSpawnTimer = 0;
    this.targetIndex = -1;
  }
  collide() {
    console.log(this);
  }
  draw() {

  }

}