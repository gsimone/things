import {
  BoxGeometry,
  BufferGeometry,
  Float32BufferAttribute,
  InstancedBufferGeometry,
  InstancedMesh,
  Line,
  LineBasicMaterial,
  LineDashedMaterial,
  Material,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  Raycaster,
  SphereGeometry,
} from "three";

const _o = new Object3D();

export class RaycasterHelper extends Object3D {
  raycaster: Raycaster;
  hits: [];
  numberOfHitsToVisualize = 20;

  origin: Mesh;
  near: Line;
  far: Line;

  line: Line;
  originToNear: Line;

  hitPoints: InstancedMesh;

  constructor(raycaster: Raycaster) {
    super();
    this.raycaster = raycaster;

    this.hits = [];

    this.origin = new Mesh(
      new SphereGeometry(0.04, 32),
      new MeshBasicMaterial()
    );
    this.origin.name = "RaycasterHelper_origin";
    this.origin.raycast = () => null;

    const size = 0.1;
    let geometry = new BufferGeometry();
    // prettier-ignore
    geometry.setAttribute( 'position', new Float32BufferAttribute( [
			- size, size, 0,
			size, size, 0,
			size, - size, 0,
			- size, - size, 0,
			- size, size, 0
		], 3 ) );

    this.near = new Line(geometry, new LineBasicMaterial());
    this.near.name = "RaycasterHelper_near";
    this.near.raycast = () => null;

    this.far = new Line(geometry, new LineBasicMaterial());
    this.far.name = "RaycasterHelper_far";
    this.far.raycast = () => null;

    this.line = new Line(new BufferGeometry(), new LineBasicMaterial());
    this.line.name = "RaycasterHelper_line";
    this.line.raycast = () => null;

    this.originToNear = new Line(
      new BufferGeometry(),
      new LineDashedMaterial({
        color: 0x777777,
        linewidth: 1,
        scale: 0.1,
        dashSize: 0.1,
        gapSize: 0.1,
      })
    );
    this.originToNear.name = "RaycasterHelper_originToNear";
    this.originToNear.raycast = () => null;

    this.hitPoints = new InstancedMesh(
      new SphereGeometry(0.04),
      new MeshBasicMaterial(),
      this.numberOfHitsToVisualize
    );
    this.hitPoints.name = "RaycasterHelper_hits";
    this.hitPoints.raycast = () => null;

    this.add(this.line);
    this.add(this.originToNear);

    this.add(this.near);
    this.add(this.far);

    this.add(this.origin);
    this.add(this.hitPoints);
  }

  update = () => {
    const origin = this.raycaster.ray.origin;
    const direction = this.raycaster.ray.direction;

    this.origin.position.copy(origin);

    this.near.position
      .copy(origin)
      .add(direction.clone().multiplyScalar(this.raycaster.near));
    this.far.position
      .copy(origin)
      .add(direction.clone().multiplyScalar(this.raycaster.far));

    this.far.lookAt(origin);
    this.near.lookAt(origin);

    /**
     * @TODO consider doing this without recreating a buffer attribute - set it instead
     */
    this.line.geometry.setAttribute(
      "position",
      new Float32BufferAttribute(
        // @ts-ignore
        [...this.near.position, ...this.far.position],
        3
      )
    );

    this.originToNear.geometry.setAttribute(
      "position",
      // @ts-ignore
      new Float32BufferAttribute([...origin, ...this.near.position], 3)
    );

    (this.origin.material as Material).color.set(
      this.hits.length > 0 ? "#0EEC82" : "#ff005b"
    );

    for (let i = 0; i < this.numberOfHitsToVisualize; i++) {
      const hit = this.hits?.[i];

      if (hit) {
        const { point } = hit;
        _o.position.copy(point);
        _o.scale.setScalar(1);
      } else {
        _o.scale.setScalar(0);
      }

      _o.updateMatrix();

      this.hitPoints.setMatrixAt(i, _o.matrix);
    }

    this.hitPoints.instanceMatrix.needsUpdate = true;
  };

  dispose() {
    this.near.dispose();
    this.far.dispose();
    this.origin.dispose();
    this.hitPoints.dispose();
    this.line.dispose();
    this.originToNear.dispose();
  }
}
