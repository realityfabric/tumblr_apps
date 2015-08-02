var prompt = require('prompt');
var t_app = require('./main');
var client = t_app.client; //lazy

prompt.start();

var count = 0;
var index = 0;
var postarray = [];
var previds = [];

var initDash = function () {
	count = 0; index = 0; postarray = []; previds = [];
	client.dashboard({ limit: 20, offset: count, reblog_info: true, notes_info: true }, function (err, data) {
		if (err) {return console.log (err);}
		
		postarray = data.posts;
		
		previds.push(postarray[index].id);
		console.log ("");
		displayPost (postarray[index]);
		commandGet(postarray[index]);
	});
}

var dashNext = function () {
	index++; count++;
	if (index === 20) { //get the next postarray from the server
		client.dashboard({ limit: 20, offset: count, reblog_info: true, notes_info: true }, function (err, data) {
			index = 0;
			postarray = data.posts;
			
			previds.push(postarray[index].id);
			displayPost(postarray[index]);
			commandGet(postarray[index]);
		});
	} else { // move to the next post in postarray
			previds.push(postarray[index].id);
			displayPost(postarray[index]);
			commandGet(postarray[index]);
	}
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
			if (Post.title !== null && Post.title !== undefined && Post.title !== "") {
				console.log (Post.title);
			}
			if (Post.body !== null && Post.title !== undefined && Post.body !== "") {
				console.log (Post.body);
			}
			break;
			
		default:
			console.log ("Post Type \"" + Post.type + "\" Not Supported Yet");
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

var likePost = function (Post) {
	client.like(Post.id, Post.reblog_key, function (err, data) {
		if (err) {
			return console.log (err);
		}
		
		console.log ("Post liked!");
		commandGet(Post);
	});
}

var unlikePost = function (Post) {
	client.unlike(Post.id, Post.reblog_key, function (err, data) {
		if (err) {
			return console.log (err);
		}
		
		console.log ("Post unliked.");
		commandGet(Post);
	});
}

var reblogPost = function (Post) {
	prompt.get(['blog', 'comment', 'tags'], function(err,result) {
		if (err) {
			return console.log (err);
		}
		
		client.reblog(result.blog, { id: Post.id, reblog_key: Post.reblog_key, comment: result.comment, tags: result.tags}, function (err, data) {
			if (err) {
				return console.log (err);
			}
			console.log(data);
		
			commandGet(Post);
		});
	});
}

var queuePost = function (Post) {
	prompt.get(['blog', 'comment', 'tags'], function(err,result) {
		if (err) {
			return console.log (err);
		}
		
		client.reblog(result.blog, { id: Post.id, reblog_key: Post.reblog_key, comment: result.comment, tags: result.tags, state: 'queue' }, function (err, data) {
			if (err) {
				return console.log (err);
			}
			console.log(data);
		
			commandGet(Post);
		});
	});
}

var draftPost = function (Post) {
	prompt.get(['blog', 'comment', 'tags'], function(err,result) {
		if (err) {
			return console.log (err);
		}
		
		client.reblog(result.blog, { id: Post.id, reblog_key: Post.reblog_key, comment: result.comment, tags: result.tags, state: 'draft' }, function (err, data) {
			if (err) {
				return console.log (err);
			}
			console.log(data);
		
			commandGet(Post);
		});
	});
}

var makePost = function (Post) {
	prompt.get(['blog', 'title', 'body', 'tags'], function(err, result) {
		if (err) {
			console.log (err);
			commandGet(Post);
		} else {
			client.text(result.blog, {  
				title: result.title,
				body: result.body,
				tags: result.tags
				},
				function (err, success) {
					if (err) { return console.log (err); }
					console.log(success);
					commandGet(Post);
				}
			);
		}
	});
}

var deletePost = function (Post) {
	client.deletePost(Post.blog_name, Post.id, function (err, data) {
		if (err) {
			console.log (err);
			commandGet(Post);
		} else {
			console.log (data);
			commandGet(Post);
		}
	});
}

var viewNotes = function (Post) {
	for (var i = 0; i < Post.notes.length && i < 10; i++) { //currently only displaying 10 notes to prevent logging 10,000+ notes on popular posts
		switch (Post.notes[i].type) {
			case "like":
				console.log (Post.notes[i].blog_name + " liked this");
				break;
			
			case "reblog":
				if (Post.notes[i].added_text !== undefined && Post.notes[i].added_text !== null && Post.notes[i].added_text !== "") {
					console.log (Post.notes[i].blog_name + " reblogged this and said " + Post.notes[i].added_text);
				} else {
					console.log (Post.notes[i].blog_name + " reblogged this");
				}
				break;
				
			case "reply":
				console.log (Post.notes[i].blog_name + " replied: " + Post.notes[i].reply_text);
			default:
				console.log (Post.notes[i].blog_name + " " + Post.notes[i].type + " this"); //this is going to say "blogger like this" if someone liked a post, but i'm not going to put in a switch or anything for this yet bc there are more important things than grammar
				break;
		}
	}
	commandGet(Post);
}

var commandGet = function (Post) {
	prompt.get(['command'], function(err,result) {
		if (err) {
			return console.log(err);
		}
		
		switch (result.command) {
			case "like":
				likePost(Post);
				break;
				
			case "unlike":
				unlikePost (Post);
				break;
				
			case "reblog":
				reblogPost(Post);
				break;
				
			case "queue":
				queuePost(Post);
				break;
				
			case "draft":
				draftPost(Post);
				break;
				
			case "next":
				console.log("");
				dashNext();
				break;
				
			case "notes":
				viewNotes(Post);
				break;
				
			case "post":
				makePost(Post);
				break;
				
			case "delete":
				deletePost(Post);
				break;
				
			case "refresh":
				initDash();
				break;
				
			case "quit":
				console.log ("Exiting Dashboard");
				break;
				
			default:
				console.log ("possible commands:");
				console.log ("\tlike");
				console.log ("\tunlike");
				console.log ("\treblog");
				console.log ("\tqueue");
				console.log ("\tdraft");
				console.log ("\tnext");
				console.log ("\tnotes");
				console.log ("\tpost");
				console.log ("\tdelete");
				console.log ("\trefresh");
				console.log ("\tquit");
				
				commandGet(Post);
				break;
		}
	});
}

initDash();
