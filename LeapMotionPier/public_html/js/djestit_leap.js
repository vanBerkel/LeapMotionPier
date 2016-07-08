
/* global THREE, Leap, controller */

(function(djestit) {

    var _LEAPSTART = 1;
    var _LEAPMOVE = 2;
    var _LEAPEND = 3;
    
    var _HandClose = 0.7;
    var _HandOpen = 0.3;
    
    var _positionUpDown = 100;
    var _positionDownUp = 50;
    var _positionRight = 80;
    var _positionLeft = -80;
    var _positionCenter = 20;
    
    
    var _fingerOpen = 0.7;
    
    var _handClapDistance = 45;
    

    var _handMove = 20;
    var _leftHand = "left";
    var _rightHand = "right";
    
    var _longDistance = 5; // long distance for few movement
    var _longDistanceZ = 5;
    var _differenceDistance = 6;
    
    var _distanceY = 10;
    
    var _colorAccept = 0x65ff00;
    var _colorDefault = 0x9100ce;
    var _colorNew = _colorDefault;

    //leap e' il frame da analizzare considera la mano 
    var LeapToken = function(leap, type) {
        if (type!==_LEAPEND){
        
            if (leap.gestures.length>0){
               // for (var i=0; i < leap.gestures.length; i++){
                    this.gesture = leap.gestures[0];
                    switch (this.gesture.type){
                        case "circle":    
                            if (this.gesture.normal){
                                this.clockwise = false;
                                var pointableID = this.gesture.pointableIds[0];
                                var direction = leap.pointable(pointableID).direction;
                                var dotProduct = Leap.vec3.dot(direction, this.gesture.normal);
                                if (dotProduct  >  0) this.clockwise = true;
                            }
                            break;
                        case "screenTap":
                            //console.log(leap.gestures[leap.gestures.length-1]);
                            break;
                    }  
                //}
            }
  
            this.pointable = leap.pointables;
            this.hand = leap.hands[0];
            
            //controllo sulle mani
            if (leap.hands.length >1){
                this.hands2 = leap.hands[1];
                if ((Math.abs((this.hand.palmPosition[0] - this.hands2.palmPosition[0])) < _handClapDistance)&&
                        (Math.abs(this.hand.palmPosition[1] - this.hands2.palmPosition[1]) <5)
                        && ((Math.abs((this.hand.palmPosition[2] - this.hands2.palmPosition[2])) < 50))
                        )
                        {
                    this.separate = false;
                }
                else 
                    this.separate = true;
                
                
            
            
            }
         
           //controlla se la mano è chiusa 
            if (this.hand.grabStrength >= _HandClose)
                this.close = true;
            else
                this.close = false;
            
            //controlla se la mano è aperta
            if (this.hand.grabStrength <= _HandOpen)
                this.open = true;
            else 
                this.open = false;
  
   
  
  
  
            this.palmPosition = this.hand.palmPosition;
    
        }
            this.id = leap.id;

        this.type = type; // _LEAPSTART _LEAPMOVE _LEAPEND identifica se la mano e' sopra il leap
        this.type2; //identifica se il ground term e' di tipo start move e complete
    };
    LeapToken.prototype = new djestit.Token();
    djestit.LeapToken = LeapToken;

   
   
    var LeapStart = function() {
        this.init();
        this.type = "Start";
        this._accepts = function() {
            return true;
        };
    };
    LeapStart.prototype = new djestit.GroundTerm();
    djestit.LeapStart = LeapStart;

    var LeapMove = function() {
        this.init();
        this.type = "Move";
        this._accepts = function() {
            return true;
        };
    };
    LeapMove.prototype = new djestit.GroundTerm();
    djestit.LeapMove = LeapMove;

    var LeapEnd = function() {
        this.init();
        this.type = "End";
        this._accepts = function() {
  
            return true;
        };
    };
    LeapEnd.prototype = new djestit.GroundTerm();
    djestit.LeapEnd = LeapEnd;

/* 
 * 
 * @param {type} capacity -> numero massimo di frame per una gesture
 * @returns {djestit_leap_L2.LeapStateSequence}
 */
    var LeapStateSequence = function(capacity) {
        this.init(capacity);
        this.leaps = [];
        this.l_index = [];//identifica la prima posizione libera
        this.first = []; //identifica dove il primo frame e' stato accettato 
        //this.frames = []; //identifica tutti i frame da start fino all ultimo end
        this.push = function(token) {
            this._push(token);
            switch (token.type) {           
                case _LEAPSTART:
                    this.leaps[token.id] = [];
                    this.l_index[token.id] = 0;
                    this.first[token.id] = 0; //la posizione viene stabilita durante le fasi di gesture
                   // this.frames[token.id] = [];
                case _LEAPMOVE: 
                case _LEAPEND:
                    if (this.leaps[token.id].length < this.capacity) {
                        this.leaps[token.id].push(token);
                    } else {
                       console.log("error!!you use too frames");
                    }

                    break;

            }
            
            
        };

/*ritorna i dati del token leap in un determinato istante*/
   /*    this.getById = function(delay, id) {
            var pos = 0;
            if(this.leaps[id].length < this.capacity){
                pos = this.l_index[id] - delay -1;
            }else{
                pos =(this.l_index[id] - delay - 1  + this.capacity) % this.capacity;
            }
            return this.leaps[id] [pos];
        };
     */
        
    };


    LeapStateSequence.prototype = new djestit.StateSequence();

    djestit.LeapStateSequence = LeapStateSequence;

    djestit.leapExpression = function(json) {
        console.log("leapExpression");
        var term;
        if (json.gt) {
            switch (json.gt) {
                case "leap.start":
                    term =  new djestit.LeapStart();
                    break;
                case "leap.move":
                    term = new djestit.LeapMove();
                    break;
                case "leap.end":
                    term = new djestit.LeapEnd();
                    break;
            }
            if (json.accept){
               
                term.accepts = function(token) {
                    if (token.type !== _LEAPEND){
                    var flag = true;
                    var accept = json.accept.toString().split(";");
                    if (term.type ==="End"){
                        var listRightLeft = [];
                                var listLeftRight = [];
                                var listUpDown = [];
                                var listDownUp = [];
                                var listFrontBehind = [];
                                var listBehindFront =[];
                   
                     if ((token.sequence.leaps[token.id]!==null) && (token.sequence.leaps[token.id].length>0)&& (token.sequence.first[token.id]>=0)) {    
                                var moveToken = token.sequence.leaps[token.id];
                                var aux = token.sequence.leaps[token.id][token.sequence.first[token.id]]; //token.sequence.first -> prima posizione occupata
                                var start = token.sequence.leaps[token.id][token.sequence.first[token.id]];
                                
                               
                                var posEnd = [0,0,0,0];//right,left,up,down
                                var highest;
                                var y_high = aux.palmPosition[1];
                                var palmEnd = [];
                                for(var t=0 ;t< moveToken.length; t++){
                                    if (moveToken[t].type2 === "End"){
                                        posEnd[0]=(listRightLeft.length);
                                        posEnd[1]=(listLeftRight.length);
                                        posEnd[2]=(listUpDown.length);
                                        posEnd[3]=(listDownUp.length);
                                        palmEnd.push(t);
                                        //console.log(palmEnd);
                                     }
                                    
                                    //punto piu alto
                                    if (moveToken[t].palmPosition[1]>y_high){
                                        highest = t;
                                        y_high = moveToken[t].palmPosition[1];                   
                                        //console.log("compare " + "y " + y_high + " x " + moveToken[t].palmPosition[0] + " index" + t);
                                    }
                   
                                    if (moveToken[t].palmPosition[1]>aux.palmPosition[1]+_longDistance){
                                        listDownUp.push(moveToken[t]);
                                    }else{
                                        if (moveToken[t].palmPosition[1]<aux.palmPosition[1]-_longDistance){
                                            listUpDown.push(moveToken[t]);
                                        }
                                    }
                                    if (moveToken[t].palmPosition[0]<aux.palmPosition[0]-_longDistance){
                                        listRightLeft.push(moveToken[t]);
                                    }else{
                                        if (moveToken[t].palmPosition[0]>aux.palmPosition[0]+_longDistance){
                                            listLeftRight.push(moveToken[t]);
                                        }
                                    }

                                    
                                    if (moveToken[t].palmPosition[2]<aux.palmPosition[2]-_longDistanceZ){
                                        listBehindFront.push(moveToken[t]);
                                    }else{
                                        if (moveToken[t].palmPosition[2]>aux.palmPosition[2]+_longDistanceZ){
                                            listFrontBehind.push(moveToken[t]);
                                        }
                                    }                                   
                                    aux = moveToken[t];                                            
                                }
                            }
                        }
                                            
                   
                    for(var i=0; i<accept.length; i++){
                        
                        
                        switch (accept[i]){
                            case "close":
                                flag =  flag && token.close;

                                break;
                                
                          /*  case "take": // which data takes updown
                                switch(json.take){
                                    case "updown": //remove the listDownUp
                                        listDownUp.splice(0,listDownUp.length-1);
                                        break;
                                    case "downup": //remove the listUpDown
                                        listUpDown.splice(0,listUpDown.length-1);
                                        break;
                                    
                                }
                                break*/
                                    
                        /*...*/                                
                        case "location":// identifica la posizione della mano rispetto a 6 posizioni  
                            /*le posizioni possono essere "up,down,left,right,center" 
                            * possono essere accoppiate tra di loro ad esempio:
                            * location === "up;left" --> la mano si trova in alto a sx
                            * !! certi accoppiamenti non hanno senso ad esempio:
                            * location === "up;down" --> il flag risultera' sempre falso perchè la
                            * mano non si può trovare sia in alto(up) che in basso (down)*/
                            var location = json.location.toString().split(";");
                            if (location.length>2)
                                flag = false;
                            else{
                                for(var h=0; h<location.length; h++){
                                    switch(location[h]){
                                        case "up": // la mano si trova in alto rispetto al Leap
                                            flag = flag && token.palmPosition[1] > _positionUpDown;
                                            break;
                                        case "down": //la mano si trova in altezza vicino al Leap
                                            flag = flag && token.palmPosition[1] < _positionDownUp;
                                            break;
                                        case "right": // la mano si trova a destra rispetto al Leap
                                            flag = flag && token.palmPosition[0] > _positionRight;
                                            break;
                                        case "left": // la mano si trova a sinistra rispetto al Leap
                                            flag = flag && token.palmPosition[0] < _positionLeft;
                                            break;
                                        case "center": /*la mano si trova tra la posizione 
                                                        sx(left) e la posizione dx(right)*/
                                            flag = flag && (token.palmPosition[0] >(_positionLeft) 
                                                    && token.palmPosition[0] <(_positionRight)) ;
                                            break;
                                     }
                                }
                            }
                            break;
                            /*...*/
                            case "2hands":
                                if (token.hands2){
                                        flag = flag && (json.separate === token.separate)
                                }
                                else
                                    flag = false;
                                break;
                            
                           /* case "samePosition": /// same position range 30+-
                                var samePosition = json.samePosition.toString().split(";");
                                if (start!==null) 
                                    for(var k=0; k<samePosition.length;k++){
                                        switch(samePosition[k]){
                                            case "y":
                                                //console.log("startPosition " + start.palmPosition[1] + "> token.palmPosition" + (token.palmPosition[1]-30) + "<tokenpalmposition" +token.palmPosition[1]+30);
                                                //flag = flag && start.palmPosition[1]> token.palmPosition[1]-30 && start.palmPosition[1]<token.palmPosition[1]+30;
                                                break;
                                            case "x":
                                                console.log("samePosition x not defined");
                                                break;
                                            case "z":
                                                console.log("samePosition z not defined");
                                                break;                                      
                                        }



                                    }
                                
                                break;*/
                            case "open":
                                flag = flag && token.open;
                                break;
                        
                            case "semicircle":
                                if ((start!==null)){  
                                    
                                    
                                    flag = flag && listDownUp.length > 2 //&& listRightLeft.length > (listDownUp.length) 
                                            && listUpDown.length >2
                                  ; 
                                                                 
                                    
                                    
                                    var Y1 = moveToken[highest].palmPosition[1];
                                    var sY = moveToken[0].palmPosition[1];
                                    
                                    var distance = Y1 - sY;
                                    var X1 = moveToken[highest].palmPosition[0];
                                    var sX = moveToken[0].palmPosition[0];
                                    
                                    
                                    var m1 = ((Y1 - sY) / (X1 - sX));
                                   // var q = Y1 - (X1 * m1);

                                    var y = ((moveToken[Math.round(highest/2)].palmPosition[0] - sX) * m1) + sY;

                                   /* console.log("distance between y and y highest/2" + y + " " + 
                                            moveToken[Math.round(highest/2)].palmPosition[1]
                                            + "start x " + sX + "end x" + X1 + "point x" + moveToken[Math.round(highest/2)].palmPosition[0] 
                                            + "final x" + moveToken[moveToken.length-1].palmPosition[0] + "distance " + distance
                                            + "distance 20 " + (distance*0.18 ));*/
                                    var flag2 = (distance * 0.18) < (moveToken[Math.round(highest/2)].palmPosition[1] -y);
                                    
                                    sY = moveToken[moveToken.length-1].palmPosition[1];
                                    
                                    distance = Y1 - sY;
                                    
                                    sX = moveToken[moveToken.length-1].palmPosition[0];                               
                                    m1 = ((sY-Y1) / (sX-X1));

                                    y = ((moveToken[Math.round((moveToken.length-1-highest)/2)].palmPosition[0] - X1) * m1) + Y1;
                                        
                                    var flag3 = (distance * 0.18) < (moveToken[Math.round((moveToken.length-1-highest)/2)].palmPosition[1] -y);
                                    
                                    
                                    flag = flag && (flag3 || flag2);
                                   
                                }
                                break;
                            case "palm": //controlla in che posizione si trova il palmo della mano
                                switch (json.palmXY){ //controlla il palmo della mano considerando solo gli assi X e Y
                                    case "normalUp"://palmo della mano rivolta verso l'alto
                                        
                                        /* a seconda della mano di riferimento (destra, sinistra) il controllo per capire in che posizione 
                                         * si trova il palmo della mano cambia
                                         */    
                                        if (token.hand.type === _rightHand){
                                            flag = flag && ((token.hand.roll())> (5*Math.PI/6) ||((token.hand.roll()) <(-5*Math.PI/6)));
                                        }
                                        else{
                                            flag = flag && ((token.hand.roll())< (Math.PI/12) ||((token.hand.roll()) > (-Math.PI/12)));
                                        }
                                         break;
                                    case "normalDown"://palmo della mano rivolta verso il basso
                                        if (token.hand.type === _rightHand){
                                            flag = flag && ((token.hand.roll())< (Math.PI/12) ||((token.hand.roll()) > (-Math.PI/12)));
                                        }
                                        else{
                                            flag = flag && ((token.hand.roll())> (5*Math.PI/6) ||((token.hand.roll()) <(-5*Math.PI/6)));
                                        }
                                        break;
                                    case "up":
                                        if (token.hand.type === _leftHand){
                                            flag = flag && ((token.hand.roll())> Math.PI/3) &&((token.hand.roll()) < (2*Math.PI/3));
                                        }
                                        else{
                                            flag = flag && ((token.hand.roll())<(-Math.PI/3)) &&((token.hand.roll()) > (-2*Math.PI/3));                                         
                                        }
                                        break;
                                    case "down":
                                        if (token.hand.type === _rightHand){
                                            flag = flag && ((token.hand.roll())> Math.PI/3) &&((token.hand.roll()) < (2*Math.PI/3));
                                        }
                                        else{
                                            flag = flag && ((token.hand.roll())<(-Math.PI/3)) &&((token.hand.roll()) > (-2*Math.PI/3));                                         
                                        }
                                        
                                        
                                        break;
                                }
                                switch (json.palmZY){
                                    case "normalUp":
                                            //console.log("normalUp PalmZY ancora da definire");
                                        break;
                                    case "normalDown":
                                            //console.log("normalDown PalmZY ancora da definire");
                                        break;
                                    case "up":
                                        if (token.hand.type === _leftHand){
                                            flag = flag && ((token.hand.pitch())> Math.PI/3) &&((token.hand.pitch()) < (2*Math.PI/3));
                                        }
                                        else{
                                            //console.log("token.hand" + token.hand.pitch() + "<-/3" + (-Math.PI/3) + ">-2/3" + -2*Math.PI/3);
                                            flag = flag && ((token.hand.pitch())<(-Math.PI/3)) &&((token.hand.pitch()) > (-2*Math.PI/3));                                         
                                        }
                                        break;
                                    case "down":
                                         if (token.hand.type === _rightHand){
                                            flag = flag && ((token.hand.pitch())> Math.PI/3) &&((token.hand.pitch()) < (2*Math.PI/3));
                                        }
                                        else{
                                            flag = flag && ((token.hand.pitch())<(-Math.PI/3)) &&((token.hand.pitch()) > (-2*Math.PI/3));                                         
                                        }
                                        //console.log("down PalmZY ancora da definire forse meglio");

                                        
                                        break;
                                }    
                                switch (json.palmXZ){
                                    case "normalUp":
                                          //  console.log("normalUp PalmXZ ancora da definire");
                                        break;
                                    case "normalDown":
                                            //console.log("normalDown PalmXZ ancora da definire");
                                        break;
                                    case "up":
                                        console.log("up PalmXZ ancora da definire");

                                        break;
                                    case "down":
                                        console.log("down PalmXZ ancora da definire");

                                        
                                        break;
                                }     
                                
                                
                                break;

                            case "finger":
                                var fingers = json.finger.toString().split(";");
                                var fingerE = [false,false,false,false,false];
                                
                                for(var f=0;f<fingers.length;f++){
                                    switch (fingers[f]){
                                                case "thumb":
                                                   // console.log("pointable " +token.hand.fingers[0].extended);
                                                    fingerE[0]=true; 
                                                    break;
                                                case "index":
                                                    //console.log("pointable " +token.hand.fingers[1].extended);

                                                    fingerE[1]=true; 
                                                    break;
                                                case "middle":
                                                    fingerE[2]=true; 
                                                case "ring":
                                                    fingerE[3]=true; 
                                                case "middle":
                                                    fingerE[4]=true; 
                                                    break;
                                    }
                                }
                                
                                flag = flag && (token.hand.fingers[0].extended===fingerE[0])  && (token.hand.fingers[1].extended === fingerE[1])
                                                   && (token.hand.fingers[2].extended === fingerE[2]) && (token.hand.fingers[3].extended === fingerE[3]) && 
                                                   (token.hand.fingers[4].extended === fingerE[4]);
                                           
                                        //   console.log("flag extended" + flag + "index" + fingerE[1] + "token" +token.hand.fingers[1].extended);
                                
                                break;
                                
                            case "fingerUnion":
                                var fingers = json.fingerUnion.toString().split(";");
                                
                                for(var f=0;f<fingers.length;f++){
                                    switch (fingers[f]){
                                                case "thumb-middle":
                                                   console.log("pointable " +token.hand.fingers[0].extended);
                                                    flag = flag && (Math.abs(token.hand.fingers[0].distal.nextJoint[2]) > (Math.abs(token.hand.fingers[2].distal.nextJoint[2]) - 10)) 
                                                            && (Math.abs(token.hand.fingers[0].distal.nextJoint[2]) < (Math.abs(token.hand.fingers[2].distal.nextJoint[2]) +10))
                                                            && ((token.hand.fingers[0].distal.nextJoint[1] > (token.hand.fingers[2].distal.nextJoint[1] - 12)) 
                                                            && (token.hand.fingers[0].distal.nextJoint[1]<(token.hand.fingers[2].distal.nextJoint[1] +12))
                                                            );
                                                    console.log("thumb" + token.hand.fingers[0].carpPosition +  " middle" + token.hand.fingers[2].carpPosition
                                                                + " thumb dip position" + token.hand.fingers[0].dipPosition + " middle " + token.hand.fingers[2].dipPosition 
                                                                + "mcp position" + token.hand.fingers[0].mcpPosition + " middle" + token.hand.fingers[2].mcpPosition + 
                                                                    "distal thumb " + token.hand.fingers[0].distal.nextJoint + " middle distal" + token.hand.fingers[2].distal.nextJoint + 
                                                                    " flag " + flag);
                                                    break;
                                                case "thumb-index":
                                                    fingerE[1]=true; 
                                                    break;
                                                case "thumb-pinky":
                                                    fingerE[2]=true; 
                                                    break;
                                    }
                                }
                               
                                
                                
                                           
                                           
                                
                                    break;
                                
                            case "circle":
                                if (token.gesture  && token.gesture.type === "circle"){
                                    switch (term.type){
                                    case "Move":
                                        //console.log("move circle" + token.gesture.progress);
                                        flag = flag && token.gesture.progress<1;

                                        break;
                                    case "End":
                                        if (json.clockwise!==null && token.clockwise!==null) {                                          
                                            flag = flag && token.clockwise === json.clockwise;                                           
                                        }
                                        //console.log("end circle" + token.gesture.progress);
                                        flag = flag  && (token.gesture.progress>=1);
                                        break;
                                    case "Start":
                                      //console.log("start circle" + token.gesture.state);
                                        flag = flag && token.gesture.state==="start";
                                        if (json.finger && token.pointable) {
                                            var index =0;
                                                switch (json.finger){
                                                    case "thumb":
                                                        index =0;
                                                        break;
                                                    case "index":
                                                        //console.log ( "indexFinger " + token.pointable[1].id +"idPont" +  token.gesture.pointableIds[0]);
                                                        index =1;
                                                        break;
                                                        
                                                
                                                
                                                    }
                                                    
                                                    flag = flag && token.gesture.pointableIds[0] === token.pointable[index].id ;
                                            //flag = flag && token.gesture.pointableIds === 
                                        }//console.log("start circle" + token.gesture.state + flag);
                                        break;
                                    
                                    
                                    }
                                }else 
                                    flag = false;
                                break;
                           
                            case "newmove":
                                if (json.move){ //spostamento  
                                    var asse = json.move.toString().split(";");
                                    for(var j=0; j<asse.length; j++){
                                        switch (asse[j]){
                                                
                                                case "x"://spostamento asse x
                                                                                                                                            
                                                    break;
                                                 case "y":                                                  
                                                     if (term.type==="End"){
                                                         switch(json.directionY){
                                                             case "updown":
                                                                flag = flag && (listUpDown.length>0) && (listDownUp.length>listUpDown.length); 
                                                                //console.log("newmove " + flag + "posEnd " + listUpDown.length + "other downup" +listDownUp.length);
                                                                break;
                                                             case "downup":
                                                                //flag = flag && listDownUp.length > (0) && (listUpDown.length ===0 ); 
                                                                break;
                                                             default:
                                                                //flag = flag && (listDownUp.length > (0) || (listUpDown.length >0 )); 
                                                                break;
                                                             
                                                         }
                                                                        
                                                    }
                                               
                                                 
                                                    break;
                                                case "z":
                                                    console.log("move asse z not defined");
                                                    break;
                                            
                                        }
                                        
                                } 
                            }   
                                break;
                            
                            case "move":
                                if (json.move){ //spostamento  
                                    var asse = json.move.toString().split(";");
                                    var distance = 0;
                                    if (json.distance !== null){
                                        distance = json.distance;
                                        //console.log("distance" + distance);
                                    }
                                    
                                    var tollerance = 0.5;
                                    if (json.tollerance !== null){
                                        tollerance = json.tollerance;
                                    }
                                    
                                    for(var j=0; j<asse.length; j++){
                                        switch (asse[j]){
                                                
                                                case "x"://spostamento asse x
                                                    if (term.type==="End"){

                                                        switch(json.directionX){

                                                             case "leftright":

                                                                 flag = flag && listLeftRight.length > (distance) && (listRightLeft.length <(listLeftRight.length*tollerance)); 
                                                                  console.log("listRightLeft " + listRightLeft.length + " \n\
                                                                    listLeftRight " + listLeftRight.length + " flag " + flag + "distanc22e  "+ distance);

                                                                 break;
                                                             case "rightleft":
                                                                 flag = flag && listLeftRight.length < (listRightLeft.length * tollerance) && (listRightLeft.length > distance );                                                                  
                                                                break;
                                                            default:
                                                                flag = flag && (listLeftRight.length >(distance) || (listRightLeft.length >distance ));                                                                  break;

                                                                 break;
                                                             
                                                        }
                                                                        
                                                    }
                                                                                             
                                                    break;
                                                 case "y":                                                  
                                                     if (term.type==="End"){
                                                        console.log("listDownUp " + listDownUp.length + " listUpDown " +listUpDown.length );

                                                         switch(json.directionY){
                                                             case "updown":
                                                                 
                                                                flag = flag && listDownUp.length < (listUpDown.length * tollerance) && (listUpDown.length >distance ); 
                                                                break;
                                                             case "downup":
                                                                flag = flag && listDownUp.length > (distance) && (listUpDown.length < (listDownUp.length *tollerance)); 
                                                                break;
                                                             default:
                                                                flag = flag && (listDownUp.length > (distance) || (listUpDown.length >distance )); 
                                                                break;
                                                             
                                                         }
                                                                        
                                                    }
                                                    break;
                                                case "z":
                                                    if (term.type==="End"){
                                                    switch(json.directionZ){
                                                             case "behindfront":
                                                                 console.log("listFrontBehin" + listFrontBehind.length + " listBehindFront "
                                                                         + listBehindFront.length );
                                                                flag = flag && listFrontBehind.length < (tollerance * listBehindFront.length) && (listBehindFront.length >distance ); 
                                                                break;
                                                             case "frontbehind":
                                                                flag = flag && listFrontBehind.length > (distance) && (listBehindFront.length < (tollerance * listFrontBehind.length) ); 
                                                                break;
                                                             default:
                                                                flag = flag && (listFrontBehind.length > (distance) || (listBehindFront.length >distance )); 
                                                                break;
                                                             
                                                         }
                                                    
                                                    
                                                }
                                                    break;
                                            
                                        }
                                        
                                } 
                            }   
                 
                                    
                        break;
                            
                        }
                            
                        
                        
                }
                    if (flag){ // accettato il ground term allora aggiorna la lista di frame in leaps
                        token.type2 = term.type;
                        if (json.gt === "leap.start"){
                            token.type = _LEAPSTART;
                            
                        }
                        token.sequence.push(token);                           
                                     
                     }else
                        if (token.sequence.length > 0){
                            token.sequence[token.id] = null;
                        }
                    return flag ;
                }
                return false;
                };     
            }
            return term;
        }   
        
    };
    

    

    djestit.registerGroundTerm("leap.start", djestit.leapExpression);
    djestit.registerGroundTerm("leap.move", djestit.leapExpression);
    djestit.registerGroundTerm("leap.end", djestit.leapExpression);



/*tiene in memoria l'elenco delle gesture che sono state definite e trasforma
 * le informazioni ricevute dal frame leap contenente le informazioni sulle mani,
 * in token che ne rappresentano il movimento compiuto ora
 * element rappresenta il controller del leap
 * hands rappresenta la mano da disegnare sullo schermo
 * root rappresenta la lista dei groundTerm
 * 
 */
    var LeapSensor = function(root, capacity) {
        if (root instanceof djestit.Term) {
            this.root = root; //attributo term, rappresenta la lista
        } else {
            console.log("expressionroot");
            this.root = djestit.expression(root); // analizza root il file json
        }
       this.sequence = new LeapStateSequence(capacity);
        
       /*? leapToEvent eventToLeap differenza?? */
        this.leapToEvent = [];
        this.eventToLeap = [];
        
        // we do not use zero as touch identifier
        this.leapToEvent[0] = -1;
        
        this.tokenToLeap = -1;
        
        var self = this;

        this.generateToken = function(type, leap) {
            var token = new LeapToken(leap, type);
            switch (type) {
                case _LEAPSTART: //mano rilevata
                case _LEAPMOVE: //mano continua ad essere rilevata
                    if ((this.tokenToLeap >= 0)&&(token.id>this.tokenToLeap))
                        token.id = this.eventToLeap[this.tokenToLeap];
                    else{ //la mano viene rilevata per la prima volta oppure la gesture precedente e` stata riconosciuta oppure fallita
                        var leapId = this.firstId(token.id);
                        console.log("eventToLeap leapID" + leapId + " " + token.id);
                        //var leapId2= this.firstId2(token.id);
                        this.eventToLeap[token.id] = leapId;                
                        this.tokenToLeap = token.id;
                        this.leapToEvent[leapId] = [token.id];
                        token.id = leapId; 
                        
                    }
                        
                   break;
                case _LEAPEND: //mano fuori dalla vista
                    if ((token.id>=this.tokenToLeap)&& (this.tokenToLeap>-1)){
                        token.id = this.eventToLeap[this.tokenToLeap];
                        delete this.eventToLeap[token.id];
                   
                    }
                   break;
            }
            
            if (type!==_LEAPEND)
                  token.sequence = this.sequence;
            return token;
        };

        this.firstId = function(id) {
            this.leapToEvent.push(id);
            return this.leapToEvent.length - 1;
        };
        
    
        
        

/* raiseLeapEvent
 * @param {type} event
 * @param {type} name example _LEAPSTART
 * @returns {undefined}
 * 
 */
        this.handsU = {
            scale: 1.3,
            materialOptions: {
                    color: new THREE.Color(_colorNew)
            }
        };
        this._raiseLeapEventHand = function(token) {
                    self.root.fire(token);
                    console.log("state -> " + self.root.state + "  self ->" + self.root.lookahead(token) + "token.id" + token.id);
                    if (self.root.state === djestit.COMPLETE){
                        
                        this.handsU.materialOptions.color.set(_colorAccept);
                        setTimeout(function(s){
                             s.materialOptions.color.set(_colorDefault); 
                         }, 3000,this.handsU);
                        console.log(self.root);
                        // la gesture e' stata rilevata  viene resetato il valore del primo id della prossima gesture

                        this.tokenToLeap = -1; 
                        
                        self.root.reset();
                        
                    }
                   if ((self.root.state === djestit.ERROR) || (!self.root.lookahead(token))){
                         
                        console.log("gesto non completato");
                        self.root.reset();
                       
                    }
                        
                        
                
        };
              
        this.handME = function (handMesh){
         //   handMesh.castShadow = true;
           // handMesh.depthTest = true;
            handMesh.material.opacity = 1;
          
        };
        this._raiseLeapEventStart = function (frame,name){
            //aggiornamento della schermata           
            controller.use('riggedHand', this.handsU);
            controller.on('riggedHand.meshAdded', this.handME );

            var riggedHand = controller.plugins.riggedHand;
            var camera = riggedHand.camera;
            camera.position.set(-8,8,20);
            camera.lookAt(new THREE.Vector3(0,0,0));

            var token =  self.generateToken(name, frame);
            this._raiseLeapEventHand(token);
        };
            
        this._raiseLeapEventMove= function(frame,name){
            var token =  self.generateToken(name, frame);
            this._raiseLeapEventHand(token);
        };
        
        this._raiseLeapEventEnd = function(frame,name){
           var token =  self.generateToken(name, frame);
        }; 
       /* this.element.on('connect', function(){
            setInterval(function(){
            
            }, 200);
        });       */ 
        controller = new Leap.Controller({enableGesture: true});
        controller.streaming();    
        var previousFrame = null;
        controller.on('frame', function(frame){
            if (frame.valid){
            //primo frame da analizzare
                if ((frame.hands.length>0)&&(previousFrame ===null)){
                    self._raiseLeapEventStart(frame,_LEAPSTART);
                    previousFrame=frame;
                }
                else //secondo frame da analizzare
                    if (frame.hands.length>0){
                        self._raiseLeapEventMove(frame,_LEAPMOVE);
                    }
                        else {// ultimo frame
                            previousFrame=null;
                            //self._raiseLeapEventEnd(frame,_LEAPEND);
                            self._raiseLeapEventEnd(frame,_LEAPEND);
                        }
            }
        });     
        
 
        
       
        controller.connect();

    };

    djestit.LeapSensor = LeapSensor;


}(window.djestit = window.djestit || {}, undefined));
