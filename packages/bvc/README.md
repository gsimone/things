## ClippedSpriteGeometry

### Why

Drawing billboards, clouds, particles is a ROP bound operation [[1]](#1), for which reducing the number of pixels being drawn is a key goal.
A typical texture has significant areas where alpha is 0, leading to wasteful operations that don't contribute to the final image.
This tool generates a geometry that fits tightly around the non-transparent parts of the image.

The tradeoff is having to render a few more triangles, but the downside would only be relevant for very small particles.

This method is based on [Graphics Gems for Games - Findings from Avalanche Studios](https://www.humus.name/Articles/Persson_GraphicsGemsForGames.pdf).
Unreal Engine has a similar tool included from [4.11](https://docs.unrealengine.com/4.27/en-US/WhatsNew/Builds/ReleaseNotes/2016/4_11/)

### Usage

```bash
npm i @gsimone/three-bvc
```

The geometry can be easily generated at runtime as a pre-process step or used once to bake the geometry for a given image.

```js
const geometry = new ClippedSpriteGeometry(
  image, // an already loaded HTMLImageElement
  vertices, // the number of desired vertices. 4/6/8 seem to give good results most of the time.
  settings // optional settings, see below
)
```

#### Settings 

  * `alphaThreshold`: similar to what you would use to render a sprite, it's the alpha value below which a point is not considered as part of the sprite.

### How it works

The algorithm works something like this:
- load the image and get every pixel that
  - is over the given alpha threshold
  - is NOT surrounded by all non-transparent pixels
- generate the convex hull for the found points 
  - some simplification might be introduced here but I found that it sometimes leaves points out too easily
- reduce the number of points in the convex hull while keeping all the original points still inside the new polygon:
  - iterate through the convex hull points 
  - add triangles to the polygon in such a way that the SMALLEST possible triangle is created every iteration, thus removing an edge
  - repeat until we get to the target number of points

### Sources

- [StackOverflow](https://stackoverflow.com/questions/12571150/convex-hull-algorithm-and-graham-scan)
- <a id="1">[1]</a> [Graphics Gems for Games - Findings from Avalanche Studios](https://www.humus.name/Articles/Persson_GraphicsGemsForGames.pdf)