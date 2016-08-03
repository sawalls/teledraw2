console.log("Loaded revealLobby.js");

angular.module("teledraw").controller("revealLobbyController", function($scope){
    console.log("Loaded revealLobbyController");

    function hideAll(){
    };

    $scope.$on("", function(event, data){
        console.log("Got signal ");
        console.log(data);
        socket.emit("getRevealInfo", 
            {gameUuid : data.gameUuid,
            playerUuid : $scope.playerUuid}
        );
    });

    socket.on("createdRevealSession", function(data){
        console.log("createdRevealSession");
        $scope.$apply(function(){
            $scope.players = data.players;
        });
    });

    $scope.playerClickedHandler = function(player){
        console.log(player);
        for(var i = 0; i < player.mailbox.length; ++i){
            console.log(player.mailbox[i].submissions);
            for(var j = 0; j < player.mailbox[i].submissions.length; ++j){
                console.log(player.mailbox[i].submissions[j]);
            }
        }
        hideAll();
        $scope.showSubmissions = 1;
        $scope.showTextSubmission = 1;
        $scope.currentChain = player.mailbox[0];
        $scope.currentPlayerName = player.username;
        $scope.currentSubmissionIndex = 0;
        $scope.submissionText = $scope.currentChain.submissions[0].content;
    };

    $scope.nextSubmissionBtnClickedHandler = function(player){
        console.log("nextSubmissionBtnClickedHandler");
        $scope.currentSubmissionIndex += 1;
        console.log($scope.currentSubmissionIndex);
        if($scope.currentSubmissionIndex >= $scope.players.length){
            return;
        }
        if($scope.currentSubmissionIndex%2 === 1){
            $scope.showTextSubmission = 0;
            $scope.showImgSubmission = 1;
            $scope.submissionImgSrc = 
                $scope.currentChain.submissions[$scope.currentSubmissionIndex].content;
        }
        else{
            $scope.showTextSubmission = 1;
            $scope.showImgSubmission = 0;
            $scope.submissionText = 
                $scope.currentChain.submissions[$scope.currentSubmissionIndex].content;

        }
    };
}
