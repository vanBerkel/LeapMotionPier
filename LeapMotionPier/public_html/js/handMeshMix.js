/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function HandMesh() {
var primaryColor = 0x9100ce;
var secondColor = 0xe3c4f0;
    var _baseBoneRotation = (new THREE.Quaternion).setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));

    var drawBone = function(finger, bone) {
        if (finger === undefined || bone === undefined) {
            return false;
        }
        if (bone.type === 0) {
            return false;
        }

        if (finger === 0 && bone.type === 1) {
            return false;
        }

        return true;
    };

    var _baseObject = new THREE.Object3D();

    this.mesh = function() {
        return _baseObject;
    };

    var _boneMeshes = [];
    var _jointMeshes = [];
    var _palmMeshes = [];

    this.newHand = function(hand, color) {
        primaryColor = 0x9100ce;
        secondColor = 0xe3c4f0;
        _palmMeshes[hand.id] = [];
        _boneMeshes[hand.id] = [];
        _jointMeshes[hand.id] = [];

        var palmMesh = new THREE.Mesh(new THREE.SphereGeometry(8),
                new THREE.MeshPhongMaterial());
        palmMesh.material.color.setHex(primaryColor);

        var points = new Array();
        points.push((new THREE.Vector3).fromArray(hand.indexFinger.bones[1].prevJoint));
        points.push((new THREE.Vector3).fromArray(hand.thumb.bones[1].prevJoint));
        points.push((new THREE.Vector3).fromArray(hand.pinky.bones[0].prevJoint));
        points.push((new THREE.Vector3).fromArray(hand.pinky.bones[1].prevJoint));
        points.push((new THREE.Vector3).fromArray(hand.indexFinger.bones[1].prevJoint));

        var length;
        var material = new THREE.MeshPhongMaterial();
        material.color.setHex(secondColor );
        for (var i = 0, len = points.length - 1; i < len; i++) {

            var border = new THREE.CylinderGeometry(5, 5, 1);
            border.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / -2));
            var line = new THREE.Mesh(border, material);
            line.position = points[i].clone();
            line.lookAt(points[ 1 + i ]);
            length = points[i].distanceTo(points[1 + i]);
            line.scale.set(1, 1, length);
            line.translateZ(0.5 * length);
            _palmMeshes[hand.id].push(line);
            _baseObject.add(line);
        }
        var pinkyCarp = new THREE.Mesh(new THREE.SphereGeometry(8),
                new THREE.MeshPhongMaterial()
                );
        pinkyCarp.material.color.setHex(primaryColor);

        _baseObject.add(palmMesh);
        _baseObject.add(pinkyCarp);
        _palmMeshes[hand.id].push(palmMesh);
        _palmMeshes[hand.id].push(pinkyCarp);


        hand.fingers.forEach(function(finger) {

            var boneMeshes = [];
            var jointMeshes = [];


            finger.bones.forEach(function(bone) {

                // create joints

                // don't draw metacarpal rigs
                if (drawBone(finger, bone)) {

                    // CylinderGeometry(radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded)
                    var boneMesh = new THREE.Mesh(
                            new THREE.CylinderGeometry(5, 5, bone.length),
                            new THREE.MeshPhongMaterial()
                            );

                    boneMesh.material.color.setHex(secondColor );
                    _baseObject.add(boneMesh);
                    boneMeshes.push(boneMesh);
                }
            });



            for (var i = 0; i < finger.bones.length + 1; i++) {

                // don't draw metacarpal rigs
                if (i === finger.bones.length || drawBone(finger, finger.bones[i])) {
                    var jointMesh = new THREE.Mesh(
                            new THREE.SphereGeometry(8),
                            new THREE.MeshPhongMaterial()
                            );

                    jointMesh.material.color.setHex(primaryColor);
                    _baseObject.add(jointMesh);
                    jointMeshes.push(jointMesh);

                }
            }



            _boneMeshes[hand.id][finger.id] = boneMeshes;
            _jointMeshes[hand.id][finger.id] = jointMeshes;

        });
    };

    this.updateHand = function(hand, color) {
        if (color!=null)
            primaryColor = color;
        hand.fingers.forEach(function(finger) {

            // for each frame we position both bones (cylinders) and joints
            if (_boneMeshes[hand.id][finger.id]) {
                _boneMeshes[hand.id][finger.id].forEach(function(mesh, i) {
                    var bone = finger.bones[i + 1];
                    if (bone) {
                        mesh.position.fromArray(bone.center());
                        
                        mesh.setRotationFromMatrix(
                                (new THREE.Matrix4).fromArray(bone.matrix())
                                );

                        mesh.quaternion.multiply(_baseBoneRotation);
                        // mesh.material.color.setHex(primaryColor);

                    }
                });

                _jointMeshes[hand.id][finger.id].forEach(function(mesh, i) {
                    var bone = finger.bones[i + 1];
                    if (bone) {
                        mesh.position.fromArray(bone.prevJoint);
                         mesh.material.color.setHex(primaryColor);
                    } else {
                        // fingertip
                        var bone = finger.bones[i];
                        mesh.position.fromArray(bone.nextJoint);
                         mesh.material.color.setHex(primaryColor);
                    }


                });
            }


        });

        if (_palmMeshes[hand.id]) {
            var points = new Array();
            var length;
            points.push((new THREE.Vector3).fromArray(hand.indexFinger.bones[1].prevJoint));
            points.push((new THREE.Vector3).fromArray(hand.thumb.bones[1].prevJoint));
            points.push((new THREE.Vector3).fromArray(hand.pinky.bones[0].prevJoint));
            points.push((new THREE.Vector3).fromArray(hand.pinky.bones[1].prevJoint));
            points.push((new THREE.Vector3).fromArray(hand.indexFinger.bones[1].prevJoint));
            _palmMeshes[hand.id].forEach(function(mesh, i) {
                switch (i) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                        // palm borders
                        mesh.position = points[i].clone();
                        mesh.lookAt(points[ 1 + i ]);
                        length = points[i].distanceTo(points[1 + i]);
                        mesh.scale.set(1, 1, length);
                        mesh.translateZ(0.5 * length);
                        break;

                    case 4:
                        // palm center
                        mesh.position.fromArray(hand.palmPosition);
                         mesh.material.color.setHex(primaryColor);
                        break;


                    case 5:
                        // pinky carp joint position
                        mesh.position.fromArray(hand.pinky.carpPosition);
                         mesh.material.color.setHex(primaryColor);
                        break;


                }
               
            });
        }
        emitUpdate();
    };



    this.lostHand = function(hand) {
        hand.fingers.forEach(function(finger) {

            var boneMeshes = _boneMeshes[hand.id][finger.id];
            var jointMeshes = _jointMeshes[hand.id][finger.id];

            boneMeshes.forEach(function(mesh) {
                _baseObject.remove(mesh);
            });

            jointMeshes.forEach(function(mesh) {
                _baseObject.remove(mesh);
            });

            _boneMeshes[hand.id][finger.id] = undefined;
            _jointMeshes[hand.id][finger.id] = undefined;

        });

        var palmMeshes = _palmMeshes[hand.id];
        palmMeshes.forEach(function(mesh) {

            _baseObject.remove(mesh);
        });

        _palmMeshes[hand.id] = undefined;

        emitUpdate();
    };

    var _updateListener = [];
    this.onUpdate = function(f) {
        _updateListener.push(f);
    };

    var emitUpdate = function() {
        _updateListener.forEach(function(f) {
            f();
        });
    };
}


