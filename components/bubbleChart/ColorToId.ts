class ColorToID {
	red_scale: number;
	green_scale: number;
	blue_scale: number;
	alpha_scale: number;
	red_shift: number;
	green_shift: number;
	blue_shift: number;
  
	constructor(gl: WebGLRenderingContext) {
	  // Get the precision of each color component
	  const red_bits = gl.getParameter(gl.RED_BITS);
	  const green_bits = gl.getParameter(gl.GREEN_BITS);
	  const blue_bits = gl.getParameter(gl.BLUE_BITS);
	  const alpha_bits = gl.getParameter(gl.ALPHA_BITS);
	  const total_bits = red_bits + green_bits + blue_bits + alpha_bits;
  
	  this.red_scale = Math.pow(2, red_bits);
	  this.green_scale = Math.pow(2, green_bits);
	  this.blue_scale = Math.pow(2, blue_bits);
	  this.alpha_scale = Math.pow(2, alpha_bits);
  
	  this.red_shift = Math.pow(2, green_bits + blue_bits + alpha_bits);
	  this.green_shift = Math.pow(2, blue_bits + alpha_bits);
	  this.blue_shift = Math.pow(2, alpha_bits);
	}
  
	/** ---------------------------------------------------------------------
	 * Given a RGBA color value, where each component is in the range [0.0,1.0],
	 * create a integer ID.
	 * @param r Number Red component in the range [0.0,+1.0]
	 * @param g Number Green component in the range [0.0,+1.0]
	 * @param b Number Blue component in the range [0.0,+1.0]
	 * @param a Number Alpha component in the range [0.0,+1.0]
	 * @returns Number An integer ID
	 */
	createID(r: number, g: number, b: number, a: number) {
	  const self = this;
	  // Change the color component values from the range (0.0, 1.0) to integers
	  // in the range (0, 2^bits-1).
	  r = Math.round(r * (self.red_scale - 1));
	  g = Math.round(g * (self.green_scale - 1));
	  b = Math.round(b * (self.blue_scale - 1));
	  a = Math.round(a * (self.alpha_scale - 1));
  
	  // Shift each component to its bit position in the integer
	  return r * self.red_shift + g * self.green_shift + b * self.blue_shift + a;
	}
  
	/** ---------------------------------------------------------------------
	 * Given a RGBA color value from a color buffer, where each component
	 * value is an integer in the range [0,numBits-1].
	 * @param r Number Red   component in the range [0,numBits-1]
	 * @param g Number Green component in the range [0,numBits-1]
	 * @param b Number Blue  component in the range [0,numBits-1]
	 * @param a Number Alpha component in the range [0,numBits-1]
	 * @returns Number An integer identifier.
	 */
	getID(r: number, g: number, b: number, a: number) {
	  const self = this;
	  // Shift each component to its bit position in the integer
	  return r * self.red_shift + g * self.green_shift + b * self.blue_shift + a;
	}
  
	/** ---------------------------------------------------------------------
	 * Given an integer ID, convert it into an RGBA color.
	 * @param id
	 * @returns Float32Array An RGBA color as a 4-component array of floats.
	 */
	createColor(id: number) {
	  const self = this;
	  var r, g, b, a;
  
	  r = Math.floor(id / self.red_shift);
	  id = id - r * self.red_shift;
  
	  g = Math.floor(id / self.green_shift);
	  id = id - g * self.green_shift;
  
	  b = Math.floor(id / self.blue_shift);
	  id = id - b * self.blue_shift;
  
	  a = id;
  
	  let color = new Float32Array(4);
	  color[0] = r / (self.red_scale - 1);
	  color[1] = g / (self.green_scale - 1);
	  color[2] = b / (self.blue_scale - 1);
	  color[3] = a / (self.alpha_scale - 1);
  
	  return color;
	}
  }
  
  export default ColorToID