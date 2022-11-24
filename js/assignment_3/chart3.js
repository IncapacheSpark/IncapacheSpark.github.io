// set the dimensions and margins of the graph
const margin = {top: 60, right: 30, bottom: 20, left: 0},
    width = 400 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

trento_center = [11.1207,46.0664]

const svg = d3.select("svg");

const path = d3.geoPath();

var projection = d3.geoIdentity().reflectY(true)


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
    d3.csv("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/ass3.csv", function(d) {
        data.set(d.circoscrizione, +d.oxygen_tot)
    })]).then(function(loadData){
        let topo = loadData[0]
        //console.log(topo)

        projection.fitSize([width, height], topo)

        // create a tooltip
        const tooltip = d3.select("#choroplet_map_3")
        .append("div")
        .attr("class", "tooltip")
        
        // Draw the map
        svg.append("g")
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        // draw each circoscrizione
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        // set the color of each circoscrizione
        .attr("fill", function (d) {
            //console.log(d)
            d.total = data.get(d.properties.nome) || 0;
            //console.log(d.total)
            return colorScale(d.total);
        })
        .style("stroke", "transparent")
        .attr("class", function(d){ return "Country "+ d.properties.nome } )
        //.attr("class", function(d){ return d.properties.nome } )
        .style("opacity", .8)
        .on("mouseover", function (event, d) { 
            //console.log(d.properties.nome)
            // what subgroup are we hovering?
            
            const subGroupName = d.properties.nome
            tooltip.transition()
                .duration(200)
                .style("opacity", 1);

            tooltip.html("<span class='tooltiptext'>" + "Neighborhood: " + subGroupName + "<br>" + "Oxygen production: " + d.total + " (Kg/yr)" + "</span>")
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");

            // Reduce opacity of all rect to 0.2
            d3.selectAll(".Country")
                .style("opacity", 0.2)

            // Highlight all rects of this subgroup with opacity 1.
            // It is possible to select them since they have a specific class = their name.
            d3.select("." + subGroupName)
                .style("opacity", 1)

        })
        .on("mouseleave", function () { // When user do not hover anymore

            tooltip.transition()
                .duration(200)
                .style("opacity", 0);

            // Back to normal opacity: 1
            d3.selectAll(".Country")
                .style("opacity", 1)
        })
    });
