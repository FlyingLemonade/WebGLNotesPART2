import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";



export class Map {
    constructor(scene) {
        this.scene = scene;
        this.loadMap();
    }

    loadMap() {
        // Add ground
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
        const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Light Ambient
        var ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambientLight);

        // Small bulb light
        const bulbGeometry = new THREE.SphereGeometry(0.08, 16, 8);
        const bulbLight = new THREE.PointLight(0xffee88, 1, 100, 2);
        const bulbMat = new THREE.MeshStandardMaterial({
        emissive: 0xffffee,
        emissiveIntensity: 1,
        color: 0x000000,
        });
        const bulbMesh = new THREE.Mesh(bulbGeometry, bulbMat);

        bulbLight.add(bulbMesh);
        bulbLight.position.set(0, 2, 7);
        bulbLight.castShadow = true;
        bulbLight.intensity = 5;
        bulbLight.power = 200;
        this.scene.add(bulbLight);


        // Load more complex models if needed
        const loader = new GLTFLoader();
        loader.setPath("../resources/");
        loader.load("Toko Kopi Mas Otot.glb", (gltf) => {
            const model = gltf.scene;
            model.scale.setScalar(.15);
            model.traverse(c => {
                if (c.isMesh) {
                    c.castShadow = true;
                    c.receiveShadow = true;

                }
            });
            model.rotation.x = -1.56;
            model.position.y = 1.9;
            this.scene.add(model);
        });
    }

    update(dt) {
      
    }
}