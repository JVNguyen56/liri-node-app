var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var request = require('request');
var fs = require("fs");

var action = process.argv[2];
var checkBlank = process.argv[3];
var userInput = process.argv;
var myTweet = '';
var getSpotify= '';
var getMovie = '';

//if no input 
if (checkBlank === undefined){
	myTweet = 'JVNguyen56';
	getSpotify = 'The+Sign';
	getMovie = 'Mr.+Nobody';	
}
else{
	//replace or elminate spaces
	for (var i = 3; i <userInput.length; i++){

		if (i > 3 && i < userInput.length){
			myTweet = myTweet + userInput[i];
			getSpotify = getSpotify + '+' + userInput[i];
			getMovie = getMovie + '+' + userInput[i];
		}
		else {
			myTweet += userInput[i];
	    	getSpotify += userInput[i];
	    	getMovie += userInput[i];
	  	}
	}
}

//switching between calls
if (action === 'do-what-it-says'){
	doThings();
}else {
	caseSwitch();
}

function caseSwitch(){
	switch(action){
	  case 'my-tweets':
	    tweets();
	    break	
	  case 'spotify-this-song':
	    spotifyThis();
	    break
	 case 'movie-this':
	 	OMDBapi();
	 	break
	 default:
	    console.log("{Please enter a command: my-tweets, spotify-this-song, movie-this, do-what-it-says}");
	  break;	
	}	
}


//tweeter functions
function tweets(){

	//keys
	var client = new Twitter({
		consumer_key: process.env.TWITTER_CONSUMER_KEY,
		consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
		access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
		access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
	});

	//
	var params = {
		screen_name: myTweet,
		count: 20
	};

	client.get('statuses/user_timeline', params, function(error, tweets, response) {

		if (error) {
			var errorStr = 'ERROR: Retrieving user tweets -- ' + error;

			// Append the error string to the log file
			fs.appendFile('./log.txt', errorStr, (err) => {
				if (err) throw err;
				console.log(errorStr);
			});
			return;
		} else {
			// Pretty print user tweets
			var outputStr = '------------------------\n' +
							'User Tweets:\n' + 
							'------------------------\n\n';

			for (var i = 0; i < tweets.length; i++) {
				outputStr += 'Created on: ' + tweets[i].created_at + '\n' + 
							 'Tweet content: ' + tweets[i].text + '\n' +
							 '------------------------\n';
			}

			// Append the output to the log file
			fs.appendFile('./log.txt', 'LIRI Response:\n\n' + outputStr + '\n', (err) => {
				if (err) throw err;
				console.log(outputStr);
			});
		}
	});
}

//spotify api
function spotifyThis(){

	//keys
	var spotify = new Spotify({
		id: process.env.SPOTIFY_ID,
		secret: process.env.SPOTIFY_SECRET
	});

	//parameters
	var spotifyPara = {
		type: 'track', 
		query: getSpotify, 
		limit: 2
	};

   	// callback
    spotify.search(spotifyPara, function(err, data) {

    	//log onto console.
	    if (err) {
	    	return console.log('Error occurred: ' + err);
	    }
			else{

			for (var i = 0; i< data.tracks.items.length; i++ ){
				var artistName = data.tracks.items[i].album.artists[0].name;
				var songName = data.tracks.items[i].name;
				var songSample = data.tracks.items[i].album.artists[0].external_urls.spotify;
				var albumName = data.tracks.items[i].album.name;

				console.log('--------------------------------\n');
				console.log('Song Information:\n');
				console.log('--------------------------------\n');
				console.log('\n'+ 'Artist: ' + artistName + '\n');
				console.log('Song Name: ' + songName + '\n');
				console.log('Preview Here: ' + songSample + '\n'); 
				console.log('Album: ' + albumName + '\n');
			

		} 
   }
  });
}    

function OMDBapi(){

	var key = process.env.OMDB_API_KEY;
  	
	var queryUrl = "http://www.omdbapi.com/?t=" + getMovie + "&y=&plot=short&apikey=" + key;

	request(queryUrl, function (error, response, data) {

		//if not movie exist
		if (JSON.parse(data).Title === undefined) {

			//taking out the + and putting back spaces
			var splitFailed = getMovie.split('+');
			var failedTitle = '';

			for (var i = 0; i < splitFailed.length; i++){

				failedTitle = failedTitle + ' ' + splitFailed[i];
			}
			console.log('Error movie title: ' + failedTitle + ' was not found');
		}

		else if(!error && response.statusCode === 200){

			console.log('----------------------------------\n');
			console.log('Movie Information:\n');
			console.log('----------------------------------\n');
			console.log("Movie Title: " + JSON.parse(data).Title + '\n');
			console.log("Year Released: " + JSON.parse(data).Year + '\n');
			console.log("IMDB Rating: " + JSON.parse(data).imdbRating + '\n');
			console.log("Country where movie was produced: " + JSON.parse(data).Country + '\n');     
			console.log("Movie Language: " + JSON.parse(data).Language + '\n');  
			console.log("Movie Plot: " + JSON.parse(data).Plot + '\n');  
			console.log("Movie Actors: " + JSON.parse(data).Actors + '\n');

			if (JSON.parse(data).Ratings[1] === undefined){
				console.log("Rotten Tomatoes Rating: Sorry no rating");
			}else{
				console.log("Rotten Tomatoes Rating: " + JSON.parse(data).Ratings[1].Value + '\n');
			} 
			console.log("------------------------------------------------"); 
		}
	});	
} 
//do things function
function doThings(){

	fs.readFile("random.txt", "utf8", function(error, data) {

		if (error) {
			return console.log(error);
		}
		else{

			//capture the varibles from txtfile
			var dataArr = data.split(",");  

			action = dataArr[0];

			if (dataArr[1] === undefined){
				myTweet = 'JVNguyen56';
				getSpotify = 'The+Sign';
				getMovie = 'Mr.+Nobody';	
			}else {

				myTweet = dataArr[1];
				getSpotify = dataArr[1];
				getMovie = dataArr[1];				
			}

			caseSwitch();     
		}
	});
}
