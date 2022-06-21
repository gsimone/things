import {
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  FloatType,
  RGBAFormat,
  RGBFormat,
} from "three";
import { PolygonGenerator } from "./PolygonGenerator";
import { addAxis, fillBuffer } from "./utils";

export class ClippedSpriteGeometry extends BufferGeometry {
  constructor(image: HTMLImageElement, vertices: number, settings: any) {
    super();

    const polygon = new PolygonGenerator(image, settings, vertices);

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

export class ClippedFlipbookGeometry extends BufferGeometry {
  constructor(vertices: number) {
    super();
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(vertices * 3), 3)
    );
    geometry.setAttribute(
      "normal",
      new BufferAttribute(fillBuffer(vertices * 3, [0, 0, 1]), 3)
    );

    Object.assign(this, geometry);
  }
}

export function createClippedFlipbook(
  image: HTMLImageElement,
  vertices: number,
  horizontalSlices: number,
  verticalSlices: number,
  alphaThreshold: number
): [BufferGeometry, DataTexture] {
  const total = horizontalSlices * verticalSlices;
  const positions = new Float32Array(total * vertices * 4);

  let candidateGeometry = null;

  /**
   * Generate the geometry for each step in the flipbook and accumulate the positions in a buffer.
   * keep one of the generated geometries as the initial one.
   * We could also have a uvs buffer but uvs are very easily calculated in the shader with some multiplications.
   */
  for (let i = 0; i < total; i++) {
    const geometry = new ClippedSpriteGeometry(image, vertices, {
      horizontalSlices,
      verticalSlices,
      horizontalIndex: i % horizontalSlices,
      verticalIndex: Math.floor(i / horizontalSlices),
      alphaThreshold,
    });

    const pos = geometry.attributes.position.array;
    /**
     *  Save one of the generated geometries to use it as the flipbook geometry. Any geometry with the correct number of vertices is fine.
     */
    if (pos.length === vertices * 3 && !candidateGeometry) {
      candidateGeometry = geometry;
    }

    /**
     * The data texture wants to have four elements per vertex.
     */
    const posWithFourElements = addAxis(pos as Float32Array, 3, () => 1);

    positions.set(posWithFourElements, posWithFourElements.length * i);
  }

  /**
   * We can safely 0-initialize the all elements of the positions array since positions are going to be set in the vertex shader anyway.
   */
  (candidateGeometry!.getAttribute("position").array as Float32Array).map(
    () => 0
  );

  /**
   * UVs are not necessary for the flipbook as they are calculated per-position and per-frame with simple operations.
   */
  candidateGeometry!.deleteAttribute("uv");

  const texture = new DataTexture(
    positions,
    vertices,
    total,
    RGBAFormat,
    FloatType
  );
  texture.needsUpdate = true;

  const t1 = performance.now();

  return [candidateGeometry, texture, positions];
}
