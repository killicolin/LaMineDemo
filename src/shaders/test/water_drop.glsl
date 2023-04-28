uniform vec2 uCenter[3];
uniform float uHitTime;
uniform float uTime;
uniform float uWaveSize;
uniform float uWaveSpeed;
uniform float uFadeSpeed;
uniform float uWaveNumber;


varying vec2 vUv;

float make_onde(float dist,float creationTime){
    float customTimeDist=(uTime- creationTime)*uWaveSpeed;
    float customTimeFade=(uTime- creationTime)*uFadeSpeed;
    float onde= mod(max(dist-customTimeDist,-uWaveSize*uWaveNumber),uWaveSize)/uWaveSize;
    //float onde = mod(dist-customTimeDist,uWaveSize)/uWaveSize;
    float centered_onde=0.5-onde;
    float result = 1.0-(abs(centered_onde)-0.25)*4.0;
    float calc = step(0.0,customTimeDist - dist);
    float fade = max (1.0- customTimeFade,0.0);
    return calc*result*fade;
}

void main()
{
    float custom =0.0;
    for(int i=0;i<3;++i)
    {
        float dist = distance(vUv,uCenter[i]);
        custom += make_onde(dist,uHitTime);
    }
    vec3 color = vec3(vUv, 1.0) * custom + vec3(0.1,0.1,0.1) * (1.0-custom);
    gl_FragColor = vec4(color,1.0);
}