// earthquake data
var url_earthquakes = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// fault lines
var url_plates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// circle marker colors
var colors = ["#80ff00", "#bfff00", "#ffff00", "#ffbf00", "#ff8000", "#ff0000"]

d3.json(url_plates, function(faultData) {

    var faultStyle = {
        "color": "darkorange",
        "weight": 1,
        "opacity": 1
    };

    var features = faultData.features;

    var faultLines = [];

    features.forEach(function(feature) {
        faultLines.push(feature.geometry);
    })

    var faultLayer = L.geoJSON(faultLines, {style: faultStyle});
    // var faultLayer = L.geoJSON(faultLines);

    d3.json(url_earthquakes, function(earthquakeData) {

        var earthquakes = earthquakeData.features;

        var earthquakeMarkers = [];

        earthquakes.forEach(function(earthquake) {
            var magnitude = parseFloat(earthquake.properties.mag);
            var location = earthquake.properties.place;
            var time = new Date(earthquake.properties.time).toDateString();
            var title = earthquake.properties.title;
            var longitude = earthquake.geometry.coordinates[0];
            var latitude = earthquake.geometry.coordinates[1];
            var depth = earthquake.geometry.coordinates[2];
            var earthquake_id = earthquake.id;
            
            if (Math.floor(magnitude) > 5) {
                var color = colors[colors.length - 1]
            }
            else {
                color = colors[Math.floor(magnitude)]
            };
    
            var earthquakeMarker = L.circle([latitude, longitude], {
                fillOpacity: 1,
                color: color,
                fillColor: color,
                radius: magnitude * 25000
            })
            .bindPopup("<strong style='font-size:14px;'>" + title + "</strong><hr 'style=padding-bottom:0;'>" +
                // "<h4>Location:  " + location + "</h4>" +
                // "<h4>Date:  " + time + "</h4>" +
                // "<h4>Magnitude:  " + magnitude + "</h4>" +
                // "<h4>Depth:  " + depth + " km</h4>" +
                // "<h4>ID:  " + earthquake_id + "</h4>"
                "Location:  " + location + "<br>" +
                "Date:  " + time + "<br>" +
                "Magnitude:  " + magnitude + "<br>" +
                "Depth:  " + depth + " km<br>" +
                "ID:  " + earthquake_id + "<br>"
            );
    
            earthquakeMarkers.push(earthquakeMarker);
        });
        
        var earthquakeLayer = L.layerGroup(earthquakeMarkers);

        // add tile layer
        var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.dark",
            accessToken: API_KEY
        });

        // add tile layer
        var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.light",
            accessToken: API_KEY
        })

        // add tile layer
        var outdoormap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.outdoors",
            accessToken: API_KEY
        })

        // add tile layer
        var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.satellite",
            accessToken: API_KEY
        })

        var mapLayers = {
            "Dark": darkmap,
            "Light": lightmap,
            "Outdoors": outdoormap,
            "Satellite": satellitemap
        };

        var overlayMaps = {
            "Fault Lines" : faultLayer,
            "Earthquakes": earthquakeLayer
        };

        // define map object
        var map = L.map("map",{
            center: [0, 0],
            zoom: 3,
            // crs: L.CRS.Simple,
            layers: [darkmap, faultLayer, earthquakeLayer]
        });

        // create legend
        var legend = L.control({position: "bottomright"});

        // insert div with class of legend when layer control is added
        legend.onAdd = function() {
            var div = L.DomUtil.create("div", "legend");
            var magnitudes = [0, 1, 2, 3, 4, 5];
            // var labels = [];

            div.innerHTML = "<h4>Magnitude</h4>";

            for (var i = 0; i < magnitudes.length; i++) {
                div.innerHTML += '<i style="background:' + colors[i] + '"></i>' +
                magnitudes[i] + (magnitudes[i+1] ? '&ndash;' + magnitudes[i+1] + '<br>' : '+')
            }

            return div;
        };

        // add legend to map
         legend.addTo(map);

        L.control.layers(mapLayers, overlayMaps, {
            collapse: false
        }).addTo(map);

    });

})