var track = null;
var currentUrl;
var baseUrl = "trakfire.com";
var postEndpoint = "/posts";
var authEndpoint = "/logins";
var user = localStorage.get("tf-user");

var baseSelector = "#base-container";
var loginViewFields = ["#handle_field", "#password_field"];
var postFormViewFields = ["#genre_field", "#title_field", "#artist_field", "#url_field", "#alert_field"];
var views = [ 
	"login": { "fields" : loginViewFields, "html" : "" },
	"post-form": { "fields" :  postFormViewFields, "html" : "" }
];

var soundcloud = SC.initialize({
    client_id: '9999309763ba9d5f60b28660a5813440',
    redirect_uri: 'https://trakfire.com'
});


// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  console.log('fetching ' + tab.url + '...');
  chrome.tabs.executeScript({
    code: fetch(tab.url)
  });
});

/* post a login attempt to the tf server */

function login() {
	var handle = $("#handle_field").val();
	var password = $("#password_field").val();

	console.log("credentials to auth", handle, password);
	authenticate(handle, password)
}	

/* Resolve a sc url to the track object */

function fetch(url) {
	soundcloud.resolve(url)
	.then( function( data ) {
		console.log('acquired the url', url);
		track = parse(data);
	}).catch( function( error ) {
		console.log('caught an error');
	});
}

/* Load or reset a view based on authentication attempt*/

function handleAuthResponse(status, user) {
	if(status == "200") {
		localStorage.set("tf-user", user)
		loadView('postForm');
	} else { 
		resetView('login');
	}
}

/* Reset all fields in the current view */

function resetView(viewSelector) {
	var view = pages[viewSelector];
	if(!view) return;
	for(selector in view) {
		$(selector).val("");	
	}
}

/* Load a view into the main container of the popup */

function loadView(viewSelector) {
	var view = views[viewSelector];
	if (!view) return;
	$(baseSelector).html("");
	$(baseSelector).html(view.html);
}

/* Extract interesting data from large sc JSON payload */

function parse(data) {
	var obj = JSON.parse(data);
	return { 
		artist: obj.user.username,
		title: obj.title,
		url: obj.permalink_url,
		stream_url: obj.stream_url,
		duration: obj.duration
	};
}

function submit(track) {
	if(track) {
		post(track);
	} else {
		console.log("No track to post");
	}
}

/* AJAX helper to post to server */

function post(data) {
	$.ajax ({
		type: "POST",
		url: baseUrl + postEndpoint,
		data: { user:  user, post: data },
		success: function(data){
		    console.log(data);
		    if(data.status == "200") {
		    	console.log('Thanks for the new heat fam');
		    } else {
		    	console.log("We already have that track your late brother");
		    }
		}
	});
}

/* AJAX helper to auth with server */

function authenticate(handle, password, callback) {
	console.log(handle, password);
	$.ajax ({
		type: "POST",
		url: baseUrl + authEndpoint,
		data: { handle:  hanlde, password: password },
		success: function(data){
		    console.log(data);
		    if(data.status == "200") {
		    	console.log('auth complete');
		    	callback(data.status, data.user);
		    } else {
		    	console.log("auth failed");
		    	callback(data.status, {});
		    }
		}
	});
}