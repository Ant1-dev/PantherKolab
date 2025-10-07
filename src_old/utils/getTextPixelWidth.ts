/**
 * 
 *  This code is from W3Docs and modified by @jaemdessources
 *  

 */
//@ts-nocheck

export default function getTextPixelWidth(text: string, font: string) {
  let canvas: HTMLCanvasElement =
    getTextPixelWidth.canvas ||
    (getTextPixelWidth.canvas = document.createElement("canvas"));
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  context.font = font;
  const metrics = context?.measureText(text);
  return metrics.width as number;
}

// console.log(
//   "Text Width: " + displayTextWidth("This is demo text!", "italic 19pt verdana")
// ); //
