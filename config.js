const environment = {};

//Staging (Default) Environment
environment.staging = {
    'httpport' : 8081,
    'httpsport' : 8082,
    'envName' : 'Staging'
};

//Production Environment
environment.production = {
    'httpport' : 5000,
    'httpsport' : 5001,
    'envName' : 'Production'
};

//Determine current environment
const currentEnv = (typeof(process.env.NODE_ENV) == 'string') ? process.env.NODE_ENV : '';
const envToExport = (typeof(environment[currentEnv]) == 'object') ? environment[currentEnv] : environment["staging"];

module.exports = envToExport;





