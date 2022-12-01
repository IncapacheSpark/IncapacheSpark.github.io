// set the dimensions and margins of the graph
const margin = {top: 60, right: 30, bottom: 20, left: 0},
    width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

const svg = d3.select("#choroplet_map_3")
  .append("svg")
  .attr('width', '100%')
  .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
  .attr("preserveAspectRatio", "xMinYMin meet")
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

trento_center = [11.1207, 46.0664];
const path = d3.geoPath();
const projection = d3.geoIdentity().reflectY(true)
const data = new Map();
MAX_OXYGEN = 53818.4;
color_arr = d3.schemeBlues[9].slice(1);
color_arr.push("#000b33");
const colorScale = d3.scalePow()
    .domain([0, MAX_OXYGEN])
    .range([color_arr[0], color_arr[8]])
    .exponent(0.5);

Promise.all([
    d3.json("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/circoscrizioni.geojson"),
    d3.csv("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/ass3.csv", function (d) {
        data.set(d.circoscrizione, [+d.oxygen_tot, +d.count])
    })]).then(function (loadData) {
    let topo = loadData[0]

    projection.fitSize([width, height], topo)

    const tooltip = d3.select("#choroplet_map_3")
        .append("div")
        .attr("class", "tooltip")

    let mouseOver = function (event, d) {
        const audio = new Audio("/js/assignment_3/sound.mp3");
        audio.play();
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 1);
        tooltip
            .html("<span class='tooltiptext'>"+ "Neighbourhood: "+ d.properties.nome
                + "<br>" + "Oxigen production: " + d.oxigen + " (kg/yr)"
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
