// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 750 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#radarchart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
//Read the data
d3.csv("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/assignment_4_salorno/assignment4.csv").then(
    function (data) {

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        console.log(data);

        let radialScale = d3.scaleLinear()
            .domain([0, 40])
            .range([0, 250]);
        let ticks = [0, 10, 20, 30, 40];

        ticks.forEach(t =>
            svg.append("circle")
                .attr("cx", 300)
                .attr("cy", 300)
                .attr("fill", "none")
                .attr("stroke", "gray")
                .attr("r", radialScale(t))
        );

        ticks.forEach(t =>
            svg.append("text")
                .attr("x", 305)
                .attr("y", 300 - radialScale(t))
                .text(t.toString())
        );

        function angleToCoordinate(angle, value) {
            let x = Math.cos(angle) * radialScale(value);
            let y = Math.sin(angle) * radialScale(value);
            return {"x": 300 + x, "y": 300 - y};
        }

        months.forEach((month, index) => {
            let angle = (Math.PI / 2) + (2 * Math.PI * index / months.length);
            let line_coordinate = angleToCoordinate(angle, 40);
            let label_coordinate = angleToCoordinate(angle, 43);

            //draw axis line
            svg.append("line")
                .attr("x1", 300)
                .attr("y1", 300)
                .attr("x2", line_coordinate.x)
                .attr("y2", line_coordinate.y)
                .attr("stroke", "black");

            //draw axis label
            svg.append("text")
                .attr("x", label_coordinate.x - 10)
                .attr("y", label_coordinate.y)
                .text(month);
        })


        let line = d3.line()
            .x(d => console.log(d))
            .y(d => d.avg_temp);

        let colors = ["darkorange", "gray", "navy"];

        function getPathCoordinates(data_point) {
            let coordinates = [];
            months.forEach((month, index) => {
                let angle = (Math.PI / 2) + (2 * Math.PI * index / months.length);
                coordinates.push(angleToCoordinate(angle, data_point[month]));
            })
            return coordinates;
        }

        data.forEach((el, index) => {
            let color = colors[index];
            let coordinates = getPathCoordinates(el);

            //draw the path element
            svg.append("path")
                .datum(coordinates)
                .attr("d", line)
                .attr("stroke-width", 3)
                .attr("stroke", color)
                .attr("fill", color)
                .attr("stroke-opacity", 1)
                .attr("opacity", 0.5);
        })


    })