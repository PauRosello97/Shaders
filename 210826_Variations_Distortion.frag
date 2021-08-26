#ifdef GL_ES
precision mediump float;
#endif

const float PI=3.1415926535;
const float TWO_PI=PI*2.;

uniform vec2 u_resolution;
uniform float u_time;
const float u_hours=13.;
const float u_minutes=22.;
const float u_seconds=1.;

const int u_n_lines=8;

vec3 white=vec3(.98,.93,.92);
vec3 black=vec3(.08,.06,.07);
vec3 grey=vec3(.74,.74,.66);

float random(in vec2 st){return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);}
vec4 permute(vec4 x){return mod(((x*34.)+1.)*x,289.);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
vec3 fade(vec3 t){return t*t*t*(t*(t*6.-15.)+10.);}

float cnoise(vec3 P){
    vec3 Pi0=floor(P);// Integer part for indexing
    vec3 Pi1=Pi0+vec3(1.);// Integer part + 1
    Pi0=mod(Pi0,289.);
    Pi1=mod(Pi1,289.);
    vec3 Pf0=fract(P);// Fractional part for interpolation
    vec3 Pf1=Pf0-vec3(1.);// Fractional part - 1.0
    vec4 ix=vec4(Pi0.x,Pi1.x,Pi0.x,Pi1.x);
    vec4 iy=vec4(Pi0.yy,Pi1.yy);
    vec4 iz0=Pi0.zzzz;
    vec4 iz1=Pi1.zzzz;
    
    vec4 ixy=permute(permute(ix)+iy);
    vec4 ixy0=permute(ixy+iz0);
    vec4 ixy1=permute(ixy+iz1);
    
    vec4 gx0=ixy0/7.;
    vec4 gy0=fract(floor(gx0)/7.)-.5;
    gx0=fract(gx0);
    vec4 gz0=vec4(.5)-abs(gx0)-abs(gy0);
    vec4 sz0=step(gz0,vec4(0.));
    gx0-=sz0*(step(0.,gx0)-.5);
    gy0-=sz0*(step(0.,gy0)-.5);
    
    vec4 gx1=ixy1/7.;
    vec4 gy1=fract(floor(gx1)/7.)-.5;
    gx1=fract(gx1);
    vec4 gz1=vec4(.5)-abs(gx1)-abs(gy1);
    vec4 sz1=step(gz1,vec4(0.));
    gx1-=sz1*(step(0.,gx1)-.5);
    gy1-=sz1*(step(0.,gy1)-.5);
    
    vec3 g000=vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100=vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010=vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110=vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001=vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101=vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011=vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111=vec3(gx1.w,gy1.w,gz1.w);
    
    vec4 norm0=taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
    g000*=norm0.x;
    g010*=norm0.y;
    g100*=norm0.z;
    g110*=norm0.w;
    vec4 norm1=taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
    g001*=norm1.x;
    g011*=norm1.y;
    g101*=norm1.z;
    g111*=norm1.w;
    
    float n000=dot(g000,Pf0);
    float n100=dot(g100,vec3(Pf1.x,Pf0.yz));
    float n010=dot(g010,vec3(Pf0.x,Pf1.y,Pf0.z));
    float n110=dot(g110,vec3(Pf1.xy,Pf0.z));
    float n001=dot(g001,vec3(Pf0.xy,Pf1.z));
    float n101=dot(g101,vec3(Pf1.x,Pf0.y,Pf1.z));
    float n011=dot(g011,vec3(Pf0.x,Pf1.yz));
    float n111=dot(g111,Pf1);
    
    vec3 fade_xyz=fade(Pf0);
    vec4 n_z=mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.z);
    vec2 n_yz=mix(n_z.xy,n_z.zw,fade_xyz.y);
    float n_xyz=mix(n_yz.x,n_yz.y,fade_xyz.x);
    return(2.2*n_xyz)/2.+.5;
}

bool isInternalPolygon(vec2 position,vec2 center,float radius,float sides,float rotation){
    position-=center;
    float angle=atan(position.x,position.y);
    if(mod(sides,2.)!=0.)angle+=PI/sides;
    angle-=rotation/sides;
    float slice=PI*2./sides;
    float apothem=radius*cos(PI/sides);
    bool res=apothem>cos(floor(.5+angle/slice)*slice-angle)*length(position);
    return res;
}

bool isLine(vec2 p1,vec2 p2,vec2 uv,float thickness){
    
    float a=abs(distance(p1,uv));
    float b=abs(distance(p2,uv));
    float c=abs(distance(p1,p2));
    
    if(a>=c||b>=c)return false;
    float p=(a+b+c)*.5;
    float h=2./c*sqrt(p*(p-a)*(p-b)*(p-c));
    float res=mix(1.,0.,smoothstep(.5*thickness,1.5*thickness,h));
    return res==1.;
}

bool isPolygonStroke(vec2 position,vec2 center,float radius,float sides,float rotation){
    bool isPolygonStroke=false;
    float extra=0.;
    float thickness=.0035;
    if(mod(sides,2.)==0.)extra=PI/sides;
    for(int i=0;i<u_n_lines;i++){
        vec2 start=center+radius*vec2(sin(extra+rotation/sides+float(i)*TWO_PI/sides),cos(extra+rotation/sides+float(i)*TWO_PI/sides));
        vec2 end=center+radius*vec2(sin(extra+rotation/sides+float(i+1)*TWO_PI/sides),cos(extra+rotation/sides+float(i+1)*TWO_PI/sides));
        bool isLine=isLine(start,end,position,thickness);
        if(isLine)isPolygonStroke=true;
    }
    return isPolygonStroke;
}

bool isBubble(vec2 pointA,vec2 pointB,vec2 position,float spin,float thickness){
    if(spin==0.){
        if(pointA.x>=pointB.x&&position.y>(pointA.y+(position.x-pointA.x)*(pointB.y-pointA.y)/(pointB.x-pointA.x)))return false;
        if(pointA.x<pointB.x&&position.y<(pointA.y+(position.x-pointA.x)*(pointB.y-pointA.y)/(pointB.x-pointA.x)))return false;
    }
    if(spin==1.){
        if(pointA.x>=pointB.x&&position.y<(pointA.y+(position.x-pointA.x)*(pointB.y-pointA.y)/(pointB.x-pointA.x)))return false;
        if(pointA.x<pointB.x&&position.y>(pointA.y+(position.x-pointA.x)*(pointB.y-pointA.y)/(pointB.x-pointA.x)))return false;
    }
    
    vec2 c=(pointA+pointB)/2.;
    float radius=distance(pointA,pointB)/2.;
    bool isCircle=distance(position,c)<radius;
    bool isCircleStroke=distance(position,c)<radius-thickness;
    
    return!isCircleStroke&&isCircle;
}

bool isFullBubble(vec2 pointA,vec2 pointB,vec2 position,float spin,float thickness){
    
    vec2 c=(pointA+pointB)/2.;
    float radius=distance(pointA,pointB)/2.;
    bool isCircle=distance(position,c)<radius;
    bool isCircleStroke=distance(position,c)<radius-thickness;
    
    return!isCircleStroke&&isCircle;
}

bool isFullBubbles(vec2 position,vec2 center,float radius,float sides,float rotation,float thickness){
    bool isBubbles=false;
    float extra=0.;
    if(mod(sides,2.)==0.)extra=PI/sides;
    for(int i=0;i<u_n_lines;i++){
        if(float(i)<sides){
            vec2 start=center+radius*vec2(sin(extra+rotation/sides+float(i)*TWO_PI/sides),cos(extra+rotation/sides+float(i)*TWO_PI/sides));
            vec2 end=center+radius*vec2(sin(extra+rotation/sides+float(i+1)*TWO_PI/sides),cos(extra+rotation/sides+float(i+1)*TWO_PI/sides));
            bool isBubble=isFullBubble(start,end,position,mod(float(i),2.),thickness);
            if(isBubble)isBubbles=true;
        }
    }
    return isBubbles;
}

bool isBubbles(vec2 position,vec2 center,float radius,float sides,float rotation,float thickness){
    bool isBubbles=false;
    float extra=0.;
    if(mod(sides,2.)==0.)extra=PI/sides;
    for(int i=0;i<u_n_lines;i++){
        if(float(i)<sides-1.){
            vec2 start=center+radius*vec2(sin(extra+rotation/sides+float(i)*TWO_PI/sides),cos(extra+rotation/sides+float(i)*TWO_PI/sides));
            vec2 end=center+radius*vec2(sin(extra+rotation/sides+float(i+1)*TWO_PI/sides),cos(extra+rotation/sides+float(i+1)*TWO_PI/sides));
            bool isBubble=isBubble(start,end,position,mod(float(i),2.),thickness);
            if(isBubble)isBubbles=true;
        }
    }
    return isBubbles;
}

bool isBalls(vec2 position,vec2 center,float radius,float sides,float rotation,float thickness){
    bool isBalls=false;
    float extra=0.;
    if(mod(sides,2.)==0.)extra=PI/sides;
    for(int i=0;i<u_n_lines;i++){
        vec2 cBall=center+radius*vec2(sin(extra+rotation/sides+float(i)*TWO_PI/sides),cos(extra+rotation/sides+float(i)*TWO_PI/sides));
        bool isBall=distance(cBall,position)<.02;
        if(isBall)isBalls=true;
    }
    return isBalls;
}

bool isLines(vec2 position,vec2 center,float radius,float sides,float rotation,float thickness){
    bool isLines=false;
    float extra=0.;
    if(mod(sides,2.)==0.)extra=PI/sides;
    for(int i=0;i<u_n_lines;i++){
        vec2 start=center;
        vec2 end=center+radius*vec2(sin(extra+rotation/sides+float(i)*TWO_PI/sides),cos(extra+rotation/sides+float(i)*TWO_PI/sides));
        bool isLine=isLine(start,end,position,thickness);
        if(isLine)isLines=true;
    }
    return isLines;
}

float getSideLength(float radius,int sides){
    return radius*2.*sin(PI/float(sides));
}

float getRadius(float sideLength,int sides){
    return sideLength/(2.*sin(PI/float(sides)));
}

float getApothem(float radius,float sides){
    return radius*cos(PI/sides);
}

bool isShape(vec2 position,vec2 center,float radius,float sides,float rotation,int mode){
    float apothem=getApothem(radius,sides);
    
    if(mode==1)return isInternalPolygon(position,center,radius,sides,rotation);
    if(mode==2){
        return distance(position,center)<radius;
    }
    if(mode==4){
        bool isCircleStroke=distance(position,center)<radius-.3/sides;
        bool isCircle=distance(position,center)<radius;
        return!isCircleStroke&&isCircle;
    }
    if(mode==3||mode==5)return distance(position,center)<apothem;;
    if(mode==6){
        float thickness=.0025;
        if(u_resolution.x<=300.)thickness=.004;
        bool isLines=isLines(position,center,radius,sides,rotation,thickness);
        return isLines;
    }
    if(mode==7){
        bool isPolygonStroke=isPolygonStroke(position,center,radius,sides,rotation);
        
        float thickness=.0015;
        if(u_resolution.x<=500.)thickness=.0025;
        if(u_resolution.x<=300.)thickness=.0040;
        
        bool isFullBubbles=isFullBubbles(position,center,radius,sides,rotation,thickness);
        return isPolygonStroke||isFullBubbles;
    }
    if(mode==8){
        bool isPolygonStroke=isPolygonStroke(position,center,radius,sides,rotation);
        return isPolygonStroke;
    }
    if(mode==9){
        float thickness=.003;
        if(u_resolution.x<=300.)thickness=.006;
        return isBubbles(position,center,radius,sides,rotation,thickness);
    }
    if(mode==10)return isBalls(position,center,radius,sides,rotation,.0015);
    if(mode==11){
        float thickness=.0025;
        if(u_resolution.x<500.)thickness=.0045;
        bool isBalls=isBalls(position,center,radius,sides,rotation,.0015);
        bool isLines=isLines(position,center,radius,sides,rotation,thickness);
        return isBalls||isLines;
    }
    if(mode==12){
        bool isBalls=isBalls(position,center,radius,sides,rotation,.0015);
        bool isCircleBorder=distance(position,center)<radius-.03;
        return isBalls||isCircleBorder;
    }
    if(mode==13){
        bool isBalls=isBalls(position,center,radius,sides,rotation,.0015);
        bool isCircle=distance(position,center)<radius;
        float thickness=.003;
        if(u_resolution.x<400.)thickness=.004;
        bool isCircleThinBorder=distance(position,center)<radius-thickness;
        return isBalls||(isCircle&&!isCircleThinBorder);
    }
}

vec3 getColor(vec2 center,vec2 position,float sides,float t){
    float distortionDetail=.5;
    float distortionX=cnoise(vec3(position*distortionDetail,t*.5))-.5;
    float distortionY=cnoise(vec3(position*distortionDetail,t*.5))-.4;
    
    float distortionGain=.2;
    position.x+=distortionX*distortionGain;
    position.y+=distortionY*distortionGain;
    
    float dist=distance(center,position);
    float grain=.005;
    dist+=random(position)*grain;
    
    float i=dist*9.;
    
    float rFreq=.5+mod(7.*(u_hours+u_minutes),60.)/60.;//[.5-1.5]
    float gFreq=.5+mod(11.*(u_minutes+u_seconds),60.)/60.;//[.5-1.5]
    float bFreq=.5+mod(13.*(u_seconds+u_hours),60.)/60.;//[.5-1.5]
    
    float rStart=TWO_PI*u_hours/24.;//R-Channel initial value
    float gStart=TWO_PI*u_minutes/60.;//G-Channel initial value
    float bStart=TWO_PI*u_seconds/60.;//B-Channel initial value
    
    float u_sidesK=2.+mod(u_hours*10.+u_seconds+u_minutes,6.);
    
    float rAmplitude=.3+mod((u_hours+u_minutes)/7.,.2);
    float gAmplitude=.3+mod((u_minutes+u_seconds)/11.,.2);
    float bAmplitude=.3+mod((u_seconds+u_hours)/13.,.2);
    
    float r=.5+rAmplitude*sin(rFreq*(i+rStart)+sides*u_sidesK);
    float g=.5+gAmplitude*sin(gFreq*(i+gStart)+sides*u_sidesK);
    float b=.5+bAmplitude*sin(bFreq*(i+bStart)+sides*u_sidesK);
    
    vec3 color=vec3(r,g,b);
    
    return color;
}

int getMode(){
    float x=mod(u_seconds*11.+u_minutes*13.+u_hours*17.,60.);
    
    if(x<4.)return 2;
    if(x<12.)return 4;
    if(x<16.)return 3;
    if(x<18.)return 5;
    if(x<23.)return 12;
    if(x<26.)return 13;
    if(x<31.)return 10;
    if(x<36.)return 11;
    if(x<40.)return 6;
    if(x<44.)return 8;
    if(x<54.)return 1;
    if(x<57.)return 7;
    return 9;
}

int getOverlap(){
    if(mod(float(u_seconds),2.)==0.)return 0;
    return 1;
}

int getBackground(){
    if(u_hours>=8.&&u_hours<20.)return 1;
    return 0;
}

float getInitialTime(){
    return float(u_hours)+float(u_minutes)+float(u_seconds);
}

float getVelocity(){
    float x=mod(u_hours+u_minutes+u_seconds,9.)/9.;
    return.533333*pow(x-.5,4.)+2.93333*pow(x-.5,3.)+.4;
}

float translationRadiusA,translationRadiusB,translationRadiusC,translationRadiusD,translationRadiusE,translationRadiusF;

void main(){
    vec2 position=gl_FragCoord.xy/u_resolution;
    
    int mode=11;
    int overlap=getOverlap();
    int background=getBackground();
    float initialTime=getInitialTime();
    float velocity=getVelocity();
    
    float distortionDetail=5.5;
    float distortionX=cnoise(vec3(position*distortionDetail,0.))-.5;
    float distortionY=cnoise(vec3(position*distortionDetail,0.))-.4;
    
    float distortionGain=1.2;
    position.x+=distortionX*distortionGain;
    position.y+=distortionY*distortionGain;
    
    float t=initialTime+u_time*velocity;
    
    vec3 color=background==1?white:black;
    
    float radiusA=.4;
    float side=getSideLength(radiusA,8);
    float radiusB=getRadius(side,7);
    float radiusC=getRadius(side,6);
    float radiusD=getRadius(side,5);
    float radiusE=getRadius(side,4);
    float radiusF=getRadius(side,3);
    
    float apothemA=getApothem(radiusA,8.);
    float apothemB=getApothem(radiusB,7.);
    float apothemC=getApothem(radiusC,6.);
    float apothemD=getApothem(radiusD,5.);
    float apothemE=getApothem(radiusE,4.);
    float apothemF=getApothem(radiusF,3.);
    
    float h=u_hours/24.;
    float m=u_minutes/60.;
    float s=u_seconds/60.;
    
    float rotationA=0.;
    float rotationB=t*(h>m?1.:-1.)*(h+.1);
    float rotationC=t*(m>s?1.:-1.)*(m+.1);
    float rotationD=t*(h*2.>m+s?1.:-1.)*(s+.1);
    float rotationE=t*(m*2.>s+h?1.:-1.)*((h+m)/2.+.1);
    float rotationF=t*(s*2.>m+h?1.:-1.)*((m+s)/2.+.1);
    
    float translationA=0.;
    float translationB=PI-rotationB;
    float translationC=PI-rotationC+rotationB;
    float translationD=PI-rotationD+rotationC;
    float translationE=PI-rotationE+rotationD;
    float translationF=PI-rotationF+rotationE;
    
    if(mode==3){
        translationRadiusA=0.;
        translationRadiusB=(apothemA-apothemB);
        translationRadiusC=(apothemB-apothemC);
        translationRadiusD=(apothemC-apothemD);
        translationRadiusE=(apothemD-apothemE);
        translationRadiusF=(apothemE-apothemF);
    }
    else if(mode==1||mode==2||mode==4||mode==5||mode==6||mode==7||mode==8||mode==9||mode==10||mode==11||mode==12||mode==13){
        translationRadiusA=0.;
        translationRadiusB=(radiusA-radiusB);
        translationRadiusC=(radiusB-radiusC);
        translationRadiusD=(radiusC-radiusD);
        translationRadiusE=(radiusD-radiusE);
        translationRadiusF=(radiusE-radiusF);
    }
    
    vec2 centerA=vec2(.5,.5);
    vec2 centerB=centerA+translationRadiusB*vec2(sin(translationB),cos(translationB));
    vec2 centerC=centerB+translationRadiusC*vec2(sin(translationC),cos(translationC));
    vec2 centerD=centerC+translationRadiusD*vec2(sin(translationD),cos(translationD));
    vec2 centerE=centerD+translationRadiusE*vec2(sin(translationE),cos(translationE));
    vec2 centerF=centerE+translationRadiusF*vec2(sin(translationF),cos(translationF));
    
    bool isA=isShape(position,centerA,radiusA,8.,rotationA,mode);
    bool isB=isShape(position,centerB,radiusB,7.,rotationB,mode);
    bool isC=isShape(position,centerC,radiusC,6.,rotationC,mode);
    bool isD=isShape(position,centerD,radiusD,5.,rotationD,mode);
    bool isE=isShape(position,centerE,radiusE,4.,rotationE,mode);
    bool isF=isShape(position,centerF,radiusF,3.,rotationF,mode);
    
    vec3 colorA=getColor(centerA,position,8.,t);
    vec3 colorB=getColor(centerB,position,7.,t);
    vec3 colorC=getColor(centerC,position,6.,t);
    vec3 colorD=getColor(centerD,position,5.,t);
    vec3 colorE=getColor(centerE,position,4.,t);
    vec3 colorF=getColor(centerF,position,3.,t);
    
    if(isA)color=colorA;
    if(isB)color=colorB;
    if(isC)color=colorC;
    if(isD)color=colorD;
    if(isE)color=colorE;
    if(isF)color=colorF;
    
    int count=0;
    if(isA)count++;
    if(isB)count++;
    if(isC)count++;
    if(isD)count++;
    if(isE)count++;
    if(isF)count++;
    
    if(count==0&&mode==8){
        float thickness=.002;
        if(u_resolution.x<400.)thickness=.003;
        if(u_resolution.x<300.)thickness=.004;
        bool linesA=isLines(position,centerA,radiusA,8.,rotationA,thickness);
        bool linesB=isLines(position,centerB,radiusB,7.,rotationB,thickness);
        bool linesC=isLines(position,centerC,radiusC,6.,rotationC,thickness);
        bool linesD=isLines(position,centerD,radiusD,5.,rotationD,thickness);
        bool linesE=isLines(position,centerE,radiusE,4.,rotationE,thickness);
        bool linesF=isLines(position,centerF,radiusF,3.,rotationF,thickness);
        
        if(linesA)color=grey;
        if(linesB)color=grey;
        if(linesC)color=grey;
        if(linesD)color=grey;
        if(linesE)color=grey;
        if(linesF)color=grey;
    }
    
    if((mode==4)&&count>1){
        if(overlap==0)color=black;
        if(overlap==1)color=white;
    }
    
    float noise=random(position*10.+vec2(initialTime));
    
    gl_FragColor=vec4(color,1.-noise*.07);
}