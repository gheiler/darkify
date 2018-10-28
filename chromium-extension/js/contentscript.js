let styleSheetsLength = document.styleSheets.length;
for (let i = 0; i < styleSheetsLength; i++) {
    let styleSheet = document.styleSheets[i];
    var styleEl = document.createElement('style');

    // Append <style> element to <head>
    document.head.appendChild(styleEl);
  
    // Grab style element's sheet
    var styleSheetOverride = styleEl.sheet;
    
    console.log(styleSheet);
    for (let j = 0; j < styleSheet.rules.length; j++) {
        let rule = styleSheet.rules[j];
        let newRule = '';
        let selector = '';

        if (j >= 88) {
            let a = 0;
        }

        try {
            if (rule.style) {
                selector = rule.selectorText;
                newRule = getNewRuleFromRuleStyle(rule);
            } else if (rule.cssRules) {
                // ToDo parse cssText instead
                selector = '@media ' + rule.media ? rule.media[0] : '';
                // ToDo rework iteration to handle media cases where there is a list of rules inside a rule
                for (let k = 0; k < rule.cssRules.length; k++) {
                    let subRule = rule.cssRules[k];
                    // ToDo make this one a real recursive function
                    let newSubRule = getNewRuleFromRuleStyle(subRule);
                    if (newSubRule) {
                        newRule += newSubRule;
                    }
                }
            }
            if (newRule !== '') {
                styleSheetOverride.insertRule(selector + '{' + newRule + '}', styleSheetOverride.cssRules.length);
            }
        } catch (exception) { 
            newRule = ''; 
            continue;
        }
    }
}

function getNewRuleFromRuleStyle(rule) {
    // ToDo check for bacground-image with grandient and stuff
    //      check for border color
    let newRule = '';
    // ToDo take into consideration screen, print, ? rules. Then iterate on all the rules inside those
    if (rule.style) {
        if (rule.style.color !== '') {
            let newColor = getNewColor(rule.style.color);
            if (newColor) {
                newRule += 'color: ' + newColor; 
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
            console.log('newRule: ' + rule.selectorText + '{' + newRule + '}');
            newRule = rule.selectorText + '{' + newRule + '}';
        }
    }
    return newRule;
}

function getNewColor(unformattedColor) {
    let color = getRGB(unformattedColor);

    if (!color || colorLuminanceIsLightEnough(color))
        return null;

    const brightnessPercentage = colorLuminanceIsBlack(color) ? 70 : 50;
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
    if (rule !== '') rule = rule + ';';
    return rule + appendix;
}