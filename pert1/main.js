import * as THREE from "three"

//setup canvas renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//setup scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);


//Add Box
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({color: 0x33ff33})
var cube = new THREE.Mesh(geometry, material);
scene.add(cube)

//Loop Animate
function animate() {
    renderer.render(scene, camera)
    cube.rotation.x += 0.01
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);