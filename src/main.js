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
	sound1  :  "media/unrequited-attention.mp3"
});

const drawParams = {
    // showGradient    : false,
    showMountains   : true,
    showSun         : true,
    showGround      : true,
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

    // Hook up sun slider & label
    let sunSlider = document.querySelector("#sunSlider");
    let sunLabel = document.querySelector("#sunLabel");
    sunSlider.oninput = e => {
        canvas.setSunScalar(e.target.value);
        sunLabel.innerHTML = e.target.value;
    };

    // Hook up mountain slider & label
    let mountainSlider = document.querySelector("#mountainSlider");
    let mountainLabel = document.querySelector("#mountainLabel");
    mountainSlider.oninput = e => {
        canvas.setMountainScalar(e.target.value);
        mountainLabel.innerHTML = e.target.value;
    };

    // Hook up ground slider & label
    let groundSlider = document.querySelector("#groundSlider");
    let groundLabel = document.querySelector("#groundLabel");
    groundSlider.oninput = e => {
        canvas.setHorizonScalar(e.target.value);
        groundLabel.innerHTML = e.target.value;
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
    /*gradientCB.onclick = e => {
        drawParams.showGradient = e.target.checked;
    }*/
    
    // Hook up show bars
    mountainsCB.onclick = e => {
        drawParams.showMountains = e.target.checked;
        if(e.target.checked == true) {
            document.querySelector("#mountainSliderSection").style.display = "block";
        } else {
            document.querySelector("#mountainSliderSection").style.display = "none";
        }
    }
    
    // Hook up sun checkbox
    sunCB.onclick = e => {
        drawParams.showSun = e.target.checked;
        if(e.target.checked == true) {
            document.querySelector("#sunSliderSection").style.display = "block";
        } else {
            document.querySelector("#sunSliderSection").style.display = "none";
        }
    }
    
    // Hook up ground checkbox
    groundCB.onclick = e => {
        drawParams.showGround = e.target.checked;
        if(e.target.checked == true) {
            document.querySelector("#groundSliderSection").style.display = "block";
        } else {
            document.querySelector("#groundSliderSection").style.display = "none";
        }
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