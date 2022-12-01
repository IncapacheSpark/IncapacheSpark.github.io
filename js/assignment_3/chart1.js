// set the dimensions and margins of the graph
const margin = {top: 60, right: 30, bottom: 20, left: 0},
    width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

trento_center = [11.1207, 46.0664]

const svg = d3.select("#choroplet_map1")
  .append("svg")
  .attr('width', '100%')
  .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
  .attr("preserveAspectRatio", "xMinYMin meet")
  .append("g")
  .attr("transform",
      `translate(${margin.left}, ${margin.top})`);

const path = d3.geoPath();
const projection = d3.geoIdentity().reflectY(true);

const data = new Map();

const colorScale = d3.scaleQuantize()
    .domain([0, 3024])
    .range(d3.schemeGreens[7]);

// Load external data and boot
Promise.all([
    d3.json("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/circoscrizioni.geojson"),
    d3.csv("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/ass3.csv", function (d) {
        data.set(d.circoscrizione, +d.count)
    })]).then(function (loadData) {
        const topo = loadData[0]

        projection.fitSize([width, height], topo)

        const tooltip = d3.select("#choroplet_map1") // create a tooltip
            .append("div")
            .attr("class", "tooltip")

        const mouseOver = function (event, d) {

            tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 1);

            tooltip
                .html("<span class='tooltiptext'>" + d.properties.nome + "<br>" + "Tree abundance: " + d.total + "</span>")
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
                d.total = data.get(d.properties.nome) || 0;
                return colorScale(d.total);
            })
            .style("stroke", "white")
            .style("opacity", .8)
            .on("mouseover", mouseOver)
            .on("mouseleave", mouseLeave)
    }
);
