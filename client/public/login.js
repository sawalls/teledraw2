console.log("Loaded login.js");

app.controller("loginController", function($scope){
    console.log("In login controller");
    $scope.loginBtnClickedHandler = function(){
        if(!$scope.username || !$scope.password){
            return;
        }
        socket.emit("login",
            {
                username : $scope.username,
                password : $scope.password,
            }
        );
    };

    $scope.createAcctBtnClickedHandler = function(){
        console.log("login createAcctBtnClickedHandler");
        $scope.$emit("navigateToCreateAcct", {});
    };
    
    socket.on("loginError", function(data){
        console.log("Login Error!");
        console.log(data);
        $scope.$apply(function(){
            if(data.rc > 0){
                $scope.loginErrorMsg = "Invalid credentials";
            }
            else{
                $scope.loginErrorMsg = "Database error - Please try again later";
            }
            $scope.showError = 1;
        });
    });

    socket.on("loginSuccessful", function(data){
        console.log("Login Successful!");
        console.log(data);
        $scope.$apply(function(){
            $scope.$emit("loginSuccessful", data);
        });
    });
});


