var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

var port = 8081;

//Define routers
hello = {
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

//HTTP server object
var httpServer = http.createServer( (req, res)  => {
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

    // if(recievedData.handler) {
    //     const resMessage = {};
    //     if(recievedData.method === 'post') {
    //         resMessage.message = recievedData.handler.postMessage;
    //     } else {
    //         resMessage.message = recievedData.handler.defaultMessage;
    //     }
    //     sendResponse(res, resMessage);
    // } else {
    //     sendResponse(res, { message : '404 - Page Not Found'}, 404);
    // }

}); //httpServer()


httpServer.listen(port, () => {
    console.log(`The server is listening on port ${port} now`);
})
