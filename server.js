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

  
var chatschema=mongoose.Schema({
    email:String,
    message:String
  });
  var chat=mongoose.model('message',chatschema)

users={};
io.sockets.on('connection',function(socket){
      var query = chat.find({});
      query.sort('--created').limit(2).exec(function(err,docs){
        if(err) throw err ;
        //console.log("sending old msg");
        socket.emit('load old msg',docs);
       
        
     });
          

    socket.on('new user',function(data,callback){
        
        if(data in users){  // check if name exits
            callback(false);
        }
        else{
            callback(true);
            socket.nickname =data;
          users[socket.nickname]=socket
            
          updatenicknames();
        }
        
    });



    socket.on('send message',function(data){
        console.log(data);
        var msg=data.trim();
        console.log(msg);
        if(msg.substr(0,3)=='/w'){
            msg= msg.substr(3);
            var ind = msg.indexOf('');
            if(ind!=-1)
            {
                var name = msg.substring(0,ind);
                var msg = msg.substring(ind + 1);
                if(name in users){
                    users[name].emit('whisper',{msg:msg,nick:socket.nickname});
                    console.log('message seny is:'+msg);
                    console.log('whisper');
                }
                else{
                    callback('error! enter a valid user.');
                }
                
            }
            else{
                callback('error');
            }
        }
        else{ console.log(msg);
            var newmsg = new chat({email:"@",message:msg});
            newmsg.save(function(err){
  
            if(err) throw err;
            io.sockets.emit('new message',{msg:msg,nick:socket.nickname});
            });
        }


    });

    socket.on('disconnect',function(data){  
      if(!socket.nickname) return ;
      delete users[socket.nickname]
       });
    function updatenicknames(){
        io.sockets.emit('usernames',Object.keys(users));
    }
});

