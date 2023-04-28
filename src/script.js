import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import testVertexShader from './shaders/test/vertex.glsl'
import testFragmentShader1 from './shaders/test/frag_miror.glsl'
import testFragmentShader2 from './shaders/test/water_drop.glsl'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.PlaneGeometry(1, 1, 32, 32)

// texture
const textureLoader = new THREE.TextureLoader();
const flagTexture = textureLoader.load('textures/test.jpg')

// Material
const mat1 = new THREE.ShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader1,
    side: THREE.DoubleSide,
    uniforms:{
        uUvOffset: {value:-0.01},
        uRadius: {value:0.01},
        uRotationOffset: {value:0.01},
        uCenter: {value: new THREE.Vector2(0.5, 0.5)},
        uDivision : {value:30.0},
        uTexture: { value: flagTexture }
    }
})

const mat2 =new THREE.ShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader2,
    side: THREE.DoubleSide,
    uniforms:{
        uCenter: {value: [new THREE.Vector2(0.5, 0.5),new THREE.Vector2(0.25, 0.25),new THREE.Vector2(0.75, 0.75)]},
        uHitTime: {value:[-10.0,-10.0,-10.0]},
        uTime: {value:0.0},
        uWaveSize: {value:0.2},
        uWaveSpeed: {value:0.2},
        uFadeSpeed: {value:0.5},
        uWaveNumber: {value:3.0},
    }
})
const mat3 =mat1;

var scene_param_group =
{
    scene_choice: 1
}

let scene_change = () => {
    for (let index = 0; index < 3; index++) {
        if (scene_param_group.scene_choice===index){

            effects[index].show()
            mesh.material=materials[index]
        }
        else 
        {
            effects[index].hide()
           
        }
    }
}

gui.add(scene_param_group, 'scene_choice', [ 0,1,2 ] ).name('Effect').onChange(scene_change)

const eff1=gui.addFolder('Effect_1')
const eff2=gui.addFolder('Effect_2')
const eff3=gui.addFolder('Effect_3')
const effects = [eff1,eff2,eff3]
const materials = [mat1,mat2,mat3]
eff1.hide();
eff2.hide();
eff3.hide();
eff1.add(mat1.uniforms.uCenter.value, 'x').min(0.0).max(1.0).step(0.001).name('Center_X')
eff1.add(mat1.uniforms.uCenter.value, 'y').min(0.0).max(1.0).step(0.001).name('Center_Y')
eff1.add(mat1.uniforms.uUvOffset, 'value').min(-0.1).max(0.1).step(0.00001).name('UvOffset')
eff1.add(mat1.uniforms.uRadius,'value').min(0.0).max(1.0).step(0.0001).name('Radius')
eff1.add(mat1.uniforms.uRotationOffset,'value').min(0.0).max(3.14).step(0.0001).name('RotationOffset')
eff1.add(mat1.uniforms.uDivision, 'value').min(1.0).max(50.0).step(2.0).name('Division')

eff2.add(mat2.uniforms.uCenter.value[0], 'x').min(0.0).max(1.0).step(0.001).name('Center0_X')
eff2.add(mat2.uniforms.uCenter.value[0], 'y').min(0.0).max(1.0).step(0.001).name('Center0_Y')
eff2.add(mat2.uniforms.uCenter.value[1], 'x').min(0.0).max(1.0).step(0.001).name('Center1_X')
eff2.add(mat2.uniforms.uCenter.value[1], 'y').min(0.0).max(1.0).step(0.001).name('Center1_Y')
eff2.add(mat2.uniforms.uCenter.value[2], 'x').min(0.0).max(1.0).step(0.001).name('Center2_X')
eff2.add(mat2.uniforms.uCenter.value[2], 'y').min(0.0).max(1.0).step(0.001).name('Center2_Y')
eff2.add(mat2.uniforms.uWaveSize, 'value').min(0.0).max(1.0).step(0.001).name('Wave size')
eff2.add(mat2.uniforms.uWaveSpeed, 'value').min(0.0).max(1.0).step(0.001).name('Wave speed')
eff2.add(mat2.uniforms.uFadeSpeed, 'value').min(0.0).max(1.0).step(0.001).name('Fade speed')
eff2.add(mat2.uniforms.uWaveNumber, 'value').min(0.0).max(20.0).step(1.0).name('Wave number')

let redo = () => {
    const elapsedTime = clock.getElapsedTime()
    mat2.uniforms.uHitTime.value[0] = elapsedTime
    mat2.uniforms.uHitTime.value[1] = elapsedTime
    mat2.uniforms.uHitTime.value[2] = elapsedTime
}

let utilitary = {
    redoclick : redo
}

eff2.add(utilitary,'redoclick').name('RePlay');




// Mesh
const mesh = new THREE.Mesh(geometry, mat1)
scene.add(mesh)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0.25, - 0.25, 1)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () =>
{
    // Update controls
    const elapsedTime = clock.getElapsedTime()
    if(scene_param_group.scene_choice==1){
        materials[scene_param_group.scene_choice].uniforms.uTime.value=elapsedTime;
    }
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
scene_param_group.scene_choice= 1
scene_change()


/**
 * Mouse Interaction
 */
const onClickPosition = new THREE.Vector2();

function getMousePosition( dom, x, y ) {
    const rect = dom.getBoundingClientRect();
    return [ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ];
}


function getIntersects( point, objects ) {
    const mouse= new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );
    raycaster.setFromCamera( mouse, camera );
    return raycaster.intersectObjects( objects, false );

}

function onMouseClick( evt ) {
    if(scene_param_group.scene_choice!=1){
        return;
    }
    evt.preventDefault();
    const array = getMousePosition( canvas, evt.clientX, evt.clientY );
    onClickPosition.fromArray( array );
    const intersects = getIntersects( onClickPosition, scene.children );
    if ( intersects.length > 0 && intersects[0].uv ) {
        const uv = intersects[0].uv;
        const elapsedTime = clock.getElapsedTime()
        intersects[0].object.material.uniforms.uHitTime.value[i_clicked] = elapsedTime
        intersects[0].object.material.uniforms.uCenter.value[i_clicked]=uv;
        i_clicked++
        i_clicked = i_clicked %3;
    }

}

var i_clicked =0;

canvas.addEventListener( 'click', onMouseClick );