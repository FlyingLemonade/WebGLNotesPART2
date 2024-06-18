import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {ThirdPersonCamera, BasicCharacterController} from "./player.js";
import * as CANNON from "../resources/cannonjs/cannon-es.js";
import CannonDebugger from "../resources/cannonjs/cannon-es-debugger.js";

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
        const aspect = window.innerWidth / window.innerHeight;
        const near = 1.0;
        const far = 1000.0;
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this._camera.position.set(25, 10, 25);

        this._scene = new THREE.Scene();
        let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        light.position.set(-100, 100, 100);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.bias = -0.001;
        light.shadow.mapSize.width = 4096;
        light.shadow.mapSize.height = 4096;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.left = 50;
        light.shadow.camera.right = -50;
        light.shadow.camera.top = 50;
        light.shadow.camera.bottom = -50;
        this._scene.add(light);

        light = new THREE.AmbientLight(0x0F93B7, 0.4);
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
        this._cannonBoxes = [];

        this._InitializeCannon();
        this._CreateCannonBox();
        // this._CreateCannonBox();
        // this._CreateCannonBox();
        // this._CreateCannonBox();
        this._LoadAnimatedModel();
        this._LoadCoffeeShopModel();

        this._RAF();
    }

    _LoadAnimatedModel() {
        const params = {
            camera: this._camera,
            scene: this._scene,
            world: this._world,
           
        };
        this._controls = new BasicCharacterController(params);

        this._thirdPersonCamera = new ThirdPersonCamera({
            camera: this._camera,
            target: this._controls,
        });
        
    }

    _LoadCoffeeShopModel() {

        // Wall
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(3, 80, 110),
            new THREE.MeshPhongMaterial({ color: 0xBDBCEA })
        );

        this.mesh.receiveShadow = true;
        this.mesh.castShadow = true;
        this.mesh.position.set(136, 35, 75);
        this._scene.add(this.mesh);

        // wall
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(3, 80, 245),
            new THREE.MeshPhongMaterial({ color: 0xBDBCEA })
        );

        this.mesh.receiveShadow = true;
        this.mesh.castShadow = true;
        this.mesh.rotation.y = 90 * Math.PI / 180;
        this.mesh.position.set(15, 40, 133);
        this._scene.add(this.mesh);

        // Main
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
            // this._scene.add(model);
        });

          // Physics
          var groundMaterial = new CANNON.Material('ground');
          const planeShape = new CANNON.Box(new CANNON.Vec3(150, 1, 150));
          var planeBody = new CANNON.Body({ mass: 0, material: groundMaterial });
          planeBody.addShape(planeShape);
          planeBody.position.set(10, 0, 10);
          
          this._world.addBody(planeBody);
    }

    _InitializeCannon() {
        this._world = new CANNON.World();
        this._world.gravity.set(0, -10, 0);

        this._cannonDebugger = new CannonDebugger(this._scene, this._world, {
            onInit: (body, mesh) => {
                mesh.visible = true;
                document.addEventListener("keydown", (event) => {
                    if (event.key === "f") {
                        mesh.visible = !mesh.visible;
                    }
                });
            },
        });
    }

    _CreateCannonBox() {
      const halfExtents = new CANNON.Vec3(3, 3, 3);
      const boxShape = new CANNON.Box(halfExtents);
      const boxBody = new CANNON.Body({ mass: 1});
      boxBody.addShape(boxShape);
      boxBody.position.set(10, 15, 0);
  
      this._world.addBody(boxBody);
  
      const boxGeometry = new THREE.BoxGeometry(5, 5, 5);
      const boxMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
      const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
      boxMesh.castShadow = true;
      boxMesh.receiveShadow = true;
      boxMesh.position.copy(boxBody.position); // Set the position of the mesh to match the body
  
      this._scene.add(boxMesh);
  
      const _cannonBox = {
          mesh: boxMesh,
          body: boxBody,
      };
      this._cannonBoxes.push(_cannonBox);

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

        this._world.step(timeElapsedS);

        for (const cannonBox of this._cannonBoxes) { 
          cannonBox.mesh.position.copy(cannonBox.body.position);
          cannonBox.mesh.quaternion.copy(cannonBox.body.quaternion);
      }
        this._cannonDebugger.update();
    }
}
