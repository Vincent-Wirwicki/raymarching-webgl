// details here => https://iquilezles.org/articles/menger/

export const basicRayFragment = /* glsl */ `
     
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

    float sdCross2d( in vec3 p ){
        // vec2 sd = mapRange(vec2(0.8),vec2(0.8),vec2(1.2),3.);
        float da = sdBox2d(p.xy,vec2(1.));
        float db = sdBox2d(p.yz,vec2(1.));
        float dc = sdBox2d(p.zx,vec2(1.));
        return min(da,min(db,dc)) *3.;
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
    // VEC3 NOISE TO RANDOMIZE POSITION
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
    // GLSL 3D ROTATION
    //--------------------------------------------------  
    mat4 rotation3d(vec3 axis, float angle) {
        axis = normalize(axis);
        float s = sin(angle);
        float c = cos(angle);
        float oc = 1.0 - c;

        return mat4(
          oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
          oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
          oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
          0.0,                                0.0,                                0.0,                                1.0
        );
    }

    vec3 rotate(vec3 v, vec3 axis, float angle) {
      mat4 m = rotation3d(axis, angle);
      return (m * vec4(v, 1.0)).xyz;
    }

    mat2 rotate2d(float a) {
        float s = sin(a);
        float c = cos(a);
        return mat2(c, -s, s, c);
    }

    //--------------------------------------------------

    //--------------------------------------------------
    // RAYMARCH SCENE - RENDER LOGIC
    //--------------------------------------------------  
    float scene(vec3 p){
        vec3 q  = p;
        float a = 3.;

        float displacement = sin(a*p.y) * cos(a*p.x) * sin(a*p.y) *0.25 * sin(uTime);
        float noize = noise(p.xyx  + sin(uTime));
        vec3 pBox =p-vec3(0.,0.,1.) + displacement ;
        vec3 pSphere = p-vec3(0.,abs(sin(uTime)),1.) + noize  ;
        
        //mirror
        q.xy = abs(q.xy);
        q.xy -=2. +sin(uTime);

        //rotate
        q.yz *= rotate2d(q.x + (uTime));
        pBox.yx *= rotate2d(pBox.x *0.5 + sin(uTime));

        float s = sdSphere(pSphere,1.);
        float b = sdBox(pBox ,vec3(.5));
        float sb = smoothmin(s,b,0.8);

        // float s = sdSphere(pSphere,1.);
        // float b = sdBox(pBox ,vec3(.5));
        // float sb = smoothmin(s,b,0.8);

        
        float d = sdBox(q, vec3(.5)) ;
        float d1 = sdBox(q - vec3(cos(uTime), sin(uTime),0.) , vec3(0.4));
        float d2 = sdSphere(q - vec3(cos(uTime),0.,0.),  0.4);
        
        float dd1 = smoothmin(d,d1,0.8);
        float dd2 = smoothmin(dd1, d2,0.2);
        
        d = smoothmin(dd2, sb,0.5);
        return d;
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
            float dS = scene(p);            
            dO += dS;
            // if ray hit nothing || if ray is close enough to hit
            if(dO > MAX_DIST || abs(dS) < SURF_DIST) break;
              
        }
        return dO;
    }
    //--------------------------------------------------  
  
    //--------------------------------------------------
    // NORMALIZE POSITIONS
    //--------------------------------------------------  
    vec3 getNormal(vec3 p) {
        vec2 e = vec2(.01, 0);
        vec3 n = scene(p) - vec3(
            scene(p-e.xyy),
            scene(p-e.yxy),
            scene(p-e.yyx));
        return normalize(n);
    }
    //--------------------------------------------------  

    //--------------------------------------------------
    // CALC SOFT SHADOWS 
    // https://iquilezles.org/articles/rmshadows/
    //--------------------------------------------------  
    float softshadow( in vec3 ro, in vec3 rd, float mint, float maxt, float k ){
        float res = 1.0;
        float t = mint;
        for( int i=0; i<256 && t<maxt; i++ )
        {
            float h = scene(ro + rd*t);
            if( h<0.001 )
                return 0.0;
            res = min( res, k*h/t );
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
        // ---------------------------------------------

        // ray origin = camera position ----------------
        vec3 rayOrigin = vec3(0.,0.,4.);
        vec3 rayDir = normalize(vec3(newUv,-.5));
        // ---------------------------------------------

        // calc dist / dir from the origin -------------
        float dist = raymarch(rayOrigin, rayDir);
        vec3 p = rayOrigin + rayDir * dist;
        // ---------------------------------------------


        // light position-------------------------------
        vec3 lightPos = vec3(0.,0.,10.);
        // ---------------------------------------------

        
        vec3 color = vec3(0., 0., 0.);

        //if ray hit-----------------------------------
        if(dist < MAX_DIST){ 
            vec3 n = getNormal(p);
            vec3 lightDir = normalize(lightPos - p);

            float diffuse = max(dot(n, lightDir),0.);
            
            float shadows = softshadow(p, lightDir, 0.1, .5,64.);
            vec3 c = palette( shadows * diffuse, vec3(.1,0.,0.), vec3(0.1,0.1,0.5), vec3(0.5,0.1,0.1), vec3(0.));

            color = c * shadows * diffuse;
            color = pow(c, vec3(0.45));

        };
        // ---------------------------------------------


        gl_FragColor = vec4(color,1.);

    }
`;
