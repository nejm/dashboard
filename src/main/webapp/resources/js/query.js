
/**
 * jointure de la structure (conception)
 * @param {source de données 1 JSON} obj1
 * @param {source de données 2 JSON} obj2
 * @returns {Array} Structure unifiée
 */
var merge = function (obj1, obj2) {
    var struct = [];
    struct = obj1;
    for (var elem in obj2) {
        if (!(elem in struct)) {
            struct[elem] = obj2[elem];
        }
    }
    return struct;
}
/**
 * Sélection
 * @param {JSON} json
 * @param {ARRAY} fields (selected fields)
 * @returns {Array} Projection
 */
select = function (json, fields) {
    var result = [];
    if (fields == null || fields.length == 0) {
        result = json;
        return result;
        //Ajouter contrôle
    }

    var array = $.map(fields, function (value, index) {
        return [value];
    });

    //console.log(array)
    for (var i = 0; i < json.length; i++) {
        result[i] = {};
        for (var elem in json[i]) {
            for (var j = 0; j < array.length; j++) {
                if (elem == array[j].attribute) {
                    result[i][elem] = json[i][elem];
                    break;
                }
            }
        }
    }
    var field = "";
    for (var i = 0; i < array.length; i++) {
        //console.log(array[i].op);
        if (typeof array[i].op == 'undefined') {
            field = array[i].attribute;
        } else if (array[i].op == 'sum') {
            result = sum(result, array[i].attribute, field).result;
        } else if (array[i].op == 'avg') {
            result = avg(result, array[i].attribute, field);
        } else if (array[i].op == 'min') {
            result = min(result, array[i].attribute, field);
        } else if (array[i].op == 'max') {
            result = max(result, array[i].attribute, field);
        } else if (array[i].op == 'distinct') {
            result = distinct(result, array[i].attribute);
        }
    }
    //console.log(result)
    return result;
}

sum = function (json, fieldon, field) {
    var res = {
        res: [],
        count: [],
        result: [],
        result2: []
    };
    var found = false;
    for (var i = 0; i < json.length; i++) {
        res.count[i] = 0;
    }
    res.res.push(json[0]);
    
    res.count[0] = 1;
    for (var i = 1; i < json.length; i++) {
        found = false;
        for (var j = 0; j < res.res.length; j++) {
            if (res.res[j][field] == json[i][field]) {
                res.res[j][fieldon] = Number(Number(res.res[j][fieldon])+Number(json[i][fieldon]));
                res.count[j]++;
                found = true;
                break;
            }
        }
        if (!found) {
            res.res.push(json[i]);
            res.count[j] = 1;
        }
    }
    for (var i = 0; i < res.res.length; i++) {
        res.result[i] = {};
        res.result[i][field] = res.res[i][field];
        res.result[i]["sum." + fieldon] = res.res[i][fieldon];
        res.result2[i] = {};
        res.result2[i][field] = res.res[i][field];
        res.result2[i][fieldon] = res.res[i][fieldon];
    }
    //console.log(res);
    return res;
}

sumAll = function (json, fieldon) {
    var res = {
        res: 0,
        count: json.length,
    };
    
    for (var i = 0; i < json.length; i++) {
        res.res += json[i][fieldon];
    }
    //console.log(res);
    return res;
}

avg = function (json, fieldon, field) {
    var result = sum(json, fieldon, field).result2;
    var count = sum(json, fieldon, field).count;
    var newRes = [];
    for (var i = 0; i < result.length; i++) {
        newRes[i] = {};
        for (elem in result[i]) {
            if (elem == fieldon) {
                newRes[i]["avg." + elem] = result[i][elem] / count[i];
            } else {
                newRes[i][elem] = result[i][elem];
            }
        }

    }
    return newRes;
}

distinct = function (json, field) {
    var res = [];
    console.log(field)
    for (var i = 0; i < json.length; i++) {
        var found = false;
        for (var j = 0; j < res.length; j++) {
            if (res[j][field] == json[i][field]) {
                found = true;
                break;
            }
        }
        if (!found) {
            res.push(json[i]);
        }
    }
    return res;
}
min = function (json, field, aux) {
    var res = [];
    for (var i = 0; i < json.length; i++) {
        var found = false;
        var position = -1;
        for (var j = 0; j < res.length; j++) {
            if (res[j][aux] == json[i][aux]) {
                found = true;
                if (eval(res[j][field]) > eval(json[i][field])) {
                    for (elem in json[i]) {
                        if (elem == aux) {
                            res[j]["min." + elem] = json[i][elem];
                        } else {
                            res[j][elem] = json[i][elem];
                        }

                    }
                }

            }
        }
        if (!found) {
            let el = {};
            for (elem in json[i]) {
                if (elem == field) {
                    el["min." + elem] = json[i][elem];
                } else {
                    el[elem] = json[i][elem];
                }

            }
            res.push(el);
        }
    }
    let res2 = [];
    console.log(res)
    return res;
}


max = function (json, field, aux) {
    var res = [];
    for (var i = 0; i < json.length; i++) {
        var found = false;
        var position = -1;
        for (var j = 0; j < res.length; j++) {
            if (res[j][aux] == json[i][aux]) {
                found = true;
                if (eval(res[j][field]) < eval(json[i][field]))
                    res[j] = json[i];
            }
        }
        if (!found) {
            res.push(json[i]);
        }
    }
    //console.log(res)
    return res;
}

where = function (json, attr, operator, value) {
    var res = [];
    if (attr === null)
        return json;
    //console.log(attr, operator, value);
    switch (operator) {
        case '>':
            for (var i = 0; i < json.length; i++) {
                if (json[i][attr] > value) {
                    res.push(json[i]);
                }
            }
            break;
        case '<':
            for (var i = 0; i < json.length; i++) {
                if (json[i][attr] < value) {
                    res.push(json[i]);
                }
            }
            break;
        case '=':
            for (var i = 0; i < json.length; i++) {
                if (json[i][attr] == value) {
                    res.push(json[i]);
                }
            }
            break;
        case '!=':
            for (var i = 0; i < json.length; i++) {
                if (json[i][attr] != value) {
                    res.push(json[i]);
                }
            }
            break;
        case 'null':
            for (var i = 0; i < json.length; i++) {
                if (json[i][attr] == null) {
                    res.push(json[i]);
                }
            }
            break;
        case 'not null':
            for (var i = 0; i < json.length; i++) {
                if (json[i][attr] != null) {
                    res.push(json[i]);
                }
            }
            break;
    }

    return res;
}

where2 = function (json, attr, operator, attr2) {
    console.log(operator)
    var res = [];
    if (attr === null)
        return json;
    switch (operator) {
        case '>':
            for (var i = 0; i < json.length; i++) {
                console.log(json[i][attr] , " ? > " , json[i][attr2],json[i][attr] > json[i][attr2]);
                if (json[i][attr] > json[i][attr2]) {
                    res.push(json[i]);
                }
            }
            break;
        case '<':
            for (var i = 0; i < json.length; i++) {
                if (json[i][attr] < json[i][attr2]) {
                    res.push(json[i]);
                }
            }
            break;
        case '=':
            for (var i = 0; i < json.length; i++) {
                if (json[i][attr] == json[i][attr2]) {
                    res.push(json[i]);
                }
            }
            break;
        case '!=':
            for (var i = 0; i < json.length; i++) {
                if (json[i][attr] != json[i][attr2]) {
                    res.push(json[i]);
                }
            }
            break;
    }

    return res;
}

joining = function (obj1, obj2, fields1, fields2, operation) {
    for (var i = 0; i < fields1.length; i++) {
        if (operation[i] === '=') {
            if (!(obj1[fields1[i]] == obj2[fields2[i]]))
            {
                return false;
            }
        }
        if (operation[i] === '>') {
            if (!(obj1[fields1[i]] > obj2[fields2[i]]))
            {
                return false;
            }
        }
        if (operation[i] === '<') {
            if (!(obj1[fields1[i]] < obj2[fields2[i]]))
            {
                return false;
            }
        }
        if (operation[i] === '!=') {
            if (!(obj1[fields1[i]] != obj2[fields2[i]]))
            {
                return false;
            }
        }
    }
    let a = {};
    for (let v in obj1) {
        a[v] = obj1[v];
    }
    for (let v in obj2) {
        a[v] = obj2[v];
    }
    return a;
}

join = function (json1, json2, fields1, fields2, operations) {
    var result = [];
    let a;
    for (var i = 0; i < json1.length; i++) {
        for (var j = 0; j < json2.length; j++) {
            if ((a = joining(json1[i], json2[j], fields1, fields2, operations)) != false) {
                result.push(a);
            }
        }
    }
    //console.log(result)
    return result;
}


verifyAttributes = function (res, fieldon, type) {
    var result = [];
    for (var elem in res) {
        //console.log(elem," ?= ",fieldon)
        if (elem == fieldon)
            result[type + '.' + elem] = res[elem];
        else
            result[elem] = res[elem];
    }

    return result;
}
/*
 var x = [{a: 1, b: 2},{a: 2, b: 3}]
 var y = [{c: 0, d: 2},{c: 50, d: 2}]
 console.log(join(x,y,['a'],['c'],['>']))
 */