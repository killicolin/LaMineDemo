#define PI 3.1415926535897932384626433832795

uniform float uUvOffset;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uRotationOffset;
uniform float uDivision;
uniform sampler2D uTexture;

varying vec2 vUv;

float get_angle(vec2 uv){
    float angle = atan(uCenter.x-uv.x,uCenter.y-uv.y)+PI;
    angle = mod(angle-uRotationOffset,2.0*PI+0.00001);
    return angle;
}

float get_section_index(vec2 uv){
    float angle = get_angle(uv);
    float step_angle=(PI)/uDivision;
    float new_angle= round(angle/step_angle);
    return new_angle;
}

float is_pair (vec2 uv){
    return floor(mod(get_section_index(uv)+1.0,2.0));
}

vec2 determine_offset(vec2 uv){
    float step_angle = (PI)/uDivision;
    float new_angle = get_section_index(uv)*step_angle;
    vec2 res=vec2(sin(new_angle),cos(new_angle));
    return res;
}

float is_offset_coeff(vec2 uv){
    vec2 new_center = determine_offset(uv)*uRadius+uCenter;
    float x_on_y =(uv.x - new_center.x)/ (uv.y - new_center.y);
    float angle = get_angle(uv);//(atan(x_on_y)+PI);
    float d = step(0.0,distance(uv,uCenter)-uRadius);
    float strength = d*step(0.0,sin(angle*uDivision+PI/2.0));
    return strength;
}

float clean_other_branch(vec2 uv){
    vec2 new_center = determine_offset(uv)*uRadius+uCenter;
    float new_x_on_y =(uv.x - new_center.x)/ (uv.y - new_center.y);
    float new_angle = (atan(new_x_on_y)+PI);
    float x_on_y =(uv.x - uCenter.x)/ (uv.y - uCenter.y);
    float angle = (atan(x_on_y)+PI);
    return 1.0-step(2.0/uDivision,abs(angle-new_angle));
}

float collage(vec2 uv){
    float res= is_offset_coeff(uv)*is_pair(uv);
    float clean = clean_other_branch(uv);
    return clean*res;
}

//wrong effect, replace collage function to see it
// float funny_bump(vec2 uv)
// {
//     return is_offset_coeff(uv);
// }

void main()
{
    vec2 uv = collage(vUv)*determine_offset(vUv)*uUvOffset;
    vec4 textureColor = texture2D(uTexture, vUv+uv);
    gl_FragColor = textureColor;
    // vec2 coord = normalize(vec2(uCenter.x-vUv.x,uCenter.y-vUv.y));
    // float angle = atan(coord.x,coord.y)+PI;
    // angle = mod(angle-uRotationOffset,2.0*PI+0.00001);
    // float step_angle = (2.0*PI)/uDivision;
    // float new_angle = round((angle)/step_angle);
    // float at = new_angle / uDivision;
    //gl_FragColor = collage(vUv)*vec4(1.0,0.0,0.0,1.0)+(1.0-collage(vUv))*vec4(0.0,0.0,1.0,1.0);
}