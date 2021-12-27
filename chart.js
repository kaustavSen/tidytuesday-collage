async function drawChart() {
   
  // Specify chart dimensions
  let dimensions = {
    width: 900,
    height: 400,
    margin: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    }
  }
  dimensions.boundedWidth =   dimensions.width
                            - dimensions.margin.left
                            - dimensions.margin.right

 dimensions.boundedHeight =   dimensions.height
                            - dimensions.margin.top
                            - dimensions.margin.bottom

  // Read in the data  
  let dataset = await d3.csv("data/plot_data.csv")
  
  const seed = 150
  const source = d3.randomLcg(seed)
  const random = d3.randomNormal.source(source)()
  const x_pos = Array.from({ length: dataset.length }, random)
  
  dataset = dataset.map((d, i) => ({...d, x_pos: x_pos[i]}))

  // Define scale functions
  const sizeScale = d3.scaleSqrt()
  .domain(d3.extent(dataset, d => +d.num_posts))
  .range([20, 40])

  const xScale = d3.scaleLinear()
    .domain(d3.extent(dataset, d => d.x_pos))
    .range([0, dimensions.boundedWidth])
  
  // Setup the layout for a beeswarm plot
  const beeswarmLayout = d3.forceSimulation(dataset)
    .force("forceX", d3.forceX(d => xScale(d.x_pos)))
    .force("forceY", d3.forceY(dimensions.boundedHeight / 2))
    .force("collide", d3.forceCollide(d => sizeScale(+d.num_posts) + 6))

  for (i = 0; i < 300; i++) beeswarmLayout.tick()

  // Plot the data
  const svg = d3.select("#wrapper").append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)

  const defs = svg.selectAll("pattern").data(dataset)
    .join("pattern")
    .attr("id", d => d.screen_name)
    .attr("height", "100%")
    .attr("width", "100%")
    .attr("patternContentUnits", "objectBoundingBox")
      .append("image")
      .attr("xlink:href", d => d.img_url)
      .attr("height", 1)
      .attr("width", 1)
      .attr("preserveAspectRatio", "none")
  
  const bounds = svg.append("g")
    .attr("tranform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

  const circles_images = bounds
  .selectAll("circle-images")
  .data(dataset)
  .enter()
  .append("circle")

  circles_images
  .attr("class", "circle-images")
  .attr("cx", d => d.x)
  .attr("cy", d => d.y)
  .attr("fill", d => `url(#${d.screen_name})`)
  .attr("r", d => sizeScale(+d.num_posts))
  
  circles_images
  .on("mousemove", onMouseMove)
  .on("mouseleave", onMouseLeave)

  const circle_outline = bounds
  .selectAll("circle_outline")
  .data(dataset)
  .join(
    enter => enter.append("circle")
      .attr("class", "circle_outline")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("fill", "none")
      .attr("stroke", "cornflowerblue")
      .attr("stroke-width", 1.5)
      .attr("r", d => sizeScale(+d.num_posts) + 2.5)
  )

  // Add label for bubble size
  svg.append("text")
    .attr("class", "label-size")
    .attr("x", "90%")
    .attr("y", "95%")
    .text("size of bubbles are proportional")
  
  svg.append("text")
    .attr("class", "label-size")
    .attr("x", "90%")
    .attr("y", "95%")
    .attr("dy", 15)
    .text("to number of posts")


  // Add interactions
  const tooltip = d3.select("#tooltip")
  function onMouseMove(event, datum) {
    const x = event.clientX
    const y = event.clientY
    
    tooltip.select("#name")
      .text(`${datum.name}`)
    tooltip.select("#posts")
      .text(`${datum.num_posts}`)
    tooltip.select("#likes")
      .text(`${datum.total_likes}`)
    tooltip.select("#retweet")
      .text(`${datum.total_retweets}`)

    tooltip
    .style("transform", `translate(calc(-50% + ${x}px), calc(${y}px - 100%))`)
    .style("opacity", 1)
  }
  
  function onMouseLeave() {
    tooltip.style("opacity", 0)
  }

}
drawChart()