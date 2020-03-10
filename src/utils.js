/*
Author: Kevin Kulp
Purpose: Provide a helper function library for commonly called functions
*/

const makeColor = (red, green, blue, alpha = 1) => {
    return `rgba(${red},${green},${blue},${alpha})`;
};
  
  /*const getRandom = (min, max) => {
    return Math.random() * (max - min) + min;
  };*/
  
  /*const getRandomColor = () => {
      const floor = 35; // so that colors are not too bright or too dark 
    const getByte = () => getRandom(floor,255-floor);
    return `rgba(${getByte()},${getByte()},${getByte()},1)`;
  };*/


// Create a linear gradient out of the given color stops
const getLinearGradient = (ctx,startX,startY,endX,endY,colorStops) => {
    let lg = ctx.createLinearGradient(startX,startY,endX,endY);
    for(let stop of colorStops){
        lg.addColorStop(stop.percent,stop.color);
    }
    return lg;
};
  
// Toggle full screen mode  
const goFullscreen = (element) => {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullscreen) {
        element.mozRequestFullscreen();
    } else if (element.mozRequestFullScreen) { // camel-cased 'S' was changed to 's' in spec
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    }
    // .. and do nothing if the method is not supported
};

export {makeColor, getLinearGradient, goFullscreen};