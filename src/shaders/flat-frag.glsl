#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;
uniform float u_Color;
uniform float u_Size;
uniform vec3 u_Char1;
uniform vec3 u_Scale;
uniform vec3 u_R1;
uniform vec3 u_R2;
uniform vec3 u_R3;

uniform vec3[100] u_LimbInformation;

uniform float u_NumJoints;

#define MAX_MARCHING_STEPS 100.f
#define MAX_DIST 500.f
#define MIN_DIST 0.f
#define EPSILON 0.01f
#define STEP_SIZE 0.001f

in vec2 fs_Pos;
out vec4 out_Col;

float dot2( vec2 v ) { return dot(v,v); }

mat4 rotateY(float theta) {
    float c = cos(theta);
    float s = sin(theta);

    return mat4(
        vec4(c, 0, s, 0),
        vec4(0, 1, 0, 0),
        vec4(-s, 0, c, 0),
        vec4(0, 0, 0, 1)
    );
}

mat4 rotateZ(float theta) {
    float c = cos(theta);
    float s = sin(theta);

    return mat4(
        vec4(c, -s, 0, 0),
        vec4(s, c, 0, 0),
        vec4(0, 0, 1, 0),
        vec4(0, 0, 0, 1)
    );
}

float boxSDF(vec3 samplePoint)
{
  vec3 b = vec3(1.0,1.0,1.0);
  vec3 d = abs(samplePoint) - b;
  return length(max(d,0.0))
         + min(max(d.x,max(d.y,d.z)),0.0);
}

float sphereSDF(vec3 posAlongRay, float rad) {
  return float(length(posAlongRay)) - rad;
}

float intersectSDF(float distA, float distB) {
  return max(distA, distB);
}

float subtractSDF(float distA, float distB) {
  return max(-distA, distB);
}

float smooth_min(float a, float b, float k) {
    float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

vec2 sceneMap(vec3 samplePoint) {
    bool spheres = false;
    float maxYSphere = 10.f;
    float maxXSphere = 5.f;
    float minYSphere = -20.f;
    float minXSphere = -50.f;
    float sphereDist = 0.f;

    //non-uniform scaling formula (thanks Jamie Wong):
    //float dist = someSDF(samplePoint / vec3(s_x, s_y, s_z)) * min(s_x, min(s_y, s_z));

    bool xCheck = samplePoint.x <= (u_Char1.x + u_Scale.x + 1.0) && samplePoint.x >= (u_Char1.x - u_Scale.x - 1.0);
    bool yCheck = samplePoint.y <= (u_Char1.y + u_Scale.y + 1.0) && samplePoint.y >= (u_Char1.y - u_Scale.y - 1.0);
    bool zCheck = samplePoint.z <= (u_Char1.z + u_Scale.z + 1.0) && samplePoint.z >= (u_Char1.z - u_Scale.z + 1.0);
    
      if (xCheck && yCheck) {
        spheres = true;
        vec3 rotated = (inverse(rotateZ(5.0)) * vec4(samplePoint + vec3(0.0, 3.0, 0.0), 1.0)).xyz;
          vec3 rotated2 = (inverse(rotateZ(-2.0)) * vec4(samplePoint + vec3(0.0, 6.0, 0.0), 1.0)).xyz;
          
          mat3 rotate = (mat3(u_R1,
                              u_R2,
                              u_R3));

          vec3 transformed = (inverse(rotate) * vec3(samplePoint));
          transformed = transformed - u_Char1;
          sphereDist = boxSDF(transformed / u_Scale) * min(u_Scale[0], min(u_Scale[1], u_Scale[2])); //sphereSDF(samplePoint - u_Char1, 7.f);

      }
          
          
          //loop through the number of joints we have and draw them!
          //pos, scale, r1, r2, r3
        
        for (int i = 0; i < int(u_NumJoints); i++) {
          vec3 pos = u_LimbInformation[8*i];
          vec3 scale = u_LimbInformation[8*i + 1];
          vec3 forward = u_LimbInformation[8*i + 5];
          vec3 right = u_LimbInformation[8*i + 6];
          vec3 up = u_LimbInformation[8*i + 7];

          bool yCheck = true; //samplePoint.y <= pos.y + 1.5 * scale.y + 1.0 && samplePoint.y >= pos.y - 1.5 * scale.y - 1.0; //(samplePoint.x <= (pos + right * scale.x).x ) && (samplePoint.x >= (pos - right * scale.x).x);

          if (yCheck) {
              spheres = true;
              vec3 r1 = u_LimbInformation[8*i + 2];
              vec3 r2 = u_LimbInformation[8*i + 3];
              vec3 r3 = u_LimbInformation[8*i + 4];
              mat3 rotate2 = (mat3(r1,
                                  r2,
                                  r3));
              vec3 transformed = (inverse(rotate2) * vec3(samplePoint + vec3(-pos.x, pos.y, pos.z)));
              //transformed += vec3(pos.x, pos.y / 2.0, pos.z);
              float joint = boxSDF((transformed / scale)) * min(scale.x, min(scale.y, scale.z));
              if (sphereDist == 0.f) {
                sphereDist = joint;
              } else {
                sphereDist = smooth_min(sphereDist, joint, 0.0);
              }
            }
        }

        //4.0, 10.0, 0.0
        //float dot = sphereSDF(samplePoint + vec3(4.0, 10.0, 0.0), 1.0);
        //float dot2 = sphereSDF(samplePoint + vec3(-2.0, 14.0, 0.0), 1.0);

        if (spheres) {
          return vec2(sphereDist, 2.f);
         //if (sphereDist < dot && sphereDist < dot2 && sphereDist < 100.f) {
         //  return vec2(sphereDist, 2.f);
         //} else if (dot < sphereDist && dot < dot2 && dot < 100.f) {
         //  return vec2(dot, 2.f);
         //} else if (dot2 < sphereDist && dot2 < dot && dot2 < 100.f) {
         //  return vec2(dot2, 2.f);
         //
          
        } 
    
    return vec2(100.f, 0.f);
}

vec2 rayMarch(vec3 origin, vec3 dir) {
  float depth = MIN_DIST;
  for (int i = 0; i < int(MAX_MARCHING_STEPS); i++) {
    vec2 dist = sceneMap(origin + depth * dir);
    if (dist.x < EPSILON) {
        // We're inside the scene surface!
        return vec2(depth, dist.y);
    }
    // Move along the view ray
    depth += dist.x;

    if (depth >= MAX_DIST) {
        // Gone too far; give up
        return vec2(MAX_DIST, 0.f);
    }
  }
  return vec2(MAX_DIST, 0.f);
}

vec3 estimateNormal(vec3 p) {
    return normalize(vec3(
        sceneMap(vec3(p.x + EPSILON, p.y, p.z)).x - sceneMap(vec3(p.x - EPSILON, p.y, p.z)).x,
        sceneMap(vec3(p.x, p.y + EPSILON, p.z)).x - sceneMap(vec3(p.x, p.y - EPSILON, p.z)).x,
        sceneMap(vec3(p.x, p.y, p.z  + EPSILON)).x - sceneMap(vec3(p.x, p.y, p.z - EPSILON)).x
    ));
}

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float interpNoise2D(float x, float y) {
  float intX = floor(x);
  float fractX = fract(x);
  float intY = floor(y);
  float fractY = fract(y);

  float v1 = rand(vec2(intX, intY));
  float v2 = rand(vec2(intX + 1.f, intY));
  float v3 = rand(vec2(intX, intY + 1.f));
  float v4 = rand(vec2(intX + 1.f, intY + 1.f));

  float i1 = mix(v1, v2, fractX);
  float i2 = mix(v3, v4, fractX);

  return mix(i1, i2, fractY);
}

float fbm(float x, float y) {
  float roughness = 1.f;
  float total = 0.f;
  float persistence = 0.5f;
  int octaves = 8;

  for (int i = 0; i < octaves; i++) {
    float freq = pow(2.f, float(i));
    float amp = pow(persistence, float(i));

    total += interpNoise2D(x * freq, y * freq) * amp * roughness;
    roughness *= interpNoise2D(x*freq, y*freq);
  }
  return total;
}

float parabola(float x, float k) {
	return pow(4.f*x*(1.f - x), k);
}

void main() {

  //let's cast a ray using the info we have!
  //any point on frustrum Pf = ref + aH + bV where
  //ref = u_Ref, a = 2*(Px/u_Dimensions.x - 0.5), b = 2*(Py/u_Dimensions.y - 0.5), and
  //H = aspect_ratio*tan(FOV/2) * right_vector (aspect = width / height)
  //V = tan(FOV/2) * up_vector

  vec3 forward = normalize(u_Ref - u_Eye);
  vec3 right = normalize(cross(forward, u_Up));
  vec3 up = normalize(cross(right, forward));

  vec3 h = right * length(u_Ref - u_Eye) * (float(u_Dimensions.x) / u_Dimensions.y) * tan(radians(45.0));
  vec3 v = up * length(u_Ref - u_Eye) * tan(radians(45.0));

  vec3 Pf = u_Ref + fs_Pos.x * h + fs_Pos.y * v;
  vec3 dir = normalize(Pf - u_Eye);

  //ray march along dir
  vec2 res = rayMarch(u_Eye, dir);

if (res.x > 99.f) {
  vec3 p = u_Eye + res.x*dir;
  //float noise = smoothstep(0.0,0.5,fbm(p.x, p.y)) + smoothstep(0.0,0.5,fbm(p.y, p.x));
  out_Col = vec4(160.0 / 255.0, 247.0 / 255.0, 255.0 / 255.0, 1.0); //(vec3(1.0) - ((vec3(0.5) * 20.f * noise) * vec3(0.8, 0.3, 0.9)), 1.0); //234 227 244
} else if (res.y == 1.f) {
  vec3 p = u_Eye + res.x*dir;
  vec3 n = estimateNormal(p); //86 244, 66

  vec3 lightVector = vec3(-5.0,-2.0,0.0);

  float diffuseTerm = dot(normalize(n), normalize(lightVector));
  diffuseTerm = clamp(diffuseTerm, 0.f, 1.f);
  float ambientTerm = 0.2;

  float lightIntensity = diffuseTerm + ambientTerm;


  vec4 H = (vec4(lightVector, 1.0) + (vec4(u_Eye,1.f) - vec4(p,1.0))) / 2.0;
    float blinnTerm = max(pow(dot(normalize(H), normalize(vec4(lightVector, 1.0))), 100.f), 0.f);
    blinnTerm = clamp(blinnTerm,0.f,1.f);

    // Compute final shaded color
    out_Col = vec4(vec3((17.f + 255.f*u_Color) / 255.f, 73.f / 255.f, (9.f + 255.f*u_Color) / 255.f) * lightIntensity + blinnTerm, 1.0); //58,35,89

} else if (res.y == 2.f) {
    vec3 p = u_Eye + res.x*dir;
  vec3 n = estimateNormal(p);

  vec3 lightVector = vec3(3.0,2.0,3.0);

  float diffuseTerm = dot(normalize(n), normalize(lightVector));
  diffuseTerm = clamp(diffuseTerm, 0.f, 1.f);
  float ambientTerm = 0.2;

  float lightIntensity = diffuseTerm + ambientTerm;


  vec4 H = (vec4(lightVector, 1.0) + (vec4(u_Eye,1.f) - vec4(p,1.0))) / 2.0;
    float blinnTerm = max(pow(dot(normalize(H), normalize(vec4(lightVector, 1.0))), 100.f), 0.f);
    blinnTerm = clamp(blinnTerm,0.f,1.f);

  float noise = parabola(fbm(p.x, p.y), 6.f);
  out_Col = vec4(vec3(216.0 / 255.0, 67.0 / 255.0, 89.0 / 255.0) * lightIntensity + blinnTerm,1); // * 
}
  
}