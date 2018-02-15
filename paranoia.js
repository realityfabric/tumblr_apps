var async = require('async');
var moment = require('moment');

var t_app = require('./main.js');


//array of tags to backup
var tagarr = [];
var ta_index = 0;
//tag to not delete
var tagsave = "misc";

// argv[0] = "nodejs", argv[1] = "paranoia.js", argv[2] = blogname; ( > nodejs paranoia.js blogname )
var blogname = process.argv[2];
var url = blogname + ".tumblr.com";

var paranoia_runtime = 0;

async.forever(
    function(next) {
        console.log ("running paranoia");

        paranoia (30, function() {
            console.log ("paranoia.js has run " + ++paranoia_runtime + " times."); 
            console.log ("it is " + moment().format("dddd, MMMM Do YYYY, h:mm:ss a"));
            setTimeout(next,900000); //repeats loop every 15 minutes
        });
    },
    function(err) {
        console.log (err);
        console.log ("paranoia.js stopped");
    }
);

/**
 * Deletes posts older than the 'days' argument
 *
 * days - number of most recent days to save (all else will be deleted)
 * call_back - a callback function
 */
function paranoia (days, call_back) {
    async.whilst ( //back up tags
        function () { return ta_index < tagarr.length; },
        function (callback) { 
            var testarr = [];
            t_app.backupPosts (url, tagarr[ta_index++], testarr, callback);
        },
        function (err) {
            ta_index = 0;
            if (err) {
                console.log (err);
            }
            else {//delete posts older than the number of days in the 'days' argument
                t_app.deletePosts (url, undefined, tagsave, moment().subtract(days,'day').utc().unix(), call_back);
            }
        }
    );
}
