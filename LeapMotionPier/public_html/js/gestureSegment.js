/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
(function(gestureSegment, undefined) {

    var config, scene, camera, renderer;
    //gestureSegment.scene = scene;
    //gestureSegment.camera = cara;
    gestureSegment.config = config;

   


    var render = function() {

    };
    gestureSegment.render = render;

    gestureSegment.helpMesh = new THREE.Mesh();

    var requestAnimation = function(position) {
        var _requestAnimation = function() {
            var _position = function() {
            };
       
            _position = gestureSegment.drawSegment;
              //var _complete = onComplete;
            var pause = 60;
            var i = 600 + pause;
            window.requestAnimationFrame(frame);


//??/*
           function frame() {
               
               /*  var material = new THREE.LineBasicMaterial({
                        color: 0x0000ff
                    });
                var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(-10, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, 10, 0));
    geometry.vertices.push(new THREE.Vector3(10, 0, 0));
     var line = new THREE.Line(geometry, material);
     
      scene.add(new THREE.Line(geometry, material));
    renderer.render(scene, camera);
                return;*/
               //if (i > pause) {            //visualizza sullo schermo il gesto da testare

                    var pt = new THREE.Mesh(new THREE.SphereGeometry(10),
                            new THREE.MeshPhongMaterial());
                    pt.material.color.setHex(0xff0000);
                    console.log(position);
                    pt.position.fromArray(_position(position));
                    gestureSegment.helpMesh.add(pt);
                   // gestureSegment.render();
                    //console.log('ho perso il tram delle 6');
                    return;
                    
                //}

               /* if (i === 0) {
                    while (gestureSegment.helpMesh.children.length > 0) {
                        gestureSegment.helpMesh.remove(gestureSegment.helpMesh.children[0]);
                    }
                    gestureSegment.render();
                    if (_complete) {
                        _complete();
                    }
                    return;
                }*/

                i--;
                window.requestAnimationFrame(frame);

            }
        };

        return _requestAnimation();
    };

    gestureSegment.requestAnimation = requestAnimation;



   
    var drawSegment = function(i) {
        var point = [];
        point[0] = i[0];//-250 + i * 10;
        point[1] = i[1]; //gestureSegment.config.translateY;
        point[2] = i[2];
        //console.log(i);
        return point;
        
    };

    gestureSegment.drawSegment = drawSegment;

   
}(window.gestureSegment = window.gestureSegment || {}, undefined));
