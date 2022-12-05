const margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 750 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

const svg = d3.select("#radarchart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const colors = {
    '1993': '#cf0202',
    '1997': '#cfa602',
    '2001': '#0bb502',
    '2005': '#039687',
    '2009': '#032096',
    '2013': '#4a02b0',
    '2017': '#b00293',
    '2021': '#333233'
}


const CENTER_X = 300;
const CENTER_Y = CENTER_X;
const MAX_RADIUS = 250;

/*
ESEMPIO ELEMENTO DI DATA
{
  "day": "1993-01",
  "min_temp": "-9.0",
  "max_temp": "12.0",
  "avg_temp": "0.44",
  "month": "01",
  "year": "1993"
}
*/

const url = "/python/assignment_4_salorno/assignment4.csv";
d3.csv(url).then(function (data) {

    data.forEach(function (element) {
        element.month = element.day.slice(5);
        element.year = element.day.slice(0, 4);
    });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    console.log(data);

    min_max_domain = [d3.min(data, function (d){
            return +d.min_temp;
        }), d3.max(data, function (d) {
            return +d.max_temp;
        })];
    
    let radialScale = d3.scaleLinear()
        .domain(min_max_domain)
        .range([0, MAX_RADIUS]);

    let ticks = [min_max_domain[0], 0, 10, 20, 30, min_max_domain[1]];

    ticks.forEach(t =>
        svg.append("text")
            .attr("x", CENTER_X + 5)
            .attr("y", CENTER_Y - radialScale(t))
            .text(t.toString()+" °C")
    );

    function angleToCoordinate(angle, value) {
        let x = -Math.cos(angle) * radialScale(value);
        let y = Math.sin(angle) * radialScale(value);
        return {"x": CENTER_X + x, "y": CENTER_Y - y};
    }

    /* CREAZIONE DEI RAGGI */
    months.forEach((month, index) => {
        let angle = (Math.PI / 2) + (2 * Math.PI * index / months.length);
        let line_coordinate = angleToCoordinate(angle, min_max_domain[1]);      //as object{x: , y:}
        let label_coordinate = angleToCoordinate(angle, min_max_domain[1] +3);

        svg.append("line")     //draw axis line for each month
            .attr("x1", CENTER_X)
            .attr("y1", CENTER_Y)       //linee partono dal centro
            .attr("x2", line_coordinate.x)  //linee arrivano fino al punto calcolato
            .attr("y2", line_coordinate.y)
            .attr("stroke", "black");

        svg.append("text")   //draw axis label for each month
            .attr("x", label_coordinate.x - 10)
            .attr("y", label_coordinate.y)
            .text(month);
    })

    const tooltip = d3.select("#radarchart")
            .append("div")
            .attr("class", "tooltip")



    const highlight = function (event, el) {
        /* 
        const min_temp = d3.min(data, function (d) {
            if (d.year === el.toString())
                return d.min_temp;
        })
        const max_temp = d3.max(data, function (d) {
            if (d.year === el.toString())
                return d.max_temp;
        })*/
        const avg_temp = d3.median(data, function (d) {
            if (d.year === el.toString())
                return d.avg_temp;
        })
        selected_year = el
        d3.selectAll("path")
            .style("stroke", "grey")
            .style("opacity", .4)
        /*
        d3.selectAll("circle")
            .style("fill", "grey")
            .style("opacity", .4)
           
        d3.selectAll(".obs_circle" + selected_year)
            .style("fill", colors[selected_year])
            .style("opacity", 1)
        */
        d3.selectAll(".y" + selected_year)
            .style("stroke", colors[selected_year])
            .style("opacity", 1)
            
        d3.selectAll(".domain")
            .style("stroke", "black")
            .style("opacity", 1)
        tooltip.transition()
            .duration(200)
            .style("opacity", 1);
        tooltip.html("<span class='tooltiptext'>" + "Mean temperature: " + avg_temp + " °C" + "<br>" 
                        + "</span>")
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px");

    }  //fine funzione highlight

    const doNotHighlight = function () {
        d3.selectAll("path")
            .style("stroke", d => colors[d])
            .style("opacity", 1);
        /*
        d3.selectAll("circle")
            .style("stroke", d => colors[d])
            .style("opacity", 1);
        
        d3.selectAll(".observation_circle")
            .style("fill", d => colors[d.year])
            .style("opacity", 1);
        */
        tooltip
            .transition()
            .duration(100)
            .style("opacity", 0);
    }


    /* CREAZIONE LINEE SPEZZATE */
    const sumstat = d3.group(data, d => d.year);    //raggruppo righe per ogni anno
    d3.selectAll("path")                            //seleziona elementi path prima di crearli
        .style("stroke", "grey")       //ogni elemento path e' una linea spezzata per un anno di temperature
        .style("opacity", .4)
    svg.selectAll(".line")
        .data(sumstat)
        .join("path")
        .attr("class", function (d) {       //determino classe css dell'anno, e.g. "y1993"
            return "y" + d[0]
        })
        .attr("fill", "none")
        .attr("stroke", function (d) {     //colore dell'anno
            return colors[d[0]]
        })
        .attr("stroke-width", 1.5)
        .attr("d", function (d) {           //lista di coordinate del cammino
            return d3.line()
                .x(function (d) {
                    let index = +d.month -1// lui fa -1   
                    let angle = (Math.PI / 2) + (2 * Math.PI * index / months.length);
                    let value = d.avg_temp;
                    let coords = angleToCoordinate(angle, value);      //as object{x: , y:}
                    return coords.x
                    //return x(months[+d.month - 1]);  //vecchia versione
                })
                .y(function (d) {
                    let index = +d.month -1 // lui fa -1   
                    let angle = (Math.PI / 2) + (2 * Math.PI * index / months.length);
                    let value = d.avg_temp;
                    let coords = angleToCoordinate(angle, value);      //as object{x: , y:}
                    return coords.y;
                    //return y(+d.max_temp);
                })
                (d[1])
        })  

    /* CIRCONFERENZE CONCENTRICHE */
    ticks.forEach(t =>                  //LE circonfrenze concentriche intersecano i tick
    svg.append("circle")
        .attr("cx", CENTER_X)
        .attr("cy", CENTER_Y)
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("r", radialScale(t))
        .attr("class", "concentric_circle")
    );
    /* CERCHI CON OSSERVAZIONI SU OGNI MESE */
    /*
    svg.selectAll("mycircle")
        .data(data)
        .join("circle")            //il nome dell'elemento svg
        .attr("class", function(d){
            return "obs_circle"+d.year;
        })
        .attr("cx", function (d) {
            let index = +d.month -1  
            let angle = (Math.PI / 2) + (2 * Math.PI * index / months.length);
            let value = d.avg_temp;
            let coords = angleToCoordinate(angle, value);      //as object{x: , y:}
            return coords.x
        })
        .attr("cy", function (d) {
            let index = +d.month  -1
            let angle = (Math.PI / 2) + (2 * Math.PI * index / months.length);
            let value = d.avg_temp;
            let coords = angleToCoordinate(angle, value);      //as object{x: , y:}
            return coords.y
        })
        .attr("r", 3)
        .style("fill", function (d) {
            return colors[d.year]
        });
        */
        
        

    /*LEGENDA CHE ILLUSTRA IL COLORE */
    const size = 20
    const years = [1993, 1997, 2001, 2005, 2009, 2013, 2017, 2021]
    svg.selectAll("myrect")
        .data(years)
        .join("rect")
        .attr("x", 645)
        .attr("y", (d, i) => 10 + i * (size + 6)) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", 30)
        .attr('height', 15)
        .style("fill", d => colors[d])
        .on("mouseover", highlight)
        .on("mouseleave", doNotHighlight)

    svg.selectAll("mylabels")
        .data(years)
        .enter()
        .append("text")
        .attr("x", 655 + size * .8)
        .attr("y", (d, i) => i * (size + 6) + (size / 2)) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", d => colors[d])
        .text(d => d)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", highlight)
        .on("mouseleave", doNotHighlight)


})










/* d3.line generatore di linee

    let line = d3.line()
        .x(d => console.log(d))
        .y(d => d.avg_temp)
        .context(null);

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

*/