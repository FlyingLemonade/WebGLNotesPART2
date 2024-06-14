import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

export class Player {
  constructor(camera, controller, scene) {
    this.camera = camera;
    this.controller = controller;
    this.scene = scene;
    this.camera.setup(new THREE.Vector3(0, 0, 0));

    this.mixer = null; // Initialize mixer as null

    const loader = new FBXLoader();
    loader.load("../resources/Flair.fbx", (object) => {
      this.mixer = new THREE.AnimationMixer(object);

      // Ensure the object contains animations
      if (object.animations.length > 0) {
        const action = this.mixer.clipAction(object.animations[0]);
        action.play();
      } else {
        console.warn("No animations found in the FBX model.");
      }

      this.mesh = object;
      this.mesh.scale.set(0.01, 0.01, 0.01);
      this.mesh.position.set(-3, 0, 0);

      // Enable shadows for the model and its children
      this.mesh.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      this.scene.add(this.mesh);
    });

    // Ensure initial position setup
    this.mesh = new THREE.Object3D();
    this.mesh.position.set(0, 0.5, 0);
  }

  update(dt) {
    if (this.mixer) {
      this.mixer.update(dt);
    }

    if (!this.mesh) return;

    const direction = new THREE.Vector3(0, 0, 0);
    if (this.controller.keys["forward"]) {
      direction.x = 1;
    }
    if (this.controller.keys["backward"]) {
      direction.x = -1;
    }
    if (this.controller.keys["left"]) {
      direction.z = -1;
    }
    if (this.controller.keys["right"]) {
      direction.z = 1;
    }
    this.mesh.position.add(direction.multiplyScalar(dt * 10));
    this.camera.setup(this.mesh.position);
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
    const temp = new THREE.Vector3();
    temp.addVectors(target, this.positionOffset);
    this.camera.position.copy(temp);
    temp.addVectors(target, this.targetOffset);
    this.camera.lookAt(temp);
  }
}
