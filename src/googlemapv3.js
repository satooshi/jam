(function(window, undefined){
    // shortcut of google.maps api
    var
        // namespace
        maps       = google.maps,
        event      = maps.event,
        // constructor
        LatLng     = maps.LatLng,
        InfoWindow = maps.InfoWindow,
        Map        = maps.Map,
        Marker     = maps.Marker,
        Geocoder   = maps.Geocoder
    ;

    // my namespace
    var mymap = {};

    // library code
    mymap.createMap = function(domId, lat, lng) {
        var opts = {
            zoom: 14,
            center: new LatLng(lat, lng),
            mapTypeId: maps.MapTypeId.ROADMAP
        };

        return new Map(document.getElementById(domId), opts);
    };

    mymap.createMarker = function(map, lat, lng) {
        return new Marker({
            position: new LatLng(lat, lng),
            map: map
        });
    };

    mymap.createInfoMarker = function(map, lat, lng, content, showInfo) {
        var marker = mymap.createMarker(map, lat, lng);
        var info = new InfoWindow({
            content: content
        });

        mymap.addClickMarker(map, marker, info);

        if (showInfo) {
            info.open(map, marker);
            info.isOpened = true;
        }

        return marker;
    };

    mymap.addClickMarker = function(map, marker, info) {
        event.addListener(marker, 'click', function() {
            if (info.isOpened) {
                info.close();
                info.isOpened = false;
            } else {
                info.open(map, marker);
                info.isOpened = true;
            }
        });
    };

    mymap.showMap = function(mapInfo, markerInfo, showInfo) {
        var map = mymap.createMap(mapInfo.domAt, mapInfo.lat, mapInfo.lng);
        var marker;

        for (var i = 0, length = markerInfo.length; i < length; i++) {
            marker = markerInfo[i];
            mymap.createInfoMarker(map, marker.lat, marker.lng, marker.content, showInfo);
        }
    };

    mymap.showAddressOnMap = function(domId, address, content, showInfo, onLoaded) {
        var geo = new Geocoder();

        geo.geocode({address:address}, function(results, status) {
            if (status == maps.GeocoderStatus.OK) {
                var location = results[0].geometry.location;
                var lat = location.lat();
                var lng = location.lng();

                mymap.showMap(
                    {domAt: domId, lat: lat, lng:lng},
                    [
                        {lat: lat, lng: lng, content: content}
                    ],
                    showInfo
                );

                if (onLoaded) {
                    onLoaded(domId);
                }
            }
        });
    };

    mymap.setupMapCanvas = function(domId, width, height) {
        var mapCanvas = document.getElementById(domId);
        mapCanvas.style.width = parseInt(width, 10) + 'px';
        mapCanvas.style.height = parseInt(height, 10) + 'px';
    };

    // expose my namespace
    window.mymap = mymap;
}(window));
