import { BufferAttribute, BufferGeometry } from "three";
import { PolygonGenerator } from "./PolygonGenerator";

const fillBuffer = (count: number, point: number[]): Float32Array => {
  const buffer = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    buffer[i * 3] = point[0];
    buffer[i * 3 + 1] = point[1];
    buffer[i * 3 + 2] = point[2];
  }

  return buffer;
};

export default class ClippedSpriteGeometry extends BufferGeometry {
  constructor(
    image: HTMLImageElement,
    vertices: number,
    settings: {
      alphaThreshold?: number;
    }
  ) {
    super();

    const polygon = new PolygonGenerator(
      image,
      {
        alphaThreshold: settings?.alphaThreshold || Number.EPSILON,
      },
      vertices
    );

    const count = polygon.positions.length;

    const indexBA = new BufferAttribute(polygon.index, 1);
    const positionsBA = new BufferAttribute(polygon.positions, 3);
    const normalBA = new BufferAttribute(fillBuffer(count, [0, 0, 1]), 3);
    const uvBA = new BufferAttribute(polygon.uv, 2);

    this.userData.reduction = polygon.data.areaReduction;

    this.setIndex(indexBA);
    this.setAttribute("position", positionsBA);
    this.setAttribute("normal", normalBA);
    this.setAttribute("uv", uvBA);
  }
}
