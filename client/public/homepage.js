console.log("Loaded homepage.js");

angular.module("teledraw").controller("homepageController", function($scope){
    console.log("Loaded homepageController");

    $scope.showCreateGame = 1;
    $scope.showJoinGame = 1;

    $scope.$on("createGameSuccessful", function(event, data){
        console.log("Create game successful!");
        console.log(data);
    });
});
