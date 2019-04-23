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
#define saturate(x) clamp(x,0.,1.)
#define rgb(r,g,b) (vec3(r,g,b)/255.)

in vec2 fs_Pos;
out vec4 out_Col;


float rand(float x) { return fract(sin(x) * 71523.5413291); }

float rand(vec2 x) { return rand(dot(x, vec2(13.4251, 15.5128))); }

float noise(vec2 x)
{
    vec2 i = floor(x);
    vec2 f = x - i;
    f *= f*(3.-2.*f);
    return mix(mix(rand(i), rand(i+vec2(1,0)), f.x),
               mix(rand(i+vec2(0,1)), rand(i+vec2(1,1)), f.x), f.y);
}

float fbm(vec2 x)
{
    float r = 0.0, s = 1.0, w = 1.0;
    for (int i=0; i<5; i++)
    {
        s *= 2.0;
        w *= 0.5;
        r += w * noise(s * x);
    }
    return r;
}

float cloud(vec2 uv, float scalex, float scaley, float density, float sharpness, float speed)
{
    return pow(saturate(fbm(vec2(scalex,scaley)*(uv+vec2(speed,0)/**iTime*/))-(1.0-density)), 1.0-sharpness);
}



void main()
{
  vec3 skyColor = vec3(255.0 / 255.0,212.0 / 255.0,166.0 / 255.0);
  vec3 horizonColor = vec3(244.0 / 255.0,217.0 / 255.0,254.0 / 255.0); //vec3(204.0 / 255.0,235.0 / 255.0,255.0 / 255.0);

  vec3 color = mix(skyColor, horizonColor, fs_Pos.y);

  //sun
  vec2 spos = fs_Pos - vec2(2.5, 3.0);
  float sun = exp(-20.*dot(spos,spos));
  vec3 scol = vec3(255.0 / 255.0,155.0 / 255.0,102.0 / 255.0) * sun * 0.7;
  color += scol;

  // clouds
    vec3 cl1 = mix(rgb(151,138,153), rgb(166,191,224),fs_Pos.y);
    float d1 = mix(0.9,0.1,pow(fs_Pos.y, 0.7));
    color = mix(color, cl1, cloud(fs_Pos,2.,8.,d1,0.4,0.04));
    
  //post
  color *= vec3(1.0,0.93,0.81)*1.04;
  //color = mix(0.75*rgb(255.0 / 255.0,205.0 / 255.0,161.0 / 255.0), color, smoothstep(-0.1,0.3,fs_Pos.y));
  //color = pow(color,vec3(1.3));

	out_Col = vec4(color, 1.0);
}

//https://www.shadertoy.com/view/XlsXDB