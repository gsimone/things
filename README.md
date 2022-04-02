# React Three Fiber

## Layers

Simple helper for three's Layers, lets you set an object's layers in a declarative manner:

```js
<mesh>
  <Layers layers={[0, 1, 3]} /> {/* will set layers 0, 1 and 3 exclusively */}
</mesh>
```