// ToDo tasks:
// . add option to switch dark mode on page/domain
// . improve performance
// . add dark loader option
// . add option to start without dark
// . add option to make dark just at night

const defaultEmptyColor = 'rgba(0, 0, 0, 0)';

window.onload = function() {
    let styleSheetsLength = document.styleSheets.length;
    // first we reverse all the style sheets
    try {
        for (let i = 0; i < styleSheetsLength; i++) {

            let styleSheet = document.styleSheets[i];
            let styleEl = document.createElement('style');
            document.head.appendChild(styleEl);
            styleEl.id = 'mtwd-' + i;
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
    } catch(e) {
        // some websites just dont allow access to their style sheets
        console.log(e);
    }

    // first we select the body, TODO: finish this special check for the body, add generic bkg color if none.
    document.querySelectorAll('body').forEach(function(node) {
        reverseStylesForNode(node);
    });

    // then we reverse all the computed styles
    document.querySelectorAll('*').forEach(function(node) {
        reverseStylesForNode(node);
    });

    // We also check for changes on the dom
    var config = { childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    var callback = function(mutationsList, observer) {
        setTimeout(function () {
            for(var mutation of mutationsList) {
                if (mutation.type == 'childList' || mutation.type == 'attributes') {
                    console.log('A child node has been added or removed.');
                    if (mutation.target) {
                        reverseStylesForNode(mutation.target);
                    }
                }
                /*else if (mutation.type == 'attributes') {
                    console.log('The ' + mutation.attributeName + ' attribute was modified.');
                }*/
            }
        }, 100);
    };

    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(document.querySelector('body'), config);
};


function reverseStylesForNode(node) {
    let rule = '';
    try {
        rule = window.getComputedStyle(node);
        let newRule = getNewRuleFromRuleStyle({ style: rule }, false);
        if (node.style.cssText) {
            let cssValue = node.style.cssText.trim();
            if (!cssValue.indexOf(';', cssValue.length - 1)) {
                cssValue += ';';
            }
            newRule = cssValue + newRule;
        }
        node.setAttribute('style', newRule);
    } catch (e) {
        let foo = '';
    }
}

function getNewRuleFromRuleStyle(rule, addSelector = true) {
    // ToDo check for bacground-image with grandient and stuff
    //      check for border color
    //      check for background, border, border-shadow, parse and replace
    let newRule = '';
    if (rule.style) {
        if (rule.style.color !== '' && rule.style.color !== defaultEmptyColor) {
            let newColor = getNewColor(rule.style.color);
            if (newColor) {
                newRule = appendToRule(newRule, 'color: ' + newColor);
            }
        }
        // ToDo check which rule comes first and respect order
        if (rule.style.backgroundColor !== '' && rule.style.backgroundColor !== defaultEmptyColor) {
            let newBackgroundColor = getNewBackgroundColor(rule.style.backgroundColor);
            if (newBackgroundColor) {
                newRule = appendToRule(newRule, 'background-color: ' + newBackgroundColor);
            }
        }
        if (rule.style.backgroundImage !== '' && rule.style.backgroundImage !== defaultEmptyColor) {
            let newBackgrounRule = getNewRuleFromGradient(rule.style.backgroundImage);
            if (newBackgrounRule != '') {
                newRule = appendToRule(newRule, 'background-image: ' + newBackgrounRule);
            }
        }
        if (rule.style.background !== '' && rule.style.background !== defaultEmptyColor) {
            let newBackground = getNewBackgroundColor(rule.style.background);
            if (newBackground) {
                // too much stuff to fix if we want to go this way
                // let colorToReplace = getRGBA(rule.style.background); 
                //newRule = appendToRule(newRule, 'background: ' + rule.style.border.replace(colorToReplace.value, newBackground));
                newRule = appendToRule(newRule, 'background: ' + newBackground);
            }
        }
        if (rule.style.borderColor !== '' && rule.style.borderColor !== defaultEmptyColor) {
            let newBackgroundColor = getNewColor(rule.style.borderColor);
            if (newBackgroundColor) {
                newRule = appendToRule(newRule, 'border-color: ' + newBackgroundColor);
            }
        }
        if (rule.style.borderImage !== '' && rule.style.borderImage !== defaultEmptyColor) {
            let newBackgrounRule = getNewRuleFromGradient(rule.style.borderImage, true);
            if (newBackgrounRule != '') {
                newRule = appendToRule(newRule, 'border-image: ' + newBackgrounRule);
            }
        }
        // ToDo fix this one
        /*if (rule.style.boxShadow !== '') {
            let newBackgrounRule = getNewRuleFromGradient('linear-gradient(' + rule.style.boxShadow + ')', true);
            if (newBackgrounRule != '') {
                let rGradientEnclosedInBrackets = /.*gradient\s*\(((?:\([^\)]*\)|[^\)\(]*)*)\)/;
                let match = rGradientEnclosedInBrackets.exec(newBackgrounRule);
                newRule = appendToRule(newRule, 'box-shadow: ' + match);
            }
        }*/
        if (rule.style.border !== '' && rule.style.border !== defaultEmptyColor) {
            let newBackgrounRule = getNewColor(rule.style.border);
            if (newBackgrounRule != '') {
                let colorToReplace = getRGBA(rule.style.border);
                newRule = appendToRule(newRule, 'border: ' + rule.style.border.replace(colorToReplace.value, newBackgrounRule));
            }
        }

        if (newRule !== '' && addSelector) {
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

        if (newRule != '' && addSelector) {
            newRule = selector + '{' + newRule + '}';
        }
    }

    if (newRule != '') {
        console.log(newRule);
    }
    return newRule;
}

function getNewColor(unformattedColor) {
    let color = getRGBA(unformattedColor);

    if (!color || colorLuminanceIsLightEnough(color))
        return null;

    const brightnessPercentage = colorLuminanceIsBlack(color) ? 70 : 55;
    const newColor = brightenColor(color, brightnessPercentage);

    return getRgbaStringFromColor(newColor);
}

function getNewRuleFromGradient(gradientImage, lightColor) {
    let newBackgrounRule = ''; 
    let results = [];
    try {
        results = GradientParser.parse(gradientImage);
    } catch(e){}

    if (results.length > 0) {
        results[0].colorStops.forEach(function(item) {
            let color = item.value;
            let newBackground;
            if (item.type === 'hex') {
                color = '#' + color;
            } else if (item.type === 'rgb') {
                color = 'rgb(' + item.value[0] + ', ' + item.value[1] + ', ' + item.value[2] + ')';
            }
            if (lightColor) {
                newBackground = getNewColor(color);
            } else {
                newBackground = getNewBackgroundColor(color);
            }

            if (newBackground) {
                if (newBackgrounRule === '') {
                    newBackgrounRule = gradientImage.replace(color, newBackground);
                } else {
                    newBackgrounRule = newBackgrounRule.replace(color, newBackground);
                }
            }
        });
    }
    return newBackgrounRule;
}

function getNewBackgroundColor(unformattedColor, alt) {
    let color = getRGBA(unformattedColor);

    if (!color || colorLuminanceIsDarkEnough(color))
        return null;

    // ToDo improve logic, for now we go with just one background color when not dark enough
    // const brightnessPercentage = colorLuminanceIsBlack(color) ? 70 : 50;
    // const newColor = brightenColor(color, brightnessPercentage);
    if (colorLuminanceIsWhiteOrAlmost(color)) return '#282A36'

    return shadeBlendConvert(-0.7, color);
}

function getRGBA(unformattedColor){
    if (typeof unformattedColor !== 'string') return null;
    let a;
    let hexaFromName = colourNameToHex(unformattedColor);
    if (hexaFromName) {
        unformattedColor = hexaFromName;
    }
    // RGBA
    if (a=/rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(unformattedColor)) 
        return { r: parseInt(a[1]), g: parseInt(a[2]), b: parseInt(a[3]), a: parseInt(a[4]), value: a[0] };
    if (a=/rgba\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(unformattedColor)) 
        return { r: parseFloat(a[1]) * 2.55, g: parseFloat(a[2]) * 2.55, b: parseFloat(a[3]) * 2.55, a: parseFloat(a[4]), value: a[0] };
    if (a=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(unformattedColor)) 
        return { r: parseInt(a[1],16), g: parseInt(a[2],16), b: parseInt(a[3],16), a: Math.round((parseInt(a[4], 16)/255)*100)/100, value: a[0] };
    if (a=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(unformattedColor)) 
        return { r: parseInt(a[1]+a[1], 16), g: parseInt(a[2]+a[2], 16), b: parseInt(a[3]+a[3], 16), a: Math.round((parseInt(a[4], 16)/255)*100)/100, value: a[0] };
    // just RGB
    if (a=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(unformattedColor)) 
        return { r: parseInt(a[1]), g: parseInt(a[2]), b: parseInt(a[3]), value: a[0] };
    if (a=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(unformattedColor)) 
        return { r: parseFloat(a[1]) * 2.55, g: parseFloat(a[2]) * 2.55, b: parseFloat(a[3]) * 2.55, value: a[0] };
    if (a=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(unformattedColor)) 
        return { r: parseInt(a[1],16), g: parseInt(a[2],16), b: parseInt(a[3],16), value: a[0] };
    if (a=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(unformattedColor)) 
        return { r: parseInt(a[1]+a[1], 16), g: parseInt(a[2]+a[2], 16), b: parseInt(a[3]+a[3], 16), value: a[0] };

    return null;
};

function getRgbaStringFromColor(color){
    if (color.a) {
        return 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + color.a + ')';
    }
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

function colorLuminanceIsWhiteOrAlmost(color) {
    return getLuminance(color) > 240;
}

function brightenColor(color, percentage) {
    let brightenedColor = {};

    percentage = (percentage === 0) ? 0 : (percentage || 10);

    brightenedColor.r = Math.max(0, Math.min(255, color.r - Math.round(255 * - (percentage / 100))));
    brightenedColor.g = Math.max(0, Math.min(255, color.g - Math.round(255 * - (percentage / 100))));
    brightenedColor.b = Math.max(0, Math.min(255, color.b - Math.round(255 * - (percentage / 100))));
    if (color.a) {
        brightenedColor.a = color.a;
    }

    return brightenedColor;
}

const shadeBlendConvert = function (p, color, to) {
    from = getRgbaStringFromColor(color);
    if(typeof(p)!="number"||p<-1||p>1||typeof(from)!="string"||(from[0]!='r'&&from[0]!='#')||(to&&typeof(to)!="string"))return null; //ErrorCheck
    if(!this.sbcRip)this.sbcRip=(d)=>{
        let l=d.length,RGB={};
        if(l>9){
            d=d.split(",");
            if(d.length<3||d.length>4)return null;//ErrorCheck
            RGB[0]=i(d[0].split("(")[1]),RGB[1]=i(d[1]),RGB[2]=i(d[2]),RGB[3]=d[3]?parseFloat(d[3]):-1;
        }else{
            if(l==8||l==6||l<4)return null; //ErrorCheck
            if(l<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(l>4?d[4]+""+d[4]:""); //3 or 4 digit
            d=i(d.slice(1),16),RGB[0]=d>>16&255,RGB[1]=d>>8&255,RGB[2]=d&255,RGB[3]=-1;
            if(l==9||l==5)RGB[3]=r((RGB[2]/255)*10000)/10000,RGB[2]=RGB[1],RGB[1]=RGB[0],RGB[0]=d>>24&255;
        }
    return RGB;}
    var i=parseInt,r=Math.round,h=from.length>9,h=typeof(to)=="string"?to.length>9?true:to=="c"?!h:false:h,b=p<0,p=b?p*-1:p,to=to&&to!="c"?to:b?"#000000":"#FFFFFF",f=this.sbcRip(from),t=this.sbcRip(to);
    if(!f||!t)return null; //ErrorCheck
    if(h)return "rgb"+(f[3]>-1||t[3]>-1?"a(":"(")+r((t[0]-f[0])*p+f[0])+","+r((t[1]-f[1])*p+f[1])+","+r((t[2]-f[2])*p+f[2])+(f[3]<0&&t[3]<0?")":","+(f[3]>-1&&t[3]>-1?r(((t[3]-f[3])*p+f[3])*10000)/10000:t[3]<0?f[3]:t[3])+")");
    else return "#"+(0x100000000+r((t[0]-f[0])*p+f[0])*0x1000000+r((t[1]-f[1])*p+f[1])*0x10000+r((t[2]-f[2])*p+f[2])*0x100+(f[3]>-1&&t[3]>-1?r(((t[3]-f[3])*p+f[3])*255):t[3]>-1?r(t[3]*255):f[3]>-1?r(f[3]*255):255)).toString(16).slice(1,f[3]>-1||t[3]>-1?undefined:-2);
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

// gradient parser

// Copyright (c) 2014 Rafael Caricio. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var GradientParser = (GradientParser || {});

GradientParser.parse = (function() {

  var tokens = {
    linearGradient: /^(\-(webkit|o|ms|moz)\-)?(linear\-gradient)/i,
    repeatingLinearGradient: /^(\-(webkit|o|ms|moz)\-)?(repeating\-linear\-gradient)/i,
    radialGradient: /^(\-(webkit|o|ms|moz)\-)?(radial\-gradient)/i,
    repeatingRadialGradient: /^(\-(webkit|o|ms|moz)\-)?(repeating\-radial\-gradient)/i,
    sideOrCorner: /^to (left (top|bottom)|right (top|bottom)|left|right|top|bottom)/i,
    extentKeywords: /^(closest\-side|closest\-corner|farthest\-side|farthest\-corner|contain|cover)/,
    positionKeywords: /^(left|center|right|top|bottom)/i,
    pixelValue: /^(-?(([0-9]*\.[0-9]+)|([0-9]+\.?)))px/,
    percentageValue: /^(-?(([0-9]*\.[0-9]+)|([0-9]+\.?)))\%/,
    emValue: /^(-?(([0-9]*\.[0-9]+)|([0-9]+\.?)))em/,
    angleValue: /^(-?(([0-9]*\.[0-9]+)|([0-9]+\.?)))deg/,
    startCall: /^\(/,
    endCall: /^\)/,
    comma: /^,/,
    hexColor: /^\#([0-9a-fA-F]+)/,
    literalColor: /^([a-zA-Z]+)/,
    rgbColor: /^rgb/i,
    rgbaColor: /^rgba/i,
    number: /^(([0-9]*\.[0-9]+)|([0-9]+\.?))/
  };

  var input = '';

  function error(msg) {
    var err = new Error(input + ': ' + msg);
    err.source = input;
    throw err;
  }

  function getAST() {
    var ast = matchListDefinitions();

    if (input.length > 0) {
      error('Invalid input not EOF');
    }

    return ast;
  }

  function matchListDefinitions() {
    return matchListing(matchDefinition);
  }

  function matchDefinition() {
    return matchGradient(
            'linear-gradient',
            tokens.linearGradient,
            matchLinearOrientation) ||

          matchGradient(
            'repeating-linear-gradient',
            tokens.repeatingLinearGradient,
            matchLinearOrientation) ||

          matchGradient(
            'radial-gradient',
            tokens.radialGradient,
            matchListRadialOrientations) ||

          matchGradient(
            'repeating-radial-gradient',
            tokens.repeatingRadialGradient,
            matchListRadialOrientations);
  }

  function matchGradient(gradientType, pattern, orientationMatcher) {
    return matchCall(pattern, function(captures) {

      var orientation = orientationMatcher();
      if (orientation) {
        if (!scan(tokens.comma)) {
          error('Missing comma before color stops');
        }
      }

      return {
        type: gradientType,
        orientation: orientation,
        colorStops: matchListing(matchColorStop)
      };
    });
  }

  function matchCall(pattern, callback) {
    var captures = scan(pattern);

    if (captures) {
      if (!scan(tokens.startCall)) {
        error('Missing (');
      }

      result = callback(captures);

      if (!scan(tokens.endCall)) {
        error('Missing )');
      }

      return result;
    }
  }

  function matchLinearOrientation() {
    return matchSideOrCorner() ||
      matchAngle();
  }

  function matchSideOrCorner() {
    return match('directional', tokens.sideOrCorner, 1);
  }

  function matchAngle() {
    return match('angular', tokens.angleValue, 1);
  }

  function matchListRadialOrientations() {
    var radialOrientations,
        radialOrientation = matchRadialOrientation(),
        lookaheadCache;

    if (radialOrientation) {
      radialOrientations = [];
      radialOrientations.push(radialOrientation);

      lookaheadCache = input;
      if (scan(tokens.comma)) {
        radialOrientation = matchRadialOrientation();
        if (radialOrientation) {
          radialOrientations.push(radialOrientation);
        } else {
          input = lookaheadCache;
        }
      }
    }

    return radialOrientations;
  }

  function matchRadialOrientation() {
    var radialType = matchCircle() ||
      matchEllipse();

    if (radialType) {
      radialType.at = matchAtPosition();
    } else {
      var extent = matchExtentKeyword();
      if (extent) {
        radialType = extent;
        var positionAt = matchAtPosition();
        if (positionAt) {
          radialType.at = positionAt;
        }
      } else {
        var defaultPosition = matchPositioning();
        if (defaultPosition) {
          radialType = {
            type: 'default-radial',
            at: defaultPosition
          };
        }
      }
    }

    return radialType;
  }

  function matchCircle() {
    var circle = match('shape', /^(circle)/i, 0);

    if (circle) {
      circle.style = matchLength() || matchExtentKeyword();
    }

    return circle;
  }

  function matchEllipse() {
    var ellipse = match('shape', /^(ellipse)/i, 0);

    if (ellipse) {
      ellipse.style =  matchDistance() || matchExtentKeyword();
    }

    return ellipse;
  }

  function matchExtentKeyword() {
    return match('extent-keyword', tokens.extentKeywords, 1);
  }

  function matchAtPosition() {
    if (match('position', /^at/, 0)) {
      var positioning = matchPositioning();

      if (!positioning) {
        error('Missing positioning value');
      }

      return positioning;
    }
  }

  function matchPositioning() {
    var location = matchCoordinates();

    if (location.x || location.y) {
      return {
        type: 'position',
        value: location
      };
    }
  }

  function matchCoordinates() {
    return {
      x: matchDistance(),
      y: matchDistance()
    };
  }

  function matchListing(matcher) {
    var captures = matcher(),
      result = [];

    if (captures) {
      result.push(captures);
      while (scan(tokens.comma)) {
        captures = matcher();
        if (captures) {
          result.push(captures);
        } else {
          error('One extra comma');
        }
      }
    }

    return result;
  }

  function matchColorStop() {
    var color = matchColor();

    if (!color) {
      error('Expected color definition');
    }

    color.length = matchDistance();
    return color;
  }

  function matchColor() {
    return matchHexColor() ||
      matchRGBAColor() ||
      matchRGBColor() ||
      matchLiteralColor();
  }

  function matchLiteralColor() {
    return match('literal', tokens.literalColor, 0);
  }

  function matchHexColor() {
    return match('hex', tokens.hexColor, 1);
  }

  function matchRGBColor() {
    return matchCall(tokens.rgbColor, function() {
      return  {
        type: 'rgb',
        value: matchListing(matchNumber)
      };
    });
  }

  function matchRGBAColor() {
    return matchCall(tokens.rgbaColor, function() {
      return  {
        type: 'rgba',
        value: matchListing(matchNumber)
      };
    });
  }

  function matchNumber() {
    return scan(tokens.number)[1];
  }

  function matchDistance() {
    return match('%', tokens.percentageValue, 1) ||
      matchPositionKeyword() ||
      matchLength();
  }

  function matchPositionKeyword() {
    return match('position-keyword', tokens.positionKeywords, 1);
  }

  function matchLength() {
    return match('px', tokens.pixelValue, 1) ||
      match('em', tokens.emValue, 1);
  }

  function match(type, pattern, captureIndex) {
    var captures = scan(pattern);
    if (captures) {
      return {
        type: type,
        value: captures[captureIndex]
      };
    }
  }

  function scan(regexp) {
    var captures,
        blankCaptures;

    blankCaptures = /^[\n\r\t\s]+/.exec(input);
    if (blankCaptures) {
        consume(blankCaptures[0].length);
    }

    captures = regexp.exec(input);
    if (captures) {
        consume(captures[0].length);
    }

    return captures;
  }

  function consume(size) {
    input = input.substr(size);
  }

  return function(code) {
    input = code.toString();
    return getAST();
  };
})();
