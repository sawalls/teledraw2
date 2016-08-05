console.log("Loaded topNavBar.js!");

app.controller("topNavBarController", function($scope){
    console.log("topNavBarController loaded!");
    $scope.logoutClickedHandler = function(){
        console.log("Logging out!");
    };
});
