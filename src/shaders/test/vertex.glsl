uniform float uScale;

varying vec2 vUv;

void main()
{
    float crack = 1.0-uScale;
    vec3 new_pos = position*crack;
    vec3 tmp =position-new_pos;
    vUv = uv-tmp.xy;
    //float test = 1.0+(uv.y*10.0 *(-uScale))/10.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(new_pos, 1.0);
}