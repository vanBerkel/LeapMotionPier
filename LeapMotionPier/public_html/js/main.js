


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

    var gestureAux= {
        sequence: [
            {gt: "leap.start",  accept:"location", location:"up" },
            {disabling: [
                   
                    {gt: "leap.move",  accept:"location", location:"up", iterative: true},
                    {gt: "leap.end",  end:1, accept:"handShape",handShape:"close", position:"up", move: "y",  directionY:"updown" }]},
             {disabling: [
                   
                    {gt: "leap.move",  accept:"location;handShape",handShape:"close", location:"up", iterative: true},
                    {gt: "leap.end",  end :2, accept:"handShape",handShape:"open", move: "y",  directionY:"downup"}]}
        ]

    };
    
 
    /* il campo accept contiene tutti i campi che servono per accettare il ground di riferimento 
     * close specifica che la mano dev essere chiusa
     * open specifica che la mano dev essere aperta
     * 
     * 
     * */
    var pan= {
        sequence: [
            {gt: "leap.start", accept:"close" },
            {disabling: [
                    {gt: "leap.move",  accept:"close", 
                        iterative: true},
                    {choice: [
                        {gt: "leap.end", accept:"move;open", move:"x", 
                        directionX:"leftright",  distance:2, 
                        tollerance:0.3}, 
                        {gt: "leap.end", accept:"move;open", move:"x", 
                        directionX:"rightleft" , distance:2, 
                        tollerance:0.3},
                        {gt: "leap.end", accept:"open;move", move: "y", 
                            directionY:"updown", distance:2, tollerance:0.3}, 
                        {gt: "leap.end", accept:"open;move", move: "y", 
                            directionY:"downup", distance:2, tollerance:0.3},
                        {gt: "leap.end", accept:"open;move", move: "z", 
                            directionZ:"behindfront", distance:2, tollerance:0.3}, 
                        {gt: "leap.end", accept:"open;move", move: "z", 
                            directionZ:"frontbehind", distance:2, tollerance:0.3}]}
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
            {gt: "leap.start" , accept:"handShape", handShape:"close" },
            {disabling: [
                    {gt: "leap.move", accept:"handShape", handShape:"close", 
                        iterative: true},
                    {gt: "leap.end",accept:"handShape", handShape:"open" }
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
            {gt: "leap.start", accept:"circle;finger" , finger:"index"},
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
                    {gt: "leap.end", end: 1, accept:"move", move:"z", 
                        directionZ:"behindfront" , distance:3, 
                        tollerance:0.3}
                ]},
            {disabling: [
                    {gt: "leap.move",  accept:"finger", finger:"index", 
                        iterative: true},
                    {gt: "leap.end", end: 2, accept:"newmove", move:"z", 
                        directionZ:"frontbehind", }
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
    orientationZY: "up"
    
    var handClap = {
        choice: [
            {sequence: [
                {gt: "leap.start", accept:"2hands;handShape;orientation", 
                    handShape:"open", separate : true,  orientationXY: "up"},
                {disabling: [
                        {gt: "leap.move", accept:"2hands;open;orientation", 
                            separate : true, handShape:"open",
                            orientationXY: "up",iterative: true},
                        {gt: "leap.end",  accept:"2hands",  
                            separate: false}
                    ]}
            ]},
            {sequence: [
                {gt: "leap.start", accept:"2hands;handShape;orientation", 
                    handShape:"open", separate : true,  orientationZY: "up"},
                {disabling: [
                        {gt: "leap.move", accept:"2hands;open;orientation", 
                            separate : true, handShape:"open",
                            orientationZY: "up", iterative: true},
                        {gt: "leap.end",  accept:"2hands",  
                            separate: false}
                    ]}
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
            {gt: "leap.start", accept:"location;orientation", location:"up", 
                orientationXY:"up"},
            {disabling: [
                    {gt: "leap.move",  accept:"location;orientation", 
                        orientationXY:"up", location:"up",iterative: true},
                    {gt: "leap.end", end:1, 
                        accept:"handShape", handShape : "close",
                        }
                ]},
                {disabling: [
                    {gt: "leap.move",   accept:"location;handShape;orientation", 
                         orientationXY:"up",location:"up",handShape : "close",
                        iterative: true},
                    {gt: "leap.end", end:2, accept:"move", move: "y", 
                        directionY: "updown", 
                        distance: 3, tollerance: 0.8}
                ]}
        ]
    };
    
 /*Drawing a counterclockwise semicircle
  *  
  * 
  */
    var semicircleRL = {
            sequence: [
            {gt: "leap.start", accept:"finger" , finger:"index"},
            {disabling: [
                    {gt: "leap.move", accept:"finger" , finger:"index", 
                        iterative: true},
                    {gt: "leap.end", end:"1", accept:"move", 
                        move: "y;x",  directionY:"downup", 
                        directionX:"rightleft", distance:1}
                ]}, 
            {disabling: [
                    {gt: "leap.move", accept:"finger" , finger:"index", 
                        iterative: true},
                    {gt: "leap.end", end:"2", accept:"newmove;move",                     //non è move ma new move
                         newmove: "y",  newdirectionY:"updown",
                         move: "x", directionX:"rightleft"
                        }
                ]},  
                   {disabling: [
                        {gt: "leap.move", accept:"finger", finger:"index", 
                            iterative: true},
                        {gt: "leap.end", end:"3", accept:"semicircle"}
                ]}]

    };
    
/*trasforma la stringa accept in array
var flag := true
for 0 to dimensione array accept or termina quando flag=false  do
if accept = "location" then
	if var location esiste then
           		trasforma la stringa location in array
            	for 0 to 2 or termina quando flag=false do
                		if var location[0] = "up" then
                   			 if posizione mano = up then
                        			flag := true  
                   			 else// la mano non si trova in questa posizione
                        			flag := false 
			...
		...
	...
return flag */


    var semicircle = {
            sequence: [
            {gt: "leap.start", accept:"close" , finger:"index"},
            {disabling: [
                    {gt: "leap.move", accept:"" , finger:"index", 
                        iterative: true},
                    {gt: "leap.end", end:1, accept:"move", 
                        finger:"index", move: "y;x",  directionY:"downup", 
                        directionX:"leftright", distance:1, tollerance:0.3}
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
                        distance:3,tollerance:0.3}
                ]}
        ]
    };

    var thumbUp  = {
       sequence: [
            {gt: "leap.start",  accept:"handShape;orientation", 
                    handShape:"close", orientationXY:"up"},
            {disabling: [
                    {gt: "leap.move", accept:"handShape;orientation", 
                        handShape:"close", orientationXY:"up", 
                        iterative: true},
                    {gt: "leap.end", accept:"handShape;orientation;finger", 
                        handShape:"close",orientationXY:"up", 
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
            {gt: "leap.start",  accept:"palm", palmXY:"down" },
            {disabling: [
                    {gt: "leap.move",  accept:"", iterative: true},
                    {gt: "leap.end",  accept:"palm", palmXY:"normalUp"}
                ]}
        ]

    };
   
    var fingerSnap  = {
       sequence: [
            {gt: "leap.start", accept:"fingerUnion", 
                fingerUnion:"thumb-middle"},
            {disabling: [
                    {gt: "leap.move", accept:"fingerUnion", 
                        fingerUnion:"thumb-middle", iterative: true},
                    {gt: "leap.end", end:1, accept:"finger", finger:"index"}
                ]},
            {disabling: [
                    {gt: "leap.move", accept:"fingerUnion", 
                        fingerUnion:"thumb-middle", iterative: true},
                    {gt: "leap.end", end:2, accept:"finger", 
                        finger:"index;thumb"}
                ]}
        ]
    };
    
    var gestures = { gestureAux,
       //pan,
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
   };
    //gestures.GestureAux;
    var elenco = [];
 
    for (var name in gestures) {
        elenco.push(gestures[name]);
   } 
    
  
   

    
   var input = {
        choice: elenco,
        iterative: true
    };
    
    //json expression
    jsonStart = ":has(:root > .gt:val(\"leap.start\"))";
    jsonEnd = ":has(:root > .gt:val(\"leap.end\"))";
    jsonEnd1 = ":has(:root > .end:val(\"1\"))";
    jsonEnd2  = ":has(:root > .end:val(\"2\"))";
    //change the color when the gesture is complete
    elenco.forEach(function (item){
            djestit.onComplete(jsonEnd2, item,
                function() {   
                    lsensor.colorComplete();
                    var s="";
                    switch (item){
                        case gestures.pan:
                            s+= "gesture pan complete ";
                            break;
                        case gestures.fingerSnap:
                            s += "gesture finger Snap complete";
                            break;
                        case gestures.pressingIndex: 
                            s+= "gesture pressing a Button with the index Finger complete";
                            break;   
                       case gestures.wristclockwise:
                            s+= "gesture wristclockwise complete";
                            break;
                        case gestures.thumbUp:
                             s += "gesture pan thumb Up complete";
                            break;    
                        case gestures.pullString:
                             s += "gesture pulling a string downward complete";
                            break;  
                        case gestures.pressingButton:
                            s += "gesture pressing button complete";
                            break;    
                        case gestures.handClap:
                             s += "gesture hand clap complete";
                            break;
                        case gestures.circleClockwise:
                             s += "gesture circle clockwise with the index Finger complete";
                            break;
                        case gestures.stretchHand:
                             s += "gesture Stretching the hand from fist complete";
                            break;
                        case gestures.semicircle:
                            s+="gesture semicircle complete";
                        default:
                            s +="gesture not defined";
                    }
                    //document.getElementById("gesture").="<br>";
                    document.getElementById("gesture").textContent +=s;
                });  
    });
            
    djestit.onComplete(jsonEnd1 ,
            gestureAux,
            function() {                
                var color = 0xffffff;
                lsensor.changeColorHand(color);
            }); 
           djestit.onComplete( jsonEnd2,
            gestureAux,
            function(args) {                
                 //document.getElementById("gesture").textContent += "</br>gesture semicircle complete2";
                    var color = 0x65ffaa;
               // hands.updateHand(args.token.hand,color);
                    lsensor.changeColorHand(color);

              }); 
            
            
    djestit.onComplete( ":has(:root > .end:val(\"1\"))",
            semicircle,
            function() {                
                var color = 0x65ffff;
                lsensor.changeColorHand(color);
            }); 
            
            
    djestit.onComplete( ":has(:root > .end:val(\"2\"))",
            semicircle,
            function(args) {                
                 //document.getElementById("gesture").textContent += "</br>gesture semicircle complete2";
                    var color = 0x65ffaa;
               // hands.updateHand(args.token.hand,color);
                    lsensor.changeColorHand(color);

              });    
    djestit.onComplete(   jsonStart,
            fingerSnap,
            function(args) {                
                 //document.getElementById("gesture").textContent += "</br>gesture semicircle complete2";
                    var color = 0x65ffaa;
               // hands.updateHand(args.token.hand,color);
                    lsensor.changeColorHand(color);

              });
    var lsensor = new djestit.LeapSensor(input, 500);  
 
 
 });
