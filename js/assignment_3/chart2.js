// set the dimensions and margins of the graph
const margin = {top: 60, right: 30, bottom: 20, left: 0},
    width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

trento_center = [11.1207, 46.0664]

const svg = d3.select("#choroplet_map2")
  .append("svg")
  .attr('width', '100%')
  .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
  .attr("preserveAspectRatio", "xMinYMin meet")
  .append("g")
  .attr("transform",
      `translate(${margin.left}, ${margin.top})`);

const path = d3.geoPath();
const projection = d3.geoIdentity().reflectY(true)

const data = new Map();
MAX_DENSITY = 0.015255497319367813
color_arr = d3.schemeGreens[9].slice(1);

const colorScale = d3.scalePow()
    .domain([0, MAX_DENSITY])
    .range([color_arr[0], color_arr[color_arr.length-1]])
    .exponent(0.5);

// Load external data and boot
Promise.all([
    d3.json("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/circoscrizioni.geojson"),
    d3.csv("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/ass3.csv", function(d) {
        data.set(d.circoscrizione, [+d.density, +d.count])
    })]).then(function(loadData){

      // find the max value viz
      // const max_density = Math.max.apply(Math, loadData.map(function (item) {
      //   console.log(loadData.properties);
      //   console.log(item.properties. density);
      //     return item.density;
      // }));

        let topo = loadData[0]
        //console.log(topo)

        projection.fitSize([width, height], topo)

        const tooltip = d3.select("#choroplet_map2")
            .append("div")
            .attr("class", "tooltip")

        // Three function that change the tooltip when user hover / move / leave a cell
        const mouseOver = function (event, d) {
            const audio = new Audio("/js/assignment_3/sound.mp3");
            audio.play();
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 1);
            tooltip
                .html("<span class='tooltiptext'>" + "Neighbourhood: "+ d.properties.nome
                  + "<br>" + "Density: " + d.density.toPrecision(3)
                  + "<br>" + "Area: " + d.properties.area.toPrecision(2) + " (m2)"
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
                .style("stroke-width", "1px")
            }

        const mouseLeave = function () {
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
            d.density = data.get(d.properties.nome)[0] || 0;
            return colorScale(d.density);
        })
        .style("stroke", "white")
        .style("opacity", .8)
        .on("mouseover", mouseOver )
        .on("mouseleave", mouseLeave )
    });
