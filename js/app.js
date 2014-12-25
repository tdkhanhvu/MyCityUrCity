var app = angular.module('world', [ ]).service('sharedProperties', function () {
    var comments = [];

    return {
        getComments: function () {
            return comments;
        },
        setComments: function(value) {
            property = comments;
        }
    };
}),
    serviceUrl = './_db/WebService.php';

(function(){
    app.controller('CommentController', function($scope){
        console.log('CommentCtrl');
        this.filter = "all";
        this.comments = [];
        loadAllComments(this.comments);
//        this.comments = allComments;
//        $http.post(serviceUrl, {'request':'GetAllComments'}).
//            success(function(data, status, headers, config) {
//                data.forEach(function(comment) {
//                    $.extend(comment, {
//                        name: 'Trần Đoàn Khánh Vũ',
//                        flag: 'images/flag/vietnam.png',
//                        color: 'red',
//                        citizenship: 'Vietnamese',
//                        image: 'images/caphebet.jpg',
//                        city: 'Ho Chi Minh',
//                        id: '5'
//                    });
//                    console.log(comment);
//                    allComments.push(comment);
//                });
//            }).
//            error(function(data, status, headers, config) {
//                // called asynchronously if an error occurs
//                // or server returns response with an error status.
//            });
//
//        this.comments = loadAllComments();
        this.isShown = function(city){
            return this.filter === "all" || this.filter === city;
        };

        this.newComment = {};

        this.addComment = function() {
            $.extend(this.newComment, {
                id:'001',
                city: 'Đà Nẵng',
                flag: 'images/flag/vietnam.png',
                color: 'red',
                citizenship: 'Vietnamese',
                image: 'images/caphebet.jpg'
            });
            this.comments.push(this.newComment);
            this.newComment = {};
        }
    });
    app.controller('SessionController', function(){
        this.isLogin = true;
    });

    app.directive('comment', function(){
        return {
            restrict: 'E',
            templateUrl: 'comment.html'
        };
    });
})();

angular.element(document).ready(function() {
//    var controllerElement = document.querySelector('body'),
//        controllerScope = angular.element(controllerElement).scope();
//    console.log(app.controller('CommentController'));
//    loadAllComments(app.controller('CommentController'));
});
function loadAllComments(comments) {
    $.ajax({
        url: serviceUrl,
        type: "post",
        data: {'request':'GetAllComments'},
        dataType: 'json',
        success: function(result){
          //scope.cmtCtrl.comments = addMoreStuff(result);
//        scope.cmtCtrl.comments = [{
//        id: '123',
//        name: 'Trần Đoàn Khánh Vũ',
//        city: 'Ho Chi Minh',
//        country: 'Vietnam',
//        flag: 'images/flag/vietnam.png',
//        color: 'red',
//        citizenship: 'Vietnamese',
//        content: 'we normally drink a lot of coffee',
//        image: 'images/caphebet.jpg'
//    },{
//        id: '234',
//        name: 'Nguyễn Duy Long',
//        city: 'Ha Noi',
//        country: 'Vietnam',
//        flag: 'images/flag/vietnam.png',
//        color: 'red',
//        citizenship: 'Vietnamese',
//        content: 'we love to enjoy our hot tea in the cold weather',
//        image: 'images/hanoitra.jpg'
//    },{
//        id: '567',
//        name: 'David Beckham',
//        city: 'London',
//        country: 'United Kingdom',
//        flag: 'images/flag/uk.png',
//        color: 'rgb(15, 15, 90)',
//        citizenship: 'British',
//        content: 'we miss our foggy days, all over the year',
//        image: 'images/londonfog.jpg'
//    }];
            //console.log(scope);
          addMoreStuff(result).forEach(function(comment) {
              comments.push(comment);
          });
            console.log(comments);
        },
        error: function(xhr, status, error) {
            console.log(xhr.responseText);
        }
    });
}
function addMoreStuff(comments) {
    comments.forEach(function(comment) {
        $.extend(comment, {
            name: 'Trần Đoàn Khánh Vũ',
            flag: 'images/flag/vietnam.png',
            color: 'red',
            citizenship: 'Vietnamese',
            image: 'images/caphebet.jpg',
            city: 'Ho Chi Minh',
            id: '5'
        });
    });

    return comments;
//    return [{
//        id: '123',
//        name: 'Trần Đoàn Khánh Vũ',
//        city: 'Ho Chi Minh',
//        country: 'Vietnam',
//        flag: 'images/flag/vietnam.png',
//        color: 'red',
//        citizenship: 'Vietnamese',
//        content: 'we normally drink a lot of coffee',
//        image: 'images/caphebet.jpg'
//    },{
//        id: '234',
//        name: 'Nguyễn Duy Long',
//        city: 'Ha Noi',
//        country: 'Vietnam',
//        flag: 'images/flag/vietnam.png',
//        color: 'red',
//        citizenship: 'Vietnamese',
//        content: 'we love to enjoy our hot tea in the cold weather',
//        image: 'images/hanoitra.jpg'
//    },{
//        id: '567',
//        name: 'David Beckham',
//        city: 'London',
//        country: 'United Kingdom',
//        flag: 'images/flag/uk.png',
//        color: 'rgb(15, 15, 90)',
//        citizenship: 'British',
//        content: 'we miss our foggy days, all over the year',
//        image: 'images/londonfog.jpg'
//    }];
}