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
	content: Sequelize.TEXT,
	timeStamp: Sequelize.DATE,
	author: Sequelize.STRING
});

//this renders the homepage with login and register form
app.get('/', function(request, response) {
	response.render('index', {
		message: request.query.message,
	});
});

// this is the post request for creating a new user
app.post('/users', function(request, response) {
	var checkUsername = request.body.name;
	var checkPassword = request.body.password;
	var checkEmail = request.body.email;

	if (checkUsername !== "" && checkPassword !== "" && checkEmail !== "") {
		User.create({
			name: request.body.name,
			email: request.body.email,
			password: request.body.password
		}).then(function(user) {
			response.render('index', {
				succesregister: "You've succesfully created your account!"
			});
		});
	} else {
		response.render('index', {
			errorregister: "Please fill out the form"
		});
	}
});

//this is the post request to login
app.post('/login', function(request, response) {
	var checkEmail = request.body.emaillogin;
	var checkPassword = request.body.passwordlogin;

	if (checkPassword !== "" && checkEmail !== "") {
		User.findOne({
				where: {
					email: request.body.emaillogin
				}
			})
			.then(function(user) {
				if (user !== null) {
					if (request.body.passwordlogin === user.password) {
						request.session.user = user;
						response.redirect('/users/' + user.id);
					} else {
						response.render('index', {
							errorpassword: "Invalid password"
						});
					}
				} else {
					response.render('index', {
						erroremail: "Invalid emailaddress"
					});
				}
			})
	} else {
		response.render('index', {
			errorempty: "Please fill out the form"
		});
	}
});

//the user gets send to this dynamic route, once logged in
app.get('/users/:id', function(request, response) {
	var user = request.session.user;
	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));
	} else {
		response.render('profile', {
			user: user,
			userId: request.session.user.id

		});
	}
});

// this is the post request for creating a new post
app.post('/users/createpost', function(request, response) {
	var author = request.session.user.name;
	var title = request.body.title;
	var content = request.body.content;
	var timeStamp = new Date();

	Post.create({
		userId: request.session.user.id,
		author: author,
		title: title,
		content: content,
		timeStamp: timeStamp
	}).then(function(user) {
		response.render('profile', {
			succespost: "You've succesfully created a post!"
		});
	});
});

//this route loads all posts
app.get('/users/:id/allposts', function(request, response) {
	Post.findAll().then(function(posts) {
		var data = posts.map(function(post) {
			return {
				id: post.dataValues.id,
				author: post.dataValues.author,
				userid: post.dataValues.userid,
				title: post.dataValues.title,
				content: post.dataValues.content,
				timeStamp: post.dataValues.timeStamp
			};
		});
		response.render('users/posts', {
			data: data,
			userId: request.session.user.id
		});
	});
});

//this route loads the posts of a specific user
app.get('/users/:id/posts', function(request, response) {
	Post.findAll({
		where: {
			userid: request.session.user.id
		}
	}).then(function(posts) {
		var data = posts.map(function(post) {
			return {
				id: post.dataValues.id,
				author: post.dataValues.author,
				userid: post.dataValues.userid,
				title: post.dataValues.title,
				content: post.dataValues.content,
				timeStamp: post.dataValues.timeStamp
			};
		});
		response.render('users/posts', {
			data: data,
			userId: request.session.user.id
		});
	});
});

app.get('/users/:id/post/:ip', function(request, response) {
	console.log (request.session.user);
		Post.findAll({
			where: {
				id: request.params.ip
			}
		}).then(function(posts) {
			var data = posts.map(function(post) {
				return {
					id: post.dataValues.id,
					author: post.dataValues.author,
					userid: post.dataValues.userid,
					title: post.dataValues.title,
					content: post.dataValues.content,
					timeStamp: post.dataValues.timeStamp
				};
			});
			response.render('users/post', {
				data: data,
				userId: request.session.user.id
			});
		});
	});


//this makes it possible for a user to logout
app.get('/logout', function(request, response) {
	request.session.destroy(function(error) {
		if (error) {
			throw error;
		}
		response.render('index', {
			logout: "Successfully logged out."
		});
	})
});


sequelize.sync().then(function() {
	var server = app.listen(3000, function() {
		console.log('Example app listening on port: ' + server.address().port);
	});
});