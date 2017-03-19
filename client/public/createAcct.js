
console.log("Loaded createAcct.js");
angular.module("teledraw").controller("createAcctController", function($scope){
    console.log("In createAcctController");
    $scope.createAcctBtnClickedHandler = function(){
        console.log("Button clicked");
        if(!$scope.createAcctUsername 
                || !$scope.createAcctPassword
                || !$scope.createAcctEmail){
            alert("Please fill completely");
            return;
        }
        console.log($scope.createAcctUsername);
        console.log($scope.createAcctPassword);
        
        socket.emit("createAcct",
            {
                username : $scope.createAcctUsername,
                password : $scope.createAcctPassword,
                email : $scope.createAcctEmail,
            }
        );
    };

    socket.on("createAcctError", function(data){
        console.log("Create Acct Error!");
        console.log(data);
        $scope.$apply(function(){
            $scope.createAcctErrorMsg= data.msg;
            $scope.showError = 1;
        });
    });

    socket.on("createAcctSuccessful", function(data){
        console.log("Create Acct Successful!");
        $scope.$apply(function(){
            $scope.$emit("createAcctSuccessful", data);
        });
    });
});

