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
	// 4 - draw mountains
	if(params.showMountains){
        let nodeSpacing = canvasWidth/audioData.length;
        let margin = 5;
        // let screenWidthForBars = canvasWidth - (audioData.length * nodeSpacing) - margin * 2;
        // let barWidth = screenWidthForBars / audioData.length;
        let mountainMaxHeight = 100;
        let horizonLine = 250;
        
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.50)';
        ctx.strokeStyle = 'rgba(34,138,255,0.50)';
        // loop through the data and draw!
        ctx.moveTo(0,horizonLine + (-1 * mountainMaxHeight * audioData[0]/255));
        for(let i = 0; i < audioData.length; i++) {
            ctx.lineTo(margin + i * nodeSpacing, horizonLine + (-1 * mountainMaxHeight * audioData[i]/255));
            /*ctx.fillRect(margin + i * (barWidth + barSpacing), topSpacing + 256-audioData[i], barWidth, barHeight);
            ctx.strokeRect(margin + i * (barWidth + barSpacing), topSpacing + 256-audioData[i], barWidth, barHeight);*/
        }
        ctx.lineTo(canvasWidth,horizonLine);
        ctx.lineTo(canvasWidth,canvasHeight);
        ctx.lineTo(0,canvasHeight);
        ctx.stroke();
        ctx.restore();
    }
	// 5 - draw circles
    if(params.showCircles){
        let maxRadius = canvasHeight/6;
        ctx.save();
        ctx.globalAlpha = 0.5;
        let maxPercent = 0.0;
        for(let i = 0; i < audioData.length; i++) {
            // red-ish circles
            let percent = 0.5 + (0.5 * audioData[i] / 255);
            if(percent > maxPercent) {
                maxPercent = percent;
            }
            /*let circleRadius = percent * maxRadius;
            ctx.beginPath();
            // ctx.fillStyle = utils.makeColor(255, 111, 111, .34 - percent/3.0);
            ctx.fillStyle = utils.makeColor(4, 38, 85, .34 - percent/3.0);
            ctx.arc(canvasWidth/2, canvasHeight/2, circleRadius, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.closePath();
            
            // blue-ish circles, bigger, more transparent
            ctx.beginPath();
            // ctx.fillStyle = utils.makeColor(0, 0, 255, 0.10 - percent/10.0);
            ctx.fillStyle = utils.makeColor(10, 137, 176, 0.10 - percent/10.0);
            ctx.arc(canvasWidth/2, canvasHeight/2, circleRadius * 1.5, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.closePath();*/
            
            /*// yellow-ish circles, smaller
            ctx.save();
            ctx.beginPath();
            // ctx.fillStyle = utils.makeColor(200, 200, 0, 0.5 - percent/5.0);
            ctx.fillStyle = utils.makeColor(80, 189, 211, 0.5 - percent/5.0);
            ctx.arc(canvasWidth/2, canvasHeight/2, circleRadius * 0.50, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.closePath();
            ctx.restore();*/
        }
        // Draw the sun
        ctx.save();
        ctx.fillStyle = "rgba(244,209,107,1.0)";
        ctx.strokeStyle = "rgba(244,209,107,1.0)";
        ctx.beginPath();
        ctx.arc(canvasWidth/2, canvasHeight/3, maxPercent * maxRadius, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

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
		// C) randomly change every 20th pixel to red
        if(params.showNoise && Math.random() < 0.05){
			data[i] = 128; // data[i] is the red channel
			data[i+1] = 255; // data[i+1] is the green channel
			data[i+2] = 255; // data[i+2] is the blue channel
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

export {setupCanvas,draw};