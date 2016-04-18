console.log("Loaded mainGamePage.js");

app.controller("mainGamePageController", function($scope){
    console.log("In mainGamePageController");

    $scope.$on("gameInfo", function(event, data){
        console.log("mainGamePage got gameInfo signal");
        console.log(data);
        var players = data.players;
        //Find this player's mailbox
        for(var i = 0; i < players.length; ++i)
        {
            if(players[i].uuid === $scope.playerUuid)
            {
                console.log("Found the right uuid");
                $scope.mailbox = players[i].mailbox;
            }
        }
    });


    $scope.submitBtnClickedHandler = function(){
        console.log("submitBtnClickedHandler");
        var chain = $scope.mailbox.shift();
        socket.emit("submission", {
            submitterUuid : $scope.playerUuid,
            chain : chain
        });
    };

    socket.on("chainReceived", function(data){
        console.log("Chain Received");
        console.log(data);
        if(data.targetPlayerUuid = $scope.playerUuid){
            $scope.mailbox.push(data.chain);
        }
    });

});
