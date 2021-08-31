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
    
    r=M+M*sin(i);
    g=M+M*sin(i*3.);
    b=M+M*sin(i*7.);
    
    return vec3(r,g,b);
}

void main(){
    vec2 position=gl_FragCoord.xy/u_resolution;
    
    float opacity=1.;
    
    vec2 center=vec2(.5);
    float dist=distance(center,position);
    
    float box=floor(position.x*4.)*floor(position.x*16.)+floor(position.y*4.)*floor(position.x*8.);
    
    float boxN=mod(box,12.);
    if(boxN==0.)opacity=floor(sin(position.x*10.))+1.;
    else if(boxN==1.)opacity=floor(sin(position.y*20.))+1.;
    else if(boxN==2.)opacity=floor(sin(position.x*40.))+1.;
    else if(boxN==3.)opacity=floor(sin(position.y*60.))+1.;
    else if(boxN==4.)opacity=floor(sin(position.x*80.))+1.;
    else if(boxN==5.)opacity=floor(sin(position.y*100.))+1.;
    else if(boxN==5.)opacity=floor(sin(position.x*120.))+1.;
    
    float value=floor(position.x*4.)+floor(position.y*4.)*4.;
    
    vec3 tone=getColor(value);
    tone=vec3(1.);
    
    opacity=1.-opacity;
    vec3 color=tone*opacity;
    
    gl_FragColor=vec4(color,1.);
}