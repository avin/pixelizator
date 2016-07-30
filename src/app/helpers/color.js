/**
 * Parses a color from a string.
 *
 * @private
 * @param {RGB|string} source
 * @return {RGB}
 *
 * @example
 * parseColor({ r: 3, g: 22, b: 111 }); // => { r: 3, g: 22, b: 111 }
 * parseColor('#f00');                  // => { r: 255, g: 0, b: 0 }
 * parseColor('#04fbc8');               // => { r: 4, g: 251, b: 200 }
 * parseColor('#FF0');                  // => { r: 255, g: 255, b: 0 }
 * parseColor('rgb(3, 10, 100)');       // => { r: 3, g: 10, b: 100 }
 * parseColor('rgb(50%, 0%, 50%)');     // => { r: 128, g: 0, b: 128 }
 * parseColor('aqua');                  // => { r: 0, g: 255, b: 255 }
 */
export const parseColor = (source) => {

    if (typeof source === 'object') {
        return source;
    }

    var red, green, blue;

    var hexMatch = source.match(/^#((?:[0-9a-f]{3}){1,2})$/i);
    if (hexMatch) {
        hexMatch = hexMatch[1];

        if (hexMatch.length === 3) {
            hexMatch = [
                hexMatch.charAt(0) + hexMatch.charAt(0),
                hexMatch.charAt(1) + hexMatch.charAt(1),
                hexMatch.charAt(2) + hexMatch.charAt(2)
            ];

        } else {
            hexMatch = [
                hexMatch.substring(0, 2),
                hexMatch.substring(2, 4),
                hexMatch.substring(4, 6)
            ];
        }

        red = parseInt(hexMatch[0], 16);
        green = parseInt(hexMatch[1], 16);
        blue = parseInt(hexMatch[2], 16);

        return {r: red, g: green, b: blue};
    }

    return null;
};


/**
 * rgbToHex
 * @param r
 * @param g
 * @param b
 * @returns {string}
 */
export const rgbToHex = (r, g, b) => {
    const componentToHex = (c) => {
        const hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    };

    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};