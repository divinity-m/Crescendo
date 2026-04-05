/// CRESCENDO VISUALIZER.JS ///
/* Canvas Setup */
const visualizer = document.getElementById("music-visualizer");
const ctx = visualizer.getContext("2d");
const cnvWidth = visualizer.width;
const cnvHeight = visualizer.height;

let x = 10;
let dx = 1;


requestAnimationFrame(draw);
function draw() {
    ctx.clearRect(0, 0, cnvWidth, cnvHeight);
    
    ctx.fillStyle = "oklch(48.8% 0.243 264.376)";
    ctx.lineWidth = 1.5;
    ctx.font = "2rem outfit";
    ctx.textAlign = "center";
    ctx.fillText("Music Visualizer", cnvWidth/2, cnvHeight/2);
    
    ctx.fillRect(x, cnvHeight/2, 10, 10);
    if (x >= cnvWidth - 10) dx = -1;
    if (x <= 0) dx = 1;

    
    x += dx;
    
    requestAnimationFrame(draw);
}
draw();
