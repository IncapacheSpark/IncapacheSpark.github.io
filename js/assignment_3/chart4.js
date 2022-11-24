// set the dimensions and margins of the graph
const margin = {top: 60, right: 30, bottom: 20, left: 0},
    width = 600 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// The svg
const svg = d3.select("#dotdensity_map_4")
  .append("svg")
  .attr('width', '100%')
  .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
  .attr("preserveAspectRatio", "xMinYMin meet")
  .append("g")
  .attr("transform",
      `translate(${margin.left}, ${margin.top})`);

trento_center = [11.1207, 46.0664]

const projection = d3.geoIdentity().reflectY(true)

/*// Map and projection
const projection = d3.geoMercator()
    .center(trento_center)                // GPS of location to zoom on
    .scale(90000)                       // This is like the zoom
    .translate([ width/2, height/2 ])*/

Promise.all([
    d3.json("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/circoscrizioni.geojson"),
    d3.csv("/python/data/geo_data_trees_all.csv")
]).then(function (initialize) {

    let dataGeo = initialize[0]
    projection.fitSize([width, height], dataGeo)
    let data = initialize[1]

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(dataGeo.features)
        .join("path")
        .attr("fill", "#b8b8b8")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .style("stroke", "white")
        .style("opacity", .2)

    // Add circles:
    svg
        .selectAll("myCircles")
        .data(data.map(d => d))
        .join("circle")
        .attr("cx", d => projection([+d.Longitude, +d.Latitude])[0])
        .attr("cy", d => projection([+d.Longitude, +d.Latitude])[1])
        .attr("r", 2)
        .style("fill", "green")
        .attr("stroke", "none")
        .attr("stroke-width", 1)
        .attr("fill-opacity", .4)

})
