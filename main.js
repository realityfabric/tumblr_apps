var async = require('async');
var fs = require('fs');
var module = require('module');
var moment = require('moment');
var safeReadFile = require('safe-readfile');
var tumblr = require('tumblr');
var underscore = require('underscore');

var t_client = require('./t_client.js');

var client = t_client.client;

//returns number of posts made by a blog since last reset
var checkLimit = function (url, num, cb) {
    console.log("Checking " + url + " for posts...");
    
    var date = moment().utc().startOf('day').add(4,'hours').unix();

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
        }
    );
}


//takes a url, a tag, an array, and a callback function, pushes arrays of up to 20 posts into the array
//the array given should finish as a doubly allocated array [x][20] with x = [number of posts]/20
var getPosts = function (url, tagged, arr, cb) {
    var count = 0;
    var Max = 0;
    
    //console.log("Getting Posts...");


    async.doWhilst(
        function (callback) {
            client.posts(url, { tag: tagged, offset: count }, function (err, data) {
                if (err) {
                    console.log (err);
                }
                else {
                    if (data.total_posts > 0) {
                        if (Max === 0) { 
                            Max = data.total_posts;  
                        }

                        for (var i = 0; i < 20; i++) {
                            if (data.posts[i] != undefined) {
                                arr.push(data.posts[i]);
                            }
                            count++;
                        }
                    }
                }
                callback();
            });
        },
        function () { return count < Max; },
        function (err) {
            //arr_to_assign = arr[0]; //i don't remember how this is supposed to work and honestly i don't think it does anything at all
            cb();
        }
    );
}

//takes a url,
//tagged (posts tagged as this will be selected for deletion; if tagged === undefined then all posts will be selected)
//not_tagged (posts tagged as this will not be deleted)
//older_than (only posts older than this unix time will be deleted)
//and a callback function
var deletePosts = function (url, tagged, not_tagged, older_than, cb) {

    //console.log("Deleting posts...");
    var arr = [];


    async.series([
        function(callback){
            getPosts (url, tagged, arr, function () { callback(null, 'one'); });
        },
        function(callback){
        
            var count = 0;
            var deleted_total = 0;

            async.whilst(
                function () { return count < arr.length; },
                function (callback1) {

                    while (arr[count] != undefined && (arr[count].tags.indexOf(not_tagged) > -1 || arr[count].timestamp > older_than))
                    {
                        count++;
                    }

                    if (arr[count] != undefined) {
                        client.deletePost(url, arr[count].id, function (err, data) {
                            if (err) {
                                console.log (err);
                            }         
                            else {
                                deleted_total++;
                            }
                            count++;
                            callback1();
                        });
                    }
                    else {count++; callback1();}
                },
                function (err) {
                    
                    callback(null, 'two');
                }
            );
        }
    ],
    function(err, results){
        cb();
    });
}

var backupPosts = function (url, tagged, arr, cb) {
    var filename = "./backups/" + url.replace('.tumblr.com','') + "_" + tagged + ".txt";
    var oldposts = [];
    //console.log ("backing up: " + filename);
    async.series([
        function(callback){
            safeReadFile.readFile(filename, 'utf8', function (err,data) {
                if (err) {
                    return console.log(err);
                }
                if (data === '' || data === undefined) {
                    oldposts = [];
                }
                else {
                    oldposts = JSON.parse(data);
                }
                callback();
            });
        },
        function(callback){
            getPosts (url, tagged, arr, function () { callback (null, 'two'); });
        },
        function(callback){
            var oldandnew = arr.concat(oldposts);

            for (var i = 0; i < oldandnew.length; i++) {
                oldandnew[i] = JSON.stringify(oldandnew[i]);
            }

            var unique = oldandnew.filter(function(elem, pos) { return oldandnew.indexOf(elem) == pos; });

            for (var i = 0; i < unique.length; i++) {
                unique[i] = JSON.parse(unique[i]);
            } 

            var str = JSON.stringify(unique);

            if (arr.length != 0) {
                fs.writeFile(filename, str, function(err) {
                    if(err) {
                        return console.log(err);
                    }

                    callback(null, 'two');
                }); 
            }
            else { 
                callback(null, 'three'); 
            }
        }
    ],
    function(err, results){
        cb();
    });
}

var htmlify = function (filename) {
    var posts = [];

    retrieve (filename, posts, function (arr) {
            write (filename, create (filename, arr), function () {
                console.log ("file written");
            });
    });
}

var retrieve = function (filename, arr, callback) {
    var test = [];
    safeReadFile.readFile(filename, 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        else {
            if (data === '' || data === undefined) {
                console.log ("Empty file, or file does not exist");
            }
            else {
                arr = JSON.parse(data);
            }
            callback(arr);
        }
    });
}

var create = function (filename, arr) {
    var str = "<!doctype html>\n<html>\n\t<head>\n\t\t<meta charset='UTF-8'>\n\t\t<title>\n\t\t\t" + filename + "\n\t\t</title>\n\t\t<link rel='stylesheet' type='text/css' href='stylesheet.css'>\n\t</head>\n\t<body>\n";


    for (var i = 0; i < arr.length; i++) {
        str = str + "\t\t<div class='post_container'>\n\t\t\t"; //wrap all posts in a div defining them as posts
        switch (arr[i].type) { //wrap posts in a div defining if they are text, quote, link, answer, video, audio, photo, or chat posts, with undefined_post meaning that there was no post type (shouldn't happen)
             case "text":
                str = str + "<div class='text_post'>";
                break;
             case "quote":
                str = str + "<div class='quote_post'>";
                break;
             case "link":
                str = str + "<div class='link_post'>";
                break;
             case "answer":
                str = str + "<div class='answer_post'>";
                break;
             case "video":
                str = str + "<div class='video_post'>";
                break;
             case "audio":
                str = str + "<div class='audio_post'>";
                break;
             case "photo":
                str = str + "<div class='photo_post'>";
                break;
             case "chat":
                str = str + "<div class='chat_post'>";
                break;
             default:
                str = str + "<div class='undefined_post'>";
        }        
        str = str + "\n";
        if (arr[i].title != null) { //if there is a title, wrap it in a div class post_title
            str = str + "<div class='post_title'>\n" + arr[i].title + "\n</div> <!-- end div post_title -->\n";
        }
        str = str + "\t\t\t\t<div class='post_body'>\n\t\t\t\t\t" + arr[i].body + "\n\t\t\t\t</div> <!-- end div post_body -->\n"; //wrap the body of the post in post_body
        str = str + "\t\t\t\t<div class='post_footer'>\n";
        str = str + "\t\t\t\t\t<div class='post_timestamp'>\n\t\t\t\t\t\t" + arr[i].date + "\n\t\t\t\t\t</div> <!-- end div post_timestamp -->\n"; //wrap the timestamp on the post in post_timestamp
        console.log (arr[53]);
        if (arr[i].tags.length > 0) {
            str = str + "\t\t\t\t\t<div class='post_tags'>\n";
            str = str + "\t\t\t\t\t\t<div class='post_tag'>\n"
            for (var x = 0; x < arr[i].tags.length; x++) {
                 str = str + "\t\t\t\t\t\t\t#" + arr[i].tags[x];
                 if (x < (arr[i].tags.length - 1)) {
                    str = str + ", \n\t\t\t\t\t\t</div> <!-- end div post_tag -->\n \t\t\t\t\t\t<div class='post_tag'>\n";
                 }
            }
            str = str + "\n\t\t\t\t\t\t</div> <!-- end div post_tag -->\n\t\t\t\t\t</div> <!-- end div post_tags -->\n";
        }
        str = str + "\t\t\t\t</div> <!-- end div post_footer -->\n"; //end div post_footer
        str = str + "\t\t\t</div> <!-- end div [type]_post -->\n"; //end div [type]_post
        str = str + "\t\t</div> <!-- end div post_container -->\n"; //end div post_container
    }
    str = str + "\t</body>\n</html>";
    
    return str;
}

var write = function (filename, str, callback) {
    var fn = filename.replace(".txt", ".html");
    fn = fn.replace("./backups/", "./htmls/");
    fs.writeFile(fn, str, 'utf8', function(err) {
        if(err) {
            return console.log(err);
        }
        callback(null, 'two');
    });
}

//EXPORTS
exports.client = client;
exports.checkLimit = checkLimit;
exports.getPosts = getPosts;
exports.deletePosts = deletePosts;
exports.backupPosts = backupPosts;
exports.htmlify = htmlify;
exports.retrieve = retrieve;
exports.create = create;
exports.write = write;
