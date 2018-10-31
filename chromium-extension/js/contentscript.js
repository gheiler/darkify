// ToDo tasks:
// . add option to switch dark mode on page/domain
// . improve performance
// . add dark loader option
// . add option to start without dark
// . add option to make dark just at night

let styleSheetsLength = document.styleSheets.length;

// ToDo wait for window load, go through all items, take computed styles and add as style tag
for (let i = 0; i < styleSheetsLength; i++) {

    let styleSheet = document.styleSheets[i];
    let styleEl = document.createElement('style');
    document.head.appendChild(styleEl);
    let styleSheetOverride = styleEl.sheet;
    
    console.log(styleSheet);
    for (let j = 0; j < styleSheet.rules.length; j++) {

        if (j === 90) {
            let foo = '';
        }
        let rule = styleSheet.rules[j];
        let newRule = getNewRuleFromRuleStyle(rule);

        if (newRule !== '') {
            styleSheetOverride.insertRule(newRule, styleSheetOverride.cssRules.length);
        }
    }
}

function getNewRuleFromRuleStyle(rule) {
    // ToDo check for bacground-image with grandient and stuff
    //      check for border color
    //      check for background, border, border-shadow, parse and replace
    let newRule = '';
    if (rule.style) {
        if (rule.style.color !== '') {
            let newColor = getNewColor(rule.style.color);
            if (newColor) {
                newRule = appendToRule(newRule, 'color: ' + newColor);
            }
        }
        // ToDo check which rule comes first and respect order
        if (rule.style.backgroundColor !== '') {
            let newBackgroundColor = getNewBackgroundColor(rule.style.backgroundColor);
            if (newBackgroundColor) {
                newRule = appendToRule(newRule, 'background-color: ' + newBackgroundColor);
            }
        }
        if (rule.style.background !== '') {
            let newBackground = getNewBackgroundColor(rule.style.background);
            if (newBackground) {
                newRule = appendToRule(newRule, 'background: ' + newBackground);
            }
        }

        if (newRule !== '') {
            newRule = rule.selectorText + ' { ' + newRule + ' } ';
        }
    } else if (rule.cssRules) {
        let selector = rule.cssText.match(/.+?(?={)/)[0];
        for (let k = 0; k < rule.cssRules.length; k++) {
            let subRule = rule.cssRules[k];
            let newSubRule = getNewRuleFromRuleStyle(subRule);
            if (newSubRule) {
                newRule += newSubRule;
            }
        }

        if (newRule != '') {
            newRule = selector + '{' + newRule + '}';
        }
    }

    if (newRule != '') {
        console.log(newRule);
    }
    return newRule;
}

function getNewColor(unformattedColor) {
    let color = getRGB(unformattedColor);

    if (!color || colorLuminanceIsLightEnough(color))
        return null;

    const brightnessPercentage = colorLuminanceIsBlack(color) ? 70 : 55;
    const newColor = brightenColor(color, brightnessPercentage);

    return getRgbStringFromColor(newColor);
}

function getNewBackgroundColor(unformattedColor) {
    let color = getRGB(unformattedColor);

    if (!color || colorLuminanceIsDarkEnough(color))
        return null;

    // ToDo improve logic, for now we go with just one background color when not dark enough
    // const brightnessPercentage = colorLuminanceIsBlack(color) ? 70 : 50;
    // const newColor = brightenColor(color, brightnessPercentage);

    return '#282A36';
}

function getRGB(unformattedColor){
    let a;
    let hexaFromName = colourNameToHex(unformattedColor);
    if (hexaFromName) {
        unformattedColor = hexaFromName;
    }

    if (a=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(unformattedColor)) 
        return { r: parseInt(a[1]), g: parseInt(a[2]), b: parseInt(a[3]) };
    if (a=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(unformattedColor)) 
        return { r: parseFloat(a[1]) * 2.55, g: parseFloat(a[2]) * 2.55, b: parseFloat(a[3]) * 2.55 };
    if (a=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(unformattedColor)) 
        return { r: parseInt(a[1],16), g: parseInt(a[2],16), b: parseInt(a[3],16) };
    if (a=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(unformattedColor)) 
        return { r: parseInt(a[1]+a[1], 16), g: parseInt(a[2]+a[2], 16), b: parseInt(a[3]+a[3], 16) };

    return null;
};

function getRgbStringFromColor(color){
    return 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
};

function getLuminance(color) {
    return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
}

function colorLuminanceIsLightEnough(color) {
    return getLuminance(color) > 180;
}

function colorLuminanceIsDarkEnough(color) {
    return getLuminance(color) < 140;
}

function colorLuminanceIsBlack(color) {
    return getLuminance(color) < 90;
}

function brightenColor(color, percentage) {
    let brightenedColor = {};

    percentage = (percentage === 0) ? 0 : (percentage || 10);

    brightenedColor.r = Math.max(0, Math.min(255, color.r - Math.round(255 * - (percentage / 100))));
    brightenedColor.g = Math.max(0, Math.min(255, color.g - Math.round(255 * - (percentage / 100))));
    brightenedColor.b = Math.max(0, Math.min(255, color.b - Math.round(255 * - (percentage / 100))));

    return brightenedColor;
}

function appendToRule(rule, appendix) {
    if (rule !== '') rule = rule + '; ';
    return rule + appendix  + '!important';
}

function colourNameToHex(colour)
{
    var colours = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
    "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
    "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
    "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
    "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
    "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
    "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
    "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
    "honeydew":"#f0fff0","hotpink":"#ff69b4",
    "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
    "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
    "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
    "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
    "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
    "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
    "navajowhite":"#ffdead","navy":"#000080",
    "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
    "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
    "rebeccapurple":"#663399","red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
    "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
    "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
    "violet":"#ee82ee",
    "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
    "yellow":"#ffff00","yellowgreen":"#9acd32"};

    if (typeof colours[colour.toLowerCase()] != 'undefined')
        return colours[colour.toLowerCase()];

    return false;
}