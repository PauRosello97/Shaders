#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

#define TWO_PI 6.28318530718;
#define PI 3.14159265359;

vec3 getColor(float i){
    float r,g,b;
    
    float A=1.;// Amplitude
    float t=u_time/3.;// Time
    float M=A/2.;// Center point
    float P=TWO_PI;// Period
    
    float monochrome=sin(i);
    
    if(monochrome!=.5);
    
    monochrome=0.;
    
    r=monochrome;
    g=monochrome;
    b=monochrome;
    
    return vec3(r,g,b);
}

void main(){
    vec2 position=gl_FragCoord.xy/u_resolution;
    
    vec2 center=vec2(.5);
    float dist=distance(center,position);
    
    float rep=70000000000000000000.;
    
    float value=sin(dist*rep);
    value*=sin(position.x*rep);
    
    vec3 color=vec3(value);
    
    gl_FragColor=vec4(color,1.);
}