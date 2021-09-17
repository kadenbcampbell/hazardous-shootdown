export default class GameObject {
  constructor(position, velocity, radius, health, speed, color, teamIdentifier) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.maxRadius = radius;
    this.health = health;
    this.maxHealth = health;
    this.speed = speed;
    this.maxSpeed = speed;
    this.color = color;
    this.teamIdenfifier = teamIdentifier;
    this.opacity = {
      master: 0,
      healthBar: 0,
      damageIndicator: 0,
    };
    this.rotation = 0;
    this.scale = 0;
    this.isActive = true;
  }
  collide() {
    for (const index in this.parentObject) {
      const object = this.parentObject[index];
      const distance = Math.sqrt(Math.pow(this.position.x - object.position.x, 2) + Math.pow(this.position.y - object.position.y, 2));
      if (object.index !== this.index && distance <= this.radius + object.radius) {

      }
    }
  }
};