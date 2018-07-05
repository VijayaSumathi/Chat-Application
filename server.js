var express=require('express');
var router=express();
var http=require('http').Server(router);
var io = require('socket.io')(http);
const mongoose = require('mongoose');
var login = require('./models/login');
var bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
router.use(bodyParser.json())
http.listen(3000,function(){
    console.log("Node Server is setup and it is listening on 3000");
});

mongoose.connect('mongodb://localhost:27017/chatapplication',function(err){
  if(err)  console.log("db not connected"+err);
  console.log("db connected");
});

router.get('/',function(req,res){
    res.sendfile("login.html");
});
router.post('/login',function(req, res, next) {
    
    var Email=req.body.email;
    var password=req.body.password;  
    console.log(Email);
    console.log(password);
    login.find({email:Email}, function(err, data){
        if(password==data[0].password )
          {          
                res.sendfile("index.html");
                // res.json({password:"correct"});
          }
          else{
               res.json({password:"wrong"});
        }       
  });
       
  
  });
  users={};

  io.sockets.on('connection',function(socket){
    //everytime a user connects has its own socket
	//console.log("new user");
	socket.on('new user',function(data,callback){
		console.log("New user");
		//socket.emit('select_room',data);
		if(data in users)//if index of is not -1..i.e nickname exist
		{
			callback(false);
		}
		else
		{
			console.log("here");
			callback(true);
			socket.nickname=data;//store nickname of each user becomes clear on disconnect
			users[socket.nickname]=socket;//key value pair as defined above
			//nicknames.push(socket.nickname);
			//io.sockets.emit('usernames',nicknames);//send usernames for display
			updateNicknames();
		}
	});
	socket.on('sendmessage',function(data,callback){
		//console.log(data);
		var msg=data.trim();
		if(msg[0]=='@')//if thats whisper or private msg
		{
			msg=msg.substr(1);//start of name onwards
			var idx=msg.indexOf(' ');
			if(idx!==-1)
			{
				//check the username is valid
				var name=msg.substr(0,idx);
				msg=msg.substr(idx+1);
				if(name in users)
				{
					users[name].emit('whisper',{msg:msg,nick:socket.nickname});
					console.log('whispered');	
				}
				else
				{
					callback('Error! Enter a valid user');
				}	
			}
			else//no actual msg part
			{
				callback('Error! Please enter a message for your whisper');
			}
		}
		else{
			io.sockets.emit('newmessage',{msg:msg,nick:socket.nickname});//broadcast to everyone and i too can see the msg
			//socket.broadcast.emit('newmessage',data);//broadcast to evry1 except me
		}

	});
	function updateNicknames(){
		io.sockets.emit('usernames',Object.keys(users));//sending socket does not make sense
	}
	//whenever user disconnect he/she should be removed from the list
	socket.on('disconnect',function(data){
		if(!socket.nickname)//when the user has no nickname 
			return;
		delete users[socket.nickname];
		updateNicknames();
	});
});
