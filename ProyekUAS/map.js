import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {ThirdPersonCamera, BasicCharacterController} from "./player.js"


export class Map {
    constructor() {
      this._Initialize();
    }
  
    _Initialize() {
      this._threejs = new THREE.WebGLRenderer({
        antialias: true,
      });
      this._threejs.outputEncoding = THREE.sRGBEncoding;
      this._threejs.shadowMap.enabled = true;
      this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
      this._threejs.setPixelRatio(window.devicePixelRatio);
      this._threejs.setSize(window.innerWidth, window.innerHeight);
  
      document.body.appendChild(this._threejs.domElement);
  
      window.addEventListener('resize', () => {
        this._OnWindowResize();
      }, false);
  
      const fov = 60;
      const aspect = window.innerWidth/ window.innerHeight;
      const near = 1.0;
      const far = 1000.0;
      this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      this._camera.position.set(25, 10, 25);
  
      this._scene = new THREE.Scene();
  
      // let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
      // light.position.set(-100, 100, 100);
      // light.target.position.set(0, 0, 0);
      // light.castShadow = true;
      // light.shadow.bias = -0.001;
      // light.shadow.mapSize.width = 4096;
      // light.shadow.mapSize.height = 4096;
      // light.shadow.camera.near = 0.1;
      // light.shadow.camera.far = 500.0;
      // light.shadow.camera.near = 0.5;
      // light.shadow.camera.far = 500.0;
      // light.shadow.camera.left = 50;
      // light.shadow.camera.right = -50;
      // light.shadow.camera.top = 50;
      // light.shadow.camera.bottom = -50;
      // this._scene.add(light);
  
      let light = new THREE.AmbientLight(0x0F93B7, .4);
      this._scene.add(light);
  
      const loader = new THREE.CubeTextureLoader();
      const texture = loader.load([
        '../resources/bkg/lightblue/right.png',
        '../resources/bkg/lightblue/left.png',
        '../resources/bkg/lightblue/top.png',
        '../resources/bkg/lightblue/bot.png',
        '../resources/bkg/lightblue/front.png',
        '../resources/bkg/lightblue/back.png',
      ]);
      texture.encoding = THREE.sRGBEncoding;
      this._scene.background = texture;
  
      this._mixers = [];
      this._previousRAF = null;
  
      this._LoadAnimatedModel();
      this._LoadCoffeeShopModel();
      this._RAF();
    }
  
    _LoadAnimatedModel() {
      const params = {
        camera: this._camera,
        scene: this._scene,
      }
      this._controls = new BasicCharacterController(params);
  
      this._thirdPersonCamera = new ThirdPersonCamera({
        camera: this._camera,
        target: this._controls,
      });
    }
    _LoadCoffeeShopModel(){

      // const plane = new THREE.Mesh(
      //   new THREE.PlaneGeometry(100, 100, 10, 10),
      //     new THREE.MeshStandardMaterial({
      //         color: 0x808080,
      //       }));
      // plane.castShadow = false;
      // plane.receiveShadow = true;
      // plane.rotation.x = -Math.PI / 2;
      // this._scene.add(plane);

      // Wall
      this.mesh = new THREE.Mesh(
        new THREE.BoxGeometry(3, 80, 110),
        new THREE.MeshPhongMaterial({ color: 0xBDBCEA })
      );
  
      this.mesh.receiveShadow = true;
      this.mesh.castShadow = true;
      this.mesh.position.set(136,35,75);
      this._scene.add(this.mesh);
      
      // Wall
      this.mesh = new THREE.Mesh(
        new THREE.BoxGeometry(3, 80, 245),
        new THREE.MeshPhongMaterial({ color: 0xBDBCEA })
      );
  
      this.mesh.receiveShadow = true;
      this.mesh.castShadow = true;
      this.mesh.rotation.y = 90 * Math.PI / 180;
      this.mesh.position.set(15,40,133);
      this._scene.add(this.mesh);

      // Main Object
      const loader = new GLTFLoader();
      loader.setPath("../resources/");
      loader.load("Toko Kopi Mas Otot.glb", (gltf) => {
          const model = gltf.scene;
          model.scale.setScalar(2.0);
          model.traverse(c => {
              if (c.isMesh) {
                  c.castShadow = true;
                  c.receiveShadow = true;

              }
          });
          model.rotation.x = -1.56;
          model.position.y = 26;
          this._scene.add(model);
      });
    }

    _OnWindowResize() {
      this._camera.aspect = window.innerWidth / window.innerHeight;
      this._camera.updateProjectionMatrix();
      this._threejs.setSize(window.innerWidth, window.innerHeight);
    }
  
    _RAF() {
      requestAnimationFrame((t) => {
        if (this._previousRAF === null) {
          this._previousRAF = t;
        }
  
        this._RAF();
  
        this._threejs.render(this._scene, this._camera);
        this._Step(t - this._previousRAF);
        this._previousRAF = t;
      });
    }
  
    _Step(timeElapsed) {
      const timeElapsedS = timeElapsed * 0.001;
      if (this._mixers) {
        this._mixers.map(m => m.update(timeElapsedS));
      }
  
      if (this._controls) {
        this._controls.Update(timeElapsedS);
      }
  
      this._thirdPersonCamera.Update(timeElapsedS);
    }
  }

