// code from https://www.youtube.com/watch?v=PGtv-dBi2wE

export const basicDisplaceFragment = /* glsl */ `
     
    uniform float uTime;
    uniform vec2 uResolution;
    varying vec2 vUv;

    #define MAX_STEPS 64
    #define MAX_DIST 100.0
    #define SURF_DIST 0.01
    #define M_PI 3.14159265

    //--------------------------------------------------
    // SDF SHAPES 
    // MORE: https://iquilezles.org/articles/distfunctions/
    //--------------------------------------------------   
    float sdSphere(vec3 p, float r){
        return length(p) - r;
    }
    
    float sdBox( vec3 p, vec3 b ){
        vec3 q = abs(p) - b;
        return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
    }
    //--------------------------------------------------


    //--------------------------------------------------
    // SMOOTH SDF INTERSECT
    //--------------------------------------------------  
    float smoothmin(float a, float b, float k) {
        float h = clamp(0.5 + 0.5 * (b-a)/k, 0.0, 1.0);
        return mix(b, a, h) - k * h * (1.0 - h);
    }
    //--------------------------------------------------
  
   //--------------------------------------------------
    // VEC3 NOISE TO PSEUDO RANDOMIZE POSITION
    //--------------------------------------------------  
    float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
    vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
    vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

    float noise(vec3 p){
        vec3 a = floor(p);
        vec3 d = p - a;
        d = d * d * (3.0 - 2.0 * d);

        vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
        vec4 k1 = perm(b.xyxy);
        vec4 k2 = perm(k1.xyxy + b.zzww);

        vec4 c = k2 + a.zzzz;
        vec4 k3 = perm(c);
        vec4 k4 = perm(c + 1.0);

        vec4 o1 = fract(k3 * (1.0 / 41.0));
        vec4 o2 = fract(k4 * (1.0 / 41.0));

        vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
        vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

        return o4.y * d.y + o4.x * (1.0 - d.y);
    }
    //--------------------------------------------------


    //--------------------------------------------------
    // RAYMARCH SCENE - RENDER LOGIC
    //-------------------------------------------------- 
    float sdScene(vec3 pos){
        // float d = sdSphere(pos-vec3(0.0, 0.0, 1.0), 3.0);
        // float time = sin(time) + cos(uTime);
        // float displacement = sin(5.0 * pos.x) * sin(5.0 * pos.y) * sin(5.0 * pos.z) * 1.5;
        float radius = 0.15;
        float noisy = noise(pos.zyy   + uTime *0.5);
        float noisy2 = noise(vec3(pos.yyx + uTime *0.25)) ;

        float sphere =  sdSphere(pos + vec3(1. -sin(noisy2 *1.75 )  ,1.- sin(noisy * 1.75), 0. ) + noisy, radius);

        float sphere2 = sdSphere(pos + vec3(cos(noisy *2.25), cos(2.25 * noisy2), 0. ), radius);

        float sphere3 = sdSphere(pos + vec3(sin(noisy2 * 2.), sin(noisy *2.) , 0.), radius); 

        float sphere4 = sdSphere(pos + vec3(1.-cos(noisy *2.5 ),1.- sin(noisy2 *2.5), 0.), radius);

        float render1 = smoothmin(sphere, sphere2 , 0.8);
        float render2 = smoothmin(sphere3, sphere4, 0.8);
        float render3 = smoothmin(render1, render2, 0.8);
        
        return render3;
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
    // RENDER
    //-------------------------------------------------- 
    void main() {
        // normalize plane cord ------------------------
        vec2 newUv = (gl_FragCoord.xy/uResolution.xy);
        newUv -= 0.5;
        newUv.x *= uResolution.x / uResolution.y;
        // ---------------------------------------------

        // ray origin = camera position ----------------
        vec3 rayOrigin = vec3(-0.5,-1.,2.);
        vec3 rayDir = normalize(vec3(newUv,-.5));
        // ---------------------------------------------

        // calc dist / dir from the origin -------------
        float dist = raymarch(rayOrigin, rayDir);
        vec3 p = rayOrigin + rayDir * dist;
        // ---------------------------------------------
        
        // light position-------------------------------
        vec3 lightPos = vec3( 10.,  sin(uTime*0.5) +10.,15.0);
        // ---------------------------------------------
        
        vec3 color = vec3(0., 0., 0.);
        
        //if ray hit-----------------------------------
        if(dist < MAX_DIST){ 
            vec3 nPos = getNormal(p);
            color +=nPos;
            float n = noise(nPos + uTime*.25);
            color += n;
            vec3 lightDir = normalize(lightPos - nPos);
            float diffuse = max(dot(nPos, lightDir),0.);
            color *= diffuse;
            // color += nPos;
            // color +=n;
            // color = vec3(nPos) *diffuse * n   ;
        };
        // ---------------------------------------------


        gl_FragColor = vec4(color,1.);

    }
`;
