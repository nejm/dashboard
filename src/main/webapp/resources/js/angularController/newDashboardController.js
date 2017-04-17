myApp = angular.module('app',[]);
myApp.controller('newDashboardController', function ($scope, $http, $compile) {
    
    $scope.statistiques = {};
    $scope.dashboard = [];
    
    $scope.initDashboard = function(user){
        console.log(user);
        $scope.statistiques = {
            my : [
                "a","b"
            ],
            other : [
                { name : "Name 1",
                  data : [ "c" , "d"] },
                { name : "Name 2",
                  data  : ["e" , "f"] }
            ]
                
        }
    }
    
    $scope.preview = function(stat){
        console.log(stat);
    }
    
    $scope.addStatToDashboard = function(stat){
        $scope.dashboard.push(stat);
        var text = $("<div></div>");
        let img = "<img src='/Dashboard/resources/images/lines.png' style='float : left; height : 20%; opacity : 0.2' />";
        text.append(img);
        let preview = $("<div style='margin-top : 50px'></div>").append("<button ng-click=\"preview('"+stat+"')\" class='btn btn-primary'>Preview "+stat+"</button>");
        //let name = $("<div></div>").text("Name");
        text.append(preview);
        $('#d'+$scope.dashboard.length).append($compile(text)($scope));
    }
});
