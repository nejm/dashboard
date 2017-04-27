var myApp = angular.module('myApp', []);
myApp.controller('searchController', function ($scope, $http) {
    $scope.dashboards = [];
     $scope.stats = [];
    $scope.username = "";
    $scope.init = function (username) {
        $scope.username = username.toLowerCase();
        //console.log($scope.username);
        $http.get("/Dashboard/rest/dashboards/available/"+$scope.username).then(function(response) {
           $scope.dashboards = response.data;
           console.log(response.data)
        });
    }
    
     $scope.initStats = function (username) {
        $scope.username = username.toLowerCase();
        //console.log($scope.username);
        $http.get("/Dashboard/rest/statistique/available/"+$scope.username).then(function(response) {
           $scope.stats = response.data;
           console.log(response.data)
        });
    }


});
