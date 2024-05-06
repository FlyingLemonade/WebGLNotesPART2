import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
camera.position.set(0,0,5);
camera.lookAt(0,0,0);

function animate(){
    renderer.render(scene,camera);
    requestAnimationFrame(animate);
}


requestAnimationFrame(animate);




