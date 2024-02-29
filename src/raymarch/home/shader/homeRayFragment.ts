// details here => https://iquilezles.org/articles/menger/

export const homeRayFragment = /* glsl */ `
     
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
    // GLSL 3D ROTATION
    //--------------------------------------------------  

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

        float s = sdSphere(p-vec3(0.,sin(uTime),0.), 1.5);
        float b = sdBox(p - vec3(sin(uTime), 0.,0.), vec3(1.));
        float d = smoothmin(s, b,0.5);
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
            vec3 c = palette( diffuse, vec3(0.5), vec3(0.5), vec3(0.5), vec3(0.5));

            color = c  * diffuse;
           

        };
        // ---------------------------------------------

        color = pow(color, vec3(0.45));
        gl_FragColor = vec4(color,1.);

    }
`;
