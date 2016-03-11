var express = require('express');
var mongoose = require('mongoose');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);


// to serve static files
app.use(express.static(__dirname + '/public'));

