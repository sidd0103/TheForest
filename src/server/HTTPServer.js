import http from 'http';
import express from 'express';
import path from 'path';
import timesyncServer from 'timesync/server';
export class HttpServer {
    static server;
    static port;
    static start(port) {
        this.port = port;
        this.port = process.env.PORT || port;
        this.app = express();
        this.server = http.Server(this.app);
        this.server.listen(this.port, err => {
            if (err) throw err;
            console.log("Started server on port: " + this.port);
        });
        //default to HTML file.
        this.app.get('/', function (req, res) {
            res.sendFile(path.join(__dirname, '..', 'index.html'));
        });
        //send the static files.
        this.app.get('/*', function (req, res, next) {
            let file = req.params[0];
            res.sendFile(path.join(__dirname, '..', file));
        });
        this.app.use('/timesync', timesyncServer.requestHandler);


    }
}