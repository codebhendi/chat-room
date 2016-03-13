var express = require('express');
var mongoose = require('mongoose');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var morgan = require('morgan');

// to serve static files
app.use(express.static(__dirname + '/public'));

// log every request to the console
app.use(morgan('dev'));

// to connect to db
mongoose.connect("mongodb://localhost/room");

var chatSchema = new mongoose.Schema({
	created: Date,
	content: String,
	username: String,
	room: String
});

//create a model from the chat schema
var Chat = mongoose.model('Chat', chatSchema);

//*** routes ***//

//route for our index file
app.get('/', function(req,res) {
	res.send('index.html');
});

// for first setup launch
app.post('/setup', function(req, res) {
	//array of chat data
	var chatData = [{
		created: new Date(),
		content: 'hello',
		username: 'Chris',
		room: 'css'
	},{
		created: new Date(),
		content: 'Hi',
		username: 'Aniket',
		room: 'angular'
	},{
		created: new Date(),
		content: 'All that I like',
		username: 'Shubham',
		room: 'laravel'
	},{
		created: new Date(),
		content: 'Amazing room',
		username: 'Patience',
		room: 'Scala'
	}];

	for ( var i in chatData ){
		var newChat = new Chat(chatData[i]);

		newChat.save(function(err, savedChat) {
			console.log(savedChat);
		});
	}

	//send a response to the server
	//so that the server will not
	//get stuck
	res.send('created');

});

app.get('/msg', function(req, res) {

	//find the room in the db
	Chat.find({
		room: req.query.room.toLowerCase()
	}).exec(function(err, msgs) {
		// send the found messages
		// in that room
		res.json(msgs);
	});
});

//*** end routes ***//

//*** sockets ***//

// listen for connection
io.on('connection', function(socket){
	var defaultRoom = 'general';
	var rooms = ['General', 'css', 'angular', 'laravel', 'scala', 'express', 'node'];

	//emit the rooms array
	socket.emit('setup', {
		rooms: rooms
	});

	// listen for new user
	socket.on('new user', function(data) {
		data.room = defaultRoom;
		// new user joins the default room
		socket.join(defaultRoom);

		// tell all the others in the room
		// that new user has joined
		io.in(defaultRoom).emit('user joined', data);
	});

	// listen for switch user
	socket.on('switch room', function(data) {
		// handle joining and leaving the room
		socket.leave(data.oldRoom);
		socket.join(data.newRoom);

		// notify other users
		io.in(data.oldRoom).emit('user left', data);
		io.in(data.newRoom).emit('user joined', data);
	});

	// listen for new chat message
	socket.on('new message', function(data) {
		// create message
		var newMsg = new Chat({
			username: data.uername,
			content: data.message,
			room: data.room.toLowerCase(),
			created: new Date()
		});

		// save it to database
		newMsg.save(function(err, msg) {
			io.in(msg.room).emit('message created', msg);
		});
	});
});

//*** end sockets ***//

server.listen(3000);