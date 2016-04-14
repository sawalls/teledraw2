console.log("Loaded currentGames.js");

angular.module("teledraw").controller("currentGamesController", function($scope){
    console.log("In currentGamesController");

    $scope.rowClickedHandler = function(game){
        console.log("rowClickedHandler");
        console.log(game);
        $scope.$emit("openGame", game);
    };

    $scope.$on("userLoggedIn", function(){
        console.log("currentGames - user logged in!");
        socket.emit("getCurrentGames", {
            playerUuid : $scope.playerUuid,
        });
    });

    socket.on("currentGames", function(data){
        console.log("currentGames");
        console.log(data);
        $scope.$apply(function(){
            $scope.gameList = data.gameList;
        });
    });
});

