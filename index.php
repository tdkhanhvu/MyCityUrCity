<?php
/**
 * Created by PhpStorm.
 * User: user
 * Date: 12/25/14
 * Time: 12:31 AM
 */

?>

<!DOCTYPE html>
<html ng-app="world" ng-controller="SessionController as ssCtrl">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" type="text/css" href="css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="css/upload/dropzone.css" />
    <link rel="stylesheet" type="text/css" href="css/select2/select.css" />
    <link rel="stylesheet" href="http://cdnjs.cloudflare.com/ajax/libs/selectize.js/0.8.5/css/selectize.default.css">
    <link rel="stylesheet" type="text/css" href="css/main.css" />
</head>
<body ng-controller="CommentController as cmtCtrl" class="container-fluid">
    <div ng-controller="FilterController as filterCtrl">
        <div class="row inputComment">
            <form name="commentForm" class="col-md-8" ng-submit="commentForm.$valid && cmtCtrl.addComment()" novalidate>
                <div class="form-group">
    <!--                <select class="form-control" ng-model="cmtCtrl.newComment.country" required>-->
    <!--                    <option value="1">Vietnam</option>-->
    <!--                    <option value="2">United Kingdom</option>-->
    <!--                </select>-->
                    <select class="form-control" ng-model="cmtCtrl.newComment.country" required
                            ng-options="item.label for item in cmtCtrl.countries track by item.id">
                    </select>
                    <select class="form-control" ng-disabled="!cmtCtrl.newComment.country"
                            ng-model="cmtCtrl.newComment.city" required
                            ng-options="city.id for city in cmtCtrl.newComment.country.cities track by city.id">

                    </select>
                    <textarea class="form-control" ng-model="cmtCtrl.newComment.content" required></textarea>
                    <div> reviewForm is {{commentForm.$valid}} </div>
                    <input class="form-control" type="submit" value="Submit"/>
                    <span class="glyphicon glyphicon-camera photo_upload_icon"></span>

                    <div>
                        <p>Selected: {{country.selected}}</p>
                        <ui-select ng-model="country.selected" theme="selectize" ng-disabled="disabled" style="width: 300px;">
                            <ui-select-match placeholder="Select or search a country in the list...">{{$select.selected.name}}</ui-select-match>
                            <ui-select-choices repeat="country in countries | filter: $select.search">
                                <span ng-bind-html="country.name | highlight: $select.search"></span>
                                <small ng-bind-html="country.code | highlight: $select.search"></small>
                            </ui-select-choices>
                        </ui-select>
                    </div>
                </div>
            </form>
        </div>

        <div class="row comments">
            <div ng-repeat="comment in cmtCtrl.comments | filter: customFilter">
                <comment></comment>
            </div>
        </div>
    </div>
    <fb:login-button scope="public_profile,email" onlogin="checkLoginState();">
    </fb:login-button>
    <div
        class="fb-like"
        data-share="true"
        data-width="450"
        data-show-faces="true">
    </div>
    <script type="text/javascript" src="js/jquery.js"></script>
    <script type="text/javascript" src="js/bootstrap.min.js"></script>
    <script type="text/javascript" src="js/angular.min.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.2.18/angular-sanitize.js"></script>
    <script type="text/javascript" src="js/upload/dropzone.js"></script>
    <script type="text/javascript" src="js/select2/select.js"></script>
    <script type="text/javascript" src="js/app.js"></script>
    <script type="text/javascript" src="js/session.js"></script>
</body>
</html>