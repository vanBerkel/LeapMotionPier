
(function(djestit, undefined) {

    var _LEAPSTART = 1;
    var _LEAPMOVE = 2;
    var _LEAPEND = 3;
    
    var _HandClose = 0.7;
    var _HandOpen = 0.2;
    
    var _fingerOpen = 0.7;
    
    var _handClapDistance = 45;
    
    var positionUp = 200; // position y>100
    var _handMove = 20;
    var _leftHand = "left";
    var _rightHand = "right";
    
    var _longDistance = 4; // long distance for few movement

    var _differenceDistance = 6;
//leap e' il frame da analizzare considera la mano 
    var LeapToken = function(leap, type) {
        if (type!=_LEAPEND){
        
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
            if (leap.hands.length >1){
                this.hands2 = leap.hands[1];
                console.log(this.hand.palmPosition[0]- this.hands2.palmPosition[0] + "ssss");

                if (Math.abs((this.hand.palmPosition[0] - this.hands2.palmPosition[0])) < _handClapDistance){
                    this.separate = false;
                }
                else 
                    this.separate = true;
                
            }
           
           
          // console.log(this.hand.pitch());
           
            /* grabStrength > 0.5 close hand */
            //console.log(leap);
            if (this.hand.grabStrength >= _HandClose)
                this.close = true;
            else
                this.close = false;

            if (this.hand.grabStrength <= _HandOpen)
                this.open = true;
            else 
                this.open = false;
            
            this.indexFinger = this.hand.indexFinger;
            
          //  console.log("indexFinger",this.indexFinger);

            this.thumb = this.hand.thumb;
            this.arm = this.hand.arm; // for the wrist arm.basis[0]
           // this.armX = this.arm.basis[0];
            //console.log("rotationX", this.hand.rotationAxis());
            
            //console.log("rotationAngle",this.hand.rotationAngle());

           //ar, console.log("roll", this.hand.roll());



            this.palmPosition = this.hand.palmPosition;
        //this.hand=leap;
       // }
   
        this.id = this.hand.id;
        }else
             this.id = leap.id;
    
        //this.id = leap.id; 
        this.type = type; // _LEAPSTART _LEAPMOVE _LEAPEND identifica se la mano e' sopra il leap
        this.type2; //identifica se il ground term e' di tipo start move e complete
    };
    LeapToken.prototype = new djestit.Token();
    djestit.LeapToken = LeapToken;

   
   
    var LeapStart = function(id) {
        this.init();
        this.id = id;
        this.type = "Start";
        this._accepts = function(token) {
   
            if (this.id && this.id !== null && this.id !== token.id) {
                return false;
            }
            return true;
        };
    };
    LeapStart.prototype = new djestit.GroundTerm();
    djestit.LeapStart = LeapStart;

    var LeapMove = function(id) {
        this.init();
        this.id = id;
        this.type = "Move";
        this._accepts = function(token) {
            if (this.id && this.id !== null && this.id !== token.id) {
                return false;
            }
            return true;
        };
    };
    LeapMove.prototype = new djestit.GroundTerm();
    djestit.LeapMove = LeapMove;

    var LeapEnd = function(id) {
        this.init();
        this.id = id;
        this.type = "End";
        this._accepts = function(token) {
            if (this.id && this.id !== null && this.id !== token.id) {
                return false;
            }
            return true;
        };
    };
    LeapEnd.prototype = new djestit.GroundTerm();
    djestit.LeapEnd = LeapEnd;

//capacity indica quanti frame devono essere salvati
    var LeapStateSequence = function(capacity) {
        this.init(capacity);
        this.leaps = [];
        this.l_index = [];
        this.frames = []; //identifica tutti i frame da start fino all ultimo end
        this.push = function(token) {
            this._push(token);
          
            switch (token.type) {
                case _LEAPSTART:
                    this.leaps[token.id] = [];
                    this.l_index[token.id] = 0;
                    
                    this.frames[token.id] = [];
                case _LEAPMOVE: 
                case _LEAPEND:
                    if (this.leaps[token.id].length < this.capacity) {
                        this.leaps[token.id].push(token);
                    } else {
                       this.leaps[token.id][this.l_index[token.id]] = token;
                    }
                    this.l_index[token.id] = (this.l_index[token.id] + 1) % this.capacity;
                    break;

            }
            
            
        };

/*ritorna i dati del token leap in un determinato istante*/
       this.getById = function(delay, id) {
            var pos = 0;
            if(this.leaps[id].length < this.capacity){
                pos = this.l_index[id] - delay -1;
            }else{
                pos =(this.l_index[id] - delay - 1  + this.capacity) % this.capacity;
            }
            return this.leaps[id] [pos];
        };
     
        
    };


    LeapStateSequence.prototype = new djestit.StateSequence();

    djestit.LeapStateSequence = LeapStateSequence;

    djestit.leapExpression = function(json) {
        var term;
        if (json.gt) {
            switch (json.gt) {
                case "leap.start":
                    term =  new djestit.LeapStart(json.tid);
                    break;
                case "leap.move":
                    term = new djestit.LeapMove(json.tid);
                    break;
                case "leap.end":
                    term = new djestit.LeapEnd(json.tid);
                    break;
            }
            if (json.accept){
               
                term.accepts = function(token) {
                    var flag = true;
                    var accept = json.accept.toString().split(";");
                    
                   
                    for(i=0; i<accept.length; i++){
                        if (term.type !=="Start"){
                            if ((token.sequence.frames[json.tid]!==null) && (token.sequence.frames[json.tid].length>0)){    
                                var moveToken = token.sequence.frames[json.tid];
                                var aux = token.sequence.frames[json.tid][0];
                                var start = token.sequence.frames[json.tid][0];
                                var listRightLeft = [];
                                var listLeftRight = [];
                                var listUpDown = [];
                                var listDownUp = [];
                                
                              
                                var posEnd = [0,0,0,0];//right,left,up,down
                                for(var t=1; t< moveToken.length; t++){
                                    if (moveToken[t].type2==="End"){
                                        posEnd[0]=(listRightLeft.length);
                                        posEnd[1]=(listLeftRight.length);
                                        posEnd[2]=(listUpDown.length);
                                        posEnd[3]=(listDownUp.length);

                                        
  
                                    }
                                    
                                    if (moveToken[t].palmPosition[1]>aux.palmPosition[1]+_longDistance){
                                        listDownUp.push(moveToken[t]);
                                    }else{
                                        if (moveToken[t].palmPosition[1]<aux.palmPosition[1]-_longDistance){
                                            listUpDown.push(moveToken[t]);
                                        }
                                    }
                                    if (moveToken[t].palmPosition[0]<aux.palmPosition[0]-_longDistance){
                                        listLeftRight.push(moveToken[t]);
                                    }else{
                                        if (moveToken[t].palmPosition[0]>aux.palmPosition[0]+_longDistance){
                                            listRightLeft.push(moveToken[t]);
                                        }
                                    }

                                    aux = moveToken[t];                                            
                                }
                            }
                        }
                    
                        
                        switch (accept[i]){
                            case "close":
                                flag =  flag && token.close;

                                break;
                            case "position":
                                switch(json.position){
                                    case "up":
                                        flag = flag && token.palmPosition[1] > 100;
                                        break;
                                    case "down":
                                        flag = flag && token.palmPosition[1] < 100;
                                        break;
                                    case "right":
                                        flag = flag && token.palmPosition[0] > 80;
                                        break;
                                    case "left":
                                        flag = flag && token.palmPosition[0] < (-80);
                                        break;
                                    case "center":
                                        flag = flag && (token.palmPosition[0] >(-20) && token.palmPosition[0] <(20)) ;

                                        break;
                                    case "upright":
                                        console.log("position upright not definied");
                                        break;
                                    case "upleft":
                                        console.log("position upleft not definied");
                                        break;
                                    case "downright":
                                        console.log("position downright not definied");
                                        break;
                                    case "downleft":
                                        console.log("position downleft not definied");
                                        break;
                                    
                                    
                                    
                                }
                                console.log("position" + json.position + " " + flag); 
                                break;
                            case "2hands":
                                if (token.hands2){
                                        flag = flag && (json.separate === token.separate)
                                }
                                else
                                    flag = false;
                                break;
                            
                            case "samePosition": /// same position range 30+-
                                var samePosition = json.samePosition.toString().split(";");
                                if (start!==null) 
                                    for(var k=0; k<samePosition.length;k++){
                                        switch(samePosition[k]){
                                            case "y":
                                                console.log("startPosition " + start.palmPosition[1] + "> token.palmPosition" + (token.palmPosition[1]-30) + "<tokenpalmposition" +token.palmPosition[1]+30);
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
                                
                                break;
                            case "open":
                                flag = flag && token.open;
                                break;
                        
                            case "semicircle":
                                if ((start!==null)){  

                                    console.log("listDownUp " + listDownUp.length + " listUpDown " + listUpDown.length +
                                            "rightleft " + listRightLeft.length + "leftright " + listLeftRight.length +
                                            "listDownUp x2 " + (listDownUp.length + _differenceDistance) + 
                                            "_differenceDistance" + _differenceDistance);
                                    
                                    flag = flag && listDownUp.length > 2 && listRightLeft.length > (listDownUp.length + _differenceDistance) 
                                            && listUpDown.length >2
                                    /*&& ((listRightLeft.length > 2 && 
                                            listRightLeft.length < posEnd[0]*2 + _differenceDistance &&
                                            listRightLeft.length > posEnd[0]*2 - _differenceDistance)
                                            || listLeftRight.length >2) 
                                            && listDownUp.length > (listUpDown.length - _differenceDistance) 
                                            && (listDownUp.length < (listUpDown.length + _differenceDistance)) */; 
                                    
                                    
                                    if (flag){
                                      
                                        
                                        
                                        
                                        var sX = start.palmPosition[0]; 
                                        var eX = moveToken[moveToken.length-1].palmPosition[0];
                                        
                                        var sY = start.palmPosition[1];
                                        var eY = moveToken[moveToken.length-1].palmPosition[1];
                                        
                                        var X2 = listUpDown[0].palmPosition[0];
                                        var Y2 = listUpDown[0].palmPosition[1];
                                        
                                        
                                        var X1 = listDownUp[listDownUp.length-1].palmPosition[0];
                                        var Y1 = listDownUp[listDownUp.length-1].palmPosition[1];
                                        
                                        var m1 = Math.round(((Y1 - sY) / (X1 - sX)) * 100) / 100;
                                        
                                        console.log("m" + m1);
                                        for (var count = 0; count< listDownUp.length; count++){
                                                X1 = listDownUp[count].palmPosition[0];
                                                Y1 = listDownUp[count].palmPosition[1];
                                                m1 = Math.round(((Y1 - sY) / (X1 - sX)) * 100) / 100;
                                                console.log (count + "listDownUp m1 " + m1);
                                        
                                        }                                       
                                        
                                        
                                        /*
                                         * var centerPointX = (sX + eX + X1 + X2)/4;
                                        var centerPointY = (sY + eY + Y1 + Y2)/4;
                                        
                                        var raggio1 = Math.sqrt(((sX - centerPointX) * (sX - centerPointX)) +((sY - centerPointY) * (sY - centerPointY)));
                                        var raggio3 = Math.sqrt(((X1 - centerPointX) * (X1 - centerPointX)) +((Y1 - centerPointY) * (Y1 - centerPointY)));
                                        var raggio4 = Math.sqrt(((X2 - centerPointX) * (X2 - centerPointX)) +((Y2 - centerPointY) * (Y2 - centerPointY)));

                                       
                                        var raggio2 = Math.sqrt(((eX - centerPointX) * (eX - centerPointX)) +((eY - centerPointY) * (eY - centerPointY)));
                                       
                                       
                                        console.log( "raggio" + raggio1 + " raggio2" + raggio2 + "raggio3" + raggio3 + "raggio4" + raggio4
                                        + "raggiomedia" + (raggio1+raggio2+raggio3+raggio4)/4 );

                                        for (var count = 0; count< listDownUp.length; count++){
                                                sX = listDownUp[count].palmPosition[0];
                                                sY = listDownUp[count].palmPosition[1];
                                                raggio1 = Math.sqrt(((sX - centerPointX) * (sX - centerPointX)) +((sY - centerPointY) * (sY - centerPointY)));

                                                console.log (count + "listDownUp" + raggio1);
                                        
                                        }
                                        for (var count = 0; count< listUpDown.length; count++){
                                                sX = listUpDown[count].palmPosition[0];
                                                sY = listUpDown[count].palmPosition[1];
                                                raggio1 = Math.sqrt(((sX - centerPointX) * (sX - centerPointX)) +((sY - centerPointY) * (sY - centerPointY)));

                                                console.log (count + "listUpDown" + raggio1);
                                        }
                                       */
                                      
                                      
                                      
                                      
                                      
                                      
                                      
                                      
                                      
                                      
                                      
                                      
                                    }
                                
                                }
                                break;
                            case "palm":
                                
                                switch (json.palmXY){
                                    case "normalUp"://mano rivolta verso l alto
                                        if (token.hand.type === _rightHand){
                                            flag = flag && ((token.hand.roll())> (5*Math.PI/6) ||((token.hand.roll()) <(-5*Math.PI/6)));
                                        }
                                        else{
                                            flag = flag && ((token.hand.roll())< (Math.PI/12) ||((token.hand.roll()) > (-Math.PI/12)));
                                        }
                                         break;
                                    case "normalDown":
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
                                            console.log("normalUp PalmZY ancora da definire");
                                        break;
                                    case "normalDown":
                                            console.log("normalDown PalmZY ancora da definire");
                                        break;
                                    case "up":
                                        if (token.hand.type === _leftHand){
                                            flag = flag && ((token.hand.pitch())> Math.PI/3) &&((token.hand.pitch()) < (2*Math.PI/3));
                                        }
                                        else{
                                            console.log("token.hand" + token.hand.pitch() + "<-/3" + (-Math.PI/3) + ">-2/3" + -2*Math.PI/3);
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
                                        console.log("down PalmZY ancora da definire forse meglio");

                                        
                                        break;
                                }    
                                switch (json.palmXZ){
                                    case "normalUp":
                                            console.log("normalUp PalmXZ ancora da definire");
                                        break;
                                    case "normalDown":
                                            console.log("normalDown PalmXZ ancora da definire");
                                        break;
                                    case "up":
                                        console.log("up PalmXZ ancora da definire");

                                        break;
                                    case "down":
                                        console.log("down PalmXZ ancora da definire");

                                        
                                        break;
                                }     
                                
                                
                                break;
                            case "press":
                                
                                    switch (term.type){
                                    case "Move":
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
                                            flag = flag && token.pointable[index].touchZone === "touching" ;
                                     
                                  //console.log("eccodi " + token.pointable);

                                        break;
                                    case "End":
                                        if (token.gesture  && token.gesture.type === "screenTap"){
                                            console.log("end press");
                                            flag = flag  && token.gesture.state==="stop";
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
                                        }
                                    }
                                        else
                                            flag = false;
                                        break;
                                    case "Start":
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
                                           // console.log("eccodi " + token.pointable);
                                            flag = flag && token.pointable[index].touchZone === "touching" ;
                                        break;
                                    
                                    
                                    }
                                
                                break;

                            case "circle":
                                if (token.gesture  && token.gesture.type === "circle"){
                                    switch (term.type){
                                    case "Move":
                                        console.log("move circle" + token.gesture.progress);
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
                                        }console.log("start circle" + token.gesture.state + flag);
                                        break;
                                    
                                    
                                    }
                                }else 
                                    flag = false;
                                break;
                            case "thumb":
                                if (json.direction){
                                    switch (json.direction){
                                        case "x":        
                                               switch (term.type){
                                                   case "Move":
                                                       break;
                                                   case "End":
                                                     flag = flag && (Math.abs(token.thumb.direction[0]))>= _fingerOpen;
                                                       break;
                                                   case "Start":
                                                      flag = flag && (Math.abs(token.thumb.direction[0]))>= _fingerOpen;
                                                       break;
                                               }
                                            break;
                                        case "y":
                                                switch (term.type){
                                                   case "Move":
                                                       break;
                                                   case "End":
                                                      flag = flag && (Math.abs(token.thumb.direction[1]))>= _fingerOpen;
                                                       break;
                                                   case "Start":
                                                      flag = flag && (Math.abs(token.thumb.direction[1]))>= _fingerOpen;
                                                       break;
                                               }
                                            break;
                                        
                                        case "z":
                                                 switch (term.type){
                                                   case "Move":
                                                       break;
                                                   case "End":
                                                       //flag = flag && (Math.abs(token.thumb.direction[2])=> _fingerOpen);
                                                       break;
                                                   case "Start":
                                                       //flag = flag && (Math.abs(token.thumb.direction[2])=> _fingerOpen);
                                                       break;
                                               }
                                            break;
                                        
                                        
                                    }
                                    
                                    
                                }
                                else{
                                    console.log("you forgot the item direction for the thumb case");
                                }
                                
                                break;
                            case "move":
                                if (json.move){ //spostamento  
                                    var asse = json.move.toString().split(";");
                                    for(var j=0; j<asse.length; j++){
                                        switch (asse[j]){
                                                
                                                case "x"://spostamento asse x
                                                    if (term.type==="End"){
                                                        console.log("listRightLeft " + listRightLeft.length + " listLeftRight " + listLeftRight.length );

                                                        switch(json.directionX){

                                                             case "leftright":
                                                                 flag = flag && listLeftRight.length > (0) && (listRightLeft.length === 0 );   
                                                                 break;
                                                             case "rightleft":
                                                                 flag = flag && listLeftRight.length === (0) && (listRightLeft.length >0 );                                                                  
                                                                break;
                                                            default:
                                                                flag = flag && (listLeftRight.length >(0) || (listRightLeft.length >0 ));                                                                  break;

                                                                 break;
                                                             
                                                        }
                                                                        
                                                    }
                                                                                             
                                                    break;
                                                 case "y":                                                  
                                                     if (term.type==="End"){
                                                        console.log("listDownUp " + listDownUp.length + " listUpDown " +listUpDown.length );

                                                         switch(json.directionY){
                                                             case "updown":
                                                                 
                                                                flag = flag && listDownUp.length === (0) && (listUpDown.length >0 ); 
                                                                break;
                                                             case "downup":
                                                                flag = flag && listDownUp.length > (0) && (listUpDown.length ===0 ); 
                                                                break;
                                                             default:
                                                                flag = flag && (listDownUp.length > (0) || (listUpDown.length >0 )); 
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
                            
                        }
                            
                        
                        
                }
                    if (flag){
                        token.type2 = term.type;
                        token.sequence.frames[json.tid].push(token);

                    }
                    return flag ;
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
    var LeapSensor = function(element, hands, root, capacity) {
        
        this.element = element;
        if (root instanceof djestit.Term) {
            this.root = root; //attributo term, rappresenta la lista
        } else {
            this.root = djestit.expression(root); // analizza root il file json
           
            
            
        }
        this.sequence = new LeapStateSequence(capacity);
       /*? leapToEvent eventToLeap differenza?? */
        this.leapToEvent = [];
        this.eventToLeap = [];
        // we do not use zero as touch identifier
        this.leapToEvent[0] = -1;
        var self = this;

        this.generateToken = function(type, leap) {
            var token = new LeapToken(leap, type);
            switch (type) {
                case _LEAPSTART: //mano rilevata
                    
                    var leapId = this.firstId(token.id);
                    this.eventToLeap[token.id] = leapId;
                    this.leapToEvent[leapId] = [token.id];
                    token.id = leapId;
                    //console.log("LeapStart > " +token.id);
   
                    break;
                case _LEAPMOVE: //mano continua ad essere rilevata
                    // console.log("LeapMove > " +token.id);
                    token.id = this.eventToLeap[token.id];
                    //console.log("LeapMove > " +token.id);
                   break;
                case _LEAPEND: //mano fuori dalla vista
                   //rimuovi tutto???

                    token.id = this.eventToLeap[leap.id];
                    delete this.eventToLeap[leap.id];
                    this.leapToEvent[token.id] = null;
                    
                   break;
            }
            //console.log('token id' + token.id + 'leap id' + leap.id);
            if (token.id !== undefined){
                this.sequence.push(token);
                token.sequence = this.sequence;
            }
            return token;
        };

        this.firstId = function(id) {
            for (var i = 1; i < this.leapToEvent.length; i++) {
                if (this.leapToEvent[i] === null) {
                    return i;
                }
                return 1;
            }
            this.leapToEvent.push(id);
            return this.leapToEvent.length - 1;
        };

/* raiseLeapEvent
 * @param {type} event
 * @param {type} name example _LEAPSTART
 * @returns {undefined}
 * 
 */
        this._raiseLeapEvent = function(frame, name) {
                var token = self.generateToken(name, frame);
                if (token.id !== undefined){
               
                    self.root.fire(token);
                    console.log("state -> " + self.root.state + "  self ->" + self.root.lookahead(token));
                    if (self.root.state === djestit.COMPLETE){
                        console.log("gesto completato");
                        self.root.reset();
                        
                    }
                   if ((self.root.state === djestit.ERROR) || (!self.root.lookahead(token))){
                         console.log("gesto non completato");
                        self.root.reset();
                        
                    }
                        
                        
                }
        };

            
                
       /* this.element.on('connect', function(){
            setInterval(function(){
            
            }, 200);
        });       */ 
                
        this.element.streaming();    
        

        var previousFrame = null;
        this.element.on('frame', function(frame){
            if (frame.valid){
            //setInterval (function(){
            //primo frame da analizzare
                if ((frame.hands.length >0)&&(previousFrame ===null)){
                    self._raiseLeapEvent(frame,_LEAPSTART);
                    previousFrame=frame;
                }
                else //secondo frame da analizzare
                    if (frame.hands.length>0){

                        self._raiseLeapEvent(frame,_LEAPMOVE);
                    }
                        else {// ultimo frame
                            previousFrame=null;
                            //self._raiseLeapEvent(frame,_LEAPEND);
                        }
            //},5000);
  
        }
        });
        
        
        
        this.element.use('handHold');
        this.element.use('handEntry');
        
        this.element.on('hand', function(hand) {
                //self._raiseLeapEvent(hand,_LEAPMOVE);
                hands.updateHand(hand,null);
        });
        this.element.on('handFound', function(hand) {
                document.getElementById("up").textContent = "fai un gesto";
               // self._raiseLeapEvent(hand,_LEAPSTART);

                hands.newHand(hand,null);
        });
        this.element.on('handLost', function(hand) {
                document.getElementById("up").textContent = "metti la mano sopra il leap motion";
                hands.lostHand(hand);
                self._raiseLeapEvent(hand,_LEAPEND)
        });
        
        
        
        
       
            

           
     this.element.connect();
        
        
        
        
        
    };

    djestit.LeapSensor = LeapSensor;


}(window.djestit = window.djestit || {}, undefined));
