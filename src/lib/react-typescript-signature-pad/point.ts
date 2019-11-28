export default class Point {
    x: number;

    y: number;

    time: number;

    color:string;

    constructor(x: number, y: number, time?: number, color?:string) {
      this.x = x;
      this.y = y;
      this.time = time || new Date().getTime();
      this.color = color || 'black';
    }

    velocityFrom(start: Point) {
      return (this.time !== start.time) ? this.distanceTo(start) / (this.time - start.time) : 1;
    }

    distanceTo(start: Point) {
      return Math.sqrt(Math.pow(this.x - start.x, 2) + Math.pow(this.y - start.y, 2));
    }

    equals(other: Point) {
      return this.x === other.x && this.y === other.y && this.time === other.time;
    }
}
