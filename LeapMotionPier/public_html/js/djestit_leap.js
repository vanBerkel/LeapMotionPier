

(function(djestit, undefined) {

    var _LEAPSTART = 1;
    var _LEAPMOVE = 2;
    var _LEAPEND = 3;
    
    var _HandClose = 0.7;
    var _HandOpen = 0.2;
    
    var _thumbOpen = 0.7;
    

   
//leap e' il frame da analizzare considera la mano 
    var LeapToken = function(leap, type) {
             
        /* grabStrength > 0.5 close hand */
        if (leap.grabStrength >= _HandClose)
            this.close = true;
        else
            this.close = false;
        
        if (leap.grabStrength <= _HandOpen)
            this.open = true;
        else 
            this.open = false;
        
        
        this.thumb = leap.thumb;
        this.arm = leap.arm; // for the wrist arm.basis[0]
        
        
        
        
        this.id = leap.id;
        this.palmPosition = leap.palmPosition;
        this.hand=leap;
        
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
        this.start = []; //identifica il frame di partenza
        this.push = function(token) {
            this._push(token);
          
            switch (token.type) {
                case _LEAPSTART:
                    this.leaps[token.id] = [];
                    this.l_index[token.id] = 0;
                    this.start[token.id]=0;
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
                          console.log("thumb " + token.thumb.direction[0]);

                    for(i=0; i<accept.length; i++){
                        switch (accept[i]){
                            case "close":
                                flag =  flag && token.close;
                                
                                break;
                            case "open":
                                flag = flag && token.open;
                                break;
                            case "thumb":
                                if (json.direction){
                                    switch (json.direction){
                                        case "x":        
                                               switch (term.type){
                                                   case "Move":
                                                       break;
                                                   case "End":
                                                     flag = flag && (Math.abs(token.thumb.direction[0]))>= _thumbOpen;
                                                       break;
                                                   case "Start":
                                                      flag = flag && (Math.abs(token.thumb.direction[0]))>= _thumbOpen;
                                                       break;
                                               }
                                            break;
                                        case "y":
                                                switch (term.type){
                                                   case "Move":
                                                       break;
                                                   case "End":
                                                      flag = flag && (Math.abs(token.thumb.direction[1]))>= _thumbOpen;
                                                       break;
                                                   case "Start":
                                                      flag = flag && (Math.abs(token.thumb.direction[1]))>= _thumbOpen;
                                                       break;
                                               }
                                            break;
                                        
                                        case "z":
                                                 switch (term.type){
                                                   case "Move":
                                                       break;
                                                   case "End":
                                                       //flag = flag && (Math.abs(token.thumb.direction[2])=> _thumbOpen);
                                                       break;
                                                   case "Start":
                                                       //flag = flag && (Math.abs(token.thumb.direction[2])=> _thumbOpen);
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
                                if (json.asse){ //spostamento 
                                     switch (json.asse){
                                            case "x"://spostamento asse x
                                                if (token.sequence.start[json.tid]!=null){
                                                    var curr = token.sequence.start[json.tid];

                                                    if (term.type==="End"){
                                                        flag =  flag && (Math.abs(token.palmPosition[0]) - Math.abs(curr.palmPosition[0]))> (20);/*&&
                                                                (Math.abs(token.palmPosition[1]) - Math.abs(curr.palmPosition[1]))> (-1)
                                                                &&(Math.abs(token.palmPosition[1]) - Math.abs(curr.palmPosition[1]))<(1)&&
                                                                (Math.abs(token.palmPosition[2]) - Math.abs(curr.palmPosition[2]))> (-1)
                                                                &&(Math.abs(token.palmPosition[2]) - Math.abs(curr.palmPosition[2]))<(1);        */                                  ;
                                                    }
                                                }
                                               
                                                break;
                                            case "y":
                                                 if (token.sequence.start[json.tid]!=null){
                                             
                                                    var curr = token.sequence.start[json.tid];
                                                     if (term.type==="End"){
                                                         flag =  flag && (Math.abs(token.palmPosition[1]) - Math.abs(curr.palmPosition[1]))> (20);/*&&
                                                                 (Math.abs(token.palmPosition[1]) - Math.abs(curr.palmPosition[1]))> (-1)
                                                                 &&(Math.abs(token.palmPosition[1]) - Math.abs(curr.palmPosition[1]))<(1)&&
                                                                 (Math.abs(token.palmPosition[2]) - Math.abs(curr.palmPosition[2]))> (-1)
                                                                 &&(Math.abs(token.palmPosition[2]) - Math.abs(curr.palmPosition[2]))<(1);        */                                  ;
                                                    }
                                               
                                                 }
                                                break;
                                            case "z":
                                                break;
                                            
                                        }
                                   
                                }    
                                else{
                                    console.log("you forgot to define the item asse");
                                }
                            
                        }
                            
                        
                        
                    }
                    if (flag){
                        token.type2 = term.type;
                        if (token.type2 === "Start"){
                            token.sequence.start[json.tid] = token;
                            console.log("tokenkkkkkk");
                        }
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
        this.element.on('hand', function(hand){
            hands.updateHand(hand,null);
            
            self._raiseLeapEvent(hand, _LEAPMOVE);

        });
             this.element.use('handHold');
             this.element.use('handEntry');
            
             this.element.on('handFound', function(hand) {
                document.getElementById("up").textContent = "fai un gesto";
                self._raiseLeapEvent(hand,_LEAPSTART);
                hands.newHand(hand,null);
            });
             this.element.on('handLost', function(hand) {
                document.getElementById("up").textContent = "metti la mano sopra il leap motion";
                
                self._raiseLeapEvent( hand,_LEAPEND);
                hands.lostHand(hand);
            });

           
        this.element.connect();
        
        
        
        
        
    };

    djestit.LeapSensor = LeapSensor;


}(window.djestit = window.djestit || {}, undefined));
