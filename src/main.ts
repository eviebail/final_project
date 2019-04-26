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
  'Generate Walk Cycle': generateWalkCycle,
  'Bind Walk Cycle': bindWalkCycle,
  'Blue' : loadBlue,
  'Flower Pot' : loadFlower,
   walkActivated: 0,
   visualizePoints: 0,
  'Load Scene': loadScene, // A function pointer, essentially
  'Legs' : 1,
  'Joints' : 2,
};

//store animation in character class?

let numLegs = 1;
let numJoints = 2;
let screenQuad: ScreenQuad = new ScreenQuad();
let plane : Plane = new Plane(vec3.fromValues(0,-5,0), vec2.fromValues(100,100), 10);

let body: Mesh;
let beginJoints: Mesh;
let middleJoints: Mesh;
let endJoints: Mesh;
let eyes : Mesh;
let ears : Mesh;
let mouth : Mesh;

let walkCycle: Mesh;
let prog : ShaderProgram;
let renderer : OpenGLRenderer;
let time: number = 0;
let character : Character = new Character(vec3.fromValues(0.0,-1.0 + 2.0 * numJoints,0), vec2.fromValues(numLegs,numJoints + 1)); //numjoints + 1 for foot
let blue : boolean = false;
let walk : boolean = false;
let generated : boolean = false;
let bound : boolean = false;
let gen : boolean = false;
let idxEven : vec2 = vec2.fromValues(3, 1);
let idxOdd : vec2 = vec2.fromValues(3, 0);


let obj0: string = readTextFile('./src/resources/penguin.obj');
let obj1: string = readTextFile('./src/resources/limb.obj');
let obj2: string = readTextFile('./src/resources/begin_joint.obj');
let obj3: string = readTextFile('./src/resources/middle_joint.obj');
let obj4: string = readTextFile('./src/resources/foot_joint.obj');
let obj5: string = readTextFile('./src/resources/body_1.obj');
let blue_body  : string= readTextFile('./src/resources/blue_body.obj');;
let blue_ears  : string= readTextFile('./src/resources/blue_ears.obj');;
let blue_eyes  : string= readTextFile('./src/resources/blue_eyes.obj');;
let blue_mouth : string = readTextFile('./src/resources/blue_mouth.obj');;

function resetSystem() {
  generated = false;
  bound = false;
  walk = false;
  gen = false;
  renderer.clear();
  loadScene();
}

function updateCharacterLegs() {
  character = new Character(vec3.fromValues(0.0,-1.0 + 2.0 * controls.Joints,0), vec2.fromValues(controls.Legs,controls.Joints + 1));
  resetSystem();
}

function updateCharacterJoints() {
  character = new Character(vec3.fromValues(0.0,-1.0 + 2.0 * controls.Joints,0), vec2.fromValues(controls.Legs,controls.Joints + 1));
  resetSystem();
}

function loadBlue() {
  blue = true;
  character = new Character(vec3.fromValues(0.0,-1.0 + 2.0 * 2,0), vec2.fromValues(4,3));
  resetSystem();
}

function loadFlower() {
  blue = false;
  character = new Character(vec3.fromValues(0.0,-1.0 + 2.0 * 1,0), vec2.fromValues(1,2));
  resetSystem();
}

function generateWalkCycle() {
  character.generateWalkCycle();
  generated = true;
}

function bindWalkCycle() {
  if (generated) {
    character.bindWalkCycle();
  }
  bound = true;
}

function loadAssets() {
  let offsetsArray = [];
  let colorsArray = [];
  let r1Array = [];
  let r2Array = [];
  let r3Array = [];
  let scaleArray = [];
  let typeArray = [];

  offsetsArray.push(0);
  offsetsArray.push((-1.0 + 2.0 * numJoints) - 1.5);
  offsetsArray.push(0);

  r1Array.push(1);
  r1Array.push(0);
  r1Array.push(0);
        
  r2Array.push(0);
  r2Array.push(1);
  r2Array.push(0);
        
  r3Array.push(0);
  r3Array.push(0);
  r3Array.push(1);
        
  scaleArray.push(1.0);
  scaleArray.push(1.0);
  scaleArray.push(1.0);

  colorsArray.push(0.0);
  colorsArray.push(1.0);
  colorsArray.push(1.0);
  colorsArray.push(1.0);

  typeArray.push(4.0);
  typeArray.push(4.0);
  typeArray.push(4.0);

  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  let r1s: Float32Array = new Float32Array(r1Array);
  let r2s: Float32Array = new Float32Array(r2Array);
  let r3s: Float32Array = new Float32Array(r3Array);
  let scales: Float32Array = new Float32Array(scaleArray);
  let types: Float32Array = new Float32Array(typeArray);
  eyes.setInstanceVBOs(offsets, colors, r1s, r2s, r3s, scales, types);
  eyes.setNumInstances(1); // grid of "particles"

  typeArray = [];
  typeArray.push(5.0);
  typeArray.push(5.0);
  typeArray.push(5.0);
  types = new Float32Array(typeArray);

  ears.setInstanceVBOs(offsets, colors, r1s, r2s, r3s, scales, types);
  ears.setNumInstances(1); // grid of "particles"

  typeArray = [];
  typeArray.push(6.0);
  typeArray.push(6.0);
  typeArray.push(6.0);
  types = new Float32Array(typeArray);

  mouth.setInstanceVBOs(offsets, colors, r1s, r2s, r3s, scales, types);
  mouth.setNumInstances(1); // grid of "particles"
}
function loadScene() {
  plane.create();
  screenQuad.create();
  if (blue) {
    body = new Mesh(blue_body,vec3.fromValues(0.0,0.0,0.0));
    eyes = new Mesh(blue_eyes,vec3.fromValues(0.0,0.0,0.0));
    ears = new Mesh(blue_ears,vec3.fromValues(0.0,0.0,0.0));
    mouth = new Mesh(blue_mouth,vec3.fromValues(0.0,0.0,0.0));
    eyes.create();
    ears.create();
    mouth.create();
    loadAssets();
  } else {
    body = new Mesh(obj5,vec3.fromValues(0.0,0.0,0.0));
  }

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
    let typeArrayBd = [];

    let offsetsArrayBg = [];
    let colorsArrayBg = [];
    let r1ArrayBg = [];
    let r2ArrayBg = [];
    let r3ArrayBg = [];
    let scaleArrayBg = [];
    let typeArrayBg = [];

    let offsetsArrayM = [];
    let colorsArrayM = [];
    let r1ArrayM = [];
    let r2ArrayM = [];
    let r3ArrayM = [];
    let scaleArrayM = [];
    let typeArrayM = [];

    let offsetsArrayE = [];
    let colorsArrayE = [];
    let r1ArrayE = [];
    let r2ArrayE = [];
    let r3ArrayE = [];
    let scaleArrayE = [];
    let typeArrayE = [];
  
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
        offsetsArrayBd.push(position[1] - 1.0);
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
        
        typeArrayBd.push(0.0);
        typeArrayBd.push(0.0);
        typeArrayBd.push(0.0);

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

        typeArrayBg.push(1.0);
        typeArrayBg.push(1.0);
        typeArrayBg.push(1.0);
        
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

        typeArrayM.push(2.0);
        typeArrayM.push(2.0);
        typeArrayM.push(2.0);
        
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

        typeArrayE.push(3.0);
        typeArrayE.push(3.0);
        typeArrayE.push(3.0);
        
        colorsArrayE.push(128.0 / 255.0);
        colorsArrayE.push(200.0 / 255.0);
        colorsArrayE.push(252.0 / 255.0);
        colorsArrayE.push(1.0); // Alpha channel
      }

      //console.log("Offset: " + position[0] + ", " + position[1] + ", " + position[2]);

    }

  let offsets: Float32Array = new Float32Array(offsetsArrayBd);
  let colors: Float32Array = new Float32Array(colorsArrayBd);
  let r1s: Float32Array = new Float32Array(r1ArrayBd);
  let r2s: Float32Array = new Float32Array(r2ArrayBd);
  let r3s: Float32Array = new Float32Array(r3ArrayBd);
  let scales: Float32Array = new Float32Array(scaleArrayBd);
  let types: Float32Array = new Float32Array(typeArrayBd);
  body.setInstanceVBOs(offsets, colors, r1s, r2s, r3s, scales, types);
  body.setNumInstances(numBody); // grid of "particles"

  offsets = new Float32Array(offsetsArrayBg);
  colors = new Float32Array(colorsArrayBg);
  r1s = new Float32Array(r1ArrayBg);
  r2s  = new Float32Array(r2ArrayBg);
  r3s = new Float32Array(r3ArrayBg);
  scales = new Float32Array(scaleArrayBg);
  types = new Float32Array(typeArrayBg);
  beginJoints.setInstanceVBOs(offsets, colors, r1s, r2s, r3s, scales, types);
  beginJoints.setNumInstances(numBegin); // grid of "particles"

  offsets = new Float32Array(offsetsArrayM);
  colors = new Float32Array(colorsArrayM);
  r1s = new Float32Array(r1ArrayM);
  r2s  = new Float32Array(r2ArrayM);
  r3s = new Float32Array(r3ArrayM);
  scales = new Float32Array(scaleArrayM);
  types = new Float32Array(typeArrayM);
  middleJoints.setInstanceVBOs(offsets, colors, r1s, r2s, r3s, scales, types);
  middleJoints.setNumInstances(numMiddle); // grid of "particles"

  offsets = new Float32Array(offsetsArrayE);
  colors = new Float32Array(colorsArrayE);
  r1s = new Float32Array(r1ArrayE);
  r2s  = new Float32Array(r2ArrayE);
  r3s = new Float32Array(r3ArrayE);
  scales = new Float32Array(scaleArrayE);
  types = new Float32Array(typeArrayE);
  endJoints.setInstanceVBOs(offsets, colors, r1s, r2s, r3s, scales, types);
  endJoints.setNumInstances(numEnd); // grid of "particles"

  // prog.setLimb(arr);
  // prog.setnumJoints(character.totalNumJoints);
}

function getPosition(event : MouseEvent)
      {
        animate();
        // walk = true;
        // // var x = event.clientX + document.body.scrollLeft +
        // //       document.documentElement.scrollLeft;
        // // var y = event.clientY + document.body.scrollTop +
        // //       document.documentElement.scrollTop;

        // // var canvas = document.getElementById("canvas");

        // // x -= canvas.offsetLeft;
        // // y -= canvas.offsetTop;
        // let r = Math.random();

        // let tgt = vec3.create();
        // if (!sw) {
        //   tgt = vec3.fromValues(5.0, -5.0, 0.0);
        //   character.moveToTarget(tgt, 0);
        // } else {
        //   tgt = vec3.fromValues(-3.0, -5.0, 0.0);
        //   character.moveToTarget(tgt, 0);
        // }
        // sw = !sw;

        // let offsetsArray = [];
        // let colorsArray = [];
        // let r1Array = [];
        // let r2Array = [];
        // let r3Array = [];
        // let scaleArray = [];

        // walkCycle = new Mesh(obj0, tgt);
        // walkCycle.create();

        // offsetsArray.push(tgt[0]);
        // offsetsArray.push(tgt[1]);
        // offsetsArray.push(tgt[2]);

        // r1Array.push(1);
        // r1Array.push(0);
        // r1Array.push(0);
        
        // r2Array.push(0);
        // r2Array.push(1);
        // r2Array.push(0);
        
        // r3Array.push(0);
        // r3Array.push(0);
        // r3Array.push(1);
        
        // scaleArray.push(0.2);
        // scaleArray.push(0.2);
        // scaleArray.push(0.2);

        // colorsArray.push(1.0);
        // colorsArray.push(0.0);
        // colorsArray.push(0.0);
        // colorsArray.push(1.0);

        // let offsets: Float32Array = new Float32Array(offsetsArray);
        // let colors: Float32Array = new Float32Array(colorsArray);
        // let r1s: Float32Array = new Float32Array(r1Array);
        // let r2s: Float32Array = new Float32Array(r2Array);
        // let r3s: Float32Array = new Float32Array(r3Array);
        // let scales: Float32Array = new Float32Array(scaleArray);
        // walkCycle.setInstanceVBOs(offsets, colors, r1s, r2s, r3s, scales);
        // walkCycle.setNumInstances(1); // grid of "particles"
        
        
        // // if (r < 0.25) {
        // //   character.moveToTarget(vec3.fromValues(4.0, 12.0, 0.0), 0);
        // // } else if (r < 0.5) {
        // //   character.moveToTarget(vec3.fromValues(4.0, 10.0, 0.0), 0);
        // // } else if (r < 0.75) {
        // //   character.moveToTarget(vec3.fromValues(-2.0, 14.0, 0.0), 0);
        // // } else {
        // //   character.moveToTarget(vec3.fromValues(-4.0, 12.0, 0.0), 0);
        // // }
        
        // //console.log("x: " + ((x / canvas.clientWidth) * 32 - 16)+ "  y: " + ((y / canvas.clientHeight)* 32 -16) );
        // loadScene();
      }

function animate() {
  console.log("IDX: " + idxEven[0]);
  if (generated) {
    if (idxEven[0] > 6) {
        idxEven[0] = 6;
        idxEven[1] = 0;
    }

    if (idxEven[0] < 0) {
      idxEven[0] = 0;
      idxEven[1] = 1;
    }

    if (idxOdd[0] > 6) {
      idxOdd[0] = 6;
      idxOdd[1] = 0;
  }

  if (idxOdd[0] < 0) {
    idxOdd[0] = 0;
    idxOdd[1] = 1;
  }

    for (let i = 0; i < character.limbs.length; ++i) {
      let cyArray = character.legWalkCycles[i];
      if (i % 2 == 0) {
        character.moveToTarget(cyArray[idxEven[0]], i); //target, limb
      } else {
        character.moveToTarget(cyArray[idxOdd[0]], i); //target, limb
      }
       
    }
    if (idxEven[1] == 1) {
      idxEven[0]++;
    } else {
      idxEven[0]--;
    }
    if (idxOdd[1] == 1) {
      idxOdd[0]++;
    } else {
      idxOdd[0]--;
    }
    loadScene();
  }
}

function drawPoints() {
  if (!bound) {
    return;
  }
  if (controls.visualizePoints == 0) {
    walk = false;
  } else if (!gen) {
    walk = true;
    gen = true;
    let offsetsArray = [];
    let colorsArray = [];
    let r1Array = [];
    let r2Array = [];
    let r3Array = [];
    let scaleArray = [];
    let typeArray = [];

    walkCycle = new Mesh(obj0, vec3.fromValues(0,0,0));
    walkCycle.create();

    let n = 0;

    for (let i = 0; i < character.limbs.length; ++i) {
      let cyArray = character.legWalkCycles[i];
      for (let j = 0; j < cyArray.length; ++j) {
        n++;
        offsetsArray.push(cyArray[j][0]);
        offsetsArray.push(cyArray[j][1]);
        offsetsArray.push(cyArray[j][2]);
      
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

        typeArray.push(-1);
        typeArray.push(-1);
        typeArray.push(-1);
      
        colorsArray.push(1.0);
        colorsArray.push(0.0);
        colorsArray.push(0.0);
        colorsArray.push(1.0);
      }
    }   
    let offsets: Float32Array = new Float32Array(offsetsArray);
    let colors: Float32Array = new Float32Array(colorsArray);
    let r1s: Float32Array = new Float32Array(r1Array);
    let r2s: Float32Array = new Float32Array(r2Array);
    let r3s: Float32Array = new Float32Array(r3Array);
    let scales: Float32Array = new Float32Array(scaleArray);
    let types: Float32Array = new Float32Array(typeArray);
    walkCycle.setInstanceVBOs(offsets, colors, r1s, r2s, r3s, scales, types);
    walkCycle.setNumInstances(n); // grid of "particles"
  }
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

  gui.add(controls, 'Generate Walk Cycle');
  gui.add(controls, 'Bind Walk Cycle');
  gui.add(controls, 'walkActivated', 0, 1).step(1);
  gui.add(controls, 'visualizePoints', 0, 1).step(1);
  gui.add(controls, 'Legs', 1, 5).step(1);
  gui.add(controls, 'Joints', 0, 5).step(1);
  gui.add(controls, 'Blue');
  gui.add(controls, 'Flower Pot');
  // gui.add(controls, 'colorShift', 0, 1).step(0.1); visualizePoints


  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  //mouseClickEvent addition
  //canvas.addEventListener("mousedown", getPosition, false);

  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  const camera = new Camera(vec3.fromValues(10, 10, 10), vec3.fromValues(0,0, 0));

  renderer = new OpenGLRenderer(canvas);
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

  var prevVis = controls.visualizePoints;
  var prevLeg = controls.Legs;
  var prevJoint = controls.Joints;
  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    if (controls.walkActivated == 1 && time % 3 == 0) {
      animate();
    }
    if (controls.visualizePoints != prevVis) {
      prevVis = controls.visualizePoints;
      if (controls.visualizePoints == 1) {
        drawPoints();
      }
    }
    if (controls.Legs != prevLeg) {
      prevLeg = controls.Legs;
      numLegs = controls.Legs;
      updateCharacterLegs();
    }
    if (controls.Joints != prevJoint) {
      prevJoint = controls.Joints;
      numJoints = controls.Joints;
      updateCharacterJoints();
    }

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
      if (blue) {
        renderer.render(camera, instancedShader, [
          body, beginJoints, middleJoints, endJoints, walkCycle,
          eyes, ears, mouth
        ]);
      } else {
      renderer.render(camera, instancedShader, [
        body, beginJoints, middleJoints, endJoints, walkCycle
      ]);
    }
      
    } else {
      if (blue) {
        renderer.render(camera, instancedShader, [
          body, beginJoints, middleJoints, endJoints,
          eyes, ears, mouth
        ]);
      }
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