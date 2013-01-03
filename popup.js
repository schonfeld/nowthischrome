$(function() {
  var bg = chrome.extension.getBackgroundPage()
      , posts = []
      , els = {
        ul: $('#new-posts ul')
        , lastUpdate: $('#last-update')
        , newPosts: $('#new-posts')
        , checkBack: $('#check-back')
        , document: $(document)
        , markAll: $('#mark-all')
      }
      ;

  var loadPosts = function() {
    posts = bg.readPosts();
  }
  
  var shouldToggleView = function() {
    if(!els.ul.children().length) {
      els.newPosts.hide();
      els.checkBack.show();
    }
  }

  var render = function() {
    els.lastUpdate.html('(last updated: ' + localStorage.lastUpdateFormatted + ')');

    loadPosts();
    if(posts.length) {
      els.ul.empty();

      posts.forEach(function(post) {
        var li = "<li><a href='" + post.link + "' data-post-id='" + post.id + "'><img src='" + post.thumb + "' /><span><b>" + post.title + "</b><em>" + post.body + "</em><i>Uploaded " + post.created + "</i></span></a></li>";
        els.ul.prepend(li);
      });
    } else {
      shouldToggleView();
    }
  }

  els.document.on('click', '#new-posts ul li a', function(e) {
    e.preventDefault();

    var el = $(this)
        , href = el.attr('href')
        , id = el.data('post-id');
        ;

    // Remove this post form the stack
    for(var i=0; i<posts.length; i++) {
      if(posts[i].id == id) {
        posts.splice(i, 1);
        break;
      }
    }
    bg.savePosts(posts);

    // Remove from new posts list
    el
      .parent()
      .remove();

    shouldToggleView();

    // Open link in new tab
    chrome.tabs.create({url: href});

    return false;
  });

  els.markAll.click(function(e) {
    e.preventDefault();

    bg.savePosts([]);
    els.ul.empty();
    shouldToggleView();
    
    return false;
  });

  els.lastUpdate.click(function(e) {
    e.preventDefault();

    els.lastUpdate.html('(updating...)');

    var now = localStorage.lastUpdate;
    bg.checkNewPosts();

    var updateChecker = setInterval(function() {
      if(localStorage.lastUpdate != now) {
        clearInterval(updateChecker);
        render();
      }
    }, 500);

    return false;
  });
  
  // Init application...
  render();
});