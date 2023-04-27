#define PI 3.1415926535897932384626433832795


uniform float uUvOffset;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uDivision;
uniform sampler2D uTexture;

varying vec2 vUv;

float get_section_index(vec2 uv){
    float angle = atan(uCenter.x-uv.x,uCenter.y-uv.y)+PI;
    float step_angle=(PI)/uDivision;
    float new_angle= round(angle/step_angle);
    return new_angle;
}

float is_pair (vec2 uv){
    return floor(mod(get_section_index(uv)+1.0,2.0));
}

vec2 determine_offset(vec2 uv){
    float step_angle=(PI)/uDivision*2.0;
    float new_angle= get_section_index(uv)*step_angle;
    vec2 res=vec2(sin(new_angle),cos(new_angle));
    return res;
}

float is_offset_coeff(vec2 uv){
    vec2 new_center = determine_offset(uv)*uRadius+uCenter;
    float d = step(0.0,distance(uv,uCenter)-uRadius);
    float x_on_y =(uv.x - new_center.x)/ (uv.y - new_center.y);
    float angle = (atan(x_on_y)+PI);
    float strength = step(0.0,sin(angle*uDivision+PI/2.0));
    return strength;
}

void main()
{
    float res= is_offset_coeff(vUv)*is_pair(vUv);
    vec2 uv =res*determine_offset(vUv)*uUvOffset;
    vec4 textureColor = texture2D(uTexture, vUv+uv);
    gl_FragColor = vec4(atan(uCenter.x-uv.x,uCenter.y-uv.y));
}