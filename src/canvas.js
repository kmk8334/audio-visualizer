/*
	The purpose of this file is to take in the analyser node and a <canvas> element: 
	  - the module will create a drawing context that points at the <canvas> 
	  - it will store the reference to the analyser node
	  - in draw(), it will loop through the data in the analyser node
	  - and then draw something representative on the canvas
	  - maybe a better name for this file/module would be *visualizer.js* ?
*/

import * as utils from './utils.js';

let ctx,canvasWidth,canvasHeight,gradient,analyserNode,audioData;
let groundFrameCount = 0;
let sunScalar = 1.0;
let mountainScalar = 1.0;
let horizonScalar = 2.0;

function setupCanvas(canvasElement,analyserNodeRef){
	// create drawing context
	ctx = canvasElement.getContext("2d");
	canvasWidth = canvasElement.width;
	canvasHeight = canvasElement.height;
	// create a gradient that runs top to bottom - I'll miss the rainbow gay :(
	// gradient = utils.getLinearGradient(ctx,0,0,0,canvasHeight,[{percent:0,color:"blue"},{percent:.25,color:"green"},{percent:.5,color:"yellow"},{percent:.75,color:"red"},{percent:1,color:"magenta"}]);
	gradient = utils.getLinearGradient(ctx,0,0,0,canvasHeight,[{percent:0,color:"#243C4B"},{percent:.25,color:"#3C7A8D"},{percent:.5,color:"#6CB9B7"},{percent:.75,color:"#9BC2B8"},{percent:1,color:"#D8E3C8"}]);
    
	// keep a reference to the analyser node
	analyserNode = analyserNodeRef;
	// this is the array where the analyser data will be stored
	audioData = new Uint8Array(analyserNode.fftSize/2);
}

function draw(params={}){
  // 1 - populate the audioData array with the frequency data from the analyserNode
	// notice these arrays are passed "by reference" 
	analyserNode.getByteFrequencyData(audioData);
	// OR
	//analyserNode.getByteTimeDomainData(audioData); // waveform data
	
	// 2 - draw background
	ctx.save();
    ctx.fillStyle = "rgba(29,20,73,1.0)";
    ctx.globalAlpha = 1.0;
    ctx.fillRect(0,0,canvasWidth,canvasHeight);
    ctx.restore();
		
	// 3 - draw gradient
	if(params.showGradient){
        ctx.save();
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 1.0;
        ctx.fillRect(0,0,canvasWidth,canvasHeight);
        ctx.restore();
    }
    // 5 - draw sun
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
        // Draw the purple background
        let radialGradient = ctx.createRadialGradient(canvasWidth/2, canvasHeight/3, 0, canvasWidth/2, canvasHeight/3, maxRadius * maxPercent);
        radialGradient.addColorStop(0.4,"rgba(187,136,204,0.5)");
        radialGradient.addColorStop(1,"rgba(187,136,204,0.0)");
        ctx.fillStyle = radialGradient;
        ctx.beginPath();
        ctx.arc(canvasWidth/2,canvasHeight/3, maxRadius * maxPercent, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();

        // Draw the sun
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
	// 4 - draw mountains
	if(params.showMountains){
        // Draw 2 mountains, so nodeSpacing is halved
        let nodeSpacing = (canvasWidth/2)/audioData.length;
        let margin = (canvasWidth - nodeSpacing*(2*audioData.length-1))/2;
        // let screenWidthForBars = canvasWidth - (audioData.length * nodeSpacing) - margin * 2;
        // let barWidth = screenWidthForBars / audioData.length;
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
            /*ctx.fillRect(margin + i * (barWidth + barSpacing), topSpacing + 256-audioData[i], barWidth, barHeight);
            ctx.strokeRect(margin + i * (barWidth + barSpacing), topSpacing + 256-audioData[i], barWidth, barHeight);*/
        }
        // Draw the right mountain
        for(let i = audioData.length - 1; i >= 0; i--) {
            ctx.lineTo(canvasWidth - (margin + i * nodeSpacing), horizonLine + (-1 * mountainMaxHeight * audioData[audioData.length-i-1]/255));
            ctx.lineTo(canvasWidth - (margin + i * nodeSpacing), horizonLine);
            ctx.lineTo(canvasWidth - (margin + i * nodeSpacing), horizonLine + (-1 * mountainMaxHeight * audioData[audioData.length-i-1]/255));
            /*ctx.fillRect(margin + i * (barWidth + barSpacing), topSpacing + 256-audioData[i], barWidth, barHeight);
            ctx.strokeRect(margin + i * (barWidth + barSpacing), topSpacing + 256-audioData[i], barWidth, barHeight);*/
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
        // TODO: Get rid of magic numbers for canvasWidth, canvasHeight, horizonLine
        let horizonLine = canvasHeight * 5/8;
        let nodeCount = 30;
        let topNodeSpacing = canvasWidth/nodeCount;
        let bottomNodeSpacing = topNodeSpacing * horizonScalar;
        let horizontalLineCount = 10;
        let horizontalLineSpacing = (canvasHeight - horizonLine) / horizontalLineCount;
        ctx.save();
        ctx.strokeStyle = "rgba(255,105,180,1.0)";
        ctx.lineWidth = 2;
        // Vertical lines
        // Lines starting at the edge of the screen are ignored since it'd be drawing a line off-screen
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
            ctx.moveTo(0, horizonLine + Math.pow((i + groundFrameCount/120)/(horizontalLineCount-1), horizonScalar) * (canvasHeight - horizonLine));
            ctx.lineTo(canvasWidth, horizonLine + Math.pow((i + groundFrameCount/120)/(horizontalLineCount-1), horizonScalar) * (canvasHeight - horizonLine));
            ctx.closePath();
            ctx.stroke();
        }
        groundFrameCount = (groundFrameCount + 1) % 120;
        ctx.restore();
    }

    // 6 - bitmap manipulation
	// TODO: right now. we are looping though every pixel of the canvas (320,000 of them!), 
	// regardless of whether or not we are applying a pixel effect
	// At some point, refactor this code so that we are looping though the image data only if
	// it is necessary

	// A) grab all of the pixels on the canvas and put them in the `data` array
	// `imageData.data` is a `Uint8ClampedArray()` typed array that has 1.28 million elements!
	// the variable `data` below is a reference to that array 
	let imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    let data = imageData.data;
    let length = data.length;
    let width = imageData.width; // not using here
	// B) Iterate through each pixel, stepping 4 elements at a time (which is the RGBA for 1 pixel)
    for(let i = 0; i < length; i += 4) {
		// C) randomly change every 20th pixel +/-64 in each RGB channel
        if(params.showNoise && Math.random() < 0.05){
			data[i] = data[i] - 64 + Math.random() * 128; // data[i] is the red channel
			data[i+1] = data[i+1] - 64 + Math.random() * 128; // data[i+1] is the green channel
			data[i+2] = data[i+2] - 64 + Math.random() * 128; // data[i+2] is the blue channel
			// data[i+3] is the alpha channel
		} // end if
        
        // Invert the color of every pixel
        if(params.showInvert){
            data[i] = 255-data[i];
            data[i+1] = 255-data[i+1];
            data[i+2] = 255-data[i+2];
        }
	} // end for
    
    // Emboss effect
    if(params.showEmboss){
        for(let i = 0; i < length; i++) {
            if(i%4 == 3) continue; // skip alpha channel
            data[i] = 127 + 2*data[i] - data[i+4] - data[i + width*4];
        }
    }
    
	// D) copy image data back to canvas
    ctx.putImageData(imageData, 0, 0);
}

// Helper functions
function setSunScalar(value){ sunScalar = value; }
function setMountainScalar(value){ mountainScalar = value; }
function setHorizonScalar(value){ horizonScalar = value; }

export {setupCanvas,draw,setSunScalar,setMountainScalar,setHorizonScalar};