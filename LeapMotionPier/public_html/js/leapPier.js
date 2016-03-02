
var listFrame = [];
var index=0;
//var pauseOnGesture = false;

var controllerOptions = {enableGestures: true};

var controller = Leap.loop(controllerOptions, function(frame) {
      
    var frameOutput = document.getElementById("frameDataList");
    for (i = 0; i< 20; i++){
        //salva su listFrame gli ultimi 20 frame  
        listFrame[i] = controller.frame(i);
                
    }
    
    
    var frameStringList="";

    var frameOutput = document.getElementById("frameDataList");
    for (i = 0; i< listFrame.length; i++){
        //stampa a video tutti i frame
            frameStringList += "<div float:left; padding:5px> Frame ID: " + listFrame[i].id  + "<br />"
            + "index :" + i + "</div>";
            
    }
 
    frameOutput.innerHTML = frameStringList;
       
    
  
  
  
   

});

  


Leap.CircularBuffer;
    
    
    
