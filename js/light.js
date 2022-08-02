// A Light.
let Light = function (light_type, intensity, position) {
    this.light_type = light_type;
    this.intensity = intensity;
    this.position = position;
}

Light.AMBIENT = 0;
Light.POINT = 1;
Light.DIRECTIONAL = 2;

export { Light }