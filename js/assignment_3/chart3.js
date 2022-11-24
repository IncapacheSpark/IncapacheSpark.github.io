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
        .attr("class", function(d){
            console.log("Country "+ d.properties.nome.replaceAll(' ', '').replaceAll('.', ''))
            return "Country "+ d.properties.nome.replaceAll(' ', '').replaceAll('.', '')
        })
        //.attr("class", function(d){ return d.properties.nome } )
        .style("opacity", .8)
        .on("mouseover", function (event, d) { 
            //console.log(d.properties.nome)
            
            const subGroupName = d.properties.nome.replaceAll(' ', '').replaceAll('.', '') // what subgroup are we hovering?

            tooltip.transition()
                .duration(200)
                .style("opacity", 1);

            tooltip.html("<span class='tooltiptext'>" + "Neighborhood: " + d.properties.nome + "<br>" + "Oxygen production: " + d.total + " (Kg/yr)" + "</span>")
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");

            // Reduce opacity of all rect to 0.2
            d3.selectAll(".Country")
                .style("opacity", 0.2)

            // Highlight all rects of this subgroup with opacity 1.
            // It is possible to select them since they have a specific class = their name.
            d3.select("." + subGroupName)
                .style("opacity", 1);
                //.style("fill", "e21dab");
            
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
