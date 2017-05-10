myApp.controller('FirstExampleController', function ($timeout, $rootScope, $filter, $scope, $http, $localStorage, $uibModal, $compile) {

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

    $scope.getRessource = function (id) {
        for (var i = 0; i < $scope.ressources.length; i++) {
            if ($scope.ressources[i].ressource.id == id)
            {
                return $scope.ressources[i].ressource;
            }
        }
        return {};
    }

    $scope.addRessource = function (ressource) {
        console.log(ressource);
        var found = false;
        for (var i in $scope.ressources) {
            if ($scope.ressources[i].ressource.name == ressource.name) {
                $scope.ressources[i].ressource = ressource;
                found = true;
                break;
            }
        }
        if (!found) {

            let savedRessource = {
                name: ressource.name,
                url: ressource.url,
                login: ressource.login,
                password: ressource.password
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

    $scope.$watchCollection('ressources', function (obj) {
        console.log(obj)
    })

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
                            //console.log(deletedService)
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
            console.log($scope.services[service.id].service = service)
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

        } else {
            uid = res.id;
            $scope.services[service.id].service.url = res.url;
            $scope.services[service.id].service.idRessource = res.id;
        }

        //get the attribute from a REST
        var url = $scope.services[service.id].service.url + $scope.services[service.id].service.suburl;
        $scope.services[service.id].service.attributes = [];
        $http.get(url).then(function (response) {

            var s = merge($scope.flatten(response.data[0]), $scope.flatten(response.data[1]));
            for (var i = 0; i < response.data.length; i++) {
                s = merge(s, $scope.flatten(response.data[i]));
            }
            for (var elem in s) {
                $scope.services[service.id].service.attributes.push(elem);
            }
        }, function (err) {
            ////console.log('Fail to Load REST WS : ' + url);
        });
        var nom = service.name;
        $('#' + uid)
                .append($compile("<li id='li" + service.id + "'><a><span ng-click=drawService('" + service.id + "') >" +
                        service.name + "</span><i ng-click='deleteService(" + service.id + ")' class='fa fa-trash pull-right'></i><i ng-click='editService(" + service.id + ")' class='fa fa-pencil pull-right'></i></a></li>")($scope));
        //$scope.newState(ressource);
        $scope.service = {};
        $scope.closeModal();
    }

    $scope.addServiceFromDB = function (service) {
        $scope.services[service.id] = {
            'service': service
        };

        $scope.services[service.id].service['suburl'] = $scope.services[service.id].service["url"];
        //console.log(service);
        var uid;
        //console.log($scope.ressources.length)
        for (var i = 0; i < $scope.ressources.length; i++) {
            ////console.log($scope.ressources[i].ressource.id, service.ressource);
            if ($scope.ressources[i].ressource.id == service.ressource) {
                uid = $scope.ressources[i].ressource.id;
                $scope.services[service.id].service.url = $scope.ressources[i].ressource.url;
                $scope.services[service.id].service.idRessource = $scope.ressources[i].ressource.id;
                break;
            }
        }
        //get the attribute from a REST
        var url = $scope.services[service.id].service.url + $scope.services[service.id].service.suburl;
        //console.log(url)
        $scope.services[service.id].service.attributes = [];
        $http.get(url).then(function (response) {

            var s = merge($scope.flatten(response.data[0]), $scope.flatten(response.data[1]));
            for (var i = 0; i < response.data.length; i++) {
                s = merge(s, $scope.flatten(response.data[i]));
            }
            for (var elem in s) {
                $scope.services[service.id].service.attributes.push(elem);
            }
        }, function (err) {
            ////console.log('Fail to Load REST WS : ' + url);
        });
        //console.log(service)
        $('#' + uid)
                .append($compile("<li id='li" + service.id + "'><a><span ng-click=drawService('" + service.id + "') >" +
                        service.name + "</span><i ng-click='deleteService(" + service.id + ")' class='fa fa-trash pull-right'></i><i ng-click='editService(" + service.id + ")' class='fa fa-pencil pull-right'></i></a></li>")($scope));
        //$scope.newState(ressource);

        $scope.service = {};
    }

    $scope.drawService = function (service) {
        //console.log(service)
        $scope.newState(service, 'default');
        let nb = $scope.stateObjects[$scope.stateObjects.length - 1].attributes.length;
        if (nb * 20 > $('#canvasbody').height()) {
            $('#canvas').height(nb * 25);
            $('#canvasbody').height(nb * 25);
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
        //console.log($scope.stat);
    }

    $scope.getBro = function (state) {
        if (state.name != 'join') {
            for (var i = 0; i < $scope.links.length; i++) {
                if ($scope.links[i].link.target.id == state.id) {
                    return $scope.links[i].link.source;
                }
            }
            return null;
        } else {
            let r = [{}, {}];
            for (var i = 0; i < $scope.links.length; i++) {
                if ($scope.links[i].link.target.id == state.id) {
                    if (angular.equals(r[0], {})) {
                        r[0] = $scope.links[i].link.source;
                    } else {
                        r[1] = $scope.links[i].link.source;
                        return r;
                    }
                }
            }
        }
    }

    $scope.generateStatistique = function (qr) {
        if ((r = $scope.getBro(qr)) == null) {
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
                }
                if (r.name == 'Pie') {
                    $scope.pieAttributes = [];
                    $scope.query.pieLabels = r.pieLabels;
                    $scope.query.pieData = r.pieData;
                }
                if (r.name == 'Line') {
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
                }
                $scope.query.operation.push({
                    'type': r.name,
                    'attributes': a,
                    'attributes2': b,
                    'operation': c
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

    $scope.generateStat = function (showmodal) {
        //console.log($scope.log)
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
        console.log($scope.query)
        let url1 = "", url2 = "";
        console.log( $scope.query.ressources[0])
        for (var elem in $scope.services) {
            if ($scope.services[elem].service.id == $scope.query.ressources[0].ressourceId) {
                url1 = $scope.services[elem].service.url + $scope.services[elem].service.suburl;
                $scope.attributes = $scope.services[elem].service.attributes;
                break;
            }
        }
        console.log(url1)
        if (typeof $scope.query.ressources[1] != 'undefined') {
            for (var elem in $scope.services) {
                if ($scope.services[elem].service.id == $scope.query.ressources[1].ressourceId) {
                    url2 = $scope.services[elem].service.url + $scope.services[elem].service.suburl;
                    $scope.attributes = $scope.services[elem].service.attributes;
                    break;
                }
            }
        }
        //console.log($scope.query)
        $http.get(url1).then(function (response) {
            if (response.data == null) {
                ////console.log('Fail to Load REST WS : ' + url1);
            }
            let data = [];
            let res = [];
            for (var i = 0; i < response.data.length; i++) {
                data[i] = $scope.flatten(response.data[i]);
            }
            res = data;
            if ($scope.query.ressources.length === 1) {
                $scope.getResult(res, null, showmodal);
            } else {
                $http.get(url2).then(function (response2) {
                    if (response.data == null) {
                        ////console.log('Fail to Load REST WS : ' + url2);
                    }
                    let data2 = [];
                    let res2 = [];
                    for (var i = 0; i < response2.data.length; i++) {
                        data2[i] = $scope.flatten(response2.data[i]);
                    }
                    res2 = data2;
                    $scope.getResult(res, res2, showmodal);
                    $scope.log = "\n" + $filter('date')(Date.now(), 'hh:mm:ss') + " Load from " + url2 + " successfully" + $scope.log;
                }, function (err) {
                    $scope.log = "\n" + $filter('date')(Date.now(), 'hh:mm:ss') + " Fail to Load REST WS : " + $scope.log;
                });
            }
            $scope.log = "\n" + $filter('date')(Date.now(), 'hh:mm:ss') + " Load from " + url1 + " successfully" + $scope.log;
        }, function (err) {
            $scope.log = "\n" + $filter('date')(Date.now(), 'hh:mm:ss') + " Fail to Load REST WS : " + $scope.log;
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

    $scope.getResult = function (res, res2, showmodal) {
        ////console.log("get result");
        $scope.statAttributes = [];
        let a = false;
        let joined = false;
        //the join condition first
        for (var i = 0; i < $scope.query.operation.length; i++) {
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
            }
        }
        // end join condition

        //the where condition second
        for (var i = 0; i < $scope.query.operation.length; i++) {
            if ($scope.query.operation[i].type === 'where') {
                //if(joined) //////console.log()
                for (var j = 0; j < $scope.query.operation[i].attributes.length; j++) {
                    //console.log(res);
                    res = where(res,
                            $scope.query.operation[i].attributes[j].attribute,
                            $scope.query.operation[i].attributes[j].op,
                            $scope.query.operation[i].attributes[j].value);
                }
            }
        }// end where condition
        //the select condition third
        for (var i = 0; i < $scope.query.operation.length; i++) {
            if ($scope.query.operation[i].type == 'select') {

                res = select(res, $scope.query.operation[i].attributes);
                var array = $.map($scope.query.operation[i].attributes, function (value) {
                    return [value];
                });
                if (joined) {
                    $scope.statAttributes = [];
                    for (var j = 0; j < array.length; j++) {
                        $scope.statAttributes.push(array[j].attribute);
                    }
                }
                a = true;
            }
        }// end select condition

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

        //})
        //////console.log(res);
    }
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
        $scope.legend;
        $scope.options = {
            legend: {
                labels: {
                    generateLabels: function (chart) {
                        $scope.legend = "<ul class='0-legend'>" +
                                ($(chart.generateLegend()).children()[0]).toString() +
                                ($(chart.generateLegend()).children()[1]).toString() +
                                ($(chart.generateLegend()).children()[2]).toString() +
                                ($(chart.generateLegend()).children()[3]).toString()
                                + "</ul>";
                        console.log($scope.legend)
                    }

                }
            }}
        console.log($scope.legend)
        //$scope.pieHTML = "<div style='position : absolute; height : 100%; width : 100%;'><canvas class='chart chart-pie' chart-data='dataPie' chart-labels='labelsPie'></canvas></div>";
        $scope.pieHTML = "<canvas style='display : block' height='40%' class='chart chart-pie' chart-data='dataPie' chart-labels='labelsPie' chart-options='options'></canvas>";
        console.log($scope.pieHTML)
    }

    $scope.generatePieCustomLegend = function (chart) {
        console.log($(chart))
        var legends = $("<ul class='0-legend'></ul>");
        legends.append($(chart).children()[0]);
        legends.append($(chart).children()[1]);
        legends.append($(chart).children()[2]);
        legends.append($(chart).children()[3]);

    }



    $scope.generateTable = function (res, showmodal) {
        ////console.log("generate table")
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
        $scope.tableHTML = $scope.createTableHtml();
    }

    $scope.generateBar = function (res, x, y, showmodal) {

        $scope.typeState = "bar";
        $scope.labelsBar = [];
        $scope.dataBar = [];
        if (showmodal)
            $scope.openModal('bar', 'null');
        for (var i = 0; i < res.length; i++) {
            ////////console.log(res[i]);
            for (var elem in res[i]) {
                if (elem == x) {
                    $scope.labelsBar.push(res[i][elem]);
                }
                if (elem == y) {
                    $scope.dataBar.push(res[i][elem]);
                }
            }
        }
        $scope.barHTML = "<div style='height : 80%; width : 80%'><canvas class='chart chart-bar' chart-data='dataBar' chart-labels='labelsBar'> </canvas></div>";
    }

    $scope.openModal = function(name, id) {
        if (id != 'null') {
            $scope.currentRessource = $scope.getRessource(id);
        }
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
     ////console.log(obj)
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
    //$scope.stateObjects = [];

    /*if(typeof $localStorage.stateObjects !== 'undefined'){
     $scope.stateObjects = $localStorage.stateObjects;
     }
     
     $scope.$watch('stateObjects', function(newVal, oldVal){
     $localStorage.stateObjects = $scope.stateObjects;
     }, true);
     
     
     if(typeof $localStorage.lastUUID === 'undefined'){
     $localStorage.lastUUID = 2000;
     }*/
    var getNextUUID = function () {
        $localStorage.lastUUID++;
        return $localStorage.lastUUID;
    }

    $scope.newState = function (state, type) {
        var id, name, attributes, typ, attributesv2;
        var idd = Date.now();
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
                'y': 500
            });
            $scope.resultState = $scope.stateObjects[$scope.stateObjects.length - 1];
            return;
        }
        if (type == 'default') {
            id = $scope.services[state].service.id;
            name = $scope.services[state].service.name;
            attributes = $scope.services[state].service.attributes;
            attributesv2 = $scope.services[state].service.attributes.map(function (obj) {
                return  $scope.services[state].service.name + ': ' + obj;
            });
            typ = 'r';
        } else if (type == 'condition' || type == 'where' || type == 'join') {
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
            'y': 500
        });
    };
    $scope.stateConnections = [];
    $scope.activeState = null;
    $scope.setActiveState = function (state) {
        $scope.activeState = state;
        ////////console.log(state);
        return state;
    };
    $scope.copyAttribute = function (attribute) {

        return attribute;
    }

    $scope.onConnection = function (instance, connection, targetUUID, sourceUUID) {
        let array = [];
        let c = 0;
        angular.forEach($scope.stateObjects, function (state) {
            //////console.log(state.type)
            if (typeof state.type === 'undefined') {
                array.push(c);
            }
            c++;
        });
        for (var j = 0; j < array.length; j++) {
            $scope.stateObjects.splice(array[j], 1);
        }

        //////console.log($scope.getState($rootScope.connections.source));
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

        let source = $scope.getState($rootScope.connections.source);
        let target = $scope.getState($rootScope.connections.target);

        $('#b' + target.idd).removeClass('disabled');
        //console.log(source, target)
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
                target.vattributes = source.vattributes;
            }

            if (target.name == 'join') {
                if (target.targets[0].uuid == targetUUID) {
                    target.rightAttributes = source.attributes;
                    target.rightRessource = source.name;
                } else {
                    target.leftAttributes = source.attributes;
                    target.leftRessource = source.name;
                }
            }
        }
        if (target.type == 's') {
            if (source.name == "where") {
                console.log(source)
                target.attributes = source.vattributes;
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
                ////console.log(target.barAttributes)
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
                if (source.name = 'where') {
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
                    //if(target.source.type != 'r')
                    //target.source = t;
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
                target.barAttributes = $scope.copyAttribute(target.source.Sattributes);
                target.pieAttributes = $scope.copyAttribute(target.source.Sattributes);
                target.lineAttributes = $scope.copyAttribute(target.source.Sattributes);
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
                $("#scrolling").css({
                    'overflow-y': 'scroll',
                    'position': 'fixed'});
            });
        });
    }

    $scope.init = function (id) {
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
                //console.log(data.services)
            });
        } else {
            $scope.dashboardName = 'New Statistique';
        }


    }

    $scope.index = [];
    $scope.removecond = function (id, index, type) {
        ////console.log(id, index, type)
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
                ////console.log(response.data);
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
        ////console.log(services);
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
            //////console.log(response.data);
            let sdata = angular.fromJson(response.data.data);
            $scope.stateObjects = sdata.stateObjects;
            $scope.links = sdata.links;
            $scope.ressources = sdata.ressources;
            let s = sdata.services;
            for (var i = 0; i < s.length; i++) {
                $scope.services[s[i].id] = s[i].data;
            }
            //////console.log($scope.stateObjects);
            $scope.generateStat(rep);
        });
    }

    $scope.new = 20;
    $scope.editer = function () {
        $scope.closeModal();
        $http.get('resources/d.json').then(function (response) {
            $scope.stateObjects = response.data.stateObjects;
            $scope.links = response.data.links;
            $scope.dashboardName = response.data.name;
            $scope.new = 0;
        });
    }
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
                    ////console.log(i);
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
                        ////console.log($scope.containes($scope.allUsers, obj, 'u'));
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
                ////console.log(obj)
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
                    //console.log($scope.allUsers[i], " : ", $scope.usersAndRoles[$scope.allUsers[i].username])
                    if ($scope.usersAndRoles[$scope.allUsers[i].username].indexOf(obj.roleName) !== -1) {

                        $scope.removedUsers.push({
                            role: obj.roleName,
                            user: $scope.allUsers[i]
                        })
                        indexes.push($scope.allUsers[i]);
                    }
                }
                ////console.log($scope.removedUsers);
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
        //////console.log(user);
        $scope.username = user;
        $scope.statistiques = {
            my: [],
            others: []
        }

        $http.get("/Dashboard/rest/statistique/available/" + $scope.username).then(function (response) {
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
            //console.log($scope.statistiques);
        });
    }
    $scope.detailStat = function (detail) {
        swal("Détail", detail);
    }
    var myLoop = function () {

        $timeout(function () {
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
            $scope.liD = 'li' + $scope.idexLoop;
            let li = $("<li id='li" + $scope.idexLoop + "' class='panel panel-default' style='overflow : auto;position : relative'>" +
                    "<div class='panel-heading'>" + $scope.stats[$scope.idexLoop].name + "</div></li>");
            $('#sortable').append(li);
            $timeout(function () {
                if (type == "Tableau") {

                    $('#' + $scope.liD).append($compile($scope.tableHTML)($scope));

                } else if (type == "Bar") {
                    //console.log($scope.barHTML)

                    $('#' + $scope.liD).append($compile($scope.barHTML)($scope));

                } else if (type == "Pie") {

                    //console.log($scope.pieHTML)
                    $('#' + $scope.liD).append($compile($scope.pieHTML)($scope));

                } else if (type == "Line") {
                    //console.log($scope.lineHTML)
                    $('#' + $scope.liD).append($compile($scope.lineHTML)($scope));

                }
            }, 650);
            $scope.idexLoop++;
            if ($scope.idexLoop < $scope.stats.length) {
                myLoop();
            }
        }, 800)
    }

    $scope.editDashboard = function (user, id) {
        $scope.username = user;
        $scope.initDashboard($scope.username)
        console.log($scope.username)
        $http.get('/Dashboard/rest/dashboards/' + id).then(function (response) {
            $scope.dashboardData = response.data.dashboard;
            for (var i = 0; i < response.data.stats.length; i++) {
                $scope.addStatToDashboard(response.data.stats[i])
            }
        })
    }

    $scope.consulterDashboard = function (id) {
        $http.get("/Dashboard/rest/dashboards/" + id).then(function (response) {
            if (response.data.stats.length > 0) {
                console.log(response.data)
                $scope.stats = response.data.stats;
                $scope.dashboard = response.data.dashboard;
                $scope.idexLoop = 0;
                myLoop();
            } else {
                swal("Vide !!", "Le dashboard ne contient aucune statistique !!", "warning");
            }
        });
    }

    $scope.preview = function (stat) {
        console.log(stat)
        $scope.getStat(stat, true);
    }

    $scope.deleteStatFromDashboard = function (id) {
        $scope.dashboard.splice(id, 1);
        //$('#d' + id).remove();
    }

    $scope.addStatToDashboard = function (stat) {

        $scope.dashboard.push(stat);
    }

    $scope.saveDashboard = function () {
        console.log($scope.dashboard)
        $scope.modalInstance = $uibModal.open({
            templateUrl: '/Dashboard/resources/partials/saveDashboard.html',
            scope: $scope
        });
    }
    $scope.editDashboardModal = function () {
        console.log($scope.dashboardData)
        $scope.modalInstance = $uibModal.open({
            templateUrl: '/Dashboard/resources/partials/editDashboard.html',
            scope: $scope
        });
    }

    $scope.editerDashboard = function () {

        let dashboardObj = {
            id: $scope.dashboardData.id,
            name: $scope.dashboardData.name,
            description: $scope.dashboardData.description,
            dateCreation: Date.now(),
            createdBy: $scope.username
        };
        console.log(dashboardObj)
        $http.post("/Dashboard/rest/dashboard/edit", dashboardObj).then(function (response) {
            $scope.log = "\n Dashboard modifier avec succées" + $scope.log;
            let share = {
                id_dashboard: $scope.dashboardData.id,
                profiles: $scope.profiles,
                users: $scope.users,
            };
            $http.post("/Dashboard/rest/dashboard/partage", share);
            for (var i = 0; i < $scope.dashboard.length; i++) {
                $scope.dashboardStatistiques.push($scope.dashboard[i].id + "")
            }
            let dashboardStats = {
                id_dashboard: $scope.dashboardData.id,
                statistiques: $scope.dashboardStatistiques
            };
            $http.post("/Dashboard/rest/dashboard/saveStat", dashboardStats).then(function () {
                $scope.log = "\n Dashboard partager avec succées" + $scope.log;
            });

        });
        $scope.closeModal();


    }

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
                    for (var i = 0; i < $scope.dashboard.length; i++) {
                        $scope.dashboardStatistiques.push($scope.dashboard[i].id + "")
                    }
                    let dashboardStats = {
                        id_dashboard: response.data,
                        statistiques: $scope.dashboardStatistiques
                    };
                    $http.post("/Dashboard/rest/dashboard/saveStat", dashboardStats).then(function () {
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
        //console.log($scope.statData)
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

