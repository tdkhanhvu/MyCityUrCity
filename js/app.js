var app = angular.module('world', [ ]),
    serviceUrl = './_db/WebService.php',
    userId = -1,
    userName = '',
    uploaders = [];

(function(){
    $('body').on('click', '.photo_upload_icon', function() {
        var icon = $(this),
            form = icon.parent().find('form');

        if (form.length) {
            form.toggle();
        }
        else {
            var id = 'photoUpload';
            $('<form action="/file-upload" class="dropzone" id="' + id + '"></form>').insertAfter(icon);

            Dropzone.autoDiscover = false;
            uploaders[id] = new Dropzone("#" + id, {
                url: "upload.php",
                addRemoveLinks: true
            });
        }
    });

    app.controller('CommentController', function($scope){
        this.countries = [{
            id: 'Vietnam',
            label: 'Vietnam',
            cities: [{
                id: 'Ho Chi Minh'
            },{
                id: 'Ha Noi'
            }]
        }, {
            id: 'UK',
            label: 'UK',
            cities: [{
                id: 'London'
            },{
                id: 'Cambridge'
            }]
        }];
        this.cities = [];

        this.filter = "all";
        this.comments = [];
        loadAllComments(this.comments);

        this.isShown = function(city){
            return this.filter === "all" || this.filter === city;
        };

        this.newComment = {};
        var that = this;
        this.addComment = function() {
            this.newComment.country = this.newComment.country['id'];
            this.newComment.city = this.newComment.city['id'];

            $.ajax({
                url: serviceUrl,
                type: "post",
                data: {'request':'InsertNewComment', 'userId': userId, 'userName': userName,
                    'country' : this.newComment.country, 'city': this.newComment.city,
                    'content': this.newComment.content,
                    'images': JSON.stringify(getUploadedPhoto('photoUpload'))
                },
                dataType: 'json',
                success: function(result){
                    $.extend(that.newComment, {
                        id:result.id,
                        flag: result.flag,
                        color: result.color,
                        citizenship: result.citizenship,
                        images: result.images
                    });
                    that.comments.push(that.newComment);
                    that.newComment = {};
                    $scope.$apply();
                },
                error: function(xhr, status, error) {
                    console.log(xhr.responseText);
                }
            });


        }
    });
    app.controller('SessionController', function(){
        this.isLogin = true;
    });

    app.controller('FilterController', function(){
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
    return comments;
}

function removeFileFromServer(fileName) {
    $.ajax({
        url: './upload.php',
        type: "post",
        data: {'fileName':fileName},
        dataType: 'json',
        success: function(result){
        },
        error: function(xhr, status, error) {
            alert(xhr.responseText);
        }
    });
}

function getUploadedPhoto(id) {
    var fileNames = [];

    if (typeof uploaders[id] !='undefined')
        uploaders[id].files.forEach(function(file) {
            fileNames.push(file.uploadName);
        });

    return fileNames;
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
        //$('#status').html(getLangValue('Login'));
        //$('#notLogin').show();
        //$('#login').hide();
        //$('.command_button > div:nth-of-type(2)').hide();
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
        appId      : '738573852891597',
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

        //$('#notLogin').hide();
        //$('#login').show();
        $('.command_button').each(function(index, el) {
            showHideCommandButton(el);
        });
    });
}