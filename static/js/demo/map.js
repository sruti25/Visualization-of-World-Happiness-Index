d3.json("world", function(error, uk) {
  if (error) return console.error(error);
  
  svg.append("path")
      .datum(topojson.feature(uk, uk.objects.subunits))
      .attr("d", d3.geo.path().projection(d3.geo.mercator()));
});

var width = 960,
    height = 1160;

var svg = d3.select(".card-body").append("svg")
    .attr("width", width)
    .attr("height", height);