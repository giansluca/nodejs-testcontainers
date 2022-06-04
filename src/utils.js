const _ = require("lodash");

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

const toSnakeCase = (obj) => {
    const result = {};
    Object.keys(obj).forEach((key) => {
        const target = obj[key];

        if (_.isArray(target)) {
            const newArray = [];

            target.forEach((item) => {
                if (_.isPlainObject(item)) newArray.push(toSnakeCase(item));
                else newArray.push(item);
            });

            result[_.snakeCase(key)] = newArray;
        } else if (_.isPlainObject(target)) {
            result[_.snakeCase(key)] = toSnakeCase(target, result);
        } else {
            result[_.snakeCase(key)] = target;
        }
    });

    return result;
};

module.exports = { sleep, toSnakeCase };
