import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import testVertexShader from './shaders/test/vertex.glsl'
import testFragmentShader1 from './shaders/test/frag_miror.glsl'
import testFragmentShader2 from './shaders/test/water_drop.glsl'

import Voronoi from 'voronoi';
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
const flagTexture = textureLoader.load('textures/test3.jpg')

// Material
const mat1 = new THREE.ShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader1,
    side: THREE.DoubleSide,
    uniforms:{
        uScale:{value:0.0},
        uUvOffset: {value:-0.01},
        uRadius: {value:0.01},
        uRotationOffset: {value:0.01},
        uCenter: {value: new THREE.Vector2(0.5, 0.5)},
        uDivision : {value:30.0},
        uTexture: { value: flagTexture }
    }
})
//scene 2
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
//scene 3
const mat3 = mat1;
const voronoi = new Voronoi();
function randomPoints([width, height], nPoints, margin = 0) {
    const points = [];
    for (let i = 0; i < nPoints; i++) {
        points.push({ 
        x: Math.random()*(width - margin)+margin, 
        y: Math.random()*(height - margin)+margin 
        });
    }
    return points;
}

const xs =[0.9973081977621951,0.9047610164141056,0.9388340764289369,0.9050982846161952,0.7934275378781708,0.6352968016287328,0.6153921144769368]
const ys =[0.016731157651457496,0.03987695675337122,0.6324470443494667,0.7338547694986144,.7368658540671269,0.770084959989082, 0.8923351608772221]

function notRandomPoints([width, height], nPoints, margin = 0) {
    const points = [];
    for (let i = 0; i < nPoints; i++) {
        points.push({ 
        x: xs[i], 
        y: ys[i] 
        });
    }
    return points;
}
  
const margin = 0;//0.01;
const width = 1;
const height = 1;
const nPoints = 50;
const points = randomPoints([width, height], nPoints, margin);
const bbox = { xl: margin, xr: width - margin, yt: margin, yb: height - margin };
const diagram = voronoi.compute(points, bbox);

const scene3 = new THREE.Group()

function indexAlreadyReferenced (value, array,epsilon){
    var i = 0;
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        var result=is_equal(value,element,epsilon);
        if(result){
            return index;
        }
    }
    return null
}

function is_equal(a,b,epsilon){
    return Math.pow(a.x-b.x,2)+Math.pow(a.y-b.y,2)<epsilon*epsilon
    //return a.x==b.x && a.y==b.y
}

function indexToList(indexPreprocess){
    const res = []
    var index = 0
    var next;
    while (next!=0) {
        next = indexPreprocess[index][0]
        indexPreprocess[index].splice(0, 1);
        var indexToRemove = indexPreprocess[next].indexOf(index);
        if (indexToRemove !== -1) {
            indexPreprocess[next].splice(indexToRemove, 1);
        }
        res.push(next)
        index = next
    }
    res.pop()
    return res
}

var now =2;
var nowValue = 0;
diagram.cells.forEach(cell => {
    var pointList=[];
    var indexPreprocess=[];
    const geometry = new THREE.BufferGeometry()
    const length = cell.halfedges.length;
    const center = cell.site;
    const positionsArray = new Float32Array(length * 3)
    const uvsArray = new Float32Array(length * 2)
    var j =0;
    for (let i = 0; i < length; i++) {
        const a =cell.halfedges[i].edge.va;
        var index_a = indexAlreadyReferenced(a,pointList,0.0000001)
        if (index_a == null){
            index_a = pointList.length;
            indexPreprocess.push([]);
            pointList.push(a)
            const x = a.x-center.x;
            const y = a.y-center.y;
            uvsArray[j*2 + 0]=a.x;
            uvsArray[j*2 + 1]=a.y;
            positionsArray[j*3 + 0]=x;
            positionsArray[j*3 + 1]=y;
            positionsArray[j*3 + 2]=0.0;
            j++;
        }
        const b =cell.halfedges[i].edge.vb;
        var index_b = indexAlreadyReferenced(b,pointList,0.0000001)
        if (index_b == null){
            index_b = pointList.length;
            indexPreprocess.push([]);
            pointList.push(b)
            const x = b.x-center.x;
            const y = b.y-center.y;
            uvsArray[j*2 + 0]=b.x;
            uvsArray[j*2 + 1]=b.y;
            positionsArray[j*3 + 0]=x;
            positionsArray[j*3 + 1]=y;
            positionsArray[j*3 + 2]=0.0;
            j++;
        }
        indexPreprocess[index_b].push(index_a);
        indexPreprocess[index_a].push(index_b);
    }
    var toLoop =[]
    for (let index = 0; index < indexPreprocess.length; index++) {
        if (indexPreprocess[index].length == 1) {
            toLoop.push(index)
        }
    }

    const indexOrder=indexToList(indexPreprocess);
    const indices = [];
    for (let i = 0; i < indexOrder.length-1; i++) {
        const baseIndex = i*3
        indices[baseIndex]=0;
        indices[baseIndex+1]=indexOrder[i];
        indices[baseIndex+2]=indexOrder[i+1];
    }
    for (let index = 0; index < pointList.length; index++) {
        const element = pointList[index];
    }
    geometry.setIndex( indices );
    const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3)
    geometry.setAttribute('position', positionsAttribute)
    const uvsAttribute = new THREE.BufferAttribute(uvsArray, 2)
    geometry.setAttribute('uv', uvsAttribute)
    const partMesh = new THREE.Mesh( geometry, mat3 );
    partMesh.position.x=center.x-0.5;
    partMesh.position.y=center.y-0.5;
    partMesh.position.z=0.0;
    scene3.add(partMesh)
//}
nowValue++
})


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
eff1.add(mat1.uniforms.uScale, 'value').min(0.0).max(1.0).step(0.0001).name('Scale')

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
scene.add(scene3)
// const box = new THREE.BoxHelper( scene3, 0xffff00 );
// scene.add( box );
// scene.add(mesh)

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