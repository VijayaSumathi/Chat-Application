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


