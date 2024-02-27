// details here => https://iquilezles.org/articles/menger/

export const defaultFragment = /* glsl */ `
     
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
    //--------------------------------------------------

    //--------------------------------------------------
    // RAYMARCH SCENE - RENDER LOGIC
    //--------------------------------------------------  
    float sdScene(vec3 pos){
        
        float d = sdSphere(p, 1.);
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
    float softshadow( in vec3 ro, in vec3 rd, float mint, float maxt, float k ){
        float res = 1.0;
        float t = mint;
        for( int i=0; i<256 && t<maxt; i++ )
        {
            float h = sdScene(ro + rd*t);
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


    vec3 calcRayDist(vec3 ro, vec2 uv){
        vec3 rd = normalize(vec3(uv,-.5));
        float d = raymarch(ro, rd);
        vec3 p = ro + rd * d;
        return p;
    }

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
        vec3 rayOrigin = vec3(0.,0.,4.8);
        vec3 rayDir = normalize(vec3(newUv,-.5));
        // ---------------------------------------------

        // calc dist / dir from the origin -------------
        float dist = raymarch(rayOrigin, rayDir);
        vec3 p = rayOrigin + rayDir * dist;
        // ---------------------------------------------


        // light position-------------------------------
        vec3 lightPos = vec3(-1.);
        // ---------------------------------------------

        
        vec3 color = vec3(0., 0., 0.);

        //if ray hit-----------------------------------
        if(dist < MAX_DIST){ 
            vec3 n = getNormal(p);
            vec3 lightDir = normalize(lightPos - p);

            float diffuse = max(dot(n, lightDir),0.);
            
            float shadows = softshadow(p, lightDir, 0.1, .5,64.);

            vec3 c = palette( shadows * diffuse, vec3(0.), vec3(0.5), vec3(0.5), vec3(0.5));
            // color = pow(c, vec3(0.8));
            color = vec3(c)  * shadows * diffuse  ;
        };
        // ---------------------------------------------


        gl_FragColor = vec4(color,1.);

    }
`;

// vec4 map (vec3 p){
//     float d = sdBox(p, vec3(1.));
//     vec4 res = vec4(d,1.,1.,1.);
//     float scale = 1.;

//     for(int m = 0; m < 4; m++ ){
//         vec3 a = mod(p * scale , 2.) - 1.;
//         scale *=3.;
//         vec3 r = abs(1.0 - 3.0*abs(a));
//         float da = max(r.x,r.y);
//         float db = max(r.y,r.z);
//         float dc = max(r.z,r.x);
//         float c = (min(da,min(db,dc))-1.0)/
//         if( c>d ){
//           d = c;
//           res = vec4( d, min(res.y,0.2*da*db*dc), (1.0+float(m))/4.0, 0.0 );
//         }
//     }
//     return res;
// }

// float c = sdCross2d(pos*3.0)/3.0;

// for(int m=0; m<4; m++){
//     vec3 a = mod(pos * scale, 2.) - 1.;
//     scale *=3.;
//     vec3 r = 1. - 3.*abs(a);

//     float da = max(r.x,r.y);
//     float db = max(r.y,r.z);
//     float dc = max(r.z,r.x);
//     float cr = (min(da,min(db,dc))-1.0)/scale;

//     // float cr = sdCross(r) / scale;
//     d = max(cr,d );
// }

//     vec4 map( in vec3 p ){
//     float d = sdBox(p,vec3(1.0));
//     vec4 res = vec4( d, 1.0, 0.0, 0.0 );

//     float ani = smoothstep( -0.2, 0.2, -cos(0.5*iTime) );
// 	float off = 1.5*sin( 0.01*iTime );

//     float s = 1.0;
//     for( int m=0; m<4; m++ )
//     {
//         p = mix( p, ma*(p+off), ani );

//         vec3 a = mod( p*s, 2.0 )-1.0;
//         s *= 3.0;
//         vec3 r = abs(1.0 - 3.0*abs(a));
//         float da = max(r.x,r.y);
//         float db = max(r.y,r.z);
//         float dc = max(r.z,r.x);
//         float c = (min(da,min(db,dc))-1.0)/s;

//         if( c>d )
//         {
//           d = c;
//           res = vec4( d, min(res.y,0.2*da*db*dc), (1.0+float(m))/4.0, 0.0 );
//         }
//     }

//     return res;
// }

// vec4 intersect( in vec3 ro, in vec3 rd )
// {
//     vec2 bb = iBox( ro, rd, vec3(1.05) );
//     if( bb.y<bb.x ) return vec4(-1.0);

//     float tmin = bb.x;
//     float tmax = bb.y;

//     float t = tmin;
//     vec4 res = vec4(-1.0);
//     for( int i=0; i<64; i++ )
//     {
//         vec4 h = map(ro + rd*t);
// 		if( h.x<0.002 || t>tmax ) break;
//         res = vec4(t,h.yzw);
//         t += h.x;
//     }
// 	if( t>tmax ) res=vec4(-1.0);
//     return res;
// }
