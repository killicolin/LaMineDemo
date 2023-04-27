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
        uCenter: {value: new THREE.Vector2(0.5, 0.5)},
        uTime: {value:0.0},
    }
})
const mat3 =mat1;

var scene_param_group =
{
    scene_choice: 0
}
gui.add(scene_param_group, 'scene_choice', [ 0,1,2 ] ).name('Effect').onChange( e => {
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
})

const eff1=gui.addFolder('Effect_1')
const eff2=gui.addFolder('Effect_2')
const eff3=gui.addFolder('Effect_3')
const effects = [eff1,eff2,eff3]
const materials = [mat1,mat2,mat3]
eff2.hide();
eff3.hide();
eff1.add(mat1.uniforms.uCenter.value, 'x').min(0.0).max(1.0).step(0.001).name('Center_X')
eff1.add(mat1.uniforms.uCenter.value, 'y').min(0.0).max(1.0).step(0.001).name('Center_Y')
eff1.add(mat1.uniforms.uUvOffset, 'value').min(-0.1).max(0.1).step(0.001).name('UvOffset')
eff1.add(mat1.uniforms.uRadius,'value').min(0.0).max(1.0).step(0.001).name('Radius')
eff1.add(mat1.uniforms.uRotationOffset,'value').min(0.0).max(24.283).step(0.001).name('RotationOffset')
eff1.add(mat1.uniforms.uDivision, 'value').min(1.0).max(50.0).step(2.0).name('Division')

eff2.add(mat2.uniforms.uCenter.value, 'x').min(0.0).max(1.0).step(0.001).name('Center_X')
eff2.add(mat2.uniforms.uCenter.value, 'y').min(0.0).max(1.0).step(0.001).name('Center_Y')

scene_param_group.scene_choice= 1
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