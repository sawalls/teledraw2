console.log("Loaded mainGamePage.js");

app.controller("mainGamePageController", function($scope){
    console.log("In mainGamePageController");
    $scope.mailbox = [];

    function updateClueText(){
        console.log("UPDATE CLUE TEXT");
        
        if($scope.playerState === 2){
            $scope.clueText = "All done!";
            $scope.showClueText = 1;
            $scope.showClueImg = 0;
            $scope.showSubmitStuff = 0;
            $scope.isFirstSub = 0;
        }
        else if($scope.mailbox.length > 0){
            console.log($scope.mailbox[0]);
            var state = $scope.mailbox[0].chainState;
            if($scope.playerState === 0){
                //It's the first submission
                $scope.showSubmitStuff = 1;
                $scope.isFirstSub = 1;
            }
            else if($scope.playerState === 1){
                $scope.isFirstSub = 0;
                //Check if it's a picture
                var text = $scope.mailbox[0].submission.content;
                $scope.clueText = text;
                var imgRegex = new RegExp("\.png$|\.jpg$|\.gif$|\.bmp", "g");
                if(text.search(imgRegex) !== -1){
                    //It's a picture
                    $scope.showClueImg = 1;
                    $scope.showClueText = 0;
                }
                else{
                    $scope.showClueText = 1;
                    $scope.showClueImg = 0;
                }
                $scope.showSubmitStuff = 1;
            }
        }
        else{
            console.log("No clues!");
            $scope.showSubmitStuff = 0;
            $scope.isFirstSub = 0;
        }
    };

    $scope.$on("gameInfo", function(event, data){
        console.log("mainGamePage got gameInfo signal");
        console.log(data);
        var players = data.players;
        $scope.playerState = data.playerState;
        $scope.mailbox = data.mailbox;
        updateClueText();
    });


    function submitToDB(submission){
        console.log("submitToDB");
        console.log(submission);
        var subData = {
            gameUuid : $scope.gameUuid,
            playerUuid : $scope.playerUuid,
            submission : {
                content : submission
            },
        };
        console.log(subData);
        $scope.submission = "";
        var chain = $scope.mailbox.shift();
        socket.emit("submission", subData);
        updateClueText();
    }

    $scope.submitBtnClickedHandler = function(){
        if($scope.submission === ""){
            return;
        }
        submitToDB($scope.submission);
    };

    $scope.submitImgBtnClickedHandler = function(){
        console.log("submitImgBtnClickedHandler");
        var files = document.getElementById("fileInput").files;
        var file = files[0];
        console.log(file.name);
        if(!file){
            alert("No file selected");
            return;
        }
        socket.emit("getS3SignedRequest", {
            fileName : file.name,
            fileType : file.type,
        });
    }

    socket.on("receivedSubmission", function(data){
        console.log("receivedSubmission");
        console.log(data);
        if(data.targetPlayerUuid === $scope.playerUuid){
            $scope.$apply(function(){
                $scope.mailbox.push({
                    chainOwnerUuid : data.chainOwnerUuid,
                    chainState : data.chainState,
                    submission : data.submission,
                });
                console.log($scope.mailbox);
                if($scope.mailbox.length === 1){
                    updateClueText();
                }
            });
        }
    });

    socket.on("signedRequest",function(data){
        console.log(data.url);
        var files = document.getElementById("fileInput").files;
        var file = files[0];
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', data.signedRequest);
        xhr.onreadystatechange = () => {
            if(xhr.readyState === 4){
                if(xhr.status === 200){
                    alert("Success!");
                    $scope.$apply(function(){
                        submitToDB(data.url)
                    });
                    return;
                }
                else{
                    alert('Could not upload file.');
                }
            }
        };
        xhr.send(file);
    });

    socket.on("updatedPlayerState", function(data){
        console.log("updatedPlayerState");
        console.log(data);
        $scope.$apply(function(){
            $scope.playerState = data.playerState;
            updateClueText();
        });
    });

    $scope.LOG = function(){
        console.log("MAILBOX");
        console.log($scope.mailbox.length);
        for(var i = 0; i < $scope.mailbox.length; ++i){
            console.log($scope.mailbox[i].submission.content);
        }
        console.log("showSubmitStuff");
        console.log($scope.showSubmitStuff);
    }

});
