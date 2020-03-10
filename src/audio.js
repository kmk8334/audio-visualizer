/*
Author: Kevin Kulp
Purpose: Extract audio analyser data from the audio element for canvas.js 
         and connect the <audio> element through an audio node graph to the speakers
*/

// WebAudio context
let audioCtx;

// WebAudio nodes that are part of our WebAudio audio routing graph
let element, sourceNode, analyserNode, gainNode, biquadFilter, lowShelfBiquadFilter;

// Constant values for the sample size and volume
const DEFAULTS = Object.freeze({
    gain        :   0.5,
    numSamples  :   256
});

// Toggleable parameters for a treble boost and bass boost
const soundParams = {
    highshelf       : false,
    lowshelf        : false
};

// create a new array of 8-bit integers (0-255)
// let audioData = new Uint8Array(DEFAULTS.numSamples/2);

// Hook up all nodes in the audio graph to the given file
function setupWebaudio(filePath){
    // The || is because WebAudio has not been standardized across browsers yet
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();

    // Create an <audio> element
    element = new Audio();

    // Load the sound file
    loadSoundFile(filePath);

    // Create a source node that points at the <audio> element
    sourceNode = audioCtx.createMediaElementSource(element);

    // Create an audio analyser node
    analyserNode = audioCtx.createAnalyser();

    // Set the number of frequency samples that will be taken
    // fft stands for Fast Fourier Transform
    analyserNode.fftSize = DEFAULTS.numSamples;

    // Create a gain (volume) node
    gainNode = audioCtx.createGain();
    gainNode.gain.value = DEFAULTS.gain;

    // Create a highshelf node
    biquadFilter = audioCtx.createBiquadFilter();
    biquadFilter.type = "highshelf";
    updateHighshelf();

    // Create a lowshelf node
    lowShelfBiquadFilter = audioCtx.createBiquadFilter();
    lowShelfBiquadFilter.type = "lowshelf";
    updateLowshelf();

    // Connect all the nodes together
    sourceNode.connect(analyserNode);
    analyserNode.connect(gainNode);
    gainNode.connect(biquadFilter);
    biquadFilter.connect(lowShelfBiquadFilter);
    lowShelfBiquadFilter.connect(audioCtx.destination);
}

// Set the source of the <audio> element to point to the given file path
function loadSoundFile(filePath){
    element.src = filePath;
}

// Begin playing the audio element
function playCurrentSound(){
    element.play();
}

// Pause the audio element
function pauseCurrentSound(){
    element.pause();
}

// Set the gain amount of the gainNode
function setVolume(value){
    value = Number(value); // make sure that it's a Number rather than a string
    gainNode.gain.value = value;
}

// Set the gain to be +20 Db or 0 below 1000hz, based on if the boolean is set as true/false
function updateHighshelf(){
    if(soundParams.highshelf){
        biquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
        biquadFilter.gain.setValueAtTime(20, audioCtx.currentTime);
    }else{
        biquadFilter.gain.setValueAtTime(0, audioCtx.currentTime);
    }
}

// Set the gain to be +20 Db or 0 above 1000hz, based on if the boolean is set as true/false
function updateLowshelf(){
    if(soundParams.lowshelf){
        lowShelfBiquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
        lowShelfBiquadFilter.gain.setValueAtTime(15, audioCtx.currentTime);
    }else{
        lowShelfBiquadFilter.gain.setValueAtTime(0, audioCtx.currentTime);
    }
}

export {audioCtx, setupWebaudio, playCurrentSound, pauseCurrentSound, loadSoundFile, setVolume, soundParams, updateHighshelf, updateLowshelf, analyserNode};