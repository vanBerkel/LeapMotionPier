/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(function(djestit, undefined) {
    var _COMPLETE = 1;
    var _DEFAULT = 0;
    var _ERROR = -1;

    /**
     * Constant indicating that an expression term is completed
     */
    djestit.COMPLETE = _COMPLETE;

    /**
     * Constant indicating that an expression term is in the default state
     * (neither completed nor error)
     */
    djestit.DEFAULT = _DEFAULT;

    /**
     * Constant indicating that an expression term is in an error state
     */
    djestit.ERROR = _ERROR;

    /**
     * Internal representation of an event (observer pattern)
     * @returns {djestit.Event}
     */
    var Event = function() {

        /**
         * The event callback list
         */
        this.callback = [];

        /**
         * Adds an handler for this event
         * @param {function} handler the handler to be added
         * @returns {undefined}
         */
        this.add = function(handler) {
            this.callback.push(handler);
        };

        /**
         * Removes an handler for this event
         * @param {function} handler the handler to be removed
         * @returns {undefined}
         */
        this.remove = function(handler) {
            var index = this.callback.indexOf(handler);
            if (index > -1) {
                this.callback.splice(index, 1);
            }
        };

        /**
         * Triggers the current event
         * @param {object} evt the event arguments
         * @returns {undefined}
         */
        this.trigger = function(evt, token) {
            this.callback.forEach(function(l) {
                l(evt);
            });
        };
    };

    /**
     * The base class representing the user input arguments
     * @returns {djestit.Token}
     */
    var Token = function() {

    };

    djestit.Token = Token;

    var StateSequence = function(capacity) {
        
        this.init = function(capacity){
            this.capacity = capacity ? capacity : 2; //se capacitì ha un valore mette il valore altrimenti mette 2
            this.tokens = [];
            this.index = -1;
        };
        
        this._push = function(token) {
            if (this.tokens.length > this.capacity) {
                this.tokens.push(token);
                this.index++;
            } else {
                this.index = (this.index + 1) % this.capacity;
                this.tokens[this.index] = token;
            }
        };
        
        this.push = function(token){
            this._push(token);
        };

        this.get = function(delay) {
            var pos = Math.abs(this.index - delay) % this.capacity;
            return this.tokens[pos];
        };
        
        this.init(capacity);
    };

    djestit.StateSequence = StateSequence;

    /**
     * The base class for the input expression terms
     * @returns {djestit.Term}
     */
    var Term = function() {

        /**
         * Inits an expression term 
         */
        this.init = function() {
            this.onComplete = new Event();
            this.onError = new Event();
            this.state = _DEFAULT;
        };

        /**
         * Executes the current expression term, passing a token as argument
         * @param {djestit.Token} token
         * @returns {undefined} 
         */
        this.fire = function(token) {
            this.complete(token);
        };

        /**
         * Resets the the expression term to the initialization state
         * @returns {undefined} 
         */
        this.reset = function() {
            this.state = _DEFAULT;
        };

        /**
         * Sets the expression state to completed
         * @param {djestit.Token} token the input parameters
         * @returns {undefined}
         */
        this.complete = function(token) {
            this.state = _COMPLETE;
            this.onComplete.trigger({
                "evt": "completed",
                "token": token
            });
        };

        /**
         * Sets the expression state in an error state 
         * @param {djestit.Token} token the input parameters
         * @returns {undefined}
         */
        this.error = function(token) {
            this.state = _ERROR;
            this.onError.trigger({
                "evt": "error",
                "token": token
            });
        };

        /**
         * Test wheter the input can be accepted by the expression term or not
         * @param {djestit.Token} token the input parameters
         * @returns {Boolean} true if the input can be accepted, false otherwise
         */
        this.lookahead = function(token) {
            return true;
        };

    };
    djestit.Term = Term;

    /**
     * Base class for input ground terms (expressions that cannot be further
     * decomposed)
     * @extends Term
     * @returns {djestit.GroundTerm}
     */
    var GroundTerm = function() {
        this.init();
        // event filter, overridable by GroundTerm extensions (classes)
        this._accepts = function(token) {
            return true;
        };
        // event filter, overridable by specific instances
        this.accepts = function(token){
            return true;
        };
        this.lookahead = function(token) {
            return this._accepts(token) && this.accepts(token);
        };
        this.type = "ground";
        this.modality = undefined;
    };
    GroundTerm.prototype = new Term();
    djestit.GroundTerm = GroundTerm;

    /**
     * Base class for composite expressions 
     * @extends Term
     * @returns {djestit.CompositeTerm}
     */
    var CompositeTerm = function() {
        this.init();
        this.children = [];
        this.reset = function() {
            this.state = _DEFAULT;
            this.children.forEach(function(child) {
                child.reset();
            });
        };
        
    };
    CompositeTerm.prototype = new Term();
    djestit.CompositeTerm = CompositeTerm;

    /**
     * A composite expression of terms connected with the operator.
     * The sequence operator expresses that the connected sub-terms (two or more) 
     * have to be performed in sequence, from left to right.
     * @param {type} terms the list of sub-terms
     * @returns {djestit.Sequence}
     * @extends djestit.CompositeTerm
     */
    var Sequence = function(terms) {
        this.init();
        // setting the children property
        terms instanceof Array ? this.children = terms : this.children = [];

        var index = 0;

        this.reset = function() {
            this.state = _DEFAULT;
            index = 0;
            this.children.forEach(function(child) {
                child.reset();
            });
        };

        this.lookahead = function(token) {
            if (this.state === _COMPLETE || this.state === _ERROR) {
                return false;
            }

            if (this.children &&
                    this.children[index] &&
                    this.children[index].lookahead) {
                return this.children[index].lookahead(token);
            } 

            return false;
        };

        this.fire = function(token) {
            if (this.lookahead(token) && this.children[index].fire) {
                this.children[index].fire(token);
            } else {
                //console.log("token.close >" + token.close + " token.id >" + token.id + "token.type "+ token.type);
                this.error();
                return;
            }

            switch (this.children[index].state) {
                case _COMPLETE:
                    index++;
                    if (index >= this.children.length) {
                        this.complete(token);
                    }
                    break;
                case _ERROR:
                    this.error(token);
                    break;
            }

        };
    };
    Sequence.prototype = new CompositeTerm();
    djestit.Sequence = Sequence;


    /**
     * A composite expression consisting of the iteration of a single term an
     * indefinite number of times
     * @param {type} term the term to iterate
     * @returns {djestit.Iterative}
     * @extends djestit.CompositeTerm
     */
    var Iterative = function(term) {
        this.init();
        // ensure that we set an unary operator
        term instanceof Array ? this.children = term[0] : this.children = term;

        this.reset = function() {
            this.state = _DEFAULT;
            if (this.children) {
                this.children.reset();
            }
        };

        this.lookahead = function(token) {
            if (this.children && this.children.lookahead) {
                return this.children.lookahead(token);
            }
        };

        this.fire = function(token) {
            if (this.lookahead(token) && this.children.fire) {
                this.children.fire(token);
                switch (this.children.state) {
                    case _COMPLETE:
                        this.complete(token);
                        this.children.reset();
                        break;

                    case _ERROR:
                        this.error(token);
                        this.children.reset();
                        break;
                }
            }
        };
    };
    Iterative.prototype = new CompositeTerm();
    djestit.Iterative = Iterative;

    /**
     * A composite expression of terms connected with the parallel operator.
     * The sequence operator expresses that the connected sub-terms (two or more) 
     * can be executed at the same time
     * @param {type} terms the list of sub-terms
     * @returns {djestit.Parallel}
     * @extends djestit.CompositeTerm
     */
    var Parallel = function(terms) {
        this.init();
        // setting the children property
        terms instanceof Array ? this.children = terms : this.children = [];

        this.lookahead = function(token) {
            if (this.state === _COMPLETE || this.state === _ERROR) {
                return false;
            }
            if (this.children && this.children instanceof Array) {
                for (var i = 0; i < this.children.length; i++) {
                    if (this.children[i].lookahead(token)) {
                        return true;
                    }
                }
            }
            return false;
        };

        this.fire = function(token) {
            if (this.lookahead(token)) {
                var all = true;
                this.children.forEach(function(child) {
                    if (child.lookahead(token)) {
                        child.fire(token);
                    }
                    if (child.state === _ERROR) {
                        this.error(token);
                    }
                    all = all && child.state === _COMPLETE;
                });
            } else {
                this.error();
            }
            if (all) {
                this.complete(token);
            }
        };
    };
    Parallel.prototype = new CompositeTerm();
    djestit.Parallel = Parallel;

    /**
     * A composite expression of terms connected with the choice operator.
     * The sequence operator expresses that it is possible to select one among 
     * the terms in order to complete the whole expression.
     * The implementation exploits a best effort approach for dealing with the 
     * selection ambiguity problem (see [1])
     * 
     * [1] Lucio Davide Spano, Antonio Cisternino, Fabio Paternò, and Gianni Fenu. 2013. 
     * GestIT: a declarative and compositional framework for multiplatform 
     * gesture definition. In Proceedings of the 5th ACM SIGCHI symposium on 
     * Engineering interactive computing systems (EICS '13). 
     * ACM, New York, NY, USA, 187-196
     * 
     * @param {type} terms the list of sub-terms
     * @returns {djestit.Choice}
     * @extends djestit.CompositeTerm
     */
    var Choice = function(terms) {
        this.init();
        // setting the children property
        terms instanceof Array ? this.children = terms : this.children = [];

        this.reset = function() {
            this.state = _DEFAULT;
            this.children.forEach(function(child) {
                child.reset();
                child._excluded = false;
            });
        };

        this.lookahead = function(token) {
            if (this.state === _COMPLETE || this.state === _ERROR) {
                return false;
            }
            if (this.children && this.children instanceof Array) {
                for (var i = 0; i < this.children.length; i++) {
                    if (!this.children[i]._excluded && this.children[i].lookahead(token) === true) {
                        return true;
                    }
                }
            }
            return false;
        };

        this.feedToken = function(token) {

            if (this.state === _COMPLETE || this.state === _ERROR) {
                return;
            }

            if (this.children && this.children instanceof Array) {
                for (var i = 0; i < this.children.length; i++) {
                    if (!this.children[i]._excluded) {
                        if (this.children[i].lookahead(token) === true) {
                            this.children[i].fire(token);
                        } else {
                            // the current sub-term is not able to handle the input
                            // sequence
                            this.children[i]._excluded = true;
                            this.children[i].error(token);
                        }
                    }
                }
            }
        };

        this.fire = function(token) {
            this.feedToken(token);
            var allExcluded = true;
            for (var i = 0; i < this.children.length; i++) {
                if (!this.children[i]._excluded) {
                    allExcluded = false;
                    switch (this.children[i].state) {
                        case _COMPLETE:
                            // one of the subterms is completed, then the
                            // entire expression is completed
                            this.complete(token);
                            return;

                        case _ERROR:
                            // this case is never executed, since
                            // feedToken excludes the subterms in error state
                            return;
                    }
                }
            }
            if (allExcluded) {
                // cannot complete any of the sub-terms
                this.error();
            }

        };


    };
    Choice.prototype = new CompositeTerm();
    djestit.Choice = Choice;

    var OrderIndependence = function(terms) {
        this.init();
        // setting the children property
        terms instanceof Array ? this.children = terms : this.children = [];
        this.reset = function() {
            this.state = _DEFAULT;
            this.children.forEach(function(child) {
                child.reset();
                child._once = false;
                child._excluded = false;
            });
        };

        this.lookahead = function(token) {
            if (this.state === _COMPLETE || this.state === _ERROR) {
                return false;
            }
            if (this.children && this.children instanceof Array) {
                for (var i = 0; i < this.children.length; i++) {
                    if (!this.children[i]._once && this.children[i].lookahead(token)) {
                        return true;
                    }
                }
            }
            return false;
        };

        this.fire = function(token) {
            this.feedToken(token);
            var allComplete = true;
            var newSequence = false;
            var allExcluded = true;
            for (var i = 0; i < this.children.length; i++) {
                if (!this.children[i]._once) {
                    if (!this.children[i]._excluded) {
                        allExcluded = false;
                        switch (this.children[i].state) {
                            case _COMPLETE:
                                this.children[i]._once = true;
                                this.children[i]._excluded = true;
                                newSequence = true;
                                break;
                            case _ERROR:
                                // this case is never executed, since
                                // feedToken excludes the subterms in error state
                                break;
                            default :
                                allComplete = false;
                                break;
                        }
                    } else {
                        allComplete = false;
                    }
                }
            }
            if (allComplete) {
                // we completed all sub-terms
                this.complete(token);
                return;
            }
            if (allExcluded) {
                // no expression was able to handle the input
                this.error(token);
                return;
            }
            if (newSequence) {
                // execute a new sequence among those in order independence
                for (var i = 0; i < this.children.length; i++) {
                    if (!this.children[i]._once) {
                        this.children[i]._excluded = false;
                        this.children[i].reset();
                    }
                }
            }
        };

    };
    OrderIndependence.prototype = new Choice();
    djestit.OrderIndependence = OrderIndependence;

    var Disabling = function(terms) {
        this.init();
        terms instanceof Array ? this.children = terms : this.children = [];

        this.fire = function(token) {
            this.feedToken(token);
            var allExcluded = true;
            var min = false;
            for (var i = 0; i < this.children.length; i++) {
                if (!this.children[i]._excluded) {
                    min = true;
                    allExcluded = false;
                    switch (this.children[i].state) {
                        case _COMPLETE:
                            if (i === this.children.length - 1) {
                                // the expression is completed when the
                                // last subterm is completed
                                this.complete(token);
                            }
                            break;
                    }
                } else {
                    if (min) {
                        // re-include terms with index > min for next 
                        // disabling term selection
                        this.children[i]._excluded = false;
                        this.children[i].reset();
                    }
                }
            }
            if (allExcluded) {
                this.error(token);
                return;
            }


        };

    };
    Disabling.prototype = new Choice();
    djestit.Disabling = Disabling;

    /**
     * Creates an input expression (Term) from a declarative description
     * @param {object} json A json object describing the expression. 
     * TODO specify json grammar
     * @returns {Term} the expression term
     */
    var expression = function(json) {
        console.log("Expression");
        var exp = null;
        var ch = [];
        if (json.choice) {
            exp = new Choice();
            ch = json.choice;
        }

        if (json.disabling) {
            exp = new Disabling();
            ch = json.disabling;
        }

        if (json.anyOrder) {
            exp = new OrderIndependence();
            ch = json.anyOrder;
        }

        if (json.parallel) {
            exp = new Parallel();
            ch = json.parallel;
        }

        if (json.sequence) {
            exp = new Sequence();
            ch = json.sequence;
                                            console.log("sequence");

        }

        if (json.gt) {
            if (djestit._groundTerms[json.gt] !== undefined) {
                console.log("gt");

                exp = djestit._groundTerms[json.gt](json);
            }
        }
        
        if(json.complete){
            exp.onComplete.add(json.complete);
        }
        
        if(json.error){
            exp.onError.add(json.error);
        }

        // recoursively descend into sub expressions
        for (var i = 0; i < ch.length; i++) {
            var subterm = expression(ch[i]);
            exp.children.push(subterm);
        }

        if (json.iterative && json.iterative === true) {
            var it = exp;
            exp = new Iterative(it);
                                                        console.log("iterative");

        }

        return exp;
    };

    djestit.expression = expression;

    djestit._groundTerms = [];
    djestit.registerGroundTerm = function(name, initFunction) {
        this._groundTerms[name] = initFunction;
    };
    

    var _select = function(selector, json){
        if(window.JSONSelect){
            return window.JSONSelect.match(selector, json);
        }else{
            console.log("In order to use the json selection capabilies, you must \
            use the JSONSelect library http://jsonselect.org/");
            return null;
        }
    };
    djestit._select = _select;
    
    var _attachHandler = function(selector, expression, event, f){
        var  selection = djestit._select(selector, expression);
        for(var i = 0; i<selection.length; i++){
            selection[i][event] = f;

        }
         
        
    };
    djestit._attachHandler = _attachHandler;
    
    djestit.onComplete = function(selector, expression, f){
        djestit._attachHandler(selector, expression, "complete", f);
    };
    

    
    djestit.onError = function(selector, expression, f){
        djestit._attachHandler(selector, expression, "error", f);
    };
    

}(window.djestit = window.djestit || {}, undefined));



