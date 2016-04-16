console.log("Loaded lobby.js");

app.controller("lobbyController", function($scope){
    console.log("In lobbyController");

    $scope.startGameBtnClickedHandler = function(){
        console.log("startGameBtnClickedHandler");
        socket.emit("startGame", {gameUuid : $scope.gameUuid});
    };

    $scope.$on("gameInfo", function(event, data){
        console.log("Got signal gameInfo");
        console.log(data);
        $scope.creatorUuid = data.creatorUuid;
        $scope.playerIsCreator = 
            $scope.playerUuid === $scope.creatorUuid ? true : false;
        $scope.players = [];
        for(var i = 0; i < data.players.length; ++i)
        {
            $scope.players.push(data.players[i]);
        }
    });

    socket.on("playerJoined", function(data){
        console.log("playerJoined");
        console.log(data);
        $scope.$apply(function(){
            $scope.players.push(data);
        });
    });

    socket.on("startGameSuccessful", function(data){
        $scope.$apply(function(){
            $scope.$emit("startGame", {gameUuid : $scope.gameUuid});
        });
    });
});
