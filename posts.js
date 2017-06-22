var client = require('./main').client;

var Blog = "";
var Body = "";
var Tags = "";
var errflag = false;

if (process.argv[2] != null) {
	Blog = process.argv[2];
	if (process.argv[3] != null) {
		Body = process.argv[3];
		if (process.argv[4] != null) {
			Tags = process.argv[4];
		} else {
			Tags = "";
		}
	} else {
		errflag = true;
	}
} else {
	errflag = true;
}

if (errflag) {
	console.log ("Format is: nodejs posts.js [blogname] '[post body]' '[comma separated list of tags]'");
} else {
		client.createTextPost(Blog, {  body: Body,
									tweet: 'off',
									format: 'markdown',
									tags: Tags}, function (err, success) {
		console.log(success);
	});
}

