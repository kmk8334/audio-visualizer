/*
Author: Kevin Kulp
Purpose: Draw the canvas based on the provided audio values
*/

import * as utils from './utils.js';
import * as audio from './audio.js';

let ctx,canvasWidth,canvasHeight,analyserNode,audioData;
let groundFrameCount = 0;
let sunScalar = 1.0;
let mountainScalar = 1.0;
let horizonScalar = 2.0;

// Store references to the canvas and audio analyser node
function setupCanvas(canvasElement,analyserNodeRef){
	// Create drawing context
	ctx = canvasElement.getContext("2d");
	canvasWidth = canvasElement.width;
	canvasHeight = canvasElement.height;
	// Create a gradient that runs top to bottom - I'll miss the rainbow :(
	// gradient = utils.getLinearGradient(ctx,0,0,0,canvasHeight,[{percent:0,color:"blue"},{percent:.25,color:"green"},{percent:.5,color:"yellow"},{percent:.75,color:"red"},{percent:1,color:"magenta"}]);
	
	// Store a reference to the analyser node
	analyserNode = analyserNodeRef;
	// This is where the data will be stored for the audio visualizer points
	audioData = new Uint8Array(analyserNode.fftSize/2);
}

// Draw the full canvas for the frame based off the current audio data
function draw(params={}){
    // Fill audioData with the frequency data from the analyserNode
    analyserNode.getByteFrequencyData(audioData);
    
    // Apply visuals for lowshelf data
    if(audio.soundParams.lowshelf) {
        for(let i = 0; i * (44100 / audioData.length) < 1000; i++) {
            // Increase the display bar by 25%, if it's not already capped at 255
            audioData[i] = (audioData[i] * 1.25 > 255 ? 255 : audioData[i] * 1.25);
        }
    }
    // Apply visuals for highshelf data
    if(audio.soundParams.highshelf) {
        for(let i = audioData.length - 1; i * (44100 / audioData.length) > 1000; i--) {
            // Increase the display bar by 25%, if it's not already capped at 255
            audioData[i] = (audioData[i] * 1.25 > 255 ? 255 : audioData[i] * 1.25);
        }
    }  
	
	// Draw background
	ctx.save();
    ctx.fillStyle = "rgba(29,20,73,1.0)";
    ctx.globalAlpha = 1.0;
    ctx.fillRect(0,0,canvasWidth,canvasHeight);
    ctx.restore();

    // Draw the sun
    if(params.showSun){
        let maxRadius = canvasHeight/6 * sunScalar;
        let minRadiusPercent = 0.5;
        ctx.save();
        ctx.globalAlpha = 0.6;
        // Determine the maximum volume percentage from all samples
        let maxPercent = 0.5;
        for(let i = 0; i < audioData.length; i++) {
            let percent = minRadiusPercent + ((1-minRadiusPercent) * audioData[i] / 255);
            if(percent > maxPercent) {
                maxPercent = percent;
            }
        }
        // Draw the purple background surrounding the sun (TODO: Store in a memo table based on the max percent)
        let radialGradient = ctx.createRadialGradient(canvasWidth/2, canvasHeight/3, 0, canvasWidth/2, canvasHeight/3, maxRadius * maxPercent);
        radialGradient.addColorStop(0.4,"rgba(187,136,204,0.5)");
        radialGradient.addColorStop(1,"rgba(187,136,204,0.0)");
        ctx.fillStyle = radialGradient;
        ctx.beginPath();
        ctx.arc(canvasWidth/2,canvasHeight/3, maxRadius * maxPercent, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();

        // Create the yellow / orange gradient for the sun (TODO: Store in a memo table based on the max percent)
        let sunGradient = ctx.createLinearGradient(
            canvasWidth/2, 
            canvasHeight/3 - (maxRadius * 0.8 * maxPercent), 
            canvasWidth/2, 
            canvasHeight/3 + (maxRadius * 0.8 * maxPercent)
            );
        sunGradient.addColorStop(0.0, "rgba(255,242,0,1.0)");
        sunGradient.addColorStop(1.0, "rgba(253,106,2,1.0)");
        /* Rainbow :)
        sunGradient.addColorStop(0.0, "red");
        sunGradient.addColorStop(0.2, "orange");
        sunGradient.addColorStop(0.4, "yellow");
        sunGradient.addColorStop(0.6, "green");
        sunGradient.addColorStop(0.8, "blue");
        sunGradient.addColorStop(1.0, "purple");
        */
        ctx.fillStyle = sunGradient;
        ctx.strokeStyle = "rgba(255,255,255,1.0)";
        // Draw the sun
        // Top of sun
        ctx.beginPath();
        ctx.arc(canvasWidth/2, canvasHeight/3, maxPercent * 0.75 * maxRadius, 0.05 * Math.PI, 0.95 * Math.PI, true);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Second-from-top semgent of sun
        ctx.beginPath();
        ctx.arc(canvasWidth/2, canvasHeight/3, maxPercent * 0.75 * maxRadius, 0.08 * Math.PI, 0.18 * Math.PI, false);
        ctx.arc(canvasWidth/2, canvasHeight/3, maxPercent * 0.75 * maxRadius, 0.82 * Math.PI, 0.92 * Math.PI, false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Third-from-top semgent of sun
        ctx.beginPath();
        ctx.arc(canvasWidth/2, canvasHeight/3, maxPercent * 0.75 * maxRadius, 0.23 * Math.PI, 0.30 * Math.PI, false);
        ctx.arc(canvasWidth/2, canvasHeight/3, maxPercent * 0.75 * maxRadius, 0.70 * Math.PI, 0.77 * Math.PI, false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
       // Bottom semgent of sun
       ctx.beginPath();
       ctx.arc(canvasWidth/2, canvasHeight/3, maxPercent * 0.75 * maxRadius, 0.38 * Math.PI, 0.62 * Math.PI, false);
       ctx.closePath();
       ctx.fill();
       ctx.stroke();
        ctx.restore();
    }
	// Draw the mountains
	if(params.showMountains){
        // Draw 2 mountains, so nodeSpacing is halved
        let nodeSpacing = (canvasWidth/2)/audioData.length;
        let margin = nodeSpacing/2;
        let mountainMaxHeight = canvasHeight * 2/8 * mountainScalar;
        let horizonLine = canvasHeight * 5/8;
        
        ctx.save();
        ctx.fillStyle = "rgba(29,20,73,1.0)";
        ctx.strokeStyle = 'rgba(34,138,255,0.50)';
        // Draw the left mountain
        ctx.beginPath();
        ctx.moveTo(0,horizonLine + (-1 * mountainMaxHeight * audioData[audioData.length-1]/255));
        for(let i = 0; i < audioData.length; i++) {
            ctx.lineTo(margin + i * nodeSpacing, horizonLine + (-1 * mountainMaxHeight * audioData[audioData.length-i-1]/255));
            ctx.lineTo(margin + i * nodeSpacing, horizonLine);
            ctx.lineTo(margin + i * nodeSpacing, horizonLine + (-1 * mountainMaxHeight * audioData[audioData.length-i-1]/255));
        }
        // Draw the right mountain
        for(let i = audioData.length - 1; i >= 0; i--) {
            ctx.lineTo(canvasWidth - (margin + i * nodeSpacing), horizonLine + (-1 * mountainMaxHeight * audioData[audioData.length-i-1]/255));
            ctx.lineTo(canvasWidth - (margin + i * nodeSpacing), horizonLine);
            ctx.lineTo(canvasWidth - (margin + i * nodeSpacing), horizonLine + (-1 * mountainMaxHeight * audioData[audioData.length-i-1]/255));
        }
        
        ctx.lineTo(canvasWidth, horizonLine + (-1 * mountainMaxHeight * audioData[audioData.length-1]/255));
        ctx.lineTo(canvasWidth, horizonLine);
        ctx.lineTo(0, horizonLine);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
    // Draw ground
    if(params.showGround) {
        // TODO: Refactor numbers for canvasWidth, canvasHeight, horizonLine into a constant parameter
        let horizonLine = canvasHeight * 5/8;
        let nodeCount = 30;
        let topNodeSpacing = canvasWidth/nodeCount; // Spacing of vertical lines along the top of the horizon
        let bottomNodeSpacing = topNodeSpacing * horizonScalar; // Spacing of vertical lines along the bottom of the horizon
        let horizontalLineCount = 10;
        
        
        ctx.save();
        ctx.strokeStyle = "rgba(255,105,180,1.0)";
        ctx.lineWidth = 2;

        // Vertical lines
        // Lines starting at the edges of the screen are ignored since it'd be drawing a line off-screen
        for(let i = 1; i < nodeCount; i++) {
            ctx.beginPath();
            ctx.moveTo(topNodeSpacing * i, horizonLine);
            ctx.lineTo(canvasWidth/2 + bottomNodeSpacing * (i - nodeCount/2), canvasHeight);
            ctx.closePath();
            ctx.stroke();
        }

        // Horizon line
        ctx.beginPath();
        ctx.moveTo(0, horizonLine);
        ctx.lineTo(canvasWidth, horizonLine);
        ctx.closePath();
        ctx.stroke();

        // Scrolling horizontal lines
        for(let i = 0; i < horizontalLineCount; i++) {
            ctx.beginPath();
            // Use Math.pow(..., exponent) to bunch smaller numbers on the range of [0, 1] closer to 0.0
            // The higher the exponent, the smaller the number will become
            ctx.moveTo(0, horizonLine + Math.pow((i + groundFrameCount/120)/(horizontalLineCount-1), horizonScalar) * (canvasHeight - horizonLine));
            ctx.lineTo(canvasWidth, horizonLine + Math.pow((i + groundFrameCount/120)/(horizontalLineCount-1), horizonScalar) * (canvasHeight - horizonLine));
            ctx.closePath();
            ctx.stroke();
        }
        // Increment the horizontal line frame count by 1, looping the offset back around once every 120 frames
        groundFrameCount = (groundFrameCount + 1) % 120;
        ctx.restore();
    }

    // Bitmap manipulation
	// Put all pixels on the canvas into an array named data
	let imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    let data = imageData.data;
    let length = data.length;
    let width = imageData.width;
    // Offset the color of a small number of random pixels
    if(params.showNoise) {
        let pixelRef;
        for(let i = 0; i < (length/4) * 0.05; i++) {
            // Choose a random pixel on the screen
            pixelRef = 4 * Math.floor(Math.random() * length/4);
            // Offset the RGB channel values by +/-64 independently of each other
            data[pixelRef] = data[pixelRef] - 64 + Math.random() * 128; // data[i] is the red channel
            data[pixelRef+1] = data[pixelRef+1] - 64 + Math.random() * 128; // data[i+1] is the green channel
            data[pixelRef+2] = data[pixelRef+2] - 64 + Math.random() * 128; // data[i+2] is the blue channel
            // data[i+3] is alpha, ignore it
        }
    }

    // Iterate through each pixel, stepping 4 elements at a time (which is the RGBA for 1 pixel)
    if(params.showInvert){
        // Invert the color of every pixel
        for(let i = 0; i < length; i += 4) {
            data[i] = 255-data[i];
            data[i+1] = 255-data[i+1];
            data[i+2] = 255-data[i+2];
        }
	}
    
    // Emboss effect
    if(params.showEmboss){
        for(let i = 0; i < length; i++) {
            if(i%4 == 3) continue; // skip alpha channel
            // Make the R/G/B value a product of the difference between the pixels below and to the right of itself
            data[i] = 127 + 2*data[i] - data[i+4] - data[i + width*4];
        }
    }
    
	// Copy image data back to canvas
    ctx.putImageData(imageData, 0, 0);
}

// Helper functions
function setSunScalar(value){ sunScalar = value; }
function setMountainScalar(value){ mountainScalar = value; }
function setHorizonScalar(value){ horizonScalar = value; }

export {setupCanvas,draw,setSunScalar,setMountainScalar,setHorizonScalar};