// details here => https://iquilezles.org/articles/menger/

export const infinitTunnelsFragment = /* glsl */ `
     
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

    vec3 repeat(vec3 p, float c) {
        return mod(p,c) - 0.5 * c; // (0.5 *c centers the tiling around the origin)
    }

    // pseudo rando number between 0 and 1
    float hash31(vec3 p){
        p = fract(p*vec3(123.324, 213.354,356.125));
        p+=dot(p,p+231.123);
        return fract(p.x*p.y*p.z);
    }
    //--------------------------------------------------
    
    mat2 rotation(float theta) {
        return mat2(cos(theta), -sin(theta), sin(theta), cos(theta));
    }
    //--------------------------------------------------
    // RAYMARCH SCENE - RENDER LOGIC
    //--------------------------------------------------  
    float sdScene(vec3 p){
        p.xz *= rotation(p.y * 0.6);
        p.z -=  mod(uTime, 3.);
        // p = abs(p);
        p = repeat(p, 3.);
        // float r = mix(1.8,2.,sin(uTime));
        float s = sdSphere(p, 2.);
        return s;
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
    // CALC COLOR PALETTE 
    // https://iquilezles.org/articles/palettes/
    //-------------------------------------------------- 
    vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ){
        return a + b*cos( 6.28318*(c*t+d) );
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
        // newUv = floor(vUv *10.)/10.;
        // ---------------------------------------------
        float reset = mod(uTime, 3.);
        // ray origin = camera position ----------------
        vec3 rayOrigin = vec3(0.,0.,0.);
        vec3 rayDir = normalize(vec3(newUv,-.5));
        // rayDir.xz *= rotation(rayOrigin.x * sin(uTime));
        // ---------------------------------------------

        // calc dist / dir from the origin -------------
        float dist = raymarch(rayOrigin, rayDir);
        vec3 p = rayOrigin + rayDir * dist ;

        // ---------------------------------------------

        // light position-------------------------------
        vec3 lightPos = vec3(0, 0, 5);
        // --------------------------------------------- 
        
        vec3 color = vec3(0.);

        //if ray hit-----------------------------------
        if(dist < MAX_DIST){ 
            vec3 nPos = getNormal(p);
            vec3 lightDir = normalize(lightPos - rayDir);
            // lightDir.z *= (sin(uTime) *0.5) -0.5;
            // color -= nPos;
            // color = vec3(1.); 
            // light colors

            float diffuse = max(dot(nPos, lightDir),0.);
            color*= diffuse  ; // light diffuse

            // float k = 32.; 
            // float shadows = softShadow(p, lightDir, 0.01, k); 
            // color *= shadows;0.8, 0.5, 0.4		0.2, 0.4, 0.2	2.0, 1.0, 1.0	0.00, 0.25, 0.25
            vec3 c = palette(diffuse , vec3(0.75),vec3(0.45),vec3(.75),vec3(0.5, 0.5, 0.5));
            color += c;

            // to limit light -------------------------
            float falloff = min(1.,1./length(p.xz));
            color *= falloff;           
            
            float distToLight = length(lightPos - p);
            color /= distToLight * distToLight;
            
            float lightStr = 5.;
            color *=lightStr;
            // ----------------------------------------
        };
        // ---------------------------------------------
        // float lightCenter = length(newUv);
        // color += 1.-lightCenter;
        //gamma correction------------------------------
        color = pow(color, vec3(0.65));
        //----------------------------------------------
        
        gl_FragColor = vec4(color,1.);
    }
`;

// old stuff i tried
// p.yz *=rotation(reset);
// vec3 id = floor(p);
// float n = hash31(id);
// p.yz *=rotation(reset*0.5);
// p.yx *= rotation(cos(uTime*.5 ) -.5);
// p.z -= mod(uTime/30.,3.);
// p.x +=cos(uTime);

// p.yx *= rotation(sin(uTime*.5) -0.5);
// rayOrigin.z -= reset;
// vec3 camPos = rayOrigin;
// vec3 camDir =normalize(vec3(0.,0.,1.));
// vec3 camUp = vec3(sin(uTime),0.,0.);
// vec3 camSide = cross(camDir, camUp);
// rayOrigin.z -= sin(uTime*4.);
// vec3 rayDir = normalize(vec3(camSide *newUv.x + camUp* newUv.y + camDir));
// rayDir.z *=reset *0.5 - 0.5;
// rayDir.xy *= rotation(sin(uTime*0.5) -.5);
// rayDir.x +=cos(uTime*0.5);(sin(uTime*.5) *0.5) -0.5
// vec3 qmod = mod(p,c ) -0.5*c;
// float b =repeatedBox(p, vec3(1.),.075,.025);
// float b = sdBox(qmod, vec3(1.));

// float limit = -sdSphere(p, 50.);
// b=min(b, grid);
// float s = sdSphere(q, 0.5);
// float r = min(grid, -b);
// vec3 q = p;
// vec3 c = vec3(15.);
// vec3 dim = vec3(0.3,0.25,0.2);

// float grid = abs(p.y) -0.01;
// vec2 id = floor(q.xz);

// q.xz = fract(q.xz)-0.5;

// // vec3 qmod = mod(p,c ) -0.5*c;

// float n = hash21(id);
// // if(n<0.5) dim.y += abs(n) * 0.1;

// // float s = q.x > q.z ? .5:-.5;
// // q.xz += 0.5 * s;

// float b = sdBox(q, vec3(0.49));

// float render = max(grid, -sdBox(q, vec3(0.49)));
// render = min(-b, render);

// // r=min(b, s);
// // r = repeat(p, r);
