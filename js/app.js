var APP = APP || {};

(function() {
	'use strict';
	

	APP.pool = {};
	APP.games = {};
	APP.game = {};
	APP.rankings = {};
	
	APP.controller = {
		init: function() {
			APP.router.init();
		}
	};
	
	APP.router = {
		init: function () {

	  		routie({
			    '/games': function() {
			    	APP.page.render('games', 'https://api.leaguevine.com/v1/pools/?tournament_id=19389&order_by=[name]&access_token=82996312dc', APP.games);
				},
			    '/pool/:id': function(id) {
			    	APP.page.render('pool', 'https://api.leaguevine.com/v1/games/?pool_id='+id+'&access_token=82996312dc', APP.pool);
				},
			    '/rankings': function() {
			    	APP.page.render('rankings', 'https://api.leaguevine.com/v1/pools/?tournament_id=19389&order_by=[name]&access_token=82996312dc', APP.rankings);
				},
			    '/game/:id': function(id) {
			    	APP.page.render('game', 'https://api.leaguevine.com/v1/games/'+id+'/?access_token=82996312dc', APP.game);
				}
			    
			});
		},
		
		// Als de route veranderd wordt de goede route uit de URL gehaald en de desbetreffende route op active gezet
		change: function() {
			var route = window.location.hash.slice(2);

			if(route.indexOf('/') == 4) {
				route = route.slice(0,4);
			}
			
			var	sections = qwery('section'),
				section = qwery('[data-route=' + route + ']')[0];
				
			if (section) {
	        	for (var i=0; i < sections.length; i++){
	        		sections[i].classList.remove('active');
	        	}
	        	section.classList.add('active');
	        }

	        if (!route) {
	        	sections[0].classList.add('active');
	        }
		}
	};
	
	APP.page = {
		render: function (route, url, dataObject) {
		
			document.getElementById("loader").style.display = 'block';
			
			// De get request method van het App.ajax object wordt hier aangevraagd waarin de Leaguevine API url en het pagina object wordt doorgegeven. Daarna komt de callback functie die wordt geinitialiseerd zodra de get method een response heeft van de Leaguevine API.
			APP.ajax.get(url, dataObject, function() {
				var data = APP[route];
				
				// Als de route 'pools' is, geef dan aan de transparancy functie een aantal directives mee om de goede pool-ID in de URL te zetten voor de individuele pool linkjes
				if(route == 'games') {
					var directives = {
						data: {
							objects: {
								name: {
									href: function(params) {
										return 'index.html#/pool/' + this.id;
									},
									text: function() {
										return 'Pool ' + this.name;
									}
								}
							}
						}
					};
				}
				// Als de route 'pool' is, geef dan aan de transparancy functie een aantal directives mee om de goede game-ID in de URL te zetten voor de individuele game linkjes 
				else if (route == 'pool') {
					var directives = {
						name: {
							text: function() {
								return 'Games in pool ' + this.data.objects['0'].pool.name;
							}
						},
						data: {
							objects: {
								update: {
									href: function(params) {
										return 'index.html#/game/' + this.id;
									},
									text: function() {
										return ' ';
									}
								}
							}
						}				
					};
				}


				// De Transparancy library zorgt ervoor dat de opgehaalde data van de Leaguevine API bij de goede elementen wordt gebind.
				Transparency.render(qwery('[data-route='+route+']')[0], data, directives);
				
				// Active class veranderen voor nieuwe pagina
				APP.router.change();
				document.getElementById("loader").style.display = 'none';
			});
		},
		// Verwerk score
		submit: function(event) {
		
			document.getElementById("loader").style.display = 'block';
			
			// Data klaar maken voor versturen
			var senddata	=	JSON.stringify({
									game_id: document.getElementById('id').value,
									team_1_score: document.getElementById('team_1_score').value,
									team_2_score: document.getElementById('team_2_score').value,
									is_final: 'True'
								}),
				pool_id		=	document.getElementById('pool_id').value,
				url			=	"https://api.leaguevine.com/v1/game_scores/";
			
			// Post het APP.ajax object naar Leaguevine. Bij goed response volgt volgende actie:
			APP.ajax.post(url, senddata, function() {

				// redirecten naar de poule
				window.location.href = "index.html#/pool/" + pool_id;
			});
			
			// De browser behandelt de submit niet als zijn default 'gedrag'
			return false;		
		}
	}
	
	APP.ajax = {
		// Get request via XMLHttpRequest
		get: function(linkurl, obj, callback) {
			var url			= linkurl,
				xhr			= new XMLHttpRequest();

			xhr.open('GET',url,true);
			xhr.onreadystatechange = function() {
				if(xhr.readyState == 4 && xhr.status == 200){
					if(xhr.responseText != null){
						obj.data = JSON.parse(xhr.responseText);
						callback.call(obj.data);
					}
				}
			}
			xhr.send();
		},

		// Post request via XMLHttpRequest
		post: function(linkurl, senddata, callback) {
			var url		= linkurl,
			xhr			= new XMLHttpRequest();
			
			xhr.open('POST',url,true);
			xhr.setRequestHeader('Content-type','application/json');
			xhr.setRequestHeader('Authorization','bearer 82996312dc');
			xhr.onreadystatechange = function() {
				if(xhr.readyState == 4 && xhr.status == 201){
					callback.call();
				}
			}
			xhr.send(senddata);
		}
	}

	domready(function () {
		APP.controller.init();
	});
})();