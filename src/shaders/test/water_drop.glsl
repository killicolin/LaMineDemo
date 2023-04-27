uniform vec2 uCenter;
uniform float uTime;

varying vec2 vUv;

void main()
{
    float dist = mod(max(distance(vUv,uCenter)-uTime/10.0,-3.0),0.1)*10.0;
    gl_FragColor = vec4(dist,0.0,0.0,1.0);
}