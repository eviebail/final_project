#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor;

out vec4 out_Col;

void main()
{
    //vec4 lightVec = vec4(-11.0,-13.0,10.0,1.0);
    //vec4 lightVec2 = vec4(11.0,13.0,-10.0,1.0);
    //vec4 lightColor = vec4(255.0 / 255.0,212.0 / 255.0,166.0 / 255.0, 1.0);
    vec4 lightColor2 = vec4(0.7 * 244.0 / 255.0,0.7 * 217.0 / 255.0,0.7 * 254.0 / 255.0, 1.0);

    // Material base color (before shading)
    vec4 diffuseColor = fs_Col; //vec4(1.0, 0.0, 0.5, 1.0);//texture(u_Texture, fs_UV);

    vec3 lightColor = vec3(255.0 / 255.0,212.0 / 255.0,166.0 / 255.0);
    vec3 darkColor = vec3(0.7 * 244.0 / 255.0,0.7 * 217.0 / 255.0,0.7 * 254.0 / 255.0);

    //diffuseColor = vec4(mix(lightColor, darkColor, pow(fs_Pos.y, 1.0)), 1.0);

    vec4 fs_LightVec = vec4(15.0,6.0,-6.0,1.0);

    vec4 fs_LightVec2 = vec4(-15.0,-6.0,6.0,1.0);

    //vec4 lightColor2 = vec4(171.0 * 0.5 / 255.0, 156.0 * 0.5 / 255.0, 216.0 * 0.5/ 255.0, 1.0); 

    if (dot(normalize(fs_Nor), normalize(fs_LightVec)) < 0.3) {
        float t = dot(normalize(fs_Nor), normalize(fs_LightVec));
        lightColor2 = vec4(darkColor, 1.0); // mix(darkColor, darkColor * fs_Col.rgb, 1.0 - t / 0.1) 87, 57, 178
    }

    if (dot(normalize(fs_Nor), normalize(fs_LightVec)) < 0.0) {
        lightColor2 = vec4(darkColor * fs_Col.rgb, 1.0); //87, 57, 178
    }
    // Calculate the diffuse term for Lambert shading
    float diffuseTerm = dot(normalize(fs_Nor), normalize(fs_LightVec));
    diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);

    float ambientTerm = 0.2;

    float lightIntensity = diffuseTerm + ambientTerm;

    diffuseTerm += 0.9 * dot(normalize(fs_Nor), normalize(fs_LightVec2));
    diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);

    lightIntensity += diffuseTerm + ambientTerm;

    out_Col = vec4(diffuseColor.rgb * lightIntensity * lightColor2.rgb, 1.0);
    
    }
