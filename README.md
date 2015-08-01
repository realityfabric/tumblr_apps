# tumblr_apps
Applications for blog management

these functions are meant for serverside manipulation of blog data
these functions were written and tested with node.js on Ubuntu 14.04

dependencies installation:
```
> cd /path/to/project/directory
> mkdir backups
> mkdir htmls
> npm install async fs module moment safe-readfile underscore
> cd node_modules
> git clone https://github.com/tumblr/tumblr.js.git
> mv tumblr.js tumblr
> cd tumblr
> npm install
```

note that dir "./backups" and "./htmls" are required for some functions to run

you will also need your own api keys

in main.js, replace "consumer_key_here", "consumer_secret_here", "token_here", and "token_secret_here" with their respective keys
```
var client = tumblr.createClient({
  consumer_key: consumer_key_here,
  consumer_secret: consumer_secret_here,
  token: token_here,
  token_secret: token_secret_here
});
```

I'm mostly just putting this code here so I don't accidentally delete it all (again)
