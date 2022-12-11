// set the dimensions and margins of the graph
const margin = {top: 10, right: 70, bottom: 30, left: 40},
    width = 750 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#linechart")
    .append("svg")
    .attr('width', '100%')
    .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

//Read the data
d3.csv("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/assignment_4_salorno/assignment4.csv").then(
    function (data) {

        data.forEach(function (element) {
            element.month = element.day.slice(5);
            element.year = element.day.slice(0, 4);
        });

        // console.log(data[0].date.getFullYear())
        // console.log(data)
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // group the data: I want to draw one line per group
        const sumstat = d3.group(data, d => d.year); // nest function allows to group the calculation per level of a factor

        // Add X axis --> it is a date format
        const x = d3.scalePoint()
            .rangeRound([0, width])
            .domain(months)
            .padding(0.5);
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).ticks(5));

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([d3.min(data, function (d) {
                return +d.min_temp;
            }), d3.max(data, function (d) {
                return +d.max_temp;
            })])
            .range([height, 0]).nice();
        svg.append("g")
            .call(d3.axisLeft(y).scale(y).tickFormat((d) => d + "°C"));

        // color palette
        const min_colors = {
            '1993': '#9b0303',
            '1997': '#a68502',
            '2001': '#044801',
            '2005': '#02786c',
            '2009': '#031d87',
            '2013': '#4a02b0',
            '2017': '#730160',
            '2021': '#b3440d'
        }

        const max_colors = {
            '1993': '#d06767',
            '1997': '#b89d35',
            '2001': '#507f4d',
            '2005': '#67aea7',
            '2009': '#6878b7',
            '2013': '#6a4c93',
            '2017': '#c059b0',
            '2021': '#c26a3d'
        }

        // create a tooltip
        const tooltip = d3.select("#linechart")
            .append("div")
            .attr("class", "tooltip")

        // Highlight the specie that is hovered
        const highlight = function (event, el) {

            const highlight_data = data.filter(d => d.year === el.toString())

            const min_temp = d3.min(highlight_data, function (d) {
                return +d.min_temp;
            })

            const max_temp = d3.max(highlight_data, function (d) {
                return +d.max_temp;
            })

            const avg_temp = d3.median(highlight_data, function (d) {
                return +d.avg_temp;
            })

            selected_year = el

            d3.selectAll("path")
                .style("stroke", "grey")
                .style("opacity", .4)

            d3.selectAll("circle")
                .style("fill", "grey")
                .style("opacity", .4)

            d3.selectAll(".c" + selected_year)
                .style("fill", min_colors[selected_year])
                .style("opacity", 1)

            d3.selectAll(".y_max" + selected_year)
                .style("stroke", max_colors[selected_year])
                .style("opacity", 1)

            d3.selectAll(".y_min" + selected_year)
                .style("stroke", min_colors[selected_year])
                .style("opacity", 1)

            d3.selectAll(".domain")
                .style("stroke", "black")
                .style("opacity", 1)

            tooltip.transition()
                .duration(200)
                .style("opacity", 1);

            tooltip.html("<span class='tooltiptext'>" + "<b>Year: </b>" + selected_year + "<br>" + "Min temperature: " + min_temp + " °C" + "<br>"
                + "Max temperature: " + max_temp + " °C" + "<br>"
                + "Mean temperature: " + avg_temp + " °C" + "<br>" + "</span>")
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");

        }

        // Highlight the specie that is hovered
        const doNotHighlight = function () {
            d3.selectAll("path")
                .style("stroke", d => max_colors[d])
                .style("opacity", 1)

            d3.selectAll("circle")
                .style("fill", d => min_colors[d.year])
                .style("opacity", 1)

            tooltip
                .transition()
                .duration(100)
                .style("opacity", 0)
        }


        // Draw the max temp line
        svg.selectAll(".line")
            .data(sumstat)
            .join("path")
            .attr("class", function (d) {
                return "y_max" + d[0]
            })
            .attr("fill", "none")
            .attr("stroke", function (d) {
                return max_colors[d[0]]
            })
            .attr("stroke-width", 1.5)
            .attr("d", function (d) {
                return d3.line()
                    .x(function (d) {
                        return x(months[+d.month - 1]);
                    })
                    .y(function (d) {
                        return y(+d.max_temp);
                    })
                    (d[1])
            })

        // Draw the min temp line
        svg.selectAll(".line")
            .data(sumstat)
            .join("path")
            .attr("class", function (d) {
                return "y_min" + d[0]
            })
            .attr("fill", "none")
            .attr("stroke", function (d) {
                return min_colors[d[0]]
            })
            .attr("stroke-width", 1.5)
            .attr("d", function (d) {
                return d3.line()
                    .x(function (d) {
                        return x(months[+d.month - 1]);
                    })
                    .y(function (d) {
                        return y(+d.min_temp);
                    })
                    (d[1])
            })

        svg.selectAll("circle")
            .data(data)
            .join("circle")
            .attr("class", function (d) {
                return "c" + d.year
            })
            .attr("cx", function (d) {
                return x(months[+d.month - 1]);
            })
            .attr("cy", function (d) {
                return y(+d.avg_temp);
            })
            .attr("r", 3)
            .style("fill", function (d) {
                return min_colors[d.year]
            })

        // Add one line in the legend for each year.
        const size = 20
        const years = [1993, 1997, 2001, 2005, 2009, 2013, 2017, 2021]
        svg.selectAll("myrect")
            .data(years)
            .join("rect")
            .attr("x", 645)
            .attr("y", (d, i) => 10 + i * (size + 6)) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("width", 18)
            .attr('height', 5)
            .style("fill", d => max_colors[d])
            .on("mouseover", highlight)
            .on("mouseleave", doNotHighlight)

        svg.selectAll("myrect")
            .data(years)
            .join("rect")
            .attr("x", 645)
            .attr("y", (d, i) => 20 + i * (size + 6)) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("width", 18)
            .attr('height', 5)
            .style("fill", d => min_colors[d])
            .on("mouseover", highlight)
            .on("mouseleave", doNotHighlight)

        // Add labels beside legend dots
        svg.selectAll("mylabels")
            .data(years)
            .enter()
            .append("text")
            .attr("x", 655 + size * .8)
            .attr("y", (d, i) => i * (size + 6) + 15) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", d => min_colors[d])
            .text(d => d)
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .on("mouseover", highlight)
            .on("mouseleave", doNotHighlight)


    })
