// set the dimensions and margins of the graph
const margin = {top: 60, right: 30, bottom: 20, left: 0},
    width = 600 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

trento_center = [11.1207, 46.0664]

const svg = d3.select("svg");

const path = d3.geoPath();

const projection = d3.geoIdentity().reflectY(true)

const data = new Map();
const colorScale = d3.scaleThreshold()
    .domain([1000, 3000, 4000, 5000, 7000, 10000, 40000, 55000])
    .range(d3.schemeBlues[9]);

// Add color legend
shapeWidthlegend_3 = 100;
const labels_3 = ['0', '1000', '2000', '4000', '10000', '50000',];
const legend_3_size = shapeWidthlegend_3*labels_3.length;
const scaleFactor_3 = 0.8;
const legend_3 = d3.legendColor()
    .labels(function (d) { return labels_3[d.i]; })
    .shapePadding(0)
    .orient("horizontal")
    .shapeWidth(shapeWidthlegend_3)
    .scale(colorScale)
    .labelAlign("start") ;
svg.append("g")
    .attr("class", "legendThreshold")
    .attr("font-family", "Fira Sans, sans-serif")
    .attr("font-size", "12px")
    .attr("transform", `translate(${(scaleFactor_3*width - legend_3_size - (margin.left - margin.right))/2},
                                  ${height - margin.bottom/2})`);

svg.select(".legendThreshold")
    .append("text")
        .attr("class", "caption")
        .attr("x", legend_3_size/2)
        .attr("y", -20)
        .style("font-family", "Fira Sans, sans-serif")
        .style("font-size", "14px")
        .attr("text-anchor", "middle")
        .text("Oxygen (kg/yr)");

svg.select(".legendThreshold")
    .call(legend_3);

//var cb = d3.colorbarV(colorScale, 20, 100);
//svg.append('g').call(cb);

// Load external data and boot
Promise.all([
    d3.json("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/circoscrizioni.geojson"),
    d3.csv("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/ass3.csv", function (d) {
        data.set(d.circoscrizione, [+d.oxygen_tot, +d.count])
    })]).then(function (loadData) {
    let topo = loadData[0]

    projection.fitSize([width, height], topo)

    // create a tooltip
    const tooltip = d3.select("#choroplet_map_3")
        .append("div")
        .attr("class", "tooltip")

    let mouseOver = function (event, d) {

        tooltip
            .transition()
            .duration(200)
            .style("opacity", 1);

        tooltip
            .html("<span class='tooltiptext'>"+ "Neighbourhood: "+ d.properties.nome
                + "<br>" + "Oxigen production: " + d.oxigen + " (kg/yr)"
                + "<br>" + "Area: " + d.properties.area + " (m2)"
                + "<br>" + "Tree aboundance: " + d.total +"</span>")
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px");

        d3.selectAll("path")
            .transition()
            .duration(200)
            .style("opacity", 0.5)
            .style("stroke", "none")

        d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("stroke", "black")
    }

    let mouseLeave = function () {
        d3.selectAll("path")
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("stroke", "white")

        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0);
    }

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(topo.features)
        .join("path")
        // draw each circoscrizione
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        // set the color of each circoscrizione
        .attr("fill", function (d) {
            d.total = data.get(d.properties.nome)[1] || 0;
            d.oxigen = data.get(d.properties.nome)[0] || 0;
            return colorScale(d.oxigen);
        })
        .style("stroke", "white")
        .style("opacity", .8)
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave)
});
