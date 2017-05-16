# tumblr_apps
Applications for blog management.

These functions are meant for serverside manipulation of blog data.
These functions were written and tested with Node.js on Ubuntu 14.04, and have been updated on Ubuntu 16.04.

You must have both Node.js and NPM installed for the installation instructions to work.

Dependencies installation:
```
> cd /path/to/project/directory
> mkdir backups htmls cache
> touch t_client.js
> npm install async fs module moment safe-readfile underscore prompt html-to-text request
> cd node_modules
> git clone https://github.com/tumblr/tumblr.js.git
> cd tumblr.js
> npm install
```

If you just want to copy and paste this into the terminal all at once, first create the project directory and then:
```
> mkdir backups htmls cache; touch t_client.js; npm install async fs module moment safe-readfile underscore prompt html-to-text request; cd node_modules; git clone https://github.com/tumblr/tumblr.js.git; cd tumblr.js; npm install
```

Note that the directories "./backups" and "./htmls" are required for some functions to run.

You will also need your own Tumblr API keys:

In t_client.js place this code:
```
var tumblr = require('tumblr.js');
var module = require('module');

var client = tumblr.createClient({
  consumer_key: consumer_key_here,
  consumer_secret: consumer_secret_here,
  token: token_here,
  token_secret: token_secret_here
});

exports.client = client;
```
Replace "consumer_key_here", "consumer_secret_here", "token_here", and "token_secret_here" with their respective keys.

As far as I can tell, the Tumblr JavaScript API only allows you to offset up to 250 posts. All offsets more than 250 are treated as an offset of 0. I don't know why they do this, but it means that dashboard.js is only capable of retrieving posts 250 deep into the dashboard (so you might only be able to traverse a fraction of that many posts before being looped back to the first 20 posts over and over again. The exact number of posts you'll be able to get through depends on how quickly people you follow are posting.).
 
