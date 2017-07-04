var myApp = angular.module('myApp', ['ui.bootstrap']);
myApp.controller('userController', function ($scope, $http, $window, $uibModal) {

    console.log("#UserController");
    $scope.newUser = {
        lastname: "",
        firstname: "",
        username: "",
        password: "",
    };

    $scope.users = [];

    $scope.init = function (user) {
        $http.get("/Dashboard/rest/users").then(function (response) {
            $scope.users = response.data;
        });
        $http.get("/Dashboard/rest/users/get/"+user.toLowerCase()).then(function(response){
            console.log(response.data)
            $scope.fullUser = response.data;
        });
        
    };

    $scope.openModal = function (name) {
        console.log(name);
        $scope.modalInstance = $uibModal.open({
            templateUrl: '/Dashboard/resources/partials/' + name + '.html',
            scope: $scope
        });
    };

    $scope.closeModal = function () {
        if (typeof $scope.modalInstance !== 'undefined' && $scope.modalInstance !== null) {
            $scope.modalInstance.close();
            $scope.modalInstance = null;
        }
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
                                        $http.post("/Dashboard/rest/users/profiles", profiles).then(function(){
                                            $scope.closeModal();
                                        });
                                    }else{
                                       $scope.closeModal(); 
                                    }
                                });
                    }
                });
    };

    $scope.allProfiles = [];
    $scope.profiles = [];
    $http.get("/Dashboard/rest/roles").then(function (response) {
        $scope.allProfiles = response.data;
        console.log(response.data)
    });

    $scope.addOrEdit = function (id) {
        if (id == 0) {
            $scope.editerUser = false;
        } else {
            $scope.editerUser = true;
            $http.get("/Dashboard/rest/profiles/" + id).then(function (response) {
                $scope.tempProfiles = response.data;
                if (response.data.length > 0) {
                    $http.get("/Dashboard/rest/roles").then(function (response) {
                        for (var elm in response.data) {
                            for (var i = 0; i < $scope.tempProfiles.length; i++) {
                                if (response.data[elm].roleId == $scope.tempProfiles[i].roleId) {
                                    $scope.profiles.push(response.data[elm]);
                                    $scope.allProfiles.splice($scope.allProfiles.indexOf(response.data[elm]), 1);
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

    $scope.getUserIndex = function (user) {
        for (let i = 0; i < $scope.users.length; i++) {
            if ($scope.users[i].userId == user.userId)
                return i;
        }
        return -1;
    }

    $scope.containesProfile = function (table, value) {
        var index = -1;

        for (var i = 0; i < table.length; i++) {
            if (table[i].roleId == value.roleId)
                return i;
        }
        return index;
    }

    $http.get("/Dashboard/rest/roles").then(function (response) {
        $scope.roles = response.data;
    });

    $scope.getRole = function (id) {
        for (var i = 0; i < $scope.roles.length; i++) {
            if ($scope.roles[i].roleId == id) {
                return i;
            }
        }
        return -1;
    }

    $scope.addProfiles = function (profiles) {
        for (var i in profiles) {
            if ((k = $scope.containesProfile($scope.allProfiles, profiles[i])) > -1) {
                console.log(k)
                $scope.allProfiles.splice(k, 1);
                console.log($scope.getRole(profiles[i].roleId))
                $scope.profiles.push($scope.roles[$scope.getRole(profiles[i].roleId)]);
            }
        }
    }

    $scope.editUser = function (user) {
        console.log(user);
        $scope.currentUser = user;
        $scope.profiles = [];
        $http.get("/Dashboard/rest/roles").then(function (response) {
            $scope.allProfiles = response.data;
            $http.get("/Dashboard/rest/profiles/" + user.userId).then(function (response) {
                $scope.addProfiles(response.data);
                $scope.openModal('editUser');
            })
        });
    };

    $scope.ajoutUsersToRole = function (role) {
        $scope.currentRole = role;
        $http.get("/Dashboard/rest/users").then(function (response) {
            $scope.users = response.data;
            $http.get("/Dashboard/rest/roles/users/" + role.roleId).then(function (response) {
                $scope.usersAssignes = [];
                for (let i = 0; i < response.data.length; i++) {
                    if ($scope.getUserIndex(response.data[i]) !== -1)
                        $scope.addToRole($scope.getUserIndex(response.data[i]));
                }
                $scope.openModal('role');
            });
        });
    };

    $scope.saveEditUser = function () {
        $http.post("/Dashboard/rest/users/edit", $scope.currentUser).then(function (response) {
            let profiles = {
                id: $scope.currentUser.userId,
                roles: $scope.profiles
            };
            $http.post("/Dashboard/rest/users/profiles", profiles).then(function () {
                $window.location.href = '/Dashboard/users';
                $scope.currentUser = {};
            });
        });
    }
    
    $scope.saveEditRole = function () {
        console.log($scope.usersAssignes);
        var usersId = [];
        for(var i=0;i<$scope.usersAssignes.length;i++){
            usersId.push($scope.usersAssignes[i].userId);
        }
        var obj = {};
        obj.role = $scope.currentRole.roleId;
        obj.users = usersId;
        
        $http.post("/Dashboard/rest/role/users/add",obj).then(function(){
            $scope.closeModal();
            $.notify("Modification avec succées","success");
        });
        
    }
    
    $scope.addProfil = function (index) {
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

    $scope.usersAssignes = [];

    $scope.addToRole = function (index) {
        $scope.usersAssignes.push($scope.users[index]);
        $scope.users.splice(index, 1);
    };

    $scope.removeFromRole = function (index) {
        $scope.users.push($scope.usersAssignes[index]);
        $scope.usersAssignes.splice(index, 1);
    };
    
    $scope.addRole = function(){
        $scope.openModal('addRole');
    }
    
    $scope.saveRole = function(role){
        $http.post("/Dashboard/rest/roles",{roleName : role}).then(function(response){
            $scope.closeModal();
            $.notify("Role ajouter avec succées avec id = "+response.data,"success");
        });
    }
    
    $scope.deleteRole = function(role){
        $http.post("/Dashboard/rest/roles/delete",role).then(function(){
            $scope.closeModal();
            $.notify("Role supprimer avec succées","success");
        });
    }

});
