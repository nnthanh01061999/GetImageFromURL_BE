const lodash = require('lodash');

const verifyParams = (query, key) =>{
    return lodash.pick(query, key, undefined)
}

module.exports =  verifyParams;