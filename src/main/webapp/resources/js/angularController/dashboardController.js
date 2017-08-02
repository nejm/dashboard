var my2App = angular.module('my2App', ['ngResource']);

my2App.controller('dashboardController', function ($scope, $http, $location) {

    $scope.states = [];

    $scope.merge = function (obj1, obj2) {
        var struct = [];
        struct = obj1;
        for (var elem in obj2) {
            if (!(elem in struct)) {
                struct[elem] = obj2[elem];
            }
        }
        return struct;
    }

    $scope.flatten = function (data) {
        var result = {};
        function recurse(cur, prop) {
            if (Object(cur) !== cur) {
                result[prop] = cur;
            } else if (Array.isArray(cur)) {
                for (var i = 0, l = cur.length; i < l; i++)
                    recurse(cur[i], prop + "[" + i + "]");
                if (l === 0)
                    result[prop] = [];
            } else {
                var isEmpty = true;
                for (var p in cur) {
                    isEmpty = false;
                    recurse(cur[p], prop ? prop + ":" + p : p);
                }
                if (isEmpty && prop)
                    result[prop] = {};
            }
        }
        recurse(data, "");
        return result;
    }

    $scope.init = function (user) {
        $http.get("/Dashboard/rest/users/get/" + user.toLowerCase()).then(function (response) {
            $scope.fullUser = response.data;
            //console.log($scope.fullUser);
        });
        $http.get("/Dashboard/rest/ressources").then(function (response) {
            $scope.ressources = response.data;

            $http.get("/Dashboard/rest/services").then(function (response) {
                var services = response.data;
                for (var i = 0; i < $scope.ressources.length; i++) {
                    $scope.ressources[i].services = [];
                    for (var j = 0; j < services.length; j++) {
                        if (services[j].ressource === $scope.ressources[i].id) {
                            $scope.ressources[i].services.push(services[j]);
                        }
                    }
                }
            })
        });
    }

    $scope.getService = function (ressource, service) {
        console.log(ressource, service);
        $scope.attributes = [];
        if (ressource.type == 'db') {
            let db = {};
            console.log(ressource)
            db = {
                server: ressource.url.split(':')[1],
                username: ressource.login,
                password: ressource.password,
                databaseName: ressource.url.split(':')[3],
                //driverType: $scope.currentRessource.url.split(':')[1],
                tableName: service.url,
                port: ressource.url.split(':')[2],
                type: ressource.url.split(':')[0]
            }
            $http.post('/Dashboard/rest/services/tables', db).then(function (response) {
                $scope.attributes = response.data;
            });
        } else {
            var url = ressource.url + service.url;
            $http.get(url).then(function (response) {

                var s = $scope.merge($scope.flatten(response.data[0]), $scope.flatten(response.data[1]));
                for (var i = 0; i < response.data.length; i++) {
                    s = $scope.merge(s, $scope.flatten(response.data[i]));
                }
                for (var elem in s) {
                    $scope.attributes.push(elem);
                }
            });

        }
    }

    $scope.edit = function (id) {
        $location.path('/Dashboard/edit/' + id);
    };

    $scope.see = function (id) {
        console.log("see : " + id);
    };

});


