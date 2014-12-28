(function(){
    app.controller('SessionController', ['$scope', function($scope){
        $scope.userId = userId;
        this.isLogin = function() {
            return $scope.userId != -1;
        };
    }]);
})();