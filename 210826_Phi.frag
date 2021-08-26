#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

#define TWO_PI 6.28318530718;
#define PI 3.14159265359;
const float PA=2.39996322972865332;

const int CHORDS=35;

vec3 getColor(float i){
    float r,g,b;
    
    float A=1.;// Amplitude
    float t=u_time/3.;// Time
    float M=A/2.;// Center point
    float P=TWO_PI;// Period
    
    float monochrome=M+M*sin(3.*i);
    
    r=monochrome;
    g=monochrome;
    b=monochrome;
    
    return vec3(r,g,b);
}

float chord(vec2 position,vec2 center,float radius,float notes){
    float distance=distance(position,center);
    if(distance>radius)return 0.;
    return floor(1.+notes*distance/radius);
}

void main(){
    vec2 position=gl_FragCoord.xy/u_resolution;
    
    vec2 p[CHORDS];
    
    float value=0.;
    vec2 center=vec2(.5);
    float dist=distance(position,center);
    
    for(int i=0;i<CHORDS;i++){
        
        float n=float(i);
        
        float radius=.02*float(n);
        float angle=PA*float(n);
        float x=.5+radius*sin(angle);
        float y=.5+radius*cos(angle);
        
        vec2 p=vec2(x,y);
        
        float scale=pow(float(n),.7)*.021;
        float rep=1.+dist*5.;
        value+=chord(position,p,scale,rep);
    }
    
    vec3 color=getColor(value);
    
    gl_FragColor=vec4(color,1.);
}