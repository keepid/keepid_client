import Point from './point';

export default class Bezier {
    startPoint: Point;

    control1: Point;

    control2: Point;

    endPoint: Point;

    constructor(startPoint: Point, control1: Point, control2: Point, endPoint: Point) {
      this.startPoint = startPoint;
      this.control1 = control1;
      this.control2 = control2;
      this.endPoint = endPoint;
    }

    length() {
      function PointToNumber(t: number, start: number, c1: number, c2: number, end: number) {
        return start * (1.0 - t) * (1.0 - t) * (1.0 - t)
              + 3.0 * c1 * (1.0 - t) * (1.0 - t) * t
              + 3.0 * c2 * (1.0 - t) * t * t
              + end * t * t * t;
      }

      const steps = 10;
      let length = 0;
      let px: number = 0;
      let py: number = 0;
      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        const cx = PointToNumber(
          t,
          this.startPoint.x,
          this.control1.x,
          this.control2.x,
          this.endPoint.x,
        );
        const cy = PointToNumber(
          t,
          this.startPoint.y,
          this.control1.y,
          this.control2.y,
          this.endPoint.y,
        );
        if (i > 0) {
          const xdiff = cx - px;
          const ydiff = cy - py;
          length += Math.sqrt((xdiff * xdiff) + (ydiff * ydiff));
        }
        px = cx;
        py = cy;
      }
      return length;
    }
}
