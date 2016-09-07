console.log("Loaded joinGame.js");

app.controller("joinGameController", function($scope){
    console.log("In joinGame controller");
    $scope.gameList = [{gameName: "Test Game!"}];
    $scope.rowClickedHandler = function(game){
        console.log("In rowClickedHandler");
        console.log(game);
        if(game.hasPassword){
            var password = prompt("Please enter password");
            if(password != null){
                game.password = password;
                joinGame(game);
            }
        }
        else{
            joinGame(game);
        }
    }

    function joinGame(game){
        console.log($scope.playerUuid);
        socket.emit("joinGame",
            {
                gameName : game.gameName,
                gameUuid : game.uuid,
                password : game.password,
                playerUuid : $scope.playerUuid,
                playerUsername : $scope.username,
            }
        );
    };

    $scope.$on("userLoggedIn", function(){
        socket.emit("getOpenGameList", {});
    });

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

    socket.on("openGameList", function(data){
        console.log("Received open game list");
        console.log(data);
        $scope.$apply(function(){
            if(data.gameList)
            $scope.gameList = data.gameList;
        });
    });

    socket.on("gameAdded", function(data){
        console.log("Received gameAdded");
        $scope.$apply(function(){
            $scope.gameList.push(data);
        });
    });
    
    $scope.$on("gameJoined", function(event, data){
        for(var i = 0; i < $scope.gameList.length; ++i){
            if($scope.gameList[i].uuid === data.uuid){
                $scope.gameList.splice(i, 1);
            }
        }
    });
});


