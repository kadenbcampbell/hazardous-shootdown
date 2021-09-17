import GameObject from './game_object.js';
export default class Hazard extends GameObject {
  constructor(position, velocity, radius, health, speed, color, teamIdentifier, slope, abilities, timeToLive) {
    super(position, velocity, radius, health, speed, color, teamIdentifier);
    this.slope = slope;
    this.timeToLive = timeToLive;
    abilities.forEach(ability => this[ability] = true);
    this.hasSplit = false;
    this.hazardSpawnTimer = 0;
    this.targetIndex = -1;
  }
  evadeProjectiles() {

  }
  spawnHazards() {

  }
  splitOnDeath() {

  }
  attackTurrets() {

  }
  animate() {
    if (this.evadesProjectiles) {
      this.evadeProjectiles();
    }
    if (this.attacksTurrets) {
      this.attackTurrets();
    }
    if (this.splitsOnDeath) {
      this.splitOnDeath();
    }
    if (this.spawnsHazards) {
      this.spawnHazards();
    }
  }
  collide() {

  }
  draw() {

  }
}