#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;
uniform sampler2D u_Texture; // The texture to be read from by this shader
uniform vec4 u_MapState;

in vec2 fs_Pos;
in float fs_Height;
out vec4 out_Col;

void main() {
    //let's add some sweet distance fog
    float t = clamp(smoothstep(40.0, 50.0, length(fs_Pos)), 0.0, 1.0); // Distance fog
    vec3 fog_color = vec3(244.0 / 255.0,217.0 / 255.0,254.0 / 255.0); //vec3(255.0 / 255.0,212.0 / 255.0,166.0 / 255.0);

    vec4 lightVec = vec4(-11.0,-13.0,0.0,1.0);

    // Calculate the diffuse term for Lambert shading
    float diffuseTerm = dot(normalize(vec4(0,0,1,1)), normalize(lightVec));
    // Avoid negative lighting values
    diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);

    float ambientTerm = 0.9;

    float lightIntensity = diffuseTerm + ambientTerm;   //Add a small float value to the color multiplier
                                                        //to simulate ambient lighting. This ensures that faces that are not
                                                        //lit by our point light are not completely black.

    // Compute final shaded color
    vec4 dirt = vec4(127.0 / 255.0, 102.0 / 255.0, 75.0 / 255.0, 1.0);
    vec4 grass = vec4(113.0 / 255.0, 110.0 / 255.0, 62.0 / 255.0, 1.0);
    //vec4(mix(vec3(244.0 / 255.0, 66.0 / 255.0, 146.0 / 255.0) * 0.5 * (fs_Sine*0.15) + 0.1, fog_color, t), 1.0);
    if (fs_Height < 0.3) {
        out_Col = mix(grass, vec4(fog_color, 1.0), t) * lightIntensity;
    } else { 
        out_Col = mix(dirt, vec4(fog_color, 1.0), t) * lightIntensity;
    }
    //out_Col = vec4(vec3(fs_Height), 1.0) * lightIntensity;
}