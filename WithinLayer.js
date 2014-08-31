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

	Constructor.getContained = function(fnIn, fnOut) {
		var i,
			max,
			layer,
			j = 0,
			maxJ = list.length,
			contained = [];

		for (i = 0, max = layers.length; i < max; i++) {
			layer = layers[i];

            //ensure that the layer has a map, otherwise it is deleted, thus continue over it
            if (!layer._map) {
                continue;
            }

			switch (layer.layerType) {
				case 'circle':
					var circleInfoLatLng = layer.getLatLng(),
						radius = layer.getRadius(),
						ll;

					for (j = 0; j < maxJ;j++) {
						ll = list[j].getLatLng();

						if (geolib.isPointInCircle(
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
							contained.push(list[j]);

                            if (fnIn) {
                                fnIn.apply(list[j]);
                            }
						} else if (fnOut) {
                            fnOut.apply(list[j]);
                        }
					}
					break;
				case 'rectangle':
				case 'polygon':
                    var geo = L.geoJson(layer.toGeoJSON()),
                        inLayer;
					for (j = 0; j < maxJ;j++) {
                        inLayer = leafletPip.pointInLayer(list[j].getLatLng(), geo)
						if (inLayer.length > 0) {
							contained.push(list[j]);

                            if (fnIn) {
                                fnIn.apply(list[j]);
                            }
						} else if (fnOut) {
                            fnOut.apply(list[j]);
                        }
					}

					break;
			}
		}

		return contained;
	};

	return Constructor;
})();
