import * as React from 'react';
import { Button } from 'react-bootstrap';
import Bezier from './bezier';
import Point from './point';

interface ISignaturePadProps extends React.Props<any> {
    velocityFilterWeight?: any;
    minWidth?: number;
    maxWidth?: number;
    dotSize?: any;
    penColor?: string;
    backgroundColor?: string;
    onEnd?: (event: any, data: string) => void;
    onBegin?: () => void;
    clearButton?: boolean;
    handleChangeAcceptEULA: (accept: boolean) => void;
    acceptEULA: boolean;
    minDistance?: number;
}

const customStyles = {
  height: '100%',
  width: '100%',
};

export default class SignaturePad extends React.Component<ISignaturePadProps, {}> {
    canvasRef: any;

    velocityFilterWeight: number;

    minWidth: number;

    maxWidth: number;

    minDistance: number;

    dotSize: any;

    penColor: string;

    backgroundColor: string;

    onEnd: any;

    onBegin: any;

    private padIsEmpty: boolean;

    points: Point[];

    private canvas: any;

    private ctx: any;

    private lastVelocity: any;

    private lastWidth: any;

    private mouseButtonDown: any;

    handleChangeAcceptEULA: (accept: boolean) => void;

    private data: Point[][];

    constructor(props: Readonly<ISignaturePadProps>) {
      super(props);

      const {
        velocityFilterWeight,
        minWidth,
        maxWidth,
        dotSize,
        penColor,
        backgroundColor,
        onEnd,
        onBegin,
        minDistance,
        handleChangeAcceptEULA,
      } = this.props;

      this.canvasRef = React.createRef();
      this.padIsEmpty = true;
      this.points = [];
      this.velocityFilterWeight = velocityFilterWeight || 0.7;
      this.minWidth = minWidth || 0.5;
      this.maxWidth = maxWidth || 2.5;
      this.dotSize = dotSize || (this.minWidth + this.maxWidth) / 2;
      this.penColor = penColor || 'black';
      this.backgroundColor = backgroundColor || 'rgba(0,0,0,0)';
      this.onEnd = onEnd;
      this.onBegin = onBegin;
      this.minDistance = minDistance || 5;
      this.handleChangeAcceptEULA = handleChangeAcceptEULA;
      this.data = [];
      this.handleChangeAcceptEULA(false);
      this.clear = this.clear.bind(this);
    }

    componentDidMount() {
      this.canvas = this.canvasRef.current;
      this.ctx = this.canvas.getContext('2d');
      this.clear();

      this.handleMouseEvents();
      this.handleTouchEvents();
      this.resizeCanvas();
    }

    componentWillUnmount() {
      this.off();
    }

    clear(e?: any) {
      const { ctx } = this;
      const { canvas } = this;

      ctx.fillStyle = this.backgroundColor;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      this.data = [];
      this.reset();
      this.padIsEmpty = true;
    }

    toDataURL(imageType?: any, quality?: any, ...rest: any[]) {
      const { canvas } = this;
      return canvas.toDataURL(canvas, ...rest);
    }

    fromDataURL(dataUrl: any) {
      const image = new Image();
      const ratio = window.devicePixelRatio || 1;
      const width = this.canvas.width / ratio;
      const height = this.canvas.height / ratio;

      this.reset();
      image.src = dataUrl;
      image.onload = () => {
        this.ctx.drawImage(image, 0, 0, width, height);
      };
      this.padIsEmpty = false;
    }

    isEmpty() {
      return this.padIsEmpty;
    }

    isValid() {
      const sigData = this.data;
      const { width } = this.canvas;
      const { height } = this.canvas;
      if (!sigData) {
        return false;
      }
      let xDiff = 0;
      let yDiff = 0;
      sigData.forEach((line) => {
        const xArr = line.map((data) => data.x);
        const yArr = line.map((data) => data.y);
        const maxX = Math.max(...xArr);
        const minX = Math.min(...xArr);
        const maxY = Math.max(...yArr);
        const minY = Math.min(...yArr);
        xDiff += Math.abs(minX - maxX);
        yDiff += Math.abs(minY - maxY);
      });
      if (xDiff < width / 2 || yDiff < height / 2) {
        return false;
      }
      return true;
    }

    private resizeCanvas() {
      const { ctx } = this;
      const { canvas } = this;
      // When zoomed out to less than 100%, for some very strange reason,
      // some browsers report devicePixelRatio as less than 1
      // and only part of the canvas is cleared then.
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;

      ctx.scale(ratio, ratio);
      this.padIsEmpty = true;
    }

    private reset() {
      this.points = [];
      this.lastVelocity = 0;
      this.lastWidth = (this.minWidth + this.maxWidth) / 2;
      this.padIsEmpty = true;
      this.ctx.fillStyle = this.penColor;
      this.handleChangeAcceptEULA(false);
    }

    private handleMouseEvents() {
      this.mouseButtonDown = false;

      this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
      this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
      document.addEventListener('mouseup', this.handleMouseUp.bind(this));
      window.addEventListener('resize', this.resizeCanvas.bind(this));
    }

    private handleTouchEvents() {
      // Pass touch events to canvas element on mobile IE and Edge.
      this.canvas.style.msTouchAction = 'none';
      this.canvas.style.touchAction = 'none';

      this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
      this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
      document.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    off() {
      this.canvas.removeEventListener('mousedown', this.handleMouseDown);
      this.canvas.removeEventListener('mousemove', this.handleMouseMove);
      document.removeEventListener('mouseup', this.handleMouseUp);

      this.canvas.removeEventListener('touchstart', this.handleTouchStart);
      this.canvas.removeEventListener('touchmove', this.handleTouchMove);
      document.removeEventListener('touchend', this.handleTouchEnd);

      window.removeEventListener('resize', this.resizeCanvas);
    }

    private handleMouseDown(event: any) {
      if (event.which === 1) {
        this.mouseButtonDown = true;
        this.strokeBegin(event);
      }
    }

    private handleMouseMove(event: any) {
      if (this.mouseButtonDown) {
        this.strokeUpdate(event);
      }
    }

    private handleMouseUp(event: any) {
      if (event.which === 1 && this.mouseButtonDown) {
        this.mouseButtonDown = false;
        this.strokeEnd(event);
      }
    }

    private handleTouchStart(event: any) {
      event.preventDefault();

      if (event.targetTouches.length === 1) {
        const touch = event.changedTouches[0];
        this.strokeBegin(touch);
      }
    }

    private handleTouchMove(event: any) {
      // Prevent scrolling.
      event.preventDefault();

      const touch = event.changedTouches[0];
      this.strokeUpdate(touch);
    }

    private handleTouchEnd(event: any) {
      const wasCanvasTouched = event.target === this.canvas;
      if (wasCanvasTouched) {
        this.strokeEnd(event);
      }
    }

    private strokeUpdate(event: any) {
      const x = event.clientX;
      const y = event.clientY;
      const point = this.createPoint(x, y);
      const lastPointGroup = this.data[this.data.length - 1];
      const lastPoint = lastPointGroup && lastPointGroup[lastPointGroup.length - 1];
      const isLastPointTooClose = lastPoint && point.distanceTo(lastPoint) < this.minDistance;

      // Skip this point if it's too close to the previous one
      if (!(lastPoint && isLastPointTooClose)) {
        const { curve, widths }: any = this.addPoint(point);

        if (curve && widths) {
          this.drawCurve(curve, widths.start, widths.end);
        }
        this.data[this.data.length - 1].push(point);
      }
    }

    private strokeBegin(event: any) {
      this.data.push([]);
      this.reset();
      this.strokeUpdate(event);
      if (typeof this.onBegin === 'function') {
        this.onBegin(event);
      }
    }

    private strokeDraw(point: any) {
      const { ctx } = this;
      const dotSize = typeof (this.dotSize) === 'function' ? this.dotSize() : this.dotSize;

      ctx.beginPath();
      this.drawPoint(point.x, point.y, dotSize);
      ctx.closePath();
      ctx.fill();
    }

    private strokeEnd(event: any) {
      const canDrawCurve = this.points.length > 2;
      const point = this.points[0]; // Point instance

      if (!canDrawCurve && point) {
        this.drawDot(point);
      }

      if (point) {
        const lastPointGroup = this.data[this.data.length - 1];
        const lastPoint = lastPointGroup[lastPointGroup.length - 1]; // plain object

        // When drawing a dot, there's only one point in a group, so without this check
        // such group would end up with exactly the same 2 points.
        if (!point.equals(lastPoint)) {
          lastPointGroup.push(point);
        }
      }

      if (typeof this.onEnd === 'function') {
        this.onEnd(event, this.toDataURL());
      }
    }

    private createPoint(x: any, y: any, time?: any) {
      const rect = this.canvas.getBoundingClientRect();
      return new Point(
        x - rect.left,
        y - rect.top,
        time || new Date().getTime(),
      );
    }

    private addPoint(point: any): any {
      function calculateCurveControlPoints(s1: any, s2: any, s3: any): ({ c1: Point, c2: Point }) {
        const dx1 = s1.x - s2.x; const dy1 = s1.y - s2.y;
        const dx2 = s2.x - s3.x; const dy2 = s2.y - s3.y;

        const m1 = { x: (s1.x + s2.x) / 2.0, y: (s1.y + s2.y) / 2.0 };
        const m2 = { x: (s2.x + s3.x) / 2.0, y: (s2.y + s3.y) / 2.0 };

        const l1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
        const l2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

        const dxm = (m1.x - m2.x);
        const dym = (m1.y - m2.y);

        const k = l2 / (l1 + l2);
        const cm = { x: m2.x + dxm * k, y: m2.y + dym * k };

        const tx = s2.x - cm.x;
        const ty = s2.y - cm.y;

        return {
          c1: new Point(m1.x + tx, m1.y + ty),
          c2: new Point(m2.x + tx, m2.y + ty),
        };
      }

      const { points } = this;

      points.push(point);

      if (points.length > 2) {
        // To reduce the initial lag make it work with 3 points
        // by copying the first point to the beginning.
        if (points.length === 3) points.unshift(points[0]);
        let tmp = calculateCurveControlPoints(points[0], points[1], points[2]);
        const { c2 } = tmp;
        tmp = calculateCurveControlPoints(points[1], points[2], points[3]);
        const c3 = tmp.c1;
        const curve = new Bezier(points[1], c2, c3, points[2]);
        const widths = this.calculateCurveWidths(curve);

        // Remove the first element from the list,
        // so that we always have no more than 4 points in points array.
        points.shift();

        return { curve, widths };
      }
      return {};
    }

    private addCurve(curve: any) {
      const { startPoint } = curve;
      const { endPoint } = curve;
      let velocity: any;

      velocity = endPoint.velocityFrom(startPoint);
      velocity = this.velocityFilterWeight * velocity
            + (1 - this.velocityFilterWeight) * this.lastVelocity;

      const newWidth: any = this.strokeWidth(velocity);
      this.drawCurve(curve, this.lastWidth, newWidth);

      this.lastVelocity = velocity;
      this.lastWidth = newWidth;
    }

    private drawPoint(x: any, y: any, size: any) {
      const { ctx } = this;

      ctx.moveTo(x, y);
      ctx.arc(x, y, size, 0, 2 * Math.PI, false);
      this.padIsEmpty = false;

      const {
        acceptEULA,
      } = this.props;

      if (!acceptEULA) {
        this.handleChangeAcceptEULA(true);
      }
    }

    private drawCurve(curve: any, startWidth: any, endWidth: any) {
      const { ctx } = this;
      const widthDelta = endWidth - startWidth;
      const drawSteps = Math.floor(curve.length());

      ctx.beginPath();
      for (let i = 0; i < drawSteps; i += 1) {
        // Calculate the Bezier (x, y) coordinate for this step.
        const t = i / drawSteps;
        const tt = t * t;
        const ttt = tt * t;
        const u = 1 - t;
        const uu = u * u;
        const uuu = uu * u;

        let x = uuu * curve.startPoint.x;
        x += 3 * uu * t * curve.control1.x;
        x += 3 * u * tt * curve.control2.x;
        x += ttt * curve.endPoint.x;

        let y = uuu * curve.startPoint.y;
        y += 3 * uu * t * curve.control1.y;
        y += 3 * u * tt * curve.control2.y;
        y += ttt * curve.endPoint.y;

        const width = startWidth + (ttt * widthDelta);
        this.drawPoint(x, y, width);
      }
      ctx.closePath();
      ctx.fill();
    }

    private drawDot(point: Point) {
      const { ctx } = this;
      const width = (typeof this.dotSize) === 'function' ? this.dotSize() : this.dotSize;

      ctx.beginPath();
      this.drawPoint(point.x, point.y, width);
      ctx.closePath();
      ctx.fill();
    }

    private calculateCurveWidths(curve: Bezier): ({ start: number, end: number }) {
      const { startPoint } = curve;
      const { endPoint } = curve;
      const widths = { start: 0, end: 0 };

      const velocity = (this.velocityFilterWeight * endPoint.velocityFrom(startPoint))
            + ((1 - this.velocityFilterWeight) * this.lastVelocity);

      const newWidth = this.strokeWidth(velocity);

      widths.start = this.lastWidth;
      widths.end = newWidth;

      this.lastVelocity = velocity;
      this.lastWidth = newWidth;

      return widths;
    }

    private strokeWidth(velocity: any) {
      return Math.max(this.maxWidth / (velocity + 1), this.minWidth);
    }

    render() {
      return (
        <div id="signature-pad" className="m-signature-pad">
          <div className="m-signature-pad--body">
            <canvas style={customStyles} ref={this.canvasRef}/>
          </div>
          <Button onClick={this.clear}>Clear</Button>
        </div>
      );
    }
}
