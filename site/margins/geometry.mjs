// Each border has equal thickness on all four sides. Area percentages are
// relative to the immediately enclosing rectangle, including hidden layers.
export function nestedRectangles(land, margins) {
 let ratio=Math.tan(2*Math.PI/land),area=100;
 const result=[{width:100,height:100,ratio,area,land}];
 for(const margin of margins){
  const fraction=1-margin/100;
  const inset=((ratio+1)-Math.sqrt(Math.max(0,(ratio+1)**2-4*ratio*(1-fraction))))/4;
  const width=(ratio-2*inset)/ratio*100,height=(1-2*inset)*100;
  ratio=(ratio-2*inset)/(1-2*inset);area*=fraction;
  result.push({width,height,ratio,area,land:2*Math.PI/Math.atan(ratio)});
 }
 return result;
}
