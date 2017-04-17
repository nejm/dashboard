var my2App = angular.module('my2App', ['ngResource'])
        .factory('Stat', function ($resource) {
            return $resource("/Dashboard/rest/statistique", {id: "@id"}, {
                update: {
                    method: 'PUT'
                }
            });
        })
        .controller('dashboardController', function ($scope, $http, Stat, $location) {
            
            $scope.states = [];
            $scope.init = function(user){
                
                $http.get("/Dashboard/rest/statistique/created/"+user).then(function(response){
                   $scope.myStats = response.data;
                   console.log($scope.myStats);
                }); 
            }
            
            $scope.add = function () {

            }
            
            $scope.edit = function(id){
                $location.path('/Dashboard/edit/'+id);
            }
            $scope.see = function(id){
                console.log("see : "+id);
            }
            
            $scope.saveDashboard = function(){
                console.log($('.grid-snap'));
            }
        });


