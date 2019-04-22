import {quat, vec2, vec3, mat3, mat4} from 'gl-matrix';
import Leg from './Leg';
import Limb from './Limb';

class Character {
  arms : Array<vec3>;
  legs : Array<vec3> = new Array<vec3>();
  legJoints : Array<Leg> = new Array<Leg>();
  limbs : Array<Limb> = new Array<Limb>();
  scale : vec3;
  position : vec3;
  orientation : vec3;
  forward : vec3;
  right : vec3;
  up : vec3;
  r1 : vec3;
  r2 : vec3;
  r3 : vec3;
  totalNumJoints : number;

  constructor(position: vec3, numLegs : vec2/*, scale : vec3, numArms : vec2, numLegs : vec2*/) {
    this.position = vec3.fromValues(position[0], position[1], position[2]);
    this.orientation = vec3.fromValues(0,1,0);
    this.forward = vec3.fromValues(0,1,0);
    this.right = vec3.fromValues(1,0,0);
    this.up = vec3.fromValues(0,0,1);
    this.scale = vec3.fromValues(10,5,5);
    this.r1 = vec3.fromValues(1,0,0);
    this.r2 = vec3.fromValues(0,1,0);
    this.r3 = vec3.fromValues(0,0,1);

    this.totalNumJoints = 0;

      //should make one leg!
        // let p = vec3.create();
        // vec3.mul(p, this.orientation, vec3.fromValues(this.scale[1] * 2.0, this.scale[1] * 2.0, this.scale[1]*2.0));
        // let pos = vec3.create();
        // vec3.add(pos, p, vec3.fromValues(this.position[0], this.position[1], this.position[2]));
        // let scale = vec3.fromValues(1,4,1);
        // let r11 = vec3.fromValues(1,0,0);
        // let r22 = vec3.fromValues(0,1,0);
        // let r33 = vec3.fromValues(0,0,1);
        
        // this.legs.push(pos);
        // this.legs.push(scale);
        // this.legs.push(r11);
        // this.legs.push(r22);
        // this.legs.push(r33);


        for (let i = 0; i < numLegs[0]; i++) {
          for (let r = 0; r < this.legJoints.length; r++) {
            this.legJoints.pop;
          }
          for (let j = 0; j < numLegs[1]; j++) {
            let p = vec3.create();
            let pos = vec3.create();
            if (j == 0) {
              //get pos from root
              vec3.mul(p, this.orientation, vec3.fromValues(this.scale[1], this.scale[1], this.scale[1]));
              vec3.add(pos, p, vec3.fromValues(this.position[0], this.position[1], this.position[2]));
            } else {
              vec3.mul(p, this.legJoints[j-1].orientation, vec3.fromValues(this.legJoints[j - 1].scale[1] * 2.0, this.legJoints[j - 1].scale[1] * 2.0, this.legJoints[j - 1].scale[1]*2.0));
              vec3.add(pos, p, vec3.fromValues(this.legJoints[j - 1].position[0], this.legJoints[j - 1].position[1], this.legJoints[j - 1].position[2]));
            }
            let scale = vec3.fromValues(1,4,1);
            let m = mat3.create();
            mat3.identity(m);
            this.totalNumJoints++;
            this.legJoints.push(new Leg(pos, vec3.fromValues(0,1,0), vec3.fromValues(0,1,0), 
                                        vec3.fromValues(1,0,0), vec3.fromValues(0,0,1), scale, 
                                        m));
            }
            this.limbs.push(new Limb(this.legJoints));
        }

    }

    moveToTarget(target : vec3, limb : number) {
      this.limbs[limb].CCD(target);
    }

    getVBOData() : vec3[][] {
      var data : vec3[][] = new Array<Array<vec3>>();

      let pos : vec3[] = new Array();
      let returnR1 : vec3[] = new Array();
      let returnR2 : vec3[] = new Array();
      let returnR3 : vec3[] = new Array();
      let scale : vec3[] = new Array();

      pos.push(this.position);
      returnR1.push(this.r1);
      returnR2.push(this.r2);
      returnR3.push(this.r3);
      scale.push(this.scale);

      //loop through all the joints and input their data!
      for (let l = 0; l < this.limbs.length; l++) {
        for (let j = 0; j < this.limbs[l].joints.length; j++) {
          pos.push(this.limbs[l].joints[j].position);
          let m = this.limbs[l].joints[j].rotation;
          let r1 = vec3.fromValues(m[0], m[3], m[6]);
          let r2 = vec3.fromValues(m[1], m[4], m[7]);
          let r3 = vec3.fromValues(m[2], m[5], m[8]); 

          returnR1.push(r1); 
          returnR2.push(r2); 
          returnR3.push(r3);

          scale.push(this.limbs[l].joints[j].scale);
        }
      }
      data.push(pos);
      data.push(returnR1);
      data.push(returnR2);
      data.push(returnR3);
      data.push(scale);
      return data;
    }

    rotateL(phi : number) {

        //about up
        this.up = vec3.normalize(this.up, this.up);
        let q = quat.fromValues(this.up[0], this.up[1], this.up[2], phi * Math.PI / 180.0);
        let theta = phi * Math.PI / 180.0;
        //rodrigues formula
        let r00 = Math.cos(theta) + this.up[0]*this.up[0]*(1.0 - Math.cos(theta));
        let r01 = -this.up[2]*Math.sin(theta) + this.up[0]*this.up[1]*(1.0 - Math.cos(theta));
        let r02 = this.up[1]*Math.sin(theta) + this.up[0]*this.up[2]*(1.0 - Math.cos(theta));
      
        let r10 = this.up[2]*Math.sin(theta) + this.up[0]*this.up[1]*(1.0 - Math.cos(theta));
        let r11 = Math.cos(theta) + this.up[1]*this.up[1]*(1.0 - Math.cos(theta));
        let r12 = this.up[0]*Math.sin(theta) + this.up[1]*this.up[2]*(1.0 - Math.cos(theta));
      
        let r20 = -this.up[1]*Math.sin(theta) + this.up[0]*this.up[2]*(1.0 - Math.cos(theta));
        let r21 = this.up[0]*Math.sin(theta) + this.up[1]*this.up[2]*(1.0 - Math.cos(theta));
        let r22 = Math.cos(theta) + this.up[2]*this.up[2]*(1.0 - Math.cos(theta));
      
        let m : mat3 = mat3.fromValues(r00,r01,r02,r10,r11,r12,r20,r21,r22);
        vec3.transformMat3(this.orientation, this.orientation, m);
        vec3.transformMat3(this.right, this.right, m);
        vec3.transformMat3(this.forward, this.forward, m);

        
        let tPos = vec3.fromValues(this.position[0], this.position[1], this.position[2]);
        let tScale = vec3.fromValues(this.scale[0], this.scale[1], this.scale[2]);

        let rotation : mat3 = mat3.fromValues(1,0,0,0,1,0,0,0,1);

        var qu = quat.fromValues(0,0,0,0);
        quat.rotationTo(qu,vec3.fromValues(0,1,0), this.orientation);
        mat3.fromQuat(rotation, qu);

        this.r1 = vec3.fromValues(rotation[0], rotation[3], rotation[6]);
        this.r2 = vec3.fromValues(rotation[1], rotation[4], rotation[7]);
        this.r3 = vec3.fromValues(rotation[2], rotation[5],rotation[8]); 
    }

    rotateLimb(phi : number, joint : number, leg : number) {

      //get joint from appropriate leg
      let l : Leg = this.legJoints[joint];

      //about up
      l.up = vec3.normalize(l.up, l.up);
      let q = quat.fromValues(l.up[0], l.up[1], l.up[2], phi * Math.PI / 180.0);
      let theta = phi * Math.PI / 180.0;
      //rodrigues formula
      let r00 = Math.cos(theta) + l.up[0]*l.up[0]*(1.0 - Math.cos(theta));
      let r01 = -l.up[2]*Math.sin(theta) + l.up[0]*l.up[1]*(1.0 - Math.cos(theta));
      let r02 = l.up[1]*Math.sin(theta) + l.up[0]*l.up[2]*(1.0 - Math.cos(theta));
    
      let r10 = l.up[2]*Math.sin(theta) + l.up[0]*l.up[1]*(1.0 - Math.cos(theta));
      let r11 = Math.cos(theta) + l.up[1]*l.up[1]*(1.0 - Math.cos(theta));
      let r12 = l.up[0]*Math.sin(theta) + l.up[1]*l.up[2]*(1.0 - Math.cos(theta));
    
      let r20 = -l.up[1]*Math.sin(theta) + l.up[0]*l.up[2]*(1.0 - Math.cos(theta));
      let r21 = l.up[0]*Math.sin(theta) + l.up[1]*l.up[2]*(1.0 - Math.cos(theta));
      let r22 = Math.cos(theta) + l.up[2]*l.up[2]*(1.0 - Math.cos(theta));
    
      let m : mat3 = mat3.fromValues(r00,r01,r02,r10,r11,r12,r20,r21,r22);
      vec3.transformMat3(l.orientation, l.orientation, m);
      vec3.transformMat3(l.right, l.right, m);
      vec3.transformMat3(l.forward, l.forward, m);

      
      let tPos = vec3.fromValues(l.position[0], l.position[1], l.position[2]);
      let tScale = vec3.fromValues(l.scale[0], l.scale[1], l.scale[2]);

      let rotation : mat3 = mat3.fromValues(1,0,0,0,1,0,0,0,1);

      var qu = quat.fromValues(0,0,0,0);
      quat.rotationTo(qu,vec3.fromValues(0,1,0), l.orientation);
      mat3.fromQuat(rotation, qu);

      // l.r1 = vec3.fromValues(rotation[0], rotation[3], rotation[6]);
      // l.r2 = vec3.fromValues(rotation[1], rotation[4], rotation[7]);
      // l.r3 = vec3.fromValues(rotation[2], rotation[5],rotation[8]); 
  }

};

export default Character;
