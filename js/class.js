//get feed api
google.load("feeds", "1");
var App = {};

//view
App.minReader = function(){
	this.options = {
		state: 0
	}
	this.names = {
		storage: {
			feeds   : "feeds",
			articles: "articles"
		}
	}

	//storage
	this.storage = new this.model(this.names);
}

//initialize
App.minReader.prototype.init = function(){
	var method = this;
	var feeds = $.parseJSON(localStorage[this.names.storage.feeds]);
	var feedCount = 0;

	//var dom
	var $feedList = $("#feedList");
	
	//set feeds
	if(feeds){
		this.storage.feeds(feeds);
	} else {
		this.storage.feeds(Array());
	}


	this.storage.articles(Array());
	this.loader();

	//add event add feed
	$("#feedURLSet #feedURLSubmit").click(function(){
		var url = $("#feedURLInput").val();
		if(url.match(/(http|ftp):\/\/[!#-9A-~]+\.+[a-z0-9]+/i)){
			method.addFeeds(0, url);
		} else {
			alert("URL Error");
		}
	});

	this.loaderChecker();
}

App.minReader.prototype.loaderChecker = function(){
	var method = this;
	var articles = method.storage.articles();
	var feeds    = method.storage.feeds();

	if(feeds.length === articles.length){
		method.viewFeedList();
		return;
	}

	setTimeout(function(){
		method.loaderChecker();
	},100);
}

//load Feeds
App.minReader.prototype.loader = function(){
	var method = this;
	var feeds = this.storage.feeds();
	
	for(var i = 0; i < feeds.length; i++){
		//new feed
		var feed = new google.feeds.Feed(feeds[i]);
		var length = 10;

		//feed length
		feed.setNumEntries(length);
		//feed load
		feed.load(function(result) {
			if (!result.error) {
				var data = {};
				data.title       = result.feed.title;
				data.description = result.feed.description;
				data.feedUrl     = result.feed.feedUrl;
				data.url         = result.feed.link;
				data.items       = result.feed.entries;
				method.addArticles(0, data);
			} else {
				alert("Error");
			}
		});
	}

	

}

//feed Counter
App.minReader.prototype.feedCounter = function(){
	var feeds = this.storage.feeds();
	return feeds.length;
}

//view
App.minReader.prototype.viewFeedList = function(){
	var articles = this.storage.articles();
	var feeds = this.storage.feeds();
	var $feedList = $("#feedList");

	$feedList.find("*").remove();

	for(var i in articles){
		var feed = articles[i];
		$feedList.append(
			$("<li>")
				.addClass("item")
				.append(
					$("<a>")
						.addClass("delete")
						.attr("href", "javascript:void(0)")
						.data("feedid", i)
						.html("×")
				)
				.append(
					$("<a>")
						.addClass("selector")
						.attr("href", "javascript:void(0)")
						.data("feedlink", feed['feedUrl'])
						.html(feed['title'])
				)
					
		);
	}
}

//model
App.minReader.prototype.model = function(names){
	var feeds;
	var articles;

	return {
		feeds: function(d, callback){
			if(d){
				feeds = d;
				localStorage[names.storage.feeds] = $.stringify(feeds);
			}
			if(callback){
				callback();
			}
			return feeds;
		},
		articles: function(d, callback){
			if(d){
				articles = d;
			}
			if(callback){
				callback();
			}
			return articles;
		}
	}
}

//add Feeds
App.minReader.prototype.addFeeds = function(key, data){
	var feeds =  this.storage.feeds();
	if(key){
		feeds[key] = data;
	} else {
		feeds.push(data);
	}
	this.storage.feeds(feeds);
}

//remove Feeds
App.minReader.prototype.removeFeeds = function(key,callback){
	var feeds =  this.storage.feeds();
	delete feeds[key];

	this.storage.feeds(feeds,function(){
		if(callback){
			callback();
		}
	});
	
	
}


//add Articles
App.minReader.prototype.addArticles = function(key, data){
	var articles =  this.storage.articles();
	if(key){
		articles[key] = data;
	} else {
		articles.push(data);
	}

	this.storage.articles(articles);
}

//remove Articles
App.minReader.prototype.removeArticles = function(key){
	var articles =  this.storage.articles();
	delete articles[key];

	this.storage.articles(articles);
}



function initialize(feedURL) {
	//new feed
	var feed = new google.feeds.Feed(feedURL);
	var length = 10;

	//feed length
	feed.setNumEntries(length);
	
	//feed load
	feed.load(function(result) {
		if (!result.error) {
			//var & reset
			var $continer = $("#feedContiner");
			$continer.find("*").remove();

			//entry title
			$continer.append(
				$("<h2>")
					.addClass("feedTitle")
					.attr("title", result.feed.description)
					.html(result.feed.title)
					.append(
						$("<span>")
							.addClass("count")
							.html("（" + result.feed.entries.length + "）")
					)
			);

			//feed roop
			for (var i = 0; i < result.feed.entries.length; i++) {
				
				//var
				var entry    = result.feed.entries[i];
				//console.log(result.feed);

				//DOM chenge
				$continer
				.append(
					$("<article>")
						.attr("id","feedItem" + i)
						.addClass("article")
						.append(
							$("<ul>")
								.addClass("command")
								.append(
									$("<li>")
										.addClass("item")
										.append(
											$("<a>")
												.attr("href","javascript:void(0)")
												.data("readmore",entry.link)
												.data("feedid",i)
												.html("続きを読む")
												.click(function(){
													var $this = $(this);
													var $body = $("#feedItem" + $this.data("feedid"));
													$body.load($this.data("readmore"));
												})
										)
								)
						)
						.append(
							$("<h3>")
							.html(entry.title)
							.addClass("title")        
						)
						.append(
							$("<time>")
								.html(entry.publishedDate)
								.addClass("time")
								.attr("datetime",entry.publishedDate)
						)
						.append(
							$("<div>")
								.html(entry.content)
								.addClass("content")
						).append(
							$("<p>")
								.append(
									$("<a>")
									.attr("href",entry.link)
									.html(entry.title)
								)
								.addClass("link")
						)
				);
			}
		}
	});
}

//load initialize
google.setOnLoadCallback(function(){
	var minReader = new App.minReader();
	minReader.init();

	$("#feedList li .selector").live('click',function(){
		$this = $(this);

		//drow
		initialize($this.data('feedlink'));
	});

	$("#feedList li .delete").live('click',function(){
		$this = $(this);

		//drow
		minReader.removeFeeds($this.data('feedid'),function(){
			minReader.viewFeedList();
		});
	});
	
});
