console.log("Loaded finishedGames.js");

angular.module("teledraw").controller("finishedGamesController", function($scope){
    console.log("In finishedGamesController");

    $scope.soloRevealBtnClickedHandler = function(game){
        console.log("soloRevealBtnClickedHandler");
        console.log(game);
        $scope.$emit("openReveal", game);
    };

    $scope.groupRevealBtnClickedHandler = function(game){
        console.log("groupRevealBtnClickedHandler");
        console.log(game);
        $scope.$emit("joinRevealSession", game);
    };

    $scope.$on("userLoggedIn", function(){
        console.log("finishedGames - user logged in!");
        socket.emit("getFinishedGames", {
            playerUuid : $scope.playerUuid,
        });
    });

    socket.on("finishedGames", function(data){
        console.log("finsihedGames");
        console.log(data);
        $scope.$apply(function(){
            $scope.gameList = data.gameList;
        });
    });
});

