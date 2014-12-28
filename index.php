<?php
/**
 * Created by PhpStorm.
 * User: user
 * Date: 12/25/14
 * Time: 12:31 AM
 */

?>

<!DOCTYPE html>
<html ng-app="world" ng-controller="SessionController as sessionCtrl">
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
            <div class="col-md-2">
                <img id="profilePic" class="img-thumbnail" ng-show="sessionCtrl.isLogin()"
                     src=""/>
                <p id="userName" class="text-center" ng-show="sessionCtrl.isLogin()">Nguyễn Quang Phúc</p>
                <p ng-show="!sessionCtrl.isLogin()">Please login to comment</p>
                <fb:login-button scope="public_profile,email" onlogin="checkLoginState();"
                                 ng-show="!sessionCtrl.isLogin()">
                </fb:login-button>
            </div>
            <form name="commentForm" class="form-horizontal col-md-6" ng-submit="commentForm.$valid && cmtCtrl.addComment()" novalidate>
                <div class="form-group">
                    <label for="country" class="col-sm-2 control-label">Country</label>
                    <div class="col-sm-10">
                        <select id="country" class="form-control" ng-model="cmtCtrl.newComment.country" required
                                ng-disabled="!sessionCtrl.isLogin()" lazy-load-options="" data-options="select.options"
                                ng-options="o.name for o in select.options">
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="city" class="col-sm-2 control-label">City</label>
                    <div class="col-sm-10">
                        <select id="city" class="form-control" ng-disabled="!sessionCtrl.isLogin()
                                || !cmtCtrl.newComment.country" ng-model="cmtCtrl.newComment.city" required
<!--                                ng-options="city.id for city in cmtCtrl.newComment.country.cities track by city.id">-->
                        ng-options="o.name for o in cmtCtrl.newComment.country">
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="content" class="col-sm-2 control-label">Content</label>
                    <div class="col-sm-10">
                        <input id="content" class="form-control" ng-disabled="!sessionCtrl.isLogin()"
                               ng-model="cmtCtrl.newComment.content" required/>
                        <span class="glyphicon glyphicon-camera photo_upload_icon"
                              style="position:relative; top:-33px;float:right;font-size:35px;height:0;"></span>
                    </div>
                </div>
                <div class="form-group">
                    <div class="col-sm-offset-6 col-sm-3">
                        <button class="form-control btn btn-success" ng-disabled="!sessionCtrl.isLogin()"
                                type="submit">Submit</button>
                    </div>
                </div>
            </form>
            <div class="col-md-4">
                <ui-select ng-model="country.selected" theme="bootstrap" ng-disabled="disabled"
                           on-select="changeSelect($item, $model)">
                    <ui-select-match placeholder="Filter By Country">{{$select.selected.name}}</ui-select-match>
                    <ui-select-choices repeat="country in countries | filter: $select.search">
                        <span ng-bind-html="country.name | highlight: $select.search"></span>
                    </ui-select-choices>
                </ui-select>
            </div>
        </div>

        <div class="row comments">
            <div infinite-scroll="cmtCtrl.loadData()" infinite-scroll-distance="3"
                 ng-repeat="comment in cmtCtrl.comments | filter: customFilter">
                <comment></comment>
            </div>
        </div>
    </div>
    <script type="text/javascript" src="js/jquery.js"></script>
    <script type="text/javascript" src="js/bootstrap.min.js"></script>
    <script type="text/javascript" src="js/angular.min.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.2.18/angular-sanitize.js"></script>
    <script type="text/javascript" src="js/scroll/ng-infinite-scroll.js"></script>
    <script type="text/javascript" src="js/upload/dropzone.js"></script>
    <script type="text/javascript" src="js/select2/select.js"></script>
    <script type="text/javascript" src="js/app.js"></script>
    <script type="text/javascript" src="js/session.js"></script>
</body>
</html>