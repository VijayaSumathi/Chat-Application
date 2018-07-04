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

nicknames=[];
io.sockets.on('connection',function(socket){

    socket.on('new user',function(data,callback){
        
        if(nicknames.indexOf(data)!=-1){  // check if name exits
            callback(false);
        }
        else{
            callback(true);
            socket.nickname =data;
            nicknames.push(socket.nickname);
            io.sockets.emit('usernames',nicknames);
    
        }
        
    });



    socket.on('send message',function(data){
        console.log(data);
        io.sockets.emit('new message',data);
        socket.broadcast.emit('new message',data);
    });

});