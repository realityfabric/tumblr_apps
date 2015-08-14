
/************************************************
 *  USE ASYNC JUST... FUCKING... DON'T DO THIS  *
 ************************************************/

// Authenticate via OAuth
var tumblr = require('tumblr.js');
var async = require('async');
var underscore = require('underscore');

var t_app = require('./main');

t_app.client.userInfo(function (err, data) {
    if (err) {
		return console.log(err);
	} else {
		blogurl = data.user.name;
		f1();
	}
});

var count = 0;
var Max = 0;
var flwrs = [];

var count2 = 0;
var Max2 = 0;
var flwng = [];

function f1 () {
//gather following list
async.doWhilst(
    function (whilstcallback) {
        t_app.client.following ({offset: count}, function (err, data) {
            //console.log("Max: " + Max + " -- Count/20: " + count + " -- idk: " + (count/20 + count%20));
            if (Max === 0) {
                Max = data.total_blogs;
            }
            for (var i = 0; i < 20; i++) {
                if (count < (Max)) {
                    //console.log(count + " - " + data.blogs[count%20].name);
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
        //console.log(flwrs);
        flwrs.sort()
        console.log('FOLLOWING LIST SORTED');
        //console.log(flwrs);
        f2();
    }
);
}

function f2 (doafter) {
//gather follower list
async.doWhilst(
    function (whilstcallback) {
        t_app.client.followers(blogurl, { offset: count2 }, function (err, data) {
            if (err) {
                console.log (err);
            }
            else {
                //console.log("Max: " + Max2 + " -- Count/20: " + count2 + " -- idk: " + (count2%20));
                if (Max2 === 0) {
                    Max2 = data.total_users;
                }
                for (var i = 0; i < 20; i++) {
                    if ((count2 < (Max2 - 1)) && data.users[count2%20] != undefined) {
                        //console.log(count2 + " - " + data.users[count2%20].name);
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
        //console.log(flwng);
        flwng.sort()
        console.log('FOLLOWER LIST SORTED');
        //console.log(flwng);
        //console.log(flwng.length);
        f3();
    }
);
}

function f3 () {
    var arr = underscore.intersection(flwng, flwrs);
    console.log(arr);
}

