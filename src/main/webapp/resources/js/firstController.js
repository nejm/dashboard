myApp.controller('FirstExampleController', function ($q, $timeout, $rootScope, $filter, $scope, $http, $localStorage, $uibModal, $compile) {


    $scope.log = "";
    $scope.allUsers = [];
    $scope.myStats = [];
    $scope.allProfiles = [];
    $scope.edit = false;
    $scope.statistique = {};
    $scope.idProject = false;
    $scope.username = "";
    $scope.statId = "";
    $scope.zoomlevel = 64;
    $scope.pos_x = 214;
    $scope.pos_y = 148;
    $scope.ressource = {};
    $scope.service = {};
    $scope.modalInstance;
    $scope.barx = "";
    $scope.bary = "";
    $scope.barAttributes = [];
    $scope.ressources = [];
    $scope.services = [];
    $scope.conditions = [];
    $scope.statAttributes = [];
    $scope.statData = [];
    $scope.url = "";
    $scope.attributesWhere = [];
    $scope.links = [];
    $scope.index = 0;
    $rootScope.stateObjects = [];
    $scope.stateObjects = [];

    $scope.options = [{
            name: 'Service Web',
            type: 'ws'
        }, {
            name: 'Base de données',
            type: 'db'
        }]



    $scope.targetEndpointStyle = {
        endpoint: "Dot",
        paintStyle: {fillStyle: "#7AB02C", radius: 11},
        maxConnections: -1,
        isTarget: true,
        //isSource:true
    };
    $scope.sourceEndpointStyle = {
        endpoint: "Dot",
        paintStyle: {
            strokeStyle: "#7AB02C",
            fillStyle: "transparent",
            radius: 7,
            lineWidth: 3
        },
        isSource: true,
        maxConnections: -1,
        connector: ["Flowchart", {stub: [30, 30], gap: 20, cornerRadius: 10}],
        //connector:[ "Bezier", { curviness:100 } ],
        connectorStyle: {
            lineWidth: 4,
            strokeStyle: "#61B7CF",
            joinstyle: "round",
            outlineColor: "white",
            outlineWidth: 2
        },
        connectorHoverStyle: {
            fillStyle: "#216477",
            strokeStyle: "#216477"
        }
    };


    $scope.unflatten = function (data) {
        "use strict";
        if (Object(data) !== data || Array.isArray(data))
            return data;
        var regex = /\.?([^.\[\]]+)|\[(\d+)\]/g,
                resultholder = {};
        for (var p in data) {
            var cur = resultholder,
                    prop = "",
                    m;
            while (m = regex.exec(p)) {
                cur = cur[prop] || (cur[prop] = (m[2] ? [] : {}));
                prop = m[2] || m[1];
            }
            cur[prop] = data[p];
        }
        return resultholder[""] || resultholder;
    };
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
                    recurse(cur[p], prop ? prop + "." + p : p);
                }
                if (isEmpty && prop)
                    result[prop] = {};
            }
        }
        recurse(data, "");
        return result;
    }

    $scope.clock = "loading clock..."; // initialise the time variable
    $scope.tickInterval = 1000 //ms

    var tick = function () {
        $scope.clock = Date.now() // get the current time
        $timeout(tick, $scope.tickInterval); // reset the timer
    }

    // Start the timer
    $timeout(tick, $scope.tickInterval);

    $scope.getRessource = function (id) {
        for (var i = 0; i < $scope.ressources.length; i++) {
            if ($scope.ressources[i].ressource.id == id)
            {
                return $scope.ressources[i].ressource;
            }
        }
        return {};
    }

    $scope.addRessource = function (ressource, type) {
        ////console.log(ressource);
        var found = false;
        for (var i in $scope.ressources) {
            if ($scope.ressources[i].ressource.name == ressource.name) {
                $scope.ressources[i].ressource = ressource;
                found = true;
                break;
            }
        }
        if (!found) {
            let savedRessource = {};
            savedRessource = {
                name: ressource.name,
                url: ressource.url,
                login: ressource.login,
                password: ressource.password,
                'type': type
            }


            $http.post("/Dashboard/rest/ressources/save", savedRessource)
                    .then(function (response) {
                        ressource.id = response.data;
                        $scope.ressources.push({
                            'ressource': ressource
                        });
                        $scope.ressource = {};
                        $scope.closeModal();

                        $scope.log = "\n Ressource added with id = " + response.data + $scope.log;
                    })


        } else {
            if (typeof ressource.id !== 'undefined') {
                $http.post("/Dashboard/rest/ressources/update", ressource)
                        .then(function () {
                            swal("Modification", "Modification avec succées", "success");
                            $scope.ressource = {};
                            $scope.closeModal();

                            $scope.log = "\n Ressource modifier avec succées" + $scope.log;
                        })

            } else {
                swal("Duplication !!", "Un ressource avec le même nom déja existe !!", "error");
            }
        }

    };
    $scope.addExistingService = function (service, resource) {
        $('#' + resource.ressource.id)
                .append($compile("<li id='li" + service.id + "'><a><span ng-click=drawService('" + service.service.id + "') >" +
                        service.service.name + "</span><i ng-click='deleteService(" + service.service.id + ")' class='fa fa-trash pull-right'></i><i ng-click='editService(" + service.service.id + ")' class='fa fa-pencil pull-right'></i></a></li>")($scope));
    }

    $scope.editRessource = function (ressource) {
        $scope.ressourceTemp = ressource;
        $scope.openModal('ressourceEdit', null);
    }

    $scope.editService = function (service) {
        $scope.service = $scope.services[service].service;
        $scope.openModal('service', $scope.service.idRessource);
    }

    $scope.deleteRessource = function (ressource) {
        swal({
            title: "Êtes-vous sûr?",
            text: "Vous allez supprimer " + ressource.name + " \n toutes les services vont êtres supprimées !",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Oui, supprimer!",
            closeOnConfirm: false
        },
                function () {
                    let nb = 0;
                    for (service in $scope.services) {
                        if ($scope.services[service].service.idRessource == ressource.id) {
                            let deletedService = {
                                id: $scope.services[service].service.id,
                                name: $scope.services[service].service.name,
                                url: $scope.services[service].service.url,
                                ressource: ressource.id
                            }
                            nb++;
                            ////////console.log(deletedService)
                            $http.post("/Dashboard/rest/services/delete", deletedService).then(function (response) {
                                $scope.log = "\n Service supprimer avec succées" + $scope.log;
                            });
                        }

                    }

                    $http.post("/Dashboard/rest/ressources/delete", ressource).then(function (response) {
                        $scope.log = "\n Ressource supprimer avec succées" + $scope.log;
                        swal("Supprimer!", "Ressource supprimer avec succées.", "success");
                        $scope.updateRessourcesAndServices();
                    });
                });
    }

    $scope.deleteService = function (service) {
        swal({
            title: "Êtes-vous sûr?",
            text: "Vous allez supprimer " + $scope.services[service].service.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Oui, supprimer!",
            closeOnConfirm: false
        },
                function () {
                    let deletedService = {
                        id: $scope.services[service].service.id,
                        name: $scope.services[service].service.name,
                        url: $scope.services[service].service.url,
                        ressource: null
                    }
                    $http.post("/Dashboard/rest/services/delete", deletedService).then(function () {
                        swal("Supprimer!", "Service supprimer avec succées.", "success");
                        $scope.updateRessourcesAndServices();
                    });

                });
    }

    $scope.addNewRessource = function () {
        $scope.ressource = {};
        $scope.openModal('ressource', null)
    }

    $scope.addNewService = function (idRessource) {
        $scope.service = {};
        $scope.openModal('service', idRessource);
    }

    $scope.addService = function (service, res) {
        if (typeof service.id == 'undefined') {
            service.id = Date.now();
            let rid;
            let savedService = {
                name: service.name,
                url: service.suburl,
            }
            if (res === 'null')
                rid = $scope.currentRessource.id;
            else
                rid = res.id;
            savedService.ressource = rid;
            $http.post("/Dashboard/rest/services/save", savedService).then(function (response) {
                service.id = response.data;
                $scope.log = "\n service added with id = " + response.data + $scope.log;
            })
        } else {
            $scope.services[service.id].service = service;
            //////console.log($scope.services[service.id].service = service)
            let updatedService = {
                id: service.id,
                name: service.name,
                url: service.suburl,
                ressource: service.idRessource
            }
            $http.post("/Dashboard/rest/services/update", updatedService).then(function (response) {
                $scope.log = "\n service updated succefully." + $scope.log;
            })
            $scope.service = {};
            $scope.closeModal();
            $scope.updateRessourcesAndServices();
            return;
        }
        $scope.services[service.id] = {
            'service': service
        };
        var uid;
        if (res === 'null') {
            uid = $scope.currentRessource.id;
            $scope.services[service.id].service.url = $scope.currentRessource.url;
            $scope.services[service.id].service.idRessource = $scope.currentRessource.id;
            $scope.services[service.id].service.type = $scope.currentRessource.type;

        } else {
            uid = res.id;
            $scope.services[service.id].service.url = res.url;
            $scope.services[service.id].service.idRessource = res.id;
            $scope.services[service.id].service.type = res.type;
        }
        //console.log($scope.services[service.id].service.type)
        if ($scope.services[service.id].service.type == 'ws') {
            var url = $scope.services[service.id].service.url + $scope.services[service.id].service.suburl;
            $scope.services[service.id].service.attributes = [];
            $scope.ii = service.id;
            $http.get(url).then(function (response) {
                var s = merge($scope.flatten(response.data[0]), $scope.flatten(response.data[1]));
                for (var i = 0; i < response.data.length; i++) {
                    s = merge(s, $scope.flatten(response.data[i]));
                }
                for (var elem in s) {
                    $scope.services[$scope.ii].service.attributes.push(elem);
                }
            }, function (err) {
                //////////console.log('Fail to Load REST WS : ' + url);
            });
        } else {
            let db = {};
            ////console.log($scope.currentRessource)
            db = {
                server: $scope.currentRessource.url.split(':')[2].substring(1),
                username: $scope.currentRessource.login,
                password: $scope.currentRessource.password,
                databaseName: $scope.currentRessource.url.split(':')[4],
                driverType: $scope.currentRessource.url.split(':')[1],
                tableName: service.suburl,
                port: $scope.currentRessource.url.split(':')[3],
            }
            $scope.iii = service.id;
            $http.post('/Dashboard/rest/services/tables', db).then(function (response) {
                $scope.services[$scope.iii].service.attributes = response.data;
            });
        }
        //get the attribute from a REST

        $('#' + uid)
                .append($compile("<li id='li" + service.id + "'><a><span ng-click=drawService('" + service.id + "') >" +
                        service.name + "</span><i ng-click='deleteService(" + service.id + ")' class='fa fa-trash pull-right'></i><i ng-click='editService(" + service.id + ")' class='fa fa-pencil pull-right'></i></a></li>")($scope));
        //$scope.newState(ressource);
        $scope.service = {};
        $scope.closeModal();
    }

    $scope.addServiceFromDB = function (service) {
        $scope.serviceCurrentId = service.id;
        $scope.services[service.id] = {
            'service': service
        };
        $scope.services[service.id].service['suburl'] = $scope.services[service.id].service["url"];
        ////////console.log(service);
        var uid;
        ////////console.log($scope.ressources.length)
        for (var i = 0; i < $scope.ressources.length; i++) {
            //////////console.log($scope.ressources[i].ressource.id, service.ressource);
            if ($scope.ressources[i].ressource.id == service.ressource) {
                uid = $scope.ressources[i].ressource.id;
                $scope.services[service.id].service.url = $scope.ressources[i].ressource.url;
                $scope.services[service.id].service.idRessource = $scope.ressources[i].ressource.id;
                $scope.services[service.id].service.type = $scope.ressources[i].ressource.type;
                $scope.ress = $scope.ressources[i].ressource;
                break;
            }
        }
        if ($scope.services[service.id].service.type == 'ws') {
            //get the attribute from a REST
            var url = $scope.services[service.id].service.url + $scope.services[service.id].service.suburl;
            ////////console.log(url)
            $scope.services[service.id].service.attributes = [];
            $http.get(url).then(function (response) {

                var s = merge($scope.flatten(response.data[0]), $scope.flatten(response.data[1]));
                for (var i = 0; i < response.data.length; i++) {
                    s = merge(s, $scope.flatten(response.data[i]));
                }
                for (var elem in s) {
                    $scope.services[service.id].service.attributes.push(elem);
                }


            });
        } else if ($scope.services[service.id].service.type == "db") {
            console.log($scope.ress);
            let db = {};
            db = {
                server: $scope.ress.url.split(':')[2].substring(1),
                username: $scope.ress.login,
                password: $scope.ress.password,
                databaseName: $scope.ress.url.split(':')[4],
                driverType: $scope.ress.url.split(':')[1],
                tableName: service.suburl,
                port: $scope.ress.url.split(':')[3],
            }
            $scope.iii = service.id;
            console.log(db)
            $http.post('/Dashboard/rest/services/tables', db).then(function (response) {
                $scope.services[$scope.iii].service.attributes = response.data;
                console.log($scope.services[$scope.iii].service.attributes)
            });
        }
        $('#' + uid)
                .append($compile("<li id='li" + $scope.serviceCurrentId + "'><a><span ng-click=drawService('" + $scope.serviceCurrentId + "') >" +
                        service.name + "</span><i ng-click='deleteService(" + $scope.serviceCurrentId + ")' class='fa fa-trash pull-right'></i><i ng-click='editService(" + $scope.serviceCurrentId + ")' class='fa fa-pencil pull-right'></i></a></li>")($scope));


        $scope.service = {};

    }

    $scope.drawService = function (service) {
        var ressource = {};
        for (var i = 0; i < $scope.ressources.length; i++) {
            if ($scope.ressources[i].ressource.id == $scope.services[service].service.idRessource) {
                ressource = $scope.ressources[i].ressource;
            }
        }
        if (typeof $scope.services[service].service.attributes == 'undefined') {
            let db = {};
            db = {
                server: $scope.services[service].service.url.split(':')[2].substring(1),
                username: ressource.login,
                password: ressource.password,
                databaseName: $scope.services[service].service.url.split(':')[4],
                driverType: $scope.services[service].service.url.split(':')[1],
                tableName: $scope.services[service].service.suburl,
                port: $scope.services[service].service.url.split(':')[3],
            }
            $scope.iii = service;
            $http.post('/Dashboard/rest/services/tables', db).then(function (response) {
                $scope.services[$scope.iii].service.attributes = response.data;
                $scope.newState($scope.iii, 'default');
            });
        } else {
            $scope.newState(service, 'default');
        }


    };

    $scope.drawCondition = function (type) {
        if (typeof type === 'undefined')
            return;
        var id = Date.now();
        var condition;
        if (type === 'select') {
            condition = {
                'name': 'select',
                'attributes': [],
                'class': {}
            }
            $scope.conditions[id] = condition;
            $scope.newState(id, 'condition');
        } else if (type == 'where') {
            condition = {
                'name': 'where',
                'attributes': [],
                'class': {}
            }
            $scope.conditions[id] = condition;
            $scope.newState(id, 'where');
        } else if (type == 'join') {
            condition = {
                'name': 'join',
                'attributes': [],
                'class': {},
                'class2': {}
            }
            $scope.conditions[id] = condition;
            $scope.newState(id, 'join');
        } else if (type == 'where2') {
            condition = {
                'name': 'where2',
                'attributes': [],
                'class': {}
            }
            $scope.conditions[id] = condition;
            $scope.newState(id, 'where2');
        }

    }

    $scope.drawResult = function () {
        $scope.newState(0, 'condition');
    }

    $scope.drawStat = function (type) {
        var id = Date.now();
        var stat;
        if (type == 'tab') {
            stat = {
                'name': 'Tableau',
                'attributes': [],
                'class': {}
            }
            $scope.stat = stat;
            $scope.newState(id, 'stat');
        } else if (type == 'bar') {
            stat = {
                'name': 'Bar',
                'attributes': [],
                'class': {},
                'x': "",
                'y': ""
            }
            $scope.stat = stat;
            $scope.newState(id, 'bar');
        } else if (type == 'pie') {
            stat = {
                'name': 'Pie',
                'attributes': [],
                'class': {},
                'x': "",
                'y': ""
            }
            $scope.stat = stat;
            $scope.newState(id, 'pie');
        } else if (type == 'line') {
            stat = {
                'name': 'Line',
                'attributes': [],
                'class': {},
                'x': "",
                'y': ""
            }
            $scope.stat = stat;
            $scope.newState(id, 'line');
        }
        ////////console.log($scope.stat);
    }
    $scope.getBro = function (state) {
        //////console.log(state.id);
        if (state.name != 'join') {
            for (var i = 0; i < $scope.links.length; i++) {
                if ($scope.links[i].link.target.id == state.id) {
                    return $scope.links[i].link.source;
                }
            }
            return null;
        } else {
            r = [{}, {}];
            for (var i = 0; i < $scope.links.length; i++) {
//                ////console.log($scope.links[i].link.target.name)
                if ($scope.links[i].link.target.id == state.id) {
                    if (angular.equals(r[0], {})) {
                        r[0] = $scope.links[i].link.source;
                    } else {
                        r[1] = $scope.links[i].link.source;
                        return r;
                    }
                }
            }
            ////console.log(r)
        }
    }

    $scope.generateStatistique = function (qr) {
        if ((r = $scope.getBro(qr)) == null) {
//            ////console.log(qr)
            $scope.query.ressources.push({
                ressourceId: qr.id,
                ressource: qr.name
            });
            return $scope.query;
        } else {
            let r = $scope.getBro(qr);
            if (r.type == 's') {
                $scope.query.stat = r.name;
                if (r.name == 'Bar') {
                    $scope.barAttributes = [];
                    $scope.query.x = r.barx;
                    $scope.query.y = r.bary;
                } else if (r.name == 'Pie') {
                    $scope.pieAttributes = [];
                    $scope.query.pieLabels = r.pieLabels;
                    $scope.query.pieData = r.pieData;
                } else if (r.name == 'Line') {
                    $scope.lineAttributes = [];
                    $scope.query.lineLabels = r.lineLabels;
                    $scope.query.lineData = r.lineData;
                }
            } else if (r.type == 'o') {
                let a = [], b = [], c = [];
                if (r.name == 'where') {
                    a = r.attributesWhere;
                } else if (r.name == 'select') {
                    a = r.Sattributes;
                } else if (r.name == 'join') {
                    a = r.sLeftAttributes;
                    b = r.sRightAttributes;
                    c = r.op;
                } else if (r.name == 'where2') {
                    //console.log(r);
                    a = r.attributesWhere2;
                }
                $scope.query.operation.push({
                    'type': r.name,
                    'attributes': a,
                    'attributes2': b,
                    'operation': c,
                    'stat': r
                });
            }
            if (typeof r.length != 'undefined') {
                $scope.generateStatistique(r[1]);
                $scope.generateStatistique(r[0]);
            } else {
                $scope.generateStatistique(r);
            }
        }

    }

    $scope.getDataFromDataBase = function (ressource, servicce) {
        var deferred = $q.defer();
        let db = {
            server: ressource.url.split(':')[2].substring(1),
            username: ressource.login,
            password: ressource.password,
            databaseName: ressource.url.split(':')[4],
            driverType: ressource.url.split(':')[1],
            tableName: servicce.suburl,
            port: ressource.url.split(':')[3],
        };
        $http.post("/Dashboard/rest/services/tablesdata", db)
                .then(function (response) {
                    $scope.restable = response.data;
                    $http.post("/Dashboard/rest/services/tables", db).then(function (response) {
                        let data = [];
                        var j = 0;
                        for (var elem in $scope.restable) {
                            var cu = $scope.restable[elem];
                            let o = {};
                            for (var i = 0; i < $scope.restable[elem].length; i++) {
                                o[response.data[i]] = cu[i];
                            }
                            data.push(o);
                        }
                        ////console.log(data);
                        deferred.resolve(data);
                    });
                });

        return deferred.promise;
    }

    $scope.getDataFromWS = function (url) {
        var deferred = $q.defer();
        $http.get(url)
                .then(function (response) {
                    if (response.data == null) {
                        //////////console.log('Fail to Load REST WS : ' + url2);
                    }
                    let data = [];
                    for (var i = 0; i < response.data.length; i++) {
                        data[i] = $scope.flatten(response.data[i]);
                    }
                    $scope.log = "\n" + $filter('date')(Date.now(), 'hh:mm:ss') + " Load from " + url + " successfully" + $scope.log;
                    deferred.resolve(data);
                });

        return deferred.promise;
    };

    $scope.generateStat = function (showmodal) {
        //////console.log($scope.stateObjects)
        var t = {};
        for (var i = 0; i < $scope.stateObjects.length; i++) {
            if ($scope.stateObjects[i].id == 0) {
                t = $scope.stateObjects[i];
                break;
            }
        }

        $scope.query = {};
        $scope.query.operation = [];
        $scope.query.ressources = [];
        $scope.generateStatistique(t);
        let url1 = "", url2 = "";
        let type1 = "", type2 = "";
        let serv1 = {}, serv2 = {};

        if (typeof $scope.query.ressources[0] == 'undefined') {
            $scope.generateStatistique(t);
        }
        if (typeof $scope.query.ressources[0] == 'undefined') {
            swal("Erreur!!", "Un erreur s'est produit !!", "error");
        }

        for (var elem in $scope.services) {
            if ($scope.services[elem].service.id == $scope.query.ressources[0].ressourceId) {
                url1 = $scope.services[elem].service.url + $scope.services[elem].service.suburl;
                type1 = $scope.services[elem].service.type;
                $scope.attributes = $scope.services[elem].service.attributes;
                serv1 = $scope.services[elem].service;
                break;
            }
        }
        if (typeof $scope.query.ressources[1] != 'undefined') {
            for (var elem in $scope.services) {
                if ($scope.services[elem].service.id == $scope.query.ressources[1].ressourceId) {
                    url2 = $scope.services[elem].service.url + $scope.services[elem].service.suburl;
                    type2 = $scope.services[elem].service.type;
                    $scope.attributes = $scope.services[elem].service.attributes;
                    serv2 = $scope.services[elem].service;
                    break;
                }
            }
        }
        if (type1 == 'db') {
            var p = $scope.getDataFromDataBase($scope.getRessource(serv1.idRessource), serv1);
            if ($scope.query.ressources.length !== 1) {
                if (type2 == 'db') {
                    var p2 = $scope.getDataFromDataBase($scope.getRessource(serv2.idRessource), serv2);
                } else {
                    var p2 = $scope.getDataFromWS(url2);
                }
            }
        } else {
            var p = $scope.getDataFromWS(url1);
            if ($scope.query.ressources.length !== 1) {
                if (type2 == 'db') {
                    var p2 = $scope.getDataFromDataBase($scope.getRessource(serv2.idRessource), serv2);
                } else {
                    var p2 = $scope.getDataFromWS(url2);
                }
            }
        }

        p.then(function (data) {
            if ($scope.query.ressources.length > 1) {
                p2.then(function (data2) {
                    $scope.getResult(data, data2, showmodal);
                });
            } else {
                $scope.getResult(data, null, showmodal);
            }

        });
    }

    $scope.getAttributes = function (id) {
        for (var i = 0; i < $scope.stateObjects.length; i++) {
            if ($scope.stateObjects[i].id === id) {
                let x = [];
                for (var k = 0; k < $scope.stateObjects[i].attributes.length; k++)
                {
                    /*x.push($scope.stateObjects[i].name+ 
                     " : "+ 
                     $scope.stateObjects[i].attributes[k]);*/
                    x.push($scope.stateObjects[i].attributes[k]);
                }
                return x;
            }
        }
        return [];
    }

    $scope.lastRes = [];
    $scope.getResult = function (res, res2, showmodal) {
        $scope.statAttributes = [];
        let a = false;
        var joined = false;
        for (var i = $scope.query.operation.length - 1; i >= 0; i--) {
            // for (var i = 0; i < $scope.query.operation.length; i++) {
            if ($scope.query.operation[i].type === 'join') {

                a = true;
                joined = true;
                res = $.map(res, function (obj1) {
                    let obja = {};
                    for (e in obj1) {
                        obja[$scope.query.ressources[0].ressource + ": " + e] = obj1[e];
                    }
                    return obja;
                });
                if (res2 !== null)
                    res2 = res2.map(function (obj) {
                        let obj2 = {};
                        for (e in obj) {
                            obj2[$scope.query.ressources[1].ressource + ": " + e] = obj[e];
                        }
                        return obj2;
                    });
                if ($scope.query.ressources[0].ressource == "join") {
                    //console.log($scope.getStateById($scope.query.ressources[0].ressourceId))
                    //console.log($scope.getStateById($scope.query.ressources[0].ressourceId));
                    $scope.query.ressources[0] = $scope.getBro($scope.getStateById($scope.query.ressources[0].ressourceId))[0];
                    $scope.query.ressources[1] = $scope.getBro($scope.getStateById($scope.query.ressources[1].ressourceId))[1];
                }
                $scope.statAttributes = $scope.getAttributes($scope.query.ressources[0].ressourceId).concat($scope.getAttributes($scope.query.ressources[1].ressourceId))
                let array = $.map($scope.query.operation[i].attributes, function (value) {
                    return [$scope.query.ressources[0].ressource + ": " + value];
                });
                let array2 = $.map($scope.query.operation[i].attributes2, function (value) {
                    return [$scope.query.ressources[1].ressource + ": " + value];
                });
                let arrayop = $.map($scope.query.operation[i].operation, function (value) {
                    return [value];
                });
                res = join(res, res2, array, array2, arrayop);
            } else if ($scope.query.operation[i].type === 'select') {

                res = select(res, $scope.query.operation[i].attributes);
                var array = $.map($scope.query.operation[i].attributes, function (value) {
                    return [value];
                });
                if (joined) {
                    $scope.statAttributes = [];
                    for (var j = 0; j < array.length; j++) {
                        if (typeof array[j].op == 'undefined' || array[j].op == "")
                            $scope.statAttributes.push(array[j].attribute);
                        else
                            $scope.statAttributes.push(array[j].op + "." + array[j].attribute);
                    }
                }
                a = true;
            } else if ($scope.query.operation[i].type === 'where') {
                for (var j = 0; j < $scope.query.operation[i].attributes.length; j++) {
                    ////////console.log(res);
                    res = where(res,
                            $scope.query.operation[i].attributes[j].attribute,
                            $scope.query.operation[i].attributes[j].op,
                            $scope.query.operation[i].attributes[j].value);
                }
            } else if ($scope.query.operation[i].type === 'where2') {
                var attributesArray = $.map($scope.query.operation[i].attributes, function (value) {
                    return [value];
                });
                for (var j = 0; j < attributesArray.length; j++) {
                    res = where2(res,
                            attributesArray[j].attribute,
                            attributesArray[j].op,
                            attributesArray[j].attribute2);
                }

                //console.log(res)
            }

        }

        if (!a) {
            $scope.statAttributes = $scope.attributes;
        }
        if ($scope.query.stat == 'Tableau') {
            $scope.generateTable(res, showmodal);
        } else if ($scope.query.stat == 'Bar') {
            $scope.generateBar(res, $scope.query.x, $scope.query.y, showmodal);
        } else if ($scope.query.stat == 'Pie') {
            $scope.generatePie(res, $scope.query.pieLabels, $scope.query.pieData, showmodal);
        } else if ($scope.query.stat == 'Line') {
            $scope.generateLine(res, $scope.query.lineLabels, $scope.query.lineData, showmodal);
        }

    }

//    $scope.getResult = function (res, res2, showmodal) {
//        //////////console.log("get result");
//        $scope.statAttributes = [];
//        let a = false;
//        let joined = false;
//        //the join condition first
//        for (var i = 0; i < $scope.query.operation.length; i++) {
//            if ($scope.query.operation[i].type === 'join') {
//
//                a = true;
//                joined = true;
//                res = $.map(res, function (obj1) {
//                    let obja = {};
//                    for (e in obj1) {
//                        obja[$scope.query.ressources[0].ressource + ": " + e] = obj1[e];
//                    }
//                    return obja;
//                });
//                if (res2 !== null)
//                    res2 = res2.map(function (obj) {
//                        let obj2 = {};
//                        for (e in obj) {
//                            obj2[$scope.query.ressources[1].ressource + ": " + e] = obj[e];
//                        }
//                        return obj2;
//                    });
//                //////console.log("JOIN", $scope.query)
//                $scope.statAttributes = $scope.getAttributes($scope.query.ressources[0].ressourceId).concat($scope.getAttributes($scope.query.ressources[1].ressourceId))
//                let array = $.map($scope.query.operation[i].attributes, function (value) {
//                    return [$scope.query.ressources[0].ressource + ": " + value];
//                });
//                let array2 = $.map($scope.query.operation[i].attributes2, function (value) {
//                    return [$scope.query.ressources[1].ressource + ": " + value];
//                });
//                let arrayop = $.map($scope.query.operation[i].operation, function (value) {
//                    return [value];
//                });
//                res = join(res, res2, array, array2, arrayop);
//            }
//        }
//        // end join condition
//
//        //the where condition second
//        for (var i = 0; i < $scope.query.operation.length; i++) {
//            if ($scope.query.operation[i].type === 'where') {
//                //if(joined) ////////////console.log()
//                for (var j = 0; j < $scope.query.operation[i].attributes.length; j++) {
//                    ////////console.log(res);
//                    res = where(res,
//                            $scope.query.operation[i].attributes[j].attribute,
//                            $scope.query.operation[i].attributes[j].op,
//                            $scope.query.operation[i].attributes[j].value);
//                }
//            }
//        }// end where condition
//        //the select condition third
//        for (var i = 0; i < $scope.query.operation.length; i++) {
//            if ($scope.query.operation[i].type == 'select') {
//
//                res = select(res, $scope.query.operation[i].attributes);
//                ////console.log(res);
//                var array = $.map($scope.query.operation[i].attributes, function (value) {
//                    return [value];
//                });
//                if (joined) {
//                    $scope.statAttributes = [];
//                    for (var j = 0; j < array.length; j++) {
//                        $scope.statAttributes.push(array[j].attribute);
//                    }
//                }
//                a = true;
//            }
//        }// end select condition
//
//        if (!a) {
//            $scope.statAttributes = $scope.attributes;
//        }
//        $scope.query.res = res;
//        if ($scope.query.stat == 'Tableau') {
//            $scope.generateTable(res, showmodal);
//        } else if ($scope.query.stat == 'Bar') {
//            $scope.generateBar(res, $scope.query.x, $scope.query.y, showmodal);
//        } else if ($scope.query.stat == 'Pie') {
//            $scope.generatePie(res, $scope.query.pieLabels, $scope.query.pieData, showmodal);
//        } else if ($scope.query.stat == 'Line') {
//            $scope.generateLine(res, $scope.query.lineLabels, $scope.query.lineData, showmodal);
//        }
//
//        //})
//        ////////////console.log(res);
//    }
    $scope.generateLine = function (res, x, y, showmodal) {
        $scope.typeState = "line";
        $scope.labelsLine = [];
        $scope.dataLineInner = [];

        if (showmodal)
            $scope.openModal('line', 'null');
        for (var i = 0; i < res.length; i++) {
            for (var elem in res[i]) {
                if (elem == x) {
                    $scope.labelsLine.push(res[i][elem]);
                }
                if (elem == y) {
                    $scope.dataLineInner.push(res[i][elem]);
                }
            }
        }
        $scope.dataLine = [$scope.dataLineInner];
        $scope.lineHTML = "<canvas height='40%' id='line' class='chart chart-line' chart-data='dataLine' chart-labels='labelsLine' chart-options='optionsLine'></canvas>";
    }
    $scope.generatePie = function (res, labels, data, showmodal) {
        $scope.typeState = "pie";
        $scope.labelsPie = [];
        $scope.dataPie = [];
        if (showmodal)
            $scope.openModal('pie', 'null');
        for (var i = 0; i < res.length; i++) {
            for (var elem in res[i]) {
                if (elem == labels) {
                    $scope.labelsPie.push(res[i][elem]);
                }
                if (elem == data) {
                    $scope.dataPie.push(res[i][elem]);
                }
            }
        }
        $scope.legend = {};
        $scope.options = {
            legend: {
                labels: {
                    generateLabels: function (chart) {
                        $scope.legend = chart.generateLegend();
                    }

                }
            }}
        //////console.log($scope.legend)
        //$scope.pieHTML = "<div style='position : absolute; height : 100%; width : 100%;'><canvas class='chart chart-pie' chart-data='dataPie' chart-labels='labelsPie'></canvas></div>";
        $scope.pieHTML = "<canvas style='display : block' height='40%' class='chart chart-pie'  chart-data='dataPie' chart-labels='labelsPie' chart-options='options'></canvas>";
        //////console.log($scope.pieHTML)
    }

    $scope.pieLegend = function () {
        //console.log($scope.legend);
    }

    $scope.generateTable = function (res, showmodal) {
        //////////console.log("generate table")
        if (showmodal) {
            $scope.openModal('statistique', null);
        }
        if (!Array.isArray(res)) {
            let k = [];
            k[0] = res;
            $scope.statData = k;
        } else {
            $scope.statAttributes = [];
            for (let e in res[0]) {
                $scope.statAttributes.push(e);
            }
            $scope.statData = res;
        }
        if ($scope.statData.length === 0) {
            $scope.statData[0] = "vide";
            $scope.statAttributes[0] = "Pas de données";
        }
        ////console.log("#TABLE data : ", $scope.statData);
        $scope.tableHTML = $scope.createTableHtml();
    }

    $scope.generateBar = function (res, x, y, showmodal) {

        $scope.typeState = "bar";
        $scope.labelsBar = [];
        $scope.dataBar = [];
        if (showmodal)
            $scope.openModal('bar', 'null');
        for (var i = 0; i < res.length; i++) {
            //////////////console.log(res[i]);
            for (var elem in res[i]) {
                if (elem == x) {
                    $scope.labelsBar.push(res[i][elem]);
                }
                if (elem == y) {
                    $scope.dataBar.push(res[i][elem]);
                }
            }
        }
        if (showmodal)
            $scope.barHTML = "<canvas class='chart chart-bar' chart-data='dataBar' chart-labels='labelsBar'> </canvas>";
        else
            $scope.barHTML = "<canvas height='40%' class='chart chart-bar' chart-data='dataBar' chart-labels='labelsBar'> </canvas>";
    }
    $scope.modals = [];
    $scope.openModal = function (name, id) {
        if (id != 'null') {
            $scope.currentRessource = $scope.getRessource(id);
        }

        $scope.modalInstance = $uibModal.open({
            templateUrl: '/Dashboard/resources/partials/' + name + '.html',
            scope: $scope
        });
        $scope.modals.push($scope.modalInstance);
    };

    $scope.closeModal = function () {
        if (typeof $scope.modalInstance !== 'undefined' && $scope.modalInstance !== null) {
            $scope.modalInstance.close();
            $scope.modalInstance = null;
        }
    }

    $scope.removeIndex = function (index, object) {
        object.splice(index, 1);
    };
    $scope.isSourceState = function (id) {
        for (var i = 0; i < $scope.links.length; i++) {
            if ($scope.links[i].link.source.idd == id)
                return true;
        }
        return false;
    }

    $scope.isTargetState = function (id) {
        let k = [];
        for (var i = 0; i < $scope.links.length; i++) {
            if ($scope.links[i].link.target.idd == id)
                k.push(i);
        }
        return k;
    }
    /*$scope.$watchCollection('stateObjects',function(obj){
     //////////console.log(obj)
     })*/
    $scope.removeState = function (state) {
        if (!$scope.isSourceState(state.idd)) {
            let father = $scope.getBro(state);
            if (father !== null && typeof father !== 'undefined') {
                if (Array.isArray(father)) {
                    delete father[0].sources1[1].connections;
                    delete father[1].sources1[1].connections;
                } else {
                    delete father.sources1[1].connections;
                }
            }

            $scope.links.splice($scope.isTargetState(state.idd)[0], 1);
            if (state.name === 'join')
                $scope.links.splice($scope.isTargetState(state.idd)[1], 1);
            var index = $scope.stateObjects.indexOf(state);
            if (index !== -1) {
                $scope.stateObjects.splice(index, 1);
            }
        } else {
            sweetAlert("Oops...", "Cannot delete parent state!", "error");
        }
    };
    var getNextUUID = function () {
        $localStorage.lastUUID++;
        return $localStorage.lastUUID;
    }

    $scope.newState = function (state, type) {
        var id, name, attributes, typ, attributesv2, attributes2;
        var idd = Date.now();
        var posy = 500;
        if ($scope.stateObjects.length > 0 && $scope.stateObjects[$scope.stateObjects.length - 1].y > 100) {
            posy = $scope.stateObjects[$scope.stateObjects.length - 1].y;
        }
        if (state == 0) {
            $scope.stateObjects.push({
                'id': 0,
                'idd': idd,
                'name': "Résultat",
                'template': 'result',
                'attributes': attributes,
                'type': 'f',
                'sources1': [
                    {uuid: getNextUUID()},
                    {uuid: getNextUUID()},
                ],
                'targets': [
                    {uuid: getNextUUID()}
                ],
                'targets1': [
                    {uuid: getNextUUID()}
                ],
                'x': 500,
                'y': posy
            });
            $scope.resultState = $scope.stateObjects[$scope.stateObjects.length - 1];
            return;
        }
        if (type == 'default') {
            var error = false;
            //console.log(state);
            id = state;
            name = $scope.services[state].service.name;
            attributes = $scope.services[state].service.attributes;

            if (typeof $scope.services[state].service.attributes != 'undefined' && $scope.services[state].service.attributes.length > 0 && $scope.services[state].service.attributes[0] != "error") {

                attributesv2 = $scope.services[state].service.attributes.map(function (obj) {
                    return  $scope.services[state].service.name + ': ' + obj;
                });
            } else
                error = true;
            typ = 'r';
        } else if (type == 'condition' || type == 'where' || type == 'join' || type == 'where2') {
            id = state;
            name = $scope.conditions[state].name;
            attributes = [];
            typ = 'o';
        } else if (type == 'stat' || type == 'bar' || type == 'pie' || type == 'line') {
            id = state;
            name = $scope.stat.name;
            attributes = [];
            typ = 's';
        }
        var uuid1 = getNextUUID();
        var uuid2 = getNextUUID();
        var uuid3 = getNextUUID();
        var uuid4 = getNextUUID();
        var uuid7 = getNextUUID();
        var uuid8 = getNextUUID();
        let c = [];
        c[0] = 0;
        if (!error) {
            $scope.stateObjects.push({
                'id': id,
                'idd': idd,
                'name': name,
                'template': type,
                'attributes': attributes,
                'count': c,
                'type': typ,
                'Sattributes': [],
                'attributesv2': attributesv2,
                'attributesWhere': [],
                'sources1': [
                    {uuid: uuid1},
                    {uuid: uuid2},
                ],
                'targets': [
                    {uuid: uuid7},
                    {uuid: uuid8}
                ],
                'targets1': [
                    {uuid: uuid3},
                    {uuid: uuid4}
                ],
                'x': 500,
                'y': posy + 20
            });
        } else {
            console.log($scope.services[state]);
            if (typeof $scope.services[state].service.attributes != 'undefined' && $scope.services[state].service.attributes[0] == "error")
                $scope.log = "\n " + $scope.services[state].service.attributes[1] + " " + $scope.log;
            $.notify("Erreur service", "error");
            $scope.log = "\n Erreur service !!" + $scope.log;
        }
    };
    $scope.stateConnections = [];
    $scope.activeState = null;
    $scope.setActiveState = function (state) {
        $scope.activeState = state;
        //////////////console.log(state);
        return state;
    };
    $scope.copyAttribute = function (attribute) {
        var attr = [];
        if (typeof attribute[0] != 'object')
            return attribute;
        for (var i = 0; i < attribute.length; i++) {
            if (attribute[i].attribute != null){
                attr.push(attribute[i]);
                console.log(attribute[i])
            }
        }
        return attr;
    }

    $scope.getAttr = function (stat) {
        var array = [];
        var ind = "";
        for (var i = 0; i < stat.length; i++) {
            if (typeof stat[i].op != 'undefined' && stat[i].op != "")
            {
                ind = stat[i].op + "." + stat[i].attribute;
            } else {
                ind = stat[i].attribute;
            }
            array.push(ind);
        }
        return array;
    }

    $scope.getNextStat = function (id) {
        for (var i = 0; i < $scope.links.length; i++) {
            if ($scope.links[i].link.source.id == id) {
                return $scope.links[i].link.target;
            }
        }
        return null;
    }

    $scope.toAttributes = function (array) {
        var resultArray = [];
        for (var i = 0; i < array.length; i++) {
            resultArray.push({
                attribute: array[i]
            });
        }
        return resultArray;
    }

    $scope.selectAttributes = function (id) {
        var stat = $scope.getNextStat(id);
        if (stat != null && stat.name != "join") {
            if (stat.name == "select") {
                stat.attributes = $scope.copyAttribute(stat.Sattributes);
                //console.log(stat)
            }
            for (var i = 0; i < $scope.stateObjects.length; i++) {
                if ($scope.stateObjects[i].id == id) {
                    $scope.attributes = $scope.stateObjects[i].Sattributes;
                    if (stat !== null) {
                        stat.vattributes = $scope.getAttr($scope.stateObjects[i].Sattributes);
                        break;
                    }
                }
            }
        }
    }


    $scope.onConnection = function (instance, connection, targetUUID, sourceUUID) {


        var array = [];
        var c = 0;

        angular.forEach($scope.stateObjects, function (state) {
            if (typeof state.type === 'undefined') {
                array.push(c);
            }
            c++;
        });
        for (var j = 0; j < array.length; j++) {
            $scope.stateObjects.splice(array[j], 1);
        }

        angular.forEach($scope.stateObjects, function (state) {
            angular.forEach(state.sources1, function (source) {
                if (source.uuid == sourceUUID) {
                    source.connections = [];
                    source.connections[0] = {'uuid': targetUUID};
                    $scope.$apply();
                }
            });
        });

        $scope.links.push({'link': {
                'source': $scope.getState($rootScope.connections.source),
                'target': $scope.getState($rootScope.connections.target)
            }});
        ////console.log($scope.links);
        let source = $scope.getState($rootScope.connections.source);
        let target = $scope.getState($rootScope.connections.target);

        if (source.name == "select") {
            source.attributes = $scope.copyAttribute(source.Sattributes);
        }
        ////console.log(source, '-->', target);

        $('#b' + target.idd).removeClass('disabled');
        ////////console.log(source, target)
        if (target.type == 'o') {
            $scope.attributes = $scope.copyAttribute(source.attributes);
            target.attributes = $scope.copyAttribute(source.attributes);
            target.vattributes = $scope.copyAttribute(source.attributes);
            if (source.name == 'join') {
                let array = source.leftAttributes.map(function (el) {
                    return source.leftRessource + ": " + el;
                });
                let array2 = source.rightAttributes.map(function (el) {
                    return source.rightRessource + ": " + el;
                });
                target.vattributes = array.concat(array2);
                target.attributes = source.leftAttributes.concat(source.rightAttributes);
            }
            if (source.type == 'o' && source.name != 'join') {
                if (source.name == 'select') {
                    target.vattributes = $scope.getAttr(source.Sattributes);
                }

            }

            if (target.name == 'join') {
                if (source.name == 'select') {
                    if (target.targets[0].uuid == targetUUID) {
                        target.rightAttributes = source.attributes;
                        target.rightRessource = source.name;
                        target.rightRessourceId = source.id;
                    } else {
                        target.leftAttributes = source.attributes;
                        target.leftRessource = source.name;
                        target.leftRessourceId = source.id;
                    }
                } else {
                    if (target.targets[0].uuid == targetUUID) {
                        target.rightAttributes = source.attributes;
                        target.rightRessource = source.name;
                        target.rightRessourceId = source.id;
                    } else {
                        target.leftAttributes = source.attributes;
                        target.leftRessource = source.name;
                        target.leftRessourceId = source.id;
                    }
                }

            }


        }
        if (target.type == 's') {
            //console.log(source)
            if (source.name == "where") {
                target.attributes = source.vattributes;
            } else if (source.name == "select") {
                console.log(source.Sattributes)
                target.attributes = $scope.copyAttribute(source.Sattributes);
            } else
                target.attributes = $scope.copyAttribute(source.attributes);
        }
        let t = target;
        let f = false;
        let g = false;
        if (target.type == 's' && (target.name == 'Bar' || target.name == 'Pie' || target.name == 'Line')) {

            if (source.name === 'join') {
                let array = source.leftAttributes.map(function (el) {
                    var obj = {};
                    obj.attribute = source.leftRessource + ": " + el;
                    return obj;
                });
                let array2 = source.rightAttributes.map(function (el) {
                    var obj = {};
                    obj.attribute = source.rightRessource + ": " + el;
                    return obj;
                });
                target.barAttributes = array.concat(array2);
                target.pieAttributes = array.concat(array2);
                target.lineAttributes = array.concat(array2);
                //////////console.log(target.barAttributes)
                f = true;
                g = true;
            } else {
                while ((r = $scope.getBro(t)) != null) {
                    if (r.name === 'select') {
                        target.source = r;
                        f = true;
                        break;
                    }
                    t = r;
                }
            }
            if (!f) {
                if (source.name == 'where') {
                    target.source = source;
                    target.barAttributes = [];
                    target.pieAttributes = [];
                    target.lineAttributes = [];

                    for (var i = 0; i < target.source.vattributes.length; i++) {
                        if (target.source.vattributes[i] !== null)
                            target.barAttributes[i] = {
                                attribute: target.source.vattributes[i]
                            }
                        if (target.source.vattributes[i] !== null)
                            target.pieAttributes[i] = {
                                attribute: target.source.vattributes[i]
                            }
                        if (target.source.attributes[i] !== null)
                            target.lineAttributes[i] = {
                                attribute: target.source.vattributes[i]
                            }
                    }
                } else {
                    target.source = t;
                    target.barAttributes = [];
                    target.pieAttributes = [];
                    target.lineAttributes = [];

                    for (var i = 0; i < target.source.attributes.length; i++) {
                        if (target.source.attributes[i] !== null)
                            target.barAttributes[i] = {
                                attribute: target.source.attributes[i]
                            }
                        if (target.source.attributes[i] !== null)
                            target.pieAttributes[i] = {
                                attribute: target.source.attributes[i]
                            }
                        if (target.source.attributes[i] !== null)
                            target.lineAttributes[i] = {
                                attribute: target.source.attributes[i]
                            }
                    }
                }
            } else if (!g) {
                let attrs = $scope.toAttributes($scope.getAttr(target.source.Sattributes));
                target.barAttributes = attrs;
                target.pieAttributes = attrs;
                target.lineAttributes = attrs;
                //console.log(target)
            }
        }
    }

    $scope.getState = function (uuid) {
        var found = false;
        angular.forEach($scope.stateObjects, function (state) {
            for (var i = 0; i < state.sources1.length; i++) {
                if (state.sources1[i].uuid == uuid) {
                    found = state;
                    break;
                }
            }
            if (found != false)
                return found;
        });
        angular.forEach($scope.stateObjects, function (state) {
            for (var i = 0; i < state.targets.length; i++) {
                if (state.targets[i].uuid == uuid) {
                    found = state;
                    break;
                }
                if (state.targets1[i].uuid == uuid) {
                    found = state;
                    break;
                }
            }

            if (found != false)
                return found;
        });
        return found;
    }

    $scope.getStateU = function (uuid) {
        var st = {};
        angular.forEach($scope.stateObjects, function (state) {
            for (var i = 0; i < state.targets.length; i++) {
                if (state.targets[i].uuid == uuid) {
                    st = state;
                    break;
                }
                if (state.targets1[i].uuid == uuid) {
                    st = state;
                    break;
                }
            }
            if (angular.equals({}, st)) {
                return st;
            }
        });
        return st;
    }

    $scope.getStateById = function (id) {
        for (var i = 0; i < $scope.stateObjects.length; i++) {
            if ($scope.stateObjects[i].idd == id)
                return i;
        }

    }

    $scope.updateRessourcesAndServices = function () {
        $scope.ressources = [];
        $scope.services = [];

        $http.get("/Dashboard/rest/ressources").then(function (response) {
            for (var i in response.data) {
                $scope.ressources.push({
                    ressource: response.data[i]
                });
            }
            $http.get("/Dashboard/rest/services").then(function (response) {

                for (var i in response.data) {
                    $scope.addServiceFromDB(response.data[i]);
                }
            });
        });
    }

    $scope.foundStat = function (stat) {
        for (var i = 0; i < $scope.statistiques.length; i++) {
            if ($scope.statistiques[i].id == stat.id)
                return true;
        }
        return false;
    }

    $scope.visualizeStat = function (stat) {
        var data = angular.fromJson(stat.data)
        ////console.log(data);
        $scope.stateObjects = data.stateObjects;
        $scope.links = data.links;
        $scope.ressources = data.ressources;
        $scope.services = [];
        for (var i = 0; i < data.services.length; i++) {
            $scope.services[data.services[i].id] = data.services[i].data;
        }

        $scope.generateStat(true);

    }

    $scope.initStats = function (username) {
        $scope.statistiques = [];
        $scope.username = username.toLowerCase();
        $http.get("/Dashboard/rest/users/get/" + $scope.username).then(function (response) {
            $scope.fullUser = response.data;
            //console.log($scope.fullUser);
        });
        ////console.log($scope.username);
        $http.get("/Dashboard/rest/statistique/available/" + $scope.username).then(function (response) {
            ////console.log(response.data)
            for (var elem in response.data) {
                for (var i = 0; i < response.data[elem].length; i++) {
                    if (!$scope.foundStat(response.data[elem][i])) {
                        $scope.statistiques.push(response.data[elem][i])
                    }
                }

            }
        });
    }

    $scope.init = function (user, id) {
        $http.get("/Dashboard/rest/users/get/" + user.toLowerCase()).then(function (response) {
            $scope.fullUser = response.data;
        });
        $scope.id = id;
        $http.get("/Dashboard/rest/ressources").then(function (response) {
            $scope.ressources = [];
            for (var i in response.data) {
                $scope.ressources.push({
                    ressource: response.data[i]
                });
            }
            $http.get("/Dashboard/rest/services").then(function (response) {
                $scope.services = [];
                console.log(response.data);
                for (var i in response.data) {
                    $scope.addServiceFromDB(response.data[i]);
                }
            });
        });

        if (id != 0) {
            $scope.edit = true;
            $scope.idProject = id;
            $scope.statistique.id = id;
            $http.get("/Dashboard/rest/statistique/" + id).then(function (response) {

                $scope.statistique.name = response.data.name;
                $scope.statistique.description = response.data.description;
                $scope.dashboardName = response.data.name;
                let data = angular.fromJson(response.data.data);
                $scope.stateObjects = data.stateObjects;
                $scope.links = data.links;
                ////////console.log(data.services)
            });
        } else {
            $scope.dashboardName = 'New Statistique';
        }


    }

    $scope.index = [];
    $scope.removecond = function (id, index, type) {
        console.log(index, id);
        $('#' + type + 'div' + id + 'p' + index).remove();
    }

    $scope.addcond = function (type, id) {
        let stateId = $scope.getStateById(id);
        if (typeof $scope.index[id] === 'undefined') {
            $scope.index[id] = 0;
        }
        $scope.index[id]++;
        $scope.stateObjects[stateId].count.push($scope.stateObjects[stateId].count.length - 1);
    }

    $scope.disable = function (id) {
        if (typeof $scope.activeState.attributesWhere[id] !== 'undefined') {
            if ($scope.activeState.attributesWhere[id].op == 'null' || $scope.activeState.attributesWhere[id].op == 'not null') {
                $('#val' + id).val('');
                $('#val' + id).attr('disabled', true);
            } else {
                $('#val' + id).attr('disabled', false);
            }
        }
    }

    $scope.exporter = function () {
        $scope.statistique.createdBy = $scope.username;
        $scope.statistique.creationDate = Date.now();
        if ($scope.edit) {
            $http.post("/Dashboard/rest/statistique/edit", $scope.statistique).then(function (response) {
                //////////console.log(response.data);
                $scope.closeModal();
            });
        } else {
            $http.get("/Dashboard/rest/statistiques/" + $scope.statistique.name).then(function (response) {
                let data = response.data;
                if (data) {
                    swal("Erreur!", "Choisissez un autre nom !!", "error");
                } else {
                    $http.post("/Dashboard/rest/statistique", $scope.statistique).then(function (response) {
                        let newStatId = response.data;
                        let share = {
                            id_stat: newStatId,
                            users: $scope.users,
                            profiles: $scope.profiles
                        }

                        $http.post("/Dashboard/rest/statistique/partage", share);
                    });
                    $scope.closeModal();
                }
            });
        }
    }

    $scope.saveState = function (username) {
        $http.get("/Dashboard/rest/roles").then(function (response) {
            $scope.allProfiles = response.data;
        });
        $http.get("/Dashboard/rest/users").then(function (response2) {
            $scope.allUsers = response2.data;
        });
        $http.get("/Dashboard/rest/rolesanduser").then(function (response3) {
            $scope.usersAndRoles = response3.data;
        });
        let services = [];
        let i = 0;
        for (var elem in $scope.services) {
            services.push({
                id: elem,
                data: $scope.services[elem]
            });
        }
        //////////console.log(services);
        $scope.username = username;
        let data = {
            stateObjects: $scope.stateObjects,
            links: $scope.links,
            ressources: $scope.ressources,
            services: services
        }
        $scope.statistique.data = angular.toJson(data);
        $scope.modalInstance = $uibModal.open({
            templateUrl: '/Dashboard/resources/partials/saveState.html',
            scope: $scope
        });
    }

    $scope.importer = function () {
        $scope.modalInstance = $uibModal.open({
            templateUrl: '/Dashboard/resources/partials/importer.html',
            scope: $scope
        });
    }

    $scope.getStat = function (sid, rep) {
        $http.get("/Dashboard/rest/statistique/" + sid).then(function (response) {
            ////////////console.log(response.data);
            let sdata = angular.fromJson(response.data.data);
            $scope.stateObjects = sdata.stateObjects;
            $scope.links = sdata.links;
            $scope.ressources = sdata.ressources;
            let s = sdata.services;
            for (var i = 0; i < s.length; i++) {
                $scope.services[s[i].id] = s[i].data;
            }
            ////////////console.log($scope.stateObjects);
            $scope.generateStat(rep);
        });
    }

    $scope.new = 20;
//    $scope.editer = function () {
//        $scope.closeModal();
//        $http.get('resources/d.json').then(function (response) {
//            $scope.stateObjects = response.data.stateObjects;
//            $scope.links = response.data.links;
//            $scope.dashboardName = response.data.name;
//            $scope.new = 0;
//        });
//    }
    $scope.removedUsers = [];
    $scope.removeUser = function (u, type) {
        if (type == 'u') {
            $scope.allUsers.push(u);
            $scope.users.splice($scope.users.indexOf(u), 1);
        } else {
            $scope.allProfiles.push(u);
            $scope.profiles.splice($scope.profiles.indexOf(u), 1);
            for (var i = 0; i < $scope.removedUsers.length; i++) {

                if (u.roleName == $scope.removedUsers[i].role) {
                    if ($scope.containes($scope.allUsers, $scope.removedUsers[i], 'u') === -1)
                        $scope.allUsers.push($scope.removedUsers[i].user)
                }
            }
        }
    }

    $scope.containes = function (table, value, type) {
        for (i in table) {
            if (type == 'u') {
                if (table[i].userId == value.userId) {
                    return i;
                }
            } else if (type == 'p') {
                if (table[i].roleId == value.roleId) {
                    //////////console.log(i);
                    return i;
                }
            }
        }
        return -1;
    }

    $scope.users = [];
    $scope.profiles = [];
    $scope.user = "";
    $scope.profile = "";
    $scope.addUser = function (type, Robj) {
        let obj = JSON.parse(Robj);
        if (obj != null)
            if (type === 'u') {
                if ($scope.users.indexOf(obj) == -1) {
                    if ($scope.profiles.length == 0) {
                        $scope.users.push(obj);
                        //////////console.log($scope.containes($scope.allUsers, obj, 'u'));
                        $scope.allUsers.splice($scope.containes($scope.allUsers, obj, 'u'), 1);
                    } else {
                        let found = false
                        let u = $scope.usersAndRoles[obj.username];
                        for (var p in $scope.profiles) {
                            if (u.indexOf("ROLE_" + $scope.profiles[p].roleName) != -1) {
                                found = true;
                            }
                        }
                        if (!found) {
                            $scope.users.push(obj);
                            $scope.allUsers.splice($scope.containes($scope.allUsers, obj, 'u'), 1);
                        } else {
                            swal("Error", "Déja partagé avec cet utilisateur !", "error");
                        }
                    }

                }
            } else if ($scope.profiles.indexOf(obj) == -1) {
                //////////console.log(obj)
                $scope.profiles.push(obj);
                $scope.allProfiles.splice($scope.containes($scope.allProfiles, obj, 'p'), 1);
                for (i in $scope.users) {

                    if ($scope.usersAndRoles[$scope.users[i].username].indexOf(obj.roleName) != -1) {

                        $scope.removedUsers.push({
                            role: obj.roleName,
                            user: $scope.users[i]
                        });
                        $scope.users.splice(i, 1);
                    }
                }
                let indexes = [];
                for (var i in $scope.allUsers) {
                    ////////console.log($scope.allUsers[i], " : ", $scope.usersAndRoles[$scope.allUsers[i].username])
                    if ($scope.usersAndRoles[$scope.allUsers[i].username].indexOf(obj.roleName) !== -1) {

                        $scope.removedUsers.push({
                            role: obj.roleName,
                            user: $scope.allUsers[i]
                        })
                        indexes.push($scope.allUsers[i]);
                    }
                }
                //////////console.log($scope.removedUsers);
                for (var i = 0; i < indexes.length; i++) {
                    let j = 0;
                    while (j < $scope.allUsers.length) {
                        if ($scope.allUsers[j].userId == indexes[i].userId) {
                            $scope.allUsers.splice(j, 1);
                            break;
                        }
                        j++;
                    }
                }
            }
    }

    /** dashboard methods **/

    $scope.dashboardStatistiques = [];
    $scope.dashboard = [];
    $scope.initOrConsult = function (user, id) {
        $http.get("/Dashboard/rest/users/get/" + user.toLowerCase()).then(function (response) {
            $scope.fullUser = response.data;
            //console.log($scope.fullUser);
        });


        if (id == 0) {
            $scope.initDashboard(user);
        } else {
            $scope.consulterDashboard(id);
        }
    }

    $scope.initDashboard = function (user) {
        $http.get("/Dashboard/rest/roles").then(function (response) {
            $scope.allProfiles = response.data;
        });
        $http.get("/Dashboard/rest/users").then(function (response) {
            $scope.allUsers = response.data;
        });
        $http.get("/Dashboard/rest/rolesanduser").then(function (response) {
            $scope.usersAndRoles = response.data;
        });
        ////////////console.log(user);
        $scope.username = user;
        $scope.statistiques = {
            my: [],
            others: []
        }

        $http.get("/Dashboard/rest/statistique/available/" + $scope.username).then(function (response) {
            //console.log(response.data)
            for (var key in response.data) {
                if (key == $scope.username.toLowerCase()) {
                    $scope.statistiques.my = response.data[key];
                } else {
                    $scope.statistiques.others.push({
                        name: key,
                        data: response.data[key]
                    });
                }
            }
            ////////console.log($scope.statistiques);
        });
    }
    $scope.detailStat = function (detail) {
        swal("Détail", detail);
    }
    var myLoop = function () {
        $timeout(function () {
            $scope.liD = 'li' + $('#sortable').children().length;
            if ($scope.stats[$scope.idexLoop].id == 0) {
                //////console.log(angular.fromJson($scope.stats[$scope.idexLoop].text))
                let text = angular.fromJson($scope.stats[$scope.idexLoop].text);
                let li = $("<li id='li" + $('#sortable').children().length + "' class='panel panel-default' style='overflow : auto;position : relative'>" +
                        "<div class='panel-heading'>" + text.title + "</div></li>");
                $('#sortable').append(li);
                $('#' + $scope.liD).append(text.description);
            } else {
                $scope.stateObjects = [];
                $scope.links = [];
                $scope.services = [];
                let sdata = angular.fromJson($scope.stats[$scope.idexLoop].data);
                $scope.stateObjects = sdata.stateObjects;
                $scope.links = sdata.links;
                $scope.ressources = sdata.ressources;
                let s = sdata.services;
                for (var j = 0; j < s.length; j++) {
                    $scope.services[s[j].id] = s[j].data;
                }
                $scope.generateStat(false);
                let type = $scope.stateObjects[$scope.stateObjects.length - 2].name;
                if (type == 'join')
                    type = $scope.stateObjects[$scope.stateObjects.length - 3].name
                // insert the text description if it exist

                var title = $scope.stats[$scope.idexLoop].name;

                if (typeof $scope.dd != 'undefined' &&
                        typeof $scope.dd.statsDashboard != 'undefined' &&
                        typeof $scope.dd.statsDashboard[$scope.idexLoop].text != 'undefined' &&
                        $scope.dd.statsDashboard[$scope.idexLoop].text != 'null') {
                    title = $scope.dd.statsDashboard[$scope.idexLoop].text;
                }
                title = $scope.stats[$scope.idexLoop].name;
                let li = $("<li id='li" + $('#sortable').children().length + "' class='panel panel-default' style='overflow : auto;position : relative'>" +
                        "<div class='panel-heading'>" + title + "</div></li>");
                $('#sortable').append(li);

                $timeout(function () {
                    if (type == "Tableau") {

                        $('#' + $scope.liD).append($compile($scope.tableHTML)($scope));

                    } else if (type == "Bar") {
                        ////////console.log($scope.barHTML)

                        $('#' + $scope.liD).append($compile($scope.barHTML)($scope));

                    } else if (type == "Pie") {

                        ////////console.log($scope.pieHTML)
                        $('#' + $scope.liD).append($compile($scope.pieHTML)($scope));

                    } else if (type == "Line") {
                        ////////console.log($scope.lineHTML)
                        $('#' + $scope.liD).append($compile($scope.lineHTML)($scope));

                    }
                }, 850);
            }

            $scope.idexLoop++;
            if ($scope.idexLoop < $scope.stats.length) {
                myLoop();
            }
        }, 1000)
    }



    $scope.generateDataToStat = function (stat) {
        var deferred = $q.defer();

        $scope.stateObjects = [];
        $scope.links = [];
        $scope.services = [];
        let sdata = angular.fromJson(stat.data);
        $scope.stateObjects = sdata.stateObjects;
        $scope.links = sdata.links;
        $scope.ressources = sdata.ressources;
        let s = sdata.services;
        for (var j = 0; j < s.length; j++) {
            $scope.services[s[j].id] = s[j].data;
        }
        let obj = {
            'stat': stat
        }

        let type = $scope.stateObjects[$scope.stateObjects.length - 2].name;
        if (type == 'join')
            type = $scope.stateObjects[$scope.stateObjects.length - 3].name

        $scope.generateStat(false);

        deferred.resolve($scope.query)
        return deferred.promise;
    }

    $scope.executeStat = function (stat) {
        var deferred = $q.defer();

        var p = $scope.generateDataToStat(stat[0]);
        p.then(function (data) {
            ////console.log(data);
            if (data.stat == 'Tableau') {
                $scope.generateTable(data.res, false);
                ////console.log($scope.tableHTML)
            }
        });

        stat.reduce(function (prev, curr) {
            var p = $scope.generateDataToStat(curr);
            p.then(function (data) {
                ////console.log(data);
            });
        })
//        for (var i = 0; i < stat.length; i++) {
//            var p = $scope.generateDataToStat(stat[i]);
//            p.then(function (data) {
//                ////console.log($scope.query)
//            });
//        }
    }
    $scope.editDashboard = function (user, id) {
        //console.log(user)
        $http.get("/Dashboard/rest/users/get/" + user.toLowerCase()).then(function (response) {
            $scope.fullUser = response.data;
        });
        $scope.username = user;
        $scope.initDashboard($scope.username)
        //////console.log($scope.username)
        $http.get('/Dashboard/rest/dashboards/' + id).then(function (response) {
            ////console.log(response.data)
            $scope.dashboardData = response.data.dashboard;
            $scope.stats = response.data.stats;
            $scope.dd = response.data.statsDashboard;
            console.log($scope.dd)
            if (typeof response.data.text != 'undefined') {
                let text = angular.fromJson(response.data.text.text);
                ////console.log(text)
                let obj = {
                    id: 0,
                    name: text.title,
                    description: text.description,
                    type: 'text'
                }
                $scope.dashDesc.index = response.data.index;
                $scope.dashDesc.title = text.title;
                $scope.dashDesc.desc = text.description;
                $scope.stats.splice(response.data.index, 0, obj);
            }

            for (var i = 0; i < $scope.stats.length; i++) {
                $scope.addStatToDashboard($scope.stats[i], i);
            }
        })
    }

    $scope.consulterDashboard = function (id) {
        $http.get("/Dashboard/rest/dashboards/" + id).then(function (response) {
            if (response.data.stats.length > 0) {
                $scope.stats = response.data.stats;

                $scope.dashboard = response.data.dashboard;

                $scope.idexLoop = 0;
                if (typeof response.data.index != 'undefined') {
                    $scope.indexDesc = response.data.index;
                    $scope.descDash = {
                        id: 0,
                        text: response.data.text.text
                    }

                    $scope.stats.splice($scope.indexDesc, 0, $scope.descDash);
                }

                ////console.log($scope.stats)
                $scope.dd = response.data;
                myLoop();

            } else {
                swal("Vide !!", "Le dashboard ne contient aucune statistique !!", "warning");
            }
        });
    }

    $scope.preview = function (stat) {
        //////console.log(stat)
        $scope.getStat(stat, true);
    }

    $scope.deleteStatFromDashboard = function (index) {
        $scope.dashboard.splice(index, 1);
    }

    $scope.addStatToDashboard = function (stat, i) {
        if ($scope.dashboard.indexOf(stat) == -1) {
            if (typeof $scope.dd != 'undefined' && typeof $scope.dd[i] != 'undefined' && typeof $scope.dd[i].text != 'undefined' && $scope.dd[i].text != 'null')
                stat.title = $scope.dd[i].text;
            else
                stat.title = stat.name;
            $scope.dashboard.push(stat);
        } else {
            swal("Duplication !!", "Le dashboard contient ce statistique !!", "warning");
        }
    }

    $scope.addTitle = function (index) {
        $scope.currentStat = $scope.dashboard[index];
        $scope.openModal("statTitle", null);
    }
    $scope.titles = {};
    $scope.editTitle = function (id) {
        $scope.titles[id] = $scope.currentStat.title;

        for (var i = 0; i < $scope.dashboard.length; i++) {
            if ($scope.dashboard[i].id === id)
                $scope.dashboard[i].title = $scope.currentStat.title;
        }
        $scope.closeModal();
    }


    $scope.saveDashboard = function () {
        $scope.getStatsFromDash();
        //console.log($scope.titles)
        $scope.modalInstance = $uibModal.open({
            templateUrl: '/Dashboard/resources/partials/saveDashboard.html',
            scope: $scope
        });
    }
    $scope.editDashboardModal = function () {
        //////console.log($scope.dashboardData)
        $scope.modalInstance = $uibModal.open({
            templateUrl: '/Dashboard/resources/partials/editDashboard.html',
            scope: $scope
        });
    }
    $scope.dashDesc = {
        index: -1
    };
    $scope.showMsg = function () {

        $scope.openModal('dashMsg', null);
    }

    $scope.addDesc = function () {

        if ($scope.dashDesc.index == -1) {
            $scope.dashboard.push({
                id: 0,
                title: $scope.dashDesc.title,
                name: $scope.dashDesc.title,
                description: $scope.dashDesc.desc,
                type: 'text'
            });
            $scope.dashDesc.index = $scope.dashboard.length - 1;
        } else {
            $scope.dashboard[$scope.dashDesc.index] = {
                id: 0,
                name: $scope.dashDesc.title,
                description: $scope.dashDesc.desc,
                type: 'text'
            }
        }

        $scope.closeModal();
    }

    $scope.getStatsFromDash = function () {
        let array = [];
        $('#sortable').children().each(function () {
            array.push(this.id);
        });
        return array;
    }

    $scope.editerDashboard = function () {

        let dashboardObj = {
            id: $scope.dashboardData.id,
            name: $scope.dashboardData.name,
            description: $scope.dashboardData.description,
            dateCreation: Date.now(),
            createdBy: $scope.username
        };
        //////console.log(dashboardObj)
        $http.post("/Dashboard/rest/dashboard/edit", dashboardObj).then(function (response) {
            $scope.log = "\n Dashboard modifier avec succées" + $scope.log;
            let share = {
                id_dashboard: $scope.dashboardData.id,
                profiles: $scope.profiles,
                users: $scope.users
            };
            $http.post("/Dashboard/rest/dashboard/partage", share);
            $scope.dashboardStatistiques = [];

            var array = $scope.getStatsFromDash();
            var stats = [];
            for (var i = 0; i < array.length; i++) {
                if (array[i] == 0) {
                    let desc = {
                        id_dashboard: $scope.dashboardData.id,
                        title: $scope.dashDesc.title,
                        text: $scope.dashDesc.desc
                    };
                    $http.post("/Dashboard/rest/dashboard/description", desc);
                } else {
                    $scope.dashboardStatistiques.push(array[i] + "");
                    if (typeof $scope.titles[array[i]] != 'undefined')
                        stats.push($scope.titles[array[i]]);
                    else
                        stats.push("null");
                }
            }
            ////console.log($scope.dashboard);
            let dashboardStats = {
                id_dashboard: $scope.dashboardData.id,
                statistiques: $scope.dashboardStatistiques,
                stats: stats
            };
            $http.post("/Dashboard/rest/dashboard/saveStat", dashboardStats).then(function () {
                $scope.log = "\n Dashboard partager avec succées" + $scope.log;
            });

        });
        $scope.closeModal();
    };



    $scope.exporteDashboard = function () {

        let dashboardObj = {
            name: $scope.dashboard.name,
            description: $scope.dashboard.description,
            dateCreation: Date.now(),
            createdBy: $scope.username
        };
        $http.get("/Dashboard/rest/dashboard/exist/" + $scope.dashboard.name).then(function (response) {

            if (!response.data) {
                $http.post("/Dashboard/rest/dashboard/save", dashboardObj).then(function (response) {
                    $scope.log = "\n Dashboard enregistrer avec succées" + $scope.log;
                    let share = {
                        id_dashboard: response.data,
                        profiles: $scope.profiles,
                        users: $scope.users,
                    };
                    $http.post("/Dashboard/rest/dashboard/partage", share);
                    var array = $scope.getStatsFromDash();
                    var stats = [];
                    for (var i = 0; i < array.length; i++) {
                        if (array[i] == 0) {
                            let desc = {
                                id_dashboard: response.data,
                                title: $scope.dashDesc.title,
                                text: $scope.dashDesc.desc
                            }
                            $http.post("/Dashboard/rest/dashboard/description", desc);
                        } else {
                            $scope.dashboardStatistiques.push(array[i] + "");
                            if (typeof $scope.titles[array[i]] != 'undefined')
                                stats.push($scope.titles[array[i]]);
                            else
                                stats.push("null");
                        }
                    }
                    //console.log(stats);
                    let dashboardStats = {
                        id_dashboard: response.data,
                        statistiques: $scope.dashboardStatistiques,
                        stats: stats
                    };
                    $http.post("/Dashboard/rest/dashboard/saveStat", dashboardStats).then(function () {
                        $.notify("Dashboard partager avec succées", "success");
                        $scope.log = "\n Dashboard partager avec succées" + $scope.log;
                    });

                });
                $scope.closeModal();
            } else {
                swal("Duplication !!", "Un autre dashboard avec le même nom existe !", "error");
            }
        })

    }

    $scope.createTableHtml = function () {
        ////////console.log($scope.statData)
        var id = Date.now();
        let tableString = "<table id=" + id + " class='table table-striped table-bordered nowrap' cellspacing='0' width='100%'><thead><tr>";
        for (var i = 0; i < $scope.statAttributes.length; i++) {
            tableString += "<th>" + $scope.statAttributes[i] + "</th>";
        }
        tableString += "</thead><tbody>";
        for (var i = 0; i < $scope.statData.length; i++) {
            tableString += "<tr>";
            for (var j = 0; j < $scope.statAttributes.length; j++) {
                tableString += "<td>" + $scope.statData[i][$scope.statAttributes[j]] + "</td>";
            }
            tableString += "</tr>";
        }
        tableString += "</tbody></table>";
        setTimeout(function () {
            $('#' + id).DataTable({
                bPaginate: true,
                bLengthChange: false,
                bFilter: false,
                bInfo: false,
                iDisplayLength: 5,
                responsive: {
                    details: {
                        display: $.fn.dataTable.Responsive.display.modal({
                            header: function (row) {
                                var data = row.data();
                                return 'Details for ' + data[0] + ' ' + data[1];
                            }
                        }),
                        renderer: $.fn.dataTable.Responsive.renderer.tableAll({
                            tableClass: 'table'
                        })
                    }
                }
            });
        }, 1000)


        return tableString;
    }

});

