import { Light } from './light.js'
import { Sphere } from './sphere.js'

// Scene setup.
let viewport_size = 1;
let projection_plane_z = 1;
let camera_position = [0, 0, 0];
let background_color = [255, 255, 255];
let spheres = [
    new Sphere([0, -1, 3], 1, [255, 0, 0], 500, 0.2),
    new Sphere([2, 0, 4], 1, [0, 255, 0], 10, 0.4),
    new Sphere([-2, 0, 4], 1, [0, 0, 255], 500, 0.3),
    new Sphere([0, -5001, 0], 5000, [255, 255, 0], 1000, 0.5)
]

let lights = [
    new Light(Light.AMBIENT, 0.2),
    new Light(Light.POINT, 0.6, [2, 1, 0]),
    new Light(Light.DIRECTIONAL, 0.2, [1, 4, 4]),
]

export { viewport_size, projection_plane_z, camera_position, background_color, spheres, lights }