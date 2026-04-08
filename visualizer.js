/// CRESCENDO VISUALIZER.JS ///

/* Canvas Setup */
const visualizer = document.getElementById("music-visualizer");
const ctx = visualizer.getContext("2d");

visualizer.width = 400;
visualizer.height = 100;
const cnvWidth = visualizer.width;
const cnvHeight = visualizer.height;


const audioCtx = new AudioContext();

/* gets the audio source data */
const source = audioCtx.createMediaElementSource(audioEl);

/* sets up the analyzer */
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 128;

analyser.smoothingTimeConstant = 0.3;
const smoothingFactor = 0.35;

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
let smoothData = new Float32Array(bufferLength);

/* connects the analyzer to the audio element's src */
source.connect(analyser);
source.connect(audioCtx.destination);


// Resume the audio context on first user interaction 
document.addEventListener("click", () => { 
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    } 
}, { once: true });


let x = -25;
let dx = 1;

function draw() {
    ctx.clearRect(0, 0, cnvWidth, cnvHeight);
    
    /* Gets The Audio Element's Frequency Data */
    analyser.getByteFrequencyData(dataArray);

    // after some testing, i discovered that indexes past index 44 usually are completely inactive
    const activeData = dataArray.slice(0, 44);

    const gap = 1;
    const barWidth = (cnvWidth - gap * (activeData.length - 1)) / activeData.length;

    /* Visualiser Bars */
    for (let i = 0; i < activeData.length; i++) {
        
        // smoothens the erratic movement of the bars
        if (activeData[i] > smoothData[i]) {
             smoothData[i] = activeData[i]; // fast rise
        } else {
            smoothData[i] += (activeData[i] - smoothData[i]) * smoothingFactor; // slow fall
        }
        
        const barHeight = calculateBarHeight(activeData, i, smoothData[i]);
    
        const barX = i * (barWidth + gap);

        // draws the bars
        ctx.fillStyle = "white";
        ctx.fillRect(barX - gap, 1 + (cnvHeight - barHeight) / 2, barWidth, 1 + barHeight);
        
        ctx.fillStyle = "oklch(48.8% 0.243 264.376)";
        ctx.fillRect(barX, (cnvHeight - barHeight) / 2, barWidth - gap, barHeight);
    }
    
    // Draws a line through the middle
    ctx.fillStyle = "white";
    ctx.fillRect(0, cnvHeight/2 - 2.5, cnvWidth, 5);
    
    ctx.fillStyle = "oklch(48.8% 0.243 264.376)";
    ctx.fillRect(2, cnvHeight/2 - 1, cnvWidth-4, 2);

    
    /* Moving Square For No Reason */
    ctx.fillStyle = "oklch(48.8% 0.243 264.376)";
    ctx.fillRect(x, cnvHeight/2 - 5, 10, 10);
    
    if (x >= cnvWidth - 10) dx = -1;
    if (x <= 0) dx = 1;
    x += dx;
    

    requestAnimationFrame(draw);
}

function calculateBarHeight(array, index, value) {
    // distance from center calculation
    const center = array.length / 2;
    const distance = Math.abs(index - center) / center; // normalize the distance (0-1)

    // bell curve weight to make centered bars larger
    let weight = Math.sin((1 - distance) * Math.PI / 2);

    // final height
    const barHeight = cnvHeight * (value / 255) * weight;
    
    return barHeight;
}

requestAnimationFrame(draw);
