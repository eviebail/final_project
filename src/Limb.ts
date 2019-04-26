import {quat, vec2, vec3, mat3, mat4} from 'gl-matrix';
import Leg from './Leg';

class Limb {
  joints : Array<Leg> = new Array<Leg>();

  constructor(joints : Array<Leg>) {
      for (let i = 0; i < joints.length; i++) {
        this.joints[i] = joints[i];
      }
      //console.log("Joints.size: " + this.joints.length);
    }

    CCD(target : vec3) {
        //all joints should have their world space pos and rel orientations!!

        //error check
        if (this.joints.length < 1) {
            return;
        }

          let endpoint : Leg = this.joints[this.joints.length - 1];
          let point = vec3.fromValues(endpoint.position[0], endpoint.position[1] - endpoint.scale[1], endpoint.position[2]);

        for (let i = this.joints.length - 2; i >= 0; i--) {
            //console.log("i: " + i);
            let joint : Leg = this.joints[i];

            joint.rotation = mat3.fromValues(1,0,0,0,1,0,0,0,1);
            joint.orientation = vec3.fromValues(0,1,0);

            //can't use quaternions here!
            let pc : vec3 = vec3.create();
            let pec : vec3 = vec3.create();
            let ptc : vec3 = vec3.create();
            vec3.sub(pc, joint.position, point);

            //cos(theta) = pe - pc / ||pe - pc|| dot pt - pc / ||pt - pc||
            vec3.sub(pec, point, pc);
            let pecL = Math.sqrt(pec[0] * pec[0] + pec[1] * pec[1] + pec[2] * pec[2]);
            vec3.div(pec, pec,  [pecL, pecL, pecL]);

            vec3.sub(ptc, target, pc);
            let ptcL = Math.sqrt(ptc[0] * ptc[0] + ptc[1] * ptc[1] + ptc[2] * ptc[2]);
            vec3.div(ptc, ptc,  [ptcL, ptcL, ptcL]);
            let theta = Math.acos(vec3.dot(pec, ptc));
            // theta = Math.max(theta, -90.0);
            // theta = Math.min(theta, 90.0);

            //now let's get the axis!
            let r = vec3.create();
            vec3.cross(r, pec, ptc);

            //now let's get the rotation matrix from this info!
            let rotMat : mat4 = mat4.create();
            let test = mat3.create();
            mat4.fromRotation(rotMat, theta, r);
            mat3.fromMat4(joint.rotation, rotMat);

            //console.log("Theta: " + theta + " and R" + r[0] + ", " + r[1] + ", " + r[2]);

            // console.log("NewMat: " + test[0] + ", " +   test[1] + ", " + test[2]
            //         + ", " + test[3] + ", " + test[4] + ", " + test[5]
            //         + ", " + test[6] + ", " + test[7] + ", " + test[8]);


            //update the properties!
            //console.log("Old Orientation: " + joint.orientation[0] + ", " + joint.orientation[1] + ", " + joint.orientation[2]);
            //get orientation from global up vector
            //quat.rotationTo(q,vec3.fromValues(0,1,0), joint.orientation);
            //mat3.fromQuat(endpoint.rotation, q);
            vec3.transformMat3(joint.orientation, joint.orientation, joint.rotation);
            vec3.transformMat3(joint.right, joint.right, joint.rotation);
            vec3.transformMat3(joint.forward, joint.forward, joint.rotation);
            vec3.transformMat3(joint.up, joint.up, joint.rotation);

            //console.log("New Orientation: " + joint.orientation[0] + ", " + joint.orientation[1] + ", " + joint.orientation[2]);
            //now update the position of all of its children
            for (let j = i + 1; j < this.joints.length; j++) {
                let jnt = this.joints[j];
                //console.log();
                //console.log("Old JPos: " + jnt.position[0] + ", " + jnt.position[1] + ", " + jnt.position[2]);
                let p = vec3.create();
                vec3.mul(p, this.joints[j-1].orientation, vec3.fromValues(this.joints[j - 1].scale[1] * 2.0, this.joints[j - 1].scale[1] * 2.0, this.joints[j - 1].scale[1]*2.0));
                vec3.sub(jnt.position, vec3.fromValues(this.joints[j - 1].position[0], this.joints[j - 1].position[1], this.joints[j - 1].position[2]), p);
                //console.log("New JPos: " + jnt.position[0] + ", " + jnt.position[1] + ", " + jnt.position[2]);
                jnt.position = vec3.fromValues(jnt.position[0], jnt.position[1], jnt.position[2]);
            }
         }
         //don't orient endjoint because we make it a foot!
    }

};

export default Limb;
