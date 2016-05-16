console.log("Loaded groupReveal.js");

angular.module("teledraw").controller("groupRevealController", function($scope){
    console.log("In groupRevealController");
    $scope.players = [];

    $scope.$on("getGroupRevealInfo", function(event, data){
        $scope.gameUuid = data.gameUuid;
        console.log("getGroupRevealInfo");
        console.log(data);
        socket.emit("joinRevealSession", {
            gameUuid : data.gameUuid,
            playerUuid : $scope.playerUuid,
            username : $scope.username,
        });
    });

    socket.on("createdRevealSession", function(data){
        console.log("Received createdRevealSession");
        console.log(data);
        console.log(data.players[0]);
        $scope.$apply(function(){
            $scope.players = data.players;
            $scope.isRevealLeader = 1;
        });
    });

    socket.on("groupRevealInfo", function(data){
        console.log("groupRevealInfo");
        console.log(data);
        for(player in data.players){
            console.log(data.players[player]);
        }
        $scope.$apply(function(){
            $scope.players = data.players;
            console.log($scope.players);
        });
    });

    socket.on("playerJoinedRevealSession", function(data){
        console.log("playerJoinedRevealSession");
        console.log(data);
        $scope.$apply(function(){
            $scope.players.push(data);
        });
    });

    $scope.startRevealBtnClickedHandler = function(){
        console.log("startRevealBtnClickedHandler");
        socket.emit("startGroupReveal", {gameUuid : $scope.gameUuid});
        $scope.revealStarted = 1;
    };

    socket.on("gameRevealInfo", function(data){
        console.log("received gameRevealInfo");
        $scope.$apply(function(){
            $scope.gamePlayers = data.players;
            $scope.showGamePlayersTable = 1;
        });
    });

    function sendCurrentSubToRevealGroup(){
        var chain = $scope.currentChain;
        var subIndex = $scope.submissionIndex;
        console.log(subIndex, chain.submissions.length);
        if(subIndex >= chain.submissions.length - 1 && $scope.isRevealLeader){
            $scope.showGamePlayersTable = 1;
        }
        else{
            $scope.showGamePlayersTable = 0;
        }
        socket.emit("updateRevealSession",{
            submission : {
                chainOwner : chain.ownerUsername,
                authorName : findGamePlayerUsernameByUuid(chain.submissions[subIndex].authorUuid),
                content : chain.submissions[subIndex].content,
                subIndex : subIndex,
            },
            gameUuid : $scope.gameUuid,
        });
    };

    function findGamePlayerUsernameByUuid(playerUuid){
        for(var i = 0; i < $scope.gamePlayers.length; ++i){
            if($scope.gamePlayers[i].uuid === playerUuid){
                return $scope.gamePlayers[i].username;
            }
        }
        return undefined;
    }

    $scope.showChainBtnClickedHandler = function(player){
        console.log("showChainBtnClickedHandler");
        console.log(player);
        $scope.currentChain = player.mailbox[0];
        $scope.submissionIndex = 0;
        $scope.lastSubmission = 0;
        sendCurrentSubToRevealGroup();
    }

    function showNewSubmission(data){
        $scope.showSubmission = 1;

        $scope.chainOwnerName = data.chainOwner;
        $scope.authorName = data.authorName;
        if(data.subIndex%2 === 1){
            $scope.showTextSubmission = 0;
            $scope.showImgSubmission = 1;
            $scope.submissionImgSrc = 
                data.content;
        }
        else{
            $scope.showTextSubmission = 1;
            $scope.showImgSubmission = 0;
            $scope.submissionText = 
                data.content;
        }
    }

    socket.on("revealUpdated", function(data){
        console.log("revealUpdated");
        console.log(data.submission);
        $scope.$apply(function(){
            showNewSubmission(data.submission);
        });
    });

    $scope.nextSubmissionBtnClickedHandler = function(){
        $scope.submissionIndex += 1;
        console.log("nextSubmissionBtnClickedHandler");
        console.log($scope.submissionIndex);
        if($scope.submissionIndex >= $scope.currentChain.length){
            console.error("Somehow requesting invalid submission index");
            return;
        }
        sendCurrentSubToRevealGroup();
    }

    socket.on("currentRevealSubmission", function(data){
        console.log("currentRevealSubmission");
        console.log(data);
        $scope.$apply(function(){
            showNewSubmission(data);
        });
    });
});

