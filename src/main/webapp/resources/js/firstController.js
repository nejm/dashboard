myApp.factory('Stat', function ($resource) {
    return $resource("/Dashboard/rest/statistique/:id", {
        update: {
            method: 'PUT'
        }
    });
})
        .controller('FirstExampleController', function ($rootScope, $scope, $http, $localStorage, $uibModal, $compile, Stat) {
            $scope.allUsers = [];
            $scope.myStats = [];
            $scope.allProfiles = [];
            $scope.edit = false;
            $scope.statistique = new Stat();
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
                $scope.ressources.push({
                    'ressource': ressource
                });
                $scope.ressource = {};
                $scope.closeModal();
            };
            $scope.addExistingService = function (service, resource) {
                $('#' + resource.ressource.id)
                        .append($compile("<li><a ng-click=drawService('" + service.service.id + "')>" +
                                service.service.name + "<i class='fa fa-clone pull-right'></i></a></li>")($scope));
            }

            $scope.addService = function (service, res) {
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
                    console.log('Fail to Load REST WS : ' + url);
                });
                var nom = service.name;
                $('#' + uid)
                        .append($compile("<li><a ng-click=drawService('" + service.id + "')>" +
                                service.name + "<i class='fa fa-clone pull-right'></i></a></li>")($scope));
                //$scope.newState(ressource);
                $scope.service = {};
                $scope.closeModal();
            }

            $scope.drawService = function (service) {
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
                }
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
                var t = {};
                for (var i = 0; i < $scope.stateObjects.length; i++) {
                    if ($scope.stateObjects[i].id == 0) {
                        t = $scope.stateObjects[i];
                        break;
                    }
                }
                //console.log($scope.getBro(t));

                $scope.query = {};
                $scope.query.operation = [];
                $scope.query.ressources = [];
                $scope.generateStatistique(t);
                let url1 = "", url2 = "";
                for (var elem in $scope.services) {
                    if ($scope.services[elem].service.id == $scope.query.ressources[0].ressourceId) {
                        url1 = $scope.services[elem].service.url + $scope.services[elem].service.suburl;
                        $scope.attributes = $scope.services[elem].service.attributes;
                        break;
                    }
                }
                if (typeof $scope.query.ressources[1] != 'undefined') {
                    for (var elem in $scope.services) {
                        if ($scope.services[elem].service.id == $scope.query.ressources[1].ressourceId) {
                            url2 = $scope.services[elem].service.url + $scope.services[elem].service.suburl;
                            $scope.attributes = $scope.services[elem].service.attributes;
                            break;
                        }
                    }
                }
                //$scope.getResult(url1, url2);
                $http.get(url1).then(function (response) {
                    if (response.data == null) {
                        console.log('Fail to Load REST WS : ' + url1);
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
                                console.log('Fail to Load REST WS : ' + url2);
                            }
                            let data2 = [];
                            let res2 = [];
                            for (var i = 0; i < response2.data.length; i++) {
                                data2[i] = $scope.flatten(response2.data[i]);
                            }
                            res2 = data2;
                            $scope.getResult(res, res2, showmodala);
                        }, function (err) {
                            $scope.log = 'Fail to Load REST WS : ' + url2;
                        });
                    }
                }, function (err) {
                    $scope.log = 'Fail to Load REST WS : ' + url1;
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
                        //if(joined) //console.log()
                        for (var j = 0; j < $scope.query.operation[i].attributes.length; j++) {
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
                }
                //})
                //console.log(res);
            }

            $scope.generateTable = function (res, showmodal) {

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
                //waitingDialog.close();
            }

            $scope.generateBar = function (res, x, y, showmodal) {
                $scope.labelsBar = [];
                $scope.dataBar = [];
                if (showmodal)
                    $scope.openModal('bar', 'null');
                for (var i = 0; i < res.length; i++) {
                    ////console.log(res[i]);
                    for (var elem in res[i]) {
                        if (elem == x) {
                            $scope.labelsBar.push(res[i][elem]);
                        }
                        if (elem == y) {
                            $scope.dataBar.push(res[i][elem]);
                        }
                    }
                }

                //waitingDialog.close();
            }

            $scope.openModal = function (name, id) {
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
             console.log(obj)
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
                        'name': "RÃ©sultat",
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
                } else if (type == 'stat' || type == 'bar') {
                    ////console.log(type);
                    id = state;
                    name = $scope.stat.name;
                    attributes = [];
                    typ = 's'
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
                ////console.log(state);
                return state;
            };
            $scope.copyAttribute = function (attribute) {

                return attribute;
            }

            $scope.onConnection = function (instance, connection, targetUUID, sourceUUID) {
                let array = [];
                let c = 0;
                angular.forEach($scope.stateObjects, function (state) {
                    //console.log(state.type)
                    if (typeof state.type === 'undefined') {
                        array.push(c);
                    }
                    c++;
                });
                for (var j = 0; j < array.length; j++) {
                    $scope.stateObjects.splice(array[j], 1);
                }

                //console.log($scope.getState($rootScope.connections.source));
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
                        target.vattributes = array.concat(array2)
                        target.attributes = source.leftAttributes.concat(source.rightAttributes);
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

                    target.attributes = $scope.copyAttribute(source.attributes);
                }
                let t = target;
                let f = false;
                let g = false;
                if (target.type == 's' && target.name == 'Bar') {
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
                        target.barAttributes = array.concat(array2)
                        console.log(target.barAttributes)
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
                        target.source = t;
                        target.barAttributes = [];
                        for (var i = 0; i < target.source.attributes.length; i++) {
                            if (target.source.attributes[i] !== null)
                                target.barAttributes[i] = {
                                    attribute: target.source.attributes[i]
                                }
                        }
                    } else if (!g) {
                        target.barAttributes = $scope.copyAttribute(target.source.Sattributes);
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
            $scope.init = function (id) {

                $http.get("/Dashboard/rest/roles").then(function (response) {
                    $scope.allProfiles = response.data;
                    console.log($scope.allProfiles);
                });
                $http.get("/Dashboard/rest/users").then(function (response) {
                    $scope.allUsers = response.data;
                    console.log($scope.allUsers);
                });

                $http.get("/Dashboard/rest/rolesanduser").then(function (response) {
                    $scope.usersAndRoles = response.data;
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
                        $scope.ressources = data.ressources;
                        $scope.links = data.links;
                        let s = data.services;
                        setTimeout(function () {
                            for (var i = 0; i < $scope.ressources.length; i++) {
                                console.log($scope.ressources[i])
                                for (var j = 0; j < s.length; j++) {
                                    $scope.services[s[j].id] = s[j].data;
                                    console.log(s[j]);
                                    $scope.addExistingService($scope.services[s[j].id], $scope.ressources[i]);
                                }
                            }
                        }, 500);
                    });
                } else {
                    $scope.dashboardName = 'New Statistique';
                    $scope.statistique.name = 'New Statistique';
                    var res = {
                        'id': 'r1',
                        'name': 'server',
                        'url': 'https://jsonplaceholder.typicode.com/'
                    };
                    $scope.addRessource(res);
                    var service = {
                        'idRessource': 'r1',
                        'id': 's11',
                        'name': 'posts',
                        'url': 'https://jsonplaceholder.typicode.com/',
                        'suburl': 'posts'
                    };
                    var service2 = {
                        'idRessource': 'r1',
                        'id': 's12',
                        'name': 'users',
                        'url': 'https://jsonplaceholder.typicode.com/',
                        'suburl': 'users'
                    };
                    setTimeout(function () {
                        $scope.addService(service, res);
                        $scope.addService(service2, res);
                    }, 500);
                }


            }

            $scope.index = [];
            $scope.removecond = function (id, index, type) {
                console.log(id, index, type)
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
                        console.log(response.data);
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
                let services = [];
                let i = 0;
                for (var elem in $scope.services) {
                    services.push({
                        id: elem,
                        data: $scope.services[elem]
                    });
                }
                console.log(services);
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
                    //console.log(response.data);
                    let sdata = angular.fromJson(response.data.data);
                    $scope.stateObjects = sdata.stateObjects;
                    $scope.links = sdata.links;
                    $scope.ressources = sdata.ressources;
                    let s = sdata.services;
                    for (var i = 0; i < s.length; i++) {
                        $scope.services[s[i].id] = s[i].data;
                    }
                    console.log($scope.stateObjects);
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

            $scope.removeUser = function (u, type) {
                if (type == 'u')
                    $scope.users.splice($scope.users.indexOf(u), 1);
                else
                    $scope.profiles.splice($scope.profiles.indexOf(u), 1);
            }

            $scope.users = [];
            $scope.profiles = [];
            $scope.user = "";
            $scope.profile = "";
            $scope.addUser = function (type, obj) {
                if (obj != "")
                    if (type === 'u') {
                        if ($scope.users.indexOf(obj) == -1) {
                            if ($scope.profiles.length == 0) {
                                $scope.users.push(obj);
                                $scope.allUsers.splice($scope.allUsers.indexOf(obj),1);
                            } else {
                                let found = false
                                let u = $scope.usersAndRoles[obj];
                                for (p in $scope.profiles) {
                                    if (u.indexOf("ROLE_" + $scope.profiles[p]) != -1) {
                                        found = true;
                                    }
                                }
                                if (!found) {
                                    $scope.users.push(obj);
                                } else {
                                    swal("Error", "Déja partagé avec cet utilisateur !", "error");
                                }
                            }

                        }
                    } else if ($scope.profiles.indexOf(obj) == -1) {
                        $scope.profiles.push(obj);
                    }
            }

            /** dashboard methods **/

            $scope.dashboardStatistiques = {};
            $scope.dashboard = [];

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
                console.log(user);
                $scope.username = user;
                $scope.statistiques = {
                    my: [
                        "a", "b"
                    ],
                    other: [
                        {name: "Name 1",
                            data: ["c", "d"]},
                        {name: "Name 2",
                            data: ["e", "f"]}
                    ]

                }
            }

            $scope.preview = function (stat) {
                $scope.getStat("11", true);
            }

            $scope.addStatToDashboard = function (stat) {

                //if($scope.dashboard.length > 4) return;
                $scope.dashboard.push(stat);
                var container = $("<li class='ui-state-default' id='d'" + $scope.dashboard.length + "></li>")
                var text = $("<div id=" + stat + "></div>");
                let img = "<img src='/Dashboard/resources/images/lines.png' style='float : left; height : 20%; opacity : 0.2' />";
                text.append(img);
                let preview = $("<div style='margin-top : 50px'></div>").append("<button ng-click=\"preview('" + stat + "')\" class='btn btn-primary'>Preview " + stat + "</button>");
                //let name = $("<div></div>").text("Name");
                text.append(preview);
                container.append(text);
                $('#sortable').append($compile(container)($scope));
            }

            $scope.saveDashboard = function () {

                $scope.modalInstance = $uibModal.open({
                    templateUrl: '/Dashboard/resources/partials/saveDashboard.html',
                    scope: $scope
                });
            }

            $scope.exporteDashboard = function () {

                $('#sortable li').each(function (index) {
                    console.log(this.id, " : ", $('#' + this.id + " div").attr('id'));
                });

                let dashboardObj = {
                    name: $scope.dashboard.name,
                    description: $scope.dashboard.description,
                    dateCreation: Date.now(),
                    createdBy: $scope.username
                };

                console.log(dashboardObj);
                //$http.post("/Dashboard/rest/dashboard/save",dashboardObj).then(function(response){
                //  console.log(response.data);
                //})
            }

        });
