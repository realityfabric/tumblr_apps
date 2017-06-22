var tumblr = require('./t_client.js').client;
var module = require('module');

var TumblrAPIWrapper = {

        blogInfo: tumblr.blogInfo,
        
        blogAvatar: tumblr.blogAvatar,

        blogLikes: tumblr.blogLikes,

        blogFollowers: tumblr.blogFollowers,
        
        blogPosts: tumblr.blogPosts,

        blogQueue: tumblr.blogQueue,
        
        blogDrafts: tumblr.blogDrafts,
        
        blogSubmissions: tumblr.blogSubmissions,
        
        userInfo: tumblr.userInfo,
        
        userDashboard: tumblr.userDashboard,
        
        userFollowing: tumblr.userFollowing,
        
        userLikes: tumblr.userLikes,
        
        taggedPosts: tumblr.taggedPosts,
        
        createPost: tumblr.createPost,
        
        editPost: tumblr.editPost,

        reblogPost: tumblr.reblogPost,
        
        deletePost: tumblr.deletePost,
        
        followBlog: tumblr.followBlog,
        
        unfollowBlog: tumblr.unfollowBlog,
        
        likePost: tumblr.likePost,
        
        unlikePost: tumblr.unlikePost
}

exports.TumblrAPIWrapper = TumblrAPIWrapper;
