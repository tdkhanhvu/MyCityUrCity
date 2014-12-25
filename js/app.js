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
//    comments.forEach(function(comment) {
//        $.extend(comment, {
//            image: 'images/caphebet.jpg'
//        });
//    });

    return comments;
}

// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
        // Logged into your app and Facebook.
        testAPI();
    } else if (response.status === 'not_authorized') {
        // The person is logged into Facebook, but not your app.
        document.getElementById('status').innerHTML = 'Please log ' +
            'into this app.';
    } else {
        // The person is not logged into Facebook, so we're not sure if
        // they are logged into this app or not.
        $('#status').html(getLangValue('Login'));
        $('#notLogin').show();
        $('#login').hide();
        $('.command_button > div:nth-of-type(2)').hide();
    }
}

// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it in the sample
// code below.
function checkLoginState() {
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
}

window.fbAsyncInit = function() {
    FB.init({
        appId      : '738394009541313',
        cookie     : true,  // enable cookies to allow the server to access
        // the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v2.1' // use version 2.1
    });

    // Now that we've initialized the JavaScript SDK, we call
    // FB.getLoginStatus().  This function gets the state of the
    // person visiting this page and can return one of three states to
    // the callback you provide.  They can be:
    //
    // 1. Logged into your app ('connected')
    // 2. Logged into Facebook, but not your app ('not_authorized')
    // 3. Not logged into Facebook and can't tell if they are logged into
    //    your app or not.
    //
    // These three cases are handled in the callback function.

    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });

};

// Load the SDK asynchronously
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
function testAPI() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
        console.log(response);
        console.log('Successful login for: ' + response.name);
        userId = response.id;
        userName = response.name;
        $('#username').html(userName);
        $('#userPhoto').attr('src', convertIdIntoFBPhoto(userId));

        $('#notLogin').hide();
        $('#login').show();
        $('.command_button').each(function(index, el) {
            showHideCommandButton(el);
        });
    });
}