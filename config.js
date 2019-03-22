const environemnt = {};

//Staging (Default) Environment
environemnt.staging = {
    'httpport' : 8081,
    'httpsport' : 8082,
    'envName' : 'Staging'
};

//Production Environment
environemnt.production = {
    'httpport' : 5000,
    'httpsport' : 5001,
    'envName' : 'Production'
};

//Determine current environment
const currentEnv = (typeof(process.env.NODE_ENV) == 'string') ? process.env.NODE_ENV : '';
const envToExport = (typeof(environemnt[currentEnv]) == 'object') ? environemnt[currentEnv] : environemnt[staging];

module.exports = envToExport;





