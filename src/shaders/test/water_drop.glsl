uniform vec2 uCenter;
uniform float uTime;
uniform float uWaveSize;
uniform float uWaveSpeed;
uniform float uFadeSpeed;
uniform float uWaveNumber;
uniform float uHitTime;


varying vec2 vUv;

float make_onde(float dist,float creationTime){
    float customTimeDist=(uTime- creationTime)*uWaveSpeed;
    float customTimeFade=(uTime- creationTime)*uFadeSpeed;
    float onde= mod(max(dist-customTimeDist,-uWaveSize*uWaveNumber),uWaveSize)/uWaveSize;
    //float onde = mod(dist-customTimeDist,uWaveSize)/uWaveSize;
    float centered_onde=onde- 0.5;
    float result = 1.0-abs(centered_onde)*2.0;
    float calc = step(0.0,customTimeDist - dist);
    float fade = max (1.0- customTimeFade,0.0);
    return calc*result*fade;
}

void main()
{
    float dist = distance(vUv,uCenter);
    float custom = make_onde(dist,uHitTime);
    vec3 color = vec3(vUv, 1.0) * custom + vec3(0.1,0.1,0.1) * (1.0-custom);
    gl_FragColor = vec4(color,1.0);
}