var prompt = require('prompt');
var t_app = require('./main');
var client = t_app.client; //lazy

var count = 0;
var previds = [];

var initDash = function () {
		prompt.start();
		client.dashboard({ limit: 1, offset: count++, reblog_info: true, notes_info: true }, function (err, data) {
		if (err) {return console.log (err);}
		previds.push(data.posts[0].id);
		displayPost (data.posts[0]);
		commandGet(data.posts[0]);
	});
}

var dashNext = function () {
	client.dashboard({ limit: 1, offset: count++, reblog_info: true, notes_info: true }, function (err, data) {
		if (err) { return console.log (err); }
		if (previds.indexOf(data.posts[0].id) > -1) { // if the post returned by data has already been seen, skip to the next post until the post returned is new
			dashNext();
		}
		previds.push(data.posts[0].id);
		displayPost (data.posts[0]);
		commandGet();
	});
}

var displayPost = function (Post) {
	
	if (Post.reblogged_from_id !== undefined) { //the post was reblogged
			console.log (Post.blog_name + " reblogged this from " + Post.reblogged_from_name);
		} else { //this is an original post
			console.log (Post.blog_name);
		}
	
	switch (Post.type) {
		case "answer":
			console.log (Post.asking_name + " asked:");
			console.log (Post.question);
			console.log (Post.answer); //is there a way to see who answered the question? might need a workaround
			break;
			
		case "chat":
			if (Post.title !== null && Post.title != undefined && Post.title !== "") {
				console.log (Post.title);
			}
			console.log (Post.body);
			break;
		
		case "link": //i'm not really sure how this will display
				console.log (Post.title);
				console.log (Post.url);
				console.log (Post.author);
				console.log (Post.excerpt);
				console.log (Post.publisher);
				console.log ("Photos not supported at this time"); //i should probably add this
				console.log (Post.description);
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
			
		case "quote":
			console.log (Post.text);
			if (Post.source !== null && Post.source !== undefined && Post.source !== "") {
				console.log (Post.source);
			}
			break;
			
		case "text":
			if (Post.title !== null && Post.title != undefined && Post.title !== "") {
				console.log (Post.title);
			}
			console.log (Post.body);
			break;
			
		default:
			console.log ("Post Type Not Supported Yet");
			break;
	}
	
	if (Post.reblogged_from_id !== undefined) {
		console.log ("source: " + Post.reblogged_root_name);
	}
	if (Post.tags.length !== 0) { //only post tags if they exist
		console.log ("tagged: " + Post.tags);
	}
	if (Post.liked === true) {
		console.log (Post.note_count + " notes -- (liked)");
	} else {
		console.log (Post.note_count + " notes");
	}
	
}

var commandGet = function (Post) {
	prompt.get(['command'], function(err,result) {
		if (err) {
			return console.log(err);
		}
		
		switch (result.command) {
			case "next":
				console.log("");
				dashNext();
				break;
			case "quit":
				console.log ("Exiting Dashboard");
				break;
			default:
				console.log ("possible commands:");
				console.log ("\tnext");
				console.log ("\tquit");
				break;
		}
	});
}

initDash();
