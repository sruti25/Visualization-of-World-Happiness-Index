var uk_data;
var width = 960,
    height = 760;

var svg = d3.select(".card-body").append("svg")
    .attr("width", width)
    .attr("height", height);
var projection = d3.geo.mercator()
    .scale(130)
    .translate([width / 2, height / 2]);

  var path = d3.geo.path()
    .projection(projection);
d3.json("world", function(error, uk) {
  uk_data = uk;
  if (error) return console.error(error);

  var subunits = topojson.feature(uk, uk.objects.subunits);
  svg.append("path")
    .datum(subunits)
    .attr("d", path)
    .attr("class", "subunit-boundary");

  setColors('wb_score');
});

var select = document.getElementById("model_dropdown");
select.addEventListener('change', function(){
  setColors(this.value)
});

function setColors(model) {
  $.get("/happiness_index", {'model': model}, function(data){
    var count = 0;
    svg.selectAll(".subunit")
      .data(topojson.feature(uk_data, uk_data.objects.subunits).features)
      .enter().append("path")
      .attr("class", function(d) { 
        if (! (d.id in data)) {
          count += 1;
        }
        if (! (d.id in data)) {
          val = 0;
        }
        else
        {
          var val = Math.ceil(data[d.id]['Rank']/11);
          if (val == 14)
            val--;
        }
        var cls = "subunit" + val;
        return cls; })
      .attr("d", path);
  });
}

