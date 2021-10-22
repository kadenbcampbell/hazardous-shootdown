import Entity from './entity.js';
export default class Turret extends Entity {
  constructor(position, velocity) {
    super(position, velocity, 30, 32, 'rgb(0, 70, 90)', 0);
    this.rotSpeed = 4;
    this.spread = 8;
    this.fireRate = 4;
  }
  collide() {

  }
  draw() {
    console.log('bye');
    this.deleteSelf();
  }
  rotateToCursor() {
    // let a1 = Math.atan2(crosshair.y - this.pos.y, crosshair.x - this.pos.x),
    //   a2 = Math.atan2(Math.sin(this.rot), Math.cos(this.rot));
    // if (abs(a2 - a1) <= this.rotSpeed) {
    //   this.rot = a1;
    // } else {
    //   let a = (a1 - a2);
    //   a += a < 0 ? 360 : a >= 360 ? -360 : 0;
    //   this.rot += a < 180 ? this.rotSpeed : -this.rotSpeed;
    //   this.rot += this.rot < 0 ? 360 : this.rot >= 360 ? -360 : 0;
    // }
  }
  animate() {
    super.animate();
    this.rotateToCursor();
  }
}