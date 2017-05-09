var myApp = angular.module('myApp', []);
myApp.controller('userController', function ($scope, $http, $window) {

    console.log("#UserController");
    $scope.newUser = {
        lastname: "",
        firstname: "",
        username: "",
        password: "",
        address1: "",
        address2: "",
        address3: "",
        telephone: "",
        email: ""
    };

    $scope.users = [];

    $scope.init = function () {
        $http.get("/Dashboard/rest/users").then(function (response) {
            $scope.users = response.data;
        });
    };

    $scope.addUser = function () {
        $http.get("/Dashboard/rest/users/exist/" + $scope.newUser.username)
                .then(function (response) {
                    if (response.data === true) {
                        $.notify("Username existant !", "error");
                    } else {
                        $http.post("/Dashboard/rest/users/add", $scope.newUser)
                                .then(function (res) {
                                    console.log(res);
                                    $.notify("Utilisateur ajouter avec succées avec l'id : " + res.data, "success");
                                    if ($scope.profiles.length > 0) {
                                        let profiles = {
                                            id: res.data,
                                            roles: $scope.profiles
                                        };
                                        $http.post("/Dashboard/rest/users/profiles", profiles);
                                    }
                                });
                    }
                });
    };

    $scope.allProfiles = [];
    $scope.profiles = [];

    $scope.addOrEdit = function (id) {
        $http.get("/Dashboard/rest/roles").then(function (response) {
            $scope.allProfiles = response.data;
            console.log(response.data)
        });

        if (id == 0) {
            $scope.editerUser = false;
        } else {
            $scope.editerUser = true;
            $http.get("/Dashboard/rest/profiles/" + id).then(function (response) {
                $scope.tempProfiles = response.data;
                if (response.data.length > 0) {
                    $http.get("/Dashboard/rest/roles").then(function (response) {
                        for (var elm in response.data) {
                            for(var i=0;i <$scope.tempProfiles.length; i++){
                                if(response.data[elm].roleId == $scope.tempProfiles[i].roleId){
                                    $scope.profiles.push(response.data[elm]);
                                    $scope.allProfiles.splice($scope.allProfiles.indexOf(response.data[elm]),1);
                                }
                            }
                            
                        }
                        $http.get("/Dashboard/rest/users/edit/" + id).then(function (response) {
                            $scope.newUser = response.data;
                        });
                    });
                } else {
                    $http.get("/Dashboard/rest/users/edit/" + id).then(function (response) {
                        $scope.newUser = response.data;
                    });

                }
            });
        }

    };

    $scope.editUser = function (user) {
        $http.post("/Dashboard/rest/users/edit", user).then(function (response) {
            let profiles = {
                id: user.userId,
                roles: $scope.profiles
            };
            $http.post("/Dashboard/rest/users/profiles", profiles).then(function () {
                $window.location.href = '/Dashboard/users';
            });
        });
    };

    $scope.addProfil = function(index) {
        if (typeof $scope.allProfiles[index] != 'undefined') {
            $scope.profiles.push($scope.allProfiles[index]);
            $scope.allProfiles.splice(index, 1);
        }
    }

    $scope.removeProfil = function (profil) {
        console.log($scope.profiles.indexOf(profil))
        $scope.profiles.splice($scope.profiles.indexOf(profil), 1);
        $scope.allProfiles.push(profil);
    }


});
