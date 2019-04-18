import {vec2, vec3, vec4, mat4} from 'gl-matrix';
import Drawable from './Drawable';
import {gl} from '../../globals';

var activeProgram: WebGLProgram = null;

export class Shader {
  shader: WebGLShader;

  constructor(type: number, source: string) {
    this.shader = gl.createShader(type);
    gl.shaderSource(this.shader, source);
    gl.compileShader(this.shader);

    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(this.shader);
    }
  }
};

class ShaderProgram {
  prog: WebGLProgram;

  attrPos: number;
  attrNor: number;

  unifRef: WebGLUniformLocation;
  unifEye: WebGLUniformLocation;
  unifUp: WebGLUniformLocation;
  unifDimensions: WebGLUniformLocation;
  unifTime: WebGLUniformLocation;
  unifColor: WebGLUniformLocation;
  unifSize: WebGLUniformLocation;

  unifChar1Pos : WebGLUniformLocation;
  unifScale : WebGLUniformLocation;
  unifR1 : WebGLUniformLocation;
  unifR2 : WebGLUniformLocation;
  unifR3 : WebGLUniformLocation;

  unifLimb: WebGLUniformLocation;
  unifJoints: WebGLUniformLocation;

  constructor(shaders: Array<Shader>) {
    this.prog = gl.createProgram();

    for (let shader of shaders) {
      gl.attachShader(this.prog, shader.shader);
    }
    gl.linkProgram(this.prog);
    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(this.prog);
    }

    this.attrPos = gl.getAttribLocation(this.prog, "vs_Pos");
    this.unifEye   = gl.getUniformLocation(this.prog, "u_Eye");
    this.unifRef   = gl.getUniformLocation(this.prog, "u_Ref");
    this.unifUp   = gl.getUniformLocation(this.prog, "u_Up");
    this.unifDimensions   = gl.getUniformLocation(this.prog, "u_Dimensions");
    this.unifTime   = gl.getUniformLocation(this.prog, "u_Time");
    this.unifColor   = gl.getUniformLocation(this.prog, "u_Color");
    this.unifSize   = gl.getUniformLocation(this.prog, "u_Size");
    this.unifChar1Pos   = gl.getUniformLocation(this.prog, "u_Char1");
    this.unifScale   = gl.getUniformLocation(this.prog, "u_Scale");
    this.unifR1   = gl.getUniformLocation(this.prog, "u_R1");
    this.unifR2   = gl.getUniformLocation(this.prog, "u_R2");
    this.unifR3   = gl.getUniformLocation(this.prog, "u_R3");
    this.unifLimb = gl.getUniformLocation(this.prog, "u_LimbInformation");
    this.unifJoints = gl.getUniformLocation(this.prog, "u_NumJoints");
  }

  use() {
    if (activeProgram !== this.prog) {
      gl.useProgram(this.prog);
      activeProgram = this.prog;
    }
  }

  setEyeRefUp(eye: vec3, ref: vec3, up: vec3) {
    this.use();
    if(this.unifEye !== -1) {
      gl.uniform3f(this.unifEye, eye[0], eye[1], eye[2]);
    }
    if(this.unifRef !== -1) {
      gl.uniform3f(this.unifRef, ref[0], ref[1], ref[2]);
    }
    if(this.unifUp !== -1) {
      gl.uniform3f(this.unifUp, up[0], up[1], up[2]);
    }
  }

  setDimensions(width: number, height: number) {
    this.use();
    if(this.unifDimensions !== -1) {
      gl.uniform2f(this.unifDimensions, width, height);
      //gl.uniformMatrix4fv
    }
  }

  setTime(t: number) {
    this.use();
    if(this.unifTime !== -1) {
      gl.uniform1f(this.unifTime, t);
    }
  }

  setColorShift(t: number) {
    this.use();
    if(this.unifColor !== -1) {
      gl.uniform1f(this.unifColor, t);
    }
  }

  setSizeShift(t: number) {
    this.use();
    if(this.unifSize !== -1) {
      gl.uniform1f(this.unifSize, t);
    }
  }

  setChar1Pos(t: vec3) {
    this.use();
    if(this.unifChar1Pos !== -1) {
      gl.uniform3f(this.unifChar1Pos, t[0], t[1], t[2]);
    }
  }

  setScale(t: vec3) {
    this.use();
    if(this.unifScale !== -1) {
      gl.uniform3f(this.unifScale, t[0], t[1], t[2]);
    }
  }

  setR1(t: vec3) {
    this.use();
    if(this.unifR1 !== -1) {
      gl.uniform3f(this.unifR1, t[0], t[1], t[2]);
    }
  }

  setR2(t: vec3) {
    this.use();
    if(this.unifR2 !== -1) {
      gl.uniform3f(this.unifR2, t[0], t[1], t[2]);
    }
  }

  setR3(t: vec3) {
    this.use();
    if(this.unifR3 !== -1) {
      gl.uniform3f(this.unifR3, t[0], t[1], t[2]);
    }
  }

  setnumJoints(t: number) {
    this.use();
    if(this.unifJoints !== -1) {
      gl.uniform1f(this.unifJoints, t);
    }
  }

setLimb(arr : Float32Array) {
    // let overallMatrices : Array<vec3> = new Array<vec3>(100);

    // for (let id = 0; id < arr.length; id++) {
    //     overallMatrices[id] = arr[id];
    // }

    this.use();

    if(this.unifLimb != -1) {
        // Pass a 4x4 matrix into a uniform variable in our shader
        // Handle to the matrix variable on the GPU
        
        gl.uniform3fv(this.unifLimb,
                                 // How many matrices to pass
                                 arr,
                                 // Transpose the matrix? OpenGL uses column-major, so no.
                                 0,
                                 // Pointer to the first element of the matrix
                                 arr.length);
    }
}

  draw(d: Drawable) {
    this.use();

    if (this.attrPos != -1 && d.bindPos()) {
      gl.enableVertexAttribArray(this.attrPos);
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
    }

    d.bindIdx();
    gl.drawElements(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0);

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
  }
};

export default ShaderProgram;