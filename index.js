var express = require("express");
var path = require('path');
var formidable = require('formidable');
var bodyParser = require('body-parser');
var cors = require('cors');
var fs      = require('fs');
var request = require('request');
var mongo = require('mongodb');
var uuid = require('node-uuid');
var flash = require('connect-flash');
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var moment = require('moment');
moment().format();
var app = express();
var port = 8080;
var comments;
var projects;
var reply;
var users;
var messages = [];

mongo.connect('mongodb://muser:jb573698@ds157320.mlab.com:57320/maaarkerdb', function(err, db) {
	db.createCollection('allcomments');
	comments = db.collection('allcomments');
	projects = db.collection('projects');
	reply = db.collection('replies');
	users = db.collection('users');

});


app.set('view engine', 'html');

	// Initialize the ejs template engine
	app.engine('html', require('ejs').renderFile);

	// Tell express where it can find the templates
	app.set('views', __dirname + '/tpl');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser({uploadDir:__dirname + '/files'}));

app.get("/", function(req, res){
	res.render("home", {session: req.session});
});


//Configure Flash Message Function 

app.use(session({ cookie: { maxAge: 60000000 }, 
                  secret: 'woot',
                  resave: false, 
                  saveUninitialized: false}));

 app.use(flash());
app.use(function(req, res, next){
  res.locals.messages = req.flash();
  next();
});


/* app.post("/upload", function(req, res){
    console.log(res);
    console.log(req);

request.get({url: 'https://someurl/somefile.torrent', encoding: 'binary'}, function (err, response, body) {
  fs.writeFile("/tmp/test.torrent", body, 'binary', function(err) {
    if(err)
      console.log(err);
    else
      console.log("The file was saved!");
  }); 
});

    
	res.render("upload");
    
});
*/



//Login System

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  },
  function(req, email, password, done) {
    console.log("Signup Function Callled!");
    process.nextTick(function() {
      users.findOne({ 'local.email':  email }, function(err, user) {
        if (err)
            return done(err);
        if (user) {
             return done(null, false, { message: 'Incorrect password.' });
        } else {
            
function uniqueNumber() {
    var date = Date.now();

    // If created at same millisecond as previous
    if (date <= uniqueNumber.previous) {
        date = ++uniqueNumber.previous;
    } else {
        uniqueNumber.previous = date;
    }

    return date;
}

uniqueNumber.previous = 0;
            var uuid = uniqueNumber();
            var vname = req.body.name;
            var  saveUser = {
            local: {
             "email": email,
             "password": password,
             "uuid": uuid,
             "name": vname
            },
		}
    
 users.save(saveUser, function(err) {
			if (err) throw err;
     
            return done(null, saveUser);
}); 
    
        }
      });
    });
  }));




    passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  },
  function(req, email, password, done) {
console.log("Login Function Callled!");
    users.findOne({ 'local.email':  email, 'local.password': password }, function(err, user) {
        console.log(user);
      if (err)
          return done(err);
        
       if(!user){
           return done(null, false, req.flash('loginMessage', 'Incorrect Login Details!'));
            console.log("Incorrect Login!");
       }
      if (user.local.email == email && user.local.password == password){
          
          console.log("Succesfully Logged!");
           done(null, user);
           
      }
         
        
      
    });
}));

//Passport Initialization

app.use(passport.initialize());
app.use(passport.session());


// PassPort Facebook

var FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: "616933068500574",
    clientSecret: "ca5f053da27f12604f514dac3ff703c7",
    callbackURL: "http://192.168.0.201:3700/auth/facebook/callback",
  },
  function(accessToken, refreshToken, profile, done) {
    users.findOrCreate({ 'local.email':  email}, function(err, user) {
      if (err) { return done(err); }
      done(null, user);
    });
  }
));



//Facebook Login Routes

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/login' }));



app.post('/upload', function(req, res){

  // create an incoming form object
  var form = new formidable.IncomingForm();
  var imname = uuid.v1();
   var purl = uuid.v4();
  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/public/files');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
  
    fs.rename(file.path, path.join(form.uploadDir, imname+file.name));
    var imageid = imname+file.name;
    var theuser = req.session.passport.user.local;
      var  saveProject = {
       
			"pid": purl,
			"pname": "Enter a Title",
            "pimg": imageid,
            "createdby": theuser.name,
            "userid": theuser.uuid,
            "cdate": new Date(),
            "status": 1
		}
      
       projects.save(saveProject, function(err) {
			if (err) throw err;
}); 
      
      
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end(purl);
  });

  // parse the incoming request containing the form data
  form.parse(req);
    

    
});


app.get('/project/:id', function(req,res,next){
        
     var projectid = req.params.id;
     
   projects.find({'pid': projectid}).toArray(function (err, result) {
			if (err) throw err;
            res.render('page', {pdata: result, session: req.session});
		}); 
		// Render the project view
		
	});


//Login Routes 
app.get('/login', function(req,res,next){
    
    res.render('login', { message: req.flash('loginMessage'), session: req.session });
  });  

app.post('/login', passport.authenticate('local-login', { successRedirect: '/dashboard',
                                   failureRedirect: '/login',
                                   failureFlash: true,
}));


app.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/dashboard',
  failureRedirect: '/signup',
  failureFlash: true,
}));


//Registration

app.get('/signup', function(req, res) {
  res.render('signup', { message: req.flash('loginMessage'), session: req.session });
});


//DashBoard

app.get('/dashboard', function(req, res) {

if(req.session.passport != null){
var theid = req.session.passport.user.local.uuid;
    projects.find({'userid': theid}).toArray(function (err, result) {
			if (err) throw err;
          
    res.render('dashboard', { message: req.flash('loginMessage'), session: req.session, projects: result, moment: moment });
    
    
    
		});   
}
else {
    res.redirect('/login');
}

    
});


//Log Out 

app.get('/logout', function (req, res){
  req.logOut()  // <-- not req.logout();
  res.redirect('/')
});

//Socket Init

var io = require('socket.io').listen(app.listen(port));


//Socket Connection Start

io.sockets.on('connection', function (socket) {
socket.emit('message', { message: 'test' });
    
socket.on('room', function(room) {
        socket.join(room);
    });
    
    
socket.on('mminit', function (data) {
    var currentRoom = socket.rooms[Object.keys(socket.rooms)[0]];
   var roomid = data.thesrc;
    console.log("Room id:"+ data.room);
   comments.find({'projid': data.thesrc}).toArray(function (err, result) {
      
			if (err) throw err;
            var finaldata = result;
         
           io.sockets.in(roomid).emit('message', finaldata);
           console.log(roomid);
             reply.find({'projectid': data.thesrc}).toArray(function (err, thedata) {
      
			if (err) throw err;
            var replies = thedata;
           // console.log(finaldata);
           io.sockets.in(roomid).emit('replyfromdb', replies);
		}); 
       
       
		}); 
    
    
 
    
});
    
socket.on('send', function (data) {

console.log(data);
var roomid = data.thesrc;
var  saveObject = {
             "username": data.username,
             "notes": data.notes,
             "projid" : data.thesrc,
             "username" : data.username,
            "aid" : data.aid,
		}
    
 comments.save(saveObject, function(err) {
			if (err) throw err;
     
       comments.find({'projid': data.thesrc}).toArray(function (err, result) {
			if (err) throw err;
           console.log(result.length);
         
         io.sockets.in(roomid).emit('message', result);
		}); 
     
     
}); 
    
io.sockets.in(roomid).emit('newmessage', data);
});
    
    
  /*  
socket.on('update', function (data) {
    console.log(data.comid);
    
  /*comments.findOneAndReplace(
   { "aid" : data.comid  },
   { "aid": data.comid,  "replies" : data.replies, "src" : data.projid, "" }
);
    

    
comments.update(
   { aid: data.comid },
   {
     $set: {
       "replies": data.replies
     }
   }
);
    
});
    
*/
socket.on('edit_title', function (data) {
    
var projid = data.projectid;
var newtitle = data.newtitle;

    projects.update(
   { pid: projid },
   {
     $set: {
       pname: newtitle,
     }
   }
)
    
    
});
    
    
    
socket.on('reply', function (data) {  
var roomid = data.projectid;
var  saveReply = {
             "username": data.username,
             "noteid": data.noteid,
             "projectid" : data.projectid,
             "comid" : data.comid,
             "comment" : data.comment,
		}
    
reply.save(saveReply, function(err) {
			if (err) throw err;
    
            io.sockets.in(roomid).emit('updatereply', data);
    
});


});
    
    
});

console.log("Listening on port " + port);

// Socket Connection End

