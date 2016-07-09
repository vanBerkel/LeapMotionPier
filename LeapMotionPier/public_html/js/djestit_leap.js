
/* global THREE, Leap, controller */

(function(djestit) {
    var thiss= this;
    var _LEAPSTART = 1;
    var _LEAPMOVE = 2;
    var _LEAPEND = 3;
    
    var _HandClose = 0.7;
    var _HandOpen = 0.3;
    
    var _positionUp = 200;
    var _positionDown = 80;
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
            }else
                this.gesture = null;
  
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

    var continueLeap = true;

    var listRightLeft ;
    var listLeftRight  ;
    var listUpDown;
    var listDownUp;
    var listFrontBehind;
    var listBehindFront;
    var moveToken;
    var highestPosition;
    var start; //frame per gestire il semicerchio
    
               // variabile di supporto per verificare il vecchio frame 
    var previousFrame = null; 
    
    
    var updateListToken = function(token){
         
        if ((token.sequence.leaps[token.id]!==null) 
                && (token.sequence.leaps[token.id].length>0)
                && (token.sequence.first[token.id]>=0)) {    
                thiss.listRightLeft = [];
                thiss.listLeftRight = [];
                thiss.listUpDown = [];
                thiss.listDownUp = [];
                thiss.listFrontBehind = [];
                thiss.listBehindFront =[];
                thiss.moveToken = token.sequence.leaps[token.id];
                var aux = token.sequence.leaps[token.id][token.sequence.first[token.id]]; //token.sequence.first -> prima posizione occupata
                start= token.sequence.leaps[token.id][token.sequence.first[token.id]];

                var posEnd = [0,0,0,0];//right,left,up,down 
                var y_high = aux.palmPosition[1];
                var palmEnd = [];
                for(var t=0 ;t<  thiss.moveToken.length; t++){
                    if ( thiss.moveToken[t].type2 === "End"){
                        posEnd[0]=( thiss.listRightLeft.length);
                        posEnd[1]=( thiss.listLeftRight.length);
                        posEnd[2]=( thiss.listUpDown.length);
                        posEnd[3]=( thiss.listDownUp.length);
                        palmEnd.push(t);
                     }

                    //punto piu alto
                    if ( thiss.moveToken[t].palmPosition[1]>y_high){
                        highestPosition = t;
                        y_high =  thiss.moveToken[t].palmPosition[1];                   
                        //console.log("compare " + "y " + y_high + " x " + moveToken[t].palmPosition[0] + " index" + t);
                    }

                    if ( thiss.moveToken[t].palmPosition[1]>aux.palmPosition[1]+_longDistance){
                         thiss.listDownUp.push(thiss.moveToken[t]);
                    }else{
                        if ( thiss.moveToken[t].palmPosition[1]<aux.palmPosition[1]-_longDistance){
                             thiss.listUpDown.push( thiss.moveToken[t]);
                        }
                    }
                    if ( thiss.moveToken[t].palmPosition[0]<aux.palmPosition[0]-_longDistance){
                         thiss.listRightLeft.push( thiss.moveToken[t]);
                    }else{
                        if ( thiss.moveToken[t].palmPosition[0]>aux.palmPosition[0]+_longDistance){
                           thiss.listLeftRight.push( thiss.moveToken[t]);
                        }
                    }
                    if ( thiss.moveToken[t].palmPosition[2]<aux.palmPosition[2]-_longDistanceZ){
                        thiss.listBehindFront.push( thiss.moveToken[t]);
                    }else{
                        if ( thiss.moveToken[t].palmPosition[2]>aux.palmPosition[2]+_longDistanceZ){
                            thiss.listFrontBehind.push( thiss.moveToken[t]);
                        }
                    }                                   
                    aux =  thiss.moveToken[t];                                            
                }
            }
          
    };
   
    /* identifica la posizione della mano in 9 posizioni rispetto
     * allo schermo 2D (considera solo altezza e larghezza).
     * l'etichette possono essere "up,down,left,right,centerV,centerH"
     * centerV significa centrale rispetto all' asse verticale;
     * centerH significa centrale rispetto all'asse orizzontale. 
     * le etichette possono essere accoppiate tra di loro ad esempio:
     * location === "up;left" --> la mano si trova in alto a sx
     * !! certi accoppiamenti non hanno senso ad esempio:
     * location === "up;down" --> il flag risultera' sempre falso perchè la
     * mano non si può trovare sia in alto(up) che in basso (down).
     * In questa funzione l'etichette sono già scompose.
     * @param {type} location1 prima etichetta puo' valere up o down oleft o 
     *               right o centerV o centerH
     * @param {type} location2 seconda etichetta opzinale
     * @param {type} position identifica la posizione in cui si trova la mano
     * @returns {Boolean} true se la mano si trova nella posizione specifica
     *                      falso altrimenti.
     */ 
    var locationsAccept = function (location1, location2, position){
            var flag = false; 
            var locationAccept = function (location){
                 console.log("posizione" + position[0]);
                flag=false;
                switch(location){
                    case "up": // la mano si trova in alto rispetto al Leap
                        flag =position[1] > _positionUp;
                        break;
                    case "down": //la mano si trova in altezza vicino al Leap
                        flag= position[1] < _positionDown;
                        break;
                    case "right": // la mano si trova a destra rispetto al Leap
                        flag= position[0] > _positionRight;
                        break;
                    case "left": // la mano si trova a sinistra rispetto al Leap
                        flag= position[0] < _positionLeft;
                        break;
                    case "centerH": /*la mano si trova tra la posizione 
                                    sx(left) e la posizione dx(right)*/
                        flag= (position[0] >(_positionLeft) 
                                && position[0] <(_positionRight));
                        
                        break;
                    case "centerV": /*la mano si trova tra la posizione 
                                    sx(left) e la posizione dx(right)*/
                        flag= (position[1] >(_positionDown) 
                                && position[1] <(_positionUp));
                        
                        break;
                    default: /*etichetta non valida come se l'etichetta location non 
                            * fosse definita quindi il flag viene impostato a true
                            * visualizzando un messaggio di warning*/
                        flag = true; 
                        console.log("name not valid for the location " + location);
                        break;
                }
                return flag;
            };   
             if (location1!==null)
                 flag = locationAccept(location1);
             if ((location2!==null) && (flag))
                 flag = locationAccept(location2);
             return flag;
        };
   
    var semicircle = function(){
        var flag=true;
         var flag2,flag3;
        if ((start!==null)){  
            flag = flag && listDownUp.length > 2 //&& listRightLeft.length > (listDownUp.length) 
                    && listUpDown.length >2; 

            var Y1 = moveToken[highestPosition].palmPosition[1];
            var sY = moveToken[0].palmPosition[1];

            var distance = Y1 - sY;
            var X1 = moveToken[highestPosition].palmPosition[0];
            var sX = moveToken[0].palmPosition[0];


            var m1 = ((Y1 - sY) / (X1 - sX));
           // var q = Y1 - (X1 * m1);

            var y = ((moveToken[Math.round(highestPosition/2)].palmPosition[0] - sX) * m1) + sY;

           /* console.log("distance between y and y highest/2" + y + " " + 
                    moveToken[Math.round(highest/2)].palmPosition[1]
                    + "start x " + sX + "end x" + X1 + "point x" + moveToken[Math.round(highest/2)].palmPosition[0] 
                    + "final x" + moveToken[moveToken.length-1].palmPosition[0] + "distance " + distance
                    + "distance 20 " + (distance*0.18 ));*/

            flag2 = (distance * 0.18) < (moveToken[Math.round(highestPosition/2)].palmPosition[1] -y);

            sY = moveToken[moveToken.length-1].palmPosition[1];

            distance = Y1 - sY;

            sX = moveToken[moveToken.length-1].palmPosition[0];                               
            m1 = ((sY-Y1) / (sX-X1));

            y = ((moveToken[Math.round((moveToken.length-1-highestPosition)/2)].palmPosition[0] - X1) * m1) + Y1;

            flag3 = (distance * 0.18) < (moveToken[Math.round((moveToken.length-1-highestPosition)/2)].palmPosition[1] -y);

        }
        
        return flag && (flag3 || flag2);
    };    
    
     var palm_XY = function(palmXY,palm,typeHand){
        var flag = true;
        switch (palmXY){ //controlla il palmo della mano considerando solo gli assi X e Y
            case "normalUp"://palmo della mano rivolta verso l'alto
                /* a seconda della mano di riferimento (destra, sinistra) il controllo per capire in che posizione 
                 * si trova il palmo della mano cambia
                 */    
                if (typeHand.toString() === _rightHand){
                    flag = ((palm> (5*Math.PI/6)) ||(palm <(-5*Math.PI/6)));
                }
                else{
                    flag = ((palm< (Math.PI/12)) ||(palm > (-Math.PI/12)));
                }
                 break;
            case "normalDown"://palmo della mano rivolta verso il basso
                if (typeHand.toString() === _rightHand){
                    flag = ((palm< (Math.PI/12)) ||(palm > (-Math.PI/12)));
                }
                else{
                    flag = ((palm> (5*Math.PI/6)) ||(palm <(-5*Math.PI/6)));
                }
                break;
            case "up":
                if (typeHand.toString() === _leftHand){
                    flag = ((palm> (Math.PI/3)) &&(palm < (2*Math.PI/3)));
                }
                else{
                    flag = ((palm<(-Math.PI/3)) &&(palm > (-2*Math.PI/3)));                                         
                }
                break;
            case "down":
                if (typeHand.toString() === _rightHand){
                    flag = ((palm> Math.PI/3) &&(palm < (2*Math.PI/3)));
                }
                else{
                    flag = ((palm<(-Math.PI/3)) &&(palm> (-2*Math.PI/3)));                                         
                }


                break;
        }
        return flag;
        
    }; 
   
    //TODO implements normalUp, normalDown
    var palm_ZY = function (palmZY,palm,typeHand){    
        var flag=true;
        switch (palmZY){
            case "normalUp":
                    //console.log("normalUp PalmZY ancora da definire");
                break;
            case "normalDown":
                    //console.log("normalDown PalmZY ancora da definire");
                break;
            case "up":
                if (typeHand.toString()=== _leftHand){
                    flag = ((palm)> Math.PI/3) &&((palm) < (2*Math.PI/3));
                }
                else{
                    //console.log("token.hand" + token.hand.pitch() + "<-/3" + (-Math.PI/3) + ">-2/3" + -2*Math.PI/3);
                    flag = ((palm)<(-Math.PI/3)) &&((palm) > (-2*Math.PI/3));                                         
                }
                break;
            case "down":
                 if (typeHand.toString() === _rightHand){
                    flag =  ((palm)> Math.PI/3) &&((palm) < (2*Math.PI/3));
                }
                else{
                    flag = ((palm)<(-Math.PI/3)) &&((palm) > (-2*Math.PI/3));                                         
                }
                //console.log("down PalmZY ancora da definire forse meglio");


                break;
        }   
        return flag;
    }; 
    
    //TODO implements palm_XZ
    var palm_XZ = function (palmXZ,palm,typeHand){
        var flag = true;
        switch (palmXZ){
            case "normalU\n\p":
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
        return flag;
    };
    
    
    var fingersExtended= function(fingers,fingersToken){
        
        var fingerE = [false,false,false,false,false];

        for(var f=0;f<fingers.length;f++){
            switch (fingers[f]){
                case "thumb":
                    fingerE[0]=true; 
                    break;
                case "index":
                    fingerE[1]=true; 
                    break;
                case "middle":
                    fingerE[2]=true; 
                    break;
                case "ring":
                    fingerE[3]=true;
                    break;
                case "middle":
                    fingerE[4]=true; 
                    break;
            }
        }

        return (fingersToken[0].extended===fingerE[0])  
                && (fingersToken[1].extended === fingerE[1])
                && (fingersToken[2].extended === fingerE[2]) 
                && (fingersToken[3].extended === fingerE[3]) 
                && (fingersToken[4].extended === fingerE[4]);
 //   console.log("flag extended" + flag + "index" + fingerE[1] + "token" +token.hand.fingers[1].extended);

    };
    
    //TODO implements all
    var fingers_Union = function(fingersUnion, fingersToken){
        var flag = true;
      /*  for(var f=0;f<fingersUnion.length && flag;f++){
            switch (fingersUnion[f].toString()){
                case "thumb-middle":
                   console.log("pointable " +fingersToken[0].extended);
                    flag = (Math.abs(fingersToken[0].distal.nextJoint[2]) > (Math.abs(fingersToken[2].distal.nextJoint[2]) - 10)) 
                            && (Math.abs(fingersToken[0].distal.nextJoint[2]) < (Math.abs(fingersToken[2].distal.nextJoint[2]) +10))
                            && (fingersToken[0].distal.nextJoint[1] > (fingersToken[2].distal.nextJoint[1] - 12)) 
                            && (fingersToken[0].distal.nextJoint[1]<(fingersToken[2].distal.nextJoint[1] +12))
                            );
                    console.log("thumb" + fingersToken[0].carpPosition +  " \n\
                            middle" + fingersToken[2].carpPosition
                                + " thumb dip position\n\
                        " + fingersToken[0].dipPosition + " middle \n\
                        " + fingersToken[2].dipPosition 
                                + "mcp position\n\
                        " + fingersToken[0].mcpPosition + " \n\
                        middle" + fingersToken[2].mcpPosition + 
                                    "distal thumb " + fingersToken[0].distal.nextJoint + " \n\
                    middle distal" + fingersToken[2].distal.nextJoint + 
                                    " flag " + flag);
                    break;
                case "thumb-index":
                    //fingerE[1]=true; 
                    break;
                
                case "thumb-ring":
                    //fingerE[1]=true; 
                    break;
                case "thumb-pinky":
                    //fingerE[2]=true; 
                    break;
            }
        }*/
        return flag;
    };
    
    var circle_ = function(circleGesture, type,clockwiseJ,clockwiseT){
        var flag=false;
        if (circleGesture!==null && circleGesture.gesture!==null  && circleGesture.type=== "circle"){
            switch (type){
                case "Move":
                    flag = circleGesture.progress<1;
                    break;
                case "End":
                    flag = (circleGesture.progress>=1);
                    if (flag && (clockwiseJ!==null) && (clockwiseT!==null))                                          
                        flag = clockwiseT === clockwiseJ;                                           
                    break;
                case "Start":
                    flag = circleGesture.state==="start";  
                    break;
                default:
                    flag = false;  
                    break;
            }
            
        }
        return flag;
    };

    //TODO case x,y downup
    var new_Move = function(move,directionX,directionY,directionZ){
        var flag = true;
        for(var j=0; j<move.length && flag; j++){
            switch (move[j]){
                case "x"://TODO
                     console.log("new move asse x not defined");
                    break;
                case "y":                                                  
                    switch(directionY){
                        case "updown": //controlla se gli spostamenti dall'alto verso il basso
                            /*sono in maggioranza rispetto agli spostamenti all'opposto*/
                           flag = flag && (listUpDown.length>0) && (listDownUp.length>listUpDown.length); 
                           //console.log("newmove " + flag + "posEnd " + listUpDown.length + "other downup" +listDownUp.length);
                           break;
                        case "downup"://TODO
                           //flag = flag && listDownUp.length > (0) && (listUpDown.length ===0 ); 
                           break;
                        default://TODO
                           //flag = flag && (listDownUp.length > (0) || (listUpDown.length >0 )); 
                           break;

                    }
                    break;
                case "z"://TODO
                    console.log("new move asse z not defined");
                    break;

            }

        }
        return flag;
    };   
    
    var move_ = function(asse,distance2,tollerance2,directionX,directionY,directionZ){
        var distance = 0;
        var flag = true;
        if (distance !== null){
            distance = distance2;
            //console.log("distance" + distance);
        }

        var tollerance = 0.5;
        if (tollerance2 !== null){
            tollerance = tollerance2;
        }

        for(var j=0; j<asse.length && flag; j++){
            switch (asse[j]){
                case "x"://spostamento asse x
                    switch(directionX){
                        case "leftright":
                            flag = thiss.listLeftRight.length > (distance) && (thiss.listRightLeft.length <(thiss.listLeftRight.length*tollerance)); 
                             console.log("listRightLeft " + thiss.listRightLeft.length + " \n\
                               listLeftRight " + thiss.listLeftRight.length + " flag " + flag + "distanc22e  "+ distance + " " +thiss.listLeftRight.length*tollerance);
                            break;
                        case "rightleft":
                            flag = thiss.listLeftRight.length < (thiss.listRightLeft.length * tollerance) && (thiss.listRightLeft.length > distance );                                                                  
                           break;
                        default:
   //                                flag = flag && (thiss.listLeftRight.length >(distance) || (thiss.listRightLeft.length >distance ));                                                                  break;
                            break;
                    }

                    break;
                case "y":                                                                    
                       // console.log("listDownUp " + thiss.listDownUp.length + " listUpDown " +thiss.listUpDown.length );
                    switch(directionY){
                        case "updown":
                           flag = thiss.listDownUp.length < (thiss.listUpDown.length * tollerance) 
                                   && (thiss.listUpDown.length >distance ); 
                           break;
                        case "downup":
                           flag = thiss.listDownUp.length > (distance) 
                                   && (thiss.listUpDown.length < (thiss.listDownUp.length *tollerance)); 
                           break;
                        default:
                           //flag = flag && (thiss.listDownUp.length > (distance) || (thiss.listUpDown.length >distance )); 
                           break;
                    }
                    break;
                case "z":
                    switch(directionZ){
                        case "behindfront":
                            console.log("listFrontBehin" + thiss.listFrontBehind.length + " listBehindFront "
                                    + thiss.listBehindFront.length );
                           flag =flag && thiss.listFrontBehind.length < (tollerance * thiss.listBehindFront.length) 
                                   && (thiss.listBehindFront.length >distance ); 
                           break;
                        case "frontbehind":
                           flag =  thiss.listFrontBehind.length > (distance) 
                                   && (thiss.listBehindFront.length < (tollerance * thiss.listFrontBehind.length) ); 
                           break;
                        default:
                           //flag = (thiss.listFrontBehind.length > (distance) || (thiss.listBehindFront.length >distance )); 
                           break;

                    }
                break;
            }

        }
        return flag;
    };   
                 
                        
                        
    var  acceptToken = function(accept,json,token,term) {

                    var flag = true;                  
                    for(var i=0; (i<accept.length && flag); i++){
                        switch (accept[i].toString()){
                            
                            case "close": // controlla che la mano sia chiusa
                                flag = token.close;
                                break;
                            case "location": // controlla la posizione della mano
                                if (json.location!==null){
                                    var location = [];
                                    location = json.location.toString().split(";");
                                    flag = locationsAccept(location[0], location[1],token.palmPosition);
                                     
                                }else{
                                        flag = true;
                                        console.log("forgot to define the variable location");
                                }
                                break;
                                
                            case "2hands": /* etichetta che controlla se le mani 
                                sono unite oppure no */
                                if (token.hands2)
                                        flag = (json.separate === token.separate)
                                else
                                    flag = false;
                                break;
                            case "open": /* controlla che la mano sia apera o 
                                distesa*/
                                flag = flag && token.open;
                                break;

                            case "semicircle":
                                if (term.type==="End"){
                                    flag = semicircle();
                                }else{
                                        flag = true;
                                        console.log("semicircle work only with term type end");
                                }
                                        
                                break;
                            case "palm": //controlla in che posizione si trova il palmo della mano
                                flag =  palm_XZ(json.palmXZ,token.hand.yaw(),token.hand.type) &&
                                        palm_ZY(json.palmZY,token.hand.pitch(),token.hand.type) &&
                                        palm_XY (json.palmXY,token.hand.roll(),token.hand.type);
                                break;

                            case "finger":
                                var fingers = json.finger.toString().split(";");
                                flag = fingersExtended(fingers,token.hand.fingers);
                                break;
                                
                            case "fingerUnion":
                                var fingersUnion = json.fingerUnion.toString().split(";");
                                flag = fingers_Union(fingersUnion,token.hand.fingers);
                                break;
                                
                            case "circle":
                                flag = circle_(token.gesture, term.type,json.clockwise, token.clockwise);
                                break;
                           
                            case "newmove":
                                if (term.type==="End"){
                                    if (json.move){ //spostamento  
                                        var asse = json.move.toString().split(";");
                                        flag = new_Move(asse,json.directionX,json.directionY,json.directionZ);
                                    }
                                    else{
                                        console.log("nessuna asse specificata per newmove");
                                        flag = true;
                                    }
                                }
                                else{
                                    flag = true;
                                    console.log(" newmove work only with term type end");
                                }

                                break;
                            
                            case "move":
                                if (term.type==="End"){
                                    if (json.move){ //spostamento  
                                        var asse = json.move.toString().split(";");
                                        flag = move_ (asse,json.distance,json.tollerance,json.directionX,json.directionY,json.directionZ)
                                    }else{
                                        console.log("nessuna asse specificata per newmove");
                                        flag = true;
                                    }
                                }else{
                                    flag = true;
                                    console.log(" newmove work only with term type end");
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
                
               
    };     

    var LeapStart = function(accept,exp) {
        this.init();
        this.type = "Start";
        this._accepts = function(token) {
            return acceptToken(accept,exp,token,this); 
        };
    };
    LeapStart.prototype = new djestit.GroundTerm();
    djestit.LeapStart = LeapStart;

    var LeapMove = function(accept,exp) {
        this.init();
        this.type = "Move";
        this._accepts = function(token){
            return acceptToken(accept,exp,token,this);             
        };
    };
    LeapMove.prototype = new djestit.GroundTerm();
    djestit.LeapMove = LeapMove;

    var LeapEnd = function(accept,exp) {
        this.init();
        this.type = "End";

        this._accepts = function(token) {
            updateListToken(token);
            return acceptToken(accept,exp,token,this); 

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
                    this.first[token.id] = 0; 
                ////la posizione viene stabilita durante le fasi di gesture
                   // this.frames[token.id] = [];
                case _LEAPMOVE: 
                
                case _LEAPEND:
                    if (this.leaps[token.id].length < this.capacity) {
                        this.leaps[token.id].push(token);
                    } else {
                       //alert("hai impiegato troppo tempo ad eseguire un gesto");
                        console.log("error!!you use too time");
                        thiss.continueLeap = false;
                        
                        
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
             var accept=[] ;
            if (json.accept)
                accept = json.accept.toString().split(";");
            switch (json.gt) {
                case "leap.start":
                    term =  new djestit.LeapStart(accept, json);
                    break;
                case "leap.move":
                    term = new djestit.LeapMove(accept,json);
                    break;
                case "leap.end":
                    term = new djestit.LeapEnd(accept,json);
                    break;
            }
        }   
        return term;
    };
    

  
    
    djestit.registerGroundTerm("leap.start", djestit.leapExpression);
    djestit.registerGroundTerm("leap.move", djestit.leapExpression);
    djestit.registerGroundTerm("leap.end", djestit.leapExpression);



    /*tiene in memoria l'elenco delle gesture che sono state definite e trasforma
    * le informazioni ricevute dal frame leap contenente le informazioni sulle mani,
    * in token che ne rappresentano il movimento compiuto.
    * @param {type} root   rappresenta la lista dei groundTerm
    * @param {type} capacity numero massimo di frame per concludere un gesto
    * @returns {undefined}
    */
    var LeapSensor = function(root, capacity) {
        if (root instanceof djestit.Term) {
            this.root = root; //attributo term, rappresenta la lista
        } else {
            console.log("expressionroot");
            this.root = djestit.expression(root); // analizza root il file json
        }
                var self = this;
       this.sequence = new LeapStateSequence(capacity);
        
       /*? leapToEvent eventToLeap differenza?? */
        this.leapToEvent = [];
        this.eventToLeap = [];
        
        thiss.continueLeap=true;
        this.leapToEvent[0] = -1;
        
        this.tokenToLeap = -1;

        this.generateToken = function(type, leap) {
            var token = new LeapToken(leap, type);
            switch (type) {
                case _LEAPSTART: //mano rilevata
                case _LEAPMOVE: //mano continua ad essere rilevata
                    if ((this.tokenToLeap >= 0)&&(token.id>this.tokenToLeap))
                        token.id = this.eventToLeap[this.tokenToLeap];
                    else{ //la mano viene rilevata per la prima volta oppure la gesture precedente e` stata riconosciuta oppure fallita
                        var leapId = this.firstId(token.id);
                       // console.log("eventToLeap leapID" + leapId + " " + token.id);
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

        /* oggetto per aggiornare il colore della mano 
         */
        this.handsUpdate = {
            scale: 1.0,
            materialOptions: {
                    color: new THREE.Color(_colorNew)
            }
        };
        
        this.changeColorHand = function(_color) {
             self.handsUpdate.materialOptions.color.set(_color);
        };
        
        
        this.colorComplete = function(){
            self.changeColorHand(_colorAccept);
            console.log("colorComplete")
            thiss.continueLeap = false;
             self.root.reset();
            setTimeout(function(){
                thiss.continueLeap = true;
                self.changeColorHand(_colorDefault);
               
             }, 3000,self.handsUpdate);
         
                self.tokenToLeap = -1;             // la gesture e' stata rilevata  viene resetato il valore del primo id della prossima gesture

                      
        };

        /* raiseLeapEvent
         * passa il token al fire, e controlla lo stato del root
         * cioe' se le espressioni sono state concluse
        * @param {type} token 
        * @returns {undefined}
        */
        this._raiseLeapEventHand = function(token) {
                    self.root.fire(token);
                    //console.log("state -> " + self.root.state + "  this ->" + self.root.lookahead(token) + "token.id" + token.id);
                   if ((self.root.state === djestit.ERROR) || (!self.root.lookahead(token))){
                        self.root.reset();
                       
                    }
   
        };
              
       
        /*
         * viene invocato quando per la prima volta la mano 
         * viene acquisita dal leap motion. La mano viene visualizzata 
         * sullo schermo, viene creato il token e chiamata la funzione 
         * _raiseLeapEventHand(token) per verificare il token.
         * @param {type} frame acquisito dal leap motion
         * @param {type} name tipo di token _LEAPSTART,_LEAPMOVE,_LEAPEND
         * @returns {undefined}
         */
        this._raiseLeapEventStart = function (frame,name){
            //aggiornamento della schermata           
            controller.use('riggedHand', self.handsUpdate);
            controller.on('riggedHand.meshAdded', function (handMesh){
         //   handMesh.castShadow = true;
           // handMesh.depthTest = true;
            handMesh.material.opacity = 1;
          
            });

            var riggedHand = controller.plugins.riggedHand;
            var camera = riggedHand.camera;
            camera.position.set(-8,8,20);
            camera.lookAt(new THREE.Vector3(0,0,0));

            var token =  self.generateToken(name, frame);
            self._raiseLeapEventHand(token);
        };
        
        /*
         * viene invocato quando la mano continua ad essere acquisita 
         * dal leap motion.  Viene creato il token e chiamata la funzione 
         * _raiseLeapEventHand(token) per verificare il token.
         * @param {type} frame acquisito dal leap motion
         * @param {type} name tipo di token _LEAPSTART,_LEAPMOVE,_LEAPEND
         * @returns {undefined}
         */
        this._raiseLeapEventMove= function(frame,name){
            var token =  self.generateToken(name, frame);
            this._raiseLeapEventHand(token);
        };
         
        /*
         * viene invocato quando la mano continua ad essere acquisita 
         * dal leap motion.  Viene chiamata la funzione per generare il token,
         * ed eliminare le vecchie acquisizioni.
         * @param {type} frame acquisito dal leap motion
         * @param {type} name tipo di token _LEAPSTART,_LEAPMOVE,_LEAPEND
         * @returns {undefined}
         */
        this._raiseLeapEventEnd = function(frame,name){
           self.generateToken(name, frame);
        }; 


 
        
        /*
         * controlla che i frame siano validi e a 
         * seconda della presenza della mano chiama  
         * l'evento assocciato
         * @param {type} frame acquisito dal leap motion
         * @returns {undefined}
         */
        this._raiseLeapEvent = function(frame){
            if ((frame.valid)&&(thiss.continueLeap)){
            //primo frame da analizzare
                if ((frame.hands.length>0)&&(thiss.previousFrame ===null)){
                    console.log("indice");
                    self._raiseLeapEventStart(frame,_LEAPSTART);
                    thiss.previousFrame=frame;
                }
                else //secondo frame da analizzare
                    if (frame.hands.length>0){
                        self._raiseLeapEventMove(frame,_LEAPMOVE);
                    }
                        else {// la mano non viene rilevata
                            thiss.previousFrame=null;
                            self._raiseLeapEventEnd(frame,_LEAPEND);
                        }
            }else{
                 thiss.previousFrame=null;
                self._raiseLeapEventEnd(frame,_LEAPEND);
                thiss.continueLeap = true;
                console.log("indice222");
            }
        };
        
        /* parte di acquisizione dati dal Leap Motion*/
               //crea un nuovo Leap.controller
        controller = new Leap.Controller({enableGesture: true});
            /*aggiunge la funzione _raiseLeapEvent per l'evento frame
             * il quale viene ripetuto ciclicamente*/
            controller.streaming();  
        controller.on('frame', this._raiseLeapEvent);          
            /* connette il controller oggetto con il Leap Motion WebSocket
             * se la connessione avviene i dati dal Leap motion possono essere
             * prelevati
             * */
        controller.connect();

    };

    djestit.LeapSensor = LeapSensor;


}(window.djestit = window.djestit || {}, undefined));
