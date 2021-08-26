#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

#define TWO_PI 6.28318530718;
#define PI 3.14159265359;

vec3 getColor(float i){
    float r,g,b;
    
    float A=1.;// Amplitude
    float t=u_time/3.;// Time
    float M=A/2.;// Center point
    float P=TWO_PI;// Period
    
    r=1.;
    g=0.;
    b=0.;
    
    return vec3(r,g,b);
}

void main(){
    vec2 position=gl_FragCoord.xy/u_resolution;
    
    float value=0.;
    
    vec3 color=getColor(value);
    
    gl_FragColor=vec4(color,1.);
}