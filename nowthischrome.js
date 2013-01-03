/****************************
 * BEGIN Helper functions
 ****************************/
var formatPostDate = function(timestamp) {
  var date = new Date(timestamp);

  return date.getHours() + ':' + ('0' + date.getMinutes()).slice(-2) + ' ' + (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear()
}

var readPosts = function() {
  return JSON.parse(localStorage.posts);
}

var updateBadge = function() {
  if(count = readPosts().length) {
    chrome.browserAction.setBadgeText({text: '' + count});
  } else {
    chrome.browserAction.setBadgeText({text: ''});
  }
  
  return true;
}

var saveLastUpdate = function() {
  var now = new Date().getTime();

  localStorage.lastUpdate = now;
  localStorage.lastUpdateFormatted = formatPostDate(now);
  
  return true;
}

var savePosts = function(posts, shouldSort) {
  if(typeof shouldSort == 'undefined') { shouldSort = true; }
  
  localStorage.posts = JSON.stringify(posts);

  shouldSort && sortPosts();
  updateBadge();

  return true;
}

var sortPosts = function() {
  var posts = readPosts();

  posts.sort(function(a, b) {
    if(a.created_ts < b.created_ts) return -1;
    if(a.created_ts > b.created_ts) return 1;

    return 0;
  });

  savePosts(posts, false);

  return true;
}

var reset = function() {
  localStorage.clear();
  savePosts([]);

  return true;
}
/****************************
 * END Helper functions
 ****************************/

/****************************
 * BEGIN Core functions
 ****************************/
var checkNewPosts = function() {
  var url = 'https://www.rebelmouse.com/core/frontpage/new_posts/?site_id=40552'

  if(localStorage.lastPost) {
    url += '&since_id=' + localStorage.lastPost;
  }

  jx.load(url, function(data) {
    if(data.new_posts_count) {
      data.new_posts_list.forEach(function(post) {
        addNewPost(post);
      });

      localStorage.lastPost = data.new_posts_list[0];
    }
  }, 'json');

  saveLastUpdate();
  
  return true;
}

var addNewPost = function(id) {
  var url = 'https://www.rebelmouse.com/core/feeds/site/posts/40552/' + id;

  jx.load(url, function(data) {
    var post = {
      id: id
      , title: data.headline
      , body: data.body
      , thumb: data.image210x
      , link: data.original_url
      , created_ts: data.created_ts
      , created: formatPostDate(data.created_ts * 1000)
    };

    var posts = readPosts();
    posts.push(post);
    savePosts(posts);
  }, 'json');
  
  return true;
}
/****************************
 * END Core functions
 ****************************/


/****************************
 * Application init...
 ****************************/
if(!localStorage.posts) { savePosts([]); } // Init first time use...

document.addEventListener('DOMContentLoaded', function() {
  updateBadge();
  checkNewPosts();
  setInterval(checkNewPosts, 60 * 1000);
});