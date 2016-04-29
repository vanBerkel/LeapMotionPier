


var index=0;
var previousFrame;

var pauseOnGrab = false;
var paused = false;

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
    
/*
    
    var term1 = new djestit.LeapStart(1);
    term1.type = "Start";
    term1.accepts = function(token) {
          if (token.type && token.close > 0.5){
            console.log("line added " + token.palmPosition);
            var color = 0x52ce00;
            hands.updateHand(token.hand,color);
            document.getElementById("up").textContent = "gesto pan da completare";
            gestureSegment.requestAnimation(token.palmPosition, "Start" , null,null);
            return true;
        }
        return false;
       
    };
    
    var term2 = new djestit.LeapMove(1);
    term2.type = "Move" ;
    term2.accepts = function(token) {
        
        if (token.type && token.close >0.5 ){
            console.log("action move ");
            document.getElementById("up").textContent = "gesto pan da completare";
            var old1 = token.sequence.start[1].palmPosition;
            var curr1 = token.sequence.getById(1, 1).palmPosition;
            gestureSegment.requestAnimation(token.palmPosition, "Move" , old1, curr1 );
            return true;
        }
        return false;
        
    };
    
    var term3 = new djestit.LeapEnd(1);
    term3.type = "End" ;
    term3.accepts = function(token) {
        if (token.type && token.close <0.5 && (Math.abs(token.palmPosition[0]) - Math.abs(curr.palmPosition[0]))> (20)){
                console.log("action end ");
                document.getElementById("gesture").textContent = "gesto pan X completato";
                var color = 0x65ff00;
                hands.updateHand(token.hand,color);
                return true;
        }
        return false;
    };
    

    var iterative = new djestit.Iterative(term2);
    
    var disabling = new djestit.Disabling([iterative, term3]);

    var sequencePan = new djestit.Sequence ([term1, disabling]);
    
    var choice = new djestit.Choice([sequencePan]);
    

    

   
    /*choice.onComplete = function(term1){
        if (term1.state === djestit.COMPLETE)
            console.log("onComplete");
        else 
            console.log("onError");

        
    };
            
      */     
    
    /* il campo accept contiene tutti i campi che servono per accettare il ground di riferimento */
    var panx = {
        sequence: [
            {gt: "leap.start", tid: 1 , accept:"close"},
            {disabling: [
                    {gt: "leap.move", tid: 1, accept:"close", iterative: true},
                    {gt: "leap.end", tid: 1,accept:"open;move", asse: "x"}
                ]}
        ]
    };
 var pany = {
        sequence: [
            {gt: "leap.start", tid: 1 , accept:"close" },
            {disabling: [
                    {gt: "leap.move", tid: 1, accept:"close", iterative: true},
                    {gt: "leap.end", tid: 1,accept:"open;move", asse: "y"}
                ]}
        ]

    };
    /*
     * 
     * @type type
     * 
     * possibile che la mano si sposti 
     * gestire con il movimento di polso e non sulla posizione del pollice
     * 
     */
    var thumbUp = {
        sequence: [
            {gt: "leap.start", tid: 1 , accept:"close;thumb", direction: "x" },
            {disabling: [
                    {gt: "leap.move", tid: 1, accept:"close;thumb", direction:"y", iterative: true},
                    {gt: "leap.end", tid: 1,accept:"close;thumb", direction: "y"}
                ]}
        ]

    };
    
    //stretching hand from a fist
    /*
     * 
     * @type type
     * 
     * la mano si dovrebbe aprire verso lo schermo e non verso il leap!!
     * possibile che la mano si sposti 
     */
    var stretchHand = {
        sequence: [
            {gt: "leap.start", tid: 1 , accept:"close" },
            {disabling: [
                    {gt: "leap.move", tid: 1, accept:"close", iterative: true},
                    {gt: "leap.end", tid: 1,accept:"open" }
                ]}
        ]

    };
    
    /*
     * 
     * @type type
     * circle identifica che si tratta di un gesto che contiene un cerchio
     * finger indentifica il dito interessato per la gesture
     * clockwise identifica se il cerchio dev'essere in senso orario o antiorario
     */
   var circleClockwise = {
       sequence: [
            {gt: "leap.start", tid: 1 , accept:"circle" , finger:"index"},
            {disabling: [
                    {gt: "leap.move", tid: 1, accept:"circle", iterative: true},
                    {gt: "leap.end", tid: 1,accept:"circle",clockwise:true  }
                ]}
        ]

    };
    
    /* 
     * si potrebbe anche omettere il groundTerm move e anche il groundTermStart
     * 
     * press indentifica che la mano si sposta in avanti
     * finger identifica il dito interessato che fara' la gesture
     * 
     * 
     * 
     */
    var pressingIndex = {
       sequence: [
            {gt: "leap.start", tid: 1 , accept:"press" , finger:"index"},
            {disabling: [
                    {gt: "leap.move", tid: 1, accept:"press", finger:"index", iterative: true},
                    {gt: "leap.end", tid: 1, accept:"press", finger:"index"}
                ]}
        ]

    };
    var pressingIndex = {
       sequence: [
            {gt: "leap.start", tid: 1 , accept:"press" , finger:"index"},
            {disabling: [
                    {gt: "leap.move", tid: 1, accept:"press", finger:"index", iterative: true},
                    {gt: "leap.end", tid: 1, accept:"press", finger:"index"}
                ]}
        ]

    };
    
    
    var handClap = {
       sequence: [
            {gt: "leap.start", tid: 1 , accept:"2hands;palm", palmZY:"up", separate : true},
            {disabling: [
                    {gt: "leap.move", tid: 1, accept:"2hands;palm", palmZY:"up", separate : true, iterative: true},
                    {gt: "leap.end", tid: 1, accept:"2hands;palm", palmZY:"up", separate: false}
                ]}
        ]

    };
    
    
    /*palm identifica la posizione della mano rispetto gli assi x ed y 
     * position: up, down, right, left, center, upright, upleft, downright,downleft 
     *          identifica in quale posizione si trova la mano rispetto al leap motion considerando solo altezza e left rigth
     *          ma non la profondita'
     * */
    var pullString = {
       sequence: [
            {gt: "leap.start", tid: 1 , accept:"close;position;palm", position:"up", palmXY:"up"},
            {disabling: [
                    {gt: "leap.move", tid: 1, accept:"close;palm", palmXY:"up", iterative: true},
                    {gt: "leap.end", tid: 1, accept:"close;move;palm", palmXY:"up", asse: "y", directionY: "updown"}
                ]}
        ]

    };
 /*Drawing a counterclockwise semicircle
  * punto inizio e fine corrispondono +-5 
  * 
  * samePosition controlla se il punto di inizio leap.start e leap.end si trovano nella stessa altezza
  */
    var semicircle = {
            sequence: [
            {gt: "leap.start", tid: 1 , accept:"close", position:"left"},
            {disabling: [
                    {gt: "leap.move", tid: 1, accept:"close", iterative: true},
                    {gt: "leap.end", tid: 1,end:"1", accept:"close;end90", asse: "y",  directionX:"downUp"}
                ]}, 
            {disabling: [
                        {gt: "leap.move", tid: 1, accept:"close", iterative: true},
                        {gt: "leap.end", tid: 1, end:"2", accept:"open;semicircle;samePosition", asse: "x",  directionX:"upDown", samePosition:"y"}
                ]}]

    };
    
    
    
    var semicircle2 ={sequence : [       
            {gt: "leap.start", tid: 2 , accept:"press;position", finger:"index", position:"center" },
            {disabling: [
                    {gt: "leap.move", tid: 2, accept:"", iterative: true},
                    {gt: "leap.end", tid: 2, accept:"move;", asse: "x;y", directionY: "updown", directionX:"leftright"}
                ]}]};
        
      /*
       * 
       * @type type
       * 
       * attenzione bastagirare la mano sia aperta che chiusa e funziona
       */
    var wristclockwise = {
       sequence: [
            {gt: "leap.start", tid: 1 , accept:"palm", palmXY:"normalDown" },
            {disabling: [
                    {gt: "leap.move", tid: 1, accept:"", iterative: true},
                    {gt: "leap.end", tid: 1, accept:"palm", palmXY:"normalUp"}
                ]}
        ]

    };
    
    
    var semicircle1 = {
        sequence : 
                [semicircle,semicircle2]};
    
   var input = {
        choice: [
            semicircle
            
        ],
        iterative: true
    };
   
    // cambia colore della mano verde
     djestit.onComplete(
            ":has(:root > .gt:val(\"leap.start\"))",
            panx,
            function(args) {
                console.log("line added " + args.token.palmPosition);

               var color = 0x52ce00;
                hands.updateHand(args.token.hand,color);
                document.getElementById("up").textContent = "direction " + args.direction;
               //gestureSegment.requestAnimation(args.token.palmPosition, "Start" , null,null);   
            });
    djestit.onComplete(
            ":has(:root > .gt:val(\"leap.start\"))",
            thumbUp,
            function(args) {
                var color = 0x52ce00;
                hands.updateHand(args.token.hand,color);
                
                    document.getElementById("up").textContent = "arm " + args.direction;
               //gestureSegment.requestAnimation(args.token.palmPosition, "Start" , null,null);   
            });
    djestit.onComplete(
            ":has(:root > .gt:val(\"leap.move\"))",
            panx,
            function(args) {                
                console.log("action move ");
                document.getElementById("up").textContent = "arm " + args.direction;
                 var old1 = args.token.sequence.start[1].palmPosition;
                 var curr1 = args.token.sequence.getById(1, 1).palmPosition;
                 gestureSegment.requestAnimation(args.token.palmPosition, "Move" , old1, curr1 );
                
         });
     


    djestit.onError(
            ":has(:root > .gt:val(\"leap.move\"))",
            panx,
            function(args) {                
                console.log("action move error ");
                document.getElementById("up").textContent = "gesto pan sbagliato";
                 var color = 0xce1b2e;
                hands.updateHand(args.token.hand,color);
         });



    djestit.onComplete( ":has(:root > .gt:val(\"leap.end\"))",
            panx,
            function(args) {                
                console.log("action end ");
                document.getElementById("gesture").textContent = "arm " + args.direction;
                var color = 0x65ff00;
                hands.updateHand(args.token.hand,color);
         });
    djestit.onComplete( ":has(:root > .gt:val(\"leap.end\"))",
            thumbUp,
            function(args) {                
                console.log("action end ");
                document.getElementById("gesture").textContent = "gesto pan thumb Up completato";
                var color = 0x65ff00;
                hands.updateHand(args.token.hand,color);
         });
    djestit.onComplete( ":has(:root > .gt:val(\"leap.end\"))",
            pany,
            function(args) {                
                console.log("action end ");
                document.getElementById("gesture").textContent = "gesto pan Y completato";
                var color = 0x65ff00;
                hands.updateHand(args.token.hand,color);
   });
   
   
   djestit.onComplete( ":has(:root > .gt:val(\"leap.end\"))",
            stretchHand,
            function(args) {                
                console.log("action end ");
                document.getElementById("gesture").textContent = "gesture Stretching the hand from fist complete";
                var color = 0x65ff00;
                hands.updateHand(args.token.hand,color);
   });
   
    djestit.onComplete( ":has(:root > .gt:val(\"leap.end\"))",
            circleClockwise,
            function(args) {                
                console.log("action end ");
                document.getElementById("gesture").textContent = "gesture circle clockwise with the index Finger complete";
                var color = 0x65ff00;
                hands.updateHand(args.token.hand,color);
   });
    
    djestit.onComplete( ":has(:root > .gt:val(\"leap.end\"))",
            pressingIndex,
            function(args) {                
                console.log("action end ");
                document.getElementById("gesture").textContent = "gesture pressing a Buttom with the index Finger complete";
                var color = 0x65ff00;
                hands.updateHand(args.token.hand,color);
   });
   
    djestit.onComplete( ":has(:root > .gt:val(\"leap.end\"))",
            handClap,
            function(args) {                
                console.log("action end ");
                document.getElementById("gesture").textContent = "gesture hand clap complete";
                var color = 0x65ff00;
                hands.updateHand(args.token.hand,color);
   });
         
    djestit.onComplete( ":has(:root > .gt:val(\"leap.end\"))",
            pullString,
            function(args) {                
                console.log("action end ");
                document.getElementById("gesture").textContent = "gesture pulling a string downward complete";
                var color = 0x65ff00;
                hands.updateHand(args.token.hand,color);
   });/*
       djestit.onComplete( ":has(:root > .gt:val(\"leap.start\"))",
            semicircle1,
            function(args) {                
                console.log("action end ");
                document.getElementById("gesture").textContent = "gesture start semicircle complete";
                var color = 0x65ff02;
                hands.updateHand(args.token.hand,color);
   });
    djestit.onComplete( ":has(:root > .gt:val(\"leap.end\"))",
            semicircle1,
            function(args) {                
                console.log("action end ");
                document.getElementById("gesture").textContent = "gesture semicircle complete";
                var color = 0x65ff00;
                hands.updateHand(args.token.hand,color);
   });
   /*
          djestit.onComplete( ":has(:root > .gt:val(\"leap.start\"))",
            semicircle2,
            function(args) {                
                console.log("action end ");
                document.getElementById("gesture").textContent = "gesture start semicircle 222complete";
                var color = 0x65ff02;
                hands.updateHand(args.token.hand,color);
   });
    djestit.onComplete( ":has(:root > .gt:val(\"leap.end\"))",
            semicircle1,
            function(args) {                
                console.log("action end ");
                document.getElementById("gesture").textContent = "gesture semicircle 22complete";
                var color = 0x65ff00;
                hands.updateHand(args.token.hand,color);});
            */
    djestit.onComplete( ":has(:root > .end:val(\"2\"))",
            semicircle,
            function(args) {                
                console.log("action end ");
                document.getElementById("gesture").textContent = "gesture semicircle complete";
                var color = 0x65ff00;
                hands.updateHand(args.token.hand,color);});    
    djestit.onComplete( ":has(:root > .gt:val(\"leap.end\") )",
            wristclockwise,
            function(args) {                
                console.log("action end ");
                document.getElementById("gesture").textContent = "gesture wristclockwise complete";
                var color = 0x65ff00;
                hands.updateHand(args.token.hand,color);});           
            
    var controller = new Leap.Controller({enableGesture: true});
    var lsensor = new djestit.LeapSensor(controller, hands, input, 3);

 

        
 

   
 
 
 });
