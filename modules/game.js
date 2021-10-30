import Hazard from './hazard.js';
import Turret from './turret.js';
import Projectile from './projectile.js';

export default class Game {
  constructor(p5) {
    this.width = p5.windowWidth;
    this.height = p5.windowHeight;

    this.score = 0;
    this.difficulty = 1;

    this.colors = {
      red: 'hsb(350, 100%, 100%)',
      orange: 'hsb(30, 100%, 100%)',
      yellow: 'hsb(60, 100%, 100%)',
      blue: 'hsb(200, 100%, 100%)',
      green: 'hsb(150, 100%, 100%)',
      darkGreen: 'hsb(150, 100%, 50%)',
      pink: 'hsb(310, 100%, 100%)',
      indigo: 'hsb(270, 100%, 100%)',
      black: 'hsb(0, 0%, 25%)',
      gray: 'hsb(0, 0%, 60%)',
      white: 'hsb(0, 0%, 100%)',
    };

    this.entities = {};
    this.entityIndex = 0;

    this.friction = 0.9;

    this.keys = [];

    this.cheatCodeIndex = 0;

    this.createEntity(new Turret(p5, this, this.entityIndex, { x: this.width / 2, y: this.height / 2 }, { x: 0, y: 0 }, { x: 0, y: 0 }));

    for (let i = 0; i < 1; i++) {
      const angle = Math.PI * 2 / 1 * i;
      this.createEntity(new Hazard(p5, this, this.entityIndex, { x: this.width / 2 + Math.cos(angle) * 400, y: this.height / 2 + Math.sin(angle) * 400}, { x: 0, y: 0 }, { x: 0, y: 0 }, 16, 8, 2, this.colors.red, ['attacksTurrets'], 0, 60));
    }
  }
  createEntity(entity) {
    // create entity
    this.entities[this.entityIndex] = entity;

    // increment entity index
    this.entityIndex++;
  }
  deleteEntity(index) {
    delete this.entities[index];
  }
  draw(p5, font) {
    for (const index in this.entities) {
      const entityRef = this.entities[index];
      entityRef.drawHealthBar(p5);
    }
    for (const index in this.entities) {
      const entityRef = this.entities[index];
      entityRef.draw(p5, font);
      entityRef.animate(p5);
    }
  }
  keyPressed(p5) {
    this.keys[p5.keyCode] = true;
    function cheatCodePrompt(gameRef) {
      const mode = prompt('Cheat code entered. Choose an option:\n1. Revive turret.\n2. Enable power-up.\n3. Increase game difficulty.');
      let turretIndex = null;
      switch (mode) {
        case '1': case '2':
          for (const index in gameRef.entities) {
            if (gameRef.entities[index].constructor.name === 'Turret') turretIndex = index;
          }
          break;
        case '1':
          const { entityIndex, width, height } = gameRef;
          if (turretIndex) {
            alert('Failed to revive turret. Turret is not dead.');
          } else {
            gameRef.createEntity(new Turret(gameRef, entityIndex, { x: width / 2, y: height / 2 }, { x: 0, y: 0 }));
          }
          break;
        case '2':
          if (turretIndex) {
            for (const index in gameRef.entities) {
              const entityRef = gameRef.entiies[index];
              if (entityRef.constructor.name !== 'Turret') continue;
              entityRef.fireRate = 40;
              entityRef.rotSpeed = Math.PI / 25;
              entityRef.maxHealth = 128;
              entityRef.health = 128;
            }
          } else {
            alert('Failed to enable power-up. Turret is dead.');
          }
          break;
        case '3': gameRef.difficulty *= 10; break;
        case null: break;
        default: cheatCodePrompt(gameRef);
      }
    }
    const pattern = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    if (p5.keyCode === pattern[this.cheatCodeIndex]) this.cheatCodeIndex++;
    else this.cheatCodeIndex = 0;
    if (this.cheatCodeIndex === pattern.length) cheatCodePrompt(this);
  }
  keyReleased(p5) {
    this.keys[p5.keyCode] = false;
  }
}