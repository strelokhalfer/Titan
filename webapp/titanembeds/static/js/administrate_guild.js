$('#unauth_users').change(function() {
    var pathname = window.location.pathname;
    var checked = $(this).is(':checked')
    var payload = {"unauth_users": checked}
    $.post(pathname, payload, function(data) {
      Materialize.toast('Updated guest users setting!', 2000)
    });
});

$('#visitor_view').change(function() {
    var pathname = window.location.pathname;
    var checked = $(this).is(':checked')
    var payload = {"visitor_view": checked}
    $.post(pathname, payload, function(data) {
      Materialize.toast('Updated visitor mode setting!', 2000)
    });
});

$('#chat_links').change(function() {
    var pathname = window.location.pathname;
    var checked = $(this).is(':checked')
    var payload = {"chat_links": checked}
    $.post(pathname, payload, function(data) {
      Materialize.toast('Updated chat links setting!', 2000)
    });
});

$('#bracket_links').change(function() {
    var pathname = window.location.pathname;
    var checked = $(this).is(':checked')
    var payload = {"bracket_links": checked}
    $.post(pathname, payload, function(data) {
      Materialize.toast('Updated embed links setting!', 2000)
    });
});

$("#mentions_limit").keyup(function(event){
    if(event.keyCode == 13){
      var pathname = window.location.pathname;
      var value = $("#mentions_limit").val()
      var payload = {"mentions_limit": value}
      $.post(pathname, payload, function(data) {
        Materialize.toast('Updated mentions limit setting!', 2000)
      });
    }
});

$("#discordio").keyup(function(event){
    if(event.keyCode == 13){
      var pathname = window.location.pathname;
      var value = $("#discordio").val()
      var payload = {"discordio": value}
      $.post(pathname, payload, function(data) {
        Materialize.toast('Updated Discord.io setting!', 2000)
      });
    }
});

function initiate_ban(guild_id, user_id) {
  var reason = prompt("Please enter your reason for ban");
  var payload = {
    "reason": reason,
    "guild_id": guild_id,
    "user_id": user_id,
  }
  var pathname = document.location.origin + "/user/ban"

  if (reason != null) {
    $.post(pathname, payload)
      .done(function(){
        location.reload();
      })
      .fail(function(xhr, status, error) {
        if (error == "CONFLICT") {
          Materialize.toast('User is already banned!', 2000)
        } else {
          Materialize.toast('An error has occured!', 2000)
        }
      });
  }
}

function remove_ban(guild_id, user_id) {
  var payload = {
    "guild_id": guild_id,
    "user_id": user_id,
  }
  var pathname = document.location.origin + "/user/ban"

  $.ajax({
      url: pathname + '?' + $.param(payload),
      type: 'DELETE',
      success: function() {
        location.reload();
      },
      error: function(jqxhr, status, error) {
        if (error == "CONFLICT") {
          Materialize.toast('User is already pardoned!', 2000)
        } else {
          Materialize.toast('An error has occured!', 2000)
        }
      }
  });
}

function revoke_user(guild_id, user_id) {
  var payload = {
    "guild_id": guild_id,
    "user_id": user_id,
  }
  var confirmation = confirm("Are you sure that you want to kick user?")
  var pathname = document.location.origin + "/user/revoke"
  if (confirmation) {
    $.post(pathname, payload)
      .done(function(){
        location.reload();
      })
      .fail(function(xhr, status, error) {
        if (error == "CONFLICT") {
          Materialize.toast('User is already revoked!', 2000)
        } else {
          Materialize.toast('An error has occured!', 2000)
        }
      });
  }
}
