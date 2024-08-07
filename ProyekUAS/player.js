import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js"
import * as CANNON from "../resources/cannonjs/cannon-es.js";
import CannonDebugger from "../resources/cannonjs/cannon-es-debugger.js";

class BasicCharacterControllerProxy {
    constructor(animations) {
      this._animations = animations;
    }
  
    get animations() {
      return this._animations;
    }
  };
  
  
export class BasicCharacterController {
    constructor(params) {
      this._Init(params);
    }
  
    _Init(params) {
      this._params = params;
      this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
      this._acceleration = new THREE.Vector3(1, 0.25, 50.0);
      this._velocity = new THREE.Vector3(0, 0, 0);
      this._position = new THREE.Vector3();
  
      this._animations = {};
      this._input = new BasicCharacterControllerInput();
      this._stateMachine = new CharacterFSM(
          new BasicCharacterControllerProxy(this._animations));
  
      this._LoadModels();
    }
    _LoadModels() {
      const loader = new FBXLoader();
      loader.setPath('../resources/Clown/');
      loader.load('t-pose.fbx', (fbx) => {
        fbx.scale.setScalar(0.1);
        fbx.traverse(c => {
          c.castShadow = true;
        });
  
        this._target = fbx;
        this._params.scene.add(this._target);
  
        this._mixer = new THREE.AnimationMixer(this._target);
        
        this._manager = new THREE.LoadingManager();
        this._manager.onLoad = () => {
          this._stateMachine.SetState('idle');
        };
  
        // Physics
        const playerModel = new CANNON.Vec3(3, 9, 3);
        const playerShape = new CANNON.Box(playerModel);
        const playerBody = new CANNON.Body({ mass: 1000, type: CANNON.Body.DYNAMIC});
        playerBody.angularDamping = 1;

        playerBody.addShape(playerShape);
        // playerBody.position.set(-40, 10, -80);
        playerBody.position.set(0, 13, 0)
        
        this._params.world.addBody(playerBody);
        
        this._cannonBox = {
            mesh: fbx,
            body: playerBody,
        };


        const _OnLoad = (animName, anim) => {
          const clip = anim.animations[0];
          const action = this._mixer.clipAction(clip);
    
          this._animations[animName] = {
            clip: clip,
            action: action,
          };
        };
  
        const loader = new FBXLoader(this._manager);
        loader.setPath('../resources/Clown/');
        loader.load('walk.fbx', (a) => { _OnLoad('walk', a); });
        loader.load('idle.fbx', (a) => { _OnLoad('idle', a); });
        loader.load('dance.fbx', (a) => { _OnLoad('dance', a); });
      });
    }
  
    get Position() {
      return this._position;
    }
  
    get Rotation() {
      if (!this._target) {
        return new THREE.Quaternion();
      }
      return this._target.quaternion;
    }
  
    Update(timeInSeconds) {
      if (!this._stateMachine._currentState) {
          return;
      }
  
      this._stateMachine.Update(timeInSeconds, this._input);
  
      const velocity = this._velocity;
      const frameDecceleration = new THREE.Vector3(
          velocity.x * this._decceleration.x,
          velocity.y * this._decceleration.y,
          velocity.z * this._decceleration.z
      );
      frameDecceleration.multiplyScalar(timeInSeconds);
      frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
          Math.abs(frameDecceleration.z), Math.abs(velocity.z));
  
      velocity.add(frameDecceleration);
  
      const controlObject = this._cannonBox.body;
      const _Q = new THREE.Quaternion();
      const _A = new THREE.Vector3();
      const _R = controlObject.quaternion.clone();
  
      const acc = this._acceleration.clone();
  
      if (this._stateMachine._currentState.Name == 'dance') {
          acc.multiplyScalar(0.0);
      }
  
      if (this._input._keys.forward) {
          velocity.z += acc.z * timeInSeconds * 2;
      }
      if (this._input._keys.backward) {
          velocity.z -= acc.z * timeInSeconds * 2;
      }
      // if (this._input._keys.up) {
      //     _A.set(1, 0, 0);
      //     _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * timeInSeconds * this._acceleration.x);
      //     _R.mult(_Q, _R);
      // }
      // if (this._input._keys.down) {
      //     _A.set(1, 0, 0);
      //     _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this._acceleration.x);
      //     _R.mult(_Q, _R);
      // }
      if (this._input._keys.left) {
          _A.set(0, 1, 0);
          _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this._acceleration.y);
          _R.mult(_Q, _R);
      }
      if (this._input._keys.right) {
          _A.set(0, 1, 0);
          _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * timeInSeconds * this._acceleration.y);
          _R.mult(_Q, _R);
      }
      controlObject.quaternion.copy(_R);
  
      const oldPosition = new THREE.Vector3();
      oldPosition.copy(controlObject.position);
  
      const forward = new THREE.Vector3(0, 0, 1);
      forward.applyQuaternion(controlObject.quaternion);
      forward.normalize();
  
      const sideways = new THREE.Vector3(1, 0, 0);
      sideways.applyQuaternion(controlObject.quaternion);
      sideways.normalize();
  
      const vertical = new THREE.Vector3(0, 1, 0);
      vertical.applyQuaternion(controlObject.quaternion);
      vertical.normalize();

      vertical.multiplyScalar(velocity.y * timeInSeconds);
      sideways.multiplyScalar(velocity.x * timeInSeconds);
      forward.multiplyScalar(velocity.z * timeInSeconds);
  
      controlObject.position.x += forward.x + sideways.x;
      controlObject.position.y += forward.y + sideways.y;
      controlObject.position.z += forward.z + sideways.z;
  
      const cannonPosition = controlObject.position;
  
      this._position.copy(controlObject.position);
      if (this._cannonBox) {
          this._cannonBox.body.position.copy(cannonPosition);
          this._cannonBox.body.quaternion.copy(controlObject.quaternion);
          const objPosition = {x : controlObject.position.x, y: 0, z: controlObject.position.z};
          this._position.copy(objPosition);
          this._cannonBox.mesh.position.copy(objPosition);
          this._cannonBox.mesh.quaternion.copy(controlObject.quaternion);
      }
  
  
      if (this._mixer) {
          this._mixer.update(timeInSeconds);
      }
  }
  
  };
  
  class BasicCharacterControllerInput {
    constructor() {
      this._Init();    
    }
  
    _Init() {
      this._keys = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        space: false,
        up: false,
        down: false
      };
      document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
      document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
    }
  
    _onKeyDown(event) {
      switch (event.keyCode) {
        case 87: // w
          this._keys.forward = true;
          break;
        case 65: // a
          this._keys.left = true;
          break;
        case 83: // s
          this._keys.backward = true;
          break;
        case 68: // d
          this._keys.right = true;
          break;
        case 32: // SPACE
          this._keys.space = true;
          break;
        case 69: // E
          this._keys.up = true;
          break;
        case 81: // Q
          this._keys.down = true;
          break;
      }
    }
  
    _onKeyUp(event) {
      switch(event.keyCode) {
        case 87: // w
          this._keys.forward = false;
          break;
        case 65: // a
          this._keys.left = false;
          break;
        case 83: // s
          this._keys.backward = false;
          break;
        case 68: // d
          this._keys.right = false;
          break;
        case 32: // SPACE
          this._keys.space = false;
          break;
        case 69: // E
          this._keys.up = false;
          break;
        case 81: // Q
          this._keys.down = false;
          break;

      }
    }
  };
  
  
export class FiniteStateMachine {
    constructor() {
      this._states = {};
      this._currentState = null;
    }
  
    _AddState(name, type) {
      this._states[name] = type;
    }
  
    SetState(name) {
      const prevState = this._currentState;
      
      if (prevState) {
        if (prevState.Name == name) {
          return;
        }
        prevState.Exit();
      }
  
      const state = new this._states[name](this);
  
      this._currentState = state;
      state.Enter(prevState);
    }
  
    Update(timeElapsed, input) {
      if (this._currentState) {
        this._currentState.Update(timeElapsed, input);
      }
    }
  };
  
  
  class CharacterFSM extends FiniteStateMachine {
    constructor(proxy) {
      super();
      this._proxy = proxy;
      this._Init();
    }
  
    _Init() {
      this._AddState('idle', IdleState);
      this._AddState('walk', WalkState);
      this._AddState('dance', DanceState);
    }
  };
  
  
  class State {
    constructor(parent) {
      this._parent = parent;
    }
  
    Enter() {}
    Exit() {}
    Update() {}
  };
  
  
  class DanceState extends State {
    constructor(parent) {
      super(parent);
  
      this._FinishedCallback = () => {
        this._Finished();
      }
    }
  
    get Name() {
      return 'dance';
    }
  
    Enter(prevState) {
      const curAction = this._parent._proxy._animations['dance'].action;
      const mixer = curAction.getMixer();
      mixer.addEventListener('finished', this._FinishedCallback);
  
      if (prevState) {
        const prevAction = this._parent._proxy._animations[prevState.Name].action;
  
        curAction.reset();  
        curAction.setLoop(THREE.LoopOnce, 1);
        curAction.clampWhenFinished = true;
        curAction.crossFadeFrom(prevAction, 0.2, true);
        curAction.play();
      } else {
        curAction.play();
      }
    }
  
    _Finished() {
      this._Cleanup();
      this._parent.SetState('idle');
    }
  
    _Cleanup() {
      const action = this._parent._proxy._animations['dance'].action;
      
      action.getMixer().removeEventListener('finished', this._CleanupCallback);
    }
  
    Exit() {
      this._Cleanup();
    }
  
    Update(_) {
    }
  };
  
  
  class WalkState extends State {
    constructor(parent) {
      super(parent);
    }
  
    get Name() {
      return 'walk';
    }
  
    Enter(prevState) {
      const curAction = this._parent._proxy._animations['walk'].action;
      if (prevState) {
        const prevAction = this._parent._proxy._animations[prevState.Name].action;
  
        curAction.enabled = true;
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
    
        curAction.crossFadeFrom(prevAction, 0.5, true);
        curAction.play();
      } else {
        curAction.play();
      }
    }
  
    Exit() {
    }
  
    Update(timeElapsed, input) {
      if (input._keys.forward || input._keys.backward) {
        return;
      }
  
      this._parent.SetState('idle');
    }
  };
  
  
  
  class IdleState extends State {
    constructor(parent) {
      super(parent);
    }
  
    get Name() {
      return 'idle';
    }
  
    Enter(prevState) {
      const idleAction = this._parent._proxy._animations['idle'].action;
      if (prevState) {
        const prevAction = this._parent._proxy._animations[prevState.Name].action;
        idleAction.time = 0.0;
        idleAction.enabled = true;
        idleAction.setEffectiveTimeScale(1.0);
        idleAction.setEffectiveWeight(1.0);
        idleAction.crossFadeFrom(prevAction, 0.5, true);
        idleAction.play();
      } else {
        idleAction.play();
      }
    }
  
    Exit() {
    }
  
    Update(_, input) {
      if (input._keys.forward || input._keys.backward) {
        this._parent.SetState('walk');
      } else if (input._keys.space) {
        this._parent.SetState('dance');
      }
    }
  };
  

export class ThirdPersonCamera {
    constructor(params) {
      this._params = params;
      this._camera = params.camera;
  
      this._currentPosition = new THREE.Vector3();
      this._currentLookat = new THREE.Vector3();
    }
  
    _CalculateIdealOffset() {
      const idealOffset = new THREE.Vector3(-15, 25, -30);
      // const idealOffset = new THREE.Vector3(-15, 200, -200);
      idealOffset.applyQuaternion(this._params.target.Rotation);
      idealOffset.add(this._params.target.Position);
      return idealOffset;
    }
  
    _CalculateIdealLookat() {
      const idealLookat = new THREE.Vector3(0, 5, 50);
      idealLookat.applyQuaternion(this._params.target.Rotation);
      idealLookat.add(this._params.target.Position);
      // console.log(idealLookat)
      return idealLookat;
    }
  
    Update(timeElapsed) {
      const idealOffset = this._CalculateIdealOffset();
      const idealLookat = this._CalculateIdealLookat();
  
      // const t = 0.05;
      // const t = 4.0 * timeElapsed;
      const t = 1.0 - Math.pow(0.001, timeElapsed);
  
      this._currentPosition.lerp(idealOffset, t);
      this._currentLookat.lerp(idealLookat, t);
  
      this._camera.position.copy(this._currentPosition);
      this._camera.lookAt(this._currentLookat);
    }
  }