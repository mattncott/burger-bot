import { isNull } from "./Helper";
import { LogInfo } from "./Logger";

export function StartWebServer(){
    var http = require('http');

    var host = process.env.host;

    if (isNull(host)){
        throw new Error(`Host cannot be null`);
    }

    const port = process.env.PORT || 3000;
    
    LogInfo(`listening on port ${port}`)

    http.createServer(function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write('You\'ve been burgered');
        res.end();
      }).listen(port);
}