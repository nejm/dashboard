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

select = function (json, fields) {
    var result = [];
    if (fields == null || fields.length == 0) {
        result = json;
        return result;
    }

    var array = $.map(fields, function (value, index) {
        return [value];
    });
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
    for (var i = 0; i < array.length; i++) {

        if (typeof array[i].op == 'undefined') {
            var field = array[i].attribute;
            //console.log(field);
        }
        if (array[i].op == 'SUM') {
            result = sum(result, array[i].attribute, field).result;
            //console.log(result);
        }
        if (array[i].op == 'AVG') {
            result = avg(result, array[i].attribute, field);
        }
        if (array[i].op == 'MIN') {
            return min(result, array[i].attribute);
        }
        if (array[i].op == 'MAX') {
            return max(result, array[i].attribute);
        }
    }
    return result;
}

sum = function (json, fieldon, field) {
    var res = {
        res: [],
        count: [],
        result: []
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
                res.res[j][fieldon] += json[i][fieldon];
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
        res.result[i][fieldon] = res.res[i][fieldon];
    }
    return res;
}
avg = function (json, fieldon, field) {
    var result = sum(json, fieldon, field).result;
    var count = sum(json, fieldon, field).count;
    for (var i = 0; i < result.length; i++) {
        result[i][fieldon] = result[i][fieldon] / count[i];
    }
    return result;
}

min = function (json, field) {
    var res = {};
    res = json[0];
    for (var i = 1; i < json.length; i++) {
        if (json[i][field] < res[field])
            res = json[i];
    }
    return res;
}

max = function (json, field) {
    var res = {};
    res = json[0];
    for (var i = 1; i < json.length; i++) {
        if (json[i][field] > res[field]) {
            res = json[i];
        }
    }
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
        case null:
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

joining = function (obj1, obj2, fields1, fields2, operation) {
    for (var i = 0; i < fields1.length; i++) {
        if (operation[i] === '=') {
            if (!(obj1[fields1[i]] === obj2[fields2[i]]))
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
            if (!(obj1[fields1[i]] !== obj2[fields2[i]]))
            {
                return false;
            }
        }
    }
    let a ={};
    for(let v in obj1){
        a[v] = obj1[v];
    }
    for(let v in obj2){
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
/*
var x = [{a: 1, b: 2},{a: 2, b: 3}]
var y = [{c: 0, d: 2},{c: 50, d: 2}]
console.log(join(x,y,['a'],['c'],['>']))
*/