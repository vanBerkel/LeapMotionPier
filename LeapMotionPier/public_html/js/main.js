


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




$(document).ready(function() {

//
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
    

   
    
    var choice = new djestit.Choice([sequencePan, iterative]);
    
    /*
    sequencePan.onComplete.add(function() {
        console.log(sequencePan.state);
    });

    sequencePan.fire(new djestit.Token());
    sequencePan.fire(new djestit.Token());

    sequencePan.fire(new djestit.Token());
 */

    
    
    //var auxGestit= document.getElementById("#area");
    //gesture pan
    /* il campo accept contiene tutti i campi che servono per accettare il ground di riferimento */
    var pan = {
        sequence: [
            {gt: "leap.start", tid: 1 , accept:"close", close: "0.5",  closeOperator: ">" },
            {disabling: [
                    {gt: "leap.move", tid: 1, accept:"close", close: "0.5",  closeOperator: ">", iterative: true},
                    {gt: "leap.end", tid: 1,accept:"close", close: "0.5",  closeOperator: "<"}
                ]}
        ]

    };



    
     djestit.onComplete(
            ":has(:root > .gt:val(\"leap.start\"))",
            pan,
            function() {
                console.log("line added");
                //currentLine = paintCanvas.addLine();
            });
   
    djestit.onComplete(
            ":has(:root > .gt:val(\"leap.move\"))",
            pan,
            function(/*args*/) {                console.log("action move ");

/*
                var toAdd = paintCanvas.coordToView({
                    x: args.token.clientX,
                    y: args.token.clientY
                });
                paintCanvas.addPoint(currentLine, toAdd);
                paintCanvas.paint();
  */          });

    
  

  
    
 // var controller = Leap.loop({enableGestures:true}, function(frame){});
//gesture pan

    var controller = new Leap.Controller();


    var lsensor = new djestit.LeapSensor(controller, pan, 3);


  
    var previousFrame = null;

var flag = false;/*
var controller = Leap.loop(controllerOptions, function(frame) {
  /*if ((paused) || (pauseOnGrab)){
        return; // Skip this update
  }
   //setTimeout(Leap.loop(),250);
    
    if (lung===max){//elimina l-ultimo elemento        
            testa = (testa+1)%max;
            lung = lung-1;    
        }    
    listFrame[(testa+lung)%max] = frame;
    // console.log("Frame id " + frame.id);
    lung++;
 
    if (frame.hands.length > 0) {
        //genera token start perche la mano e' stata rilevata
               //sequencePan.fire(lsensor.generateToken(1,frame));

                var hand = frame.hands[0]; //left or right?
                if ((hand.grabStrength ===1)&&(!paused)){ 
                    //pauseOnGrab =true;
                    
                    console.log("mano chiusa");
                    
                    if ((listFrame[((lung-2)+testa)%max]!=null)
                    && (flag == true)){             
                       //term1.accepts(generateToken)
                        //console.log('frame accept' + term2.accepts(lsensor.generateToken(2,frame)));
                        //sequencePan.fire(lsensor.generateToken(2,frame));
                        console.log('vediamo' + sequencePan.state+ 'token ' + lsensor.generateToken(2,frame));
                    
            
                    } else{
                        //lsensor.generateToken(1,frame);
                        flag = true;
                       //console.log('frame accept' + term1.accepts(lsensor.generateToken(1,frame)));
                       console.log('vediamo' + sequencePan.state + 'token' + lsensor.generateToken(2,frame));
                    
                    }
                  // LeapSensor(frame,1,1);
        
                   
                }
               if ((hand.grabStrength ===0)&&(!paused)){ //fine acquisizione
                    //pauseOnGrab =true;
                    
                    console.log("mano aperta");
                      //  
                    //lsensor.generateToken(3,frame);

            // LeapSensor(frame,1,1);
                    previousFrame=null;
                  //  console.log('vediamo ' + sequencePan.state +  djestit.COMPLETE);
                   // console.log('vediamo ' + sequencePan.state ===  1);
                    
            //togglePause("grab");
                }
                
                
                
            }else{
                //genera token end perche' la mano non e' presente
                document.getElementById("up").innerHTML="metti la mano sotto il leap";
                
              
                //sequencePan.fire(lsensor.generateToken(3,frame));
                
                
            }
});*/

 

    /*sa1 = tsensor.sequence.getById(0, 1);
    if (sa1===ta1)
        console.log("Passo 1: Tocco 1 delay 0");
  */
  

//LeapSensor.generateToken(-1,listFrame[0]);

controller.on("gesture", function(gesture){
    
   //var motivo = gesture.type;
    switch (gesture.type) {
        case "circle":
                /* var clockwise = false;
                var pointableID = gesture.pointableIds[0];
                var direction = listFrame[(testa+lung)%max].pointable(pointableID).direction;
                var dotProduct = Leap.vec3.dot(direction, gesture.normal);

                if (dotProduct  >  0) clockwise = true;
                if ((clockwise)&&(!paused))
                    togglePause(gesture.type + " clockwise");
                else if ((paused) && (!clockwise))
                      togglePause(gesture.type);
                    
            
           /* gestureString += "center: " + vectorToString(gesture.center) + " mm, "
                        + "normal: " + vectorToString(gesture.normal, 2) + ", "
                        + "radius: " + gesture.radius.toFixed(1) + " mm, "
                        + "progress: " + gesture.progress.toFixed(2) + " rotations";
                */
          break;
        case "swipe":
          
          break;
        case "screenTap":
        case "keyTap":
        
          break;
        default:
        break;
    }
    
          //togglePause(gesture.type);

    

});
 
 
 });
//permette di mettere in pausa l acquisizione dei dati    
 function togglePause(motivo) {
    paused = !paused;
    
    if (paused) {
        printHtml(motivo);
        document.getElementById("pause").innerText = "Resume";
    } else {
         var frameOutput = document.getElementById("frameDataList");
          frameOutput.innerHTML = "";
      document.getElementById("pause").innerText = "Pause";
    }
}

    






/* stampa la coda circolare di frame */
function printHtml(motivo){
    var frameStringList="";
    var frameOutput = document.getElementById("frameDataList");
    frameStringList += "<h3> motivo : " + motivo.toString() + "</h3>";
    console.log(lung);
    var previousFrame;
    for (var i = 0; i< lung; i++ ){
        //stampa a video tutti i frame
            console.log(i);
            frameStringList += "<h1>index n " + i + "</h1><h3>Frame data:</h3><div>";
       
            var frameString = "Frame ID: " + listFrame[(testa+i)%max].id  + "<br />"
                  + "Timestamp: " + listFrame[(testa+i)%max].timestamp + " &micro;s<br />"
                  + "Hands: " + listFrame[(testa+i)%max].hands.length + "<br />"
                  + "Fingers: " + listFrame[(testa+i)%max].fingers.length + "<br />"
                  + "Tools: " + listFrame[(testa+i)%max].tools.length + "<br />"
                  + "Gestures: " + listFrame[(testa+i)%max].gestures.length + "<br />";


  // Frame motion factors
 /* if (previousFrame && previousFrame.valid) {
    var translation = frame.translation(previousFrame);
    frameString += "Translation: " + vectorToString(translation) + " mm <br />";

    var rotationAxis = frame.rotationAxis(previousFrame);
    var rotationAngle = frame.rotationAngle(previousFrame);
    frameString += "Rotation axis: " + vectorToString(rotationAxis, 2) + "<br />";
    frameString += "Rotation angle: " + rotationAngle.toFixed(2) + " radians<br />";

    var scaleFactor = frame.scaleFactor(previousFrame);
    frameString += "Scale factor: " + scaleFactor.toFixed(2) + "<br />";
  }
        */
   frameStringList +=frameString + "</div>" +
  "<div style='clear:both;'></div><h3>Hand data:</h3><div>";
  
                
               
   

  // Display Hand object data
  var handString = "";
  var n =listFrame[(testa+i)%max].hands.length;
  if (n> 0) {

    for (var j = 0; j <n ; j++) {
      var hand = listFrame[(testa+i)%max].hands[j];

      handString += "<div style='width:300px; float:left; padding:5px'>";
      handString += "Hand ID: " + hand.id + "<br />";
      //right or left
      handString += "Type: " + hand.type + " hand" + "<br />";
      
      //what is the difference between those?
      //the Hand palmNormal() and direction() vectors define the orientation of the hand.
      handString += "Direction: " + vectorToString(hand.direction, 2) + "<br />";
      handString += "Palm position: " + vectorToString(hand.palmPosition) + " mm<br />";
      
      //
      handString += "Grab strength: " + hand.grabStrength + "<br />";
      handString += "Pinch strength: " + hand.pinchStrength + "<br />";
     
      handString += "Confidence: " + hand.confidence + "<br />";
      
      handString += "Arm direction: " + vectorToString(hand.arm.direction()) + "<br />";
      handString += "Arm center: " + vectorToString(hand.arm.center()) + "<br />";
      handString += "Arm up vector: " + vectorToString(hand.arm.basis[1]) + "<br />";

      // Hand motion factors
    /*  if (previousFrame && previousFrame.valid) {
        var translation = hand.translation(previousFrame);
        handString += "Translation: " + vectorToString(translation) + " mm<br />";

        var rotationAxis = hand.rotationAxis(previousFrame, 2);
        var rotationAngle = hand.rotationAngle(previousFrame);
        handString += "Rotation axis: " + vectorToString(rotationAxis) + "<br />";
        handString += "Rotation angle: " + rotationAngle.toFixed(2) + " radians<br />";

        var scaleFactor = hand.scaleFactor(previousFrame);
        handString += "Scale factor: " + scaleFactor.toFixed(2) + "<br />";
      }
*/
      // IDs of pointables associated with this hand
      
      if (hand.pointables.length > 0) {
        var fingerIds = [];
        for (var j = 0; j < hand.pointables.length; j++) {
          var pointable = hand.pointables[j];
            fingerIds.push(pointable.id);
        }
        if (fingerIds.length > 0) {
          handString += "Fingers IDs: " + fingerIds.join(", ") + "<br />";
        }
      }

      handString += "</div>";
      
        
    }
  }
  else {
    handString += "No hands";
  }
  
   frameStringList +=  handString +"</div> <div style='clear:both;'></div><h3>Finger and tool data:</h3><div>";
  
  

  // Display Pointable (finger and tool) object data
  var pointableString = "";
  if (listFrame[(testa+i)%max].pointables.length > 0) {
    var fingerTypeMap = ["Thumb", "Index finger", "Middle finger", "Ring finger", "Pinky finger"];
    var boneTypeMap = ["Metacarpal", "Proximal phalanx", "Intermediate phalanx", "Distal phalanx"];
    for (var j = 0; j < listFrame[(testa+i)%max].pointables.length; j++) {
      var pointable = listFrame[(testa+i)%max].pointables[j];

      pointableString += "<div style='width:250px; float:left; padding:5px'>";

      if (pointable.tool) {
        pointableString += "Pointable ID: " + pointable.id + "<br />";
        pointableString += "Classified as a tool <br />";
        pointableString += "Length: " + pointable.length.toFixed(1) + " mm<br />";
        pointableString += "Width: "  + pointable.width.toFixed(1) + " mm<br />";
        pointableString += "Direction: " + vectorToString(pointable.direction, 2) + "<br />";
        pointableString += "Tip position: " + vectorToString(pointable.tipPosition) + " mm<br />"
        pointableString += "</div>";
      }
      else {
        pointableString += "Pointable ID: " + pointable.id + "<br />";
        pointableString += "Type: " + fingerTypeMap[pointable.type] + "<br />";
        pointableString += "Belongs to hand with ID: " + pointable.handId + "<br />";
        pointableString += "Classified as a finger<br />";
        pointableString += "Length: " + pointable.length.toFixed(1) + " mm<br />";
        pointableString += "Width: "  + pointable.width.toFixed(1) + " mm<br />";
        pointableString += "Direction: " + vectorToString(pointable.direction, 2) + "<br />";
        pointableString += "Extended?: "  + pointable.extended + "<br />";
        pointable.bones.forEach( function(bone){
          pointableString += boneTypeMap[bone.type] + " bone <br />";
          pointableString += "Center: " + vectorToString(bone.center()) + "<br />";
          pointableString += "Direction: " + vectorToString(bone.direction()) + "<br />";
          pointableString += "Up vector: " + vectorToString(bone.basis[1]) + "<br />";
        });
        pointableString += "Tip position: " + vectorToString(pointable.tipPosition) + " mm<br />";
        pointableString += "</div>";
      }
    }
  }
  else {
    pointableString += "<div>No pointables</div>";
  }
  
  frameStringList += pointableString + "</div><div style='clear:both;'></div><h3>Gesture data:</h3><div>";
  
  

  // Display Gesture object data
  var gestureString = "";
  if (listFrame[(testa+i)%max].gestures.length > 0) {
   
    for (var j = 0; j < listFrame[(testa+i)%max].gestures.length; j++) {
      var gesture = listFrame[(testa+i)%max].gestures[j];
      gestureString += "Gesture ID: " + gesture.id + ", "
                    + "type: " + gesture.type + ", "
                    + "state: " + gesture.state + ", "
                    + "hand IDs: " + gesture.handIds.join(", ") + ", "
                    + "pointable IDs: " + gesture.pointableIds.join(", ") + ", "
                    + "duration: " + gesture.duration + " &micro;s, ";

      switch (gesture.type) {
        case "circle":
          gestureString += "center: " + vectorToString(gesture.center) + " mm, "
                        + "normal: " + vectorToString(gesture.normal, 2) + ", "
                        + "radius: " + gesture.radius.toFixed(1) + " mm, "
                        + "progress: " + gesture.progress.toFixed(2) + " rotations";
          break;
        case "swipe":
          gestureString += "start position: " + vectorToString(gesture.startPosition) + " mm, "
                        + "current position: " + vectorToString(gesture.position) + " mm, "
                        + "direction: " + vectorToString(gesture.direction, 1) + ", "
                        + "speed: " + gesture.speed.toFixed(1) + " mm/s";
          break;
        case "screenTap":
        case "keyTap":
          gestureString += "position: " + vectorToString(gesture.position) + " mm";
          break;
        default:
          gestureString += "unkown gesture type";
      }
      gestureString += "<br />";
    }
  }
  else {
    gestureString += "No gestures";
  }
  frameStringList += gestureString + "</div>";
  
  previousFrame=listFrame[(testa+i)%max];
    }
    
   // console.log(frameStringList);
    frameOutput.innerHTML = frameStringList;
      
    
}

function vectorToString(vector, digits) {
  if (typeof digits === "undefined") {
    digits = 1;
  }
  return "(" + vector[0].toFixed(digits) + ", "
             + vector[1].toFixed(digits) + ", "
             + vector[2].toFixed(digits) + ")";
}
