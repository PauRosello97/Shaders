#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

#define TWO_PI 6.28318530718;
#define PI 3.14159265359;
#define PA 2.39996322972865332;

const int CHORDS=20;

vec3 getColor(float i){
    float r,g,b;
    
    float A=1.;// Amplitude
    float t=u_time/3.;// Time
    float M=A/2.;// Center point
    float P=TWO_PI;// Period
    
    r=M+M*sin(2.*i);
    g=M+M*sin(2.*i);
    b=M+M*sin(2.*i);
    
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
    
    for(int i=0;i<CHORDS;i++){
        float radius=.02*float(i);
        float x=.5+radius*sin(float(i));
        
        float y=.5+radius*cos(float(i));
        
        p[i]=vec2(x,y);
    }
    
    float value=0.;
    vec2 center=vec2(.5);
    float dist=distance(position,center);
    float scale=dist*1.0000001;
    
    for(int i=0;i<CHORDS;i++){
        value+=chord(position,p[i],scale,1.);
    }
    
    vec3 color=getColor(value);
    
    gl_FragColor=vec4(color,1.);
}