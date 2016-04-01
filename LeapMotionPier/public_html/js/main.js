


var index=0;
var previousFrame;

var pauseOnGrab = false;
var paused = false;
//coda circolare
var listFrame = [];
var max =20;
//testa e lung = 0 coda creata
var testa = 0; 
var lung = 0;

var pauseOnGesture = false;

var controllerOptions = {enableGestures: true};

var config = {
    titleHeight: 0,
    translateY: 200
};


$(document).ready(function() {
var container;
    var camera, controls, scene, renderer, pointVis,hands, help, record;
    var gesturePoints = [];
    init();
    animate();

    function init() {

        //camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 3, 2000);
        camera.position.fromArray([0, 50, 650]);
        camera.lookAt(new THREE.Vector3(0, 200, 600));

        $("#container").height(window.innerHeight - config.titleHeight);
        controls = new THREE.TrackballControls(camera, $("#container")[0]);

        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;

        controls.noZoom = false;
        controls.noPan = false;

        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;

        controls.keys = [65, 83, 68];

        controls.addEventListener('change', render);

        controls.handleResize();
        // world

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0xffffff);

        // lights

        light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1, 1, 1);
        scene.add(light);

        // renderer

        renderer = new THREE.WebGLRenderer({antialias: false});
        renderer.setClearColor(scene.fog.color, 1);
        renderer.setSize($("#container").width(), $("#container").height());

        container = document.getElementById('container');
        container.appendChild(renderer.domElement);


        /*var geometry = new THREE.PlaneGeometry(1000, 700);
         
         var material = new THREE.MeshBasicMaterial({color: 0xcccccc, side: THREE.DoubleSide, opacity: .4, transparent: true});
         var plane = new THREE.Mesh(geometry, material);
         plane.position.set(0, 0, 0);
         scene.add(plane);*/

        hands = new HandMesh();
        hands.onUpdate(render);
        hands.mesh().translateY(-config.translateY);
        scene.add(hands.mesh());

        pointVis = new THREE.Object3D();
        pointVis.translateY(-config.translateY);
        scene.add(pointVis);

        help = new THREE.Object3D();
        help.translateY(-config.translateY);
        scene.add(help);

        window.addEventListener('resize', onWindowResize, false);

        //
//        record = function(hand) {
//            hand.indexFinger.bones[3].nextJoint[2] < 0;
//        };
        render();

    }

    function animate() {

        requestAnimationFrame(animate);
        controls.update();

    }

    function render() {

        renderer.render(scene, camera);

    }
    
    function onWindowResize() {


        $("#container").height(window.innerHeight - config.titleHeight);
        renderer.setSize($("#container").width(), $("#container").height());

        camera.aspect = $("#container").width() / $("#container").height();
        camera.updateProjectionMatrix();


        controls.handleResize();

        render();

    }
     gestureSegment.render = this.renderer;
        gestureSegment.helpMesh = help;
       gestureSegment.camera = this.camera;
       gestureSegment.scene = this.scene;
        gestureSegment.config = config;
    
     //gestureSegment.requestAnimation();
    
    
    
    var term1 = new djestit.LeapStart(1);
    term1.type = "Start";
    term1.accepts = function(token) {
        return token.type && token.close >0.5;
    };
    
    
    var term2 = new djestit.LeapMove(1);
    term2.type = "Move" ;
    term2.accepts = function(token) {
        return token.type && token.close ===1;
        //token.palmPosition != term1.tok
    };
    
    var term3 = new djestit.LeapEnd(1);
    term3.type = "End" ;
    //term3.accepts = open ;
    term3.accepts = function(token) {
       
        return token.type && token.close <0.5;
    };
    
    // document.getElementById("up").textContent="gesto pan eseguito correttamente";
    var term4 = new djestit.LeapStart(1);
    var iterative2 =  new djestit.Iterative(term4);
    var iterative = new djestit.Iterative(term2);
    
    var disabling = new djestit.Disabling([iterative, term3]);

    var sequencePan = new djestit.Sequence ([term1, disabling]);
    

   
    
    var choice = new djestit.Choice([sequencePan]);
    
    var choiceiterative  = new djestit.Iterative([choice]);
    

   
    
    
    /* il campo accept contiene tutti i campi che servono per accettare il ground di riferimento */
    var pan = {
        sequence: [
            {gt: "leap.start", tid: 1 , accept:"close", close: "0.8",  closeOperator: ">" },
            {disabling: [
                    {gt: "leap.move", tid: 1, accept:"close", close: "0.8",  closeOperator: ">", iterative: true},
                    {gt: "leap.end", tid: 1,accept:"close", close: "0.5",  closeOperator: "<"}
                ]}
        ]

    };

   var input = {
        choice: [
            pan
        ],
        iterative: true
    };
   
    // cambia colore della mano verde
     djestit.onComplete(
            ":has(:root > .gt:val(\"leap.start\"))",
            pan,
            function(args) {
                console.log("line added " + args.token.palmPosition);
               // document.getElementById("up").textContent="gesto pan da completare"
                //currentLine = paintCanvas.addLine();
               var color = 0x52ce00;
                hands.updateHand(args.token.hand,color);
                    document.getElementById("up").textContent = "gesto pan da completare";
                    //hands.newHand(controller.hand,null);
               gestureSegment.requestAnimation(args.token.palmPosition);
               
               
                
            });
   
    djestit.onComplete(
            ":has(:root > .gt:val(\"leap.move\"))",
            pan,
            function(args) {                
                console.log("action move ");
                document.getElementById("up").textContent = "gesto pan da completare";
//gestureSegment.requestAnimation(args.token.palmPosition);

         });

    djestit.onError(
            ":has(:root > .gt:val(\"leap.move\"))",
            pan,
            function(args) {                
                console.log("action move error ");
                document.getElementById("up").textContent = "gesto pan sbagliato";
                 var color = 0xce1b2e;
                hands.updateHand(args.token.hand,color);


         });



    djestit.onComplete( ":has(:root > .gt:val(\"leap.end\"))",
            pan,
            function(args) {                
                    console.log("action end ");
                    document.getElementById("gesture").textContent = "gesto pan completato";
                var color = 0x65ff00;
                hands.updateHand(args.token.hand,color);
         });
     
          
  

  
    
 // var controller = Leap.loop({enableGestures:true}, function(frame){});
//gesture pan

    var controller = new Leap.Controller();


    var lsensor = new djestit.LeapSensor(controller, hands, input, 3);


  
    var previousFrame = null;

    var flag = false;

 

   
 
 
 });
