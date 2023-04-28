uniform vec2 uCenter;
uniform float uTime;

varying vec2 vUv;

float make_onde(float dist,float creationTime){
    float waveSize = 0.2;
    float customTimeDist=uTime/3.0;
    float customTimeFade=uTime/3.0;
    float waves = 3.0;
    float onde= mod(max(dist-customTimeDist,-waveSize*waves),waveSize)/waveSize;
    //float onde = mod(dist-customTimeDist,waveSize)/waveSize;
    float centered_onde=onde- 0.5;
    float result = 1.0-abs(centered_onde)*2.0;
    float calc = step(0.0,(customTimeDist - creationTime) - dist);
    float fade = max (1.0- (customTimeFade - creationTime),0.0);
    return calc*result*fade;
}

void main()
{
    float dist = distance(vUv,uCenter);
    float custom = make_onde(dist,0.0);
    vec3 color = vec3(vUv, 1.0) * custom;
    gl_FragColor = vec4(color,1.0);
}