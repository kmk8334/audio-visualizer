/*
Author: Kevin Kulp
Purpose: Hooking up the UI to the rest of the application and setting up the main event loop
*/

import * as utils from './utils.js';
import * as audio from './audio.js';
import * as canvas from './canvas.js';

// Default value for the audio file
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
    // Load the default audio clip
    audio.setupWebaudio(DEFAULTS.sound1);
    // Hoop up the canvas
	let canvasElement = document.querySelector("canvas");
    setupUI(canvasElement);
    canvas.setupCanvas(canvasElement,audio.analyserNode);
    loop();
}

function setupUI(canvasElement){
    // Hook up fullscreen button
    const fsButton = document.querySelector("#fsButton");
    fsButton.onclick = e => {
    utils.goFullscreen(canvasElement);
    };

    // add .onclick event to button
    playButton.onclick = e => {

        // check if context is in suspended state (autoplay policy)
        if(audio.audioCtx.state == "suspended") {
            audio.audioCtx.resume();
        }
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

    // Hook up volume slider & label
    const volumeSlider = document.querySelector("#volumeSlider");
    let volumeLabel = document.querySelector("#volumeLabel");
    volumeSlider.oninput = e => {
        // set the gain
        audio.setVolume(e.target.value);
        // update value of label to match value of slider
        volumeLabel.innerHTML = Math.round((e.target.value/2 * 100));
    };

    // Hook up sun slider & label
    const sunSlider = document.querySelector("#sunSlider");
    let sunLabel = document.querySelector("#sunLabel");
    sunSlider.oninput = e => {
        canvas.setSunScalar(e.target.value);
        sunLabel.innerHTML = e.target.value;
    };

    // Hook up mountain slider & label
    const mountainSlider = document.querySelector("#mountainSlider");
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

    // Hook up track <select>
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

    // Hook up highshelf filter
    document.querySelector('#highshelfCB').checked = audio.soundParams.highshelf;
    document.querySelector('#highshelfCB').onchange = e => {
        audio.soundParams.highshelf = e.target.checked;
        audio.updateHighshelf();
    };
    audio.updateHighshelf(); // Initialize the values based on the current state of the checkbox

    // Hook up lowshelf filter
    document.querySelector('#lowshelfCB').checked = audio.soundParams.lowshelf;
    document.querySelector('#lowshelfCB').onchange = e => {
        audio.soundParams.lowshelf = e.target.checked;
        audio.updateLowshelf();
    };
    audio.updateLowshelf(); // Initialize the values based on the current state of the checkbox

} // end setupUI

function loop(){
    requestAnimationFrame(loop);
    canvas.draw(drawParams);
}

export {init};