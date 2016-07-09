


/* global gestures */

var index=0;
var previousFrame;

var pauseOnGrab = false;
var paused = false;

//testa e lung = 0 coda creata
var testa = 0; 
var lung = 0;

var pauseOnGesture = false;



var config = {
    titleHeight: 0,
    translateY: 200
};


$(document).ready(function() {

    var GestureAux = {
        sequence: [
            {gt: "leap.start", accept:"finger" , finger:"index"},
            {disabling: [
                    {gt: "leap.move",  accept:"finger", finger:"index", 
                        iterative: true},
                    {gt: "leap.end", accept:"move;finger", move:"z", 
                        directionZ:"behindfront", finger:"index" , distance:2, 
                        tollerance:0.3}
                ]}
        ]
    };
    
 
    /* il campo accept contiene tutti i campi che servono per accettare il ground di riferimento 
     * close specifica che la mano dev essere chiusa
     * open specifica che la mano dev essere aperta
     * 
     * 
     * */
    var panx = {
        sequence: [
            {gt: "leap.start", tid: 1 , accept:"close"},
            {disabling: [
                    {gt: "leap.move", tid: 1, accept:"close", iterative: true},
                    {gt: "leap.end", tid: 1,accept:"move;open", move: "x", distance:3, directionX:"leftright", tollerance:0.3}
                ]}
        ]
    };
    var pany = {
        sequence: [
            {gt: "leap.start", tid: 1 , accept:"close" },
            {disabling: [
                    {gt: "leap.move", tid: 1, accept:"close", iterative: true},
                    {gt: "leap.end", tid: 1,accept:"open;move", move: "y", directionY:"downup"}
                ]}
        ]

    };
   
                                                      // console.log("pointable " +token.hand.fingers[0].extended);

            
            
   
   
    
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
            {gt: "leap.start" , accept:"close" },
            {disabling: [
                    {gt: "leap.move", accept:"close", iterative: true},
                    {gt: "leap.end",accept:"open" }
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
            {gt: "leap.start", accept:"circle" , finger:"index"},
            {disabling: [
                    {gt: "leap.move", accept:"circle", iterative: true},
                    {gt: "leap.end",accept:"circle",clockwise:true  }
                ]}
        ]
    };
    
    /* 
     *pressingIndex
     *
     * 
     * finger identifica il dito interessato che fara' la gesture
    */
    var pressingIndex = {
       sequence: [
            {gt: "leap.start", accept:"finger" , finger:"index"},
            {disabling: [
                    {gt: "leap.move",  accept:"finger", finger:"index", 
                        iterative: true},
                    {gt: "leap.end", accept:"move;finger", move:"z", 
                        directionZ:"behindfront", finger:"index" , distance:2, 
                        tollerance:0.3}
                ]}
        ]
    };

    /*
     * handClap 
     * @type type
     * 
     * specifica il battito delle mani
     * 
     * 2 hands identifica che si tratta di due mani
     *  separate identifica se le mani sono separate oppure no
     */
    
    var handClap = {
       sequence: [
            {gt: "leap.start", accept:"2hands;open", palmZY:"up", 
                separate : true},
            {disabling: [
                    {gt: "leap.move", accept:"2hands;open", palmZY:"up", 
                        separate : true, iterative: true},
                    {gt: "leap.end",  accept:"2hands", palmZY:"up", 
                        separate: false}
                ]}
        ]
    }; 
    /*palm identifica la posizione della mano rispetto gli assi x ed y 
     * location: up, down, right, left, center 
     *          identifica in quale posizione si trova la mano rispetto al leap motion considerando solo altezza e left rigth
     *          ma non la profondita'
     * */
    var pullString = {
       sequence: [
            {gt: "leap.start", accept:"close;location;palm", location:"up", 
                palmXY:"up"},
            {disabling: [
                    {gt: "leap.move",  accept:"close;palm", palmXY:"up", 
                        iterative: true},
                    {gt: "leap.end", accept:"close;move;palm", palmXY:"up", 
                        move: "y", directionY: "updown", distance: 3}
                ]}
        ]
    };
    
 /*Drawing a counterclockwise semicircle
  *  
  * 
  */
    var semicircle1 = {
            sequence: [
            {gt: "leap.start", accept:"finger" , finger:"index"},
            {disabling: [
                    {gt: "leap.move", accept:"finger" , finger:"index", 
                        iterative: true},
                    {gt: "leap.end", end:"1", accept:"finger;move", 
                        finger:"index", move: "y;x",  directionY:"downup", 
                        directionX:"leftright", distance:0}
                ]}, 
            {disabling: [
                    {gt: "leap.move", accept:"finger" , finger:"index", 
                        iterative: true},
                    {gt: "leap.end", end:"2", accept:"finger;newmove",                     //non è move ma new move
                        finger:"index", move: "y;x",  directionY:"updown", 
                        directionX:"leftright", distance:0}
                ]},  
                   {disabling: [
                        {gt: "leap.move", accept:"finger", finger:"index", 
                            iterative: true},
                        {gt: "leap.end", end:"3", accept:"finger;semicircle", 
                            finger:"index"}
                ]}]

    };
    
    
    var semicircle = {
            sequence: [
            {gt: "leap.start", accept:"finger" , finger:"index"},
            {disabling: [
                    {gt: "leap.move", accept:"finger" , finger:"index", 
                        iterative: true},
                    {gt: "leap.end", end:1, accept:"finger;move", 
                        finger:"index", move: "y;x",  directionY:"downup", 
                        directionX:"rightleft", distance:0}
                ]}, 
            {disabling: [
                    {gt: "leap.move", accept:"finger" , finger:"index", 
                        iterative: true},
                    {gt: "leap.end", end:2, accept:"finger;newmove",                     //non è move ma new move
                        finger:"index", move: "y;x",  directionY:"updown", 
                        directionX:"rightleft", distance:0}
                ]},  
            {disabling: [
                        {gt: "leap.move", accept:"finger", finger:"index", 
                            iterative: true},
                        {gt: "leap.end", end:3, accept:"finger;semicircle", 
                            finger:"index"}
                ]}]

    };
   
    var pressingButton = {
       sequence: [
            {gt: "leap.start", accept:"close;palm", palmXY:"normalDown"},
            {disabling: [
                    {gt: "leap.move", accept:"close;palm", palmXY:"normalDown", 
                        iterative: true},
                    {gt: "leap.end", accept:"close;palm;move", 
                        palmXY:"normalDown", move:"y", directionY:"updown", 
                        distance:3}
                ]}
        ]
    };

    var thumbUp  = {
       sequence: [
            {gt: "leap.start",  accept:"close;palm", palmXY:"up"},
            {disabling: [
                    {gt: "leap.move", accept:"close;palm", palmXY:"up", 
                        iterative: true},
                    {gt: "leap.end", accept:"palm;finger", palmXY:"up", 
                        finger:"thumb"}
                ]}
        ]
    };

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
   
    var fingerSnap  = {
       sequence: [
            {gt: "leap.start", tid: 1 , accept:"fingerUnion", 
                finger:"index;thumb", fingerUnion:"thumb-middle"},
            {disabling: [
                    {gt: "leap.move", tid: 1, accept:"palm", palmXY:"up", 
                        iterative: true},
                    {gt: "leap.end", tid: 1, accept:"finger;palm", palmXY:"up", 
                        finger:"index;thumb"}
                ]}
        ]
    };
    
    var gestures = {GestureAux, 
       panx,
       fingerSnap, 
       pressingIndex, 
       wristclockwise, 
       semicircle, 
       thumbUp,
       pullString,
       pressingButton,
       circleClockwise,
       handClap,
       stretchHand
   };
    //gestures.GestureAux;
    var elenco = [];
 
    /*for (var name in gestures) {
     elenco.push(gestures[name]);
   } */
    
    elenco.push(gestures.GestureAux);
    elenco.push(gestures.panx);
    //elenco.push(gestures.fingerSnap);
   

    
   var input = {
        choice: elenco
            //gestureAux,
            //panx, 
            //fingerSnap, 
            //pressingIndex, 
            //wristclockwise, 
            //semicircle, 
            //thumbUp,
            //pullString,
            //pressingButton,
            //circleClockwise,
            //handClap,
            //stretchHand
        ,
        iterative: true
    };
    
    //json expression
    jsonStart = ":has(:root > .gt:val(\"leap.start\"))";
    jsonEnd = ":has(:root > .gt:val(\"leap.end\"))";
    
    //change the color when the gesture is complete
    elenco.forEach(function (item){
            djestit.onComplete(jsonEnd, item,
                function() {   
                    lsensor.colorComplete();
                    var s="";
                    switch (item){
                        case gestures.GestureAux:
                            s+= "pressing index ";
                            break;
                        case gestures.panx:
                            s += "gesto pan X complete ";
                            break;
                        case gestures.fingerSnap:
                            s += "pressing index";
                            break;
                        case gestures.pressingIndex: 
                            s+= "pressing index2";
                            break;   
                       case gestures.wristclockwise:
                            s+= "pressing index";
                            break;
                        case gestures.thumbUp:
                             s += "pressing index2";
                            break;    
                        case gestures.pullString:
                             s += "pressing index2";
                            break;  
                        case gestures.pressingButton:
                            s += "pressing index2";
                            break;    
                        case gestures.handClap:
                             s += "pressing index2";
                            break;
                        case gestures.circleClockwise:
                             s += "pressing index2";
                            break;
                        case gestures.stretchHand:
                             s += "pressing index2";
                            break;
                        default:
                            s +="il gesto non e' stato aggiunto all'elenco";
                    }
                    //document.getElementById("gesture").="<br>";
                    document.getElementById("gesture").textContent +=s;
                });  
    });
    

    

    
    
    
/*

            
    djestit.onComplete( ":has(:root > .gt:val(\"leap.end\"))",
            panx,
            function(args) {                
                console.log("action end ");
                document.getElementById("gesture").textContent += "</br>";
               
         });
         
    djestit.onComplete( ":has(:root > .gt:val(\"leap.end\"))",
            thumbUp,
            function(args) {                
                console.log("action end ");
                document.getElementById("gesture").textContent += "</br>gesto pan thumb Up completato";
               
         });
         
    djestit.onComplete( ":has(:root > .gt:val(\"leap.end\"))",
            pany,
            function(args) {                
                console.log("action end ");
                document.getElementById("gesture").textContent += "</br>gesto pan Y completato";
               
   });
   
   
   djestit.onComplete( ":has(:root > .gt:val(\"leap.end\"))",
            stretchHand,
            function(args) {                
                console.log("action end ");
                document.getElementById("gesture").textContent += "</br>gesture Stretching the hand from fist complete";
                
   });
   
    djestit.onComplete( ":has(:root > .gt:val(\"leap.end\"))",
            circleClockwise,
            function(args) {                
                console.log("action end ");
                document.getElementById("gesture").textContent += "</br>gesture circle clockwise with the index Finger complete";
               
   });
    
    djestit.onComplete( ":has(:root > .gt:val(\"leap.end\"))",
            pressingIndex,
            function(args) {                
                console.log("action end ");
                document.getElementById("gesture").textContent += "</br>gesture pressing a Button with the index Finger complete";
   });
   
  
   
    djestit.onComplete( ":has(:root > .gt:val(\"leap.end\"))",
            handClap,
            function(args) {                
                console.log("action end ");
                document.getElementById("gesture").textContent += "</br>gesture hand clap complete";
               
   });
         
    djestit.onComplete( ":has(:root > .gt:val(\"leap.end\"))",
            pullString,
            function(args) {                
                console.log("action end ");
                document.getElementById("gesture").textContent += "</br>gesture pulling a string downward complete";
                
   });
   
   
       djestit.onComplete( ":has(:root > .gt:val(\"leap.end\"))",
            pressingButton,
            function(args) {                
                console.log("action end ");
                document.getElementById("gesture").textContent += "</br>gesture pressing button complete";
               
   });
          
    djestit.onComplete( ":has(:root > .gt:val(\"leap.end\"))",
            fingerSnap,
            function(args) {                
                console.log("action end ");
                document.getElementById("gesture").textContent += "</br>gesture finger Snap complete";
               
   });
   
   
       djestit.onComplete(
            ":has(:root > .gt:val(\"leap.start\"))",
            fingerSnap,
            function(args) {
                console.log("line added " + args.token.palmPosition);
              
            });
            
            
            
    djestit.onComplete( ":has(:root > .end:val(\"1\"))",
            semicircle,
            function(args) {                
               // var color = 0x65ffff;
                //hands.updateHand(args.token.hand,color);
                //
                document.getElementById("gesture").textContent += "</br>gesture semicircle complete"
            }); 
            
            
    djestit.onComplete( ":has(:root > .end:val(\"2\"))",
            semicircle,
            function(args) {                
                 document.getElementById("gesture").textContent += "</br>gesture semicircle complete2";

              //  var color = 0x65ffaa;
               // hands.updateHand(args.token.hand,color);
              });    
            
      djestit.onComplete( ":has(:root > .end:val(\"3\"))",
            semicircle,
            function(args) {                
                console.log("action end ");
                document.getElementById("gesture").textContent += "</br>gesture semicircle complete";
                });         
    djestit.onComplete( ":has(:root > .gt:val(\"leap.end\") )",
            wristclockwise,
            function(args) {                
                console.log("action end ");
                document.getElementById("gesture").textContent += "</br>gesture wristclockwise complete";
               });           
            
    
    /* Crea un nuovo oggetto di tipo LeapSensor 
     * con in ingresso le espressioni descritte precedentemente
     * l-ultimo identifica il massimo numero di frame che puo contenere per rilevare un gesto
     */
    
    var lsensor = new djestit.LeapSensor(input, 500);


    
 
    //lsensor.changeColorHand(0x65ff00);
    
        
 

   
 
 
 });
