var app = angular.module('world', ['ngSanitize', 'ui.select','infinite-scroll']),
    serviceUrl = './_db/WebService.php',
    userId = -1,
    userName = 'Trần Đoàn Khánh Vũ',
    filter = "all",
    filterIndex = {},
    loading = false,
    uploaders = [];

(function(){
    $('body').on('click', '.photo_upload_icon', function() {
        if (userId != - 1) {
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
        }
    });

    app.controller('CommentController', function($scope, $rootScope){
//        this.countries = [{
//            id: 'Vietnam',
//            label: 'Vietnam',
//            cities: [{
//                id: 'Ho Chi Minh'
//            },{
//                id: 'Ha Noi'
//            }]
//        }, {
//            id: 'United Kingdom',
//            label: 'United Kingdom',
//            cities: [{
//                id: 'London'
//            },{
//                id: 'Cambridge'
//            }]
//        }];
        this.countries = [];
        var that = this;
        $rootScope.$watch('countries', function( status )
        {
           that.countries = $rootScope.countries;
           that.countries.shift();
        });
        this.cities = [];

        this.comments = [];
        loadAllComments(this.comments);
        this.loadData = function() {
            loadAllComments(this.comments);
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
                        name: userName,
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
    }).directive('lazyLoadOptions', ['$rootScope', function($rootScope) {
            return {
                restrict: 'EA',
                require: 'ngModel',
                scope: {
                    options: '='
                },
                link: function($scope, $element, $attrs, $ngModel){
                    // Ajax loading notification
                    $scope.options = [
                        {
                            name: "Loading..."
                        }
                    ];

                    // Control var to prevent infinite loop
                    $scope.loaded = false;

                    $element.bind('mousedown', function() {

                        // Use setTimeout to simulate web service call
                        setTimeout(function(){
                            if(!$scope.loaded) {
                                $scope.$apply(function(){
                                    console.log('vu');
                                    console.log($rootScope.countries);
                                    $scope.options = $rootScope.countries;
                                });

                                // Prevent the load from occurring again
                                $scope.loaded = true;

                                // Blur the element to collapse it
                                $element[0].blur();

                                // Click the element to re-open it
                                var e = document.createEvent("MouseEvents");
                                e.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                                $element[0].dispatchEvent(e);
                            }
                        }, 2000);
                    });
                }
            }
        }])

    ;


    app.controller('SessionController', ['$scope', function($scope){
        $scope.userId = userId;
        this.isLogin = function() {
            return $scope.userId != -1;
        };
    }]);

    app.controller('FilterController', function($scope, $rootScope){
        $scope.customFilter = function (item) {
            return $scope.country.selected === undefined ||
                $scope.country.selected.name === 'All' ||
                $scope.country.selected.name === item.country;
        };


        $scope.country = {};
        $rootScope.countries = [{name: 'All'}];
        loadAllCountries($rootScope.countries);

        $scope.changeSelect = function($item, $model) {
            filter = $item.name;
        }
    });

    app.directive('comment', function(){
        return {
            restrict: 'E',
            templateUrl: 'comment.html'
        };
    });
})();


function loadAllComments(comments) {
    if (!loading) {
        if(!filterIndex.hasOwnProperty(filter)){
            filterIndex[filter] = 0;
        }
        loading = true;
        $.ajax({
            url: serviceUrl,
            type: "post",
            data: {'request':'GetAllComments', 'filter': filter, 'start':filterIndex[filter]},
            dataType: 'json',
            success: function(result){
                console.log(result);
                addMoreStuff(result).forEach(function(comment) {
                    if (!comments.filter(function (element, index, array) {return element.id == comment.id;}).length) {
                        comments.push(comment);
                        filterIndex[filter] += 1;
                    }
                });
                loading = false;
            },
            error: function(xhr, status, error) {
                console.log(xhr.responseText);
            }
        });
    }
}

function loadAllCountries(countries) {
    $.ajax({
        url: serviceUrl,
        type: "post",
        data: {'request':'GetAllCountries'},
        dataType: 'json',
        success: function(result){
            result.forEach(function(country) {
                countries.push({'name':country.name});
            });
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

        var ctrlElement = document.querySelector('[ng-controller="SessionController as sessionCtrl"]');
        var $scope = angular.element(ctrlElement).scope();
        $scope.$apply(function() {
            $scope.userId = userId;
        });

        console.log($scope);
        //$scope.$apply(function() {
        //    $scope.data.age = 20;
        //});
        $('#profilePic').attr('src','https://graph.facebook.com/' + userId + '/picture?type=large');
        $('#userName').text(userName);
        //$('#notLogin').hide();
        //$('#login').show();
        $('.command_button').each(function(index, el) {
            showHideCommandButton(el);
        });
    });
}