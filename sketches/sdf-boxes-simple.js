const canvasSketch = require('canvas-sketch');
const createShader = require('canvas-sketch-util/shader');
const Random = require('canvas-sketch-util/random');
const Color = require('canvas-sketch-util/color');
const glsl = require('glslify');
const tome = require('chromotome');
const THREE = require('three');

// Setup our sketch
const settings = {
  dimensions: [1080, 1080],
  context: 'webgl',
  animate: true,
  duration: 4,
};

const palettes = [
  'spatial02',
  'spatial03i',
  'ducci_f',
  'rohlfs_2',
  'ducci_d',
  'revolucion',
  'butterfly',
  'floratopia',
  'ducci_i',
  'spatial02i',
];

function colors(minContrast = 3) {
  let palette = tome.get(Random.pick(palettes));
  if (!palette.background) palette = tome.get();

  const background = palette.background;

  const colors = palette.colors.filter(
    (color) => Color.contrastRatio(background, color) >= minContrast
  );

  const stroke = palette.stroke === background ? null : palette.stroke;

  const foreground = stroke || Random.pick(colors);
  const diffusion = palette.stroke || Random.pick(colors);

  return {
    name: palette.name,
    background,
    foreground,
    diffusion,
  };
}

// copy paste from sdf-boxes-simple.glsl
const frag = glsl(/*glsl*/ `

`);

const sketch = ({ gl }) => {
  const { name, background, foreground, diffusion } = colors();
  console.log({ name, background, foreground, diffusion });
  const rotationAxis = Random.quaternion();
  rotationAxis.pop();
  const offset = Random.range(-0.125, 0.125);

  return createShader({
    gl,
    frag,
    uniforms: {
      background: new THREE.Color(background).toArray(),
      foreground: new THREE.Color(foreground).toArray(),
      diffusion: new THREE.Color(diffusion).toArray(),
      rotationAxis,
      time: ({ playhead }) => playhead,
      offsetX: offset,
      offsetY: offset,
      boxSize: [0.25, 0.00625 / 4.0, 0.25],
    },
  });
};

canvasSketch(sketch, settings);
