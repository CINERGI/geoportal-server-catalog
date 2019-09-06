/* 
this code was downloaded from http://get.iedadata.org/doi/doimap.js
 */

$(document).ready(function(){
    console.log('a')
    mgdsMap = new MGDSMapClient();
    mgdsMap.mapdiv = "mapc";
    mgdsMap.mapInit();
    mgdsMap.baseMap();
    
    if ($("#geoLocations").length) {
        var i = 0;
        var geoms = [];
        var latlngbounds = new google.maps.LatLngBounds();
        $("#geoLocations .geoLocationBox").each(function(){
           var data = $(this).attr('value').split(" ");
           var coords = [
               new google.maps.LatLng(data[0],data[1]),
               new google.maps.LatLng(data[2],data[1]),
               new google.maps.LatLng(data[2],data[3]),
               new google.maps.LatLng(data[0],data[3]),
               new google.maps.LatLng(data[0],data[1])
           ];
           for (var j = 0; j<coords.length;j++) {
               latlngbounds.extend(coords[j]);
           }
           geoms[i++] = new google.maps.Polygon({
              paths: coords,
              strokeColor: "#FF0000",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "#FF0000",
              fillOpacity: 0.3
           });
        });
                
        $("#geoLocations .geoLocationPoint").each(function(){
            var data = $(this).attr('value').split(" ");
            var point = new google.maps.LatLng(data[0],data[1]);
            latlngbounds.extend(point);
            geoms[i++] = new google.maps.Marker({
              position: point  
            });
        });
        
        mgdsMap.map.fitBounds(latlngbounds);
        
        for (var j = 0; j<geoms.length;j++) {
            geoms[j].setMap(mgdsMap.map);
        }

    }
   
});