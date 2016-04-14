console.log("Loaded game.js");

angular.module("teledraw").controller("gameController", function($scope){
    console.log("Loaded gameController");
    $scope.$on("gameJoined", function(data){
        $scope.gameName = data.gameName;
        $scope.gameUuid = data.gameUuid;
    });
});
