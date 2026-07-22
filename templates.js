/*	The createRegionFromPreset in utils.js in SWADE system ignores the 
 *	canvas.scene.dimensions.distance setting, and assumes each square is
 *	1". This is a replacement function to all BR2 cards to bring up the
 *	proper template size.
 */

Hooks.once('init', async function () {
	game.SWADETemplate = {
		createRegionFromPreset: createRegionFromPreset
	}
});

/**
	The following is a copy of a function from utils.js in the SWADE system.
	I changed preview_template in item_card.js in BR2 with the following:
 
	if (game.SWADETemplate.createRegionFromPreset)
		game.SWADETemplate.createRegionFromPreset(type, brCard.item);
	else
		swade.util.createRegionFromPreset(type, brCard.item);
	
 */

export async function createRegionFromPreset(preset, item) {
  const highlightRAW = game.settings.get('swade', 'highlightTemplate');
  const presetData = CONFIG.SWADE.regionPresets.find(({button}) => button.name === preset);
  if (!presetData || !canvas.grid) return;

  // Avoid duplicate names by appending numbers, like ClientDocument.defaultName does in core.
  const existingRegions = canvas.scene?.regions ?? [];
  const takenNames = new Set();
  for (const r of existingRegions) takenNames.add(r.name);
  const baseName = game.i18n.format('SWADE.Templates.RegionName', { name: _loc(presetData.button.title)});
  let name = baseName;
  let index = 1;
  while (takenNames.has(name)) name = `${baseName} (${++index})`;

  const regionData = {
    name: name,
    color: game.user.color,
    levels: [canvas.level.id],
    visibility: CONST.REGION_VISIBILITY.ALWAYS,
    highlightMode: highlightRAW ? 'shapes' : 'coverage',
    shapes: [{
      type: presetData.shape.type,
      x: 0,
      y: 0,
    }],
    flags: {
      swade: {
        preset: preset,
      },
    },
  };
  if (item) regionData.flags.swade['origin'] = item.uuid;

  switch (presetData.shape.type) {
    case 'cone':
      Object.assign(regionData.shapes[0], {
        angle: presetData.shape.angle,
        curvature: 'semicircle',
        radius: Math.round(presetData.shape.radius * canvas.grid.size/canvas.scene.dimensions.distance),
      });
      break;
    case 'line':
      Object.assign(regionData.shapes[0], {
        length: Math.round(presetData.shape.length * canvas.grid.size/canvas.scene.dimensions.distance),
        width: Math.round(presetData.shape.width * canvas.grid.size/canvas.scene.dimensions.distance),
      });
      break;
    case 'circle':
      regionData.shapes[0].radius = Math.round(presetData.shape.radius * canvas.grid.size / canvas.scene.dimensions.distance);
      break;
  }
  return canvas.regions.placeRegion(regionData);
}
