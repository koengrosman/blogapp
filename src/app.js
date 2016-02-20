var Sequelize = require('sequelize');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var app = express();
app.set('view engine', 'jade');

//middleware for using bodyparser
app.use(bodyParser.urlencoded({
	extended: true
}));


//middleware for using sessions
app.use(session({
	secret: 'oh wow very secret much security',
	resave: true,
	saveUninitialized: false
}));

//middleware for using sequalize
var sequelize = new Sequelize('blogapplication', 'Koen', null, {
	host: 'localhost',
	dialect: 'postgres',
	define: {
		timestamps: false
	}
});

//this defines the new table user in sequalize
var User = sequelize.define('user', {
	name: Sequelize.STRING,
	email: Sequelize.STRING,
	password: Sequelize.STRING
});

var Post = sequelize.define('post', {
	userid: Sequelize.INTEGER,
	title: Sequelize.STRING,
	content: Sequelize.STRING,
});

//this renders the homepage with login and register form
app.get('/', function (request, response) {
		response.render('index', {
		message: request.query.message,
		user: request.session.user
	});
});

// this is the post request for creating a new user
app.post('/users', function (request, response) {
	var checkUsername = request.body.name;
	var checkPassword = request.body.password;
	var checkEmail = request.body.email;	

	if(checkUsername !== "" && checkPassword !== "" && checkEmail !== ""){
	User.create({
		name: request.body.name,
		email: request.body.email,
		password: request.body.password
	}).then(function (user) {
		response.render('index', {succesregister: "You've succesfully created your account!"});
	});
    }
    else {
    	response.render('index', {errorregister: "Please fill out the form"});
    }
});

//this is the post request to login
app.post('/login', function (request, response) {
	User.findOne({
		where: {
			email: request.body.emaillogin
		}
	}).then(function (user) {
		if (request.body.emaillogin === user.email) {
			request.session.user = user;
    		response.redirect('/users/' + user.id);
		} else {
			response.render('index', {message: "Please fill out the form"});
		}
	}, function (error) {
		response.redirect('/?message=' + encodeURIComponent("Invalid email or password."));
	});
});

//the user gets send to this dynamic route, once logged in
app.get('/users/:id', function (request, response) {
	var user = request.session.user;
	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));
	} else {
		response.render('profile', {
			user: user
		});
	}
});

// this is the post request for creating a new post
app.post('/users/createpost', function (request, response) {
	var userid = request.session.user.id;
	var title = request.body.title;
	var content = request.body.content;	

	Post.create({
		userid: userid,
		title: title,
		content: content,
	}).then(function (user) {
		response.render('profile', {succespost: "You've succesfully created a post!"});
	});
});

//this makes it possible for a user to logout
app.get('/logout', function (request, response) {
	request.session.destroy(function(error) {
		if(error) {
			throw error;
		}
		response.render('index', {loginmessage: "Successfully logged out."});
	})
});

sequelize.sync().then(function () {
	var server = app.listen(3000, function () {
		console.log('Example app listening on port: ' + server.address().port);
	});
});


app.get('/logout', function (request, response) {
	request.session.destroy(function(error) {
		if(error) {
			throw error;
		}
		response.render('index', {loginmessage: "Successfully logged out."});
	})
});

