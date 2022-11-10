// set the dimensions and margins of the graph
const margin = {top: 40, right: 150, bottom: 60, left: 30},
    width = 700 - margin.left - margin.right,
    height = 620 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#bubblePlot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

//Read the data
d3.csv("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/ass2.csv").then(function (data) {

    // ---------------------------//
    //       AXIS  AND SCALE      //
    // ---------------------------//

    // find the max value for X axis viz
    const maxAxisX = Math.max.apply(Math, data.map(function (value) {
        return value.Height;
    }));

    // Add X axis
    const x = d3.scaleLinear()
        .domain([0, maxAxisX])
        .range([0, width]).nice();
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(3));

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 50)
        .text("Height (m)");

    // find the max value for X axis viz
    const maxAxisY = Math.max.apply(Math, data.map(function (value) {
        return value.CO2;
    }));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, maxAxisY])
        .range([height, 0]).nice();

    svg.append("g")
        .call(d3.axisLeft(y));

    // Add Y axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("y", -20)
        .text("CO2 absorption")
        .attr("text-anchor", "start")

    // Add a scale for bubble size
    const z = d3.scaleSqrt()
        .domain([0, 1000])
        .range([2, 30]);

    // Add a scale for bubble color
    // Color scale: give me a specie name, I return a color
    const myColor = d3.scaleOrdinal()
        .domain(["Celtis australis", "Aesculus hippocastanum", "Carpinus betulus", "Tilia cordata", "Platanus x hispanica", "Tilia x europaea"])
        .range(["#2E86AB", "#A23B72", "#F18F01", "#C73E1D", "#3B1F2B", "#2EDA12FF"])


    // ---------------------------//
    //      TOOLTIP               //
    // ---------------------------//

    // -1- Create a tooltip div that is hidden by default:
    const tooltip = d3.select("#bubblePlot")
        .append("div")
        .attr("class", "tooltip")

    // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
    const showTooltip = function (event, d) {
        tooltip
            .transition()
            .duration(200)
        tooltip
            .style("opacity", 1)
            .html("Canopy Cover (m2): " + d.Canopy)
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px")
    }
    const moveTooltip = function (event, d) {
        tooltip
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px")
    }
    const hideTooltip = function (event, d) {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
    }

    // ---------------------------//
    //       HIGHLIGHT GROUP      //
    // ---------------------------//

    // What to do when one group is hovered
    const highlight = function (event, d) {
        // reduce opacity of all groups
        d3.selectAll(".bubbles").style("opacity", .02)
        // expect the one that is hovered
        d3.selectAll("." + d.replaceAll(' ', '_')).style("opacity", 1)
    }

    // And when it is not hovered anymore
    const noHighlight = function () {
        d3.selectAll(".bubbles").style("opacity", 0.8)
    }

    // ---------------------------//
    //       CIRCLES              //
    // ---------------------------//

    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(data)
        .join("circle")
        .attr("class", function (d) {
            return "bubbles " + d.Name.replaceAll(' ', '_')
        })
        .attr("cx", d => x(d.Height))
        .attr("cy", d => y(d.CO2))
        .attr("r", d => z(parseFloat(d.Canopy)))
        .style("fill", d => myColor(d.Name))
        // -3- Trigger the functions for hover
        .on("mouseover", showTooltip)
        .on("mousemove", moveTooltip)
        .on("mouseleave", hideTooltip)


    // ---------------------------//
    //       LEGEND              //
    // ---------------------------//

    // Add one dot in the legend for each name.
    const size = 20
    const species = ["Celtis australis", "Aesculus hippocastanum", "Carpinus betulus", "Tilia cordata", "Platanus x hispanica", "Tilia x europaea"]
    svg.selectAll("myrect")
        .data(species)
        .join("circle")
        .attr("cx", 390)
        .attr("cy", (d, i) => 10 + i * (size + 5)) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", d => myColor(d))
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

    // Add labels beside legend dots
    svg.selectAll("mylabels")
        .data(species)
        .enter()
        .append("text")
        .attr("x", 390 + size * .8)
        .attr("y", (d, i) => i * (size + 5) + (size / 2)) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", d => myColor(d))
        .text(d => d)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)
})
