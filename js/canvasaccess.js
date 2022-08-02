// ======================================================================
//  Low-level canvas access.
// ======================================================================
let canvas = document.getElementById("canvas");
let canvas_context = canvas.getContext("2d");
let canvas_buffer = canvas_context.getImageData(0, 0, canvas.width, canvas.height)
let canvas_pitch = canvas_buffer.width * 4

export { canvas, canvas_context, canvas_buffer, canvas_pitch }