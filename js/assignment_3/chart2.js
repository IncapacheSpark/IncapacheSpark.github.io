// set the dimensions and margins of the graph
const margin = {top: 60, right: 30, bottom: 20, left: 0},
    width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

trento_center = [11.1207,46.0664]

const svg = d3.select("svg");

const path = d3.geoPath();

var projection = d3.geoIdentity().reflectY(true)


const data = new Map();


// Load external data and boot
Promise.all([
    d3.json("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/circoscrizioni.geojson"),
    d3.csv("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/ass3.csv", function(d) {
        data.set(d.circoscrizione, +d.density)
    })]).then(function(loadData){

      // find the max value for X axis viz
      const max_density = Math.max.apply(Math, loadData.map(item => {
          return item.density;
      }));

      const colorScale = d3.scaleThreshold()
        .domain([0, 0.0001, 0.0005, 0.001, 0.01, 0.03])
        .range(d3.schemeGreens[5]);

        let topo = loadData[0]
        //console.log(topo)

        projection.fitSize([width, height], topo)

        /*
        // create a tooltip
        const tooltip = d3.select("#my_dataviz")
        .append("div")
        .attr("class", "tooltip")
        */
        // create a tooltip
        const tooltip = d3.select("#histogram")
            .append("div")
            .attr("class", "tooltip")

        // Three function that change the tooltip when user hover / move / leave a cell
        const mouseover = function (event, d) {
            let values = d3.select(this).datum()
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 1);
              console.log(values);
            tooltip
                .html("<span class='tooltiptext'>Density: " + values[1].density + "<br>"+"</span>")
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        }
        const mousemove = function (event) {
            tooltip
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        }
        const mouseleave = function () {
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 0)
        }



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
