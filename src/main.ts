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
import Plane from './geometry/Plane';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 5,
  colorShift: 0,
  sizeShift: 0,
  'Load Scene': loadScene, // A function pointer, essentially
};

let screenQuad: ScreenQuad = new ScreenQuad();
let plane : Plane = new Plane(vec3.fromValues(0,-5,0), vec2.fromValues(100,100), 10);
let body: Mesh;
let beginJoints: Mesh;
let middleJoints: Mesh;
let endJoints: Mesh;
let walkCycle: Mesh;
let prog : ShaderProgram;
let time: number = 0;
let character : Character = new Character(vec3.fromValues(0.0,3.0,0), vec2.fromValues(1,3)); //numjoints + 1 for foot
let sw : boolean = true;
let walk : boolean = false;

let obj0: string = readTextFile('./src/resources/penguin.obj');
let obj1: string = readTextFile('./src/resources/limb.obj');
let obj2: string = readTextFile('./src/resources/begin_joint.obj');
let obj3: string = readTextFile('./src/resources/middle_joint.obj');
let obj4: string = readTextFile('./src/resources/foot_joint.obj');
let obj5: string = readTextFile('./src/resources/body_1.obj');

function loadScene() {
  plane.create();
  screenQuad.create();
  body = new Mesh(obj5,vec3.fromValues(0.0,0.0,0.0));
  body.create();

  beginJoints = new Mesh(obj2,vec3.fromValues(0.0,0.0,0.0));
  beginJoints.create();

  middleJoints = new Mesh(obj3,vec3.fromValues(0.0,0.0,0.0));
  middleJoints.create();

  endJoints = new Mesh(obj4,vec3.fromValues(0.0,0.0,0.0));
  endJoints.create();
  // time = 0;

  let data = character.getVBOData();

  let n: number = data[0].length;
    //set up instanced rendering for object shapes
    let numBody = 0;
    let numBegin = 0;
    let numMiddle = 0;
    let numEnd = 0;

    let offsetsArrayBd = [];
    let colorsArrayBd = [];
    let r1ArrayBd = [];
    let r2ArrayBd = [];
    let r3ArrayBd = [];
    let scaleArrayBd = [];

    let offsetsArrayBg = [];
    let colorsArrayBg = [];
    let r1ArrayBg = [];
    let r2ArrayBg = [];
    let r3ArrayBg = [];
    let scaleArrayBg = [];

    let offsetsArrayM = [];
    let colorsArrayM = [];
    let r1ArrayM = [];
    let r2ArrayM = [];
    let r3ArrayM = [];
    let scaleArrayM = [];

    let offsetsArrayE = [];
    let colorsArrayE = [];
    let r1ArrayE = [];
    let r2ArrayE = [];
    let r3ArrayE = [];
    let scaleArrayE = [];
  
    for(let i = 0; i < n; i++) {
      let position : vec3 = data[0][i];
      let r1 : vec3 = data[1][i];
      let r2 : vec3 = data[2][i];
      let r3 : vec3 = data[3][i];
      let scale : vec3 = data[4][i];
      let type : vec3 = data[5][i];

      if (type[0] == 0) {
        numBody++;

        offsetsArrayBd.push(position[0]);
        offsetsArrayBd.push(position[1]);
        offsetsArrayBd.push(position[2]);

        r1ArrayBd.push(r1[0]);
        r1ArrayBd.push(r1[1]);
        r1ArrayBd.push(r1[2]);

        r2ArrayBd.push(r2[0]);
        r2ArrayBd.push(r2[1]);
        r2ArrayBd.push(r2[2]);

        r3ArrayBd.push(r3[0]);
        r3ArrayBd.push(r3[1]);
        r3ArrayBd.push(r3[2]);

        scaleArrayBd.push(scale[0]);
        scaleArrayBd.push(scale[1]);
        scaleArrayBd.push(scale[2]);

        colorsArrayBd.push(128.0 / 255.0); //128, 200, 252
        colorsArrayBd.push(200.0 / 255.0);
        colorsArrayBd.push(252.0 / 255.0);
        colorsArrayBd.push(1.0); // Alpha channel
      } else if (type[0] == 1) {
        numBegin++;

        offsetsArrayBg.push(position[0]);
        offsetsArrayBg.push(position[1]);
        offsetsArrayBg.push(position[2]);
        
        r1ArrayBg.push(r1[0]);
        r1ArrayBg.push(r1[1]);
        r1ArrayBg.push(r1[2]);
        
        r2ArrayBg.push(r2[0]);
        r2ArrayBg.push(r2[1]);
        r2ArrayBg.push(r2[2]);
        
        r3ArrayBg.push(r3[0]);
        r3ArrayBg.push(r3[1]);
        r3ArrayBg.push(r3[2]);
        
        scaleArrayBg.push(scale[0]);
        scaleArrayBg.push(scale[1]);
        scaleArrayBg.push(scale[2]);
        
        colorsArrayBg.push(128.0 / 255.0);
        colorsArrayBg.push(200.0 / 255.0);
        colorsArrayBg.push(252.0 / 255.0);
        colorsArrayBg.push(1.0); // Alpha channel

      } else if (type[0] == 2) {
        numMiddle++;

        offsetsArrayM.push(position[0]);
        offsetsArrayM.push(position[1]);
        offsetsArrayM.push(position[2]);
        
        r1ArrayM.push(r1[0]);
        r1ArrayM.push(r1[1]);
        r1ArrayM.push(r1[2]);
        
        r2ArrayM.push(r2[0]);
        r2ArrayM.push(r2[1]);
        r2ArrayM.push(r2[2]);
        
        r3ArrayM.push(r3[0]);
        r3ArrayM.push(r3[1]);
        r3ArrayM.push(r3[2]);
        
        scaleArrayM.push(scale[0]);
        scaleArrayM.push(scale[1]);
        scaleArrayM.push(scale[2]);
        
        colorsArrayM.push(128.0 / 255.0);
        colorsArrayM.push(200.0 / 255.0);
        colorsArrayM.push(252.0 / 255.0);
        colorsArrayM.push(1.0); // Alpha channel
      } else {
        numEnd++;

        offsetsArrayE.push(position[0]);
        offsetsArrayE.push(position[1]);
        offsetsArrayE.push(position[2]);
        
        r1ArrayE.push(r1[0]);
        r1ArrayE.push(r1[1]);
        r1ArrayE.push(r1[2]);
        
        r2ArrayE.push(r2[0]);
        r2ArrayE.push(r2[1]);
        r2ArrayE.push(r2[2]);
        
        r3ArrayE.push(r3[0]);
        r3ArrayE.push(r3[1]);
        r3ArrayE.push(r3[2]);
        
        scaleArrayE.push(scale[0]);
        scaleArrayE.push(scale[1]);
        scaleArrayE.push(scale[2]);
        
        colorsArrayE.push(128.0 / 255.0);
        colorsArrayE.push(200.0 / 255.0);
        colorsArrayE.push(252.0 / 255.0);
        colorsArrayE.push(1.0); // Alpha channel
      }

      console.log("Offset: " + position[0] + ", " + position[1] + ", " + position[2]);

    }

  let offsets: Float32Array = new Float32Array(offsetsArrayBd);
  let colors: Float32Array = new Float32Array(colorsArrayBd);
  let r1s: Float32Array = new Float32Array(r1ArrayBd);
  let r2s: Float32Array = new Float32Array(r2ArrayBd);
  let r3s: Float32Array = new Float32Array(r3ArrayBd);
  let scales: Float32Array = new Float32Array(scaleArrayBd);
  body.setInstanceVBOs(offsets, colors, r1s, r2s, r3s, scales);
  body.setNumInstances(numBody); // grid of "particles"

  offsets = new Float32Array(offsetsArrayBg);
  colors = new Float32Array(colorsArrayBg);
  r1s = new Float32Array(r1ArrayBg);
  r2s  = new Float32Array(r2ArrayBg);
  r3s = new Float32Array(r3ArrayBg);
  scales = new Float32Array(scaleArrayBg);
  beginJoints.setInstanceVBOs(offsets, colors, r1s, r2s, r3s, scales);
  beginJoints.setNumInstances(numBegin); // grid of "particles"

  offsets = new Float32Array(offsetsArrayM);
  colors = new Float32Array(colorsArrayM);
  r1s = new Float32Array(r1ArrayM);
  r2s  = new Float32Array(r2ArrayM);
  r3s = new Float32Array(r3ArrayM);
  scales = new Float32Array(scaleArrayM);
  middleJoints.setInstanceVBOs(offsets, colors, r1s, r2s, r3s, scales);
  middleJoints.setNumInstances(numMiddle); // grid of "particles"

  offsets = new Float32Array(offsetsArrayE);
  colors = new Float32Array(colorsArrayE);
  r1s = new Float32Array(r1ArrayE);
  r2s  = new Float32Array(r2ArrayE);
  r3s = new Float32Array(r3ArrayE);
  scales = new Float32Array(scaleArrayE);
  endJoints.setInstanceVBOs(offsets, colors, r1s, r2s, r3s, scales);
  endJoints.setNumInstances(numEnd); // grid of "particles"

  // prog.setLimb(arr);
  // prog.setnumJoints(character.totalNumJoints);
}

function getPosition(event : MouseEvent)
      {
        walk = true;
        // var x = event.clientX + document.body.scrollLeft +
        //       document.documentElement.scrollLeft;
        // var y = event.clientY + document.body.scrollTop +
        //       document.documentElement.scrollTop;

        // var canvas = document.getElementById("canvas");

        // x -= canvas.offsetLeft;
        // y -= canvas.offsetTop;
        let r = Math.random();

        let tgt = vec3.create();
        if (!sw) {
          tgt = vec3.fromValues(5.0, -5.0, 0.0);
          character.moveToTarget(tgt, 0);
        } else {
          tgt = vec3.fromValues(-3.0, -5.0, 0.0);
          character.moveToTarget(tgt, 0);
        }
        sw = !sw;

        let offsetsArray = [];
        let colorsArray = [];
        let r1Array = [];
        let r2Array = [];
        let r3Array = [];
        let scaleArray = [];

        walkCycle = new Mesh(obj0, tgt);
        walkCycle.create();

        offsetsArray.push(tgt[0]);
        offsetsArray.push(tgt[1]);
        offsetsArray.push(tgt[2]);

        r1Array.push(1);
        r1Array.push(0);
        r1Array.push(0);
        
        r2Array.push(0);
        r2Array.push(1);
        r2Array.push(0);
        
        r3Array.push(0);
        r3Array.push(0);
        r3Array.push(1);
        
        scaleArray.push(0.2);
        scaleArray.push(0.2);
        scaleArray.push(0.2);

        colorsArray.push(1.0);
        colorsArray.push(0.0);
        colorsArray.push(0.0);
        colorsArray.push(1.0);

        let offsets: Float32Array = new Float32Array(offsetsArray);
        let colors: Float32Array = new Float32Array(colorsArray);
        let r1s: Float32Array = new Float32Array(r1Array);
        let r2s: Float32Array = new Float32Array(r2Array);
        let r3s: Float32Array = new Float32Array(r3Array);
        let scales: Float32Array = new Float32Array(scaleArray);
        walkCycle.setInstanceVBOs(offsets, colors, r1s, r2s, r3s, scales);
        walkCycle.setNumInstances(1); // grid of "particles"
        
        
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

  const camera = new Camera(vec3.fromValues(10, 10, 10), vec3.fromValues(0,0, 0));

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

  const groundShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/ground-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/ground-frag.glsl')),
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
    renderer.render(camera, groundShader, [
      plane,
    ]);
    if (walk) {
      renderer.render(camera, instancedShader, [
        body, beginJoints, middleJoints, endJoints, walkCycle
      ]);
    } else {
      renderer.render(camera, instancedShader, [
        body, beginJoints, middleJoints, endJoints
      ]);
    }
    
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