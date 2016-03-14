// load angular
var app = angualar.module('chat', ['ngMaterial', 'ngAnimate', 'ngMdIcons', 'btford.socket-io']);

//set our server url
var serverBaseUrl = 'http://localhost:3000';

//service to connect with the coket library
app.factory('socket', function(socketFactory) {
	var ioSocket = io.connect(serverBaseUrl);

	var socket = socketFactory({
		ioSocket: ioSocket
	});

	return socket;
});