var my2App = angular.module('my2App', ['ngResource']);

my2App.controller('dashboardController', function ($scope, $http, $location) {

    $scope.states = [];

    $scope.init = function (user) {
        $http.get("/Dashboard/rest/dashboards/available/"+user.toLowerCase()).then(function(response){
            $scope.availableDashboards = response.data;
        });
        console.log(user);
        $http.get("/Dashboard/rest/users/get/" + user.toLowerCase()).then(function (response) {
            $scope.fullUser = response.data;
            console.log($scope.fullUser);
        });
    }

    $scope.edit = function (id) {
        $location.path('/Dashboard/edit/' + id);
    };
    
    $scope.see = function (id) {
        console.log("see : " + id);
    };

});


