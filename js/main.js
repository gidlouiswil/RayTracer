import { Render, SetShadowEpsilon } from './raytracer.js'

let launchRaytracer = function(){
    document.getElementById('radio1').addEventListener('click', function(){
        SetShadowEpsilon(0)
    })
    document.getElementById('radio2').addEventListener('click', function(){
        SetShadowEpsilon(0.001)
    })
    Render()
} 
window.onload = launchRaytracer() 