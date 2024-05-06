import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"

//setup canvas renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//setup scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(0, 0, 0)
controls.update();

//Add Box
//THREE.BoxGeometry(1, 1, 1)

//sun
var geometry = new THREE.SphereGeometry(1, 10, 10);
var material = new THREE.MeshPhongMaterial({color: 0xFFFF00})
var sun = new THREE.Mesh(geometry, material);
scene.add(sun)

//Earth
var earthGeo = new THREE.SphereGeometry(1, 10, 10);
var earthMaterial = new THREE.MeshPhongMaterial({color: 0x3333ff})
var earth = new THREE.Mesh(earthGeo, earthMaterial)
sun.add(earth)
earth.position.set(5, 0, 0)
earth.scale.set(0.5, 0.5, 0.5)
earth.rotation.x+=0.3

//Moon
var moonGeo = new THREE.SphereGeometry(1, 10, 10);
var moonMaterial = new THREE.MeshPhongMaterial({color: 0x55555})
var moon = new THREE.Mesh(moonGeo, moonMaterial);
earth.add(moon)
moon.position.set(5, 0, 0)
moon.scale.set(0.25, 0.25, 0.25)


// //Ambient Light
// //agar ambient light bisa, ubah di bagian material -> .MeshBasicMaterial menjadi -> .MeshPhongMaterial
// var ambientLight = new THREE.AmbientLight(0XFF6666)
// scene.add(ambientLight)

//Hemisphere Light
//sky color, ground color, intensitas
var hemisphereLight = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 0.5)
scene.add(hemisphereLight)

//Directional Light
var directionalLight = new THREE.DirectionalLight(0xFFFFFF, 10)
directionalLight.position.set(3, 3, 3)
directionalLight.target.position.set(0, 0, 0);
scene.add(directionalLight)
scene.add(directionalLight.target)

// menunjukan arah cahaya dari mana
var directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight)
scene.add(directionalLightHelper);


//Point light
var pointLight = new THREE.PointLight(0xFFFF11, 150)
sun.add(pointLight);


//spot light
var spotLight = new THREE.SpotLight(0xFF1111, 200, 1000, 15, 10)
moon.add(spotLight);
earth.add(spotLight.target)

moon.add(new THREE.SpotLightHelper(spotLight))

//Loop Animate
function animate() {
    renderer.render(scene, camera)
    sun.rotation.y += 0.01
    earth.rotation.y += 0.05
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);