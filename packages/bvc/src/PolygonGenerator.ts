// @ts-ignore
import earcut from "earcut";
import * as buffer from "maath/buffer";

import { convexhull } from "./deps/convex-hull";
import { simplifyConvexHull, calcPolygonArea } from "./geometry";
import { Point } from ".";

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

function createBufferFromListOfPoints(points: Point[]) {
  const buffer = new Float32Array(points.length * 2);

  for (let i = 0; i < points.length; i++) {
    buffer[i * 2] = points[i].x;
    buffer[i * 2 + 1] = points[i].y;
  }

  return buffer;
}

export class PolygonGenerator {
  points: Array<Point> = [];

  alphaThreshold: number;
  douglasPeucker: boolean;

  data: {
    areaReduction: number;
  } = {
    areaReduction: 0,
  };

  debug = true;

  index: Uint32Array;
  positions: Float32Array;
  uv: Float32Array;

  constructor(
    img: HTMLImageElement,
    settings: {
      alphaThreshold?: number;
      douglasPeucker?: boolean;
    },
    public vertices: number
  ) {
    this.alphaThreshold = clamp(
      settings.alphaThreshold || Number.EPSILON,
      Number.EPSILON,
      1 - Number.EPSILON
    );
    this.douglasPeucker = settings.douglasPeucker || false;

    const canvas = this.createCanvas("bvc-image", img.width, img.height);
    this.points = this.getPoints(img, canvas);

    let convexHull = this.calculateConvexHull(this.points);

    const simplified = simplifyConvexHull(convexHull, vertices);

    // this.debug && this.drawConvexHull(convexHull, canvas, "yellow");
    // this.debug && this.drawConvexHull(simplified, canvas, "white");
    // this.debug && this.drawOriginalRect(canvas);

    this.data.areaReduction =
      1 - calcPolygonArea(simplified) / (img.width * img.height);

    const normalized = simplified.map((p) => {
      return {
        x: (p.x - img.width / 2) / img.width,
        y: (p.y - img.height / 2) / img.height,
      };
    });

    // make a buffer from the simplified points since earcut requires ut
    const positions = createBufferFromListOfPoints(normalized);
    const index = earcut(positions, null, 2).reverse();

    buffer.map(positions, 2, (v) => {
      return [v[0], -1 * v[1]];
    });

    // transform the buffer to 3d with 0 z [1, 2, ...] > [1, 2, 0, ...]
    this.positions = buffer.addAxis(positions, 2, () => 0) as Float32Array;
    this.index = Uint32Array.from(index);
    this.uv = buffer.map(positions.slice(0), 2, (v) => {
      return [v[0] + 0.5, v[1] + 0.5];
    }) as Float32Array;
  }

  createCanvas(id = "", width: number, height: number) {
    const canvas =
      (document.querySelector(`#${id}`) as HTMLCanvasElement) ||
      document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    canvas.id = id;

    return canvas;
  }

  getNeighbours(i: number, width: number, height: number) {
    const neighbours = [];

    const x = (i % (width * 4)) / 4;
    const y = Math.floor(i / (width * 4));

    const top = y - 1;
    const bottom = y + 1;
    const left = x - 1;
    const right = x + 1;

    if (top >= 0) {
      neighbours.push(top * width + x);
    } else {
      neighbours.push(null);
    }

    if (bottom < height) {
      neighbours.push(bottom * width + x);
    } else {
      neighbours.push(null);
    }

    if (left >= 0) {
      neighbours.push(y * width + left);
    } else {
      neighbours.push(null);
    }

    if (right < width) {
      neighbours.push(y * width + right);
    } else {
      neighbours.push(null);
    }

    return neighbours;
  }

  /**
   * Iterates over the image and returns an array of points that are over the alpha threshold.
   * It reduces the number of returned points by excluding points that are surrounded by solid pixels.
   *
   * @param img An image element with the image already loaded
   * @param canvas A canvas element to draw the image on in order to get the color values
   * @returns
   */
  getPoints(img: HTMLImageElement, canvas: HTMLCanvasElement): Point[] {
    const ctx = canvas.getContext("2d")!;

    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const points = [];

    const checkNeighbours = (n: number | null) =>
      n !== null && data[n * 4 + 3] / 255 > this.alphaThreshold;

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3] / 255;

      if (alpha > this.alphaThreshold) {
        const neighbours = this.getNeighbours(i, canvas.width, canvas.height);
        // if neighbour are all opaque, never add point
        if (neighbours.every(checkNeighbours)) {
          continue;
        }

        const x = (i % (imageData.width * 4)) / 4;
        const y = Math.floor(i / (imageData.width * 4));
        points.push({ x, y });
      }
    }

    return points;
  }

  calculateConvexHull(points: typeof this.points) {
    return convexhull.makeHull(points);
  }
}
