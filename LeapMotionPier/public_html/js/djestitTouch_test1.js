/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


$(document).ready(function() {

    setCanvas = function() {
        var w = $(window).width();
        var h = $(window).height();
        $("#area")
                .attr("width", w)
                .attr("height", h);
        $("#area").width(w);
        $("#area").height(h);
        console.log("width" + w);
        console.log("height" + h);
    };


    $(window).resize(function() {

        setCanvas();
        paintCanvas.paint();

    });

    // drawing canvas creation
    var paintCanvas = new PaintCanvas({
        canvas: $("#area").get(0)

    });

    var pan = {
        sequence: [
            {gt: "touch.start", tid: 1},
            {disabling: [
                    {gt: "touch.move", tid: 1, iterative: true},
                    {gt: "touch.end", tid: 1}
                ]}
        ]

    };



    var pinch = {
        sequence: [
            {anyOrder: [
                    {gt: "touch.start", tid: 1},
                    {gt: "touch.start", tid: 2}
                ]},
            {disabling: [
                    {parallel: [
                            {gt: "touch.move", tid: 1, id:"pinch.move1"},
                            {gt: "touch.move", tid: 2,}
                        ], iterative: true},
                    {anyOrder: [
                            {gt: "touch.end", tid: 1},
                            {gt: "touch.end", tid: 2}
                        ]}
                ]
            }
        ]
    };
    
    var pointing = { 
        choice :[
            {disabling:[
                    {gt: "mouse.move", iterative : true},
                    {gt: "mouse.rightButton"}
            ]},
            {choice :[
                {disabling:[
                    {gt: "leap.handLeft.index.4", iterative: true},
                    {gt: "leap.handLeft.screenTap"}
                ]},
                {disabling:[
                    {gt: "leap.handRight.index.4", iterative: true},
                    {gt: "leap.handRight.screenTap"}
                ]}
            ]},
            {choice :[
                {disabling:[
                    {gt: "leap.handLeft.index.4", iterative: true},
                    {gt: "leap.handLeft.screenTap"}
                ]},
                {disabling:[
                    {gt: "leap.handRight.index.4", iterative: true},
                    {gt: "leap.handRight.screenTap"}
                ]}
            ]}
        ]};

    var input = {
        choice: [
            pan,
            pinch
        ],
        iterative: true
    };

    var currentLine = -1;
    djestit.onComplete(
            ":has(:root > .gt:val(\"touch.start\"))",
            pan,
            function() {
                console.log("line added");
                currentLine = paintCanvas.addLine();
            });

    djestit.onComplete(
            ":has(:root > .gt:val(\"touch.move\"))",
            pan,
            function(args) {

                var toAdd = paintCanvas.coordToView({
                    x: args.token.clientX,
                    y: args.token.clientY
                });
                paintCanvas.addPoint(currentLine, toAdd);
                paintCanvas.paint();
            });

    djestit.onComplete(
            ":has(:root > .id:val(\"pinch.move1\"))",
            pinch,
            function(args) {
                console.log("move 1 in parallel");

                var old1 = args.token.sequence.getById(1, 1);
                var old2 = args.token.sequence.getById(1, 2);

                var curr1 = args.token.sequence.getById(0, 1);
                var curr2 = args.token.sequence.getById(0, 2);

                if (old1 && old2 && curr1 && curr2) {
                    var oldDist = Math.sqrt(
                            Math.pow(old1.clientX - old2.clientX, 2) +
                            Math.pow(old1.clientY - old2.clientY, 2));
                    var currDist = Math.sqrt(
                            Math.pow(curr1.clientX - curr2.clientX, 2) +
                            Math.pow(curr1.clientY - curr2.clientY, 2));


                    var amount = paintCanvas.scale <= 1 ? 0.005 : 0.005;
                    if (currDist > oldDist) {
                        // zoom in
                        paintCanvas.zoom(paintCanvas.scale + amount);
                    } else {
                        // zoom out
                        paintCanvas.zoom(paintCanvas.scale - amount);
                        
                    }
                }
            }
    );

    new djestit.TouchSensor($("#area").get(0), input, 3);

    setCanvas();
    paintCanvas.paint();
});

function PaintCanvas(conf) {

    this.colors = ['red', 'green', 'blue', 'gold'];

    this.init = function(conf) {
        this.scale = conf.scale ? conf.scale : 1;
        this.translate = conf.translate ? conf.translate : {x: 0, y: 0};
        this.canvas = conf.canvas;
        this.background = conf.background ? conf.background : "#ffffff";
        this.lines = [];
    };

    this.paint = function() {
        var context = this.canvas.getContext("2d");
        context.save();
        context.fillStyle = this.background;
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        context.scale(this.scale, this.scale);
        context.translate(this.translateX, this.translateY);

        for (var i = 0; i < this.lines.length; i++) {
            context.strokeStyle = this.colors[i % this.colors.length];
            //context.lineWidth = this.lineWidth;
            context.beginPath();
            for (var j = 0; j < this.lines[i].length; j++) {
                var point = this.lines[i][j];
                if (j === 0) {
                    context.moveTo(point.x, point.y);
                } else {
                    context.lineTo(point.x, point.y);
                }
            }
            context.stroke();
        }
        context.restore();

    };

    this.addLine = function() {
        this.lines.push([]);
        return this.lines.length - 1;
    };

    this.addPoint = function(lineId, point) {
        if (lineId >= 0 && lineId < this.lines.length) {
            this.lines[lineId].push(point);
        }
    };

    this.coordToView = function(screenPoint) {
        var viewPoint = {x: 0, y: 0};
        viewPoint.x = screenPoint.x / this.scale;
        viewPoint.y = screenPoint.y / this.scale;

        viewPoint.x = viewPoint.x - this.translate.x;
        viewPoint.y = viewPoint.y - this.translate.y;

        return viewPoint;
    };

    this.zoom = function(s) {
        this.scale = s;
        this.paint();
    };

    this.init(conf);
};