#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

#define TWO_PI 6.28318530718;
#define PI 3.14159265359;

const int N_ROWS=4;
const int N_COLS=4;

vec3 getColor(float i,float centerDistance){
    float r,g,b;
    
    float A=1.;// Amplitude
    float t=u_time/3.;// Time
    float M=A/2.;// Center point
    float P=TWO_PI;// Period
    
    float mainWave=M+M*sin(i);
    
    r=mainWave+.2+centerDistance*.8;
    g=mainWave;
    b=mainWave+.4-centerDistance*.2;
    
    return vec3(r,g,b);
}

void main(){
    vec2 position=gl_FragCoord.xy/u_resolution;
    
    vec3 color=vec3(1.,0.,0.);
    
    gl_FragColor=vec4(color,1.);
}