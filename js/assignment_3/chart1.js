var width = 800;
var height = 400;
trento_center = [11.1207,46.0664]

var canvas = d3.select("#choroplet_map").append("svg")
    .attr("width", width)
    .attr("height", height)


d3.json("/python/data/circoscrizioni.json", function(data) {

    var group = canvas.selectAll("g")
        .data(data.features)  //array in geojson heißt "features"
        .enter()
        .append("g")
    var projection = d3.geo.mercator()
        .scale(90000)
        .center(trento_center)  // centers map at given coordinates
        .translate([width / 2, height / 2]); // translate map to svg

    var path = d3.geo.path().projection(projection); //hand projection to projection generator --> how to translate coordinate to pixels


    var areas = group.append("path")              //append to path to each "g" element
        .attr("d", path)                              //data comes from path generator
        .attr("class", "area")
        .attr("fill", "#8AC926");

});
