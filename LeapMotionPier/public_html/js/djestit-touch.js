/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(function(djestit, undefined) {

    var _TOUCHSTART = 1;
    var _TOUCHMOVE = 2;
    var _TOUCHEND = 3;



    var TouchToken = function(touch, type) {
        this.clientX = touch.clientX;
        this.clientY = touch.clientY;
        this.pageX = touch.pageX;
        this.pageY = touch.pageY;
        this.screenX = touch.screenX;
        this.screenY = touch.screenY;
        this.target = touch.target;
        this.id = touch.identifier;
        this.type = type;
    };
    TouchToken.prototype = new djestit.Token();
    djestit.TouchToken = TouchToken;

    var TouchStart = function(id) {
        this.init();
        this.id = id;

        this._accepts = function(token) {
            if (token.type !== _TOUCHSTART) {
                return false;
            }
            if (this.id && this.id !== null && this.id !== token.id) {
                return false;
            }
            return true;
        };
    };
    TouchStart.prototype = new djestit.GroundTerm();
    djestit.TouchStart = TouchStart;

    var TouchMove = function(id) {
        this.init();
        this.id = id;

        this._accepts = function(token) {
            if (token.type !== _TOUCHMOVE) {
                return false;
            }
            if (this.id && this.id !== null && this.id !== token.id) {
                return false;
            }
            return true;
        };
    };
    TouchMove.prototype = new djestit.GroundTerm();
    djestit.TouchMove = TouchMove;

    var TouchEnd = function(id) {
        this.init();
        this.id = id;

        this._accepts = function(token) {
            if (token.type !== _TOUCHEND) {
                return false;
            }
            if (this.id && this.id !== null && this.id !== token.id) {
                return false;
            }
            return true;
        };
    };
    TouchEnd.prototype = new djestit.GroundTerm();
    djestit.TouchEnd = TouchEnd;


    var TouchStateSequence = function(capacity) {
        this.init(capacity);
        this.touches = [];
        this.t_index = [];


        this.push = function(token) {
            this._push(token);
            switch (token.type) {
                case _TOUCHSTART:
                    this.touches[token.id] = [];
                    this.t_index[token.id] = 0;
                case _TOUCHMOVE:
                case _TOUCHEND:
                    if (this.touches[token.id].length < this.capacity) {
                        this.touches[token.id].push(token);
                    } else {
                        this.touches[token.id][this.t_index[token.id]] = token;
                    }
                    this.t_index[token.id] = (this.t_index[token.id] + 1) % this.capacity;
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

    TouchStateSequence.prototype = new djestit.StateSequence();

    djestit.TouchStateSequence = TouchStateSequence;

    djestit.touchExpression = function(json) {
        if (json.gt) {
            switch (json.gt) {
                case "touch.start":
                    return new djestit.TouchStart(json.tid);
                    break;
                case "touch.move":
                    return new djestit.TouchMove(json.tid);
                    break;
                case "touch.end":
                    return new djestit.TouchEnd(json.tid);
                    break;
            }
        }
    };

    djestit.registerGroundTerm("touch.start", djestit.touchExpression);
    djestit.registerGroundTerm("touch.move", djestit.touchExpression);
    djestit.registerGroundTerm("touch.end", djestit.touchExpression);


    var TouchSensor = function(element, root, capacity) {
        this.element = element;
        if (root instanceof djestit.Term) {
            this.root = root;
        } else {
            this.root = djestit.expression(root);
        }
        this.sequence = new TouchStateSequence(capacity);
        this.touchToEvent = [];
        this.eventToTouch = [];
        // we do not use zero as touch identifier
        this.touchToEvent[0] = -1;
        var self = this;

        this.generateToken = function(type, touch) {
            var token = new TouchToken(touch, type);
            switch (type) {
                case _TOUCHSTART:
                    var touchId = this.firstId(touch.identifier);
                    this.eventToTouch[touch.identifier] = touchId;
                    this.touchToEvent[touchId] = [touch.identifier];
                    token.id = touchId;
                    break;
                case _TOUCHMOVE:
                    token.id = this.eventToTouch[touch.identifier];
                    break;
                case _TOUCHEND:
                    token.id = this.eventToTouch[touch.identifier];
                    delete this.eventToTouch[touch.identifier];
                    this.touchToEvent[token.id] = null;
                    break;
            }
            
            this.sequence.push(token);
            token.sequence = this.sequence;
            return token;
        };

        this.firstId = function(id) {
            for (var i = 1; i < this.touchToEvent.length; i++) {
                if (this.touchToEvent[i] === null) {
                    return i;
                }
            }
            this.touchToEvent.push(id);
            return this.touchToEvent.length - 1;
        };

        this._raiseTouchEvent = function(event, name) {

            event.preventDefault();
            event.stopPropagation();
            if (!event.currentTarget === event.target) {
                return;
            }
            for (var i = 0; i < event.changedTouches.length; i++) {
                var touch = event.changedTouches[i];
                var token = self.generateToken(name, touch);
                self.root.fire(token);
            }
        };

        this._onTouchStart = function(event) {

            self._raiseTouchEvent(event, _TOUCHSTART);
        };

        this._onTouchMove = function(event) {
            self._raiseTouchEvent(event, _TOUCHMOVE);
        };

        this._onTouchEnd = function(event) {
            self._raiseTouchEvent(event, _TOUCHEND);
        };



        this.element.addEventListener(
                "touchstart",
                this._onTouchStart,
                false);
        this.element.addEventListener(
                "touchmove",
                this._onTouchMove,
                false);
        this.element.addEventListener(
                "touchend",
                this._onTouchEnd,
                false);
        this.element.addEventListener(
                "touchcancel",
                this._onTouchEnd,
                false);
    };

    djestit.TouchSensor = TouchSensor;


}(window.djestit = window.djestit || {}, undefined));
