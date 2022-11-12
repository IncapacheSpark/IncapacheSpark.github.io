// set the dimensions and margins of the graph
const margin = {top: 40, right: 100, bottom: 60, left: 20},
    width = 700 - margin.left - margin.right,
    height = 620 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#bubblePlot")
    .append("svg")
    .attr('width', '100%')
    .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

//Read the data
d3.csv("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/ass2.csv").then(function (data) {

    // List of groups (here I have one group per column)
    const xItem = ["Height", "Crown_height", "Crown_width", "Canopy", "Leaf_area", "Leaf_biomass"]

    // List of groups (here I have one group per column)
    const yItem = ["CO2", "Pollution"]

    const zItem = Array.from(xItem)

    // add the options to the button
    d3.select("#selection-x")
        .selectAll('myOptions')
        .data(xItem)
        .enter()
        .append('option')
        .text(function (d) {
            return d;
        }) // text showed in the menu
        .attr("value", function (d) {
            return d;
        }) // corresponding value returned by the button

    // add the options to the button
    d3.select("#selection-y")
        .selectAll('myOptions')
        .data(yItem)
        .enter()
        .append('option')
        .text(function (d) {
            return d;
        }) // text showed in the menu
        .attr("value", function (d) {
            return d;
        }) // corresponding value returned by the button

    // add the options to the button
    d3.select("#selection-z")
        .selectAll('myOptions')
        .data(zItem)
        .enter()
        .append('option')
        .text(function (d) {
            return d;
        }) // text showed in the menu
        .attr("value", function (d) {
            return d;
        }) // corresponding value returned by the button

    // When the button is changed, run the updateChart function
    d3.select("#selection-x").on("change", function(event,d) {
        // recover the option that has been chosen
        const selectedOptionX = d3.select(this).property("value")
        const selectedOptionY = d3.select("#selection-y").property("value")
        const selectedOptionZ = d3.select("#selection-z").property("value")
        // run the updateChart function with this selected option
        display(selectedOptionX, selectedOptionY, selectedOptionZ)
    })

    // When the button is changed, run the updateChart function
    d3.select("#selection-y").on("change", function(event,d) {
        // recover the option that has been chosen
        const selectedOptionY = d3.select(this).property("value")
        const selectedOptionX = d3.select("#selection-x").property("value")
        const selectedOptionZ = d3.select("#selection-z").property("value")
        // run the updateChart function with this selected option
        display(selectedOptionX, selectedOptionY, selectedOptionZ)
    })

    // When the button is changed, run the updateChart function
    d3.select("#selection-z").on("change", function(event,d) {
        // recover the option that has been chosen
        const selectedOptionZ = d3.select(this).property("value")
        const selectedOptionX = d3.select("#selection-x").property("value")
        const selectedOptionY = d3.select("#selection-y").property("value")
        // run the updateChart function with this selected option
        display(selectedOptionX, selectedOptionY, selectedOptionZ)
    })

    // ---------------------------//
    //           SCALE            //
    // ---------------------------//

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
        const selectedOptionX = d3.select("#selection-x").property("value")
        tooltip
            .transition()
            .duration(200)
        tooltip
            .style("opacity", 1)
            .html("Canopy Cover (m2): " + d[selectedOptionX])
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

    function display(xVal, yVal, zVal) {

        d3.selectAll("g > *").remove();

        // find the max value for X axis viz
        const maxAxisX = Math.max.apply(Math, data.map(function (value) {
            return value[xVal];
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
            .text(xVal);

        // find the max value for X axis viz
        const maxAxisY = Math.max.apply(Math, data.map(function (value) {
            return value[yVal];
        }));

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0, maxAxisY])
            .range([height, 0]).nice();

        svg.append("g")
            .call(d3.axisLeft(y));

        // Add Y axis label:
        svg.append("text")
            .attr("text-anchor", "start")
            .attr("x", 0)
            .attr("y", -20)
            .text(yVal)

        // Add a scale for bubble size
        const z = d3.scaleSqrt()
            .domain([0, 1000])
            .range([2, 30]);

        // Add dots
        svg.append('g')
            .selectAll("dot")
            .data(data)
            .join("circle")
            .attr("class", function (d) {
                return "bubbles " + d.Name.replaceAll(' ', '_')
            })
            .attr("cx", d => x(d[xVal]))
            .attr("cy", d => y(d[yVal]))
            .attr("r", d => z(parseFloat(d[zVal])))
            .style("fill", d => myColor(d.Name))
            // -3- Trigger the functions for hover
            .on("mouseover", showTooltip)
            .on("mousemove", moveTooltip)
            .on("mouseleave", hideTooltip)

        addLegend()
    }

    // ---------------------------//
    //       LEGEND              //
    // ---------------------------//

    function addLegend() {// Add one dot in the legend for each name.

        const size = 20
        const species = ["Celtis australis", "Aesculus hippocastanum", "Carpinus betulus", "Tilia cordata", "Platanus x hispanica", "Tilia x europaea"]
        svg.selectAll("myrect")
            .data(species)
            .join("circle")
            .attr("cx", 490)
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
            .attr("x", 490 + size * .8)
            .attr("y", (d, i) => i * (size + 5) + (size / 2)) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", d => myColor(d))
            .text(d => d)
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .on("mouseover", highlight)
            .on("mouseleave", noHighlight)
    }

    display("Height", "CO2", "Canopy")
})
