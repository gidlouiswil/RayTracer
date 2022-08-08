// ======================================================================
//  Linear algebra and helpers.
// ======================================================================

// Dot product of two 3D vectors.
let DotProduct = function (v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]
}

// Length of a 3D vector.
let Length = function (vec) {
    return Math.sqrt(DotProduct(vec, vec))
}

// Multiplies a scalar and a vector.
let MultiplyScalarAndVector = function (k, vec) {
    return [k * vec[0], k * vec[1], k * vec[2]]
}

// Multiplies a matrix and a vector.
let MultiplyMatrixAndVector = function(mat, vec) {
    let result = [0, 0, 0];
  
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        result[i] += vec[j]*mat[i][j];
      }
    }
  
    return result;
  }

// Computes v1 + v2.
let Add = function (v1, v2) {
    return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]]
}

// Computes v1 - v2.
let Subtract = function (v1, v2) {
    return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]]
}

// Clamps a color to the canonical color range.
let Clamp = function (vec) {
    return [
        Math.min(255, Math.max(0, vec[0])),
        Math.min(255, Math.max(0, vec[1])),
        Math.min(255, Math.max(0, vec[2])),
    ]
}

export { DotProduct, Length, MultiplyScalarAndVector, MultiplyMatrixAndVector, Add, Subtract, Clamp }
