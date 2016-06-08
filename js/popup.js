var track = null;
var base_url = "https://api.soundcloud.com";
var endpoints = {tracks: "/tracks", resolve: "/resolve"};
var client_id = '9999309763ba9d5f60b28660a5813440';
var auth_endpoint = "http://localhost:3000/logins/auth";
var post_endpoint = "http://localhost:3000/posts";

$(function() {
  // check localStorage to see if the user has logged in or not
  var isLoggedIn = localStorage.getItem('jwt');
  if(!!isLoggedIn) {
  	  //show the post page (hide auth view)
  	  $("#auth-view").addClass("hide");
  	  //make sure the post page is visible
  	  $("#post-view").removeClass("hide");
  	  //if so, grab the track info and display it
	  chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
	    console.log(tabs[0].url);
	    var url = tabs[0].url;
	    if (validateUrl(url)){
	    	fetch(url);
	    } else {
	    	console.log("bad url");
	    }
	  });
  }

  $('#continue-btn').click(function() {
  	submit(track);
  });

  $('#signin-btn').click(function() {
  	login();
  });

});

function validateUrl(url) {
	var parser = document.createElement('a');
	parser.href = url;
	console.log(parser.hostname);
	return (parser.hostname == "soundcloud.com");
}

function login() {
	var handle = $("#handle_field").val();
	var password = $("#password_field").val();

	console.log("credentials to auth", handle, password);
	if(!!handle && !!password){ authenticate(handle, password, handleAuthResponse); }
	else { resetView("auth-view"); }
}	

/* Resolve a sc url to the track object */

function fetch(url) {
	console.log("fetching ", url);
	resolve(url);
}

/* Load or reset a view based on authentication attempt*/

function handleAuthResponse(response) {
	if(response.status == "200") {

		localStorage.setItem("jwt", response.jwt);
		localStorage.setItem("user", response.user);
		loadView('post-view');

	} else { 

		resetView('auth-view');

	}
}

/* Reset all fields in the current view */

function resetView(view) {
	if(view == "auth-view") {

		$("handle_field").val("");
		$("password_field").val("");

	} else if(view == "post-view"){

		$("artist_field").val("");
		$("title_field").val("");
		$("track_img").attr("src", "img/tf_placeholder.png");

	}
}

function invert(view) {
	if(view == "auth-view") {
		return "post-view";
	} else {
		return "auth-view";
	}
}

/* Load a view into the main container of the popup */

function loadView(view) {
	var other = invert(view);
	$("#"+other).addClass("hide");
	$("#"+view).removeClass("hide");
	if(view == "post-view") {
	  	chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
		    console.log(tabs[0].url);
		    var url = tabs[0].url;
		    if (validateUrl(url)){
		    	fetch(url);
		    } else {
		    	console.log("bad url");
		    }
	  	});
  	}
}

function showAlert(type, msg) {
	console.log("setting the alert");
	if(type == "error"){
		$("#alert").addClass("alert-danger");
	} else if(type == "success") {
		$("#alert").addClass("alert-success");
	}

	$("#alert_msg").html(msg);
	$("#alert").removeClass("hide");
}
/* Extract interesting data from large sc JSON payload */

function parse(data) {
	var obj = data; //JSON.parse(data);
	return { 
		artist: obj.user.username,
		title: obj.title,
		url: obj.permalink_url,
		stream_url: obj.stream_url,
		duration: obj.duration, 
		img_url: obj.artwork_url,
		genre: "HIPHOP ELECTRONIC VOCALS"
	};
}

function showTrackData(track) {
	$("#title_field").val(track.title) //= track.title;
	$("#artist_field").val(track.artist) //= track.artist;
	$("#track_img").attr("src", track.img_url) 
}

function submit(track) {
	if(track) {
		post(track);
	} else {
		console.log("No track to post");
	}
}

function buildUrl(endpoint, url) {
	return base_url + "/resolve" + "?url=" + url + "&" + "client_id="+ client_id;
}

/* AJAX helper to post to server */

function post(data) {

	var jwt  = localStorage.getItem('jwt');

	$.ajax ({
		type: "POST",
		url: post_endpoint,
		data: { post: data },
	 	headers: {'Authorization': localStorage.getItem('jwt')},
		success: function(data){
		    console.log(data);
		    if(data.status == 201) {
		    	console.log(data.status, 'Thanks for the new heat fam');
		    	showAlert("success", 'Thanks for the new heat fam');
		    }
		}, 
		error: function(xhr, status, err) {
    		if(err == "Unprocessable Entity") {
    			console.log("You're late brother we already have that track.");
    			showAlert("error", "You're late brother we already have that track.");
    		}
		}
	});
}

/* AJAX helper to auth with server */

function authenticate(handle, password, callback) {
	console.log(handle, password);
	$.ajax ({
		type: "POST",
		url: auth_endpoint,
		data: { handle:  handle, password: password },
		success: function(data){
		    console.log("Auth response", data);
		    if(data.status == "200") {
		    	console.log('auth complete');
		    	callback(data);
		    } else {
		    	console.log("auth failed");
		    	callback(data.status, {});
		    }
		}
	});
}

function resolve(url) {
	$.ajax ({
		type: "GET",
		url: buildUrl("resolve", url),
		success: function(data){
			console.log("DATA", data);
			track = parse(data);
			console.log(track);
			if(track) {
				showTrackData(track);
			}
		}
	});	
}

