(function(){
    app.controller('SessionController', ['$scope', function($scope){
        var that = this;
        that.userId = userId;
        that.isLogin = function() {
            return that.userId != -1;
        };
    }]);
})();