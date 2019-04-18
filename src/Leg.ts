import {quat, vec2, vec3, mat3, mat4} from 'gl-matrix';

class Leg {
  arms : Array<vec3>;
  legs : Array<vec3> = new Array<vec3>();
  scale : vec3;
  position : vec3;
  orientation : vec3;
  forward : vec3;
  right : vec3;
  up : vec3;
  rotation : mat3;

  constructor(position: vec3, orientation : vec3, forward : vec3,
              right : vec3, up : vec3, scale : vec3, rotation : mat3) {
    this.position = vec3.fromValues(position[0], position[1], position[2]);
    this.orientation = vec3.fromValues(orientation[0], orientation[1], orientation[2]);
    this.forward = vec3.fromValues(forward[0], forward[1], forward[2]);
    this.right = vec3.fromValues(right[0], right[1], right[2]);
    this.up = vec3.fromValues(up[0], up[1], up[2]);
    this.scale = vec3.fromValues(scale[0], scale[1], scale[2]);
    this.rotation = mat3.fromValues(rotation[0], rotation[1], rotation[2],
                                    rotation[3], rotation[4], rotation[5],
                                    rotation[6], rotation[7], rotation[8]);
    
    }

};

export default Leg;
