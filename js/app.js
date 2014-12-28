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
        var that = this;
        that.countries = [];
        that.newComment = {};
        that.cities = [];
        that.comments = [];

        that.changeCountry = function() {
            if (that.newComment.country !== undefined && that.newComment.country.id !== undefined) {
                loadAllCities(that.cities, that.newComment.country.id, $scope);
            }
        }
        $rootScope.$watchCollection('countries', function(newValue, oldValue)
        {
            $rootScope.countries.forEach(function(country) {
                that.countries.push(country);
            });
            //$scope.countries.shift();
        });

        //load initial comments
        loadAllComments(that.comments);

        //infinite scroll
        that.loadData = function() {
            loadAllComments(that.comments);
        };

        that.addComment = function() {
            $.ajax({
                url: serviceUrl,
                type: "post",
                data: {'request':'InsertNewComment', 'userId': userId, 'userName': userName,
                    'cityId': that.newComment.city['id'],'content': that.newComment.content,
                    'images': JSON.stringify(getUploadedPhoto('photoUpload'))
                },
                dataType: 'json',
                success: function(result){
                    var temp = {'content': that.newComment.content};
                    $.extend(temp, {
                        userName: userName,
                        nationality: that.newComment.country.nationality,
                        cityName: that.newComment.city.name,
                        id:result.id,
                        flag: result.flag,
                        color: result.color,
                        images: result.images
                    });
                    that.comments.splice(0,0,temp);

                    $scope.$apply(function() {
                        that.newComment.content = '';
                        removeImageFromPreview();
                    });
                },
                error: function(xhr, status, error) {
                    console.log(xhr.responseText);
                }
            });
        }
    });


    app.controller('SessionController', ['$scope', function($scope){
        $scope.userId = userId;
        this.isLogin = function() {
            return $scope.userId != -1;
        };
    }]);

    app.controller('FilterController', function($scope, $rootScope){
        var that = this;
        that.customFilter = function (item) {
            return that.country.selected === undefined ||
                that.country.selected.name === 'All' ||
                that.country.selected.name === item.countryName;
        };


        that.country = {};
        that.countries = [{name: 'All'}];
        $rootScope.countries = [];
        loadAllCountries($rootScope.countries, that.countries, $rootScope);

        that.changeSelect = function($item, $model) {
            filter = $item.name;
        }
    });

    app.directive('comment', function(){
        return {
            restrict: 'E',
            templateUrl: 'template/comment.html'
        };
    });
    app.directive('inputcomment', function(){
        return {
            restrict: 'E',
            templateUrl: 'template/inputcomment.html'
        };
    });
    app.directive('userdetail', function(){
        return {
            restrict: 'E',
            templateUrl: 'template/userdetail.html'
        };
    });
    app.directive('commentdetail', function(){
        return {
            restrict: 'E',
            templateUrl: 'template/commentdetail.html'
        };
    });
    app.directive('filter', function(){
        return {
            restrict: 'E',
            templateUrl: 'template/filter.html'
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

function loadAllCountries(rootCountries, countries, $rootScope) {
    $.ajax({
        url: serviceUrl,
        type: "post",
        data: {'request':'GetAllCountries'},
        dataType: 'json',
        success: function(result){
            result.forEach(function(country) {
                countries.push(country);
                rootCountries.push(country);
            });
            //$rootScope.$apply();
        },
        error: function(xhr, status, error) {
            console.log(xhr.responseText);
        }
    });
}

function loadAllCities(cities, countryId, $scope) {
    $.ajax({
        url: serviceUrl,
        type: "post",
        data: {'request':'GetAllCitiesForACountry', 'countryId':countryId},
        dataType: 'json',
        success: function(result){
            cities.length = 0;

            result.forEach(function(city) {
                console.log(city);
                cities.push(city);
            });
            $scope.$apply();
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

        setUserId(userId);
        setCountry(userId);

        $('#profilePic').attr('src','https://graph.facebook.com/' + userId + '/picture?type=large');
        $('#userName').text(userName);

        $('.command_button').each(function(index, el) {
            showHideCommandButton(el);
        });
    });
}

function setUserId(userId) {
    var ctrlElement = document.querySelector('[ng-controller="SessionController as sessionCtrl"]'),
        $scope = angular.element(ctrlElement).scope();
    $scope.$apply(function() {
        $scope.userId = userId;
    });
}

function setCountry(userId) {
    $.ajax({
        url: serviceUrl,
        type: "post",
        data: {'request':'GetUserDetail', 'userId': userId},
        dataType: 'json',
        success: function(result){
            if (result.countryId !== undefined) {
                var ctrlElement = document.querySelector('[ng-controller="CommentController as cmtCtrl"]'),
                    $scope = angular.element(ctrlElement).scope();

                $scope.$apply(function() {
                    $scope.cmtCtrl.newComment.country = $scope.cmtCtrl.countries[result.countryId - 1];
                    $scope.cmtCtrl.changeCountry();
                });

                setTimeout(function(){
                    $scope.$apply(function() {
                        $scope.cmtCtrl.newComment.city = $scope.cmtCtrl.cities.filter(function(city) {
                            if (city.id == result.cityId) {
                                return city;
                            }
                        })[0];
                    });
                }, 2000);
            }
        },
        error: function(xhr, status, error) {
            console.log(xhr.responseText);
        }
    });
}

function removeImageFromPreview() {
    if (typeof uploaders['photoUpload'] !='undefined') {
        uploaders['photoUpload'].files.forEach(function(file) {
            file.keepFile = true;
        });
        uploaders['photoUpload'].removeAllFiles(true);
        $('#photoUpload').hide();
    }

}