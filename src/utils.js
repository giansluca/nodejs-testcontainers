const _ = require("lodash");

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

const formatDate = (date) => {
    return [date.getFullYear(), _padTo2Digits(date.getMonth() + 1), _padTo2Digits(date.getDate())].join("-");
};

const _padTo2Digits = (num) => {
    return num.toString().padStart(2, "0");
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

module.exports = { sleep, formatDate, toSnakeCase };
