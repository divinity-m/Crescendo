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


let x = -25;
let dx = 1;

function draw() {
    ctx.clearRect(0, 0, cnvWidth, cnvHeight);
    
    /* Gets The Audio Element Frequency Data */
    analyser.getByteFrequencyData(dataArray);

    const gap = 1;
    const barWidth = (cnvWidth - gap * (dataArray.length - 1)) / dataArray.length;
    const half = dataArray.length / 2;
    
    // Visualiser Bars
    ctx.fillStyle = "oklch(48.8% 0.243 264.376)";
    for (let i = 0; i < dataArray.length; i++) {
        // smoothens the erratic nature of the bars
        if (dataArray[i] > smoothData[i]) {
             smoothData[i] = dataArray[i]; // fast rise
        } else {
            smoothData[i] += (dataArray[i] - smoothData[i]) * smoothingFactor; // slow fall
        }
        const value = smoothData[i];

        // distance from center
        const center = dataArray.length / 2;
        const distance = Math.abs(i - center) / center;
    
        // bell curve weight
        const weight = Math.sin((1 - distance) * Math.PI / 2);

        // final height
        const barHeight = cnvHeight * (value / 255) * weight;
    
        const x = i * (barWidth + gap);
    
        ctx.fillRect(x, (cnvHeight - barHeight) / 2, barWidth - gap, barHeight);
    }
    // Draws a line through the middle
    ctx.fillStyle = "white";
    ctx.fillRect(0, cnvHeight/2 - 2, cnvWidth, 2);

    
    // Moving Square For No Reason
    ctx.fillStyle = "oklch(48.8% 0.243 264.376)";
    ctx.fillRect(x, cnvHeight/2 - 6, 10, 10);
    if (x >= cnvWidth - 10) dx = -1;
    if (x <= 0) dx = 1;
    x += dx;
    

    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);




