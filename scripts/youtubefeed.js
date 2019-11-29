/*
Código encargado de manipular el feed de youtube integrado al sitio web
Comentarios traducidos por: Ángel Guzmán y Pablo Salazar
Créditos para el repositorio de github "Corycayud"
*/

//Plugin de feed de youtube
(function($) {
$.fn.youtubeFeed = function(options, callback){
	this.each(function(){
		
		//Opciones
		var settings = $.extend({
			count: 9,  /*Numero de videos para visualizar (numero por pagina si "pager" esta configurado 
			como true)*/
			key: null,   //API Key
			channelId: "UCPbfa-rcoDYAauSutm9R_Xw",   //Numero de ID del canal que mostraremos
			pager: true,  //Incluir siguiente y anterior para cargar asincrona los videos.
			prevPageText: 'Previous Page',   //Página anterior (texto)
			nextPageText: 'Next Page',    //Página siguiente (texto)
			autoplay: false,  //Habilitar autoplay para reproducir el video
			pattern: '<div class="yt-placeholder">' +
						'<a href="{{VideoEmbedUrl}}" class="yt-url">' +
							'<img class="yt-thumb" src="{{Thumbnail}}">' +
						'</a>' +
					'</div>'
		}, options);
		
		var container = this;
		
		//Inicializar los botones Next/Prev
		var currentPage = 1,
			totalPages = 0,
			pageToken = '';
		
		//ChannelId y API key son requeridos - regresa con advertencia si no esta incluido.
		if (settings.channelId === null) {
			console.warn('Error de YoutubeFeed: Debes proporcionar un ID de Canal valido');
			return false;
		}
		if (settings.key === null) {
			console.warn('Error de YoutubeFeed: Debes proporcionar una API Key valida');
			return false;
		}
		
		//Cargar el feed
		loadFeed();
	
	
		/*******************************
		 Funciones
		*******************************/
			
			/* Cargar Funciones de Youtube
			*******************************/
			function loadFeed(){
				//Limpiamos el output div
				$(container).html('');
				//Cargamos Youtube
				$.ajax({
					dataType: "json",
					url: 'https://www.googleapis.com/youtube/v3/search?key=' + settings.key + '&channelId=' + settings.channelId + '&part=snippet,id&order=date&maxResults=' + settings.count + pageToken,
					success: function(response) {
						console.log(response);
						//Creamos un elemento html por cada elemento devuelto.
						$.each(response.items, function(i, item) {
							$(container).append(createHtmlElement(item));
						});
						//Creamos los botones Next/Prev si están habilitados
						if (settings.pager) {
							$(container).append(creatNextPrevButtons(response));
						}
						//Callback
						if (typeof callback == "function") {
							callback();
						}
					}
				});
			}
			
			/* Creamos el elemento HTML a partir del objeto json.
			*******************************/
			function createHtmlElement(item) {
				//Creamos el date
				var dateLong = new Date(item.snippet.publishedAt);
				
				//URL
				var urlEmbed,
					urlVideo,
					videoId;
				//Creamos URLs - Revisamos si este elemento es al canal del icono (no un video)
				if (item.id.kind  == 'youtube#channel') {
					urlEmbed = 'http://www.youtube.com/channel/' + item.id.channelId;
					urlVideo = 'http://www.youtube.com/channel/' + item.id.channelId;
				} else {
					urlEmbed = 'http://www.youtube.com/embed/' + item.id.videoId + (settings.autoplay ? '?autoplay=1' : '');
					urlVideo = 'http://www.youtube.com/watch?v=' + item.id.videoId;
				}
				
				//Agregamos un patron y reemplazamos los tokens
				var element = settings.pattern
					.replace(/\{\{Title\}\}/g, typeof item.snippet.title != "undefined" ? item.snippet.title: '')
					.replace(/\{\{VideoUrl\}\}/g, typeof item.id.videoId !== "undefined" ? urlVideo : '')
					.replace(/\{\{VideoEmbedUrl\}\}/g, typeof item.id.videoId !== "undefined" ? urlEmbed : '')
					.replace(/\{\{ThumbnailLarge\}\}/g, typeof item.snippet.thumbnails.high.url !== "undefined" ? item.snippet.thumbnails.high.url: '')
					.replace(/\{\{ThumbnailMedium\}\}/g, typeof item.snippet.thumbnails.medium.url !== "undefined" ? item.snippet.thumbnails.medium.url: '')
					.replace(/\{\{Thumbnail\}\}/g, typeof item.snippet.thumbnails.default.url !== "undefined" ? item.snippet.thumbnails.default.url: '')
					.replace(/\\{\{Description\}\}/g, typeof item.snippet.description != "undefined" ? item.snippet.description: '')
					.replace(/\{\{Date\}\}/g, typeof dateLong != "undefined" ? getFullDate(dateLong) : '')
					.replace(/\{\{Month\}\}/g, typeof dateLong != "undefined" ? getMonthFull(dateLong) : '')
					.replace(/\{\{MonthAbbreviation\}\}/g, typeof dateLong != "undefined" ? getMonthAbbr(dateLong) : '')
					.replace(/\{\{MonthNumeric\}\}/g, typeof dateLong != "undefined" ? getMonthNumeric(dateLong) : '')
					.replace(/\{\{DayOfTheMonth\}\}/g, typeof dateLong != "undefined" ? dateLong.getDate() : '')
					.replace(/\{\{DayOfTheWeek\}\}/g, typeof dateLong != "undefined" ? getDayLong(dateLong) : '')
					.replace(/\{\{DayOfTheWeekAbbreviation\}\}/g, typeof dateLong != "undefined" ? getDayAbbr(dateLong) : '')
					.replace(/\{\{Year\}\}/g, typeof dateLong != "undefined" ? dateLong.getFullYear() : '');
					
				//Agregamos la clase si es el icono del canal
				if (item.id.kind  == 'youtube#channel') {
					element = $(element);
					element.addClass('channel-item');
				}

				return element;
			}
		
			/* Funciones de los botones siguiente y anterior
			*******************************/
			function creatNextPrevButtons(data) {
				var buttons = $('<div>').addClass('yt-buttons');
				//Configuramos los numeros de pagina
				if (data.prevPageToken !== null || data.nextPageToken !== null){
					totalPages = Math.ceil(data.pageInfo.totalResults / data.pageInfo.resultsPerPage);
				}
				//Boton de anterior
				if (data.prevPageToken !== null) {
					$('<div>')
					.addClass('prev-btn')
					.html('<a href="#" data-href="' + data.prevPageToken + '">' + settings.prevPageText + '</a>')
					.on('click', changePage)
					.appendTo(buttons);
				}
				//Boton de siguiente
				if (data.nextPageToken !== null) {
					$('<div>')
					.addClass('next-btn')
					.html('<a href="#" data-href="' + data.nextPageToken + '">' + settings.nextPageText + '</a>')
					.on('click', changePage)
					.appendTo(buttons);
				}
				//Agregamos numeros de página
				if(totalPages > 1){
					$('<div>').addClass('yt-page').html('Page <span class="yt-current-page">' + currentPage + '</span> of <span class="yt-total-pages">' + totalPages + '</span>').appendTo(buttons);
				}
				return buttons;
			}
				//Siguiente y anterior botones de click
				function changePage(e){
					e.preventDefault();
					var token = $('a', this).data('href');
					pageToken = '&pageToken=' + token;
					loadFeed();
					if($(this).closest('div').hasClass('next-btn')){
						currentPage++;
					} else {
						currentPage--;
					}
				}
			
			/* Funciones de date
			*******************************/
				function getMonthFull(date) {
					switch (date.getMonth()) {
						case 0:
							return 'January';
						case 1:
							return 'February';
						case 2:
							return 'March';
						case 3:
							return 'April';
						case 4:
							return 'May';
						case 5:
							return 'June';
						case 6:
							return 'July';
						case 7:
							return 'August';
						case 8:
							return 'September';
						case 9:
							return 'October';
						case 10:
							return 'November';
						case 11:
							return 'December';
					}
				}
				function getMonthAbbr(date) {
					return getMonthFull(date).substring(0, 3);
				}
				function getMonthNumeric(date) {
					return date.getMonth() + 1;
				}
				function getDayLong(date) {
					switch (date.getDay()) {
						case 0:
							return 'Sunday';
						case 1:
							return 'Monday';
						case 2:
							return 'Tuesday';
						case 3:
							return 'Wednesday';
						case 4:
							return 'Thursday';
						case 5:
							return 'Friday';
						case 6:
							return 'Saturday';
					}
				}
				function getDayAbbr(date) {
					return getDayLong(date).substring(0, 3);
				}
				function getFullDate(date) {
					return getDayLong(date) + ', ' + getMonthFull(date) + ' ' + date.getDate() + ', ' + date.getFullYear();
				}
				
	});
};
}(jQuery));