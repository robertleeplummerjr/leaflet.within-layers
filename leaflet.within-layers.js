;L.Class.WithinLayers = (function(){
	"use strict";
	 return L.Class.extend({
		layer: [],
		options: {
			list: '<ul/>',
			listItem: '<li/>',
			parent: null,
			format: function(){
				throw new Error('No format set!');
			},
			color: '#662d91',
			errorColor: '#b00b00',
			some: function() {},
			none: function() {},
			click: function() {},
			layerCreated: function() {}
		},
		initialize: function(options) {
			this.drawControl = null;
			this.drawnItems = null;
			L.Util.setOptions(this, options);
		},
		addPoint: function(layer) {
			this.layer.push(new WithinLayer(layer));
		},
		onAdd: function(map) {
			var options = this.options,
				//setup draw items
				drawnItems = this.drawnItems = new L.FeatureGroup(),
				drawControl = this.drawControl = new L.Control.Draw({
					draw: {
						position: 'topleft',
						polygon: {
							title: 'Draw',
							allowIntersection: false,
							drawError: {
								color: options.errorColor,
								timeout: 1000
							},
							shapeOptions: {
								color: options.color
							},
							showArea: true
						},
						polyline: false,
						circle: {
							shapeOptions: {
								color: options.color
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
						case 'circle':
						case 'rectangle':
						case 'polygon':
							WithinLayer.addLayer(layer, type);
							break;
					}
					drawnItems.addLayer(layer);

					options.layerCreated.call(this, layer);
				},
				displayContaining = function() {
					list.children().remove();

					var contained = WithinLayer.getContained(function() {
						var el = (this._path || this._icon),
							prop = this.feature.properties,
							li = $(options.listItem),
							a = $('<a href="#"/>')
								.attr('data-point', this)
								.html(format(prop, map))
								.click(options.click)
								.appendTo(li);

						a[0].dataPoint = this;

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
		},
		each: function(fn) {
			WithinLayer.getContained(fn);
		}
	});
})();

L.withinLayers = function (options) {
	return new L.Class.WithinLayers(options);
};