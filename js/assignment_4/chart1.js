const margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);


month_labels = ["JAN", "FEB", "MAR", "APR", "MAR", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];    
url = "/pythn/assignment_4_salorno/line_chart_dataset.csv";
d3.csv(url).then(function(data){
    console.log("stampo data"); console.log(data);
    
})