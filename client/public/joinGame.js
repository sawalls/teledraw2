console.log("Loaded joinGame.js");

app.controller("joinGameController", function($scope){
    console.log("In joinGame controller");
    $scope.gameList = [{gameName: "Test Game!"}];
    $scope.rowClickedHandler = function(game){
        console.log("In rowClickedHandler");
        console.log(game);
    }
    function joinGame(){
        console.log($scope.gameName);
        console.log($scope.password);
        console.log($scope.playerUuid);
        socket.emit("joinGame",
            {
                gameName : $scope.gameName,
                password : $scope.password,
                creatorUuid : $scope.playerUuid,
            }
        );
    };

    socket.on("joinGameError", function(data){
        console.log("Join Game Error!");
        console.log(data);
        $scope.$apply(function(){
            $scope.joinGameErrorMsg = data.msg;
            $scope.showError = 1;
        });
    });

    socket.on("joinGameSuccessful", function(data){
        console.log("Join Game Successful!");
        console.log(data);
        $scope.$apply(function(){
            $scope.$emit("joinGameSuccessful", data);
        });
    });
});


