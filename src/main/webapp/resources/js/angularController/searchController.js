var myApp = angular.module('myApp', []);
myApp.controller('searchController', function ($scope, $http) {
    $scope.dashboards = [];
     $scope.statistiques = [];
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
            for(var elem in response.data){
                for(var i=0;i<response.data[elem].length;i++){
                    if($scope.statistiques.indexOf(response.data[elem][i])!=-1){
                        $scope.statistiques.push(response.data[elem][i])
                    }
                }
                
            }
           //$scope.statistiques = response.data;
           console.log($scope.statistiques)
        });
    }


});
