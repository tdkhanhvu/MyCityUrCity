var app = angular.module('world', ['ngSanitize', 'ui.select','infinite-scroll']),
    serviceUrl = './_db/WebService.php',
    userId = -1,
    userName = 'Trần Đoàn Khánh Vũ',
    filter = "all",
    filterIndex = {},
    loading = false,
    uploaders = [];

(function(){
    createUploadForm();

    setTemplateDirective();
})();

function setTemplateDirective() {
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
    app.directive('aboutus', function(){
        return {
            restrict: 'E',
            templateUrl: 'template/aboutus.html'
        };
    });
}

function createUploadForm() {
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
}

//used in dropzone.js
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