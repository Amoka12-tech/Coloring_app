/**
 *
 * @param   {string}    hsl     hsl value in the form of 'hsl(h, s%, l%)'
 * @returns {string}            rgb value in hex '#ffffff'
 */
export const HSLToRGB = (hsl) => {
  hsl = hsl.substr(4).split(')')[0].split(',');

  let h = hsl[0],
    s = hsl[1].substr(0, hsl[1].length - 1) / 100,
    l = hsl[2].substr(0, hsl[2].length - 1) / 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = l - c / 2,
    r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h <= 360) {
    r = c;
    g = 0;
    b = x;
  }
  //   r = Math.round((r + m) * 255);
  // g = Math.round((g + m) * 255);
  // b = Math.round((b + m) * 255);
  r = Math.min(Math.floor((r + m) * 256), 255);
  g = Math.min(Math.floor((g + m) * 256), 255);
  b = Math.min(Math.floor((b + m) * 256), 255);

  return RGBToHex(r, g, b);
};

function RGBToHex(r, g, b) {
  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);

  if (r.length == 1) r = '0' + r;
  if (g.length == 1) g = '0' + g;
  if (b.length == 1) b = '0' + b;

  return '#' + r + g + b;
}
