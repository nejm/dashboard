myApp.controller('FirstExampleController', function ($location, DTOptionsBuilder, DTColumnBuilder, $q, $timeout, $rootScope, $filter, $scope, $http, $localStorage, $uibModal, $compile) {

/////////////////////////
    $scope.deferred = null;
    $scope.dtOptions = [];
    $scope.dtColumns = [];
    $scope.pageSize = 10;
    $scope.currentPage = 0;
    $scope.states = [];
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
    $scope.aliases = [];
    $scope.stateObjects = [];


    $scope.options = [{
            name: 'Service Web',
            type: 'ws'
        }, {
            name: 'Base de données',
            type: 'db'
        }]
    $scope.order = {
        value: [],
        op: []
    };
    $rootScope.connections = [];
    $scope.getDataIndexed = function (start, max) {
        if (start < 0)
            return $scope.filtredData;
        var realMax = max;
        var r = [];
        if (max * start + max > $scope.statData.length)
            realMax = $scope.statData.length;
        for (var i = realMax * start; i < (start * realMax) + realMax; i++) {
            r.push($scope.statData[i]);
        }

        return r;
    }

    $rootScope.deleteLink = function (link) {
        var ind = -1;
        for (var i = 0; i < $scope.links.length; i++) {
            if ($scope.links[i].link.source.sources1[1].uuid == link.target) {
                ind = i;
                break;
            }

        }
        $scope.links.splice(ind, 1);
    }


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
                    recurse(cur[p], prop ? prop + ":" + p : p);
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
        ////console.log($scope.ressources)
        for (var i = 0; i < $scope.ressources.length; i++) {
            if ($scope.ressources[i].ressource.id == id)
            {
                return $scope.ressources[i].ressource;
            }
        }
        return {};
    }

    $scope.getRaw = function (c, o) {
        var data = {
            c: $scope.statAttributes,
            o: $scope.statData
        }
        sessionStorage.dt = angular.toJson(data);
        window.location = "/Dashboard/raw";
    }

    $scope.getDataFromSession = function () {
        $scope.dt = angular.fromJson(sessionStorage.dt);
    }

    $scope.addRessource = function (ressource, type) {
        ressource.type = type;
        var found = false;
        for (var i in $scope.ressources) {
            if ($scope.ressources[i].ressource.name == ressource.name) {
                $scope.ressources[i].ressource = ressource;
                found = true;
                break;
            }
        }
        if (!found) {
            if (type == 'db')
                ressource.url = ressource.serverType + ":" + ressource.address;
            if (ressource.driver != null)
                ressource.url += ":" + ressource.driver;
            var savedRessource = {};
            savedRessource = {
                name: ressource.name,
                url: ressource.url,
                login: ressource.login,
                password: ressource.password,
                type: ressource.type
            }
            $http.post("/Dashboard/rest/ressource/test", savedRessource).then(function (response) {
////console.log("test ressource", response.data)
            });
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
                    var nb = 0;
                    for (service in $scope.services) {
                        if ($scope.services[service].service.idRessource == ressource.id) {
                            var deletedService = {
                                id: $scope.services[service].service.id,
                                name: $scope.services[service].service.name,
                                url: $scope.services[service].service.url,
                                ressource: ressource.id
                            }
                            nb++;
                            ////////////console.log(deletedService)
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
                    var deletedService = {
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
            var rid;
            var savedService = {
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
            //////////console.log($scope.services[service.id].service = service)
            var updatedService = {
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
//////////////console.log('Fail to Load REST WS : ' + url);
            });
        } else {
            var db = {};
            ////console.log(service)
            db = {
                server: $scope.currentRessource.url.split(':')[1],
                username: $scope.currentRessource.login,
                password: $scope.currentRessource.password,
                databaseName: $scope.currentRessource.url.split(':')[3],
                //driverType: $scope.currentRessource.url.split(':')[1],
                Name: service.suburl,
                port: $scope.currentRessource.url.split(':')[2],
                type: $scope.currentRessource.url.split(':')[0]
            }
////console.log(db)
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
        ////////////console.log(service);
        var uid;
        ////////////console.log($scope.ressources.length)
        for (var i = 0; i < $scope.ressources.length; i++) {
//////////////console.log($scope.ressources[i].ressource.id, service.ressource);
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
            ////////////console.log(url)
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

            var db = {};
            db = {
                server: $scope.ress.url.split(':')[1],
                username: $scope.ress.login,
                password: $scope.ress.password,
                databaseName: $scope.ress.url.split(':')[3],
                //driverType: $scope.currentRessource.url.split(':')[1],
                tableName: service.suburl,
                port: $scope.ress.url.split(':')[2],
                type: $scope.ress.url.split(':')[0]
            }
            $scope.iii = service.id;
            $http.post('/Dashboard/rest/services/tables', db).then(function (response) {
                $scope.services[$scope.iii].service.attributes = response.data;
            });
        }
        $('#' + uid)
                .append($compile("<li id='li" + $scope.serviceCurrentId + "'><a><span ng-click=drawService('" + $scope.serviceCurrentId + "') >" +
                        service.name + "</span><i ng-click='deleteService(" + $scope.serviceCurrentId + ")' class='fa fa-trash pull-right'></i><i ng-click='editService(" + $scope.serviceCurrentId + ")' class='fa fa-pencil pull-right'></i></a></li>")($scope));
        $scope.service = {};
    }
    $scope.drawnServices = {};
    $scope.drawService = function (service) {
        var ressource = {};
        for (var i = 0; i < $scope.ressources.length; i++) {
            if ($scope.ressources[i].ressource.id == $scope.services[service].service.idRessource) {
                ressource = $scope.ressources[i].ressource;
            }
        }
        if (ressource.type == 'db') {
            var db = {};
            db = {
                server: $scope.services[service].service.url.split(':')[1],
                username: ressource.login,
                password: ressource.password,
                databaseName: $scope.services[service].service.url.split(':')[3],
                //driverType: $scope.currentRessource.url.split(':')[1],
                tableName: $scope.services[service].service.suburl,
                port: $scope.services[service].service.url.split(':')[2],
                type: $scope.services[service].service.url.split(':')[0]
            }
            $scope.iii = service;
            $http.post('/Dashboard/rest/services/tables', db).then(function (response) {
                $scope.services[$scope.iii].service.attributesL = response.data.length;
                $scope.services[$scope.iii].service.attributes = response.data;
                $scope.newState($scope.iii, 'default');
            });
        } else {
            $scope.services[service].service.attributesL = $scope.services[service].service.attributes.length;
            ////console.log('rest',service)
            $scope.newState(service, 'default');
        }
        $http.get("/Dashboard/rest/attributs/" + service).then(function (response) {
            for (var i = 0; i < response.data.length; i++) {
                $scope.aliases[response.data[i].original] = response.data[i].alias;
            }

        });
    };
    $scope.expand = function (s) {
        var h = angular.element("#s" + s.idd)[0].offsetHeight;
        if (typeof s.realHeight == 'undefined' || s.realHeight == 0) {
            s.realHeight = h;
        }
        //console.log(s.realHeight, h, s.realHeight == h);
        if (s.realHeight == h) {
            $("#s" + s.idd).height(10);
        } else if (h < s.realHeight) {
            $("#s" + s.idd).height(s.realHeight);
        }

    }

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
        } else if (type == 'expression') {
            condition = {
                'name': 'expression',
                'attributes': [],
                'class': {}
            }
            $scope.conditions[id] = condition;
            $scope.newState(id, 'expression');
        } else if (type == 'union') {
            condition = {
                name: 'union',
                attributes: [],
                'class': {}
            }
            $scope.conditions[id] = condition;
            $scope.newState(id, 'union');
        } else if (type == 'order') {
            condition = {
                name: 'order',
                attributes: [],
                'class': {}
            }
            $scope.conditions[id] = condition;
            $scope.newState(id, 'order');
        } else if (type == 'alias') {
            condition = {
                name: 'alias',
                attributes: [],
                'class': {}
            }
            $scope.conditions[id] = condition;
            $scope.newState(id, 'alias');
        }

    }

    $scope.drawResult = function () {
        $scope.newState(0, 'condition');
    }

    $scope.drawStat = function (type, map) {
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
        } else if (type == 'map') {
            stat = {
                'name': 'Map',
                'attributes': [],
                'class': {},
                'x': "",
                'y': ""
            }
            $scope.typeMap = map;
            $scope.stat = stat;
            $scope.newState(id, 'map');
        }
////////////console.log($scope.stat);
    }
    $scope.getBro = function (state) {
        //console.log("ssssssssss", state);
        var st = $scope.stateObjects[$scope.getStateById(state.idd)];
        if (typeof st == 'undefined')
            return null;
        if (st.name == 'join' || st.name == 'union') {
            var r = [{}, {}];
            for (var i = 0; i < $scope.links.length; i++) {
//                ////////console.log($scope.links[i].link.target.name)
                if ($scope.links[i].link.target.id == state.id) {
                    if (angular.equals(r[0], {})) {
                        r[0] = $scope.links[i].link.source;
                    } else {
                        r[1] = $scope.links[i].link.source;
                        //console.log("77777777777777777", state, r)
                        return r;
                    }
                }
            }
        } else {
            //console.log("aaaaaaaaaaaaa", st)
            for (var i = 0; i < $scope.links.length; i++) {
                if ($scope.links[i].link.target.id == state.id) {
                    //console.log("st.name", $scope.links[i].link.source)
                    //console.log("88888888888888888", $scope.links[i].link.source, state)
                    return $scope.links[i].link.source;
                }
            }
            return null;
        }
    }

    $scope.generateStatistique = function (qr) {
        $scope.last = qr;
        if ((r = $scope.getBro(qr)) == null) {
            $scope.query.ressources.push({
                ressourceId: qr.id,
                ressource: qr.name
            });
            return $scope.query;
        } else {

            var r = $scope.getBro(qr);
            //console.log("array", r, typeof r.length)
            if (typeof r.length != 'undefined') {
                for (var k = 0; k < 2; k++) {
                    e = {};
                    var f = r[k];
                    var a = [], b = [], c = [], d = [];
                    var res = [];
                    if (f.name == 'where') {
                        a = $scope.stateObjects[$scope.getStateById(f.idd)].attributesWhere;
                    } else if (f.name == 'select') {
                        a = $scope.stateObjects[$scope.getStateById(f.idd)].Sattributes;
                        //console.log("atttttt", a)
                    } else if (f.name == 'join') {
                        a = $scope.stateObjects[$scope.getStateById(f.idd)].sLeftAttributes;
                        b = $scope.stateObjects[$scope.getStateById(f.idd)].sRightAttributes;
                        c = $scope.stateObjects[$scope.getStateById(f.idd)].op;
                    } else if (f.name == 'where2') {
                        a = $scope.stateObjects[$scope.getStateById(f.idd)].attributesWhere2;
                    } else if (f.name == 'expression') {
                        if (typeof $scope.query.expressions == 'undefined')
                            $scope.query.expressions = [];
                        $scope.query.expression = $scope.stateObjects[$scope.getStateById(f.idd)].expression;
                        $scope.query.expressionName = $scope.stateObjects[$scope.getStateById(f.idd)].expressionName;
                        $scope.query.expressions.push({
                            expression: $scope.stateObjects[$scope.getStateById(f.idd)].expression,
                            name: $scope.stateObjects[$scope.getStateById(f.idd)].expressionName
                        });
                        e = {
                            expression: $scope.stateObjects[$scope.getStateById(f.idd)].expression,
                            name: $scope.stateObjects[$scope.getStateById(f.idd)].expressionName
                        }

                    } else if (f.name == 'union') {
                        a = $scope.stateObjects[$scope.getStateById(f.idd)].sLeftAttributes;
                        b = $scope.stateObjects[$scope.getStateById(f.idd)].sRightAttributes;
                        d = $scope.stateObjects[$scope.getStateById(f.idd)].rightAttributes.concat($scope.stateObjects[$scope.getStateById(f.idd)].leftAttributes);
                    }
                    if ($scope.getBro(r[k]) != null && typeof $scope.getBro(r[k]).length != 'undefined') {
                        var x = $scope.getBro(f);
                    } else {
                        x = [$scope.getBro(f), null];
                    }

                    $scope.query.Aoperation.push({
                        'type': f.name,
                        'attributes': a,
                        'attributes2': b,
                        'operation': c,
                        'stat': f,
                        'expression': e,
                        'union': d,
                        classes: x,
                        optype: f.type,
                        id: f.idd,
                        idd: Date.now()
                    });
                }
                $scope.generateStatistique(r[0]);
                $scope.generateStatistique(r[1]);
            } else {
                var a = [], b = [], c = [], d = [];
                var res = [];
                var e = {};
                if ($scope.getBro(r) != null && typeof $scope.getBro(r).length != 'undefined') {
                    var x = $scope.getBro(r);
                } else {
                    x = [$scope.getBro(r), null];
                }

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
                    } else if (r.name == 'Map') {
                        $scope.mapAttributes = [];
                        $scope.query.mapPays = r.mapPays;
                        $scope.query.mapData = r.mapData;
                        $scope.query.codeISO = r.codeISO;
                    }
                } else if (r.type == 'o') {
                    //console.log('oooooooooooooo', r);
                    if (r.name == 'where') {
                        a = $scope.stateObjects[$scope.getStateById(r.idd)].attributesWhere;
                    } else if (r.name == 'select') {
                        a = $scope.stateObjects[$scope.getStateById(r.idd)].Sattributes;
                        //console.log("atttttt", a)
                    } else if (r.name == 'join') {
                        a = $scope.stateObjects[$scope.getStateById(r.idd)].sLeftAttributes;
                        b = $scope.stateObjects[$scope.getStateById(r.idd)].sRightAttributes;
                        c = $scope.stateObjects[$scope.getStateById(r.idd)].op;
                    } else if (r.name == 'where2') {
                        a = $scope.stateObjects[$scope.getStateById(r.idd)].attributesWhere2;
                    } else if (r.name == 'expression') {
                        if (typeof $scope.query.expressions == 'undefined')
                            $scope.query.expressions = [];
                        $scope.query.expression = $scope.stateObjects[$scope.getStateById(r.idd)].expression;
                        $scope.query.expressionName = $scope.stateObjects[$scope.getStateById(r.idd)].expressionName;
                        $scope.query.expressions.push({
                            expression: $scope.stateObjects[$scope.getStateById(r.idd)].expression,
                            name: $scope.stateObjects[$scope.getStateById(r.idd)].expressionName
                        });
                        e = {
                            expression: $scope.stateObjects[$scope.getStateById(r.idd)].expression,
                            name: $scope.stateObjects[$scope.getStateById(r.idd)].expressionName
                        }

                    } else if (r.name == 'union') {
                        a = $scope.stateObjects[$scope.getStateById(r.idd)].sLeftAttributes;
                        b = $scope.stateObjects[$scope.getStateById(r.idd)].sRightAttributes;
                        d = $scope.stateObjects[$scope.getStateById(r.idd)].rightAttributes.concat($scope.stateObjects[$scope.getStateById(r.idd)].leftAttributes);
                    }


                }

                $scope.query.operation.push({
                    'type': r.name,
                    'attributes': a,
                    'attributes2': b,
                    'operation': c,
                    'stat': r,
                    'expression': e,
                    'union': d
                });
                $scope.query.Aoperation.push({
                    'type': r.name,
                    'attributes': a,
                    'attributes2': b,
                    'operation': c,
                    'stat': r,
                    'expression': e,
                    'union': d,
                    classes: x,
                    optype: r.type,
                    id: r.idd,
                    idd: Date.now()
                });
                $scope.generateStatistique(r);
            }

        }
    }


    $scope.getDataFromDataBase = function (ressource, service) {
        var deferred = $q.defer();
        var rr = ressource;
        var ss = service;
        if (ressource == null) {
            ss = service;
            rr = $scope.getRessource(ss.ressource);
        }
        var db = {
            type: rr.url.split(':')[0],
            server: rr.url.split(':')[1],
            username: rr.login,
            password: rr.password,
            databaseName: rr.url.split(':')[3],
            driverType: "thin",
            tableName: ss.suburl,
            port: rr.url.split(':')[2],
        };
        $http.post("/Dashboard/rest/services/tablesdata", db)
                .then(function (response) {
                    var restable = response.data;
                    //console.log("db 0", response.data);
                    $http.post("/Dashboard/rest/services/tables", db).then(function (response) {
                        var data = [];
                        var j = 0;
                        for (var elem in restable) {
                            var cu = restable[elem];
                            var o = {};
                            for (var i = 0; i < restable[elem].length; i++) {
                                o[response.data[i]] = cu[i];
                            }
                            data.push(o);
                        }
                        //console.log("db", data);
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
                        //////////////console.log('Fail to Load REST WS : ' + url2);
                    }
                    var data = [];
                    for (var i = 0; i < response.data.length; i++) {
                        data[i] = $scope.flatten(response.data[i]);
                    }
                    $scope.log = "\n" + $filter('date')(Date.now(), 'hh:mm:ss') + " Load from " + url + " successfully" + $scope.log;
                    deferred.resolve(data);
                });
        return deferred.promise;
    };
    $scope.generateS = function (showmodal) {
        var t = {};
        $scope.query = {};
        $scope.query.operation = [];
        $scope.query.Aoperation = [];
        $scope.query.ressources = [];
        $scope.query.expressions = [];
        $scope.query.stat = {};
        for (var i = 0; i < $scope.stateObjects.length; i++) {
            if ($scope.stateObjects[i].id == 0) {
                t = $scope.stateObjects[i];
                break;
            }
        }
        $scope.generateStatistique(t);
        //* begin the nonesence
        var res = [];
        var co = {};
        for (var i = $scope.query.Aoperation.length - 1; i >= 0; i--) {
            co = $scope.query.Aoperation[i];
            if (co.classes[0] != null) {
                $scope.getDataSer(co.classes[0], co.classes[1]).then(function (data) {
                    //console.log("vvv", data);
                })
            }
        }

        if ($scope.query.stat == 'Tableau') {
            $scope.generateTable(res, showmodal);
        } else if ($scope.query.stat == 'Bar') {
            $scope.generateBar(res, $scope.query.x, $scope.query.y, showmodal);
        } else if ($scope.query.stat == 'Pie') {
            $scope.generatePie(res, $scope.query.pieLabels, $scope.query.pieData, showmodal);
        } else if ($scope.query.stat == 'Line') {
            $scope.generateLine(res, $scope.query.lineLabels, $scope.query.lineData, showmodal);
        } else if ($scope.query.stat == 'Map') {
            $scope.generateMap(res, $scope.query.codeISO, $scope.query.mapPays, $scope.query.mapData, showmodal);
        }
    }

    $scope.getDataSer = function (ser, ser2) {
        var deferred = $q.defer();
        //console.log("nnnnnnnnnn", ser);
        var url1 = "", url2 = "";
        var type1 = "", type2 = "";
        var serv1 = {}, serv2 = {};
        for (var elem in $scope.services) {
            if ($scope.services[elem].service.id == ser.id) {
                url1 = $scope.services[elem].service.url + $scope.services[elem].service.suburl;
                type1 = $scope.services[elem].service.type;
                $scope.attributes = $scope.services[elem].service.attributes;
                serv1 = $scope.services[elem].service;
                break;
            }
        }

        if (ser2 != null) {
            for (var elem in $scope.services) {
                if ($scope.services[elem].service.id == ser2.id) {
                    url2 = $scope.services[elem].service.url + $scope.services[elem].service.suburl;
                    type2 = $scope.services[elem].service.type;
                    $scope.attributes = $scope.services[elem].service.attributes;
                    serv2 = $scope.services[elem].service;
                    break;
                }
            }
        }

        //console.log("url 1 ", url1);
        if (type1 == 'db') {

            var p = $scope.getDataFromDataBase($scope.getRessource(serv1.idRessource), serv1);
            if (ser2 !== null) {
                if (type2 == 'db') {
                    var p2 = $scope.getDataFromDataBase($scope.getRessource(serv2.idRessource), serv2);
                } else {
                    var p2 = $scope.getDataFromWS(url2);
                }
            }
        } else {
            var p = $scope.getDataFromWS(url1);
            if (ser2 !== null) {
                if (type2 == 'db') {
                    var p2 = $scope.getDataFromDataBase($scope.getRessource(serv2.idRessource), serv2);
                } else {
                    var p2 = $scope.getDataFromWS(url2);
                }
            }
        }
        //console.log("version  2 promess", p);
        p.then(function (data) {
            var res = [data];
            //console.log("version 2", data);
            if (ser2 != null) {
                p2.then(function (data2) {
                    res.push(data2);
                    deferred.resolve(res);
                });
            } else {
                ////console.log("version2",data)
                deferred.resolve(res);
            }

        });
        return deferred.promise;
    }


    $scope.generateStat = function (showmodal) {
        var t = {};
        $scope.query = {};
        $scope.query.operation = [];
        $scope.query.Aoperation = [];
        $scope.query.ressources = [];
        $scope.query.expressions = [];
        $scope.query.stat = {};
        for (var i = 0; i < $scope.stateObjects.length; i++) {
            if ($scope.stateObjects[i].id == 0) {
                t = $scope.stateObjects[i];
                break;
            }
        }

////console.log("generating", $scope.links);
        $scope.generateStatistique(t);
        var ress = [];
        for (var i = 0; i < $scope.query.Aoperation.length; i++) {

            if ($scope.query.Aoperation[i].optype == 'r') {
                ress.push($scope.query.Aoperation[i]);
            }
        }
        $scope.dataPromess(ress, 0);
        return $scope.statData;
    }

    $scope.generateStatPromess = function (showmodal) {
        var t = {};
        $scope.query = {};
        $scope.query.operation = [];
        $scope.query.Aoperation = [];
        $scope.query.ressources = [];
        $scope.query.expressions = [];
        $scope.query.stat = {};
        for (var i = 0; i < $scope.stateObjects.length; i++) {
            if ($scope.stateObjects[i].id == 0) {
                t = $scope.stateObjects[i];
                break;
            }
        }

////console.log("generating", $scope.links);
        $scope.generateStatistique(t);
        var ress = [];
        for (var i = 0; i < $scope.query.Aoperation.length; i++) {

            if ($scope.query.Aoperation[i].optype == 'r') {
                ress.push($scope.query.Aoperation[i]);
            }
        }
        $scope.deferred = $q.defer();
        $scope.dataPromess(ress, 0);
        //console.log("deffederref", $scope.deferred)
        return $scope.deferred.promise;
    }

    $scope.dataPromess = function (datar, index) {
        if (index >= datar.length) {
            $scope.getResult(null, null, true);
            if ($scope.deferred != null) {
                $scope.deferred.resolve(null);
            }
        } else {
            //console.log("ressssss rrr", datar.length, index);
            var p = $scope.getDataRessource(datar[index].stat);
            p.then(function (data) {
                //console.log("the result of ", datar[index], data)
                $scope.results['s' + datar[index].id] = data;
                $scope.dataPromess(datar, index + 1);
            });
        }

    }

    $scope.getAttributes = function (id) {
        for (var i = 0; i < $scope.stateObjects.length; i++) {
            if ($scope.stateObjects[i].id === id) {
                var x = [];
                for (var k = 0; k < $scope.stateObjects[i].attributes.length; k++)
                {
                    x.push($scope.stateObjects[i].attributes[k]);
                }
                return x;
            }
        }
        return [];
    }


    $scope.getDataRessource = function (r) {
        var deferred = $q.defer();
        var service = $scope.services[r.id];
        var dd;
        if (typeof service == 'undefined')
            return null;
        service = service.service;
        //console.log("fzbifzei", service.type)
        if (service.type == 'db') {
            var p = $scope.getDataFromDataBase(null, service);
            p.then(function (data) {
                dd = data;
                //console.log("ggggggggggggggggggggg", data);
                deferred.resolve(data);
            });
            return deferred.promise;
        } else {
            var p2 = $scope.getDataFromWS(service.url + service.suburl);
            p2.then(function (data) {
                dd = data;
                //console.log("ggggggggggggggggggggg", data);
                deferred.resolve(data);
            });
        }

        return deferred.promise;
    }

    $scope.executeQuery = function (reslt, reslt2, op) {
        var a = false;
        var joined = false;
        var res = [];
        var res2 = [];
        if (op.type === 'join') {
            a = true;
            joined = true;
            res = $.map(reslt, function (obj1) {
                var obja = {};
                for (var e in obj1) {
                    obja[op.classes[0].name + ": " + e] = obj1[e];
                }
                return obja;
            });
            if (reslt2 !== null)
                res2 = reslt2.map(function (obj) {
                    var obj2 = {};
                    for (var e in obj) {
                        obj2[op.classes[1].name + ": " + e] = obj[e];
                    }
                    return obj2;
                });
            $scope.statAttributes = $scope.getAttributes(op.classes[0].id).concat($scope.getAttributes(op.classes[1].id))
            //console.log("state", $scope.statAttributes);
            var array = $.map(op.attributes2, function (value) {
                return [op.classes[0].name + ": " + value];
            });
            var array2 = $.map(op.attributes, function (value) {
                return [op.classes[1].name + ": " + value];
            });
            var arrayop = $.map(op.operation, function (value) {
                return [value];
            });
            //console.log("query oppp", array, array2);
            res = join(reslt, reslt2, array, array2, arrayop);
        } else if (op.type === 'select') {

            res = select(reslt, op.attributes);
            var array = $.map(op.attributes, function (value) {
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
        } else if (op.type === 'where') {

            for (var j = 0; j < op.attributes.length; j++) {
                if (j > 0 && res.length > 0)
                    reslt = res;
                if (!op.attributes[j].deleted)
                    res = where(reslt,
                            op.attributes[j].attribute,
                            op.attributes[j].op,
                            op.attributes[j].value);

            }
            //console.log("after where", res)
        } else if (op.type === 'where2') {
            var attributesArray = $.map(op.attributes, function (value) {
                return [value];
            });
            for (var j = 0; j < attributesArray.length; j++) {
                res = where2(reslt,
                        attributesArray[j].attribute,
                        attributesArray[j].op,
                        attributesArray[j].attribute2);
            }
        } else if (op.type === 'union') {
            var prefix1 = "", prefix2 = "";
            a = true;
            //console.log("before union", reslt)
            reslt = $.map(reslt, function (obj1) {
                var obja = {};
                var e2;
                for (var e in obj1) {
                    e2 = e;
                    if (e.indexOf(':') != -1) {
                        e2 = e.substr(e.indexOf(':') + 2);
                        prefix1 = e.substring(0, e.indexOf(':'));
                    }

                    obja[op.classes[0].name + ": " + e2] = obj1[e];
                }
                return obja;
            });
            if (reslt2 !== null) {

                reslt2 = reslt2.map(function (obj) {
                    var obj2 = {};
                    var e2;
                    for (var e in obj) {
                        e2 = e;
                        if (e.indexOf(':') != -1) {
                            e2 = e.substr(e.indexOf(':') + 2);
                            prefix2 = e.substring(0, e.indexOf(':'));
                        }
                        obj2[op.classes[1].name + ": " + e2] = obj[e];
                    }
                    return obj2;
                });
            }
            var array = $.map(op.attributes, function (value) {

                return [op.classes[0].name + ": " + value];
            });
            var array2 = $.map(op.attributes2, function (value) {

                return [op.classes[1].name + ": " + value];
            });
            var r = union(reslt, reslt2, array, array2, op.union);
            //console.log("after union 33", r)
            res = r.result;
            $scope.statAttributes = [];
            $scope.statAttributes = r.attributes;
        } else if (typeof op != 'undefined' && op.type !== 'order') {
            //console.log("expression before result", reslt)
            res = $scope.executeExpression(op.expression, reslt);
        }

        if (!a) {
            $scope.statAttributes = $scope.attributes;
        }
        return res;
    }
    $scope.results = {};
    $scope.getResult = function (res, res2, showmodal) {

        $scope.cu = 0;
        $scope.query.operation = $scope.query.Aoperation;
        //console.log("getResult", $scope.query.operation);
        $scope.statAttributes = [];
        var a = false;
        var joined = false;
        var op = {};
        for (var i = ($scope.query.operation.length - 1); i >= 0; i--) {

            op = $scope.query.operation[i];
            if (op.optype == 's') {
                //console.log('ééééééééé', $scope.query.stat)
                var id = op.classes[0].idd;
                var res = $scope.results['s' + id];
                if ($scope.query.stat == 'Tableau') {
                    $scope.generateTable(res, $scope.showmodal);
                } else if ($scope.query.stat == 'Bar') {
                    $scope.generateBar(res, $scope.query.x, $scope.query.y, $scope.showmodal);
                } else if ($scope.query.stat == 'Pie') {
                    $scope.generatePie(res, $scope.query.pieLabels, $scope.query.pieData, $scope.showmodal);
                } else if ($scope.query.stat == 'Line') {
                    $scope.generateLine(res, $scope.query.lineLabels, $scope.query.lineData, $scope.showmodal);
                } else if ($scope.query.stat == 'Map') {
                    $scope.generateMap(res, $scope.query.codeISO, $scope.query.mapPays, $scope.query.mapData, showmodal);
                }
            } else if (op.optype == 'o') {
                var id = 's' + op.classes[0].idd;
                if (op.type == 'order' || op.type == "alias") {
                    $scope.results['s' + op.id] = $scope.results[id];
                } else {
                    var reslt1 = $scope.results[id];
                    var reslt2 = null;
                    if (op.classes[1] != null) {
                        var id2 = 's' + op.classes[1].idd;
                        reslt2 = $scope.results[id2];
                    }
                    //console.log("eeeeeddddddd", $scope.results, id2, reslt2)
                    $scope.results['s' + op.id] = $scope.executeQuery(reslt1, reslt2, op);
                }
            }
        }
    }
    $scope.linesStat = [];
    $scope.indexLine = 0;
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
        $scope.linesStat.push({
            labelsLine: $scope.labelsLine,
            dataLine: $scope.dataLine
        });
        $scope.lineHTML = "<canvas height='40%' id='line' class='chart chart-line' chart-data='linesStat[" + $scope.indexLine + "].dataLine' chart-labels='linesStat[" + $scope.indexLine + "].labelsLine' chart-options='optionsLine'></canvas>";
        $scope.indexLine++;
    }
    $scope.pieStat = [];
    $scope.indexPie = 0;
    $scope.generatePie = function (res, labels, data, showmodal) {

        //console.log('charts', data, labels)
        $scope.typeState = "pie";
        $scope.labelsPie = [];
        $scope.dataPie = [];
        $scope.data2Pie = [];
        if (showmodal)
            $scope.openModal('pie', 'null');
        for (var i = 0; i < res.length; i++) {
            var o = {};
            for (var elem in res[i]) {
                if (elem == labels) {
                    $scope.labelsPie.push(res[i][elem]);
                }
                if (elem == data) {
                    $scope.dataPie.push(res[i][elem]);
                }
            }
        }

        for (var i = 0; i < $scope.dataPie.length; i++) {
            $scope.data2Pie.push({
                label: $scope.labelsPie[i],
                data: $scope.dataPie[i]
            })
        }

        setTimeout(function () {
            var chart = AmCharts.makeChart("chartdiv", {
                "type": "pie",
                "theme": "light",
                "dataProvider": $scope.data2Pie,
                "valueField": "data",
                "titleField": "label",
            });
            //console.log('charts', chart)
        }, 1000)
        $scope.legend = {};
        if ($scope.labelsPie.length < 5)
            $scope.options = {
                legend: {
                    display: true
                }}
        else
            $scope.options = {};
        $scope.pieStat.push({
            dataPie: $scope.dataPie,
            labelsPie: $scope.labelsPie,
            options: $scope.options
        });
        //////////console.log($scope.legend)
        //$scope.pieHTML = "<div style='position : absolute; height : 100%; width : 100%;'><canvas class='chart chart-pie' chart-data='dataPie' chart-labels='labelsPie'></canvas></div>";
        $scope.pieHTML = "<canvas style='display : block' height='40%' class='chart chart-pie'  chart-data='pieStat[" + $scope.indexPie + "].dataPie' chart-labels='pieStat[" + $scope.indexPie + "].labelsPie' chart-options='pieStat[" + $scope.indexPie + "].options'></canvas>";
        //////////console.log($scope.pieHTML)
        $scope.indexPie++;
    }

    $scope.generateMap = function (res, codeISO, mapPays, mapData, showmodal) {
        if ($scope.typeMap == 1) {
            $scope.typeState = "map";
            var curr = {};
            var providerData = [];
            for (var i = 0; i < res.length; i++) {
                curr = {};
                for (var elem in res[i]) {
                    if (elem == mapPays) {
                        curr.category = res[i][elem];
                    }
                    if (elem == mapData) {
                        curr.value = Number(res[i][elem]);
                    }

                    if (elem == codeISO) {
                        curr.code = res[i][elem];
                    }
                }
                if (typeof providerData[curr.code] == 'undefined') {
                    curr.sum = curr.value;
                    providerData[curr.code] = [];
                } else {
                    curr.sum = providerData[curr.code][providerData[curr.code].length - 1].value + curr.value;
                }
                providerData[curr.code].push(curr);
            }
            //console.log("latlong", latlong);
// create circle for each country
            var images = [];
            for (var elem in providerData) {
                var item = providerData[elem];
                var cui = {};
                cui.title = elem;
                cui.latitude = latlong[elem].latitude;
                cui.longitude = latlong[elem].longitude;
                cui.width = 180;
                cui.height = 180;
                var pie = {
                    "type": "pie",
                    "pullOutRadius": 0,
                    "labelRadius": 0,
                    "valueField": "value",
                    "titleField": "category",
                    "dataProvider": []

                }
                for (var i = 0; i < item.length; i++) {
                    pie.dataProvider.push({
                        category: item[i].category,
                        value: eval(item[i].value)
                    });
                }

                cui.pie = pie;
                images.push(cui);
            }
            if ($scope.showmodal)
                $scope.openModal('map', 'null');
            else
                $scope.mapHTML = '<div id="chartdiv" style="height : 100%; width : 100%"></div>';
            setTimeout(function () {
                var map = AmCharts.makeChart("chartdiv", {
                    /**
                     * this tells amCharts it's a map
                     */
                    "type": "map",
                    "theme": "light",
                    "projection": "winkel3",
                    "dataProvider": {
                        "map": "worldLow",
                        "images": images
                    },

                    "listeners": [{
                            "event": "positionChanged",
                            "method": updateCustomMarkers
                        }]
                });
                $('text').remove();
            }, 1000);
        } else {
            if ($scope.showmodal)
                $scope.openModal('map', 'null');

            var images = [];
            images.push({
                type : "circle",
                title: 'test',
                latitude: 36.8065,
                longitude: 10.1815,
                value : 10
            });
            images.push({
                type : "circle",
                title: 'test',
                latitude: 35.9903,
                longitude: 9.2786,
                value : 10
            })
//            for (var elem in providerData) {
//                var item = providerData[elem];
//                var cui = {};
//                cui.title = elem;
//                cui.latitude = latlong[elem].latitude;
//                cui.longitude = latlong[elem].longitude;
//                cui.width = 180;
//                cui.height = 180;
//                var pie = {
//                    "type": "pie",
//                    "pullOutRadius": 0,
//                    "labelRadius": 0,
//                    "valueField": "value",
//                    "titleField": "category",
//                    "dataProvider": []
//
//                }
//                for (var i = 0; i < item.length; i++) {
//                    pie.dataProvider.push({
//                        category: item[i].category,
//                        value: eval(item[i].value)
//                    });
//                }
//
//                cui.pie = pie;
//                images.push(cui);
//            }
            setTimeout(function () {
                var map = AmCharts.makeChart("chartdiv", {
                    /**
                     * this tells amCharts it's a map
                     */
                    "type": "map",
                    "theme": "light",
                    "projection": "mercator",
                    "dataProvider": {
                        "mapVar": AmCharts.maps.TN,
                        getAreasFromMap: true,
                        images: images
                    },

                    "listeners": [{
                            "event": "positionChanged",
                            "method": updateCustomMarkers
                        }]
                });
                //console.log("map data", images);
                //console.log("map data", map);
                $('text').remove();
            }, 1000);
        }
    }
    $scope.dtInstance = {};
    $scope.alias = [];
    $scope.generateTable = function (res, showmodal) {
        for (var i = 0; i < res.length; i++) {
            for (var elem in res[i]) {
                for (var j = 0; j < $scope.alias.length; j++) {
                    if ($scope.alias[j].origin == elem) {
                        res[i][$scope.alias[j].newOne] = res[i][elem];
                        delete res[i][elem];
                        break;
                    }

                }
            }
        }

        $scope.statAttributes = [];
        for (var e in res[0]) {
            $scope.statAttributes.push(e);
        }
        $scope.statData = res;
        //console.log("scope.statData", $scope.statData)
        if ($scope.statData.length === 0) {
            //console.log("$scope.statData", res)
            $scope.statData[0] = "vide";
            $scope.statAttributes[0] = "Pas de données";
        }
////////console.log("#TABLE data : ", $scope.statData);
        if (showmodal) {

            $scope.openModal('statistique', null);
            $scope.dtColumns = [];
            var attributes = [];
            if ($scope.statAttributes.length == 0) {
                for (var e in res[0]) {
                    attributes.push(e);
                }
            } else {
                attributes = $scope.statAttributes;
            }

            //console.log("aliases", $scope.alias)
            for (var i = 0; i < attributes.length; i++) {
                $scope.dtColumns.push(DTColumnBuilder.newColumn(attributes[i].replace('.', ':')).withTitle(attributes[i]));
            }

            var responsive = {
                details: {
                    display: $.fn.dataTable.Responsive.display.modal({
                        header: function (row) {
                            var data = row.data();
                            return 'Détails';
                        }
                    }),
                    renderer: $.fn.dataTable.Responsive.renderer.tableAll({
                        tableClass: 'table'
                    })
                }
            };

            $scope.dtOptions = DTOptionsBuilder.fromFnPromise($scope.createTableHtmlV2())
                    .withBootstrap()
                    .withPaginationType('simple_numbers')
                    .withOption('bDeferRender', true)
                    .withOption('bProcessing', true)
                    .withOption('bSort', true)
                    .withOption('responsive', responsive)
                    .withOption('select', true)
                    .withScroller()
                    .withOption('scrollY', 250)
                    .withOption('order', $scope.getOrdering())
            //.withOption('rowsGroup', [3])
        }
    }

    $scope.getOrdering = function () {
        var o = [];
        if (typeof $scope.order != 'undefined')
            for (var i = 0; i < $scope.order.value.length; i++) {
                for (var j = 0; j < $scope.statAttributes.length; j++)
                {
                    if ($scope.order.value[i] == $scope.statAttributes[j]) {
                        o.push([j, $scope.order.op[i]]);
                        break;
                    }
                }

            }
        return o;
    }

    $scope.dtInstanceCallback = function (_dtInstance) {
        $scope.dtInstance = _dtInstance;
    };
    $scope.barStat = [];
    $scope.indexBar = 0;
    $scope.generateBar = function (res, x, y, showmodal) {

        $scope.typeState = "bar";
        $scope.labelsBar = [];
        $scope.dataBar = [];
        if (showmodal)
            $scope.openModal('bar', 'null');
        for (var i = 0; i < res.length; i++) {
            //////////////////console.log(res[i]);
            for (var elem in res[i]) {
                if (elem == x) {
                    $scope.labelsBar.push(res[i][elem]);
                }
                if (elem == y) {
                    $scope.dataBar.push(res[i][elem]);
                }
            }
        }

        $scope.barStat.push({
            labelsBar: $scope.labelsBar,
            dataBar: $scope.dataBar
        });
        if (showmodal)
            $scope.barHTML = "<canvas class='chart chart-bar' chart-data='dataBar' chart-labels='labelsBar'> </canvas>";
        else
            $scope.barHTML = "<canvas height='40%' class='chart chart-bar' chart-data='barStat[" + $scope.indexBar + "].dataBar' chart-labels='barStat[" + $scope.indexBar + "].labelsBar'> </canvas>";
        $scope.indexBar++;
    }
    $scope.modals = [];
    $scope.openModal = function (name, id) {
        if (id != 'null') {
            ////console.log($scope.getRessource(id))
            $scope.currentRessource = $scope.getRessource(id);
        }

        $scope.modalInstance = $uibModal.open({
            templateUrl: '/Dashboard/resources/partials/' + name + '.html',
            scope: $scope
        });
        $scope.modals.push($scope.modalInstance);
    };
    $scope.openModalWithPromess = function (name, id) {
        var deferred = $q.defer();
        if (id != 'null') {
            $scope.currentRessource = $scope.getRessource(id);
        }

        $scope.modalInstance = $uibModal.open({
            templateUrl: '/Dashboard/resources/partials/' + name + '.html',
            scope: $scope
        });
        $scope.modals.push($scope.modalInstance);
        deferred.resolve();
        return deferred.promise;
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
        var k = [];
        for (var i = 0; i < $scope.links.length; i++) {
            if ($scope.links[i].link.target.idd == id)
                k.push(i);
        }
        return k;
    }
    /*$scope.$watchCollection('stateObjects',function(obj){
     //////////////console.log(obj)
     })*/
    $scope.removeState = function (state) {
        if (!$scope.isSourceState(state.idd)) {
////console.log(state)
            var father = $scope.getBro(state);
            if (father !== null && typeof father != 'undefined') {
                if (state.name == 'expression' && typeof state.currentexpressionposition != 'undefined') {
                    father.attributes.splice(state.currentexpressionposition, 1);
                    ////console.log("expression", father.attributes)
                }
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

    $scope.newState = function (state, type, num) {
        var id, name, attributes, typ, attributesv2, attributes2, l = 0;
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
            id = state;
            name = $scope.services[state].service.name;
            l = $scope.services[state].service.attributesL;
            attributes = $scope.services[state].service.attributes;
            var vattributes = [];
            for (var i = 0; i < attributes.length; i++) {
                vattributes.push({
                    attribute: attributes[i]
                })
            }
            if (typeof $scope.services[state].service.attributes != 'undefined' && $scope.services[state].service.attributes.length > 0 && $scope.services[state].service.attributes[0] != "error") {
                attributesv2 = $scope.services[state].service.attributes.map(function (obj) {
                    return  $scope.services[state].service.name + ': ' + obj;
                });
            } else
                error = true;
            typ = 'r';
        } else if (type == 'condition' || type == 'where' || type == 'join' || type == 'where2' || type == 'expression' || type == 'union' || type == 'order' || type == 'alias') {
            id = state;
            name = $scope.conditions[state].name;
            attributes = [];
            typ = 'o';
        } else if (type == 'stat' || type == 'bar' || type == 'pie' || type == 'line' || type == 'map') {
            id = state;
            name = $scope.stat.name;
            attributes = [];
            typ = 's';
        }

        if (type == 'expression') {
            name = 'expression';
        }
        var uuid1 = getNextUUID();
        var uuid2 = getNextUUID();
        var uuid3 = getNextUUID();
        var uuid4 = getNextUUID();
        var uuid7 = getNextUUID();
        var uuid8 = getNextUUID();
        var c = [];
        c[0] = 0;
        if (!error) {
            $scope.stateObjects.push({
                'realHeight': 0,
                'expanded': false,
                'id': id,
                'idd': idd,
                'name': name,
                'template': type,
                'attributes': attributes,
                'vattributes': vattributes,
                'count': c,
                'type': typ,
                'Sattributes': [],
                'attributesv2': attributesv2,
                'attributesWhere': [],
                'attributesL': l,
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
////console.log($scope.services[state]);
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
        ////console.log(state);
        return state;
    };
    $scope.copyAttribute = function (attribute) {
        var attr = [];
        if (typeof attribute[0] != 'object')
            return attribute;
        for (var i = 0; i < attribute.length; i++) {
            if (attribute[i].attribute != null) {
                attr.push(attribute[i]);
                ////console.log(attribute[i])
            }
        }
        return attr;
    }

    $scope.getAttr = function (stat) {
        //console.log("targetttttt", stat)
        var array = [];
        var ind = "";
        for (var i = 0; i < stat.length; i++) {
            if (typeof stat[i].op != 'undefined' && stat[i].op != "" && stat[i].op != 'distinct')
            {
                ind = stat[i].op + "." + stat[i].attribute;
            } else if (typeof stat[i].attribute != 'undefined') {
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

    $scope.changeStatValue = function (id) {
        var stat = $scope.stateObjects[$scope.getStateById(id)];
        //console.log("stttaaa", stat)
        var array = [];
        if (stat == null)
            return;
        for (var i = 0; i < stat.Sattributes.length; i++) {
            if (!stat.Sattributes[i].deleted)
                array.push({attribute: stat.Sattributes[i].attribute});
        }
        stat = $scope.getNextStat(id);
        if (stat != null) {
            $scope.stateObjects[$scope.getStateById(stat.idd)].barAttributes = array;
            $scope.stateObjects[$scope.getStateById(stat.idd)].lineAttributes = array;
            $scope.stateObjects[$scope.getStateById(stat.idd)].pieAttributes = array;
            $scope.stateObjects[$scope.getStateById(stat.idd)].mapAttributes = array;
        }


        //console.log("rrrrrr", stat)
    }
    $scope.selectAttributes = function (id) {
        var stat = $scope.getNextStat(id);
        //console.log("next state", stat)
        if (stat != null)
            stat.barAttributes = stat.attributes;
        if (stat != null && stat.name != "join") {
            if (stat.name == "select") {
                stat.attributes = $scope.copyAttribute(stat.Sattributes);
                //////console.log(stat)
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
            $scope.stateObjects[$scope.getStateById(stat.idd)].vattributes = stat.vattributes;
            $scope.stateObjects[$scope.getStateById(stat.idd)].attributes = stat.attributes;
        }
        $scope.changeStatValue(id);
    }


    $scope.unify = function (jsonArray) {
        var resultArray = [];
        for (var i = 0; i < jsonArray.length; i++) {
            resultArray.push({attribute: jsonArray[i]});
        }
        return resultArray;
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
        var source = $scope.getState($rootScope.connections.source);
        ////console.log("11111", source);
        var target = $scope.getState($rootScope.connections.target);
        if (source.name == "select") {
            source.attributes = $scope.copyAttribute(source.Sattributes);
        }
        //console.log("the source", source);

        $('#b' + target.idd).removeClass('disabled');
        ////////////console.log(source, target)
        if (target.type == 'o') {
            $scope.attributes = $scope.copyAttribute(source.attributes);
            target.attributes = $scope.copyAttribute(source.attributes);
            target.vattributes = $scope.copyAttribute(source.attributes);
            if (source.name == 'join') {
                var array = source.leftAttributes.map(function (el) {
                    return source.leftRessource + ": " + el;
                });
                var array2 = source.rightAttributes.map(function (el) {
                    return source.rightRessource + ": " + el;
                });
                target.vattributes = array.concat(array2);
                target.attributes = source.leftAttributes.concat(source.rightAttributes);
            }
            if (source.name == 'union') {
                var array = source.leftAttributes.map(function (el) {
                    return source.leftRessource + ": " + el;
                });
                var array2 = source.rightAttributes.map(function (el) {
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

            if (source.type == 'e') {
                target.vattributes.push(source.name);
            }

            if (target.name == 'join' || target.name == 'union') {
                if (source.name == 'select') {
                    //console.log(source.attributes);
                    if (target.targets[0].uuid == targetUUID) {
                        target.rightAttributes = $scope.getAttr(source.attributes);
                        target.rightRessource = source.name;
                        target.rightRessourceId = source.id;
                    } else {
                        target.leftAttributes = $scope.getAttr(source.attributes);
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

            //console.log("arrrrrrt", $scope.attributes)
        }
        if (target.type == 's') {
            if (source.name == "where") {
                target.attributes = source.vattributes;
            } else if (source.name == "select") {
                target.attributes = $scope.copyAttribute(source.Sattributes);
            } else
                target.attributes = $scope.copyAttribute(source.attributes);
        }
        var t = target;
        var f = false;
        var g = false;
        if (target.type == 's' && (target.name == 'Bar' || target.name == 'Pie' || target.name == 'Line' || target.name == 'Map')) {

            if (source.name == 'join' || source.name == 'union') {
                var array = source.leftAttributes.map(function (el) {
                    var obj = {};
                    obj.attribute = source.leftRessource + ": " + el;
                    return obj;
                });
                var array2 = source.rightAttributes.map(function (el) {
                    var obj = {};
                    obj.attribute = source.rightRessource + ": " + el;
                    return obj;
                });
                target.barAttributes = array.concat(array2);
                target.pieAttributes = array.concat(array2);
                target.lineAttributes = array.concat(array2);
                target.mapAttributes = array.concat(array2);
            } else if (source.name == 'select') {
                target.barAttributes = $scope.unify($scope.getAttr(source.attributes));
                target.pieAttributes = $scope.unify($scope.getAttr(source.attributes));
                target.lineAttributes = $scope.unify($scope.getAttr(source.attributes));
                target.mapAttributes = $scope.unify($scope.getAttr(source.attributes));
            } else {
                target.barAttributes = $scope.unify(source.attributes);
                target.pieAttributes = $scope.unify(source.attributes);
                target.lineAttributes = $scope.unify(source.attributes);
                target.mapAttributes = $scope.unify(source.attributes);
            }

            //console.log("soooooooo", );
        }

//        if (target.type == 's' && (target.name == 'Bar' || target.name == 'Pie' || target.name == 'Line' || target.name == 'Map')) {
//
//            if (source.name === 'join') {
//                var array = source.leftAttributes.map(function (el) {
//                    var obj = {};
//                    obj.attribute = source.leftRessource + ": " + el;
//                    return obj;
//                });
//                var array2 = source.rightAttributes.map(function (el) {
//                    var obj = {};
//                    obj.attribute = source.rightRessource + ": " + el;
//                    return obj;
//                });
//                target.barAttributes = array.concat(array2);
//                target.pieAttributes = array.concat(array2);
//                target.lineAttributes = array.concat(array2);
//                target.mapAttributes = array.concat(array2);
//                //////////////console.log(target.barAttributes)
//                f = true;
//                g = true;
//            } else {
//                while ((r = $scope.getBro(t)) != null) {
//                    if (r.name === 'select') {
//                        target.source = r;
//                        f = true;
//                        break;
//                    }
//                    t = r;
//                }
//            }
//            if (!f) {
//                if (source.name == 'where') {
//
//                    target.source = source;
//                    target.barAttributes = [];
//                    target.pieAttributes = [];
//                    target.lineAttributes = [];
//                    target.mapAttributes = [];
//                    for (var i = 0; i < target.source.vattributes.length; i++) {
//                        if (target.source.vattributes[i] !== null && target.name == 'Bar')
//                            target.barAttributes[i] = {
//                                attribute: target.source.vattributes[i]
//                            }
//                        if (target.source.vattributes[i] !== null && target.name == 'Pie')
//                            target.pieAttributes[i] = {
//                                attribute: target.source.vattributes[i]
//                            }
//                        if (target.source.attributes[i] !== null && target.name == 'Line')
//                            target.lineAttributes[i] = {
//                                attribute: target.source.vattributes[i]
//                            }
//                        if (target.source.attributes[i] !== null && target.name == 'Map')
//                            target.mapAttributes[i] = {
//                                attribute: target.source.vattributes[i]
//                            }
//                    }
//                } else {
//                    target.source = t;
//                    target.barAttributes = [];
//                    target.pieAttributes = [];
//                    target.lineAttributes = [];
//                    target.mapAttributes = [];
//                    for (var i = 0; i < target.source.attributes.length; i++) {
//                        if (target.source.vattributes[i] !== null && target.name == 'Bar')
//                            target.barAttributes[i] = {
//                                attribute: target.source.vattributes[i]
//                            }
//                        if (target.source.vattributes[i] !== null && target.name == 'Pie')
//                            target.pieAttributes[i] = {
//                                attribute: target.source.vattributes[i]
//                            }
//                        if (target.source.attributes[i] !== null && target.name == 'Line')
//                            target.lineAttributes[i] = {
//                                attribute: target.source.vattributes[i]
//                            }
//                        if (target.source.attributes[i] !== null && target.name == 'Map')
//                            target.mapAttributes[i] = {
//                                attribute: target.source.vattributes[i]
//                            }
//                    }
//                }
//            } else if (!g) {
//                var attrs = $scope.toAttributes($scope.getAttr(target.source.Sattributes));
//                target.barAttributes = attrs;
//                target.pieAttributes = attrs;
//                target.lineAttributes = attrs;
//                target.mapAttributes = attrs;
//                //////console.log(target)
//            }
//        }


        if (target.name == 'alias') {

            target.vattributes = source.vattributes;
        }

        if (source.type == 'r' && target.type == 's') {
            var attrs = [];
            for (var i = 0; i < target.source.attributes.length; i++) {
                attrs.push({attribute: source.attributes[i]})
            }
            target.barAttributes = attrs;
            target.pieAttributes = attrs;
            target.lineAttributes = attrs;
            target.mapAttributes = attrs;
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
        ////////console.log(data);
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
            //////console.log($scope.fullUser);
        });
        ////////console.log($scope.username);
        $http.get("/Dashboard/rest/statistique/available/" + $scope.username).then(function (response) {
////////console.log(response.data)
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
                ////console.log(response.data);
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
                var data = angular.fromJson(response.data.data);
                $scope.stateObjects = data.stateObjects;
                setTimeout(function () {
                    setTimeout(function () {
                        $scope.links = data.links;
                        $scope.order = data.order;
                        for (var i = 0; i < $scope.stateObjects.length; i++) {
                            $('#b' + $scope.stateObjects[i].idd).removeClass('disabled')
                        }
                    }, 1000);

                }, 1000);
            });
        } else {
            $scope.dashboardName = 'New Statistique';
        }


    }


    $scope.index = [];
    $scope.removecond = function (id, index, type) {
        if ($scope.stateObjects[$scope.getStateById(id)].name == 'select')
        {
            $scope.stateObjects[$scope.getStateById(id)].Sattributes[index] = {};
            $scope.stateObjects[$scope.getStateById(id)].Sattributes[index]['attribute'] = '';
            $scope.stateObjects[$scope.getStateById(id)].Sattributes[index]['deleted'] = true;
            $scope.selectAttributes(id);
        } else if ($scope.stateObjects[$scope.getStateById(id)].name == 'where') {
            $scope.stateObjects[$scope.getStateById(id)].attributesWhere[index]['deleted'] = true;
        }
        $('#' + type + 'div' + id + 'p' + index).remove();
    }

    $scope.addcond = function (type, id) {
        var stateId = $scope.getStateById(id);
        $scope.changeStatValue(id);
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
                swal("modification avec succées", "success");
                $scope.closeModal();
            });
        } else {
            $http.get("/Dashboard/rest/statistiques/" + $scope.statistique.name).then(function (response) {
                var data = response.data;
                if (data) {
                    swal("Erreur!", "Choisissez un autre nom !!", "error");
                } else {
                    $http.post("/Dashboard/rest/statistique", $scope.statistique).then(function (response) {
                        var newStatId = response.data;
                        var share = {
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
        var services = [];
        var i = 0;
        for (var elem in $scope.services) {
            services.push({
                id: elem,
                data: $scope.services[elem]
            });
        }
//////////////console.log(services);
        $scope.username = username;
        var data = {
            stateObjects: $scope.stateObjects,
            links: $scope.links,
            ressources: $scope.ressources,
            services: services,
            order: $scope.order
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
////////////////console.log(response.data);

            var sdata = angular.fromJson(response.data.data);
            //console.log("sdata", sdata.order)
            $scope.stateObjects = sdata.stateObjects;
            $scope.links = sdata.links;
            $scope.ressources = sdata.ressources;
            $scope.order = sdata.order;
            var s = sdata.services;
            for (var i = 0; i < s.length; i++) {
                $scope.services[s[i].id] = s[i].data;
            }
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
//////////////console.log(i);
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
        var obj = JSON.parse(Robj);
        if (obj != null)
            if (type === 'u') {
                if ($scope.users.indexOf(obj) == -1) {
                    if ($scope.profiles.length == 0) {
                        $scope.users.push(obj);
                        //////////////console.log($scope.containes($scope.allUsers, obj, 'u'));
                        $scope.allUsers.splice($scope.containes($scope.allUsers, obj, 'u'), 1);
                    } else {
                        var found = false
                        var u = $scope.usersAndRoles[obj.username];
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
                //////////////console.log(obj)
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
                var indexes = [];
                for (var i in $scope.allUsers) {
                    ////////////console.log($scope.allUsers[i], " : ", $scope.usersAndRoles[$scope.allUsers[i].username])
                    if ($scope.usersAndRoles[$scope.allUsers[i].username].indexOf(obj.roleName) !== -1) {

                        $scope.removedUsers.push({
                            role: obj.roleName,
                            user: $scope.allUsers[i]
                        })
                        indexes.push($scope.allUsers[i]);
                    }
                }
                //////////////console.log($scope.removedUsers);
                for (var i = 0; i < indexes.length; i++) {
                    var j = 0;
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
            //////console.log($scope.fullUser);
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
        ////////////////console.log(user);
        $scope.username = user;
        $scope.statistiques = {
            my: [],
            others: []
        }

        $http.get("/Dashboard/rest/statistique/available/" + $scope.username).then(function (response) {
//////console.log(response.data)
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
////////////console.log($scope.statistiques);
        });
    }
    $scope.detailStat = function (detail) {
        swal("Détail", detail);
    }



    $scope.generateDataToStat = function (stat) {
        var deferred = $q.defer();
        $scope.stateObjects = [];
        $scope.links = [];
        $scope.services = [];
        var sdata = angular.fromJson(stat.data);
        $scope.stateObjects = sdata.stateObjects;
        $scope.links = sdata.links;
        $scope.ressources = sdata.ressources;
        var s = sdata.services;
        for (var j = 0; j < s.length; j++) {
            $scope.services[s[j].id] = s[j].data;
        }
        var obj = {
            'stat': stat
        }

        $scope.generateStat(false);
        deferred.resolve($scope.query)
        return deferred.promise;
    }

    /****
     */
    $scope.generateStat2 = function (showmodal) {
        var deferred = $q.defer();
        var t = {};
        for (var i = 0; i < $scope.stateObjects.length; i++) {
            if ($scope.stateObjects[i].id == 0) {
                t = $scope.stateObjects[i];
                break;
            }
        }

        $scope.query = {};
        $scope.query.operation = [];
        $scope.operationIndex = 0;
        $scope.query.ressources = [];
        $scope.generateStatistique(t);
        var url1 = "", url2 = "";
        var type1 = "", type2 = "";
        var serv1 = {}, serv2 = {};
        if (typeof $scope.query.ressources[0] == 'undefined') {
            $scope.generateStatistique(t);
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
                    deferred.resolve();
                });
            } else {
                $scope.getResult(data, null, showmodal);
                deferred.resolve();
            }

        });
        return deferred.promise;
    }
    /** */


    $scope.executeStat = function (stat) {
        var deferred = $q.defer();
        ////console.log(stat);
        if (typeof stat.text !== 'undefined') {
            deferred.resolve(stat.text);
        } else {
            $scope.stateObjects = [];
            $scope.links = [];
            $scope.services = [];
            var sdata = angular.fromJson(stat.data);
            $scope.stateObjects = sdata.stateObjects;
            $scope.links = sdata.links;
            $scope.ressources = sdata.ressources;
            var s = sdata.services;
            for (var j = 0; j < s.length; j++) {
                $scope.services[s[j].id] = s[j].data;
            }

//            var p = $scope.generateStat2(false);
//            p.then(function () {
//                deferred.resolve(null);
//            });
//           
            var p = $scope.generateStatPromess(false);
            p.then(function (data) {
                //console.log("dddddd", data)
                deferred.resolve(null);
            })

        }

        return deferred.promise;
    }
    $scope.editDashboard = function (user, id) {
//////console.log(user)
        $http.get("/Dashboard/rest/users/get/" + user.toLowerCase()).then(function (response) {
            $scope.fullUser = response.data;
        });
        $scope.username = user;
        $scope.initDashboard($scope.username)
        //////////console.log($scope.username)
        $http.get('/Dashboard/rest/dashboards/' + id).then(function (response) {
////////console.log(response.data)
            $scope.dashboardData = response.data.dashboard;
            $scope.stats = response.data.stats;
            $scope.dd = response.data.statsDashboard;
            //////console.log($scope.dd)
            if (typeof response.data.text != 'undefined') {
                var text = angular.fromJson(response.data.text.text);
                ////////console.log(text)
                var obj = {
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
    $scope.showmodal = true;
    $scope.consulterDashboard = function (id) {
        $scope.showmodal = false;
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

                //console.log("stats", $scope.stats)
                $scope.dd = response.data;
                //myLoop();
                $scope.indexOfStat = 0;
                $scope.resultNext($scope.indexOfStat);
            } else {
                swal("Vide !!", "Le dashboard ne contient aucune statistique !!", "warning");
            }
        });
    }

    $scope.DashResult = function (index) {

        var deferred = $q.defer();
        var type = $scope.stateObjects[$scope.stateObjects.length - 2].name;
        if (type == 'join')
            type = $scope.stateObjects[$scope.stateObjects.length - 3].name
        // insert the text description if it exist

        var title = $scope.stats[index].name;
        if (typeof $scope.dd != 'undefined' &&
                typeof $scope.dd.statsDashboard != 'undefined' &&
                typeof $scope.dd.statsDashboard[index].text != 'undefined' &&
                $scope.dd.statsDashboard[index].text != 'null') {
            title = $scope.dd.statsDashboard[index].text;
        }
        var li = $("<li id='li" + $('#sortable').children().length + "' class='panel panel-default' style='overflow : hidden;position : relative'>" +
                "<div class='panel-heading'>" + title + "<div  style='position : absolute;right : 0;top:0;margin-top:5px'><button class='btn btn-default btn-sm' ng-click='getInfo(" + $('#sortable').children().length + ")'><i class='fa fa-info'></i></button></div></div></li>");
        $('#sortable').append($compile(li)($scope));
        deferred.resolve({type: type, id: $('#sortable').children().length});
        $scope.typeSR = "";
        return deferred.promise;
    }

    $scope.resultNext = function (index) {
        var typeSt = "";
        ////console.log("next result")
        var p = $scope.executeStat($scope.stats[index]);
        $scope.indexOfStat++;
        p.then(function (st) {
            //console.log("zzzzzzzzzaaaaa", st)
            //////////////////
            if (st !== null) {
                var typeSR = angular.fromJson(st);
                var li = $("<li id='li" + $('#sortable').children().length + "' class='panel panel-default' style='overflow : hidden;position : relative'>" +
                        "<div class='panel-heading'>" + typeSR.title + "</div>" +
                        "<div class='panel-body'>" + typeSR.description + "</li>");
                $('#sortable').append(li);
                if ($scope.indexOfStat < $scope.stats.length) {
                    $scope.resultNext($scope.indexOfStat);
                }
            } else {

                var p2 = $scope.DashResult(index).then(function (data) {
                    var type = data.type;
                    var id = 'li' + (data.id - 1);
                    if ($scope.typeSR == "") {

                        if (type == "Bar") {
                            $('#' + id).append($compile($scope.barHTML)($scope));
                        } else if (type == "Pie") {
                            $('#' + id).append($compile($scope.pieHTML)($scope));
                        } else if (type == "Line") {
                            $('#' + id).append($compile($scope.lineHTML)($scope));
                        } else if (type == "Map") {
                            $('#' + id).append($compile($scope.mapHTML)($scope));
                        } else {
                            ////console.log("statData", $scope.statData)
                            var pTab = $scope.createTableHtml();
                            pTab.then(function (data) {
                                ////console.log("tableau", data)
                                $('#' + id).append($compile(data)($scope));
                            })
                        }
                    }
                    if ($scope.indexOfStat < $scope.stats.length) {
                        $scope.resultNext($scope.indexOfStat);
                    }
                })
            }

            ///////////////////
//            if ($scope.indexOfStat < $scope.stats.length) {
//                $scope.resultNext($scope.indexOfStat);
//            }
        });
    }

    $scope.preview = function (stat) {
////console.log("preview", stat)
        $scope.getStat(stat, true);
    }

    $scope.deleteStatFromDashboard = function (index) {
        $scope.dashboard.splice(index, 1);
    }

    $scope.addStatToDashboard = function (stat, i) {
        //console.log("stat added", stat)
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
        //////console.log($scope.titles)
        $scope.modalInstance = $uibModal.open({
            templateUrl: '/Dashboard/resources/partials/saveDashboard.html',
            scope: $scope
        });
    }
    $scope.editDashboardModal = function () {
//////////console.log($scope.dashboardData)
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
        var array = [];
        $('#sortable').children().each(function () {
            array.push(this.id);
        });
        return array;
    }

    $scope.editerDashboard = function () {

        var dashboardObj = {
            id: $scope.dashboardData.id,
            name: $scope.dashboardData.name,
            description: $scope.dashboardData.description,
            dateCreation: Date.now(),
            createdBy: $scope.username
        };
        //////////console.log(dashboardObj)
        $http.post("/Dashboard/rest/dashboard/edit", dashboardObj).then(function (response) {
            $scope.log = "\n Dashboard modifier avec succées" + $scope.log;
            var share = {
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
                    var desc = {
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
////////console.log($scope.dashboard);
            var dashboardStats = {
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

        var dashboardObj = {
            name: $scope.dashboard.name,
            description: $scope.dashboard.description,
            dateCreation: Date.now(),
            createdBy: $scope.username
        };
        $http.get("/Dashboard/rest/dashboard/exist/" + $scope.dashboard.name).then(function (response) {

            if (!response.data) {
                $http.post("/Dashboard/rest/dashboard/save", dashboardObj).then(function (response) {
                    $scope.log = "\n Dashboard enregistrer avec succées" + $scope.log;
                    var share = {
                        id_dashboard: response.data,
                        profiles: $scope.profiles,
                        users: $scope.users,
                    };
                    $http.post("/Dashboard/rest/dashboard/partage", share);
                    var array = $scope.getStatsFromDash();
                    var stats = [];
                    for (var i = 0; i < array.length; i++) {
                        if (array[i] == 0) {
                            var desc = {
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
                    //////console.log(stats);
                    var dashboardStats = {
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

    $scope.addExpression = function (state) {
////console.log("aaaaaaaa", $scope.getBro(state))
        $scope.openModal('expression');

        //console.log("expression stat", state, $scope.getBro(state));
        var attrs = [];
        if ($scope.getBro(state).name == 'select')
            state.vattributes = $scope.getBro(state).Sattributes;
        if (typeof state.vattributes[0] == 'object') {
            for (var i = 0; i < state.vattributes.length; i++) {
                if (state.vattributes[i].attribute != "") {
                    var op = "";
                    if (typeof state.vattributes[i].op != 'undefined') {
                        op = state.vattributes[i].op + ".";
                    }
                    attrs[i] = op + state.vattributes[i].attribute
                }

            }
            state.attributes = attrs;
            $scope.expressionState = state;
        } else
            $scope.expressionState = state;
        $scope.currentAttrs = state.vattributes;
        //console.log("fffffffffdddd", $scope.currentAttrs);
        $scope.config = {
            autocomplete: [
                {
                    words: [/@([A-Za-z]+[_A-Za-z0-9]+)/gi],
                    cssClass: 'user'
                }
            ],
            dropdown: [
                {
                    trigger: /@([A-Za-z]+[_A-Za-z0-9]+)/gi,
                    list: function (match, callback) {

                        // match is the regexp return, in this case it returns
                        // [0] the full match, [1] the first capture group => username
                        var data = $scope.currentAttrs;
                        // Prepare the fake data
                        var listData = data.filter(function (element) {
                            return element.substr(0, match[1].length).toLowerCase() === match[1].toLowerCase()
                                    && element.length > match[1].length;
                        }).map(function (element) {
                            return {
                                display: element, // This gets displayed in the dropdown
                                item: element // This will get passed to onSelect
                            };
                        });
                        callback(listData);

                    },
                    onSelect: function (item) {
                        return item.display;
                    },
                    mode: 'replace'
                }
            ]
        };
    }

//    $scope.expandState = function(state){
//        var h = $('#s'+state.idd).height();
//        ////console.log(typeof state.realheight,state.realheight)
//        if(typeof state.realheight == 'undefined') state.realheight = h;
//        
//        if(!state.expanded){
//            
//            state.expanded = true;
//        }else{
//            $('#s'+state.idd).height(h);
//            state.expanded = false;
//        }
//    }

    $scope.addop = function (op) {
        if (typeof $scope.expressionState.expression == 'undefined')
            $scope.expressionState.expression = op + " ";
        else
            $scope.expressionState.expression = $scope.expressionState.expression + " " + op + " ";
    }

    $scope.evaluateExpression = function (row, expression) {
        var st = "";
        ////console.log("bbbbb", row, expression)
        for (var i = 0; i < expression.length; i++) {
            if (expression[i] != "") {
////console.log("row", row[expression[i]])
                if (expression[i] != '+' && expression[i] != '-' && expression[i] != '*' && expression[i] != '/' && expression[i] != '(' && expression[i] != ')') {
                    if (isNaN(expression[i]))
                        st += row[expression[i]];
                    else
                        st += expression[i];
                } else {
                    st += expression[i];
                }
            }
        }
////console.log("expressions", eval(st));
        return st;
    }
    $scope.addToExpression = function (val, type) {
        if (typeof $scope.expressionState.expression == 'undefined') {
            $scope.expressionState.expression = "";
        }
        var mathexpression = $scope.expressionState.expression.split(";");
        mathexpression.splice(mathexpression.length - 1, 1);
        ////console.log("exxxxxx", val, mathexpression)
        if (typeof val == 'undefined') {
            $scope.currentExpressionError = "0000x";
        } else if (mathexpression.length == 0 && type == 'op') {
            $scope.currentExpressionError = "0001o";
        } else if ((mathexpression[mathexpression.length - 1] == "+" ||
                mathexpression[mathexpression.length - 1] == "-" ||
                mathexpression[mathexpression.length - 1] == "/" ||
                mathexpression[mathexpression.length - 1] == "*") && type == 'op') {
            $scope.currentExpressionError = "0002o";
        } else if (mathexpression.length > 0 && mathexpression[mathexpression.length - 1] != '+' &&
                mathexpression[mathexpression.length - 1] != '-' &&
                mathexpression[mathexpression.length - 1] != '*' &&
                mathexpression[mathexpression.length - 1] != '/' &&
                type != 'op') {
            $scope.currentExpressionError = "0001v";
        } else {
            $scope.currentExpressionError = '';
            if (typeof $scope.expressionState.expression == 'undefined')
                $scope.expressionState.expression.push(val);
            else
                $scope.expressionState.expression = $scope.expressionState.expression + val + ";";
        }
    }

    $scope.executeExpression = function (expression, res) {
        //console.log('expression', expression)
        if (expression == null || typeof expression.expression == 'undefined')
            return;
        var array = expression.expression.split(";");
        var newArray = [];
        newArray[0] = array[0];
//        for(var i=1;i<array.length;i++){
//            if(array[i-1][array[i-1].length-1] == ':'){
//                newArray[newArray.length-1] = newArray[newArray.length-1] + " "+array[i];
//                //i++;
//            }
//            else
//                newArray.push(array[i]);
//        }
        var expressions = [];
        //console.log('res in the epression', array, newArray);
        for (var j = 0; j < res.length; j++) {
            expressions.push($scope.evaluateExpression(res[j], array));
            res[j][expression.name] = eval(expressions[j]);
            ////console.log('result of', res[j][expression.name])
        }
////console.log("expressions", res);
        return res;
    }

    $scope.validateExpression = function (state) {
        //console.log("kkkkpppp", state.currentexpressionposition)
        if (typeof state.currentexpressionposition == 'undefined') {
            state.attributes.push(state.expressionName);
            state.currentexpressionposition = state.attributes.length - 1;
        } else
            state.attributes[state.currentexpressionposition] = state.expressionName;
        ////console.log("expression state", state);
        var index = $scope.getStateById(state.idd);
        $scope.stateObjects[index] = state;
        $scope.currentExpressionError = "";
        $scope.expressionState = {};
        $scope.closeModal();
    }
    $scope.createTableHtml = function () {
        var deferred = $q.defer();
        var id = Date.now();
        var tableString = "<table id='" + id + "' class='table table-striped table-bordered nowrap' cellspacing='0' width='100%'><thead><tr>";
        for (var elem in $scope.statData[0]) {
            tableString += "<th>" + elem + "</th>";
        }
        tableString += "</thead><tbody>";
        for (var i = 0; i < $scope.statData.length; i++) {
//////console.log('i = ', i)
            tableString += "<tr>";
            for (var j = 0; j < $scope.statAttributes.length; j++) {
                tableString += "<td>" + $scope.statData[i][$scope.statAttributes[j]] + "</td>";
            }
            tableString += "</tr>";
        }
        tableString += "</tbody></table>";
        //deferred.resolve(tableString);
        setTimeout(function () {
            $('#' + id).DataTable({
                bPaginate: true,
                bLengthChange: false,
                bDeferRender: true,
                bFilter: false,
                bInfo: false,
                iDisplayLength: 5,
                responsive: {
                    details: {
                        display: $.fn.dataTable.Responsive.display.modal({
                            header: function (row) {
                                var data = row.data();
                                return 'Détaille de ' + data[0] + ' ' + data[1];
                            }
                        }),
                        renderer: $.fn.dataTable.Responsive.renderer.tableAll({
                            tableClass: 'table'
                        })
                    }
                },
                "order": $scope.getOrdering(),
            });

            $('.paging_simple_numbers').css({'margin-top': '10px'})
        }, 1000)

        deferred.resolve(tableString)
        return deferred.promise;
    }

    $scope.createTableHtmlV2 = function () {

        var deferred = $q.defer();
        var b = $scope.statData;
        var a = [];
        for (var i = 0; i < b.length; i++) {
            a[i] = {};
            for (var elem in b[i]) {
                var x = elem.replace('.', ':');
                if (b[i][elem] === null || b[i][elem] === 'null') {
                    a[i][x] = '-';
                } else
                    a[i][x] = b[i][elem];
            }
        }

        deferred.resolve(a);
        return deferred.promise;
    }

    $scope.Imprimer = function () {
        var doc = new jsPDF('landscape');
        var item = $scope.dtInstance.DataTable.rows().data();
        //console.log("after sorting", $scope.currData)
        var col = [];
        for (var elem in item[0]) {
            if (elem.indexOf(':') != -1) {
                col.push(elem.substr(elem.indexOf(':') + 1).replace('_', ' '))
            } else {
                col.push(elem.replace('_', ' '));
            }
        }
        var rows = [];
        var temp = [];
        for (var i = 0; i < item.length; i++) {
            temp = [];
            for (var key in item[i]) {
                temp.push(item[i][key]);
            }
            rows.push(temp);
        }

        //console.log(col)
        doc.autoTable(col, rows, {
            startY: 60,
            tableWidth: 'auto',
            columnWidth: 'auto',
            styles: {
                fontSize: 7,
                overflow: 'linebreak'
            }
        });
        doc.save("s" + Date.now());
    };

});
