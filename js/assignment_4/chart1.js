const margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

/*
ESEMPIO ELEMENTO DI ARRAY DATA
{
  "day": "1993-01",
  "min_temp": "-9.0",
  "max_temp": "12.0",
  "avg_temp": "0.44"
}
SPECIFICHE GRAFICO: creare uno scatterplot per ogni anno considerato. Nello scatterplot per ogni mese (asse x) va rappresentata la
temperatura minima, media e massima. I punti dello scatterplot sono uniti. 
*/

month_labels = ["JAN", "FEB", "MAR", "APR", "MAR", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

url = "/python/assignment_4_salorno/assignment4.csv";
d3.csv(url, function(d){
    return { date : d3.timeParse("%Y-%m")(d.day), value : d.value }
}).then(function(data) {
    console.log("stampo data")
    console.log(data);

    const x = d3.scaleTime()             
        .domain(d3.extent(data, d => d.day.slice(5)))   //il dominio e' il mese
        .range([ 0, width ]);
    
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    const y = d3.scaleLinear()
        .domain( [8000, 9200])
        .range([ height, 0 ]);
    svg.append("g")
        .call(d3.axisLeft(y));
    
    svg                     // Add the line
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#69b3a2")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => x(d.date))
            .y(d => y(d.value))
        )
    

    svg            // Add the points
        .append("g")
        .selectAll("dot")
        .data(data)
        .join("circle")
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.value))
        .attr("r", 5)
        .attr("fill", "#69b3a2")
})