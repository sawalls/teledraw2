console.log("LOADED drawCanvas.js");
var palette = new Image();
palette.src = "colorMap.png";

app.controller("drawCanvasController", function($scope){
    console.log("Loaded drawCanvasController");
    var drawCanvas = document.getElementById("drawCanvas");
    var drawCtx = drawCanvas.getContext("2d");


    drawCtx.fillStyle = "white";
    drawCtx.fillRect(0,0, drawCtx.canvas.width, drawCtx.canvas.height);
    drawCtx.strokeStyle = "#000000";
    $scope.selectedColor = "#000000";

    var paint = false;

    var clickX = [];
    var clickY = [];
    var clickDrag = [];

    function addClick(mouseX, mouseY, dragging){
        if(!dragging){//new Segment
            clickDrag.push(
                {
                    clickIndex : clickX.length,
                    color : $scope.selectedColor,
                }
            );
        }
        clickX.push(mouseX);
        clickY.push(mouseY);
    }

    function redraw(){
        drawCtx.clearRect(0,0, drawCtx.canvas.width, drawCtx.canvas.height);

        drawCtx.fillStyle = "white";
        drawCtx.fillRect(0,0, drawCtx.canvas.width, drawCtx.canvas.height);

        drawCtx.lineJoin = "round";
        drawCtx.lineWidth = 5;

        var segIndex = 0;
        for(var i = 0; i < clickX.length; ++i){
            drawCtx.beginPath();
            if(segIndex < clickDrag.length && 
                    i === clickDrag[segIndex].clickIndex){//Beginning of a segment
                drawCtx.strokeStyle = clickDrag[segIndex].color;
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
        $scope.selectedColor = hexString;
        drawCtx.strokeStyle = hexString;
    };

    $scope.uploadCanvasImg = function(){
        console.log("uploadCanvasImg");
        console.log(drawCanvas.toDataURL());
        socket.emit("uploadCanvasImg", {
            gameUuid : $scope.gameUuid,
            playerUuid : $scope.playerUuid,
            dataUrl : drawCanvas.toDataURL(),
        });
    }

    $scope.$on("clearGameData", function(event, data){
        $scope.clearCanvas();
    });

    $scope.clearCanvas = function(){
        paint = false;
        clickX = [];
        clickY = [];
        clickDrag = [];
        redraw();
    };

    $scope.DRAWLOG = function(){
        console.log($scope.gameUuid);
        console.log($scope.playerUuid);
    }

});


