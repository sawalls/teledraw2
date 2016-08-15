console.log("LOADED drawCanvas.js");
var context;

app.controller("drawCanvasController", function($scope){
    console.log("Loaded drawCanvasController");
    context = document.getElementById("drawCanvas").getContext("2d");

    context.fillStyle = "white";
    context.fillRect(0,0, context.canvas.width, context.canvas.height);

    var paint = false;

    var clickX = [];
    var clickY = [];
    var clickDrag = [];

    function addClick(mouseX, mouseY, dragging){
        if(!dragging){//new Segment
            clickDrag.push(clickX.length);
        }
        clickX.push(mouseX);
        clickY.push(mouseY);
    }

    function redraw(){
        context.clearRect(0,0, context.canvas.width, context.canvas.height);

        context.fillStyle = "white";
        context.fillRect(0,0, context.canvas.width, context.canvas.height);

        context.strokeStyle = "#df4b26";
        context.lineJoin = "round";
        context.lineWidth = 5;

        var segIndex = 0;
        for(var i = 0; i < clickX.length; ++i){
            context.beginPath();
            if(i === clickDrag[segIndex]){//Beginning of a segment
                context.moveTo(clickX[i]-1,clickY[i]);
                segIndex++;
            }
            else{
                context.moveTo(clickX[i-1], clickY[i-1]);
            }
            context.lineTo(clickX[i], clickY[i]);
            context.closePath();
            context.stroke();
        }
    }

    $("#drawCanvas").mousedown(function(e){
        console.log("MOUSE DOWN ON CANVAS!!!");
        var mouseX = e.pageX - this.offsetLeft;
        var mouseY = e.pageY - this.offsetTop;

        paint = true;
        addClick(mouseX, mouseY, false);
        redraw();
    });

    $("#drawCanvas").mousemove(function(e){
        if(paint){
            var mouseX = e.pageX - this.offsetLeft;
            var mouseY = e.pageY - this.offsetTop;
            addClick(mouseX, mouseY, true);
            redraw();
        }
    });

    $("#drawCanvas").mouseup(function(e){
        paint=false;
    });
    $("#drawCanvas").mouseleave(function(e){
        paint=false;
    });

});


