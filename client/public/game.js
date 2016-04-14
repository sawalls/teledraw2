console.log("Loaded game.js");

angular.module("teledraw").controller("gameController", function($scope){
    console.log("Loaded gameController");
    $scope.$on("getGameInfo", function(event, data){
        $scope.gameName = data.gameName;
        $scope.gameUuid = data.gameUuid;
    });
});
