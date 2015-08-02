var t_app = require('./main');
var client = t_app.client; //lazy

var initDash = function () {
	// Make the request
	client.dashboard({ limit: 1, offset: 0, reblog_info: true, notes_info: true }, function (err, data) {
		if (err) {return console.log (err);}
		
		displayPost (data.posts[0]);
	});
}

var displayPost = function (Post) {
	
	if (Post.reblogged_from_id !== undefined) { //the post was reblogged
			console.log (Post.blog_name + " reblogged this from " + Post.reblogged_from_name);
		} else { //this is an original post
			console.log (Post.blog_name);
		}
	
	switch (Post.type) {
		case "text":
			if (Post.title !== null && Post.title != undefined && Post.title !== "") {
				console.log (Post.title);
			}
			console.log (Post.body);
			
			break;
		case "photo":
			console.log ("Photo Post");
			for (var i = 0; i < Post.photos.length; i++) {
				if (Post.photos[i].caption !== "" && Post.photos[i].caption !== undefined) {
					console.log ("caption: " + Post.photos[i].caption + " / url: " + Post.photos[i].alt_sizes[0].url);
				} else {
					console.log ("url: " + Post.photos[i].alt_sizes[0].url);
				}
			}
			if (Post.caption !== "" && Post.caption != undefined) {
				console.log (Post.caption);
			}
			break;
		case default:
			console.log ("Post Type Not Supported Yet");
			break;
	}
	
	if (Post.reblogged_from_id !== undefined) {
		console.log ("source: " + Post.reblogged_root_name);
	}
}

initDash();
