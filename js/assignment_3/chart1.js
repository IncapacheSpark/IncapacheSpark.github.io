// set the dimensions and margins of the graph
const margin = {top: 60, right: 30, bottom: 20, left: 0},
    width = 400 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

trento_center = [11.1207,46.0664]

const svg = d3.select("svg");
const path = d3.geoPath();
var projection = d3.geoIdentity().reflectY(true);
const data = new Map();
const colorScale = d3.scaleQuantize()
    .domain([0, 3024])
    .range(d3.schemeGreens[7]);

// Load external data and boot
Promise.all([
    d3.json("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/circoscrizioni.geojson"),
    d3.csv("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/ass3.csv", function(d) {
        data.set(d.circoscrizione, +d.count)
    })]).then(function(loadData){
        let topo = loadData[0]
        console.log("stampo topo"); console.log(topo);

        projection.fitSize([width, height], topo)
        
        const tooltip = d3.select("#choroplet_map1") // create a tooltip
            .append("div")
            .attr("class", "tooltip")
        
        svg.append("g")       // Draw the map
            .selectAll("path")
            .data(topo.features)
            .enter()
            .append("path")
            .attr("d", d3.geoPath()
                .projection(projection)  // draw each circoscrizione
            )
            .attr("fill", function (d) {     // set the color of each circoscrizione
                //console.log(d)
                d.total = data.get(d.properties.nome) || 0;
                //console.log(d.total)
                return colorScale(d.total);
            })
            .style("stroke", "transparent")
            .attr("class", function(d){ return "Country" } )
            .attr("class", function(d){ return d.properties.nome } )
            .style("opacity", .8)
            .on("mouseover", function (event, d) {    // what subgroup are we hovering?
                //console.log(d.properties.nome)
            
                
                const subGroupName = d.properties.nome
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);

                tooltip.html("<span class='tooltiptext'>" + "neighborhood: " + subGroupName + "<br>" + "Count: " + d.total + " trees</span>")
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");

                // Reduce opacity of all rect to 0.2
                d3.selectAll(".Country")
                    .style("opacity", 0.2)

                // Highlight all rects of this subgroup with opacity 1.
                // It is possible to select them since they have a specific class = their name.
                d3.selectAll("." + subGroupName)
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
