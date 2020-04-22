
function formatNumber(num) {
    if(num%1 === 0){
            return num+".0"
    } else {
            return num.toString()
    }    
} 

class Glsl {
    constructor(sceneSize) {
        this.vertexShader = `
        varying vec2 currentPixelPosition;
        void main() {
            vec3 position2 = position + vec3(1.0,1.0,0.0);
            currentPixelPosition.x = position2.x / 2.0;
            currentPixelPosition.y = position2.y / 2.0;
            currentPixelPosition = currentPixelPosition * ${sceneSize.width}.0;
            // Contains the position of the current vertex.
            gl_Position = vec4(position.x,position.y,position.z,1.0); 
        }
        `

        this.fragmentShaderHeader = `
        uniform vec2 u_resolution;
        uniform float u_time;
        // Position of te pixel that we are currently drawing in the space [-10,10] x [-10,10].
        varying vec2 currentPixelPosition;
        // Use high precision floats - to compute thingswithout errors
        // "When adding or dividing numbers,be precise"
        precision mediump float;
        // Returns distance between 'samplePosition' and the border of circle placed at theo rigin (0,0). 
        // Insid it's < 0. Outside it's > 0.
        float distanceToCircle(vec2 samplePosition, float radius){
            float distanceFromCenter = length(samplePosition);
            float distanceFromBorder = distanceFromCenter - radius;
            return distanceFromBorder;
        }
        // Returns distance between 'samplePosition' and the border of rectangle placed at the origin (0,0). 
        // Insid it's < 0. Outside it's > 0.
        float distanceToRectangle(vec2 samplePosition, vec2 size){
            vec2 halfSize= size / 2.0;
            vec2 componentWiseEdgeDistance = abs(samplePosition) - halfSize;
            float outsideDistance = length(max(componentWiseEdgeDistance, 0.0));
            float insideDistance = min(max(componentWiseEdgeDistance.x, componentWiseEdgeDistance.y), 0.0);
            return outsideDistance + insideDistance;
        }
        float distanceToLineVertical(vec2 samplePosition, vec2 halfSize){
            vec2 componentWiseEdgeDistance = abs(samplePosition) - halfSize;
            return componentWiseEdgeDistance.x;
        }
        float distanceToLineHorizontal(vec2 samplePosition, vec2 halfSize){
            vec2 componentWiseEdgeDistance = abs(samplePosition) - halfSize;
            return componentWiseEdgeDistance.y;
        }
        float distanceToLineVertical5(vec2 samplePosition, vec2 halfSize){
            vec2 componentWiseEdgeDistance = abs(samplePosition) - halfSize;
            return componentWiseEdgeDistance.x;
        }
        float distanceToLineHorizontal5(vec2 samplePosition, vec2 halfSize){
            vec2 componentWiseEdgeDistance = abs(samplePosition) - halfSize;
            return componentWiseEdgeDistance.y;
        }
        /// Returns distance to a combined shape.
        float merge(float distanceToShape1, float distanceToShape2){
            return min(distanceToShape1, distanceToShape2);
        }
        float intersect(float shape1, float shape2){
            return max(shape1, shape2);
        }
        float subtract(float base, float subtraction){
            return intersect(base, -subtraction);
        }
        float interpolate(float shape1, float shape2, float amount){
            return mix(shape1, shape2, amount);
        }
        float grow(float distance, float size){
            return distance - size;
        }
        vec2 repeatX(vec2 position, float distance) {
            float x = mod(position.x, distance);
            float y = position.y;
            return vec2(x, y);
        }
        vec2 repeatY(vec2 position, float distance) {
            float y = mod(position.y, distance);
            float x = position.x;
            return vec2(x, y);
        }
        vec2 translate(vec2 samplePosition, vec2 offset){
            return samplePosition - offset;
        }
        vec2 rotate(vec2 samplePosition, float rotation){
            const float PI = 3.14159;
            float angle = rotation * PI * 2.0 * -1.0;
            float sine = sin(angle);
            float cosine = cos(angle);
            float x      = cosine * samplePosition.x + sine * samplePosition.y;
            float y      = cosine * samplePosition.y - sine * samplePosition.x;
            return vec2(x,y);
        }
        vec2 scale(vec2 samplePosition, float scale){
            return samplePosition / scale;
        }
        float grid_distance(vec2 position) {
            vec2 repPositionX = repeatX(position, 20.0);
            vec2 repPositionY = repeatY(position, 20.0);
            vec2 repPositionX5 = repeatX(position, 100.0);
            vec2 repPositionY5 = repeatY(position, 100.0);
            float lineVertical   = distanceToLineVertical(repPositionX, vec2(1.0, 0.0));
            float lineHorizontal = distanceToLineHorizontal(repPositionY, vec2(0.0, 1.0));
            float lineVertical5   = distanceToLineVertical5(repPositionX5, vec2(2.0, 0.0));
            float lineHorizontal5 = distanceToLineHorizontal5(repPositionY5, vec2(0.0, 2.0));
            float add = merge(lineVertical, lineHorizontal);
            float add5 = merge(lineVertical5, lineHorizontal5);
            float addaddXD = merge(add, add5);
            return addaddXD;
        }
        float render (float distance) {
            float distanceChange = fwidth(distance) * 0.5;
            float antialiasedCutoff = smoothstep(distanceChange, -distanceChange, distance);
            return antialiasedCutoff;
        }
        vec4 grid(vec2 position) {
            float distance = grid_distance(position);
            float alpha    = render(distance);
            return vec4(1.0, 1.0, 1.0, alpha*0.08);
        }
        `
        this.fragmentShaderColorFigure = `
        vec4 colorFigure(vec2 position) {
        float distance = figure_part_0(position); 
        float distance_outer= grow(distance,3.0);
        float border = subtract(distance_outer,distance);
        float alpha    = render(border);
        return vec4(1.0, 1.0, 1.0, alpha);
        }
        `
        this.fragmentShaderEnding = `
        float background(vec2 position) {
            float rectangle = distanceToRectangle(position, vec2(${sceneSize.width}.0, ${sceneSize.height}.0));
            return rectangle;
        }
        vec4 mix_colors(vec4 background, vec4 foreground) {
            vec4 p_foreground = foreground * foreground.a;
            vec4 p_background = background * background.a;
            vec4 p_cd = (1.0 - foreground.a) * p_background + p_foreground;
            vec4 cd   = p_cd / p_cd.a;
            return cd;
        }
        vec4 layer1(vec2 position) {
            return vec4(0.03, 0.15, 0.26, 1.0);
        }
        vec4 layer2(vec2 position) {
            vec4 background = layer1(position);
            vec4 foreground = grid(position);
            vec4 add = mix_colors(background, foreground);
            return add;
        }
        vec4 layer3(vec2 position) {
            vec4 grid = layer2(position);
            vec4 figure = colorFigure(position);
            vec4 add = mix_colors(grid, figure);
            return add;
        }
        // Execute for every pixel.
        void main() {
            gl_FragColor = layer3(currentPixelPosition);
        }
        `
        this.figureDescription = `
        float figure_part_0(vec2 position) {
            vec2 position2 = translate(position, vec2(${sceneSize.width*2}.0, ${sceneSize.height*2}.0));
            float rectangle = distanceToRectangle(position2, vec2(200.0, 200.0));
            return rectangle;
        }
        `

        this.fragmentShader = this.fragmentShaderHeader + this.figureDescription + 
                              this.fragmentShaderColorFigure + this.fragmentShaderEnding 
    }
}
