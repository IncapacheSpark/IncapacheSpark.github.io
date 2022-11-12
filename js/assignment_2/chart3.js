const margin = {top: 40, right: 100, bottom: 60, left: 30},
    width = 700 - margin.left - margin.right,
    height = 420 - margin.top - margin.bottom;

// append the svg object to the body of the page
let Svg = d3.select("#scatter")
    .append("svg")
    .attr('width', '100%')
    .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/ass2.csv").then(function (data) {

    // List of groups (here I have one group per column)
    const xItem = ["Height", "Crown_height", "Crown_width", "Canopy", "Leaf_area", "Leaf_biomass"]

    // List of groups (here I have one group per column)
    const yItem = ["CO2", "Pollution"]

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

    function display(xVal, yVal){

        d3.selectAll("g > *").remove();

        // find the max value for X axis viz
        const maxAxisX = Math.max.apply(Math, data.map(function (value) {
            return +value[xVal];
        }));

        // Add X axis
        const x = d3.scaleLinear()
            .domain([0, 0])
            .range([0, width - margin.right]);

        const xAxis = Svg.append("g")
            .attr("class", "myXaxis")   // Note that here we give a class to the X axis, to be able to call it later and modify it
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .attr("opacity", "0")

        // Add X axis label:
        Svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width - margin.right)
            .attr("y", height + 50)
            .text(xVal);

        // find the max value for X axis viz
        const maxAxisY = Math.max.apply(Math, data.map(function (value) {
            return +value[yVal];
        }));

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0, maxAxisY])
            .range([height, 0]).nice();
        Svg.append("g")
            .call(d3.axisLeft(y));

        // Add Y axis label:
        Svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", 0)
            .attr("y", -20)
            .text(yVal)

        // Add a clipPath: everything out of this area won't be drawn.
        const clip = Svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", width)
            .attr("height", height)
            .attr("x", 0)
            .attr("y", 0);

        // Color scale: give me a specie name, I return a color
        const color = d3.scaleOrdinal()
            .domain(["Celtis_australis", "Aesculus_hippocastanum", "Carpinus_betulus", "Tilia_cordata", "Platanus_x_hispanica", "Tilia_x_europaea"])
            .range(["#2E86AB", "#A23B72", "#F18F01", "#C73E1D", "#3B1F2B", "#2EDA12FF"])

        // Create the scatter variable: where both the circles and the brush take place
        const scatter = Svg.append('g')
            .attr("clip-path", "url(#clip)")

        // create a tooltip
        const tooltip = d3.select("#scatter")
            .append("div")
            .attr("class", "tooltip")

        // Highlight the specie that is hovered
        const highlight = function (event, d) {

            selected_specie = d

            d3.selectAll(".dot")
                .style("opacity", 0)

            d3.selectAll("." + selected_specie.replaceAll(' ', '_'))
                .style("opacity", 1)

        }

        // Highlight the specie that is hovered
        const doNotHighlight = function () {
            d3.selectAll(".dot")
                .style("opacity", 1)
        }

        // A function that change this tooltip when the user hover a point.
        // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
        const showTooltip = function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 1);

            tooltip.html("<span class='tooltiptext'>" + `${xVal}: ` + d[xVal] + "</span>")
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        }
        const moveTooltip = function (event, d) {
            tooltip
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px")
        }
        // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
        const hideTooltip = function () {
            tooltip
                .transition()
                .duration(100)
                .style("opacity", 0)
        }

        // Add circles
        scatter.append("g")
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", function (data) {
                return "dot " + data.Name.replaceAll(' ', '_')
            })
            .attr("cx", function (data) {
                return x(data[xVal]);
            })
            .attr("cy", function (data) {
                return y(data[yVal]);
            })
            .attr("r", 5)
            .style("fill", function (data) {
                return color(data.Name.replaceAll(' ', '_'))
            })
            // Show tooltip on hover
            .on("mouseover", showTooltip)
            .on("mousemove", moveTooltip)
            .on("mouseleave", hideTooltip)

        // new X axis
        x.domain([0, maxAxisX])
        Svg.select(".myXaxis")
            .transition()
            .duration(200)
            .attr("opacity", "1")
            .call(d3.axisBottom(x));

        Svg.selectAll("circle")
            .transition()
            .delay(function (d, i) {
                return i/2
            })
            .duration(200)
            .attr("cx", function (d) {
                return x(d[xVal]);
            })
            .attr("cy", function (d) {
                return y(d[yVal]);
            })

        // ---------------------------//
        //       LEGEND              //
        // ---------------------------//

        // Add one dot in the legend for each name.
        const size = 20
        const species = ["Celtis australis", "Aesculus hippocastanum", "Carpinus betulus", "Tilia cordata", "Platanus x hispanica", "Tilia x europaea"]
        Svg.selectAll("myrect")
            .data(species)
            .join("circle")
            .attr("cx", 490)
            .attr("cy", (d, i) => 10 + i * (size + 5)) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 7)
            .style("fill", d => color(d))
            .on("mouseover", highlight)
            .on("mouseleave", doNotHighlight)

        // Add labels beside legend dots
        Svg.selectAll("mylabels")
            .data(species)
            .enter()
            .append("text")
            .attr("x", 490 + size * .8)
            .attr("y", (d, i) => i * (size + 5) + (size / 2)) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", d => color(d))
            .text(d => d)
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .on("mouseover", highlight)
            .on("mouseleave", doNotHighlight)

    }

    display("Height", "CO2")

    // When the button is changed, run the updateChart function
    d3.select("#selection-x").on("change", function(event,d) {
        // recover the option that has been chosen
        const selectedOptionX = d3.select(this).property("value")
        // run the updateChart function with this selected option
        display(selectedOptionX, d3.select("#selection-y").property("value"))
    })

    // When the button is changed, run the updateChart function
    d3.select("#selection-y").on("change", function(event,d) {
        // recover the option that has been chosen
        const selectedOptionY = d3.select(this).property("value")
        // run the updateChart function with this selected option
        display(d3.select("#selection-x").property("value"), selectedOptionY)
    })

})
