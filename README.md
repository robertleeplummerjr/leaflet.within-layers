leaflet.within-layers
=====================

Find point inside of a shape/layer in leaflet


Example:
```javascript
var withinLayers = L.withinLayers({
		parent: $('#parent-where-I-want-to-show-list-of-items-in-shape'),
		format: function(point) {
			return point.Name + ' #' + point.Description;
		}
	})
	.addTo(map);

var onEachOfMyPoints = function(feature, layer) {
  //add points to index
  withinLayers.addPoint(layer);
};

var myPoints = new L.GeoJSON.AJAX(["myPoints.geojson"], {
    onEachFeature: onEachOfMyPoints
  })
  .addTo(map);

```
