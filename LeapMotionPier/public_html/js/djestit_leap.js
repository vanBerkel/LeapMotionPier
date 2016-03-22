
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
        
        
        this.id = leap.id; 
        this.type = type; // _LEAPSTART _LEAPMOVE _LEAPEND
    };
    LeapToken.prototype = new djestit.Token();
    djestit.LeapToken = LeapToken;

    var LeapStart = function(id) {
        this.init();
        this.id = id;

        this._accepts = function(token) {
            if (token.type !== _LEAPSTART) {
                return false;
            }
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

        this._accepts = function(token) {
            if (token.type !== _LEAPMOVE) {
                return false;
            }
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

        this._accepts = function(token) {
            if (token.type !== _LEAPEND) {
                return false;
            }
            if (this.id && this.id !== null && this.id !== token.id) {
                return false;
            }
            return true;
        };
    };
    LeapEnd.prototype = new djestit.GroundTerm();
    djestit.LeapEnd = LeapEnd;


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
                    if (this.leaps[token.id].length < this.capacity) {
                        this.leaps[token.id].push(token);
                    } else {
                        this.leaps[token.id][this.l_index[token.id]] = token;
                    }
                    this.l_index[token.id] = (this.l_index[token.id] + 1) % this.capacity;
                    break;

            }
            
        };

        this.getById = function(delay, id) {
            var pos = 0;
            if(this.touches[id].length < this.capacity){
                pos = this.t_index[id] - delay -1;
            }else{
                pos =(this.t_index[id] - delay - 1  + this.capacity) % this.capacity;
            }
            return this.touches[id] [pos];
        };
    };

    LeapStateSequence.prototype = new djestit.StateSequence();

    djestit.LeapStateSequence = LeapStateSequence;

    djestit.leapExpression = function(json) {
        if (json.gt) {
            switch (json.gt) {
                case "leap.start":
                    return new djestit.LeapStart(json.tid);
                    break;
                case "leap.move":
                    return new djestit.LeapMove(json.tid);
                    break;
                case "leap.end":
                    return new djestit.LeapEnd(json.tid);
                    break;
            }
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
            this.root = djestit.expression(root);
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
                case _LEAPSTART:
                    var leapId = this.firstId(leap.identifier);
                    this.eventToLeap[leap.identifier] = leapId;
                    //? non si può scrivere direttamente leap.identifier
                    this.leapToEvent[leapId] = [leap.identifier];
                    token.id = leapId;
                    break;
                case _LEAPMOVE:
                    token.id = this.eventToTouch[leap.identifier];
                    break;
                case _LEAPEND:
                    token.id = this.eventToLeap[leap.identifier];
                    delete this.eventToLeap[leap.identifier];
                    this.leapToEvent[token.id] = null;
                    break;
            }
            
            this.sequence.push(token);
            token.sequence = this.sequence;
            return token;
        };

        this.firstId = function(id) {
            for (var i = 1; i < this.leapToEvent.length; i++) {
                if (this.leapToEvent[i] === null) {
                    return i;
                }
            }
            this.leapToEvent.push(id);
            return this.leapToEvent.length - 1;
        };

        this._raiseLeapEvent = function(event, name) {

            event.preventDefault();
            event.stopPropagation();
            if (!event.currentTarget === event.target) {
                return;
            }
            for (var i = 0; i < event.changedTouches.length; i++) {
                var leap = event.changedTouches[i];
                var token = self.generateToken(name, leap);
                self.root.fire(token);
            }
        };

        this._onLeapStart = function(event) {

            self._raiseLeapEvent(event, _LEAPSTART);
        };

        this._onLeapMove = function(event) {
            self._raiseLeapEvent(event, _LEAPMOVE);
        };

        this._onLeapEnd = function(event) {
            self._raiseTouchEvent(event, _LEAPEND);
        };



        this.element.addEventListener(
                "leapstart",
                this._onLeapStart,
                false);
        this.element.addEventListener(
                "leapmove",
                this._onLeapMove,
                false);
        this.element.addEventListener(
                "leapend",
                this._onLeapEnd,
                false);
        this.element.addEventListener(
                "leapcancel",
                this._onLeapEnd,
                false);
    };

    djestit.LeapSensor = LeapSensor;


}(window.djestit = window.djestit || {}, undefined));
