/*
	main.js is primarily responsible for hooking up the UI to the rest of the application 
	and setting up the main event loop
*/

// We will write the functions in this file in the traditional ES5 way
// In this instance, we feel the code is more readable if written this way
// If you want to re-write these as ES6 arrow functions, to be consistent with the other files, go ahead!

import * as utils from './utils.js';
import * as audio from './audio.js';
import * as canvas from './canvas.js';

// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
	sound1  :  "media/human-voice.mp3"
});

const drawParams = {
    showGradient    : false,
    showMountains   : true,
    showCircles     : true,
    showNoise       : false,
    showInvert      : false,
    showEmboss      : false
};

function init(){
    console.log("init called");
    console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
    audio.setupWebaudio(DEFAULTS.sound1);
	let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
    setupUI(canvasElement);
    canvas.setupCanvas(canvasElement,audio.analyserNode);
    loop();
}

function setupUI(canvasElement){
    // A - hookup fullscreen button
    const fsButton = document.querySelector("#fsButton");

    // add .onclick event to button
    fsButton.onclick = e => {
    console.log("init called");
    utils.goFullscreen(canvasElement);
    };

    // add .onclick event to button
    playButton.onclick = e => {
        console.log(`audioCtx.state before = ${audio.audioCtx.state}`);

        // check if context is in suspended state (autoplay policy)
        if(audio.audioCtx.state == "suspended") {
            audio.audioCtx.resume();
        }
        console.log(`audioCtx.state after = ${audio.audioCtx.state}`);
        if(e.target.dataset.playing == "no"){
            // if track is currently paused, play it
            audio.playCurrentSound();
            e.target.dataset.playing = "yes"; // our CSS will set the text to "Pause"
            // if track IS playing, pause it
        }else{
            audio.pauseCurrentSound();
            e.target.dataset.playing = "no"; // our CSS will set the text to "Play"
        }
    }

    // C - hookup volume slider & label
    let volumeSlider = document.querySelector("#volumeSlider");
    let volumeLabel = document.querySelector("#volumeLabel");

    // add .oninput event to slider
    volumeSlider.oninput = e => {
        // set the gain
        audio.setVolume(e.target.value);
        // update value of label to match value of slider
        volumeLabel.innerHTML = Math.round((e.target.value/2 * 100));
    };

    // D - hookup track <select>
    let trackSelect = document.querySelector("#trackSelect");
    // add .onchange event to <select>
    trackSelect.onchange = e => {
        audio.loadSoundFile(e.target.value);
        // pause the current track if it is playing
        if(playButton.dataset.playing = "yes"){
            playButton.dispatchEvent(new MouseEvent("click"));
        }
    }

    // set value of label to match initial value of slider
    volumeSlider.dispatchEvent(new Event("input"));

    // Hook up gradient checkbox
    gradientCB.onclick = e => {
        drawParams.showGradient = e.target.checked;
    }
    
    // Hook up show bars
    mountainsCB.onclick = e => {
        drawParams.showMountains = e.target.checked;
    }
    
    // Hook up show circles
    circlesCB.onclick = e => {
        drawParams.showCircles = e.target.checked;
    }
    
    // Hook up noise checkbox
    noiseCB.onclick = e => {
        drawParams.showNoise = e.target.checked;
    }
    
    // Hook up color inversion checkbox
    invertCB.onclick = e => {
        drawParams.showInvert = e.target.checked;
    }
    
    // Hook up emboss checkbox
    embossCB.onclick = e => {
        drawParams.showEmboss = e.target.checked;
    }
} // end setupUI

function loop(){
    /* NOTE: This is temporary testing code that we will delete in Part II */
    requestAnimationFrame(loop);
    canvas.draw(drawParams);
}

export {init};

/* Chonker of code */
// 11 - this time, let's visualize the audio data on the canvas

/* YOU WRITE THIS! 
ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
ctx.save();
ctx.fillStyle="orange";
ctx.translate(0,MIDDLE_Y);
for(let byte of data) {
    ctx.translate(BAR_WIDTH, 0);
    let percent = byte/255;
    percent = percent < 0.02 ? 0.02 : percent;
    ctx.save();
    ctx.scale(1,-1);
    // ctx.fillRect(x, y, width, height);
    ctx.fillRect(0, 0, BAR_WIDTH, MAX_BAR_HEIGHT*percent);
    ctx.restore();
    ctx.translate(PADDING, 0);
} 
ctx.restore(); */