L.Class.WithinLayers = L.Class.extend({
	layer: [],
	options: {
		list: '<ul/>',
		listItem: '<li/>',
		parent: null,
		format: null,
		some: function() {},
		none: function() {}
	},
	initialize: function(options) {
		L.Util.setOptions(this, options);
	},
	addPoint: function(layer) {
		this.layer.push(new WithinLayer(layer));
	},
	onAdd: function(map) {
		var that = this,
			options = this.options,
			//setup draw items
			drawnItems = new L.FeatureGroup(),
			drawControl = new L.Control.Draw({
				draw: {
					position: 'topleft',
					polygon: {
						title: 'Draw',
						allowIntersection: false,
						drawError: {
							color: '#b00b00',
							timeout: 1000
						},
						shapeOptions: {
							color: '#bada55'
						},
						showArea: true
					},
					polyline: {
						metric: false
					},
					circle: {
						shapeOptions: {
							color: '#662d91'
						}
					}
				},
				edit: {
					featureGroup: drawnItems
				}
			}),
			parent = $(options.parent),
			list = $(options.list).appendTo(parent),
			format = options.format,
			createLayer = function (e) {
				var type = e.layerType,
					layer = e.layer;

				switch (type) {
					case 'marker':
						layer.bindPopup('A popup!');
						markers.push(layer);
						new WithinLayer(layer);
						break;
					case 'circle':
					case 'rectangle':
					case 'polygon':
						WithinLayer.addLayer(layer, type);
						break;
				}
				drawnItems.addLayer(layer);

				drawControl._toolbars.edit._modes.edit.handler.enable();
			},
			displayContaining = function() {
				list.children().remove();

				var contained = WithinLayer.getContained(function() {
					var el = (this._path || this._icon),
						prop = this.feature.properties,
							li = $(options.listItem),
							a = $('<a href="#"/>')
								.html(format(prop, map))
								.click(function() {
									return false;
								})
								.appendTo(li);

					if (el !== undefined) {
						el.style.opacity = 0.5;
					}

					a[0].layer = li[0].layer = this;

					list.append(li);
				}, function() {
					var el = (this._path || this._icon);
					if (el !== undefined) {
						el.style.opacity = 1;
					}
				});

				if (contained.length > 0) {
					options.some(parent, this);
				} else {
					options.none(parent, this);
				}
			};

		//handle the draw events for detecting if something is inside a circle
		map.on('draw:created', createLayer);
		map.on('draw:edited', displayContaining);
		map.on('layerremove', displayContaining);
		map.on('draw:revert', displayContaining);
		map.on('draw:move', displayContaining);
		map.on('draw:deleted', displayContaining);

		//add layers and controls to map
		map.addLayer(drawnItems);
		map.addControl(drawControl);
	},
	addTo: function (map) {
		this.onAdd(map);
		return this;
	}
});

L.withinLayers = function (options) {
	return new L.Class.WithinLayers(options);
};
