figma.showUI(__html__, { width: 300, height: 420 });


figma.ui.onmessage = async function (msg) {
if (msg.type === "RESIZE_UI") {
  figma.ui.resize(300, msg.expanded ? 480 : 420);

  return;
}
  if (msg.type !== "RANDOM_FONT") return;

  var selection = figma.currentPage.selection;
  if (!selection.length) {
    figma.notify("Select at least one text layer");
    return;
  }

  var allFonts = await figma.listAvailableFontsAsync();
  var usableFonts = allFonts;

  if (msg.excludeCommon && msg.excludeList) {
    var excludedKeywords = msg.excludeList
  .split(",")
  .map(function (k) {
    return k.trim().toLowerCase();
  })
  .filter(function (k) {
    return k.length;
  });

usableFonts = usableFonts.filter(function (f) {
  var familyName = f.fontName.family.toLowerCase();

  for (var i = 0; i < excludedKeywords.length; i++) {
    if (familyName.indexOf(excludedKeywords[i]) !== -1) {
      return false; // exclude this font
    }
  }

  return true; // keep font
});

    }

  if (!usableFonts.length) {
    figma.notify("No fonts left after filtering");
    return;
  }

  var randomFont =
    usableFonts[Math.floor(Math.random() * usableFonts.length)];

  for (var i = 0; i < selection.length; i++) {
    var node = selection[i];
    if (node.type !== "TEXT") continue;

    var styleToApply = randomFont.fontName.style;

if (msg.lockStyle) {
  var currentFont = node.fontName;

  if (typeof currentFont !== "symbol") {
    var lockedStyle = currentFont.style;

    // Filter fonts that support the locked style
    var compatibleFonts = usableFonts.filter(function (f) {
      return (
        f.fontName.style.toLowerCase() === lockedStyle.toLowerCase()
      );
    });

    // If compatible fonts exist, re-pick from them
    if (compatibleFonts.length > 0) {
      randomFont =
        compatibleFonts[Math.floor(Math.random() * compatibleFonts.length)];
      styleToApply = lockedStyle;
    }
  }
}


    try {
  await figma.loadFontAsync({
    family: randomFont.fontName.family,
    style: styleToApply
  });

  node.fontName = {
    family: randomFont.fontName.family,
    style: styleToApply
  };
} catch (e) {
  await figma.loadFontAsync(randomFont.fontName);
  node.fontName = randomFont.fontName;
}
  }

  figma.ui.postMessage({
    fontName: randomFont.fontName.family + " – " + randomFont.fontName.style
  });
};
