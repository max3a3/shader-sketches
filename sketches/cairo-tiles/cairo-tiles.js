const canvasSketch = require('canvas-sketch');
const createShader = require('canvas-sketch-util/shader');
const glsl = require('glslify');
const Random = require('canvas-sketch-util/random');
const tome = require('chromotome');
const THREE = require('three');
const Color = require('canvas-sketch-util/color');

const settings = {
  dimensions: [1080, 1080],
  context: 'webgl',
  animate: true,
  duration: 8,
};

const frag = glsl(/* glsl */ `
  precision highp float;

  #define PI 3.14159265359

  uniform float time;
  varying vec2 vUv;
  uniform vec3 background;
  uniform vec3 foreground;

  void main () {
    vec2 uv = -0.5 + vUv;
    vec3 color = vec3(0);

    // zoom out
    uv *= 5.;
    // id for each tile
    vec2 id = floor(uv);
    float check = mod(id.x + id.y, 2.);
    // center the uv in each tile
    uv = fract(uv)-.5;
    // mirror
    vec2 p = abs(uv);

    // rotate every other tile
    if(check == 1.) p = p.yx;

    float k = sin(PI * time); // 0 - 1
    float a = (k*.5+.5) * PI;
    vec2 n = vec2(sin(a), cos (a));

    float d = dot (p-.5, n); // slanted line
    d = min(d, p.x); // straight line
    d = max(d, -p.y); // straight line
    d = abs(d);

    float th = 0.01;
    float t = smoothstep(th, 0., d-th*.5);
    color = mix(background, foreground, t);

    gl_FragColor = vec4(color, 1.0);
  }
`);

const sketch = ({ gl }) => {
  const { background, foreground } = colors();

  const res = 0.1;
  return createShader({
    gl,
    frag,
    uniforms: {
      resolution: ({ width, height }) => [width, height],
      time: ({ playhead }) => playhead,
      res,
      count: 1 / res,
      background,
      foreground,
    },
  });
};

function colors(minContrast = 1) {
  let palette = tome.get();
  if (!palette.background) palette = tome.get();
  console.log(palette.name);

  const background = palette.background;

  const colors = palette.colors.filter(
    (color) =>
      Color.contrastRatio(background, color) >= minContrast &&
      color !== background
  );

  const foreground = Random.pick(colors);
  console.log(
    `%c ${background}`,
    `background: ${background}; color: ${foreground};`
  );
  console.log(
    `%c ${foreground}`,
    `background: ${foreground}; color: ${background};`
  );

  return {
    background: new THREE.Color(background).toArray(),
    foreground: new THREE.Color(foreground).toArray(),
  };
}

canvasSketch(sketch, settings);
