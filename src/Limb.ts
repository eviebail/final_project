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
        //get quat rotation between target and endpoint orientation
        endpoint.rotation = mat3.fromValues(1,0,0,0,1,0,0,0,1);
        endpoint.orientation = vec3.fromValues(0,1,0);
        var q = quat.fromValues(0,0,0,0);
        let destination : vec3 = vec3.create();
        vec3.subtract(destination, target, endpoint.position);

        // console.log("Target: " + target[0] + ", " + target[1] + ", " + target[2]);
        // console.log("Position: " + endpoint.position[0] + ", " + endpoint.position[1] + ", " + endpoint.position[2]);
        // console.log("Destination: " + destination[0] + ", " + destination[1] + ", " + destination[2]);

        let rot : mat3 = mat3.create();
        quat.rotationTo(q,destination, endpoint.orientation);
        mat3.fromQuat(endpoint.rotation, q);

        // console.log("EndRotMat: " + endpoint.rotation[0] + ", " + endpoint.rotation[1] + ", " + endpoint.rotation[2]
        //             + ", " + endpoint.rotation[3] + ", " + endpoint.rotation[4] + ", " + endpoint.rotation[5]
        //             + ", " + endpoint.rotation[6] + ", " + endpoint.rotation[7] + ", " + endpoint.rotation[8]);
        
        //update the properties!
        vec3.transformMat3(endpoint.orientation, endpoint.orientation, endpoint.rotation);
        vec3.transformMat3(endpoint.right, endpoint.right, endpoint.rotation);
        vec3.transformMat3(endpoint.forward, endpoint.forward, endpoint.rotation);
        vec3.transformMat3(endpoint.up, endpoint.up, endpoint.rotation);

        for (let i = this.joints.length - 2; i >= 0; i--) {
            //console.log("i: " + i);
            let joint : Leg = this.joints[i];

            joint.rotation = mat3.fromValues(1,0,0,0,1,0,0,0,1);
            joint.orientation = vec3.fromValues(0,1,0);

            //can't use quaternions here!
            let pc : vec3 = vec3.create();
            let pec : vec3 = vec3.create();
            let ptc : vec3 = vec3.create();
            vec3.sub(pc, endpoint.position, joint.position);

            //cos(theta) = pe - pc / ||pe - pc|| dot pt - pc / ||pt - pc||
            vec3.sub(pec, endpoint.position, pc);
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
            var qu = quat.fromValues(0,0,0,0);
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
                vec3.add(jnt.position, p, vec3.fromValues(this.joints[j - 1].position[0], this.joints[j - 1].position[1], this.joints[j - 1].position[2]));
                //console.log("New JPos: " + jnt.position[0] + ", " + jnt.position[1] + ", " + jnt.position[2]);
                jnt.position = vec3.fromValues(jnt.position[0], jnt.position[1], jnt.position[2]);
            }
         }

        //rotate the endjoint one more time to correct for any overshooting!
        endpoint = this.joints[this.joints.length - 1];
        //get quat rotation between target and endpoint orientation
        endpoint.rotation = mat3.fromValues(1,0,0,0,1,0,0,0,1);
        endpoint.orientation = vec3.fromValues(0,1,0);
        var q = quat.fromValues(0,0,0,0);
        destination = vec3.create();
        vec3.subtract(destination, target, endpoint.position);
        quat.rotationTo(q,destination, endpoint.orientation);
        mat3.fromQuat(endpoint.rotation, q);
        
        //update the properties!
        vec3.transformMat3(endpoint.orientation, endpoint.orientation, endpoint.rotation);
        vec3.transformMat3(endpoint.right, endpoint.right, endpoint.rotation);
        vec3.transformMat3(endpoint.forward, endpoint.forward, endpoint.rotation);
        vec3.transformMat3(endpoint.up, endpoint.up, endpoint.rotation);
        
    }

};

export default Limb;
