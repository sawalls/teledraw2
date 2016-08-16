console.log("LOADED drawCanvas.js");
var drawCtx;
var palette = new Image();
palette.src = "img_colormap.gif";

app.controller("drawCanvasController", function($scope){
    console.log("Loaded drawCanvasController");
    drawCtx = document.getElementById("drawCanvas").getContext("2d");

    drawCtx.fillStyle = "white";
    drawCtx.fillRect(0,0, drawCtx.canvas.width, drawCtx.canvas.height);

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
        drawCtx.clearRect(0,0, drawCtx.canvas.width, drawCtx.canvas.height);

        drawCtx.fillStyle = "white";
        drawCtx.fillRect(0,0, drawCtx.canvas.width, drawCtx.canvas.height);

        drawCtx.strokeStyle = "#df4b26";
        drawCtx.lineJoin = "round";
        drawCtx.lineWidth = 5;

        var segIndex = 0;
        for(var i = 0; i < clickX.length; ++i){
            drawCtx.beginPath();
            if(i === clickDrag[segIndex]){//Beginning of a segment
                drawCtx.moveTo(clickX[i]-1,clickY[i]);
                segIndex++;
            }
            else{
                drawCtx.moveTo(clickX[i-1], clickY[i-1]);
            }
            drawCtx.lineTo(clickX[i], clickY[i]);
            drawCtx.closePath();
            drawCtx.stroke();
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

    var colorCtx = document.getElementById("colorPalette").getContext("2d");
    colorCtx.drawImage(palette,0,0);

    $scope.paletteClickedHandler = function(event){
        var clickX = event.offsetX;
        var clickY = event.offsetY;
        console.log("Coordinates: (" + clickX + ", " + clickY +")");

        var imgData = colorCtx.getImageData(clickX, clickY, 1, 1).data;
        var R = imgData[0];
        var G = imgData[1];
        var B = imgData[2];
        console.log(R + " " + G + " " + B);

        var get2digHex = function(num){
            if(num < 16)
                return "0" + num.toString(16);
            else
                return num.toString(16);
        }
        var hexString = "#" + get2digHex(R) + get2digHex(G) + get2digHex(B);
        console.log(hexString);
    };
});


