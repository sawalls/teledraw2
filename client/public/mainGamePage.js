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
        }
        else if($scope.mailbox.length > 0){
            console.log($scope.mailbox[0]);
            var state = $scope.mailbox[0].chainState;
            if($scope.playerState === 0){
                //It's the first submission
                $scope.clueText = "Choose a word or phrase!";
                $scope.showSubmitStuff = 1;
                $scope.showClueText = 1;
            }
            else if($scope.playerState === 1){
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
            $scope.clueText = "Please wait for your next clue!";
            $scope.showSubmitStuff = 0;
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


    $scope.submitBtnClickedHandler = function(){
        console.log("submitBtnClickedHandler");
        if($scope.submission === ""){
            return;
        }
        var subData = {
            gameUuid : $scope.gameUuid,
            playerUuid : $scope.playerUuid,
            submission : {
                content : $scope.submission
            },
        };
        console.log(subData);
        $scope.submission = "";
        var chain = $scope.mailbox.shift();
        socket.emit("submission", subData);
        updateClueText();
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
    });

    socket.on("updatedPlayerState", function(data){
        console.log("updatedPlayerState");
        console.log(data);
        $scope.$apply(function(){
            $scope.playerState = data.playerState;
            updateClueText();
        });
    });
});
