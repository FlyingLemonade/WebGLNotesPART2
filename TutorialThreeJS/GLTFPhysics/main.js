if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var initScene;
var MARGIN = 10;
var MARGINSIDE = 0;

var WIDTH = window.innerWidth || ( 2 + 2 * MARGINSIDE );
//var WIDTH = window.innerWidth/3 || ( 2 + 2 * MARGINSIDE );
//var HEIGHT = window.innerHeight/3 || ( 2 + 2 * MARGIN );
var HEIGHT = window.innerHeight || ( 2 + 2 * MARGIN );

var SCREEN_WIDTH = WIDTH -2 * MARGINSIDE;
var SCREEN_HEIGHT = HEIGHT -2 * MARGIN;

var FAR = 10000;
var DAY = 0;

var stats, camera, scene, renderer;

var mesh, geometry;

var sunLight, pointLight, ambientLight, hemiLight;

var parameters

var clock = new THREE.Clock();
var inRender = true;
var inResize = false;

// cannon physics
var world;
var worldScale = 100;
var timeStep = 1/60;
var walls=[], balls=[], ballMeshes=[], boxes=[], boxMeshes=[];
var solidMaterial;
var playerMaterialPhy;

var playerRigid;
var playerPhysicsMesh;

var UNITSIZE = 250
var WALLHEIGHT = UNITSIZE / 3;

var map = [ // 1  2  3  4  5  6  7  8  9
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,], // 0
           [1, 1, 0, 0, 0, 0, 0, 1, 1, 1,], // 1
           [1, 1, 0, 0, 2, 0, 0, 0, 0, 1,], // 2
           [1, 0, 0, 1, 0, 2, 0, 0, 0, 1,], // 3
           [1, 0, 0, 2, 0, 0, 2, 1, 0, 1,], // 4
           [1, 0, 0, 0, 2, 0, 0, 0, 0, 1,], // 5
           [1, 1, 1, 0, 0, 0, 0, 0, 1, 1,], // 6
           [1, 1, 1, 0, 0, 0, 0, 0, 1, 1,], // 7
           [1, 1, 1, 1, 1, 1, 0, 0, 1, 1,], // 8
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,], // 9
           ], mapW = map.length, mapH = map[0].length;

// player
var loader;
var player;
var playerMaterial;
var playerMap = { map:undefined, normal:undefined};
var players=[];
var playerName = "LegoElvis";
var scaleFactor = 5;
var velocity = {x : 0, z : 0};

var playerControls = {
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    bodyOrientation: 0,
    maxSpeed: 275,
    maxReverseSpeed: -275,
    frontAcceleration: 600,
    backAcceleration: 600,
    frontDecceleration: 600,
    angularSpeed: 2.5,
    speed: 0
};

var shadowConfig = {
    Visible: false,
    Near: 750,
    Far: 4000,
    Fov: 75,
    Bias: -0.0002,
    Darkness: 0.5,
    Resolution:1024
};

var playerConfig = {
    name: "",
    loading: 0,
    scale: 1,
    CloneNumber: 30,
    Clone: false
};

var LightConfig = {
    Ambient: 0x554b3b,
    Fog : 0x00283f          
};

var MaterialConfig = {      
    shininess : 0,
    specular: 1,
    normalScaleX: 0,
    normalScaleY: 0,
    bias:0,
    bumpScale: 2,
    metal:false
};

var sky;
var skyCubeNight, skyCubeDay;
var skyShader;

initScene = function () {
    // RENDERER
    renderer = new THREE.WebGLRenderer( { clearColor: LightConfig.Fog, clearAlpha: 1, antialias: true } );
    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    renderer.setClearColor( LightConfig.Fog, 1 );

    renderer.domElement.style.position = "absolute";
    document.getElementById( 'viewport' ).appendChild( renderer.domElement );

    renderer.shadowMapEnabled = true;
    renderer.shadowMapType = THREE.PCFSoftShadowMap;

    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.physicallyBasedShading = true;

    // SCENE
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( LightConfig.Fog , 1000, FAR );

    // CAMERA
    camera = new THREE.PerspectiveCamera( 45, SCREEN_WIDTH / SCREEN_HEIGHT, 2, FAR );
    camera.position.set( 50, 300, 350 );

    // CAMERA CONTROL
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.center.set( 0, 0, 0 );
    controls.keys = [];
    controls.maxPolarAngle = toRad(90);
    controls.userRotateSpeed = 1.8;
    controls.zoomSpeed = 1.6;
    controls.userPanSpeed = 0.8;

    // GROUND
    var mapGround = THREE.ImageUtils.loadTexture( "images/legoElvis.jpg" );
    mapGround.anisotropy = renderer.getMaxAnisotropy();
    mapGround.repeat.set( 100, 100 );
    mapGround.wrapS = mapGround.wrapT = THREE.RepeatWrapping;
    mapGround.magFilter = THREE.NearestFilter;
    mapGround.format = THREE.RGBFormat;

    var groundMaterial = new THREE.MeshPhongMaterial( { shininess: 10, ambient: 0x444444, color: 0xffffff, specular: 0xffffff, map: mapGround, metal: false } );
    var planeGeometry = new THREE.PlaneGeometry( 100, 100 );
    var ground = new THREE.Mesh( planeGeometry, groundMaterial );
    ground.position.set( 0, 0, 0 );
    ground.rotation.x = - Math.PI / 2;
    ground.scale.set( 1000, 1000, 1000 );
    ground.receiveShadow = true;
    scene.add( ground );

    initLights();

    initPhysics();

    loadSea3dModel();

    stats = new Stats();
    document.getElementById('my-stat').appendChild(stats.domElement);

    // LISTENERS
    window.addEventListener( 'resize', onWindowResize, false );
    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );

    // TWEEN
    parameters = { control: 0 };

    animate();
}

//-----------------------------------------------------
//  LIGHT
//-----------------------------------------------------

function initLights() {


        var sunIntensity = 0.8;
        var pointIntensity = 0.3;
        var pointColor = 0xffffff;
        var skyIntensity = 1;


    ambientLight = new THREE.AmbientLight( LightConfig.Ambient );
    scene.add( ambientLight );

    hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
    hemiLight.color.setHSL( 0.63, 0.05, 0 );
    hemiLight.groundColor.setHex( 0xe4c8a0 );
    hemiLight.position.set( 0, 400, 0 );
    scene.add( hemiLight );

    pointLight = new THREE.PointLight( LightConfig.Moon, pointIntensity, 5000 );
    pointLight.position.set( -1000, 0, -1000 );
    scene.add( pointLight );

    sunLight = new THREE.SpotLight( LightConfig.Sun, sunIntensity, 0, Math.PI/2, 1 );
    sunLight.position.set( 1000, 2000, 1000 );

    sunLight.castShadow = true;
    sunLight.shadowCameraVisible = shadowConfig.Visible;
    sunLight.shadowCameraNear = shadowConfig.Near;
    sunLight.shadowCameraFar = shadowConfig.Far;
    sunLight.shadowCameraFov = shadowConfig.Fov;
    sunLight.shadowBias = shadowConfig.Bias;
    sunLight.shadowDarkness = shadowConfig.Darkness * sunIntensity;

    sunLight.shadowMapWidth = shadowConfig.Resolution;
    sunLight.shadowMapHeight = shadowConfig.Resolution;


    scene.add( sunLight );



}






function enableCascadeShadow() {
    renderer.shadowMapCascade = true;
    sunLight.shadowCascade = true;
    sunLight.shadowCascadeCount = 3;
    sunLight.shadowCascadeNearZ = [ -1.000, 0.995, 0.998 ];
    sunLight.shadowCascadeFarZ  = [  0.995, 0.998, 1.000 ];
    sunLight.shadowCascadeWidth = [ shadowConfig.Resolution, shadowConfig.Resolution, shadowConfig.Resolution ];
    sunLight.shadowCascadeHeight = [ shadowConfig.Resolution, shadowConfig.Resolution, shadowConfig.Resolution ];
}


//-----------------------------------------------------
//  RESIZE
//-----------------------------------------------------

function onWindowResize( event ) {

    inResize = true;
    //document.getElementById("viewport").style.background = '#222222';

    SCREEN_WIDTH = window.innerWidth - 2 * MARGINSIDE;
    SCREEN_HEIGHT = window.innerHeight - 2 * MARGIN;

    camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.updateProjectionMatrix();

    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

}

//-----------------------------------------------------
//  KEYBOARD
//-----------------------------------------------------

function onKeyDown ( event ) {

    switch ( event.keyCode ) {
        case 38: /*up*/
        case 87: /*W*/
        case 90: /*Z*/  playerControls.moveForward = true; break;

        case 40: /*down*/
        case 83: /*S*/   playerControls.moveBackward = true; break;

        case 37: /*left*/
        case 65: /*A*/
        case 81: /*Q*/    playerControls.moveLeft = true; break;

        case 39: /*right*/
        case 68: /*D*/    playerControls.moveRight = true; break;

    }

}

function onKeyUp ( event ) {

    switch( event.keyCode ) {
        case 38: /*up*/
        case 87: /*W*/ 
        case 90: /*Z*/  playerControls.moveForward = false; break;

        case 40: /*down*/
        case 83: /*S*/  playerControls.moveBackward = false; break;

        case 37: /*left*/
        case 65: /*A*/
        case 81: /*Q*/ playerControls.moveLeft = false; break;

        case 39: /*right*/
        case 68: /*D*/    playerControls.moveRight = false; break;

    }

};

//-----------------------------------------------------
//  SEA3D
//-----------------------------------------------------

function loadSea3dModel() {

    loader = new THREE.SEA3D( false );
    //loader.matrixAutoUpdate = true;
    //loader.invertCamera = true;

    loader.onComplete = function( e ) {
        player = loader.getMesh(playerName);
        player.play("idle");
        player.scale.set( playerConfig.scale*3, playerConfig.scale*3, -playerConfig.scale*3 );
        scene.add( player );
        creatPlayerPhysics();
    };

    //loader.load( 'folder/'+playerName+'.sea' );
    loader.load( 'models/legoElvis.sea' );

}

// PLAYER ANIMATION

function updatePlayer(delta) {

    if (playerControls.moveForward){
        if (player.currentAnimation.name == "idle") player.play("walk");
    } else if (playerControls.moveBackward){
        if (player.currentAnimation.name == "idle") player.play("walk");
    }
    else {
            if(player.currentAnimation.name == "walk") player.play("idle");
    }

    THREE.AnimationHandler.update( delta );
    updatePlayerMove(delta);

}

// PLAYER MOVE

function updatePlayerMove( delta ) {


    playerControls.maxReverseSpeed = -playerControls.maxSpeed;

    if ( playerControls.moveForward )  playerControls.speed = THREE.Math.clamp( playerControls.speed + delta * playerControls.frontAcceleration, playerControls.maxReverseSpeed, playerControls.maxSpeed );
    if ( playerControls.moveBackward ) playerControls.speed = THREE.Math.clamp( playerControls.speed - delta * playerControls.backAcceleration, playerControls.maxReverseSpeed, playerControls.maxSpeed );

    // orientation based on controls
    // (don't just stand while turning)
    var dir = 1;

    if ( playerControls.moveLeft ) {
        playerControls.bodyOrientation += delta * playerControls.angularSpeed;
        playerControls.speed = THREE.Math.clamp( playerControls.speed + dir * delta * playerControls.frontAcceleration, playerControls.maxReverseSpeed, playerControls.maxSpeed );
    }
    if ( playerControls.moveRight ) {
        playerControls.bodyOrientation -= delta * playerControls.angularSpeed;
        playerControls.speed = THREE.Math.clamp( playerControls.speed + dir * delta * playerControls.frontAcceleration, playerControls.maxReverseSpeed, playerControls.maxSpeed );
    }

    // speed decay
    if ( ! ( playerControls.moveForward || playerControls.moveBackward ) ) {
        if ( playerControls.speed > 0 ) {
            var k = exponentialEaseOut( playerControls.speed / playerControls.maxSpeed );
            playerControls.speed = THREE.Math.clamp( playerControls.speed - k * delta * playerControls.frontDecceleration, 0, playerControls.maxSpeed );
        } else {
            var k = exponentialEaseOut( playerControls.speed / playerControls.maxReverseSpeed );
            playerControls.speed = THREE.Math.clamp( playerControls.speed + k * delta * playerControls.backAcceleration, playerControls.maxReverseSpeed, 0 );
        }
    }

    // displacement
    var forwardDelta = playerControls.speed * delta;
    velocity.x = Math.sin( playerControls.bodyOrientation ) * forwardDelta;
    velocity.z = Math.cos( playerControls.bodyOrientation ) * forwardDelta;
    player.position.x += velocity.x;
    player.position.z += velocity.z;
    player.position.y = playerConfig.scale*scaleFactor;

    // steering
    player.rotation.y = playerControls.bodyOrientation;

    if(controls){
        //controls.target.set( player.position.x, player.position.y, player.position.z );
        camera.position.x += velocity.x;
        camera.position.z += velocity.z;
        controls.center.set( player.position.x, player.position.y, player.position.z );
    }

    if(playerRigid){
        //playerRigid.position.set(player.position.x, player.position.y+3, player.position.z ); 
        playerRigid.position.set(player.position.x, player.position.y+80, player.position.z+15 );
        playerRigid.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0),player.rotation.y);
    }
};

function exponentialEaseOut( k ) { return k === 1 ? 1 : - Math.pow( 2, - 10 * k ) + 1; };

//-----------------------------------------------------
//  RENDER LOOP
//-----------------------------------------------------

function animate() {

    requestAnimationFrame( animate );

    if(inRender || inResize){
    //if(isPad)PadTest();
    //updateCamera();
    var delta = clock.getDelta();
    if(player!=null)updatePlayer(delta);
    updatePhysics();
    render();
    stats.update();
    }



    inResize = false;

}

function render() {

    TWEEN.update();
    controls.update();



    scene.fog.color.setHSL( 0.63, 0.05, parameters.control );
    renderer.setClearColor( scene.fog.color, 1 );

    pointLight.intensity = - parameters.control * 0.5 + 1;
    hemiLight.color.setHSL( 0.63, 0.05, parameters.control )

    sunLight.shadowDarkness = shadowConfig.Darkness * sunLight.intensity;

       renderer.render( scene, camera );
}

function tell(s){
    document.getElementById("debug").innerHTML = s;
}

//-----------------------------------------------------
//  PHYSICS
//-----------------------------------------------------

function initPhysics() {

    world = new CANNON.World();


    world.quatNormalizeSkip = 0;
    world.quatNormalizeFast = false;
    var solver = new CANNON.GSSolver();

    world.defaultContactMaterial.contactEquationStiffness = 1e9;
    world.defaultContactMaterial.contactEquationRegularizationTime = 4;

    solver.iterations = 3;
    solver.tolerance = 0.1;

    world.gravity.set(0,-9.82*worldScale,0);//world.gravity.set(0,-9.82,0); // m/sÂ²
    world.broadphase = new CANNON.NaiveBroadphase();

    // Create a slippery material (friction coefficient = 0.0)
    physicsMaterial = new CANNON.Material("slipperyMaterial");
    solidMaterial = new CANNON.Material("solidMaterial");
    playerMaterialPhy = new CANNON.Material("playerMat");
    var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, 0.0, 0.3 );
    var playerContactMaterial = new CANNON.ContactMaterial(playerMaterialPhy, playerMaterialPhy, 0.0, 0.3 );
    var solidContactMaterial = new CANNON.ContactMaterial(solidMaterial, solidMaterial, 0.2, 0.6 );
    world.addContactMaterial(physicsContactMaterial);
    world.addContactMaterial(playerContactMaterial);
    world.addContactMaterial(solidContactMaterial);

    // Create infinie plane
    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.RigidBody(0,groundShape,physicsMaterial);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    world.add(groundBody);

    createBoxeObject();
    createBallObject();

}

function creatPlayerPhysics() {
    if(playerPhysicsMesh){
        scene.remove(playerPhysicsMesh);
        playerPhysicsMesh.geometry.dispose();
    }
    if(playerRigid)world.remove(playerRigid);



    //player body 
    var halfExtents = new CANNON.Vec3(0.5*worldScale,playerConfig.scale*80, 0.25*worldScale);
    var playerShape = new CANNON.Box(halfExtents);
    playerRigid = new CANNON.RigidBody(0,playerShape, playerMaterialPhy);
    world.add(playerRigid);
    playerRigid.linearDamping=0.01;
    playerRigid.angularDamping=0.01;

    var boxGeometry = new THREE.CubeGeometry(halfExtents.x*2,halfExtents.y*2,halfExtents.z*2);
    playerPhysicsMesh = new THREE.Mesh( boxGeometry );
    scene.add(playerPhysicsMesh);
    playerPhysicsMesh.useQuaternion = true;
    playerPhysicsMesh.castShadow = false;
    playerPhysicsMesh.receiveShadow = false;
    showPlayerPhysics();
}

function showPlayerPhysics() {
    //if(OptionConfig.ShowPlayerHitBox)playerPhysicsMesh.visible = true;
    //else playerPhysicsMesh.visible = true;
    playerPhysicsMesh.visible = true;
}

function createBallObject() {

    var s = worldScale;
    var mat = new THREE.MeshLambertMaterial( { color: 0xdddddd } );
    var radius;
    var mass = 4;
    var sphereShape;

    for(var i=0; i<5; i++){
        radius = (0.2+(Math.random()*0.8))*s;
        sphereShape = new CANNON.Sphere(radius);
        ballGeometry = new THREE.SphereGeometry(radius, 32, 32 );
        var sphereBody = new CANNON.RigidBody(mass,sphereShape,physicsMaterial);
        //sphereBody.linearDamping = 0.9;
        var x = ((Math.random()-0.5)*20)*s;
        var y = (1 + (Math.random()-0.5)*1)*s;
        var z = ((Math.random()-0.5)*20)*s;
        sphereBody.position.set(x,y,z); 
        sphereBody.linearDamping=0.03;
        sphereBody.angularDamping=0.03;
        world.add(sphereBody);
        var ballMesh = new THREE.Mesh( ballGeometry, mat );
        scene.add(ballMesh);
        ballMesh.useQuaternion = true;
        ballMesh.castShadow = true;
        ballMesh.receiveShadow = true;
        // add to array
        balls.push(sphereBody);
        ballMeshes.push(ballMesh);
    }
}

function createBoxeObject() {
    var s = worldScale;
    var material = new THREE.MeshLambertMaterial( { color: 0x222222 } );
    // Add boxes
    var sx, xy, xz;
    var halfExtents = new CANNON.Vec3(1*s,1*s,1*s);
    var boxShape = new CANNON.Box(halfExtents);
    var boxGeometry = new THREE.CubeGeometry(halfExtents.x*2,halfExtents.y*2,halfExtents.z*2);
    for(var i=0; i<5; i++){
        sx= 0.2+(Math.random()*0.8);
        sy= 0.2+(Math.random()*0.8);
        sz= 0.2+(Math.random()*0.8);
        halfExtents = new CANNON.Vec3(sx*s,sy*s,sz*s);
        boxShape = new CANNON.Box(halfExtents);
        boxGeometry = new THREE.CubeGeometry(halfExtents.x*2,halfExtents.y*2,halfExtents.z*2);

        var x = ((Math.random()-0.5)*20)*s;
        var y = (1 + (Math.random()-0.5)*1)*s;
        var z = ((Math.random()-0.5)*20)*s;
        var boxBody = new CANNON.RigidBody(9,boxShape, solidMaterial);
        var boxMesh = new THREE.Mesh( boxGeometry, material );
        world.add(boxBody);
        scene.add(boxMesh);
        boxBody.position.set(x,y,z);
        //boxMesh.position.set(x,y,z);
        boxBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,0,0),toRad(Math.random()*360));
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        boxMesh.useQuaternion = true;
        boxes.push(boxBody);
        boxMeshes.push(boxMesh);
    }




function createObstacle() {



    obstacleMesh = new THREE.CubeGeometry(150, 50, 50)
    obstacleMaterial = new THREE.MeshLambertMaterial( { color: 0x666666 } );
    obstacleObject = new THREE.Mesh(obstacleMesh, obstacleMaterial);
    obstacleObject.position.set(0, 26, 200);
        obstacleObject.castShadow = true;
        obstacleObject.receiveShadow = true;
    scene.add(obstacleObject);



}

createObstacle();       


function setupScene() {
    var units = mapW;


    // Geometry: walls
    var cube = new THREE.CubeGeometry(UNITSIZE, WALLHEIGHT, UNITSIZE);
    var materials = [
                     new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('images/legoElvisR.jpg')}), //wall 1
                     new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('images/legoElvisG.jpg')}), //wall 2
                     ];
    for (var i = 0; i < mapW; i++) {
        for (var j = 0, m = map[i].length; j < m; j++) {
            if (map[i][j]) {
                var wall = new THREE.Mesh(cube, materials[map[i][j]-1]);
                wall.position.x = (i - units/2) * UNITSIZE;
                wall.position.y = WALLHEIGHT/2;
                wall.position.z = (j - units/2) * UNITSIZE;
        wall.castShadow = true;
        wall.receiveShadow = true;
                scene.add(wall);
            }
        }
    }

}

        setupScene();


    // Add linked boxes
    var size = 0.5*s;
    var he = new CANNON.Vec3(size,size,size*0.1);
    var boxShape = new CANNON.Box(he);
    var mass = 0;
    var space = 0.1*size;
    var N=5, last;
    var boxGeometry = new THREE.CubeGeometry(he.x*2,he.y*2,he.z*2);
    for(var i=0; i<N; i++){
        var boxbody = new CANNON.RigidBody(mass,boxShape, solidMaterial);
        var boxMesh = new THREE.Mesh( boxGeometry, material );
        boxbody.position.set(5*s,((N-i)*(size*2+2*space) + size*2+space)-150,0);

        boxbody.linearDamping=0.01;
        boxbody.angularDamping=0.01;
        boxMesh.useQuaternion = true;
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        world.add(boxbody);
        scene.add(boxMesh);
        boxes.push(boxbody);
        boxMeshes.push(boxMesh);

        if(i!=0){
            // Connect this body to the last one
            var c1 = new CANNON.PointToPointConstraint(boxbody,new CANNON.Vec3(-size,size+space,0),last,new CANNON.Vec3(-size,-size-space,0));
            var c2 = new CANNON.PointToPointConstraint(boxbody,new CANNON.Vec3(size,size+space,0),last,new CANNON.Vec3(size,-size-space,0));
            world.addConstraint(c1);
            world.addConstraint(c2);
        } else {
            mass=0.3;
        }
        last = boxbody;
    }
}

function updatePhysics() {

   if(!world) return;
    world.step(timeStep);
    // update player mesh test
    if(playerRigid !== undefined){
        playerRigid.position.copy(playerPhysicsMesh.position);
        playerRigid.quaternion.copy(playerPhysicsMesh.quaternion);
    }
    // Update ball positions
    for(var i=0; i<balls.length; i++){
        balls[i].position.copy(ballMeshes[i].position);
        balls[i].quaternion.copy(ballMeshes[i].quaternion);
    }

    // Update box positions
    for(var i=0; i<boxes.length; i++){
        boxes[i].position.copy(boxMeshes[i].position);
        boxes[i].quaternion.copy(boxMeshes[i].quaternion);
    }

}

//-----------------------------------------------------
//  MATH
//-----------------------------------------------------

function toRad(Value) {
    return Value * Math.PI / 180;
}


window.onload = initScene;