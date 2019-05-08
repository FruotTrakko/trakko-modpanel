const express = require('express');

const app = express();
const routes = require('./routes');

const port = process.env.PORT;

app.use(express.static('public'));

app.use('/', routes);

const server = app.listen(port, () => {
    console.log(`Started serving web server on port ${port}!`);
});

app.on('close', () => {
    console.log('Stopping serving web server...');
});
  
process.on('SIGINT', () => {
    shutDown();
});

process.on('SIGTERM', () => {
    shutDown();
});

function shutDown(){
    server.close(() => {
        console.log('Stopped execution of web server.');
      });
}