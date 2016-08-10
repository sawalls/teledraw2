console.log("Loaded topNavBar.js!");

app.controller("topNavBarController", function($scope){
    console.log("topNavBarController loaded!");
    $scope.currentGamesClickedHandler = function(){
        $scope.$emit("showCurrentGames");
    };
    $scope.createGameClickedHandler = function(){
        $scope.$emit("showCreateGame");
    };
    $scope.gameLogClickedHandler = function(){
        $scope.$emit("showGameLog");
    };
    $scope.logoutClickedHandler = function(){
        $scope.$emit("logout");
    };
});
