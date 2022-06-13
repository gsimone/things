import { Point } from ".";

export function calculateIntersection(
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point
): Point {
  var c2x = p3.x - p4.x; // (x3 - x4)
  var c3x = p1.x - p2.x; // (x1 - x2)
  var c2y = p3.y - p4.y; // (y3 - y4)
  var c3y = p1.y - p2.y; // (y1 - y2)

  // down part of intersection point formula
  var d = c3x * c2y - c3y * c2x;

  if (d == 0) {
    throw new Error("Number of intersection points is zero or infinity.");
  }

  // upper part of intersection point formula
  var u1 = p1.x * p2.y - p1.y * p2.x; // (x1 * y2 - y1 * x2)
  var u4 = p3.x * p4.y - p3.y * p4.x; // (x3 * y4 - y3 * x4)

  // intersection point formula

  var px = (u1 * c2x - c3x * u4) / d;
  var py = (u1 * c2y - c3y * u4) / d;

  var p = { x: px, y: py };

  return p;
}

export function calcPolygonArea(vertices: Array<{ x: number; y: number }>) {
  var total = 0;

  for (var i = 0, l = vertices.length; i < l; i++) {
    var addX = vertices[i].x;
    var addY = vertices[i == vertices.length - 1 ? 0 : i + 1].y;
    var subX = vertices[i == vertices.length - 1 ? 0 : i + 1].x;
    var subY = vertices[i].y;

    total += addX * addY * 0.5;
    total -= subX * subY * 0.5;
  }

  return Math.abs(total);
}

function areaOfTriangleGivenThreePoints([a, b, c]: Point[]): number {
  return Math.abs(
    (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2
  );
}

/**
 *
 * A simple algorithm to simplify a convex hull to a defined number of points.
 * It works by going through all existing edges and collapsing the one that adds the lowest possible area to the hull.
 * Given vertices A B C D:
 * - build the triangle created by the intersection of AB and CD (A') and BC.
 * - calculate its area
 * - check if it is the smallest possible area
 *
 * Once the smallest triangle has been found, remove the BC edge and add the new A' vertex to the hull.
 * Repeat until the desired number of vertices is reached.
 *
 * The simplified polygon will still include all the original vertices - something we can't guarantee
 * by just using polyline simplification
 *
 * @param convexHull A list of points representing a convexHull polyline.
 * @param desiredNumberOfPoints The number of points after simplification
 * @returns
 */
export function simplifyConvexHull(
  convexHull: Point[],
  desiredNumberOfPoints: number = 8
) {
  const simplified = [...convexHull];

  let iterations = 0;
  while (simplified.length > desiredNumberOfPoints && iterations < 1000) {
    iterations++;

    let smallestFoundArea = Infinity;
    let smallestFoundMerge = null;

    for (let i = 0; i <= simplified.length - 1; i++) {
      const l = simplified.length;

      const indices = [i, (i + 1) % l, (i + 2) % l, (i + 3) % l];

      const p1 = simplified[indices[0]];
      const p2 = simplified[indices[1]];
      const p3 = simplified[indices[2]];
      const p4 = simplified[indices[3]];

      try {
        const pi = calculateIntersection(p1, p2, p3, p4);
        const area = areaOfTriangleGivenThreePoints([pi, p2, p3]);

        if (area < smallestFoundArea) {
          smallestFoundArea = area;
          smallestFoundMerge = {
            point: pi,
            area: area,
            indicesToRemove: [indices[1], indices[2]],
          };
        }
      } catch (e) {
        console.log(e);
      }
    }

    if (smallestFoundMerge) {
      const i1 = smallestFoundMerge.indicesToRemove[0];
      const i2 = smallestFoundMerge.indicesToRemove[1];

      if (i2 > i1) {
        simplified.splice(i2, 1);
        simplified.splice(i1, 1);
      } else {
        simplified.splice(i1, 1);
        simplified.splice(i2, 1);
      }

      simplified.splice(Math.min(i1, i2), 0, smallestFoundMerge.point);
    }
  }

  return simplified;
}
