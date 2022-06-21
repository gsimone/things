// @ts-ignore
import earcut from "earcut";
import * as buffer from "maath/buffer";
import * as misc from "maath/misc";

import { convexhull, simplifyConvexHull, calcPolygonArea } from "./geometry";
import { Point } from ".";
import { addAxis, createBufferFromListOfPoints, getNeighbours } from "./utils";
import * as debug from "./debug";

const createCanvas = (id = "debug-canvas", width: number, height: number) => {
  const canvas =
    (document.querySelector(`#${id}`) as HTMLCanvasElement) ||
    document.createElement("canvas");

  canvas.id = id;

  document.body.appendChild(canvas);

  canvas.width = width;
  canvas.height = height;

  canvas.id = id;

  return canvas;
};

const normalizePositions = (
  p: Point,
  imageSize: number[],
  horizontalSlices: number,
  verticalSlices: number
) => {
  return {
    x:
      (p.x - imageSize[0] / (2 * horizontalSlices)) /
      (imageSize[0] / horizontalSlices),
    y:
      (p.y - imageSize[1] / (2 * verticalSlices)) /
      (imageSize[1] / verticalSlices),
  };
};

const DEFAULT_SETTINGS = {
  alphaThreshold: 0.01,
  douglasPeucker: false,
  horizontalSlices: 1,
  verticalSlices: 1,
  horizontalIndex: 0,
  verticalIndex: 0,
  scale: 1.02,
};

export class PolygonGenerator {
  points: Array<Point> = [];

  data: {
    areaReduction: number;
  } = {
    areaReduction: 0,
  };

  debug = true;

  index: Uint32Array;
  positions: Float32Array;
  uv: Float32Array;

  defaultSettings = DEFAULT_SETTINGS;

  settings: typeof this.defaultSettings;

  constructor(
    img: HTMLImageElement,
    settings: Partial<typeof DEFAULT_SETTINGS>,
    public vertices: number
  ) {
    this.settings = { ...this.defaultSettings, ...settings };

    const canvas = createCanvas("bvc-image", img.width, img.height);
    this.points = this.getPoints(img, canvas);

    let convexHull = this.calculateConvexHull(this.points);

    const size = [this.settings.horizontalSlices, this.settings.verticalSlices];

    const simplified = simplifyConvexHull(convexHull, vertices);
    const normalized = simplified.map((p) => {
      let np = normalizePositions(p, [img.width, img.height], size[0], size[1]);

      // invert y
      np.y = -1 * np.y;

      return np;
    });

    const { scale } = this.settings;

    this.data.areaReduction =
      1 -
      (calcPolygonArea(simplified) /
        ((img.width / size[0]) * (img.height / size[1]))) *
        scale;

    // make a buffer from the simplified points since earcut requires it
    const positions = createBufferFromListOfPoints(normalized);
    const index = earcut(positions, null, 2);

    // transform the buffer to 3d with 0 z [1, 2, ...] > [1, 2, 0, ...]
    this.positions = addAxis(positions, 2, () => 0) as Float32Array;
    this.index = Uint32Array.from(index);
    this.uv = buffer.map(positions.slice(0), 2, (v) => {
      let x = v[0] + 0.5;
      x =
        x / this.settings.horizontalSlices +
        (1 / this.settings.horizontalSlices) * this.settings.horizontalIndex;

      let y = v[1] + 0.5;
      y =
        y / this.settings.verticalSlices +
        1 -
        (1 / this.settings.verticalSlices) * (this.settings.verticalIndex + 1);

      return [x, y];
    }) as Float32Array;

    debug.drawGrid(canvas, size[0], size[1]);
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

    /**
     * Indices
     */
    const hi = this.settings.horizontalIndex;
    const vi = this.settings.verticalIndex;

    /**
     * Number of slices
     */
    const hs = this.settings.horizontalSlices;
    const vs = this.settings.verticalSlices;

    /**
     * Size of a single slice
     */
    const w = canvas.width / hs;
    const h = canvas.height / vs;

    // get image data for hi, vi
    const imageData = ctx.getImageData(w * hi, h * vi, w, h);
    const data = imageData.data;

    const points = [];

    /**
     * @TODO find a better API for this. The user should be able to either choose a test or pass one.
     * These should also all implement a common interface
     */
    const checkPointAlpha = (...rgba: number[]) => {
      return rgba[3] / 255 > 0;
    };

    const checkPointLuminance = (...rgba: number[]) => {
      const [R, G, B] = rgba;

      return (
        0.2126 * (R / 255) + 0.7152 * (G / 255) + 0.0722 * (B / 255) >
        this.settings.alphaThreshold
      );
    };

    const checkPointValue = (...rgba: number[]) => {
      const [R, G, B] = rgba;

      return (R + G + B) / (255 * 3) > this.settings.alphaThreshold;
    };

    const checkNeighbours =
      (checkFn: (...channels: number[]) => boolean) => (n: number | null) =>
        n !== null &&
        checkFn(data[n * 4], data[n * 4 + 1], data[n * 4 + 2], data[n * 4 + 3]);

    const checkFn = checkPointLuminance;

    for (let i = 0; i < data.length; i += 4) {
      if (checkFn(data[i + 0], data[i + 1], data[i + 2], data[i + 3])) {
        const neighbours = getNeighbours(i, canvas.width, canvas.height);
        // if neighbour are all opaque, never add point
        if (neighbours.every(checkNeighbours(checkFn))) {
          continue;
        }

        const [x, y] = misc.get2DFromIndex(i / 4, imageData.width);

        points.push({ x: x, y });
      }
    }

    return points;
  }

  calculateConvexHull(points: typeof this.points) {
    return convexhull.makeHull(points);
  }
}
