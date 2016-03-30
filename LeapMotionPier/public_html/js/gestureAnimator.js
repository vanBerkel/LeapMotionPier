/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
(function(gestureAnimator, undefined) {

    var config;
    gestureAnimator.config = config;

  /*  var animations = [
        {duration: 50, gesture: "right-swipe", performance: 1500},
        {duration: 50, gesture: "left-swipe", performance: 1500},
        {duration: 120, gesture: "triangle", performance: 4000},
        {duration: 120, gesture: "x", performance: 3000},
        {duration: 80, gesture: "rectangle", performance: 4000},
        {duration: 120, gesture: "circle", performance: 3000},
        {duration: 40, gesture: "check", performance: 1500},
        {duration: 40, gesture: "caret", performance: 1500},
        {duration: 40, gesture: "square-braket-left", performance: 2000},
        {duration: 40, gesture: "square-braket-right", performance: 2000},
        {duration: 40, gesture: "v", performance: 1500},
        {duration: 40, gesture: "pigtail", performance: 2000},
        {duration: 40, gesture: "curly-braket-left", performance: 2000},
        {duration: 40, gesture: "curly-braket-right", performance: 2000},
        {duration: 125, gesture: "star", performance: 5000},
        {duration: 120, gesture: "zig-zag", performance: 4000},
        {duration: 120, gesture: "delete", performance: 3000},
        {duration: 120, gesture: "poly3Dxyz", performance: 3000},
        {duration: 120, gesture: "poly3Dxzy", performance: 3000},
        {duration: 120, gesture: "poly3Dyxz", performance: 3000},
        {duration: 120, gesture: "poly3Dyzx", performance: 3000},
        {duration: 120, gesture: "poly3Dzxy", performance: 3000},
        {duration: 120, gesture: "poly3Dzyx", performance: 3000},
        {duration: 120, gesture: "arc3Dright", performance: 3000},
        {duration: 120, gesture: "arc3Dleft", performance: 3000},
        {duration: 300, gesture: "spiral", performance: 6000}
    ];*/

    //gestureAnimator.animations = animations;


    var render = function() {

    };
    gestureAnimator.render = render;

    gestureAnimator.helpMesh = new THREE.Mesh();

    var requestAnimation = function(duration, position, complete) {
        var _requestAnimation = function(duration, position, onComplete) {
        
            var _complete = onComplete;
            var pause = 60;
            var i = duration + pause;
            window.requestAnimationFrame(frame);


//??
          
        };

        return _requestAnimation(duration, position, complete);
    };

    gestureAnimator.requestAnimation = requestAnimation;



   

}(window.gestureAnimator = window.gestureAnimator || {}, undefined));
