import { DotProduct, Length, Multiply, Add, Subtract, Clamp } from './helperfunctions.js'
import { Light } from './light.js'
import { canvas } from './canvasaccess.js'
import { PutPixel, UpdateCanvas, ClearAll } from './canvasfunctions.js'
import { viewport_size, projection_plane_z, camera_position, background_color, spheres, lights } from './scenesetup.js'

// ======================================================================
//  A raytracer with diffuse and specular illumination, and shadows.
// ======================================================================

// ----------------------------------------------------------------------
//  The raytracer specific variables.
// ----------------------------------------------------------------------
// Conceptually, an "infinitesimaly small" real number.
let EPSILON = 0.001
let recursion_depth = 3

// Converts 2D canvas coordinates to 3D viewport coordinates.
// p2d == [2D canvas x coordinate, 2D canvas y coordinate]
let CanvasToViewport = function (p2d) {
    return [
        (p2d[0] * viewport_size) / canvas.width, // 3D viewport x coordinate.
        (p2d[1] * viewport_size) / canvas.height, // 3D viewport y coordinate.
        projection_plane_z, // 3D viewport z coordinate.
    ]
}

// Computes the reflection of ray_direction_r respect to surface_normal_n.
let ReflectRay = function (ray_direction_r, surface_normal_n) {
    return Subtract(Multiply(2 * DotProduct(ray_direction_r, surface_normal_n), surface_normal_n), ray_direction_r);
}

// Computes the intersection of a ray and a sphere. Returns the values
// of t for the intersections.
let IntersectRaySphere = function (ray_origin, ray_direction, sphere) {
    let ray_origin_sphere_center_vector = Subtract(ray_origin, sphere.center)

    let k1 = DotProduct(ray_direction, ray_direction)
    let k2 = 2 * DotProduct(ray_origin_sphere_center_vector, ray_direction)
    let k3 = DotProduct(ray_origin_sphere_center_vector, ray_origin_sphere_center_vector) - sphere.radius * sphere.radius

    let discriminant = k2 * k2 - 4 * k1 * k3
    if (discriminant < 0) {
        return [Infinity, Infinity];
    }

    let t1 = (-k2 + Math.sqrt(discriminant)) / (2 * k1)
    let t2 = (-k2 - Math.sqrt(discriminant)) / (2 * k1)
    return [t1, t2]
}

// The diffuse reflection equation:
// The intensity is per unit area.
// fullAmountOfLightReceivedAtPointP_Ip = ambientLightIntensity_Ia
// + Sum_of[ (normalVector_N dot lightVector_Li) / (norm_of_normalVector_N * norm_of_lightVector_Li)]for_i=1_to_n
let ComputeLighting = function (point, surface_normal_n, view_vector_v, specular) {
    let light_intensity = 0;
    let surface_normal_n_length = Length(surface_normal_n); // Should be 1.0, but just in case...
    let view_vector_v_length = Length(view_vector_v)

    for (let i = 0; i < lights.length; i++) {
        let light = lights[i]
        if (light.light_type == Light.AMBIENT) {
            light_intensity += light.intensity
        } else {
            let light_vector_l, t_max
            if (light.light_type == Light.POINT) {
                light_vector_l = Subtract(light.position, point)
                t_max = 1.0
            } else {
                // Light.DIRECTIONAL
                light_vector_l = light.position
                t_max = Infinity
            }

            // Shadow check.
            let blocker = ClosestIntersection(point, light_vector_l, EPSILON, t_max);
            if (blocker) {
                continue;
            }

            // Diffuse reflection.
            let surface_normal_n_dot_light_vector_l = DotProduct(surface_normal_n, light_vector_l)
            if (surface_normal_n_dot_light_vector_l > 0) {
                light_intensity += (light.intensity * surface_normal_n_dot_light_vector_l) /
                    (surface_normal_n_length * Length(light_vector_l))
            }

            // Specular reflection.
            if (specular != -1) {
                let reflected_light_direction_r = ReflectRay(light_vector_l, surface_normal_n)


                let reflected_light_direction_r_dot_view_vector_v = DotProduct(reflected_light_direction_r, view_vector_v)

                if (reflected_light_direction_r_dot_view_vector_v > 0) {
                    light_intensity += light.intensity * Math.pow(reflected_light_direction_r_dot_view_vector_v / (Length(reflected_light_direction_r) * view_vector_v_length),
                        specular)
                }
            }
        }
    }
    return light_intensity
}

// Find the closest intersection between a ray and the spheres in the scene.
let ClosestIntersection = function (ray_origin, ray_direction, min_t, max_t) {
    let closest_t = Infinity
    let closest_sphere = null

    for (let i = 0; i < spheres.length; i++) {
        let ts = IntersectRaySphere(ray_origin, ray_direction, spheres[i])
        if (ts[0] < closest_t && min_t < ts[0] && ts[0] < max_t) {
            closest_t = ts[0]
            closest_sphere = spheres[i]
        }
        if (ts[1] < closest_t && min_t < ts[1] && ts[1] < max_t) {
            closest_t = ts[1]
            closest_sphere = spheres[i]
        }
    }

    if (closest_sphere) {
        return [closest_sphere, closest_t]
    }
    return null
}

// Traces a ray R against the set of spheres in the scene.
// and returns the color of the canvas pixel crossed by the ray R.
let TraceRay = function (ray_origin_o, ray_direction_d, min_t, max_t, recursion_depth) {
    let intersection = ClosestIntersection(ray_origin_o, ray_direction_d, min_t, max_t)
    
    if (!intersection) {
        return background_color
    }

    let closest_sphere = intersection[0]
    let closest_t = intersection[1]

    let point = Add(ray_origin_o, Multiply(closest_t, ray_direction_d))
    let surface_normal_n = Subtract(point, closest_sphere.center)
    surface_normal_n = Multiply(1.0 / Length(surface_normal_n), surface_normal_n)

    let view_vector_v = Multiply(-1, ray_direction_d)
    let lighting = ComputeLighting(point, surface_normal_n, view_vector_v, closest_sphere.specular)
    let local_color = Multiply(lighting, closest_sphere.color)

    // If we hit the recursion limit or the object is not reflective, we're done
    if (closest_sphere.reflective <= 0 || recursion_depth <= 0) {
        return local_color;
    }

    let reflected_ray = ReflectRay(view_vector_v, surface_normal_n)
    let reflected_color = TraceRay(point, reflected_ray, EPSILON, Infinity, recursion_depth - 1)

    return Add(Multiply(1 - closest_sphere.reflective, local_color),
        Multiply(closest_sphere.reflective, reflected_color))
}

let SetShadowEpsilon = function (epsilon) {
    EPSILON = epsilon
    Render()
}

let Render = function () {
    ClearAll()

    setTimeout(function () {
        //
        // Main loop.
        //
        for (let x = -canvas.width / 2; x < canvas.width / 2; x++) {
            for (let y = -canvas.height / 2; y < canvas.height / 2; y++) {
                // For each pixel of the canvas:
                // 1-Find the direction of the ray between the camera position and the viewport
                // point.This direction is the direction of the ray that starts at the
                // camera position and crosses the canvas pixel whose canvas coordinates are x
                // and y passed as arguments to the CanvasToViewport() function.
                let ray_direction = CanvasToViewport([x, y])

                // 2- Find the color of the pixel whose canvas coordinates are the x
                // and y coordinates that were passed as arguments to the CanvasToViewport() function.
                let pixel_color = TraceRay(camera_position, ray_direction, 1, Infinity, recursion_depth)

                // 3-Set the color of the pixel to the proper value.
                PutPixel(x, y, Clamp(pixel_color))
            }
        }
        UpdateCanvas()
    }, 0)
}

export { Render, SetShadowEpsilon }


