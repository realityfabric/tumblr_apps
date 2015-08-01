# tumblr_apps
Applications for blog management

these functions are meant for serverside manipulation of blog data
these functions were written and tested with node.js on Ubuntu 14.04

You must have both Node.JS and NPM installed for the installation instructions to work 

dependencies installation:
```
> cd /path/to/project/directory
> mkdir backups
> mkdir htmls
> touch t_client.js
> npm install async fs module moment safe-readfile underscore
> cd node_modules
> git clone https://github.com/tumblr/tumblr.js.git
> cd tumblr.js
> npm install
```

note that dir "./backups" and "./htmls" are required for some functions to run

you will also need your own api keys:

in t_client.js place this code
```
var tumblr = require('tumblr');
var module = require('module');

var client = tumblr.createClient({
  consumer_key: consumer_key_here,
  consumer_secret: consumer_secret_here,
  token: token_here,
  token_secret: token_secret_here
});

exports.client = client;
```
replace "consumer_key_here", "consumer_secret_here", "token_here", and "token_secret_here" with their respective keys

I'm mostly just putting this code here so I don't accidentally delete it all (again)
