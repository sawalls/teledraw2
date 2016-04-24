console.log("Loaded game.js");

angular.module("teledraw").controller("gameController", function($scope){
    console.log("Loaded gameController");

    function hideAll(){
        $scope.showGameError = 0;
        $scope.showLobby = 0;
        $scope.showMainGamePage = 0;
    };

    function navigateToMainGamePage(){
        hideAll();
        $scope.showMainGamePage = 1;
    };

    $scope.$on("getGameInfo", function(event, data){
        $scope.gameName = data.gameName;
        $scope.gameUuid = data.gameUuid;
        socket.emit("getGameInfo", {
            gameUuid : $scope.gameUuid,
            playerUuid : $scope.playerUuid,
        });
    });


    $scope.$on("startGame", function(event, data){
        console.log("Got signal startGame");
        navigateToMainGamePage();
    });

    socket.on("getGameInfoError", function(data){
        $scope.$apply(function(){
            $scope.gameErrorMsg = data.msg;
            $scope.showGameError = 1;
        });
    });

    socket.on("getGameInfoSuccessful", function(data){
        console.log("getGameInfoSuccessful");
        console.log(data);
        console.log(data.mailbox);
        $scope.$apply(function(){
            if(data.gameState === 0){
                $scope.showLobby = 1;
            }
            else if(data.gameState === 1){
                $scope.showMainGamePage = 1;
            }
            $scope.$broadcast("gameInfo", data);
        });
    });

    socket.on("gameStarted", function(data){
        console.log("gameStarted");
        $scope.$apply(navigateToMainGamePage);
    });
});
