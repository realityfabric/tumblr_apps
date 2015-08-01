/****************************************************************
 *                                                              *
 *  THIS IS  A FUCKING MESS, ABSTRACTIFY FOR THE LOVE OF GOD    *
 *                                                              *
 ****************************************************************/

var t_app = require('./main.js');
var async = require('async');
var moment = require('moment');

var urls = [];
var num = 0;

async.series([
    function(callback){
        console.log ("Acquiring URLs");
        t_app.client.userInfo(function (err, data) {
            var i = 0;
            while ( data.user.blogs[i] != undefined ) {     
                urls.push(data.user.blogs[i].name + ".tumblr.com");
                i++;
            }

            console.log ("URLs acquired");
            callback(null, 'one');
        });
        
    },
    function(callback){
        var count = 0;    
    
        async.doWhilst (
            function (callback1) {
                checkLimit(urls[count++],callback1);
                //callback1();
            },
            function () { return count < urls.length; },
            function (err) {
                console.log( "Completed checking blogs" );
                callback(null, 'two');
        });
        
    }
],

function(err, results){
    console.log("You have " + (250 - num) + " more posts today.");

            var diff = (moment().utc().endOf('day').add(4,'hours').unix() - moment.utc().unix());

            var secs_diff = diff % 60;
            diff = Math.floor(diff / 60);
            var mins_diff = diff % 60;
            diff = Math.floor(diff / 60);
            var hours_diff = diff % 24;
            diff = Math.floor(diff / 24);


            console.log("You have " + hours_diff + " hours, " + mins_diff + " minutes, and " + secs_diff + " seconds left before the Post Limit resets.");
});


//returns number of posts made by a blog since last reset
var checkLimit = function (url, cb) {
    console.log("Checking " + url + " for posts...");
    
    var date = moment().utc().startOf('day').subtract(1,'day').add(4,'hours').unix();
    var Max = 0;
    var count = 0;
    var arr = [];

    async.doWhilst(
        function (callback) {
            client.posts(url, { offset: count }, function (err, data) {
                if (data.total_posts > 0) {
                    if (Max === 0) { 
                        Max = data.total_posts;
                    }
                                    
                    for (var i = 0; i < 20; i++)
                    {
                        if (data.posts != undefined && i < (Max - count)) 
                        {
                            if (data.posts[i].timestamp > date) {
                                arr.push (data.posts[i].timestamp);
                            }
                            else { count = Max; }
                        }
                        count++;
                    }                
                }
                
                
                callback();
            });
        },
        function () {
            return Max > count;
        },
        function (err) {

            num += arr.length;
            cb();
        });
}
