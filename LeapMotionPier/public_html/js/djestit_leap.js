
(function(djestit, undefined) {

    var _LEAPSTART = 1;
    var _LEAPMOVE = 2;
    var _LEAPEND = 3;

   
//leap e' il frame da analizzare
    var LeapToken = function(leap, type) {
             
        this.hands = leap.hands; // array che contiene tutte le informazioni delle mani  
        this.gestures = leap.gestures; // array che contiene tutti i gesti identificati da questo frame
        this.tools = leap.tools; // array di tool identificati in questo frame
        this.pointables = leap.pointables; // array che contiene tutti i puntatori dita e o tool
        this.fingers = leap.fingers; //array che contiene tutte le informazioni delle dita 
        

        this.currentFrameRate = leap.currentFrameRate; // tempo che il controller produce frame!! diverso a seconda dell applicazione
        //normalizza la posizione da 0 a 1
        this.interactionBox = leap.iteractionBox; 
        //tempo in microsecondi da quando l app ha avuto inizio
        this.timestamp = leap.timestamp;
        this.valid = leap.valid;
        
        this.close =-1;
        this.id =-1;
        this.palmPosition =[];
        if ((leap.hands!==null) && (leap.hands.length>0)){
            this.close = leap.hands[0].grabStrength; // solo una mano
            //hand.grabStrength
            this.id = this.hands[0].id;
            //this.palmPosition = this.hand.palmPosition;
        }

        
        //this.close = leap.hands[0].grabStrength;
       // console.log("this.close" + close + " grab" + leap.hands[0].grabStrength);
        
        
        //this.id = leap.id; 
        this.type = type; // _LEAPSTART _LEAPMOVE _LEAPEND
    };
    LeapToken.prototype = new djestit.Token();
    djestit.LeapToken = LeapToken;

    /* quando deve venire richiamato */
    var LeapStart = function(id) {
        this.init();
        this.id = id;
      //  console.log('dentro leapStar ->' + id );
        this._accepts = function(token) {
          /*  if (token.type !== _LEAPSTART) {
                return false;
            }*/
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
        //console.log('dentro leapMove ->' + id );

        this._accepts = function(token) {
           /* if (token.type !== _LEAPMOVE) {
                return false;
            }*/
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
       // console.log('dentro leapEnd ->' + id );
        this._accepts = function(token) {
            /*if (token.type !== _LEAPEND) {
                return false;
            }*/
            if (this.id && this.id !== null && this.id !== token.id) {
                return false;
            }
            return true;
        };
    };
    LeapEnd.prototype = new djestit.GroundTerm();
    djestit.LeapEnd = LeapEnd;

/* controlla lo i GroundTerm */
    var LeapStateSequence = function(capacity) {
        this.init(capacity);
        this.leaps = [];
        this.l_index = [];


        this.push = function(token) {
            this._push(token);
          
            switch (token.type) {
                case _LEAPSTART:
                    this.leaps[token.id] = [];
                    this.l_index[token.id] = 0;
                case _LEAPMOVE:
                case _LEAPEND:
                    console.log('token id > ' + token.id + 'capacity > ' + this.capacity + 'type> ' + token.type + 'length> '+this.leaps[token.id].length);
                   
                    if (this.leaps[token.id].length < this.capacity) {
                        this.leaps[token.id].push(token);
                        console.log('push del token in posizione ' + token.id);
                    } else {
                        this.leaps[token.id][this.l_index[token.id]] = token;
                    }
                    this.l_index[token.id] = (this.l_index[token.id] + 1) % this.capacity;
                    break;

            }
            
            
        };

        this.getById = function(delay, id) {
            var pos = 0;
            if(this.leaps[id].length < this.capacity){
                pos = this.t_index[id] - delay -1;
            }else{
                pos =(this.t_index[id] - delay - 1  + this.capacity) % this.capacity;
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
                        //var itemName = accept[i].toString().split()
                        switch (accept[i]){
                            case "close":
                               
                                if (json.close){
                                    if (json.closeOperator){
                                        switch (json.closeOperator){
                                            case ">":
                                                flag = token.close > json.close;
                                                break;
                                            case "<":
                                                flag = token.close < json.close;
                                                break;
                                            case "=":
                                                flag = token.close ===json.close;
                                                break;
                                            
                                        }
                                    }else
                                        flag = token.close === json.close;
                                }
                                else{
                                    console.log("you forgot to define the item close");
                                }
                                
                                break;
                            
                            
                        }
                            
                        
                        
                    }
                    
                    
                    return flag;
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
 */
    var LeapSensor = function(element, root, capacity) {
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
                    //? non si può scrivere direttamente leap.identifier
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
 *  viene lanciato quando?????
 * @param {type} event
 * @param {type} name example _LEAPSTART
 * @returns {undefined}
 * 
 */
        this._raiseLeapEvent = function(frame, name) {
         //console.log("raiseLeapEvent");
                var token = self.generateToken(name, frame);
                if (token.id !== undefined){
                    //console.log("token.id -> " + token.id);
                
                    self.root.fire(token);
                    //self.root.lookahead(token);
                    console.log("state -> " + self.root.state + "  self ->" + self.root.lookahead(token));
                   // if (self.root.state = djestit.COMPLETE){
                     //   self.root.reset();
                        
                    //}
                    //console.log("state2 -> " + self.root.state + "  self ->" + self.root.lookahead(token));
                      //  this.element.disconnect();
                        

                    /*}else  if (self.root.state = djestit.COMPLETE){
                      //  this.element.disconnect();
                        console.log("state -> " + self.root.state + "  self ->" + self.root.lookahead(token) + "token.id" + token.id);

                    }*/
                        
                        
                }
        };

        this._onLeapStart = function(frame) {
            self._raiseLeapEvent(frame,_LEAPSTART);
        };

        this._onLeapMove = function(frame) {
            self._raiseLeapEvent(frame, _LEAPMOVE);
        };

        this._onLeapEnd = function(frame) {
            self._raiseLeapEvent( frame,_LEAPEND);
        };
    
 
        this.element.on('connect', function(){
        var flag = false;
        setInterval(function(){
           var frame = element.frame();
          // console.log('<p>Frame: ' + frame.id + ' is ' + (frame.valid ? 'valid.</p>' : 'invalid.</p>'));
           if (frame.hands.length>0){
               if (flag==false){
                    self._onLeapStart(frame);
                   // console.log("mani id" + frame.hands[0].id);
                    flag=true;
                }
                else 
                    self._onLeapMove(frame);
              //self.token.type = 1;
            }
           else{
               flag=false;
              self._onLeapEnd(frame);
               //this._onLeapEnd;
               //token.type =3;
           }
        }, 200);
        });

        this.element.connect();
/*
 
 
        this.element.addEventListener(
               LeapEvent.LEAPMOTION_INIT, onInit
               );
  /*      this.element.addEventListener(
                "touchmove",
                this._onLeapMove,
                false);
        this.element.addEventListener(
                "touchend",
                this._onLeapEnd,
                false);
        this.element.addEventListener(
                "touchcancel",
                this._onLeapEnd,
                false);*/
    };

    djestit.LeapSensor = LeapSensor;


}(window.djestit = window.djestit || {}, undefined));
