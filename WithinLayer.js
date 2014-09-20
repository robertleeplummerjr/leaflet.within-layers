;var WithinLayer = (function() {
	"use strict";
	//static methods & Properties
	var list = [],
		layers = [];

	function Constructor(layer) {
		list.push(layer);
	}

	Constructor.prototype = {

	};


	Constructor.addLayer = function(layer, type) {
		layer.layerType = type;
		layers.push(layer);
	};

	Constructor.isInside = function(parentLayer, childLayer) {
		var ll;
		switch (parentLayer.layerType) {
			//if it's a circle
			case 'circle':
				var circleInfoLatLng = parentLayer.getLatLng(),
					radius = parentLayer.getRadius();

				ll = childLayer.getLatLng();

				return (geolib.isPointInCircle(
					{
						latitude: circleInfoLatLng.lat,
						longitude: circleInfoLatLng.lng
					},
					{
						latitude: ll.lat,
						longitude: ll.lng
					},
					radius
				));


			//if its any other shape
			default:
				var geoLls = [],
					i = 0,
					lls = parentLayer.getLatLngs();

				for (; i < lls.length; i++) {
					ll = lls[i];
					geoLls.push({
						latitude: ll.lat,
						longitude: ll.lng
					});
				}

				ll = childLayer.getLatLng();
				return geolib.isPointInside({
					latitude: ll.lat,
					longitude: ll.lng
				}, geoLls);

		}
	};

	Constructor.getContained = function(fnIn, fnOut) {
		var i,
			max,
			layer,
			j = 0,
			maxJ = list.length,
			contained = [],
			point,
			ll;

		for (i = 0, max = layers.length; i < max; i++) {
			layer = layers[i];

            //ensure that the layer has a map, otherwise it is deleted, thus continue over it
            if (!layer._map) {
                continue;
            }

			switch (layer.layerType) {
				case 'circle':
					var circleInfoLatLng = layer.getLatLng(),
						radius = layer.getRadius();

					for (j = 0; j < maxJ;j++) {
						point = list[j];

						ll = point.getLatLng();

						if (contained.indexOf(point) > -1) {
							//it is already added
						}
						else if (geolib.isPointInCircle(
							{
								latitude: circleInfoLatLng.lat,
								longitude: circleInfoLatLng.lng
							},
							{
								latitude: ll.lat,
								longitude: ll.lng
							},
							radius
						)) {
							contained.push(point);

                            if (fnIn) {
                                fnIn.apply(point);
                            }
						} else if (fnOut) {
                            fnOut.apply(point);
                        }
					}
					break;
				default:
					var geoLls = [],
						k = 0,
						lls = layer.getLatLngs();

					for (; k < lls.length; k++) {
						ll = lls[k];
						geoLls.push({
							latitude: ll.lat,
							longitude: ll.lng
						});
					}

					for (j = 0; j < maxJ;j++) {
						point = list[j];

						ll = point.getLatLng();

						if (contained.indexOf(point) > -1) {
							//it is already added
						}
						else if (geolib.isPointInside({
							latitude: ll.lat,
							longitude: ll.lng
						}, geoLls)) {
							contained.push(point);

                            if (fnIn) {
                                fnIn.apply(point);
                            }
						} else if (fnOut) {
                            fnOut.apply(point);
                        }
					}

					break;
			}
		}

		return contained;
	};

	return Constructor;
})();
