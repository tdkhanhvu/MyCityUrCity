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
    });
}

function setUserId(userId) {
    var ctrlElement = document.querySelector('[ng-controller="SessionController as sessionCtrl"]'),
        $scope = angular.element(ctrlElement).scope();
    $scope.$apply(function() {
        $scope.sessionCtrl.userId = userId;
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