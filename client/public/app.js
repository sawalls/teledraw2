console.log("Loaded app.js");

var socket = io();

var STATES = {
    USER_NOT_LOGGED_IN : 1,
    USER_HOME_SCREEN : 2,
    CREATE_ACCT : 3,
};

var app = angular.module("teledraw", []);

var currentState = STATES.USER_NOT_LOGGED_IN;

//The following function represents an initial state for the app
function userNotLoggedIn(data){
    if(data.msg = "loginSuccess"){
    }
    else if(data.msg = "loginFailure"){
        $scope.loginErrorVis = 1;
    }
};

app.controller("appController", function($scope){
    console.log("appController loaded");
    function hideAll(){
        $scope.showLogin = 0;
        $scope.showCreateAcct = 0;
        $scope.showHomepage = 0;
    };

    $scope.$on("navigateToCreateAcct", function(event, args){
        console.log("Got signal navigateToCreateAcct");
        hideAll();
        $scope.showCreateAcct = 1;
    });

    function userCredentialsAccepted(args){
        console.log(args);
        $scope.username = args.username;
        $scope.playerUuid = args.uuid;
        console.log($scope.playerUuid);
        hideAll();
        $scope.showHomepage = 1;
        $scope.$broadcast("userLoggedIn");
    }

    $scope.$on("loginSuccessful", function(event, args){
        console.log("Got signal loginSuccessful");
        userCredentialsAccepted(args);
    });

    $scope.$on("createAcctSuccessful", function(event, args){
        console.log("Got signal createAcctSuccessful");
        userCredentialsAccepted(args);
    });

    $scope.showLogin = 1;
});

