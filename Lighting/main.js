import * as THREE from "three";
import { Player, PlayerController, ThirdPersonCamera } from "./player.js";

class Main {
  static init() {
    var canvasRef = document.getElementById("myCanvas");

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvasRef,
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // plane
    var plane = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshPhongMaterial({ color: 0xffffff }));

    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    plane.castShadow = false;
    this.scene.add(plane);



    let light = new THREE.AmbientLight(0x0F93B7, 0.4);
    this.scene.add(light);

    // Light
    // var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    // this.scene.add(ambientLight);

    // Directional lighting
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.castShadow = true;
    directionalLight.position.set(-50, 10, 20);
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    this.scene.add(directionalLight);

    // var directionalShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    // this.scene.add(directionalShadowHelper);

    // Small bulb light
    const bulbGeometry = new THREE.SphereGeometry(0.02, 16, 8);
    const bulbLight = new THREE.PointLight(0xffee88, 1, 100, 2);
    const bulbMat = new THREE.MeshStandardMaterial({
      emissive: 0xffffee,
      emissiveIntensity: 1,
      color: 0x000000,
    });
    const bulbMesh = new THREE.Mesh(bulbGeometry, bulbMat);

    bulbLight.add(bulbMesh);
    bulbLight.position.set(0, 2, 5);
    bulbLight.castShadow = true;
    bulbLight.intensity = 5;
    bulbLight.power = 200;
    // this.scene.add(bulbLight);

    // Small bulb light 2
    const bulbGeometry2 = new THREE.SphereGeometry(0.02, 16, 8);
    const bulbLight2 = new THREE.PointLight(0xffee88, 1, 100, 2);
    const bulbMat2 = new THREE.MeshStandardMaterial({
      emissive: 0xffffee,
      emissiveIntensity: 1,
      color: 0x000000,
    });
    const bulbMesh2 = new THREE.Mesh(bulbGeometry2, bulbMat2);

    bulbLight2.add(bulbMesh2);
    bulbLight2.position.set(0, 5, -5);
    bulbLight2.castShadow = true;
    bulbLight2.intensity = 5;
    bulbLight2.power = 0;
    this.scene.add(bulbLight2);

    const createCube = function (size, material, x, y, z) {
        const geometry = new THREE.BoxGeometry(size, size, size),
        cube = new THREE.Mesh(geometry, material);
        cube.position.set(x, y, z);
        cube.receiveShadow = true; // Enable receiving shadows
        return cube;
    };
    const materials = {};
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    const material = new THREE.MeshPhysicalMaterial({
      roughness: 0.7,
      transmission: 1,
      thickness: 1,
    });
  
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0,2,0)
    mesh.scale.set(2.0,2.0,2.0);
    this.scene.add(mesh);
    materials.glass = new THREE.MeshPhysicalMaterial({
        color: 'black',
        transparent: true,
        opacity: 0.4,
        thickness: 0.5,
        transmission:1,
        roughness: 0.4,

    });
    const glassCube = createCube(5, materials.glass, 5, 5, 4);
    const cube = createCube(5, materials.sand, -5, 5,-4);
    this.scene.add(glassCube);
    this.scene.add(cube);



    var thirdPerson = new ThirdPersonCamera(this.camera, new THREE.Vector3(-10, 5, 0), new THREE.Vector3(0, 0, 0));
    thirdPerson.setup(new THREE.Vector3(0, 0, 0));

    var controller = new PlayerController();
    this.player = new Player(thirdPerson, controller, this.scene);

    this.bulbLight = bulbLight;
  }

  static render(dt) {
    this.player.update(dt);

    // Animate the bulb light
    const time = Date.now() * 0.0005;
    this.bulbLight.position.y = Math.cos(time) * 0.75 + 1.25;

    this.renderer.render(this.scene, this.camera);
  }
}

var clock = new THREE.Clock();
Main.init();

function animate() {
  Main.render(clock.getDelta());
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
