import * as THREE from "three";

export class Player {
    constructor(camera, controller, scene) {
        this.camera = camera;
        this.controller = controller
        this.scene = scene;
        this.rotationVector = new THREE.Vector3();

        this.camera.setup(new THREE.Vector3(0, 0, 0), this.rotationVector);
        

        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshPhongMaterial({ color: 0xFF1111})
        );
        this.mesh.receiveShadow = true;
        this.mesh.castShadow = true;
        //this.mesh.position.set(0, 5, 0)
        this.scene.add(this.mesh)
    }

    update(dt) {
        var direction = new THREE.Vector3(0, 0 ,0);
        if(this.controller.key['forward']) {
            direction.x = 1;
        }
        if(this.controller.key['backward']) {
            direction.x = -1;
        }
        if(this.controller.key['left']) {
            direction.z = 1;
        }
        if(this.controller.key['right']) {
            direction.z = -1;
        }

        var dtMouse = this.controller.deltaMousePos
        dtMouse.x = dtMouse.x / Math.PI
        dtMouse.y = dtMouse.y / Math.PI
        this.rotationVector.y += dtMouse.x;
        this.rotationVector.z += dtMouse.y;

        this.mesh.position.add(direction.multiplyScalar(dt * 50));
        this.camera.setup(this.mesh.position, this.rotationVector);
    }
}

export class PlayerController {
    constructor() {
        this.key = {
            "forward": false,
            "backward": false,
            "left": false,
            "right": false
        };
        this.mousePos = new THREE.Vector2();
        this.mouseDown = false;
        this.deltaMousePos = new THREE.Vector2();

        document.addEventListener("keydown", (e) => this.onKeyDown(e), false);
        document.addEventListener("keyup", (e) => this.onKeyUp(e), false);

        document.addEventListener("mousemove", (e) => this.onMouseMove(e), false)
        document.addEventListener("mousedown", (e) => this.onMouseDown(e), false)
        document.addEventListener("mouseup", (e) => this.onMouseUp(e), false)
    }

    onMouseDown(event) {
        this.mouseDown = true

    }

    onMouseUp(event) {
        this.mouseDown = false
    }

    onMouseMove(event) {
        var currentMousePos = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 -1,
            -(event.clientY / window.innerHeight) * 2 +1
        )

        this.deltaMousePos.addVectors(currentMousePos, this.mousePos.multiplyScalar(-1))
        this.mousePos.copy(currentMousePos)
        console.log(this.deltaMousePos)
    }


    onKeyDown(event) {
        switch(event.key) {
            case "W":
            case "w": this.key["forward"] = true; break;
            case "S":
            case "s": this.key["backward"] = true; break;
            case "A":
            case "a": this.key["right"] = true; break;
            case "D":
            case "d": this.key["left"] = true; break;
        }
        console.log(event)
    }
    onKeyUp(event) {
        switch(event.key) {
            case "W":
            case "w": this.key["forward"] = false; break;
            case "S":
            case "s": this.key["backward"] = false; break;
            case "A":
            case "a": this.key["right"] = false; break;
            case "D":
            case "d": this.key["left"] = false; break;
        }
    }
}

export class ThirdPersonCamera {
    constructor(camera, positionOffset, targetOffSet) {
        this.camera = camera;
        this.positionOffset = positionOffset;
        this.targetOffSet = targetOffSet;
    }
    setup(target, angle){
        var temp = new THREE.Vector3();
        temp.copy(this.positionOffset)
        temp.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle.y)
        temp.applyAxisAngle(new THREE.Vector3(0, 0, 1), angle.z)
        temp.addVectors(target, temp)
        this.camera.position.copy(temp);

        temp = new THREE.Vector3();
        temp.addVectors(target, this.targetOffSet);
        this.camera.lookAt(temp);
    }
}