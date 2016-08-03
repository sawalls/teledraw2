console.log("Loaded reveal.js");

angular.module("teledraw").controller("revealController", function($scope){
    console.log("Loaded revealController");
    $scope.showPlayerTable = 1;
    $scope.players = [];

    function hideAll(){
        $scope.showPlayerTable = 0;
        $scope.showSubmissions = 0;
    };

    $scope.$on("getRevealInfo", function(event, data){
        console.log("Got signal getRevealInfo");
        console.log(data);
        socket.emit("getRevealInfo", 
            {gameUuid : data.gameUuid,
            playerUuid : $scope.playerUuid}
        );
    });

    socket.on("revealInfo", function(data){
        console.log("revealInfo");
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

    $scope.backToReveal = function(){
        console.log("backToReveal");
        hideAll();
        $scope.showPlayerTable = 1;
        $scope.currentChain = undefined;
        $scope.currentPlayerName = undefined;
        $scope.currentSubmissionIndex = 0;
        $scope.submissionText = undefined;
    };
});
