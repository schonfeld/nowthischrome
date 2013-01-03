$(function() {
  var bg = chrome.extension.getBackgroundPage()
      , posts = bg.readPosts()
      , ul = $('#new-posts ul')
      , lastUpdate = $('#last-update')
      ;

  var shouldToggleView = function() {
    if(!ul.children().length) {
      $('#new-posts').hide();
      $('#check-back').show();
    }
  }

  var render = function() {
    lastUpdate.html('(last updated: ' + localStorage.lastUpdateFormatted + ')');

    if(posts.length) {
      ul.empty();

      posts.forEach(function(post) {
        var li = "<li><a href='" + post.link + "' data-id='" + post.id + "'><img src='" + post.thumb + "' /><span><b>" + post.title + "</b><em>" + post.body + "</em><i>Uploaded " + post.created + "</i></span></a></li>";
        ul.prepend(li);
      });
    } else {
      shouldToggleView();
    }
  }

  $(document).on('click', '#new-posts ul li a', function(e) {
    e.preventDefault();

    var el = $(this)
        , href = el.attr('href')
        , id = el.data('id');
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
  
  $('#mark-all').click(function() {
    bg.savePosts([]);

    ul.empty();
    shouldToggleView();
  });

  lastUpdate.click(function() {
    $(this).html('(updating...)');

    var now = localStorage.lastUpdate;
    bg.checkNewPosts();

    var updateChecker = setInterval(function() {
      if(localStorage.lastUpdate != now) {
        clearInterval(updateChecker);
        render();
      }
    }, 500);
  });
  
  render();
});