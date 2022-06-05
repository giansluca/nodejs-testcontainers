const _ = require("lodash");

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

const toSnakeCase = (obj) => {
    let result;
    if (_.isArray(obj)) {
        result = [];

        obj.forEach((item) => {
            if (_.isPlainObject(item) || _.isArray(item)) result.push(toSnakeCase(item));
            else result.push(item);
        });
    } else if (_.isPlainObject(obj)) {
        result = {};

        Object.keys(obj).forEach((key) => {
            const target = obj[key];
            if (_.isPlainObject(target) || _.isArray(target)) {
                result[_.snakeCase(key)] = toSnakeCase(target, result);
            } else {
                result[_.snakeCase(key)] = target;
            }
        });
    } else throw new Error("It should never gets here!");

    return result;
};

module.exports = { sleep, toSnakeCase };
