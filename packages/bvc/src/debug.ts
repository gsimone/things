import { Point } from ".";

export class DebugCanvas {
  constructor(canvas: HTMLCanvasElement) {
    document.body.appendChild(canvas);
  }

  styleCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    canvas.style.position = "fixed";
    canvas.style.top = `50%`;
    canvas.style.left = `25%`;
    canvas.style.transform = `translate(-50%, -50%)`;
    canvas.style.zIndex = `100`;
    canvas.style.pointerEvents = `none`;
  }

  drawConvexHull(
    convexHull: Array<{ x: number; y: number }>,
    canvas: HTMLCanvasElement,
    color = "green"
  ) {
    const ctx = canvas.getContext("2d")!;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    // renders the polygon
    convexHull.forEach((p, i) => {
      const next = convexHull[i + 1] || convexHull[0];

      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(next.x, next.y);
      ctx.stroke();
      ctx.closePath();
    });
  }

  drawPoints(points: Point[], canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "white";

    points.forEach(({ x, y }) => {
      ctx.fillRect(x, y, 1, 1);
    });
  }

  drawPoint(point: { x: number; y: number }, canvas: HTMLCanvasElement, i) {
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "green";

    ctx.fillRect(point.x - 2.5, point.y - 2.5, 5, 5);
  }

  drawOriginalRect(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")!;

    ctx.beginPath();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.setLineDash([0, 0]);

    ctx.closePath();
  }
}
