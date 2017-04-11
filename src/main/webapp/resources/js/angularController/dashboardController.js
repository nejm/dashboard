var my2App = angular.module('my2App', ['ngResource'])
        .factory('Stat', function ($resource) {
            return $resource("/Dashboard/rest/statistique", {id: "@id"}, {
                update: {
                    method: 'PUT'
                }
            });
        })
        .controller('dashboardController', function ($scope, $http, Stat, $location) {
            
            $scope.myStats = [];
            
            $scope.init = function(user){
                
                $http.get("/Dashboard/rest/statistique/created/"+user).then(function(response){
                   $scope.myStats = response.data;
                   console.log($scope.myStats);
                });
            }
            
            $scope.add = function () {

                stat = new Stat();
                stat.id="4";
                stat.name = "test 2";
                stat.description = "bla bla bla";
                stat.data = "[{a : 5},{b : 2}]";
                stat.createdBy = "nejm";
                stat.creationDate = Date.now();
                console.log(stat);
                stat.$save();
            }
            
            $scope.edit = function(id){
                console.log("edit : "+id);
                $location.path('/Dashboard/edit/'+id);
            }
            $scope.see = function(id){
                console.log("see : "+id);
            }
            
            $scope.saveDashboard = function(){
                console.log($('.grid-snap'));
            }
        });


