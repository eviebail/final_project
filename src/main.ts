import {vec2, vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import {readTextFile} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import { getUnpackedSettings } from 'http2';
import ScreenQuad from './geometry/ScreenQuad';
import Character from './Character';
import Mesh from './geometry/Mesh';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 5,
  colorShift: 0,
  sizeShift: 0,
  'Load Scene': loadScene, // A function pointer, essentially
};

let screenQuad: ScreenQuad = new ScreenQuad();;
let shape: Mesh;
let prog : ShaderProgram;
let time: number = 0;
let character : Character = new Character(vec3.fromValues(0.0,0.0,0), vec2.fromValues(1,2));
let sw : boolean = true;
let obj0: string = readTextFile('./src/resources/penguin.obj');

function loadScene() {
  screenQuad.create();
  shape = new Mesh(obj0,vec3.fromValues(0.0,0.0,0.0));
  shape.create();
  // time = 0;

  let data = character.getVBOData();

  let n: number = data[0].length;
    //set up instanced rendering for object shapes
    let offsetsArray = [];
    let colorsArray = [];
    let r1Array = [];
    let r2Array = [];
    let r3Array = [];
    let scaleArray = [];
  
    for(let i = 0; i < n; i++) {
      let position : vec3 = data[0][i];
      let r1 : vec3 = data[1][i];
      let r2 : vec3 = data[2][i];
      let r3 : vec3 = data[3][i];
      let scale : vec3 = data[4][i];
      
      offsetsArray.push(position[0]);
      offsetsArray.push(position[1]);
      offsetsArray.push(position[2]);

      r1Array.push(r1[0]);
      r1Array.push(r1[1]);
      r1Array.push(r1[2]);

      r2Array.push(r2[0]);
      r2Array.push(r2[1]);
      r2Array.push(r2[2]);

      r3Array.push(r3[0]);
      r3Array.push(r3[1]);
      r3Array.push(r3[2]);

      scaleArray.push(scale[0]);
      scaleArray.push(scale[1]);
      scaleArray.push(scale[2]);

      if (i == 0) {
        colorsArray.push(1.0);
        colorsArray.push(0.0);
        colorsArray.push(1.0);
        colorsArray.push(1.0); // Alpha channel
      } else {
        colorsArray.push((n - i + 1) / n);
        colorsArray.push((n - i + 1) / n);
        colorsArray.push((n - i + 1) / n);
        colorsArray.push(1.0); // Alpha channel
      }

    }

  // offsetsArray.push(0);
  // offsetsArray.push(0);
  // offsetsArray.push(0);

  // offsetsArray.push(1.0);
  // offsetsArray.push(0);
  // offsetsArray.push(0);

  // colorsArray.push(1.0);
  // colorsArray.push(0.0);
  // colorsArray.push(1.0);
  // colorsArray.push(1.0);

  // colorsArray.push(1.0);
  // colorsArray.push(0.0);
  // colorsArray.push(1.0);
  // colorsArray.push(1.0);

  // r1Array.push(1.0);
  // r1Array.push(0);
  // r1Array.push(0);
  // r2Array.push(0);
  // r2Array.push(1.0);
  // r2Array.push(0);
  // r3Array.push(0);
  // r3Array.push(0);
  // r3Array.push(1.0);
  
  // r1Array.push(1.0);
  // r1Array.push(0);
  // r1Array.push(0);
  // r2Array.push(0);
  // r2Array.push(1.0);
  // r2Array.push(0);
  // r3Array.push(0);
  // r3Array.push(0);
  // r3Array.push(1.0);

  // scaleArray.push(1);
  // scaleArray.push(1);
  // scaleArray.push(1);

  // scaleArray.push(1);
  // scaleArray.push(2);
  // scaleArray.push(1);

  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  let r1s: Float32Array = new Float32Array(r1Array);
  let r2s: Float32Array = new Float32Array(r2Array);
  let r3s: Float32Array = new Float32Array(r3Array);
  let scales: Float32Array = new Float32Array(scaleArray);
  shape.setInstanceVBOs(offsets, colors, r1s, r2s, r3s, scales);
  shape.setNumInstances(n); // grid of "particles"

  // prog.setLimb(arr);
  // prog.setnumJoints(character.totalNumJoints);
}

function getPosition(event : MouseEvent)
      {
        // var x = event.clientX + document.body.scrollLeft +
        //       document.documentElement.scrollLeft;
        // var y = event.clientY + document.body.scrollTop +
        //       document.documentElement.scrollTop;

        // var canvas = document.getElementById("canvas");

        // x -= canvas.offsetLeft;
        // y -= canvas.offsetTop;
        let r = Math.random();

        if (!sw) {
          character.moveToTarget(vec3.fromValues(2.0, 10.0, 0.0), 0);
        } else {
          character.moveToTarget(vec3.fromValues(-2.0, 14.0, 0.0), 0);
        }
        sw = !sw
        
        
        // if (r < 0.25) {
        //   character.moveToTarget(vec3.fromValues(4.0, 12.0, 0.0), 0);
        // } else if (r < 0.5) {
        //   character.moveToTarget(vec3.fromValues(4.0, 10.0, 0.0), 0);
        // } else if (r < 0.75) {
        //   character.moveToTarget(vec3.fromValues(-2.0, 14.0, 0.0), 0);
        // } else {
        //   character.moveToTarget(vec3.fromValues(-4.0, 12.0, 0.0), 0);
        // }
        
        //console.log("x: " + ((x / canvas.clientWidth) * 32 - 16)+ "  y: " + ((y / canvas.clientHeight)* 32 -16) );
        //loadScene();
      }

function main() {
  window.addEventListener('keypress', function (e) {
    // console.log(e.key);
        // character.moveToTarget(vec3.fromValues(2.0, 16.0, 0.0), 0);
        // loadScene();

    switch(e.key) {
      // Use this if you wish
    }
  }, false);

  window.addEventListener('keyup', function (e) {
    switch(e.key) {
      // Use this if you wish
    }
  }, false);

  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();

  // gui.add(controls, 'colorShift', 0, 1).step(0.1);
  // gui.add(controls, 'sizeShift', 0, 1).step(0.1);


  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  //mouseClickEvent addition
  canvas.addEventListener("mousedown", getPosition, false);

  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  const camera = new Camera(vec3.fromValues(10, 10, 10), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(164.0 / 255.0, 233.0 / 255.0, 1.0, 1);
  gl.enable(gl.DEPTH_TEST);

  prog = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

    // Initial call to load scene
    loadScene();


  function processKeyPresses() {
    // Use this if you wish
  }

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    //renderer.clear();
    processKeyPresses();
    instancedShader.setTime(time);
    renderer.render(camera, prog, [
      screenQuad,
    ]);
    renderer.render(camera, instancedShader, [
      shape,
    ]);
    time++;
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    prog.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  prog.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();