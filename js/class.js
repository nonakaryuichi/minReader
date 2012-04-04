//get feed api
google.load("feeds", "1");


/* ************************
 * App Class
 * 
 * ********************* */
var App = {};


/* ------------------------
 * minReader Class
 * --------------------- */
App.minReader = function(){
	//options
	this.options = {
		state: 0,
		maxFeedLength: 100
	}

	//names
	this.names = {
		storage: {
			feeds   : "feeds",
			articles: "articles"
		}
	}

	//dom
	this.$ = {
		feedList       : $("#feedList"),
                feedContiner   : $("#feedContiner"),
		curentListItem : '',
		curentFeedItem : ''
	}

	//mode
	this.mode = 'list';

        //select feed
        this.selectFeed;

	//storage
	this.storage = new this.model(this.names);
}


/* ------------------------
 * Controler
 * --------------------- */
App.minReader.prototype.controler = function(){
	var method = this;

	//load
	this.$.feedList.find("li .selector").live('click', function(){
		$this = $(this);

		//drow
		method.viewFeeds($this.data('feedlink'));
	});

	//del feed
	this.$.feedList.find("li .delete").live('click', function(){
		$this = $(this);

		//drow
		method.removeFeeds($this.data('feedURL'), function(){
			$this.parent().fadeOut(500, function(){
				$(this).remove();
			});
		});
	});

	//add feed
	$("#feedURLSet #feedURLSubmit").live("click", function(){
		var url = $("#feedURLInput").val();
		if(url.match(/(http|ftp):\/\/[!#-9A-~]+\.+[a-z0-9]+/i)){
			method.addFeeds(url, url);
			method.loadFeed(url, 10);
		} else {
			alert("URL Error");
		}
	});


        //key event
        $(window).keydown(function(e){
		switch (e.keyCode) {
			//left key
			case 37:
				method.selectMode(37);
			break;

			//right key
			case 39:
				method.selectMode(39);
				method.$.curentFeedItem = '';
			break;

			//up
			case 38:
				switch (method.mode){
					case "list":
						method.listMode(38);
					break;

					case "feeds":
						method.feedMode(38);
					break;
				}
			break;

			//down
			case 40:
				switch (method.mode){
					case "list":
						method.listMode(40);
					break;

					case "feeds":
						method.feedMode(40);
					break;
				}
			break;
		}
                return false;
        });
}


/* ------------------------
 * Model
 * --------------------- */
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

/* ------------------------
 * Initialize
 * --------------------- */
App.minReader.prototype.init = function(){
	var method = this;
	var feeds = $.parseJSON(localStorage[this.names.storage.feeds]);
	var feedCount = 0;

	//set feeds
	if(feeds){
		this.storage.feeds(feeds);
	} else {
		this.storage.feeds({});
	}


	this.storage.articles({});
	this.loader();
	this.loaderChecker();
	this.controler();
}


/* ------------------------
 * Feed load
 * --------------------- */
App.minReader.prototype.loaderChecker = function(){
	var method = this;
	var articles = method.storage.articles();
	var feeds    = method.storage.feeds();

	if(feeds.length === articles.length){
		method.viewFeedList();
		$("#splashScreen").delay(5000).fadeOut(500);
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
	
	for(var d in feeds){
		//add Articles
		this.loadFeed(feeds[d], this.options.maxFeedLength);
	}
}

//load Feed
App.minReader.prototype.loadFeed = function(url, length){
	var method = this;
	var feed = new google.feeds.Feed(url);

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
			method.addArticles(data.feedUrl, data);
			method.addFeedList(data.feedUrl, data.title, data.items.length);
		} else {
			alert("load Error");
		}
	});
}

//feed Counter
App.minReader.prototype.feedCounter = function(){
	var feeds = this.storage.feeds();
	return feeds.length;
}


/* ------------------------
 * List
 * --------------------- */
App.minReader.prototype.addFeedList = function(url, title, num){
	this.$.feedList.prepend(
		$("<li>")
			.addClass("item")
			.append(
				$("<a>")
					.addClass("delete")
					.attr("href", "javascript:void(0)")
					.data("feedURL", url)
					.html("×")
			)
			.append(
				$("<a>")
					.addClass("selector")
					.attr({
                                                "href":"javascript:void(0)",
                                                "id":""
                                        })
					.data("feedlink", url)
                                        .append(
                                                $("<span>")
                                                        .addClass("title")
                                                        .html(title)
                                        )
                                        .append(
                                                $("<span>")
                                                        .addClass("count")
                                                        .html(num)
                                        )
			)
				
	);
}


//view List
App.minReader.prototype.viewFeedList = function(){
	var method   = this;
	var articles = this.storage.articles();
	var feeds    = this.storage.feeds();

	this.$.feedList.find("*").remove();
        
	for(var i in articles){
		var feed = articles[i];
		this.addFeedList(feed['feedUrl'], feed['title'], feed.items.length);
	}

	//add new feed input
	this.$.feedList.append(
		$("<li>")
			.attr("id", "feedURLSet")
			.append(
				$("<p>")
					.addClass("icon")
					.html("＋")
			)
			.append(
				$("<input>")
					.addClass("input")
					.attr({
						"id":"feedURLInput",
						"type":"url"
					})
					.val("")
			)
			.append(
				$("<a>")
					.addClass("button")
					.attr({
						"href": "javascript:void(0)",
						"id": "feedURLSubmit"
					})
					.html("Add Feed")
			)
				
	);
}


/* ------------------------
 * Add and Remove
 * --------------------- */
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


/* ------------------------
 * view feed
 * --------------------- */
App.minReader.prototype.viewFeed = function(entry, num){
        //var
        var method = this;

        //DOM chenge
        method.$.feedContiner
        .append(
                $("<article>")
                        .hide()
                        .attr("id","feedItem" + num)
                                .addClass("article")
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
                                .delay(200 * num)
                                .fadeIn(200)
                );
}

App.minReader.prototype.viewFeeds = function(feedURL){
	var method = this;

	//feed
	var feeds = this.storage.articles();
	var feed  = feeds[feedURL];

	//var & reset
	method.$.feedContiner.find("*").remove();
	//entry title
	method.$.feedContiner.append(
		$("<h2>")
			.addClass("feedTitle")
			.attr("title", feed.description)
			.html(feed.title)
			.append(
				$("<span>")
					.addClass("count")
					.html(feed.items.length)
			)
	)
	.append(
		$("<p>")
			.addClass("feedUrl")
			.append(
				$("<a>")
					.attr("href", feed.url)
					.html(feed.url)
			)
	);

	//feed roop
	for (var i = 0; i < feed.items.length; i++) {
                method.viewFeed(feed.items[i], i);
	}
}


App.minReader.prototype.selectMode = function(keycode) {
	var method = this;

	//action
	switch (keycode) {
		case 37:
			method.mode = 'list';
		break;

		case 39:
			method.mode = 'feeds';
			method.viewFeeds(method.$.curentListItem.find('.selector').data('feedlink'));
		break;
	}
}

App.minReader.prototype.feedMode = function(keycode) {
	var method = this;

	//action
	switch (keycode) {
		case 38:
			method.animateFeed('prev');
		break;

		case 40:
			method.animateFeed('next');
		break;
	}
}

App.minReader.prototype.listMode = function(keycode) {
	var method = this;

	//action
	switch (keycode) {
		case 38:
			method.animateList('prev');
		break;

		case 40:
			method.animateList('next');
		break;
	}
}


App.minReader.prototype.animateList = function(mode) {
	var method = this;
	var $targets = method.$.feedList.find(".item");

	switch (mode){
		case 'next':
			if(!method.$.curentListItem.length){
				method.$.curentListItem = $targets.eq(1);
			} else {
				if(method.$.curentListItem.next().length){
					method.$.curentListItem = method.$.curentListItem.next('.item');
				} else {
					method.$.curentListItem = $targets.eq(0);
				}
			}
		break;

		case 'prev':
			if(!method.$.curentListItem.length){
				method.$.curentListItem = $targets.eq(0);
			} else {
				if(method.$.curentListItem.prev().length){
					method.$.curentListItem = method.$.curentListItem.prev('.item');
				} else {
					method.$.curentListItem = $targets.eq(-1);
				}
			}
		break;
	}
	
	var margin = method.$.curentListItem.position().top;
	method.$.feedList.stop().animate({
		marginTop : (0 - margin)
	},
	{
		duration:300
	});
}



App.minReader.prototype.animateFeed = function(mode) {
	var method = this;
	var $targets = method.$.feedContiner.find(".article");

	switch (mode){
		case 'next':
			if(!method.$.curentFeedItem.length){
				method.$.curentFeedItem = $targets.eq(1);
			} else {
				if(method.$.curentFeedItem.next().length){
					method.$.curentFeedItem = method.$.curentFeedItem.next('.article');
				} else {
					method.$.curentFeedItem = $targets.eq(0);
				}
			}
		break;

		case 'prev':
			if(!method.$.curentFeedItem.length){
				method.$.curentFeedItem = $targets.eq(0);
			} else {
				if(method.$.curentFeedItem.prev().length){
					method.$.curentFeedItem = method.$.curentFeedItem.prev('.article');
				} else {
					method.$.curentFeedItem = $targets.eq(-1);
				}
			}
		break;
	}
	
	var margin = method.$.curentFeedItem.position().top;
	method.$.feedContiner.stop().animate({
		marginTop : (0 - margin - 100)
	},
	{
		duration:300
	});
}


/* ------------------------
 * onLoad
 * --------------------- */
google.setOnLoadCallback(function(){
	var minReader = new App.minReader();
	minReader.init();
});
