console.log("Loaded createGame.js");

app.controller("createGameController", function($scope){
    console.log("In createGame controller");
    $scope.createGameBtnClickedHandler = function(){
        console.log("In createGameBtnClickedHandler");
        if(!$scope.gameName){
            return;
        }
        console.log($scope.gameName);
        console.log($scope.password);
        console.log($scope.playerUuid);
        socket.emit("createGame",
            {
                gameName : $scope.gameName,
                password : $scope.password,
                creatorUuid : $scope.playerUuid,
            }
        );
    };

    socket.on("createGameError", function(data){
        console.log("CreateGame Error!");
        console.log(data);
        $scope.$apply(function(){
            $scope.createGameErrorMsg = data.msg;
            $scope.showError = 1;
        });
    });

    socket.on("createGameSuccessful", function(data){
        console.log("Create Game Successful!");
        console.log(data);
        $scope.$apply(function(){
            $scope.$emit("createGameSuccessful", data);
        });
    });
});


