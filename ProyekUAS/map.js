import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {ThirdPersonCamera, BasicCharacterController} from "./player.js";
import * as CANNON from "../resources/cannonjs/cannon-es.js";
import CannonDebugger from "../resources/cannonjs/cannon-es-debugger.js";
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { FBXLoader } from "three/addons/loaders/FBXLoader.js"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


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
        let lightDirectional = new THREE.DirectionalLight(0x0FFFFF, 0.5);
        lightDirectional.position.set(50, 0, 500);
        lightDirectional.target.position.set(0, 0, 0);
        lightDirectional.castShadow = true;
        lightDirectional.shadow.bias = -0.001;
        lightDirectional.shadow.mapSize.width = 4096;
        lightDirectional.shadow.mapSize.height = 4096;
        lightDirectional.shadow.camera.near = 0.1;
        lightDirectional.shadow.camera.far = 500.0;
        lightDirectional.shadow.camera.near = 0.5;
        lightDirectional.shadow.camera.far = 500.0;
        lightDirectional.shadow.camera.left = 50;
        lightDirectional.shadow.camera.right = -50;
        lightDirectional.shadow.camera.top = 50;
        lightDirectional.shadow.camera.bottom = -50;
        // this._scene.add(lightDirectional);

        // Add light helper
        // let lightHelper = new THREE.DirectionalLightHelper(lightDirectional, 5); // Second parameter is the size of the helper
        // this._scene.add(lightHelper);


        let light = new THREE.AmbientLight(0x0F93B7, 0.8);
        this._scene.add(light);

        // Lighting
    
        // 3 Lampu Besar The Mean Bean
        const bigBulp = [
            [-40,60,15]
        ]
        //     const bigBulp = [
        //     [-40,60,15],
        //     [-68,56,-28],
        //     [-68, 56, 56]
        // ]



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
            [28, 42.5, 76.5],
            [80.75, 42.5, 76.5],
            [93, 43, 28.75],
        ];
        // const smallBulp = [
        //     [1.75, 42.5, 76.5],
        //     [28, 42.5, 76.5],
        //     [54.5, 42.5, 76.5],
        //     [80.75, 42.5, 76.5],
        //     [107.25, 42.5, 76.5],
        //     [93, 43, 55],
        //     [93, 43, 28.75],
        //     [93, 43.5, 2.5]
        
        // ];

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

         // Lampu Speaker Kanan Panggung
         const spotLightSpeaker = new THREE.SpotLight(0xFFFFFF, 5.5, 20, Math.PI / 2, 1, 1);
         spotLightSpeaker.position.set(15, 8.5, -34.5);
         spotLightSpeaker.rotation.x = Math.PI;
         spotLightSpeaker.rotation.y = Math.PI / 11.5;
         var targetObject = new THREE.Object3D();
         targetObject.position.set(15, 8.5, -30.5);
         this._scene.add(targetObject);

         spotLightSpeaker.target = targetObject;
         spotLightSpeaker.intensity = .03*100;
         spotLightSpeaker.shadow.mapSize.width = 512; 
         spotLightSpeaker.shadow.mapSize.height = 512;
         spotLightSpeaker.shadow.camera.near = 0.5;
         spotLightSpeaker.shadow.camera.far = 50;
         this._scene.add(spotLightSpeaker);

        // Lampu Speaker Kiri Panggung
        const spotLightSpeaker2 = new THREE.SpotLight(0xFFFFFF, 5.5, 20, Math.PI / 2, 1, 1);
        spotLightSpeaker2.position.set(86, 20, -37.5);
        spotLightSpeaker2.rotation.x = Math.PI;
        spotLightSpeaker2.rotation.y = Math.PI / 11.5;
        var targetObject = new THREE.Object3D();
        targetObject.position.set(86, 15, -35.5);
        this._scene.add(targetObject);

        spotLightSpeaker2.target = targetObject;
        spotLightSpeaker2.intensity = .03*100;
        spotLightSpeaker2.shadow.mapSize.width = 512; 
        spotLightSpeaker2.shadow.mapSize.height = 512;
        spotLightSpeaker2.shadow.camera.near = 0.5;
        spotLightSpeaker2.shadow.camera.far = 50;
        this._scene.add(spotLightSpeaker2);

        // Lampu Jedag Jedug
        const stageLamp = [
            [5,47.5,-48],
            // [26,47.5,-32.5],
            [65,47.5,-33],
            // [88,47.5,-46],
        
        ];

        const stageLampDirection = [
            [80,0,-90],
            [70,0,-60],
            [35,0,-70],
            [75,-10,-90],
            
        ];

        const stageLampColor= [
            0xFF0000,
            0x00008B,
            0xFFFF00,
            0x00FF00
            
        ];

        this.stageLampRender =[]
        for(let i = 0; i < stageLamp.length ; i++){
            // const bulbGeometry = new THREE.SphereGeometry(2.5, 16, 8);
            var bulbLight = new THREE.SpotLight(stageLampColor[i], 5.5, 100, Math.PI / 2.3, .5, .3);
            var BulpX = stageLamp[i][0];
            var BulpY = stageLamp[i][1];
            var BulpZ = stageLamp[i][2];
            var BulpDirectionX = stageLampDirection[i][0];
            var BulpDirectionY = stageLampDirection[i][1];
            var BulpDirectionZ = stageLampDirection[i][2];
            // const bulbMat = new THREE.MeshStandardMaterial({
            //     emissive: 0xffffee,
            //     emissiveIntensity: 1,
            //     color: 0x000000,
            //   });
            //   const bulbMesh = new THREE.Mesh(bulbGeometry, bulbMat);

            var targetObject = new THREE.Object3D();
            targetObject.position.set(BulpDirectionX, BulpDirectionY, BulpDirectionZ);
            this._scene.add(targetObject);
            bulbLight.target = targetObject;
            // bulbLight.add(bulbMesh);
            bulbLight.position.set(BulpX, BulpY, BulpZ);
            bulbLight.castShadow = true;
            bulbLight.intensity = 15;
            bulbLight.power = 2*100;
            this._scene.add(bulbLight);
            this.stageLampRender.push(bulbLight);
        }

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

        // const geometry = new THREE.SphereGeometry(1, 32, 32);
        const geometry = new THREE.IcosahedronGeometry(1, 1);
        const material = new THREE.MeshPhysicalMaterial({
          color: 0xFFFFFF,
          roughness: 0.5,
          transmission: 1,
          thickness: 0.2,
          metalness: 0.5,

        });
      
        this.discoBall = new THREE.Mesh(geometry, material);

        this.discoBall.position.set(45,40,-45)
        this.discoBall.scale.set(4.0,4.0,4.0);
        this._scene.add(this.discoBall);

        const geometryDoor = new THREE.SphereGeometry(.5,32,32);
        const materialDoor = new THREE.MeshPhysicalMaterial({
            color: 0xFFFFFF,
            roughness: 1.0,
            // transmission: 1,
            opacity: 0.8,
            transparent: true,
            thickness: 0.8,
            metalness: 0.8,
            side: THREE.DoubleSide, 
        });
        
        const meshDoor = new THREE.Mesh(geometryDoor, materialDoor);

        meshDoor.position.set(10,0,10)
        meshDoor.scale.set(420.0,420.0,420.0);
        // this._scene.add(meshDoor);


        const geometryWall = new THREE.BoxGeometry(3,80,245);
        const materialWall = new THREE.MeshPhysicalMaterial({
            color: 0xBDBCEA,
            roughness: 0.6,
            // transmission: 1,
            opacity: 0.6,
            transparent: true,
            thickness: 0.5,
            metalness: 0.6,
            side: THREE.DoubleSide, 
        });
        
        const meshWall = new THREE.Mesh(geometryWall, materialWall);
        meshWall.rotation.y = 90 * Math.PI / 180;
        meshWall.position.set(10,0,10)
        meshWall.receiveShadow = true;
        meshWall.position.set(15, 35, 134);
        this._scene.add(meshWall);


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
        this._InitializeCannon();

        this._CreateCannonBox(8, 6, 8, 9, 8, 14); //Sofa kanan
        this._CreateCannonBox(8, 8, 8, 68, 10, 14); //Sofa kiri
        this._CreateCannonBox(13, 6, 8, 39, 8, 14); //Meja sofa
        this._CreateCannonBox(14, 6, 8, 39, 8, 37); //Sofa tengah
        this._CreateCannonBox(6, 8, 6, 16, 8, 41); //Meja sofa kanan
        this._CreateCannonBox(5, 10, 5, 62, 10, 40); //Meja sofa kiri
        
        this._CreateCannonBox(3, 8, 27, 93, 9, 25); //Meja panjang kiri
        this._CreateCannonBox(4, 8, 4, 100, 9, 41); //Kursi meja panjang 1
        this._CreateCannonBox(4, 8, 4, 102, 9, 21); //Kursi meja panjang 2
        this._CreateCannonBox(4, 8, 4, 101, 9, 5); //Kursi meja panjang 3

        this._CreateCannonBox(27, 8, 3, 90, 9, 76); //Meja tengah 1
        this._CreateCannonBox(4, 8, 4, 100, 9, 84); //Kursi meja tengah 1_1
        this._CreateCannonBox(4, 8, 4, 72, 9, 83); //Kursi meja tengah 1_2

        this._CreateCannonBox(27, 8, 3, 21, 9, 76); //Meja tengah 2
        this._CreateCannonBox(4, 8, 4, 38, 9, 79); //Kursi meja tengah 2_1
        this._CreateCannonBox(4, 8, 4, 22, 9, 84); //Kursi meja tengah 2_2
        this._CreateCannonBox(4, 8, 4, 6, 9, 82); //Kursi meja tengah 2_2

        this._CreateCannonBox(6, 15, 14, -100, 16, 80); //Fridge

        this._CreateCannonCircle(53, -88, 15, 14); //Bartender
        this._CreateCannonBox(3, 6, 3, -74, 7, 70); //Kursi bartender 1
        this._CreateCannonBox(3, 6, 3, -59, 7, 64.5); //Kursi bartender 2
        this._CreateCannonBox(3, 6, 3, -49, 7, 56); //Kursi bartender 3
        this._CreateCannonBox(3, 6, 3, -38.5, 7, 42); //Kursi bartender 4

        this._CreateCannonBox(11, 7, 6, -42, 9, -59); //Exit room table
        this._CreateCannonBox(9, 7, 3, -68, 9, -63); //Trash Bin
        this._CreateCannonBox(9, 10, 3, -94, 25, -63); //Hangar

        this._CreateCannonBox(19, 7, 11, -58, 9, -107.5); //Billiard table
        this._CreateCannonBox(8, 8, 8, -97, 10, -130); //Circle table
        this._CreateCannonBox(6, 10, 5, -14, 11, -133.5); //Billiard speaker

        this._CreateCannonBox(11, 14, 7, 108, 15, -39); //Speaker & Plant
        
        this._CreateCannonBox(50.5, 14, 35, 45.5, 15, -62); //Stage

        this._CreateCannonBox(1, 37, 90, 135, 37, 40) //Tembok pintu masuk
        this._CreateCannonBox(122, 40, 1, 15, 40, 132) //Tembok depan panggung
        this._CreateCannonBox(1, 37, 137, -108, 37, -4) //Tembok belakang bar
        this._CreateCannonBox(50, 37, 1, -60, 39, -143) //Tembok billiard room_1
        this._CreateCannonBox(1, 37, 38, -6, 39, -107) //Tembok billiard room_2
        this._CreateCannonBox(41, 37, 1, -68, 39, -67) //Tembok billiard room_3
        this._CreateCannonBox(6, 37, 7.5, -12, 39, -73) //Tembok billiard room_4
        this._CreateCannonBox(20, 37, 1, 115, 39, -50) //Tembok speaker stage
        
        // this._CreateCannonBox();
        // this._CreateCannonBox();
        // this._CreateCannonBox();
        
        this._LoadCoffeeShopModel();
        const Deg30 = Math.PI/6;
        const Deg45 = Math.PI/4;
        const Deg90 = Math.PI/2;
        const Deg120 = Math.PI*2/3;
        const Deg180 = Math.PI;
        
        // this._LoadNPCModel("Dancer_1.fbx",[35,0,-18],[0, Deg180, 0],.13, true,[5,9,3]);
        // this._LoadNPCModel("Dancer_2.fbx",[20,8,-60],[0,-Deg45, 0],.13, false);
        // this._LoadNPCModel("Dancer_3.fbx",[45,8,-60],[0, 0, 0],.13, false);
        // this._LoadNPCModel("Dancer_4.fbx",[4,20.5,-41],[0, Deg120, 0],.13, false);
        // this._LoadNPCModel("Dancer_5.fbx",[35,9.8,34],[0, Deg90, 0],.09, false);
        // this._LoadNPCModel("Drum_1.fbx",[68,8,-76],[0,-Deg30, 0],.13, false);
        // this._LoadNPCModel("idle_1.fbx",[-60,0,34],[0,Deg45, 0],.13, false);
        // this._LoadNPCModel("Sit_1.fbx",[-38,6.8,42],[0,-Deg30, 0],.06, true,[5,9,8]);
        // this._LoadNPCModel("Sit_2.fbx",[71,6,83],[0,-Deg120, 0],.12, false);
        // this._LoadNPCModel("Sit_3.fbx",[35,3,10],[0,Deg180, 0],.13, true,[5,9,8]);
        this._InitializeFreeView();
        // this._InitializeVideo();
        this._LoadAnimatedModel();
        this._RAF();
    }

    _LoadAnimatedModel() {
        const params = {
            camera: this._camera,
            scene: this._scene,
            world: this._world,
           
        };
        this._controls = new BasicCharacterController(params);
        console.log(this._controls)
        this._thirdPersonCamera = new ThirdPersonCamera({
            camera: this._camera,
            target: this._controls,
        });
        
    }

    _FreeView(){
        this._controls = new OrbitControls(this._camera, this._threejs.domElement);
        this._controls.enableDamping = true;
        this._controls.dampingFactor = 0.25; 
        this._controls.screenSpacePanning = false;

        console.log("Play")
    }

    _LoadNPCModel(file_path, pos, rot, scale, enablePhysics, physicsBox){
        const loader = new FBXLoader();
        loader.setPath('../resources/Dancer/');
        loader.load(file_path, (fbx) => {
            fbx.scale.setScalar(0.1);
            fbx.traverse(c => {
            c.castShadow = true;
        });
        
        var _target = fbx;
        this._scene.add(_target);
        _target.scale.setScalar(scale);
        _target.position.set(pos[0],pos[1],pos[2]);
        _target.receiveShadow = true
        _target.rotation.set(rot[0],rot[1],rot[2])
        const mixer = new THREE.AnimationMixer(fbx);
        this._mixers.push(mixer);
        
        const action = mixer.clipAction(fbx.animations[0]);
        action.play(); 
 
        // Physics
        if (enablePhysics){
            const npcModel = new CANNON.Vec3(physicsBox[0], physicsBox[1], physicsBox[2]);
            const npcShape = new CANNON.Box(npcModel);
            const npcBody = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC});
            npcBody.angularDamping = 1;
        
            npcBody.addShape(npcShape);
            // npcBody.position.set(-40, 10, -80);
            npcBody.position.set(pos[0], 10, pos[2])
            this._world.addBody(npcBody);
        }
              

        })
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
        // this.mesh = new THREE.Mesh(
        //     new THREE.BoxGeometry(3, 80, 245),
        //     new THREE.MeshPhongMaterial({ color: 0xBDBCEA })
        // );

        // this.mesh.receiveShadow = true;
        // this.mesh.castShadow = true;
        // this.mesh.rotation.y = 90 * Math.PI / 180;
        // this.mesh.position.set(15, 40, 133);
        // this._scene.add(this.mesh);

        // Roof
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(280, .3, 280),
            new THREE.MeshPhongMaterial({ color: 0xBDBCEA })
        );

        this.mesh.receiveShadow = true;
        this.mesh.castShadow = true;
        // this.mesh.rotation.y = 90 * Math.PI / 180;
        this.mesh.position.set(0, 75, -5);
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
        this._world.gravity.set(0, -100, 0);

        this._cannonDebugger = new CannonDebugger(this._scene, this._world, {
            onInit: (body, mesh) => {
                mesh.visible = false;
                document.addEventListener("keydown", (event) => {
                    if (event.key === "f") {
                        mesh.visible = !mesh.visible;
                    }
                });
            },
        });
    }

    _InitializeVideo(){
        this.video = true;
        this.vidPos = [130,25,-6];
        this.vidLook = [0,22,-15];
        this.zoomIn = true;
        this.zoomOut = false;
        this._camera.position.set(130,22,-6);
        var lookTo = new THREE.Vector3(0,22,-15);
        this._camera.lookAt(lookTo);
        this.deggree = Math.PI*2;
        this.playerLoaded = false;
        // this.vidPos = [80,20,-6];
        // this.vidLook = [-38,6.8,42];
        
    }

    _UpdateVideo(timeElapsedS){
        var loading = 45;
        var starter = 0;
        var animationTime = starter + this._previousRAF * 0.001 - loading;

        // console.log(animationTime);
       
       
    //    DEBUGGING

       
    
        // this._camera.updateProjectionMatrix();

        // var lookTo = new THREE.Vector3(this.vidLook[0],this.vidLook[1],this.vidLook[2]);
        // this._camera.position.set(this.vidPos[0],this.vidPos[1],this.vidPos[2]);
        // this._camera.lookAt(lookTo);

    //  DEBUGGING

        if(this._previousRAF * 0.001 <= loading){
            
        }else if(animationTime <= 4.5){
        this.vidPos[0] = this.vidPos[0] - timeElapsedS*15
        this._camera.position.set(this.vidPos[0],this.vidPos[1],this.vidPos[2]);
        
        }else if(animationTime <= 10){
        this.vidLook[2] -= timeElapsedS*30;
        var lookTo = new THREE.Vector3(this.vidLook[0],this.vidLook[1],this.vidLook[2]);
        this._camera.lookAt(lookTo);
        }else if (animationTime <= 12){
    
        }else if (animationTime <= 16){
        this.vidPos = [5,45,-40];
        this.vidLook = [80,0,-80];
        var lookTo = new THREE.Vector3(this.vidLook[0],this.vidLook[1],this.vidLook[2]);

        this._camera.position.set(this.vidPos[0],this.vidPos[1],this.vidPos[2]);
        this._camera.lookAt(lookTo);

        }else if (animationTime <= 22){
        this.vidPos = [44.5,30,10];
        this.vidLook = [44.5,28,-70];
        if(this.zoomOut){
            this._camera.zoom += timeElapsedS*5
                if(this._camera.zoom > 4){
                    this.zoomIn = true;
                    this.zoomOut = false;
                }
            }
        if(this.zoomIn){
            this._camera.zoom -= timeElapsedS*5
                if(this._camera.zoom < 1){
                    this.zoomIn = false;
                    this.zoomOut = true;
                }
            }
        this._camera.updateProjectionMatrix();
        var lookTo = new THREE.Vector3(this.vidLook[0],this.vidLook[1],this.vidLook[2]);
    
        this._camera.position.set(this.vidPos[0],this.vidPos[1],this.vidPos[2]);
        this._camera.lookAt(lookTo);
    
        }else if (animationTime <= 23){
        this.vidPos = [80,45,-85];
        this.vidLook = [68,21,-76];
        this._camera.zoom = 1;
        var lookTo = new THREE.Vector3(this.vidLook[0],this.vidLook[1],this.vidLook[2]);
        
        this._camera.position.set(this.vidPos[0],this.vidPos[1],this.vidPos[2]);
        this._camera.lookAt(lookTo);
        
        }else if (animationTime <= 28){
            this._camera.zoom = 1;
            this.vidPos[2] += (Math.PI* timeElapsedS)*4
            var lookTo = new THREE.Vector3(this.vidLook[0],this.vidLook[1],this.vidLook[2]);
                
            this._camera.position.set(this.vidPos[0],this.vidPos[1],this.vidPos[2]);
            this._camera.lookAt(lookTo);
            
        }else if (animationTime <= 39){
            this._camera.zoom = 1;
            this.vidPos = [45,40, -25];
            this.vidLook = [6,18,-57];

            this.deggree -= (timeElapsedS*3/360);
            this._camera.up.applyAxisAngle(new THREE.Vector3(0, 0, 1), this.deggree);

            var lookTo = new THREE.Vector3(this.vidLook[0],this.vidLook[1],this.vidLook[2]);
            this._camera.position.set(this.vidPos[0],this.vidPos[1],this.vidPos[2]);
            this._camera.lookAt(lookTo);
                    
        }else if (animationTime <= 40){
            this.vidPos = [80,20,-20];
            this.vidLook = [35,14,10];
    
            this._camera.up.set(0, 1, 0);

            var lookTo = new THREE.Vector3(this.vidLook[2],this.vidLook[1],this.vidLook[0]);
            this._camera.position.set(this.vidPos[0],this.vidPos[1],this.vidPos[2]);
            this._camera.lookAt(lookTo);
                    
        }else if (animationTime <= 43){
            this.vidPos[0] -= timeElapsedS*16
            this.vidPos[2] -= timeElapsedS*4

            var lookTo = new THREE.Vector3(this.vidLook[0],this.vidLook[1],this.vidLook[2]);
            this._camera.position.set(this.vidPos[0],this.vidPos[1],this.vidPos[2]);
            this._camera.lookAt(lookTo);
                    
        }else if (animationTime <= 48){
            this.vidLook = [35,14,34];
            this.vidPos[1] += timeElapsedS*8
            this.vidPos[2] += timeElapsedS*16
            
            var lookTo = new THREE.Vector3(this.vidLook[0],this.vidLook[1],this.vidLook[2]);
            this._camera.position.set(this.vidPos[0],this.vidPos[1],this.vidPos[2]);
            this._camera.lookAt(lookTo);
                    
        }
        else if (animationTime <= 54){
            this.vidPos[1] -= timeElapsedS*8
            this.vidPos[0] += timeElapsedS*8

            if(this.vidLook[0] <= 71){
                this.vidLook[0] += timeElapsedS*20;
            }
            if(this.vidLook[1] <= 22){
                this.vidLook[1] += timeElapsedS*20;
            }
            if(this.vidLook[2] <= 83){
                this.vidLook[2] += timeElapsedS*20;
            }

            var lookTo = new THREE.Vector3(this.vidLook[0],this.vidLook[1],this.vidLook[2]);
            this._camera.position.set(this.vidPos[0],this.vidPos[1],this.vidPos[2]);
            this._camera.lookAt(lookTo);
            
        }else if (animationTime <= 56){
            // this.vidLook = [-45,10,39];
            if(this.vidLook[0] >= -49){
                this.vidLook[0] -= timeElapsedS*100;
            }
            if(this.vidLook[1] >= 9){
                this.vidLook[1] -= timeElapsedS*40;
            }
            if(this.vidLook[2] >= 35){
                this.vidLook[2] -= timeElapsedS*100;
            }


            var lookTo = new THREE.Vector3(this.vidLook[0],this.vidLook[1],this.vidLook[2]);
            this._camera.position.set(this.vidPos[0],this.vidPos[1],this.vidPos[2]);
            this._camera.lookAt(lookTo);
                    
        }else if (animationTime <= 60){
            console.log(this.vidLook);
            this.vidPos[1] += timeElapsedS*5
            this.vidPos[0] -= timeElapsedS*32
            this.vidPos[2] += timeElapsedS*4
            var lookTo = new THREE.Vector3(this.vidLook[0],this.vidLook[1],this.vidLook[2]);
            this._camera.position.set(this.vidPos[0],this.vidPos[1],this.vidPos[2]);
            this._camera.lookAt(lookTo);
                    
        }else if (animationTime <= 65){
                  
        }else if (animationTime <= 67){
            if(!this.playerLoaded){
                this._LoadAnimatedModel();
                this.playerLoaded = true;
                this.video = false;
            }                    
        }




    }

    _InitializeFreeView(){
        this.freeView = false;
        
        document.addEventListener("keydown", (event) => {
            if (event.key === "v") {
                
                this.freeView = !this.freeView;
                if(this.freeView){
                    this._FreeView();
                    
                }else{
                    this._LoadAnimatedModel();
                }

            }
        });
    }


    _CreateCannonBox(sizeX, sizeY, sizeZ, posX, posY, posZ) {
      const halfExtents = new CANNON.Vec3(sizeX, sizeY, sizeZ);
      const boxShape = new CANNON.Box(halfExtents);
      
      const boxBody = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC});
      boxBody.addShape(boxShape);
      boxBody.position.set(posX, posY, posZ);
      this._world.addBody(boxBody);
  }
  
    _CreateCannonCircle(radius, posX, posY, posZ) {
      const segments = 64;
      const cylinderShape = new CANNON.Cylinder(radius, radius, 0.1, segments);

      const cylinderBody = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC });
      cylinderBody.addShape(cylinderShape);
      cylinderBody.position.set(posX, posY, posZ);
    this._world.addBody(cylinderBody); // Menambahkan tubuh fisika ke dalam dunia simulasi
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


        if(this.video){
        this._UpdateVideo(timeElapsedS)
        }else if(!this.freeView){
        this._thirdPersonCamera.Update(timeElapsedS);
        this._controls.Update(timeElapsedS);
        }

        this._world.step(timeElapsedS);

        this._cannonDebugger.update();

        for(let i = 0 ; i < this.stageLampRender.length ; i++){
            let color = this.stageLampRender[i].color;
            color.offsetHSL(0.01, 0, 0);
            this.stageLampRender[i].color.set(color);
        }
        
        this.discoBall.rotation.x += 0.1;
        // this.discoBall.rotation.y += 0.1;
    }

    
}
