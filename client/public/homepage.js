console.log("Loaded homepage.js");

angular.module("teledraw").controller("homepageController", function($scope){
    console.log("Loaded homepageController");

    $scope.showCurrentGames = 1;
    $scope.showCreateGame = 1;
    $scope.showJoinGame = 1;

    function hideAll(){
        $scope.showCurrentGames = 0;
        $scope.showCreateGame = 0;
        $scope.showJoinGame = 0;
        $scope.showGame = 0;
    };

    $scope.$on("createGameSuccessful", function(event, data){
        console.log("Create game successful!");
        console.log(data);
    });

    function navigateToGame(data){
        var gameData = {
            gameName : data.gameName,
            gameUuid : data.gameUuid,
        };
        hideAll();
        $scope.$broadcast("getGameInfo",
            gameData);
        $scope.showGame = 1;
    }
    $scope.$on("openGame", function(event, data){
        console.log("Got signal openGame");
        navigateToGame({
            gameName : data.gameName,
            gameUuid : data.uuid,
        })
    });
    $scope.$on("joinGameSuccessful", function(event, data){
        console.log("Got signal joinGameSuccessful");
        navigateToGame({
            gameName : data.gameName,
            gameUuid : data.gameUuid,
        });
    });

});
