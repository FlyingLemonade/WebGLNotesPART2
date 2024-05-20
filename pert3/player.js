import * as THREE from "three";

export class Player {
  constructor(camera, controller, scene) {
    this.camera = camera;
    this.controller = controller;
    this.scene = scene;
    this.camera.setup(new THREE.Vector3(0, 0, 0));

    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshPhongMaterial({ color: 0xff1111 })
    );

    this.mesh.receiveShadow = true;
    this.mesh.castShadow = true;
    this.scene.add(this.mesh);
  }

  update(dt) {
    var direction = new THREE.Vector3(0, 0, 0);
    if(this.controller.keys['forward']){
        direction.x = 1
    }
    if(this.controller.keys['backward']){
        direction.x = -1
    }
    if(this.controller.keys['left']){
        direction.z = -1
    }
    if(this.controller.keys['right']){
        direction.z = 1
    }
    this.mesh.position.add(direction.multiplyScalar(dt * 10));
    // this.mesh.position.add(direction);
    this.camera.setup(this.mesh.position)
  }
}

export class PlayerController {
  constructor() {
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
    };

    document.addEventListener("keydown", (e) => this.onKeyDown(e), false);
    document.addEventListener("keyup", (e) => this.onKeyUp(e), false);
  }

  onKeyDown(event) {
    switch (event.key) {
      case "W":
      case "w":
        this.keys["forward"] = true;
        break;
      case "A":
      case "a":
        this.keys["left"] = true;
        break;
      case "S":
      case "s":
        this.keys["backward"] = true;
        break;
      case "D":
      case "d":
        this.keys["right"] = true;
        break;
    }
    console.log(event);
  }

  onKeyUp(event) {
    switch (event.key) {
      case "W":
      case "w":
        this.keys["forward"] = false;
        break;
      case "A":
      case "a":
        this.keys["left"] = false;
        break;
      case "S":
      case "s":
        this.keys["backward"] = false;
        break;
      case "D":
      case "d":
        this.keys["right"] = false;
        break;
    }
  }
}

export class ThirdPersonCamera {
  constructor(camera, positionOffset, targetOffset) {
    this.camera = camera;
    this.positionOffset = positionOffset;
    this.targetOffset = targetOffset;
  }

  setup(target) {
    var temp = new THREE.Vector3();
    temp.addVectors(target, this.positionOffset);
    this.camera.position.copy(temp);
    temp = new THREE.Vector3();
    temp.addVectors(target, this.targetOffset);
    this.camera.lookAt(temp);
  }
}
