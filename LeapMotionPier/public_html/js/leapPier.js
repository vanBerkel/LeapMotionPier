
var listFrame = [];
var index=0;
var previousFrame;

var max =20;

//var pauseOnGesture = false;

var controllerOptions = {enableGestures: true};

var controller = Leap.loop(controllerOptions, function(frame) {
      
    var frameOutput = document.getElementById("frameDataList");
    
    
    
    /*
    if (frame!= controller.frame(1)){
        
        for (i = 0; i<20; i++){
            //salva su listFrame gli ultimi 20 frame  
            //controllo per verificare che id non siano dupplicati
                listFrame[i] = controller.frame(i);
            //else
              //  i--;

        }
    }
    */
   
   
        
        if (listFrame.length ==0)
            listFrame.push(frame);
        else 
            if ((listFrame.length<max) && (frame != listFrame[listFrame.length-1]))
                listFrame.push(frame);
           else{
               if (index==max)
                    index = 0;
               if ((index >0)&&(listFrame[index-1]!= frame) || ((index==0) && (listFrame[max-1] !=frame))){
                    listFrame[index] = frame;
                    index++
                }
               
            }

    
    
    
    
    var frameStringList="";
    var frameOutput = document.getElementById("frameDataList");
    for (i = 0; i< listFrame.length; i++){
        //stampa a video tutti i frame
            frameStringList += "<div float:left; padding:5px> Frame ID: " + listFrame[i].id  
            + " -> index :" + i + "</div>";
            
    }
    frameOutput.innerHTML = frameStringList;
  
   

});




  


    
    
    
