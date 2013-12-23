/**
	Handles the sending and reciving of links and thanks. 
	May also supply the user with  suggestions from thier linkbox/ WireBot

	@author Grant Collins (@G_LeCool)
*/

var currentUrl; 
var message;
var suggestions = [];
var lb;

//load suggestions from the server
getSuggestions();

/**
	Handling the page action behaviors
*/
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (tab.url) 
        chrome.pageAction.show(tabId);
});

chrome.pageAction.onClicked.addListener(function(tab){
	giveThanks("Sender");
});


/**
	Get the current url from the omnibox once the user presses enter
*/
chrome.omnibox.onInputEntered.addListener(function(text) {
	message = text;
	chrome.tabs.query ({
		active: true, 
		lastFocusedWindow: true}, 
		function(tab_array) {
		  	var tab = tab_array[0];
		    currentUrl = tab.url;
		  	console.log(currentUrl, message);
		  	if(message.search('@') > -1 || message.search('&') > -1) {
		  	    var temp = message.replace(/r/g, '');
		  	    message = temp;
		  	    console.log(message);
		    	send(currentUrl, message);
		    }
		    else
		    	navigate(message);
		});
});

/**
	Get and display a list of links sent to the user by friends
	and possibly a few suggestions from a WireBot?
*/
chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
	if(text == "feed") {
		var allLinks = lb.all();
		for(var i = 0; i < allLinks.length; i++) { 
			suggestions.push({ content: allLinks[0][i]['url'], description: allLinks[0][i]['title'] + ' - '+ allLinks[0][i]['url']});
	        suggest(suggestions);
    	}
	}
});


// Utilities

/**
	Stores the tags and links associated for easy retrieval 
	helper methods for getting relevant results 
*/
function LinkBox(map) {
	this.linkMap = map;

	this.get = function(tag) {
		var result = this.linkMap[tag];
		if(result){
			return result;
		}
		return "none";
	}
	this.all = function() {
		return this.linkMap;
	}
	this.addLink = function(link) {
		this.linkMap.push(link);
	}
}

function navigate(url) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.update(tabs[0].id, {url: url});
  });
}

function getSuggestions() {
	$.ajax({
		type: "POST", 
		url: "http://mighty-anchorage-6957.herokuapp.com/links/updateExtension",
		success: function(data) {
			console.log(data);
			var temp = data;

			var map = [];
			for(var i = 0; i < temp.length; i++)
				map.push(temp)

			lb = new LinkBox(map);
		}
	});
}

function addToSuggestions(newSuggestions) {
	for(var i = 0; i < newSuggestions.length; i++){
		suggestions.push(newSuggestions[i]);
	}
}

/**
	Send the link and message to the person's linkbox or email. 
*/
function send(url, text) {
	console.log(text);
	$.ajax ({
		type: "POST",
		url: "http://mighty-anchorage-6957.herokuapp.com/links/recieve",
		data: {title: text, url: url},
		success: function(data){
		    console.log("Wire sent!");
		}
	});
}

/**
	Add the link to my linkbox
*/
function save(url) {
	$.ajax ({
		type: "POST",
		url: "localhost:3000/reciever/save",
		data: {url: url},
		success: function(data){
		    console.log(data);
		}
	});
}

/**
	Suggest the link openly
*/
function suggest(url) {
	$.ajax ({
		type: "POST",
		url: "localhost:3000/reciever/suggest",
		data: {url: url},
		success: function(data){
		    console.log(data);
		}
	});
}

/**
	Give thanks for a link
*/
function giveThanks(sender) {
	$.ajax ({
		type: "POST",
		url: "localhost:3000/reciever/giveThanks",
		data: {url: url},
		success: function(data){
		    console.log(data);
		}
	});
}

/**
	Recieve thanks for a link
*/
function recieveThanks() {}

