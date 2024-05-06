
import * as THREE from 'three';
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
camera.position.set(0,0,5);
camera.lookAt(0,0,0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0,0,0);
controls.update();

// Add Sun
var geometry = new THREE.SphereGeometry(1,10,10);
var material = new THREE.MeshPhongMaterial({color: 0xFFFF00});
var sun = new THREE.Mesh(geometry, material);

scene.add(sun)

// Add earth
var earthGeo = new THREE.SphereGeometry(1, 10, 10);
var earthMat = new THREE.MeshPhongMaterial({color: 0x0000FF})
var earth = new THREE.Mesh(earthGeo, earthMat);
sun.add(earth);
earth.position.set(5,0,0);
earth.scale.set(0.5,0.5,0.5);
earth.rotation.x += 0.3;

// Moon
var moonGeo = new THREE.SphereGeometry(1,10,10);
var moonMat = new THREE.MeshPhongMaterial({color: 0x808080})
var moon = new THREE.Mesh(moonGeo, moonMat);
earth.add(moon);
moon.position.set(5,0,0);
moon.scale.set(0.25,0.25,.25)

// Ambient
// var ambient = new THREE.AmbientLight(0xFF6666);
// scene.add(ambient);

// Hemisphere Light
var heimsphereLight = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 0.5)
scene.add(heimsphereLight);

function animate(){
    renderer.render(scene,camera);
    sun.rotation.y += 0.01;
    earth.rotation.y += 0.05
    requestAnimationFrame(animate);
}


requestAnimationFrame(animate);




