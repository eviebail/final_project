#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor;

out vec4 out_Col;

void main()
{
    vec4 lightVec = vec4(-11.0,-13.0,10.0,1.0);
    vec4 lightVec2 = vec4(11.0,13.0,-10.0,1.0);
    vec4 lightColor = vec4(255.0 / 255.0,212.0 / 255.0,166.0 / 255.0, 1.0);
    vec4 lightColor2 = vec4(0.7 * 244.0 / 255.0,0.7 * 217.0 / 255.0,0.7 * 254.0 / 255.0, 1.0);

    // Calculate the diffuse term for Lambert shading
    float diffuseTerm = dot(normalize(fs_Nor), normalize(lightVec));
    float diffuseTerm2 = dot(normalize(fs_Nor), normalize(lightVec2));
    // Avoid negative lighting values
    diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);
    diffuseTerm2 = clamp(diffuseTerm2, 0.0, 1.0);

    float ambientTerm = 0.4;

    float lightIntensity = diffuseTerm + ambientTerm;
    float lightIntensity2 = diffuseTerm2 + ambientTerm;   //Add a small float value to the color multiplier
                                                        //to simulate ambient lighting. This ensures that faces that are not
                                                        //lit by our point light are not completely black.

    // Compute final shaded color
    out_Col = fs_Col * (lightIntensity * lightColor);// + lightIntensity2 * lightColor2);
}
