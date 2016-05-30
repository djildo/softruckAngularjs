var latitudde = '';
var longitude = '';
var map;

this.$('.js-loading-bar').modal({
  backdrop: 'static',
  show: false
});

angular.module('softruck', [])
.controller('mapaCtrl', function($scope, $http) {
	$scope.distancia = "2";
	$scope.tpPesquisa = "1";
	$scope.cidade = '';
	$scope.categoria = '';
	
	$scope.pesquisa = function() {
		
		if ($scope.cidade != '') {
			
			var $modal = $('.js-loading-bar'),
				  $bar = $modal.find('.progress-bar');
			  
			  $modal.modal('show');
			  $bar.addClass('animate');
			
			  setTimeout(function() {
				$bar.removeClass('animate');
				$modal.modal('hide');
			  }, 2000);
			  
			$http.jsonp("http://muvox.com.br/cidade.php?callback=JSON_CALLBACK&url="+$scope.cidade)
			.success(function(response) {
				angular.forEach(response.record.results, function(value, key) {
					latitude = value.geometry.location.lat;
                    longitude = value.geometry.location.lng;
				});
				
				var url = '';
				
				if($scope.tpPesquisa == 1 || $scope.tpPesquisa == 3) {
					url = 'https://api.foursquare.com/v2/venues/search?client_id=40JVBWNP40V0BRDSFGOP1HCZGEI33DLGMHIAP0VHI2D3N2XD&client_secret=2SXCW1FXGQZUHFAJYG53CLOSNZTAXWFTZ5GVLH2B1A0NCWU3&v=20160526&limit=50&callback=JSON_CALLBACK';
				}
				else if ($scope.tpPesquisa == 2){
					url = 'https://api.foursquare.com/v2/venues/explore?client_id=40JVBWNP40V0BRDSFGOP1HCZGEI33DLGMHIAP0VHI2D3N2XD&client_secret=2SXCW1FXGQZUHFAJYG53CLOSNZTAXWFTZ5GVLH2B1A0NCWU3&v=20160526&limit=5&callback=JSON_CALLBACK';
				}

				if(!isNaN(latitude) && !isNaN(longitude)) {
					url = url+'&ll='+latitude+','+longitude+'&near=';
				} else {
					url = url+'&near='+$scope.cidade+'&ll=';
				}
                url = url+'&radius='+$scope.distancia+'000';
				url = url+'&query='+$scope.categoria;
				
				$http.jsonp(url)
				.success(function(response) {
					markers = [];
					
					map = new google.maps.Map(document.getElementById('mapa'), {
						scrollwheel: false,
						zoom: 8
					});

					if(!isNaN(latitude) && !isNaN(longitude)) {
						var marker = new google.maps.Marker({
							map: map,
							position: {lat:latitude, lng:longitude},
							icon: 'resources/imagem/member.png',
							title: 'Minha Localização'
						});

						markers.push(marker);
					}

					var bounds = new google.maps.LatLngBounds();
					
					if($scope.tpPesquisa == 1 || $scope.tpPesquisa == 3) {
						angular.forEach(response.response.venues, function(value, key) {
							var myLatLng2 = {lat:value.location.lat, lng: value.location.lng};
	
							var marker = new google.maps.Marker({
								map: map,
								position: myLatLng2,
								//icon: icon,
								title: value.name
							});
	
							markers.push(marker);
						});
					} else if ($scope.tpPesquisa == 2){
						angular.forEach(response.response.groups[0].items, function(value, key) {
							var myLatLng2 = {lat:value.venue.location.lat, lng: value.venue.location.lng};
	
							var marker = new google.maps.Marker({
								map: map,
								position: myLatLng2,
								//icon: icon,
								title: value.name
							});
	
							markers.push(marker);
						});
					}

					for (var i = 0; i < markers.length; i++) {
						markers[i].setMap(map);
						bounds.extend(markers[i].getPosition());
					}

					map.fitBounds(bounds);

					if($scope.tpPesquisa == 3) {
						var getGoogleClusterInlineSvg = function (color) {
							var encoded = window.btoa('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-100 -100 200 200"><defs><g id="a" transform="rotate(45)"><path d="M0 47A47 47 0 0 0 47 0L62 0A62 62 0 0 1 0 62Z" fill-opacity="0.7"/><path d="M0 67A67 67 0 0 0 67 0L81 0A81 81 0 0 1 0 81Z" fill-opacity="0.5"/><path d="M0 86A86 86 0 0 0 86 0L100 0A100 100 0 0 1 0 100Z" fill-opacity="0.3"/></g></defs><g fill="' + color + '"><circle r="42"/><use xlink:href="#a"/><g transform="rotate(120)"><use xlink:href="#a"/></g><g transform="rotate(240)"><use xlink:href="#a"/></g></g></svg>');

							return ('data:image/svg+xml;base64,' + encoded);
						};

						var cluster_styles = [
							{
								width: 40,
								height: 40,
								url: getGoogleClusterInlineSvg('green'),
								textColor: 'white',
								textSize: 12
							},
							{
								width: 50,
								height: 50,
								url: getGoogleClusterInlineSvg('red'),
								textColor: 'white',
								textSize: 14
							},
							{
								width: 60,
								height: 60,
								url: getGoogleClusterInlineSvg('red'),
								textColor: 'white',
								textSize: 16
							}
						];

						markerCluster = new MarkerClusterer(map, markers, {
							styles: cluster_styles
						});
					}
					//softruckBoot.hideAguarde();
				});
				
			});
		} else {
			alert('Ops, Informe sua localização! você ainda não ativou a Geolocalização, ai não rola!');
		}
	}
	
	$scope.pegaLocalizacao = function() {
		if ( navigator.geolocation ){
			navigator.geolocation.getCurrentPosition( 
	
				// sucesso! 
				function( position ){
					latitude = position.coords.latitude;
					longitude = position.coords.longitude;
	
					var $modal = $('.js-loading-bar'),
						  $bar = $modal.find('.progress-bar');
					  
					  $modal.modal('show');
					  $bar.addClass('animate');
					
					  setTimeout(function() {
						$bar.removeClass('animate');
						$modal.modal('hide');
					  }, 2000);
					  
					$http.jsonp("http://muvox.com.br/cidade.php?callback=JSON_CALLBACK&url="+latitude+','+longitude)
					.success(function(response) {
						$scope.cidade = response.record.results[0].formatted_address;
						$scope.pesquisa();
					});
	
				},
	
				// erro
				function ( erro ){
					var erroDescricao = 'Ops, ';
					switch( erro.code ) {
						case erro.PERMISSION_DENIED:
							erroDescricao += 'usuário não autorizou a Geolocalização.';
							break;
						case erro.POSITION_UNAVAILABLE:
							erroDescricao += 'localização indisponível.';
							break;
						case erro.TIMEOUT:
							erroDescricao += 'tempo expirado.';
							break;
						case erro.UNKNOWN_ERROR:
							erroDescricao += 'não sei o que foi, mas deu erro!';
							break;
					}
					alert(erroDescricao);
				}
			);
		} else {
			alert('Ops, seu navegador não possue Geolocalização! Atualize o quanto antes.');
		}
	}
	
	$scope.pegaLocalizacao();
});