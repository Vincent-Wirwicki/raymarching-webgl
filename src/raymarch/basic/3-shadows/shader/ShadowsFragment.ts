// details here => https://iquilezles.org/articles/menger/

export const shadowsRayFragment = /* glsl */ `
     
    uniform float uTime;
    uniform vec2 uResolution;
    varying vec2 vUv;

    #define MAX_STEPS 100
    #define MAX_DIST 100.0
    #define SURF_DIST 0.01
    #define M_PI 3.14159265
    #define inf 1e10
    


    //--------------------------------------------------
    // SDF 3D SHAPES 
    // https://iquilezles.org/articles/distfunctions/
    //--------------------------------------------------    
    float sdSphere(vec3 p, float r){
        return length(p) - r;
    }
    
    float sdBox( vec3 p, vec3 b ){
        vec3 q = abs(p) - b;
        return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
    }

    float sdOctahedron( vec3 p, float s){
      p = abs(p);
      return (p.x+p.y+p.z-s)*0.57735027;
    }

    float sdBox2d( in vec2 p, in vec2 b ){
        vec2 d = abs(p)-b;
        return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
    }

    float sdTorus( vec3 p, vec2 t ){
      vec2 q = vec2(length(p.xz)-t.x,p.y);
      return length(q)-t.y;
    }


    //--------------------------------------------------

    //--------------------------------------------------
    // GLSL 2D ROTATION
    //--------------------------------------------------  
vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, s, -s, c);
	return m * v;
}

mat2 rotate2D(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}
    //--------------------------------------------------

    //--------------------------------------------------
    // RAYMARCH SCENE - RENDER LOGIC
    //--------------------------------------------------  
    float sdScene(vec3 p){
        vec3 q = p;
        vec3 qr = p;
        
        float plane = q.y + sin(q.z *0.25) + sin(q.x*0.25);
        float s = sdSphere(p - vec3(cos(uTime),1.,sin(uTime)), 1.);

        // shadow on these shapes have some artefacts
        // float b = sdBox(p - vec3(-4.,sin(uTime + 2.),0.), vec3(1.,3.,1.));
        // float oct = sdOctahedron(p - vec3(0.,6.,0.), 1.);
        // // float r = min(plane, min(s,min(tr, oct) ));
        // float r = min(plane,min(s,min(b,oct)));
        float r = min(plane, s);

        return r;
    }
    //--------------------------------------------------

    //--------------------------------------------------
    // CALC RAYMARCH INTERSECTION
    // PARAM RO = RAY ORIGIN = CAMERA ORIGIN
    // PARAM RD = RAY DIRECTION
    //--------------------------------------------------   
    float raymarch(vec3 ro, vec3 rd){
        //dist from origin
        float dO = 0.;
        
        for(int i = 0; i < MAX_STEPS; i++) {
            //Ray position = Ray Origin + Ray Direction * Dist from origin
            vec3 p = ro + rd * dO;
            // dist in scene
            float dS = sdScene(p);            
            dO += dS;
            // if ray hit nothing || if ray is close enough to hit
            if(dO > MAX_DIST || dS < SURF_DIST) break;
              
        }
        return dO;
    }
    //--------------------------------------------------  
  
    //--------------------------------------------------
    // NORMALIZE POSITIONS
    //--------------------------------------------------  
    vec3 getNormal(vec3 p) {
        vec2 e = vec2(.01, 0);
        vec3 n = sdScene(p) - vec3(
            sdScene(p-e.xyy),
            sdScene(p-e.yxy),
            sdScene(p-e.yyx));
        return normalize(n);
    }
    //--------------------------------------------------  

    //--------------------------------------------------
    // CALC SOFT SHADOWS 
    // https://iquilezles.org/articles/rmshadows/
    //--------------------------------------------------  

    float softShadow(in vec3 ro, in vec3 rd, float mint, float k) {
        float res = 1.0;
        float t = mint;
        for(int i = 0; i < 64; i++) {
        	float h = sdScene(ro + rd * t);
            if (h < 0.001) { return 0.0; }
            res = min(res, k*h/t);
           	t += h;
        }
        return res;
    }
    //--------------------------------------------------


    //--------------------------------------------------
    // RENDER
    //-------------------------------------------------- 
    void main() {
        // normalize plane cord ------------------------
        vec2 newUv = (gl_FragCoord.xy/uResolution.xy);
        newUv -= 0.5;
        newUv.x *= uResolution.x / uResolution.y;
        // ---------------------------------------------

        // ray origin = camera position ----------------
        vec3 rayOrigin = vec3(-2,4,8);
        vec3 rayDir = normalize(vec3(newUv,-.5));
        // ---------------------------------------------

        // calc dist / dir from the origin -------------
        float dist = raymarch(rayOrigin, rayDir);
        vec3 p = rayOrigin + rayDir * dist;
        // ---------------------------------------------


        // light position-------------------------------
        vec3 lightPos = vec3(-2, 5, 2);
        lightPos.xz += vec2(cos(uTime), sin(uTime)) * 10.;

        // --------------------------------------------- 
        
        vec3 color = vec3(0.);

        //if ray hit-----------------------------------
        if(dist < MAX_DIST){ 
            vec3 nPos = getNormal(p);
            vec3 lightDir = normalize(lightPos - rayDir);
            
            float b = mix(0.5,0.95, sin(uTime*0.5));
            color = vec3(.1,0.5,b); // light colors

            float diffuse = max(dot(nPos, lightDir),0.);
            color*= diffuse; // light diffuse

            float k = 32.; 
            float shadows = softShadow(p, lightDir, 0.01, k); 
            color *= shadows;

            // to limit light -------------------------
            float falloff = min(1.,1./length(p.xz));
            color *= falloff;           
            
            float distToLight = length(lightPos - p);
            color /= distToLight * distToLight;
            
            float lightStr = 10.;
            color *=lightStr;
            // ----------------------------------------
        };
        // ---------------------------------------------

        //gamma correction------------------------------
        color = pow(color, vec3(0.4545));
        //----------------------------------------------
        gl_FragColor = vec4(color,1.);

    }
`;
// float bounceLight = 0.5-0.5*nPos.y;
// float back = max(dot(-nPos, lightDir),0.);

// color += .25*vec3(1,.8,.6) * 1.*(.5+back)*bounceLight; // indirect light
// color += .2*vec3(.3,.6,1); // sky light
// color += 1.5*color / (1.+color);
// color = mix(color, vec3(0.),1.- exp(maxDist * -maxDist * 0.02) );
