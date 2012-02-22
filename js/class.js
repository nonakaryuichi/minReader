//get feed api
(function($){
	var feeds = [];

	google.load("feeds", "1");

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
							/*
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
														console.log($body);
														$body.load($this.data("readmore"));
													})
											)
									)
							)
							*/
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
		$("#feedList li a").click(function(){
			$this = $(this);

			//drow
			initialize($this.data('feedlink'));
		});
		
	});
})(jQuery);
