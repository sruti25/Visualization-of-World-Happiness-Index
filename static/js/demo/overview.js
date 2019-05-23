$.get("/happiness_index", {'model': 'wb_score'}, function(data_wb){
	var values1,values2;
	var margin = {top: 50, right: 20, bottom: 100, left: 100},
            width = 500;
            height = 350;
    var color = d3.scale.category10();
    var svg1 = d3.select("#correlationPlots")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform","translate(" + margin.left + "," +margin.top + ")");
    var svg2 = d3.select("#correlationPlots")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform","translate(" + margin.left + "," +margin.top + ")");

    var x = d3.scale.linear().range([0, width]);
		var y = d3.scale.linear().range([height, 0]);
		x.domain([0, 150]);
		y.domain([0, 150]);

    function drawAndUpdateCircles1(values) {
    	var tooltip = d3.tip()
		  .attr("class", "tooltip")
		  .offset([-10, 0]);
	    var circle = svg1.selectAll(".dot").data(values);
		circle.exit().remove();
		circle.enter().append("circle") // Uses the enter().append() method
			.attr("r", 0);
		circle.attr("class", "dot") // Assign a class for styling
			.attr("cx", function(d, i) { return x(d.x) })
			.attr("cy", function(d, i) { return y(d.y) })
			.attr("r", function(d,i) { return 3;})
			.style("fill", function(d,i) {return color(regions.indexOf(d.region)); })
			.call(tooltip)
			.on('mouseover', function (d, i) {
              tooltip.html( "<strong> <span style='background-color: black; color:white; font-size:14px'>" + d.country + "</span></strong>");
              tooltip.show(d.country,this);
          	})
            .on('mouseleave', function (a, i) {
              tooltip.hide(a,this)
            });
    }

    function drawAndUpdateCircles2(values) {
    	var tooltip = d3.tip()
		  .attr("class", "tooltip")
		  .offset([-10, 0]);
        var circle = svg2.selectAll(".dot").data(values);
		circle.exit().remove();
		circle.enter().append("circle") // Uses the enter().append() method
			.attr("r", 0);
		circle.attr("class", "dot") // Assign a class for styling
			.attr("cx", function(d, i) { return x(d.x) })
			.attr("cy", function(d, i) { return y(d.y) })
			.attr("r", function(d,i) { return 3;})
			.style("fill", function(d,i) {return color(regions.indexOf(d.region)); })
			.call(tooltip)
			.on('mouseover', function (d, i) {
              tooltip.html( "<strong> <span style='background-color: black; color:white; font-size:14px'>" + d.country + "</span></strong>");
              tooltip.show(d.country,this);
          	})
            .on('mouseleave', function (a, i) {
              tooltip.hide(a,this)
            });
    }

    function updateValues(v1,v2) {
    	if (v1)
    		values1 = v1;
    	if (v2)
    		values2 = v2;
    }
	$.get("/happiness_index", {'model': 'am_score'}, function(data_am){
		var values = []
		var regions = new Set();
		for (d in data_wb) {
			values.push({'country': data_am[d]['Country_Name'], 'x': data_wb[d]['Rank'], 'y': data_am[d]['Rank'], 'region': data_am[d]['Region']});
			regions.add(data_am[d]['Region']);
		}
		values1 = values;
		regions = Array.from(regions);

		var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5);
	    var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);
		svg1.append("g")         
			.attr("class", "x grid")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis
			    .tickSize(-height, 0, 0)
			);
	    svg1.append("g")         
	        .attr("class", "y grid")
	        .call(yAxis
	            .tickSize(-width, 0, 0)
	        );
	    svg1.append("text")
          .attr("x", (width / 2))             
          .attr("y", (0))
          .attr("text-anchor", "middle")  
          .style("font-size", "18px")  
          // .style("font-weight",'bold')
          .style("stroke", "#64031A")
          .text("World Bank Data vs Additive Model Predictions");

        drawAndUpdateCircles1(values);
        var valueline = d3.svg.line()
              .x(function(d,i) { return x(d.x); })
              .y(function(d) { return y(d.y); });
        svg1.append("path")
	        .attr("class", "line")
	        .attr("d", valueline([{'x':1, 'y':1}, {'x':145, 'y':145}]));

        svg1.append("text")             
	        .attr("transform","translate(" + (width/2) + " ," + (height + margin.top) + ")")
	        .style("text-anchor", "middle")
	        .style("font-style",'italic')
	        .text("Rank By World Bank");

        // text label for the y axis
        svg1.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left/2)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-style",'italic')
            .text("Rank By Additive Model"); 

            updateValues(values,null);

	});
	$.get("/happiness_index", {'model': 'lm_score'}, function(data_lm){
		var values = []
		var regions = new Set();
		for (d in data_wb) {
			values.push({'country': data_lm[d]['Country_Name'], 'x': data_wb[d]['Rank'], 'y': data_lm[d]['Rank'], 'region': data_lm[d]['Region']});
			regions.add(data_lm[d]['Region']);
		}
		values2 = values;
		regions = Array.from(regions);
        var color = d3.scale.category10();
		var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5);
	    var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);
		svg2.append("g")         
			.attr("class", "x grid")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis
			    .tickSize(-height, 0, 0)
			);
	    svg2.append("g")         
	        .attr("class", "y grid")
	        .call(yAxis
	            .tickSize(-width, 0, 0)
	        );
	    svg2.append("text")
          .attr("x", (width / 2))             
          .attr("y", (0))
          .attr("text-anchor", "middle")  
          .style("font-size", "18px")  
          .style("stroke", "#5B0318")
          .text("World Bank Data vs Linear Regression Model Predictions");

		  drawAndUpdateCircles2(values);
         var valueline = d3.svg.line()
              .x(function(d,i) { return x(d.x); })
              .y(function(d) { return y(d.y); });
        svg2.append("path")
	        .attr("class", "line")
	        .attr("d", valueline([{'x':1, 'y':1}, {'x':145, 'y':145}]));

        svg2.append("text")             
	        .attr("transform","translate(" + (width/2) + " ," + (height + margin.top) + ")")
	        .style("text-anchor", "middle")
	        .style("font-style",'italic')
	        .text("Rank By World Bank");

        // text label for the y axis
        svg2.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left/2)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-style",'italic')
            .text("Rank By Linear Regression Model"); 

        updateValues(null,values);
	});
	var regions = new Set();
	for (d in data_wb) {
		regions.add(data_wb[d]['Region']);
	}
	regions = Array.from(regions);
	var svg = d3.select("#correlationLegend")
            .append("svg")
            .attr("width", (width*3) + margin.left + margin.right)
            .attr("height", 100)
            .append("g")
	// draw legend to show the intrinsic dimensionality
    var legend = svg.selectAll(".legend")
        .data(regions)
      	.enter().append("g")
        .attr("class", "legend")
        .attr("transform",function(d, i) { var val = (i%5)+1; return "translate(" + (val*250) + "," + ((Math.floor(i/5)+1) * 40) + ")"});
    // draw legend colored rectangles
    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("class","legend-rect")
        .attr("id", function(d,i) { return "Series"+i;})
        .style("fill", function(d, i) { return color(i)})
        .on("click", function(d, i) {
        	if (this.classList.contains('selected-legend')) {
        		drawAndUpdateCircles1(values1);
        		drawAndUpdateCircles2(values2);
        		svg.selectAll('.legend-rect')
        		.attr('class', 'legend-rect')
        		.style('stroke-width',0)
        		.style('stroke','None');
        	}
        	else {
        		svg.selectAll('.legend-rect')
        		.attr('class', 'legend-rect')
        		.style('stroke-width',0)
        		.style('stroke','None');

        		svg.selectAll('#Series' + i)
        		.attr('class', 'legend-rect selected-legend')
        		.style('stroke-width',3)
        		.style('stroke','rgb(0,0,0)');

        	cur_values = []
        	for (var v in values1) {
        		if (values1[v]['region'] == d)
        			cur_values.push(values1[v])
        	}
        	drawAndUpdateCircles1(cur_values);
        	cur_values = []
        	for (v in values2) {
        		if (values2[v]['region'] == d)
        			cur_values.push(values2[v])
        	}
        	drawAndUpdateCircles2(cur_values);
        	}
        });

    // draw legend text
    legend.append("text")
        .attr("x", -10)
        .attr("y", 0)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d,i) { if (i==4) { return "CIS" }return d;})
        
});

$.get("/correlation_coefficient", {}, function(data){
	var margin = {top: 50, right: 200, bottom: 100, left: 200},
            width = 800,
            height = 350;
    series = data['series'];
    coef = data['coef'];
    var color = d3.scale.category10();
    var svg1 = d3.select("#coefficientPlot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform","translate(" + margin.left + "," +margin.top + ")");
    var x = d3.scale.linear().range([0, width]);
	var y = d3.scale.linear().range([height, 0]);
	x.domain([0, series.length + 1]);
	y.domain([d3.min(coef)-0.01,d3.max(coef)+0.01]);
	var xAxis = d3.svg.axis().scale(x).orient("bottom")
		.ticks(series.length)
		.tickFormat(function(d,i){ return series[i] });;
    var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);
	svg1.append("g")         
		.attr("class", "x grid")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis
		    .tickSize(-height, 0, 0)
		)
		.selectAll("text")
		.style("text-anchor", "end")
		.style("font", "10px times")
		.style("color", "#fffff")
		.attr("dx", "-.2em")
		.attr("dy", "0.15em")
		.attr("transform", "rotate(-45)");

    svg1.append("g")         
        .attr("class", "y grid")
        .call(yAxis
            .tickSize(-width, 0, 0)
        );

    var circle = svg1.selectAll(".dot").data(coef);
	circle.exit().remove();
	circle.enter().append("circle")
		.attr("r", 0);
	circle.attr("class", "dot") // Assign a class for styling
		.attr("cx", function(d, i) { return x(i) })
		.attr("cy", function(d, i) { return y(d) })
		.attr("r", function(d,i) { return 3;})
		.style("fill", "black");
     var valueline = d3.svg.line()
          .x(function(d,i) { return x(i); })
          .y(function(d) { return y(d); });
    svg1.append("path")
        .attr("class", "coef_line")
        .attr("d", valueline(coef));

    // text label for the y axis
    svg1.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left/2)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-style",'italic')
        .text("Coefficients"); 

    svg1.append("text")
          .attr("x", (width / 2))             
          .attr("y", (0))
          .attr("text-anchor", "middle")  
          .style("font-size", "18px")  
          .style("stroke", "#5B0318")
          .text("Coefficient of features by Linear Regression Model");

});


