import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {ThirdPersonCamera, BasicCharacterController} from "./player.js";
import * as CANNON from "../resources/cannonjs/cannon-es.js";
import CannonDebugger from "../resources/cannonjs/cannon-es-debugger.js";
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';


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

        let light = new THREE.AmbientLight(0x0F93B7, 0.4);
        this._scene.add(light);

        // Lighting
    
        // 3 Lampu Besar The Mean Bean
        
        const bigBulp = [[-40,60,15],[-68,56,-28],[-68, 56, 56]]

        for(let i = 0; i < bigBulp.length ; i++){
            var bulbLight = new THREE.PointLight(0xffee88, 1, 100, 1);
            var BulpX = bigBulp[i][0];
            var BulpY = bigBulp[i][1];
            var BulpZ = bigBulp[i][2];

            bulbLight.position.set(BulpX, BulpY, BulpZ);
            bulbLight.castShadow = true;
            bulbLight.intensity = 15;
            bulbLight.power = 1*100;
            this._scene.add(bulbLight);
        }

        // Lampu Kecil Atas Meja

        const smallBulp = [
            [1.75, 42.5, 76.5],
            [28, 42.5, 76.5],
            [54.5, 42.5, 76.5],
            [80.75, 42.5, 76.5],
            [107.25, 42.5, 76.5],
            [93, 43, 55],
            [93, 43, 28.75],
            [93, 43.5, 2.5]
        
        ];

        for (let i = 0; i < smallBulp.length; i++) {
            const bulbGeometry = new THREE.SphereGeometry(0.8, 16, 8);
            var angle = Math.PI/4.0
            var penumbra = 0.4;
            var decay = 1;
            var bulbLight = new THREE.SpotLight(0xffee88, 1.0, 50,angle,penumbra,decay); // Adjust the distance as needed
            var BulpX = smallBulp[i][0];
            var BulpY = smallBulp[i][1];
            var BulpZ = smallBulp[i][2];
            const bulbMat = new THREE.MeshStandardMaterial({
                emissive: 0xffffee,
                emissiveIntensity: 1,
                color: 0x000000,
            });
            const bulbMesh = new THREE.Mesh(bulbGeometry, bulbMat);
        
            bulbLight.add(bulbMesh);
            bulbLight.position.set(BulpX, BulpY, BulpZ);
            bulbLight.castShadow = true;
            bulbLight.intensity = 1*100;
            const targetObject = new THREE.Object3D();
            targetObject.position.set(BulpX, 0, BulpZ);
            this._scene.add(targetObject);
            bulbLight.target = targetObject;
        
            // Add the light to the scene
            this._scene.add(bulbLight);
        
        }

        // Lampu Layar
            const spotLightLaptop = new THREE.SpotLight(0xffffff, 5.5, 30, Math.PI / 2.1, 0.1, 1);
            spotLightLaptop.position.set(32.5, 12, 13.2);
            spotLightLaptop.rotation.x = Math.PI;
            spotLightLaptop.rotation.y = Math.PI / 11.5;
            spotLightLaptop.castShadow = true;
            var targetObject = new THREE.Object3D();
            targetObject.position.set(32.25, 12, 14);
            this._scene.add(targetObject);
            spotLightLaptop.target = targetObject;
            spotLightLaptop.intensity = .08*100;
            spotLightLaptop.shadow.mapSize.width = 512; 
            spotLightLaptop.shadow.mapSize.height = 512;
            spotLightLaptop.shadow.camera.near = 0.5;
            spotLightLaptop.shadow.camera.far = 50;
            this._scene.add(spotLightLaptop);

        // Layar HP
            const spotLightPhone = new THREE.SpotLight(0xB3A540, 5.5, 30, Math.PI / 2.1, 0.1, 1);
            spotLightPhone.position.set(18.7, 12, 41.85);
            spotLightPhone.rotation.x = Math.PI;
            spotLightPhone.rotation.y = Math.PI / 11.5;
            spotLightPhone.castShadow = true;
            var targetObject = new THREE.Object3D();
            targetObject.position.set(18.7, 100, 41.85);
            this._scene.add(targetObject);
            spotLightPhone.target = targetObject;
            spotLightPhone.intensity = .14*100;
            spotLightPhone.shadow.mapSize.width = 512; 
            spotLightPhone.shadow.mapSize.height = 512;
            spotLightPhone.shadow.camera.near = 0.5;
            spotLightPhone.shadow.camera.far = 50;
            this._scene.add(spotLightPhone);

        

        // const smallBulp = [[1.75, 42.5, 76.5]]
        // for(let i = 0; i < smallBulp.length ; i++){
        //     const bulbGeometry = new THREE.SphereGeometry(0.8, 16, 8);
        //     var bulbLight = new THREE.PointLight(0xffee88, 1, 100, .3);
        //     var BulpX = smallBulp[i][0];
        //     var BulpY = smallBulp[i][1];
        //     var BulpZ = smallBulp[i][2];
        //     const bulbMat = new THREE.MeshStandardMaterial({
        //         emissive: 0xffffee,
        //         emissiveIntensity: 1,
        //         color: 0x000000,
        //       });
        //       const bulbMesh = new THREE.Mesh(bulbGeometry, bulbMat);
          
        //     bulbLight.add(bulbMesh);
        //     bulbLight.position.set(BulpX, BulpY, BulpZ);
        //     bulbLight.castShadow = true;
        //     bulbLight.intensity = 15;
        //     bulbLight.power = .4*100;
        //     this._scene.add(bulbLight);
        // }


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
            this._scene.add(model);
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
      
      const boxBody = new CANNON.Body({ mass: 0 });
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
