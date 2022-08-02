import { canvas, canvas_context, canvas_buffer, canvas_pitch } from './canvasaccess.js'

// The PutPixel() function.
let PutPixel = function (x, y, color) {
    x = canvas.width / 2 + x
    y = canvas.height / 2 - y - 1

    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
        return
    }

    let offset = 4 * x + canvas_pitch * y
    canvas_buffer.data[offset++] = color[0]
    canvas_buffer.data[offset++] = color[1]
    canvas_buffer.data[offset++] = color[2]
    canvas_buffer.data[offset++] = 255 // Alpha = 255 (full opacity)
}

// Displays the contents of the offscreen buffer into the canvas.
let UpdateCanvas = function () {
    canvas_context.putImageData(canvas_buffer, 0, 0)
}

let ClearAll = function () {
    canvas.width = canvas.width;
}

export { PutPixel, UpdateCanvas, ClearAll }