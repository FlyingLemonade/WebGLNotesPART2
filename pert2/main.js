import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';


//setup canvas renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

// //#568a91 -> # jdi 0x -> 0x568a91
// const bgColor = new THREE.Color(0x568a91);
// // Set the background color of the renderer
// renderer.setClearColor(bgColor);

document.body.appendChild(renderer.domElement);

//setup scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 0, 10);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

//Add Box
//THREE.BoxGeometry(1, 1, 1)

//sun
var geometry = new THREE.SphereGeometry(1, 10, 10);
var material = new THREE.MeshPhongMaterial({ color: 0xffff33 });
var sun = new THREE.Mesh(geometry, material);
scene.add(sun);
sun.castShadow = true;
sun.receiveShadow = true;

//Earth
var earthGeo = new THREE.SphereGeometry(1, 10, 10);
var earthMaterial = new THREE.MeshPhongMaterial({ color: 0x3333ff });
var earth = new THREE.Mesh(earthGeo, earthMaterial);
sun.add(earth);
earth.position.set(5, 0, 0);
earth.scale.set(0.5, 0.5, 0.5);
earth.rotation.x += 0.3;
earth.castShadow = true;
earth.receiveShadow = true;

//Moon
var moonGeo = new THREE.SphereGeometry(1, 10, 10);
var moonMaterial = new THREE.MeshPhongMaterial({ color: 0x55555 });
var moon = new THREE.Mesh(moonGeo, moonMaterial);
earth.add(moon);
moon.position.set(5, 0, 0);
moon.scale.set(0.25, 0.25, 0.25);
moon.castShadow = true;
moon.receiveShadow = true;

//Plane
var planeGeo = new THREE.PlaneGeometry(40, 40);
var planeMat = new THREE.MeshPhongMaterial({color: 0x777777, side: THREE.DoubleSide})
var plane = new THREE.Mesh(planeGeo, planeMat)
scene.add(plane)
plane.rotation.set(Math.PI/2, 0, 0)
plane.position.set(0, -3, 0)
plane.castShadow = true;
plane.receiveShadow = true;


// //Ambient Light
// //agar ambient light bisa, ubah di bagian material -> .MeshBasicMaterial menjadi -> .MeshPhongMaterial
// var ambientLight = new THREE.AmbientLight(0XFF6666)
// scene.add(ambientLight)

//Hemisphere Light
//sky color, ground color, intensitas
var hemisphereLight = new THREE.HemisphereLight(0xb1e1ff, 0xb97a20, 0.5);
scene.add(hemisphereLight);

// Directional Light
var directionalLight = new THREE.DirectionalLight(0xffffff, 10);
directionalLight.position.set(30, 30, 30);
directionalLight.target.position.set(0, 0, 0);
scene.add(directionalLight);
scene.add(directionalLight.target);
// menunjukan arah cahaya dari mana
var directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
scene.add(directionalLightHelper);
directionalLight.castShadow = true;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.camera.right = 15;
directionalLight.shadow.camera.left = -15;
directionalLight.shadow.camera.top = 15;
directionalLight.shadow.camera.bottom = -15;
directionalLight.shadow.camera.width = 1204;
directionalLight.shadow.camera.height = 1024;

//shadow helper
var directionalShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
scene.add(directionalShadowHelper)


// Point light
var pointLight = new THREE.PointLight(0xffff11, 150);
sun.add(pointLight);

// spot light
var spotLight = new THREE.SpotLight(0xff1111, 2000, 1000, 5, 10);
spotLight.castShadow = true;
scene.add(spotLight);
earth.add(spotLight.target);

scene.add(new THREE.SpotLightHelper(spotLight))
var spotLightShadowHelper = new THREE.CameraHelper(spotLight.shadow.camera);
scene.add(spotLightShadowHelper);

new MTLLoader()
    .setPath( '../resources/Satellite/' )
    .load( 'Satelite.mtl', function ( materials ) {
        materials.preload();
        new OBJLoader()
            .setMaterials( materials )
            .setPath( '../resources/Satellite/' )
            .load( 'Satelite.obj', function ( object ) {

                earth.add( object );
                object.scale.set(0.1,0.1,0.1);
                object.position.set(-3,0,0);
                object.traverse( function ( child ) {
                    if ( child.isMesh ) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                } );
            } );
    } );

// model objek karakter dari MIXAMO
var mixer;
const loader = new FBXLoader();
loader.load('../resources/Flair.fbx', function (object) {

    //1 karakter 1 mixer
    mixer = new THREE.AnimationMixer(object);

    const action = mixer.clipAction(object.animations[0]);
    action.play();

    object.traverse(function (child) {

        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    sun.add(object);
    object.scale.set(0.01, 0.01, 0.01)
    object.position.set(-3, 0, 0)
});

var clock = new THREE.Clock();
//Loop Animate
function animate() {
    renderer.render(scene, camera);
    sun.rotation.y += 0.01;
    earth.rotation.y += 0.05;
    requestAnimationFrame(animate);

    //untuk update animasi model
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta)
}
requestAnimationFrame(animate);
