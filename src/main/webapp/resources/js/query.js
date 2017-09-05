
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
    console.log("selection")
    var t = [];
    for (var i = 0; i < fields.length; i++) {
        if (typeof fields[i].deleted == 'undefined') {
            t.push(fields[i]);
        }
    }
    fields = t;
    console.log("select fields", t);
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
    var attributesOn = [];
    console.log("array", array);
    for (var i = 0; i < array.length; i++) {
        if (typeof array[i].op == 'undefined' || array[i].op == 'distinct' || (array[i].op == "" && typeof array[i].deleted == 'undefined')) {
            attributesOn.push(array[i].attribute);
        }
    }

    var sumattr = [];
    var avgattr = [];
    var distinctattr = [];
    for (var i = 0; i < array.length; i++) {
        if (array[i].op == 'sum') {
            sumattr.push(array[i].attribute);
        } else if (array[i].op == 'avg') {
            avgattr.push(array[i].attribute);
        } else if (array[i].op == 'min') {
            result = min(result, array[i].attribute, field);
        } else if (array[i].op == 'max') {
            result = max(result, array[i].attribute, field);
        } else if (array[i].op == 'distinct') {
            distinctattr.push(array[i].attribute)
        }
    }
    if (distinctattr.length > 0)
        result = distinct(result, distinctattr);
    console.log("query distinct", result)
    if (sumattr.length > 0)
        result = sumGroup(result, attributesOn, sumattr).data;
    console.log("query sum", attributesOn)
    if (avgattr.length > 0)
        result = avg(result, attributesOn, avgattr);

    return result;
}

normilize = function (json, attributes) {
    var res = [];
    for (var i = 0; i < json.length; i++) {
        res[i] = {};
        for (var j = 0; j < attributes.length; j++) {
            if (json[i][attributes[j]] != null) {
                res[i][attributes[j]] = json[i][attributes[j]];
            } else {
                res[i][attributes[j]] = "-";
            }
        }

    }
    return res;
}

standirize = function (json, attrs, attrs2) {
    var res = [];
    for (var i = 0; i < json.length; i++) {
        var obj = json[i];
        for (var j = 0; j < attrs.length; j++) {
            if (obj[attrs[j]] == "-") {
                obj[attrs[j]] = obj[attrs2[j]];
            }
        }
        res.push(obj);
    }

    res.forEach(function (v) {
        for (var i = 0; i < attrs2.length; i++)
            delete v[attrs2[i]]
    });
    console.log("end standirize", res)
    return res;
}

function removeEmptyElem(ary) {
    for (var i = ary.length - 1; i >= 0; i--) {
        if (ary[i] == "") {
            ary.splice(i, 1);
        }
    }
    return ary;
}

union = function (json1, json2, attrs, attrs2, unionAttr) {
    console.log("union", attrs, attrs2);
    var result = {};
    var els = [];
    /** get the attributes **/
    for (var elm in json1[0])
        els.push(elm);
    for (var elm in json2[0])
        els.push(elm);

    var att = removeEmptyElem(els);
    var res = json1;
    res = res.concat(json2);
    console.log("before any chinanagon", res)
    result.result = normilize(res, att);
    console.log("normilize any chinanagon", result.result)
    result.result = standirize(result.result, attrs, attrs2);
    console.log("standirize any chinanagon", result.result)
    result.attributes = att;
    console.log("after any chinanagon", result.result, att)
    return result;
}

conditionIsTrue = function (values1, values2, attributes) {
    for (var i = 0; i < attributes.length; i++) {
        if (values1[attributes[i]] != values2[attributes[i]])
            return false;
    }
    return true;
}

sumGroup = function (json, attributes, sumattr) {
    console.log("sumGroup", json, attributes, sumattr)
    var data = [];
    data[0] = {};
    var count = [];
    var cc = 0;
    var found = false;
    for (var i = 0; i < attributes.length; i++) {
        data[0][attributes[i]] = json[0][attributes[i]];
    }
    for (var i = 0; i < sumattr.length; i++) {
        data[0]["sum." + sumattr[i]] = json[0][sumattr[i]];
    }

    count[0] = 1;

    for (var i = 1; i < json.length; i++) {
        found = false;
        for (var j = 0; j < data.length; j++) {
            if (conditionIsTrue(json[i], data[j], attributes)) {
                found = true;
                count[j]++;
                for (var l = 0; l < sumattr.length; l++) {
                    data[j]["sum." + sumattr[l]] = Number(data[j]["sum." + sumattr[l]]) + Number(json[i][sumattr[l]]);
                }
            }
            cc = j + 1;
        }

        if (!found) {
            data[cc] = {};
            count[cc] = 1;
            for (var m = 0; m < attributes.length; m++) {
                data[cc][attributes[m]] = json[i][attributes[m]];
            }
            for (var n = 0; n < sumattr.length; n++) {
                data[cc]["sum." + sumattr[n]] = json[i][sumattr[n]];
            }
        }
    }
    console.log("sumGroup result", data);
    return {data: data, count: count};
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
                res.res[j][fieldon] = Number(Number(res.res[j][fieldon]) + Number(json[i][fieldon]));
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
    console.log(res);
    return res;
}


avg = function (json, attributes, avgattributes) {
    console.log("calc", attributes, avgattributes);
    var result = sumGroup(json, attributes, avgattributes).data;
    var count = sumGroup(json, attributes, avgattributes).count;
    var newRes = [];
    console.log("avg", result)
    for (var i = 0; i < result.length; i++) {
        newRes[i] = {};
        if (attributes.length > 0) {
            for (var j = 0; j < attributes.length; j++) {
                for (var elem in result[i]) {
                    console.log("comparaison", elem, avgattributes[j])
                    if (elem == "sum." + avgattributes[j]) {
                        newRes[i]["avg." + avgattributes[j]] = result[i][elem] / count[i];
                        console.log("calc", newRes[i]);
                    } else {
                        newRes[i][elem] = result[i][elem];
                    }
                }

            }
        } else {
            for (var j = 0; j < avgattributes.length; j++) {

                for (var elem in result[i]) {
                    console.log("comparaison", elem, avgattributes[j])
                    if (elem == "sum." + avgattributes[j]) {
                        newRes[i]["avg." + avgattributes[j]] = result[i][elem] / count[i];
                        console.log("calc", newRes[i]);
                    } else {
                        newRes[i][elem] = result[i][elem];
                    }
                }
            }
        }

    }
    console.log("avg res", newRes);
    return newRes;
}

areDistinct = function (obj1, obj2, fields) {
    for (var i = 0; i < fields.length; i++) {
        if (obj1[fields[i]] != obj2[fields[i]])
            return true;
    }

    return false;
}

distinct = function (json, fields) {
    var res = [];

    for (var i = 0; i < json.length; i++) {
        var found = true;
        for (var j = 0; j < res.length; j++) {
            found = areDistinct(res[j], json[i], fields);
            if (!found)
                break;
        }
        if (found) {
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
    console.log("max", json, aux, field)
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
            let el = {};
            for (var elem in json[i]) {
                if (elem == field) {
                    el["max." + elem] = json[i][elem];
                } else {
                    el[elem] = json[i][elem];
                }

            }
            res.push(el);
        }
    }
    //console.log(res)
    return res;
}

where = function (json, attr, operator, value) {
    console.log(attr)
    var res = [];
    var at = [];
    if (attr === null)
        return json;
    console.log("aahhhnnnn", json,attr, operator, value);
    switch (operator) {
        case '>':
            for (var i = 0; i < json.length; i++) {
                if (isNaN(json[i][attr]) && isNaN(json[i][attr])) {
                    if (isValidDate(value) != null) {
                        if (Date.parse(json[i][attr]) > Date.parse(value)) {
                            res.push(json[i]);
                        }
                    } else
                    if (json[i][attr] > value) {
                        res.push(json[i]);
                    }
                } else
                {
                    if (Number(json[i][attr]) > Number(value)) {
                        res.push(json[i]);
                    }
                }
            }
            break;
        case '<':
            for (var i = 0; i < json.length; i++) {
                if (isValidDate(value) != null) {
                    if (Date.parse(json[i][attr]) < Date.parse(value)) {
                        res.push(json[i]);
                    }
                } else
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
    console.log("after where",res)
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
                console.log(json[i][attr], " ? > ", json[i][attr2], json[i][attr] > json[i][attr2]);
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
    var f1, f2;
    for (var i = 0; i < fields1.length; i++) {
        f1 = fields1[i].substring(fields1[i].indexOf(':') + 2);
        f2 = fields2[i].substring(fields2[i].indexOf(':') + 2);
        if (operation[i] == '=') {
            if (!(obj1[f1] == obj2[f2]))
            {
                return false;
            }
        } else if (operation[i] == '>') {
            if (!(obj1[f1] > obj2[f2]))
            {
                return false;
            }
        } else if (operation[i] == '<') {
            if (!(obj1[f1] < obj2[f2]))
            {
                return false;
            }
        } else if (operation[i] == '!=') {
            if (!(obj1[f1] != obj2[f2]))
            {
                return false;
            }
        }
    }
    console.log("nenenneenenen", obj1, obj2, fields1, fields2, operation)
    let a = {};
    var tableName1 = fields1[0].substring(0, fields1[0].indexOf(':'));
    var tableName2 = fields2[0].substring(0, fields2[0].indexOf(':'));
    for (let v in obj1) {
        a[tableName1 + ': ' + v] = obj1[v];
    }
    for (let v in obj2) {
        a[tableName2 + ': ' + v] = obj2[v];
    }
    return a;
}

join = function (json1, json2, fields1, fields2, operations) {
    console.log("jointure operation", fields1, fields2);
    var result = [];
    var joined;
    var auxJson1 = json1;
    var auxJson2 = json2;
    let a;
    for (var i = 0; i < json1.length; i++) {
        joined = false;
        for (var j = 0; j < json2.length; j++) {
            if ((a = joining(json1[i], json2[j], fields1, fields2, operations)) != false) {
                joined = true;
                result.push(a);
            }

        }

    }
    console.log("jointure operation", result)
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

function isValidDate(str) {
    var dateReg = /^\d{2}[./-]\d{2}[./-]\d{4}$/;
    return str.match(dateReg);
}

sortTableR = function (obj1, obj2, values) {
    var response = [];
    for (var i = 0; i < values.value.length; i++) {
        if (parseFloat(obj1[values.value[i]]) - parseFloat(obj2[values.value[i]]) > 0) {
            if (values.op[i] == 'asc')
                response[i] = 1;
            else
                response[i] = -1;

        } else if (parseFloat(obj1[values.value[i]]) - parseFloat(obj2[values.value[i]]) < 0) {
            if (values.op[i] == 'desc')
                response[i] = 1;
            else
                response[i] = -1;
        } else {
            response[i] = 0;
        }
        console.log("qqqqqqqqq", parseFloat(obj1[values.value[i]]), parseFloat(obj2[values.value[i]]), response[i]);
    }
    return response;
}

orderBy = function (json, values) {

    if (values.value.length == 0)
        return json;
    var data = json.sort(function (a, b) {
        return eval(a[values.value[0]]) - eval(b[values.value[0]]);
    });

    console.log("sorted data", data);
    return data;
}

