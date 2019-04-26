#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor;
in vec3 fs_Type; //0 - Body, 1 - Begin, 2 - Middle, 3 - End, 4 - Eyes, 5 - Ears, 6 - Mouth

out vec4 out_Col;

vec3 diffuseLighting(vec4 diffuseColor) {
        //vec4 lightVec = vec4(-11.0,-13.0,10.0,1.0);
    //vec4 lightVec2 = vec4(11.0,13.0,-10.0,1.0);
    //vec4 lightColor = vec4(255.0 / 255.0,212.0 / 255.0,166.0 / 255.0, 1.0);
    vec4 lightColor2 = vec4(0.7 * 244.0 / 255.0,0.7 * 217.0 / 255.0,0.7 * 254.0 / 255.0, 1.0);

    // Material base color (before shading)
    //vec4 diffuseColor = fs_Col; //vec4(1.0, 0.0, 0.5, 1.0);//texture(u_Texture, fs_UV);

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

    return diffuseColor.rgb * lightIntensity * lightColor2.rgb;
}

vec3 blinnLighting(vec3 diffuseColor) {
    vec4 fs_LightVec = vec4(-15.0,-6.0,6.0,1.0);

    // Calculate the diffuse term for Lambert shading
    float diffuseTerm = dot(normalize(fs_Nor), normalize(fs_LightVec));
    // Avoid negative lighting values
    diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);

    float ambientTerm = 0.2;

    float lightIntensity = diffuseTerm + ambientTerm;

    //compute specular intensity formula
    vec4 H = (fs_LightVec + (vec4(vec3(0,0,1),1.f) - fs_Pos)) / 2.0;
    float blinnTerm = max(pow(dot(normalize(H), normalize(fs_Nor)), 50.f), 0.f);
    blinnTerm = clamp(blinnTerm,0.f,1.f);


    return vec3((diffuseColor.rgb * lightIntensity) + blinnTerm);
}

vec2 random3( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}

//Worley Implementation from Book of Shaders: https://thebookofshaders.com/12/
float worley (float c_size, float multiplier) {
  float cell_size = c_size;
  vec2 cell = (fs_Pos.xz + vec2(1.0, 5.0)) / cell_size;
  float noise = 0.f;
  
  //get the cell pixel position is in
  vec2 fract_pos = fract(cell);
  vec2 int_pos = floor(cell);

  float m_dist = 1.f;

  //compare pos to the randpoints in the neighboring cells and save the smallest dist
  for (int y= -1; y <= 1; y++) {
    for (int x= -1; x <= 1; x++) {
      // Neighbor place in the grid
      vec2 neighbor = vec2(float(x),float(y));
      vec2 randpt = random3(int_pos + neighbor);

      vec2 diff = neighbor + randpt - fract_pos;
      float dist = length(diff);
      float rough = 1.0;
      
      // Keep the closer distance
      if (dist < m_dist) {
        m_dist = dist;
        vec2 pt = (randpt + int_pos + neighbor) / cell_size;
        noise = m_dist*multiplier;
      }
    } 
  }
  return noise;
}

void main()
{
    vec3 shading = vec3(1.0, 0.0, 1.0);
    if (fs_Type.x == 0.0) {
        //float wor = worley(1.5, 3.0);
        shading = diffuseLighting(fs_Col);
        //shading *= wor;
    } else if (fs_Type.x == 1.0) {
        shading = diffuseLighting(fs_Col);
    } else if (fs_Type.x == 2.0) {
        shading = diffuseLighting(fs_Col);
    } else if (fs_Type.x == 3.0) {
        shading = diffuseLighting(fs_Col);
    }  else if (fs_Type.x == 4.0) {
        shading = blinnLighting(vec3(0.0));
    } else if (fs_Type.x == 5.0) {
        shading = diffuseLighting(vec4(254.0 / 255.0, 252.0 / 255.0, 240.0 / 255.0, 1.0));
    } else if (fs_Type.x == 6.0) {
        shading = diffuseLighting(vec4(254.0 / 255.0, 252.0 / 255.0, 240.0 / 255.0, 1.0));
    }

    out_Col = vec4(shading, 1.0);
    
}
