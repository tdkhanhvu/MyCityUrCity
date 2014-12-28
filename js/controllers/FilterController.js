(function(){
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
        loadAllCountries($rootScope.countries, that.countries);

        that.changeSelect = function($item, $model) {
            filter = $item.name;
        }
    });
})();

function loadAllCountries(rootCountries, countries) {
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
        },
        error: function(xhr, status, error) {
            console.log(xhr.responseText);
        }
    });
}
