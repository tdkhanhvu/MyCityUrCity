(function(){
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
                result.forEach(function(comment) {
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

function loadAllCities(cities, countryId, $scope) {
    $.ajax({
        url: serviceUrl,
        type: "post",
        data: {'request':'GetAllCitiesForACountry', 'countryId':countryId},
        dataType: 'json',
        success: function(result){
            cities.length = 0;

            result.forEach(function(city) {
                cities.push(city);
            });
            $scope.$apply();
        },
        error: function(xhr, status, error) {
            console.log(xhr.responseText);
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

function removeImageFromPreview() {
    if (typeof uploaders['photoUpload'] !='undefined') {
        uploaders['photoUpload'].files.forEach(function(file) {
            file.keepFile = true;
        });
        uploaders['photoUpload'].removeAllFiles(true);
        $('#photoUpload').hide();
    }
}