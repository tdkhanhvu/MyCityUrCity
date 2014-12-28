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
<div ng-controller="FilterController as filterCtrl" class="main">
    <div role="tabpanel">
</div>
    <!-- Nav tabs -->
    <ul class="nav nav-tabs nav-pills menu" role="tablist">
        <li role="presentation" class="active"><a href="#home" aria-controls="home" role="tab" data-toggle="tab">Home</a></li>
        <li role="presentation"><a href="#about" aria-controls="about" role="tab" data-toggle="tab">About Project</a></li>
    </ul>

    <!-- Tab panes -->
    <div class="tab-content">
        <div role="tabpanel" class="tab-pane fade in active" id="home">
            <inputcomment></inputcomment>

            <div class="row comments">
                <div infinite-scroll="cmtCtrl.loadData()" infinite-scroll-distance="3"
                     ng-repeat="comment in cmtCtrl.comments | filter: filterCtrl.customFilter">
                    <comment></comment>
                </div>
            </div>
        </div>
        <div role="tabpanel" class="tab-pane fade" id="about">
            <aboutus></aboutus>
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
    <script type="text/javascript" src="js/FB.js"></script>
    <script type="text/javascript" src="js/controllers/CommentController.js"></script>
    <script type="text/javascript" src="js/controllers/SessionController.js"></script>
    <script type="text/javascript" src="js/controllers/FilterController.js"></script>
</body>
</html>