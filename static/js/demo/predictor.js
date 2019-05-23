var select = document.getElementById("country_dropdown");
var rank = document.getElementById("currentRank");
var cur_country = 'AFG';
var feature_value = []
$.post("/country_list",function(data){
          data.forEach(function (d,i) {
          	var opt = d['Country_Name'];
		    var el = document.createElement("option");
		    el.textContent = opt;
		    el.value = d['Country_Code'];
		    select.appendChild(el);
          });
});

select.addEventListener('change', function(){
    var text = this.options[this.selectedIndex].text;
    var value = this.value;
    cur_country = value;
    $.get("/country_2016_data",data={'country':value},function(data_received){
    	$.get("/get_changed_rank",data={'country':cur_country, 'value': JSON.stringify(data_received['chart_data']), 'series': 0},function(data_received){
	    	rank.innerHTML = data_received['rank'];
	    });
        updateChart1(data_received);
	});
	$.get("/feature_year_data",data={'country':value},function(data_received){
		updateChart2(data_received);
	});
	$.get("/feature_country_data",data={'country':value},function(data_received){
		updateChart3(data_received);
	});
});



var margin = {top: 30, right: 20, bottom: 100, left: 100},
            width = 600;
            height = 350;

var x1 = d3.scale.linear().range([0, width+200]);
var y1 = d3.scale.linear().range([height, 0]);
var x2 = d3.scale.linear().range([0, width-100]);
var y2 = d3.scale.linear().range([height, 0]);
var x3 = d3.scale.linear().range([0, width-100]);
var y3 = d3.scale.linear().range([height, 0]);

var color = d3.scale.category10();

var svg1 = d3.select(".happinessScorePredictor")
            .append("svg")
            .attr("width", width + 200 + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform","translate(" + margin.left + "," +margin.top + ")");



function updateChart1(data) {
	var width1 = width+200;

	var labels = data['labels'];
	var values = data['chart_data'];
	var description = data['description'];
	feature_value = values;
	//AXES
	x1.domain([0, labels.length]);
	y1.domain([d3.min(values, function(d,i) { return d; })-0.1 , d3.max(values, function(d,i) { return d; })+0.5]);

	var xAxis = d3.svg.axis().scale(x1).orient("bottom")
    				.ticks(labels.length)
    				.tickFormat(function(d,i){ return labels[i] });
    var yAxis = d3.svg.axis().scale(y1).orient("left").ticks(5);

    svg1.select(".x")
		.transition()
		.duration(500)  
		.attr("class", "x grid")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis
		    .tickSize(-height, 0, 0)
		)
		.selectAll("text")
		.style("text-anchor", "end")
		.style("font", "14px times")
		.style("font-family", "Courier New")
		.style("color", "#fffff")
		.attr("dx", "-.2em")
		.attr("dy", ".15em")
		.attr("transform", "rotate(-65)");

	svg1.select(".y")
		.transition()
		.duration(500)    
		.attr("class", "y grid")
        .call(yAxis
            .tickSize(-width1, 0, 0)
        )
        .selectAll("text")
        .style("font", "14px times")
		.style("font-family", "Courier New")

    //DRAGGABLE
    dragX = -1;
    dragY = -1;

    let drag = d3.behavior.drag()
    	.origin(function(d,i) { return {'x' : i, 'y': this.cy.baseVal.value}; })
        .on('dragstart', dragstarted)
        .on('drag', dragged)
        .on('dragend', dragended);

    function dragstarted(d) {
	    d3.selection().classed('active', true);
	}

	function dragged(d) {
		if (dragX == -1)
	    	dragX = d3.event.x;
	    d1 = d3.event.y;
	    dragY = y1.invert(d1);
	    d3.select(this)
	        .attr('cy', d1);
	    rank.innerHTML = '--';
	}

	function dragended(d) {
	    d3.selection().classed('active', false);
	    d = dragY;
	    feature_value[dragX] = dragY;
	    $.get("/get_changed_rank",data={'country':cur_country, 'value': JSON.stringify(feature_value), 'series': dragX},function(data_received){
	    	rank.innerHTML = data_received['rank'];
	    });
	    dragX =-1;
	    dragY = -1;
	}


    var tooltip = d3.tip()
		  .attr("class", "tooltip")
		  .offset([-10, 0]);

	//DATA POINTS
	var circle = svg1.selectAll(".dot")
				.data(values);
	circle.exit().remove();
	circle.enter().append("circle") // Uses the enter().append() method
		.attr("r", 0)
				.call(drag);
	circle.transition()
		.duration(500)
		.attr("class", "dot") // Assign a class for styling
		.attr("cx", function(d, i) { return x1(i) })
		.attr("cy", function(d, i) { return y1(d) })
		.attr("r", function(d,i) { return 8;})
		.style("fill", function(d,i) {return "#dc3912"; });
}

$.get("/country_2016_data",data={'country':'AFG'},function(data_received){
	var labels = data_received['labels'];
	var values = data_received['chart_data'];
	feature_value = values;
	var width1 = width+200;
	$.get("/get_changed_rank",data={'country':cur_country, 'value': JSON.stringify(feature_value)},function(data_received){
	    	rank.innerHTML = data_received['rank'];
	    });
    updateChart1(data_received);

    //AXES
	var xAxis = d3.svg.axis().scale(x1).orient("bottom")
    				.ticks(labels.length)
    				.tickFormat(function(d,i){ return labels[i] });
    var yAxis = d3.svg.axis().scale(y1).orient("left").ticks(5);
	svg1.append("g")         
		.attr("class", "x grid")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis
		    .tickSize(-height, 0, 0)
		)
		.selectAll("text")
		.style("text-anchor", "end")
		.style("font", "14px times")
		.style("color", "#fffff")
		.attr("dx", "-.2em")
		.attr("dy", "0.15em")
		.attr("transform", "rotate(-45)");

    svg1.append("g")         
        .attr("class", "y grid")
        .call(yAxis
            .tickSize(-width1, 0, 0)
        )
    
    svg1.append("text")
          .attr("x", ((width1) / 2))             
          .attr("y", (0))
          .attr("text-anchor", "middle")  
          .style("font-size", "16px")  
          .text("Values of coefficients for the country selected from dropdown");

    svg1.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left/2)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-style",'italic')
        .text("Standardized values of coefficients"); 
});

var width2 = width-100;
var svg2 = d3.select(".featureTrend")
            .append("svg")
            .attr("width", width2+ margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform","translate(" + margin.left + "," +margin.top + ")");

var svg3 = d3.select(".featureTrend")
            .append("svg")
            .attr("width", width - 100 + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform","translate(" + margin.left + "," +margin.top + ")");


function drawlegend(labels) {
	regions = labels;
	var svg = d3.select("#featureLegend")
            .append("svg")
            .attr("width", (width*3) + margin.left + margin.right)
            .attr("height", 300)
            .append("g")
    var legend = svg.selectAll(".legend")
        .data(regions)
      	.enter().append("g")
        .attr("class", "legend")
        .attr("transform",function(d, i) { var val = (i%6)+1; return "translate(" + (val*200) + "," + ((Math.floor(i/6)+1) * 38) + ")"});

    var lineOpacity = "0.35";
	var lineOpacityHover = "0.85";
	var otherLinesOpacityHover = "0.1";
	var lineStroke = "1.5px";
	var lineStrokeHover = "2.5px";
    // draw legend colored rectangles
    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("class","legend-rect")
        .attr("id", function(d,i) { return "Series"+i;})
        .style("fill", function(d, i) { return color(i)})
        .on("mouseover", function(d,i) {
			svg2.append("text")
		        .attr("class", "title-text")
		        .style("fill", color(i))        
		        .text(labels[i])
		        .attr("x", (width2)/2)
		        .attr("y", 5);
		    svg3.append("text")
		        .attr("class", "title-text")
		        .style("fill", color(i))        
		        .text(labels[i])
		        .attr("x", (width2)/2)
		        .attr("y", 5);
		    d3.selectAll('.line')
						.style('opacity', otherLinesOpacityHover);
			d3.selectAll('.legend-rect')
						.style('opacity', otherLinesOpacityHover);
		    d3.selectAll('#Series'+i)
		        .style('opacity', lineOpacityHover)
		        .style("stroke-width", lineStrokeHover)
		        .style("cursor", "pointer")
		        .attr("width", 30)
		        .attr("height", 30);
		    })
	    .on("mouseout", function(d) {
	      	d3.selectAll(".line")
					.style('opacity', lineOpacity);
		  	d3.selectAll('.legend-rect')
					.style('opacity', 1);
	      	d3.select(this)
		        .style("stroke-width", lineStroke)
		        .style("cursor", "none")
		        .attr("width", 18)
	            .attr("height", 18);

            svg3.select(".title-text").remove();
	      	svg2.select(".title-text").remove();
	    });
    // draw legend text
    legend.append("text")
        .attr("x", -10)
        .attr("y", 0)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d,i) { return d;})
}

function updateChart2(data) {
	var values = data['chart_data'];
	var labels = data['series'];
	var years = ['2012','2014','2015','2016'];
    x2.domain([0, 3]);
	y2.domain([ d3.min(values, function(array) {return d3.min(array); })-0.2, d3.max(values, function(array) {return d3.max(array); }) + 0.2]);
	var xAxis = d3.svg.axis().scale(x2).orient("bottom")
    				.ticks(4)
    				.tickFormat(function(d,i){ return years[i] });
    var yAxis = d3.svg.axis().scale(y2).orient("left").ticks(6);

    svg2.selectAll("g").remove();

	var valueline = d3.svg.line()
                        .x(function(d,i) { return x2(i); })
                        .y(function(d) { return y2(d); });
                        
    svg2.append("g")         
		.attr("class", "x grid")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis
		    .tickSize(-height, 0, 0)
		)
		.selectAll("text")
		.style("text-anchor", "end")
		.style("font", "10px times")
		.style("color", "#fffff")
		.attr("dx", "-.8em")
		.attr("dy", ".15em")
		.attr("transform", "rotate(-65)");

    svg2.append("g")         
        .attr("class", " y grid")
        .call(yAxis
            .tickSize(-width2, 0, 0)
        )

    svg2.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left/2)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-style",'italic')
        .text("Standardized values of coefficients"); 
     
     svg2.append("text")             
	        .attr("transform","translate(" + (width/2.5) + " ," + (height+50) + ")")
	        .style("text-anchor", "middle")
	        .style("font-style",'italic')
	        .text("YEAR");

	let lines = svg2.append('g')
  		.attr('class', 'lines');

  	var valueline = d3.svg.line()
                    .x(function(d,i) { return x2(i); })
                    .y(function(d) { return y2(d); });
    var lineOpacity = "0.35";
	var lineOpacityHover = "0.85";
	var otherLinesOpacityHover = "0.1";
	var lineStroke = "1.5px";
	var lineStrokeHover = "2.5px";

	//References : https://codepen.io/zakariachowdhury/pen/JEmjwq
	line = lines.selectAll('.line-group')
	  .data(values).enter()
	  .append('g')
	  .attr('class', 'line-group')  
	  .on("mouseover", function(d, i) {
	      svg2.append("text")
	        .attr("class", "title-text")
	        .style("fill", color(i))        
	        .text(labels[i])
	        .attr("x", (width2)/2)
	        .attr("y", 5);
	      svg3.append("text")
	        .attr("class", "title-text")
	        .style("fill", color(i))        
	        .text(labels[i])
	        .attr("x", (width2)/2)
	        .attr("y", 5);
	    })
	  .on("mouseout", function(d) {
	      svg2.select(".title-text").remove();
	      svg3.select(".title-text").remove();
	    })
	  .append('path')
	  .attr('class', 'line')
	  .attr('id', function(d,i) { return 'Series'+i;})
	  .on("mouseover", function(d,i) {
	      d3.selectAll('.line')
						.style('opacity', otherLinesOpacityHover);
		  d3.selectAll('.legend-rect')
						.style('opacity', otherLinesOpacityHover);
	      d3.selectAll('#Series'+i)
	        .style('opacity', lineOpacityHover)
	        .style("stroke-width", lineStrokeHover)
	        .style("cursor", "pointer")
	        .attr("width", 25)
            .attr("height", 25);
	    })
	  .on("mouseout", function(d,i) {
	      d3.selectAll(".line")
						.style('opacity', lineOpacity);
		  d3.selectAll('.legend-rect')
						.style('opacity', 1);
	      d3.select(this)
	        .style("stroke-width", lineStroke)
	        .style("cursor", "none");

	       d3.selectAll('#Series'+i)
	        .attr("width", 18)
            .attr("height", 18);
	    })
	  .attr('d', d => valueline(d))
	  .style('stroke', (d, i) => color(i))
	  .style('opacity', lineOpacity)
}

$.get("/feature_year_data",data={'country':'AFG'},function(data_received){
	  updateChart2(data_received);

});

var xAxis = d3.svg.axis().scale(x3).orient("bottom")
    				.ticks(14);
    var yAxis = d3.svg.axis().scale(y3).orient("left").ticks(6);

function updateChart3(data) {
	var width3 = width-100;
	var values = data['chart_data'];
	var labels = data['series'];
	var axisLabels = data['labels'];
	var axisCode = data['labels_code'];
    x3.domain([0, 14]);
	y3.domain([ d3.min(values, function(array) {return d3.min(array); })-0.2, d3.max(values, function(array) {return d3.max(array); }) + 0.2]);

	var xAxis = d3.svg.axis().scale(x3).orient("bottom")
    				.ticks(14)
    				.tickFormat(function(d,i){ return axisLabels[i] });
    var yAxis = d3.svg.axis().scale(y3).orient("left").ticks(6);

     svg3.selectAll("g").remove();


    svg3.append("g")         
		.attr("class", "x grid")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis
		    .tickSize(-height, 0, 0)
		)
		.selectAll("text")
		.style("text-anchor", "end")
		.style("font", function(d,i) { if(axisCode[d] == cur_country) return "15px times"; return "12px times"})
		.style("font-weight", function(d,i) { if(axisCode[d] == cur_country) return "bold"; return "normal"})
		.style("color", "#fffff")
		.attr("dx", "-.8em")
		.attr("dy", ".15em")
		.attr("transform", "rotate(-65)");

    svg3.append("g")         
        .attr("class", " y grid")
        .call(yAxis
            .tickSize(-width3, 0, 0)
        )

     svg3.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left/2)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-style",'italic')
        .text("Standardized values of coefficients"); 

     svg3.append("text")             
	        .attr("transform","translate(" + (width/2.5) + " ," + (height+95) + ")")
	        .style("text-anchor", "middle")
	        .style("font-style",'italic')
	        .text("Countries in increasing order of happiness rank ----->");


	var valueline = d3.svg.line()
                        .x(function(d,i) { return x3(i); })
                        .y(function(d) { return y3(d); });
                        
    let lines = svg3.append('g')
  		.attr('class', 'lines');

    var lineOpacity = "0.35";
	var lineOpacityHover = "0.85";
	var otherLinesOpacityHover = "0.1";
	var lineStroke = "1.5px";
	var lineStrokeHover = "2.5px";

	//References : https://codepen.io/zakariachowdhury/pen/JEmjwq
	lines.selectAll('.line-group')
	  .data(values).enter()
	  .append('g')
	  .attr('class', 'line-group')  
	  .on("mouseover", function(d, i) {
	      svg3.append("text")
	        .attr("class", "title-text")
	        .style("fill", color(i))        
	        .text(labels[i])
	        .attr("x", width/2)
	        .attr("y", 5);
	       svg2.append("text")
	        .attr("class", "title-text")
	        .style("fill", color(i))        
	        .text(labels[i])
	        .attr("x", width/2)
	        .attr("y", 5);
	    })
	  .on("mouseout", function(d) {
	      svg3.select(".title-text").remove();
	      svg2.select(".title-text").remove();
	    })
	  .append('path')
	  .attr('class', 'line')
	  .attr('id', function(d,i) { return 'Series'+i;})  
	  .attr('d', d => valueline(d))
	  .style('stroke', (d, i) => color(i))
	  .style('opacity', lineOpacity)
	  .on("mouseover", function(d,i) {
	      d3.selectAll('.line')
						.style('opacity', otherLinesOpacityHover);
		  d3.selectAll('.legend-rect')
						.style('opacity', otherLinesOpacityHover);
	      d3.selectAll('#Series'+i)
	        .style('opacity', lineOpacityHover)
	        .style("stroke-width", lineStrokeHover)
	        .style("cursor", "pointer")
	        .attr("width", 28)
            .attr("height", 28);
	    })
	  .on("mouseout", function(d,i) {
	      d3.selectAll(".line")
						.style('opacity', lineOpacity);
		  d3.selectAll('.legend-rect')
						.style('opacity', 1);
	      d3.select(this)
	        .style("stroke-width", lineStroke)
	        .style("cursor", "none");

	       d3.selectAll('#Series'+i)
	        .attr("width", 18)
            .attr("height", 18);
	    })
}

$.get("/feature_country_data",data={'country':'AFG'},function(data_received){
	var values = data_received['chart_data'];
	var labels = data_received['series'];
	var axisLabels = data_received['labels'];

	var xAxis = d3.svg.axis().scale(x3).orient("bottom")
    				.ticks(14)
    				.tickFormat(function(d,i){ return axisLabels[i] });
    var yAxis = d3.svg.axis().scale(y3).orient("left").ticks(6);
    updateChart3(data_received);
    drawlegend(labels);
});






	