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
.domain([40, 300, 500, 1000, 2000, 3100])
.range(d3.schemeGreens[7]);

// Load external data and boot
Promise.all([
    d3.json("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/circoscrizioni.geojson"),
    d3.csv("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/ass3.csv", function(d) {
        data.set(d.circoscrizione, +d.count)
    })]).then(function(loadData){
        let topo = loadData[0]
        //console.log(topo)

        projection.fitSize([width, height], topo)

        /*
        // create a tooltip
        const tooltip = d3.select("#my_dataviz")
        .append("div")
        .attr("class", "tooltip")
        */
        

        let mouseOver = function(d) {
            /*tooltip
            .transition()
            .duration(200)
            .style("opacity", 1)
            */
            d3.selectAll(".Country")
              .transition()
              .duration(200)
              .style("opacity", .5)
            d3.select(this)
              .transition()
              .duration(200)
              .style("opacity", 1)
              .style("stroke", "black")
        }

        let mouseLeave = function(d) {
            d3.selectAll(".Country")
              .transition()
              .duration(200)
              .style("opacity", .8)
            d3.select(this)
              .transition()
              .duration(200)
              .style("stroke", "transparent")
        }


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
            console.log(d.total)
            return colorScale(d.total);
        })
        .style("stroke", "transparent")
        .attr("class", function(d){ return "Country" } )
        .style("opacity", .8)
        .on("mouseover", mouseOver )
        .on("mouseleave", mouseLeave )
    });
