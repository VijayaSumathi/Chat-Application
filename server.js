var express=require('express');
var router=express();
var http=require('http').Server(router);
var io = require('socket.io')(http);
const mongoose = require('mongoose');
var register = require('./models/register');
var login = require('./models/login');
var online = require('./models/online');
var bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
router.use(bodyParser.json())
http.listen(3000,function(){
    console.log("Node Server is setup and it is listening on 3000");
});

// db connection

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/chatroomapp')
    .then(() => console.log('connection succesful'))
    .catch((err) => console.error(err));


router.get('/',function(req,res){
    res.sendfile("login.html");
});

router.get('/userlogin',function(req,res){
    res.sendfile("chat.html");
});


router.post('/register',function(req,res){ 
  
    var user={
        "name":req.body.name,       
        "password":req.body.password,
        "email":req.body.email,
    };
    console.log(user);    
      register.findOne({"name":req.body.name},function(err,doc){
        if(err){
            res.json(err); 
        }
        if(doc == null){
             register.create(user,function(err,doc){
                if(err) res.json(err);
                else{
                    //res.send("success");
                }
            });
        }else{
            res.json({message:"user Exist"});
        }
    });
    
});


var handle=null;
router.post('/login',function(req,res){
    console.log(req.body.name);    
    handle=req.body.name;
        register.findOne({"name":req.body.name, "password":req.body.password},function(err,doc){
        if(err){
            res.send(err); 
        }
        if(doc==null){
            res.send("User has not registered");
        }
        else{
            console.log("register success");
             return  res.redirect('/userlogin')  
        }
        
});
});
var private=null;
    var users={};
    var keys={};
    
io.on('connection',function(socket){
    console.log("Connection :User is connected  "+handle);
    console.log("Socket ID  : " +socket.id);
    io.to(socket.id).emit('handle', handle);
    users[handle]=socket.id;   // 
    keys[socket.id]=handle;
    console.log(users[handle]);
    console.log(keys[socket.id]);
 
    for(var i = 0; i < users.length;i++){
        console.log("Users list : "+users[i]);
    }
   
    console.log("keys list : "+keys);
});