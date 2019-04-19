import {vec2, vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import { getUnpackedSettings } from 'http2';
import ScreenQuad from './geometry/ScreenQuad';
import Character from './Character';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 5,
  colorShift: 0,
  sizeShift: 0,
  'Load Scene': loadScene, // A function pointer, essentially
};

let screenQuad: ScreenQuad;
let square: Square;
let prog : ShaderProgram;
let time: number = 0;
let character : Character = new Character(vec3.fromValues(0.0,0.0,0), vec2.fromValues(1,2));
let sw : boolean = true;

function loadScene() {
  screenQuad = new ScreenQuad();
  screenQuad.create();
  // time = 0;

  prog.setChar1Pos(character.position);
  prog.setScale(character.scale);
  //t.rotateLimb(-12.0);
  prog.setR1(character.r1);
  prog.setR2(character.r2);
  prog.setR3(character.r3);

  let data = character.getVBOData();
  let arr : Float32Array = new Float32Array(3*data.length).fill(0);
  //console.log(" / / / // / / / / / / / / / / / // / / / / / / // / /");
  for (let u = 0; u < data.length; u++) {
    for (let i = 0; i < 3; i++) {
      arr[3*u + i] = data[u][i];
      //console.log("ID: " + (3*u + i) + " + val: " + arr[3*u + i]);
    }
  }

  prog.setLimb(arr);
  prog.setnumJoints(character.totalNumJoints);
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
        loadScene();
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
    renderer.render(camera, prog, [
      screenQuad,
    ], time);
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