precision highp float;

uniform sampler2D u_image;
uniform vec2 u_resolution; 
uniform vec2 u_imageArea; 

uniform vec3 u_backColor;
uniform vec3 u_lineColor;

uniform float u_lineGap;
uniform float u_maxLineWidth;

uniform float u_contrastMidpoint;
uniform float u_contrastStrength;

varying vec2 v_uv;

float getBrightness(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
}

float enhanceContrast(float value, float midpoint, float strength) {
    float adjusted = (value - midpoint) * strength + midpoint;
    return clamp(adjusted, 0.0, 1.0);
}

void main() {
    vec2 uv = v_uv;

    vec2 imageAreaN = u_imageArea / u_resolution;
    vec2 imageStartN = (vec2(1.0, 1.0) - imageAreaN) * 0.5;
    vec2 imageEndN = imageStartN + imageAreaN;

    if (uv.x < imageStartN.x || uv.x > imageEndN.x ||
        uv.y < imageStartN.y || uv.y > imageEndN.y) {
        gl_FragColor = vec4(u_backColor, 1.0);
        return;
    }

    vec2 imageUV = (uv - imageStartN) / imageAreaN;

    vec3 color = texture2D(u_image, imageUV).rgb;
    float brightness = getBrightness(color);
    brightness = enhanceContrast(brightness, u_contrastMidpoint, u_contrastStrength);

    float lineGapNorm = u_lineGap / u_imageArea.x;
    float maxLineWidthNorm = u_maxLineWidth / u_imageArea.x;

    float xNorm = imageUV.x;

    float colIndex = floor(xNorm / lineGapNorm);

    float centerNorm = colIndex * lineGapNorm + lineGapNorm * 0.5;

    float lineWidthNorm = brightness * maxLineWidthNorm;

    float distNorm = abs(xNorm - centerNorm);

    vec3 finalColor = distNorm < lineWidthNorm * 0.5 ? u_lineColor : u_backColor;

    gl_FragColor = vec4(finalColor, 1.0);
}