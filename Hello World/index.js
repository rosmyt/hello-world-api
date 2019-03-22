const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const StringDecoder = require('string_decoder').StringDecoder;

const config = require('../config');

const httpsServerOptions = {
    'key' : fs.readFileSync(__dirname + '/https/key.pem'),
    'cert' : fs.readFileSync(__dirname + '/https/cert.pem')
};

//Define routers
const hello = {
    defaultMessage :  'Hello World' ,
    postMessage :  'Post method in hello'
};

const router = {
    'hello' : hello
};

router.responseHandler = function( data, callback) {
    if(data.handler) {
        (data.method === 'post') ? callback(data.handler.postMessage) : callback(data.handler.defaultMessage);
    } else {
        callback( { message : '404 - Page Not Found'}, 404);
    }
}


const unifiedServer = function(req, res) {
    var parsedUrl = url.parse(req.url, true);
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace( /^\/+|\/+$/g, '' );
    var method = req.method.toLowerCase();
    var queryStringObj = parsedUrl.query;
    var headers = req.headers;

    let recievedData = {
        url : parsedUrl,
        path : trimmedPath,
        query : queryStringObj,
        method, 
        headers,
    };

    //Parsing payload    
    var decoder = new StringDecoder('utf-8');
    var message = '';
    req.on('data', (data) => {
        message += decoder.write(data);
    });
    req.on('end', () => {
        message += decoder.end();
        if(recievedData.method !== 'get') {
            console.log("Recieved : "+message);
            recievedData.message = JSON.parse(message);
        }      
    })
        
    //Determining router handler
    recievedData.handler = (typeof(router[recievedData.path]) !== 'undefined') ? router[recievedData.path] : null;

    //Send Response message
    router.responseHandler(recievedData, (message, statusCode) => {
        data = (typeof(message) == 'object') ? message : {}; 
        statusCode = (typeof(statusCode) == 'number' ) ? statusCode : 200; 
        res.setHeader('Content-Type', 'application/json');
        res.writeHeader(statusCode);
        res.end(JSON.stringify(message));
    });
}

//Instatiate the HTTP Server
const httpServer = http.createServer( (req, res) => {
    unifiedServer(req, res);
});

//Instatiate the HTTPS Server
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res);
});

//Start the HTTP Server
httpServer.listen(config.httpport, () => {
    console.log(`The HTTP server is listening... Environment: ${config.envName} , Port: ${config.httpport}`);
});

//Start the HTTPS Server
httpsServer.listen(config.httpsport, () => {
    console.log(`The HTTPS server is listening... Environment: ${config.envName} , Port:  ${config.httpsport}`);
});
