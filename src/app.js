var Sequelize = require('sequelize');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var app = express();
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(session({
	secret: 'oh wow very secret much security',
	resave: true,
	saveUninitialized: false
}));

var sequelize = new Sequelize('blogapplication', 'Koen', null, {
	host: 'localhost',
	dialect: 'postgres',
	define: {
		timestamps: false
	}
});

var User = sequelize.define('user', {
	name: Sequelize.STRING,
	email: Sequelize.STRING,
	password: Sequelize.STRING
});


app.get('/profile', function (request, response) {
	var user = request.session.user;
	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));
	} else {
		response.render('profile', {
			user: user
		});
	}
});

app.get('/', function (request, response) {
		response.render('index', {
		message: request.query.message,
		user: request.session.user
	});
});

app.post('/login', function (request, response) {
	User.findOne({
		where: {
			email: request.body.emaillogin
		}
	}).then(function (user) {
		if (request.body.emaillogin === user.email) {
			request.session.user = user;
			response.redirect('/profile');
		} else {
			response.render('index', {message: "Please fill out the form"});
		}
	}, function (error) {
		response.redirect('/?message=' + encodeURIComponent("Invalid email or password."));
	});
});

// create the new user
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

