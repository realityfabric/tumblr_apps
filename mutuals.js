var tumblr = require('tumblr.js');
var async = require('async');
var underscore = require('underscore');

var t_app = require('./main');

t_app.client.userInfo(function (err, data) {
    if (err) {
		return console.log(err);
	} else {
		blogurl = data.user.name;
		gatherFollowing();
	}
});

var count = 0;
var Max = 0;
var flwrs = [];

var count2 = 0;
var Max2 = 0;
var flwng = [];

function gatherFollowing () {
	//gather following list
	async.doWhilst(
		function (whilstcallback) {
			t_app.client.following ({offset: count}, function (err, data) {
				if (Max === 0) {
					Max = data.total_blogs;
				}
				for (var i = 0; i < 20; i++) {
					if (count < (Max)) {
						flwrs.push(data.blogs[count%20].name);
						count++;
					}
				}
				whilstcallback();
			});
		},
		function () { return ((count) < (Max - 1)); },
		function (err) {
			console.log('FOLLOWING LIST COMPLETE');
			flwrs.sort()
			console.log('FOLLOWING LIST SORTED');
			gatherFollowers();
		}
	);
}

function gatherFollowers (doafter) {
	//gather follower list
	async.doWhilst(
		function (whilstcallback) {
			t_app.client.followers(blogurl, { offset: count2 }, function (err, data) {
				if (err) {
					console.log (err);
				}
				else {
					if (Max2 === 0) {
						Max2 = data.total_users;
					}
					for (var i = 0; i < 20; i++) {
						if ((count2 < (Max2 - 1)) && data.users[count2%20] != undefined) {
							flwng.push(data.users[count2%20].name);
						}
						count2++;
					}
				}
				whilstcallback();
			});
		},
		function () { return ((count2) < (Max2 - 1)); },
		function (err) {
			console.log('FOLLOWER LIST COMPLETE');
			flwng.sort()
			console.log('FOLLOWER LIST SORTED');
			console.log(underscore.intersection(flwng,flwrs));
		}
	);
}

