console.log("Loaded homepage.js");

angular.module("teledraw").controller("homepageController", function($scope){
    console.log("Loaded homepageController");

    $scope.showCurrentGames = 1;
    $scope.showJoinGame = 1;
    $scope.showCreateGame = 0;
    $scope.showFinishedGames = 0;

    function hideAllAndClear(){
        $scope.showCurrentGames = 0;
        $scope.showCreateGame = 0;
        $scope.showJoinGame = 0;
        $scope.showGame = 0;
        $scope.showFinishedGames = 0;
        $scope.showReveal = 0;
        $scope.showGroupReveal = 0;
        $scope.$broadcast("clearGameData");
    };

    $scope.$on("createGameSuccessful", function(event, data){
        console.log("Create game successful!");
        console.log(data);
        navigateToGame(data);
    });

    function navigateToGame(data){
        var gameData = {
            gameName : data.gameName,
            gameUuid : data.gameUuid,
        };
        hideAllAndClear();
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


    function navigateToReveal(data){
        hideAllAndClear();
        $scope.$broadcast("getRevealInfo",data);
        $scope.showReveal = 1;
    };

    $scope.$on("openReveal", function(event, data){
        console.log("Got signal openReveal");
        navigateToReveal({
            gameName : data.gameName,
            gameUuid : data.uuid
        });
    });

    function navigateToGroupReveal(data){
        hideAllAndClear();
        $scope.$broadcast("getGroupRevealInfo", data);
        $scope.showGroupReveal = 1;
    };

    $scope.$on("joinRevealSession", function(event, data){
        console.log("Got signal joinRevealSession");
        navigateToGroupReveal({
            gameName : data.gameName,
            gameUuid : data.uuid,
        });
    });

    $scope.$on("joinGameSuccessful", function(event, data){
        console.log("Got signal joinGameSuccessful");
        navigateToGame({
            gameName : data.gameName,
            gameUuid : data.gameUuid,
        });
        //Move game to Current Games
        $scope.$broadcast("gameJoined", {
            gameName : data.gameName,
            uuid : data.gameUuid,
        });
    });

    $scope.$on("showCurrentGames", function(event, data){
        hideAllAndClear();
        $scope.showCurrentGames = 1;
        $scope.showJoinGame = 1;
    });
    $scope.$on("showCreateGame", function(event, data){
        hideAllAndClear();
        $scope.showCreateGame = 1;
    });
    $scope.$on("showGameLog", function(event, data){
        hideAllAndClear();
        $scope.showFinishedGames = 1;
    });

    $scope.showCreateGameHandler = function(){
        hideAllAndClear();
        $scope.showCreateGame = 1;
    }
});
