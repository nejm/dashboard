var my2App = angular.module('my2App', ['ngResource'])
        .factory('Stat', function ($resource) {
            return $resource("/Dashboard/rest/statistique", {id: "@id"}, {
                update: {
                    method: 'PUT'
                }
            });
        })
        .controller('dashboardController', function ($scope, $http, Stat) {
            console.log(Stat.query());

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
            
        });


