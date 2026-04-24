Hooks.once("setup", () => {

  console.log('loeg-supplement | setup template targeting');

  game.keybindings.register("loeg-supplement", "template-target", {
    name: "Target Tokens in Templates",
    hint: "Target the tokens whose centers fall within the templates on the canvas.",
    editable: [
		{
			key: 'KeyD',
			modifiers: ['Control', 'Shift']
		}
	],
    restricted: false,
    onDown: targetToken,
	precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  });
  game.keybindings.register("loeg-supplement", "template-select", {
    name: "Select Tokens in Templates",
    hint: "Select the tokens whose centers fall within the templates on the canvas.",
    editable: [
		{
			key: 'KeyS',
			modifiers: ['Control', 'Shift']
		}
	],
    restricted: false,
    onDown: selectToken,
	precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  });
  
  function targetToken(event) {
	for (const template of canvas.templates.objects.children) {
	  for (const token of canvas.tokens.placeables) {
		const { x, y } = token.center;
	  
		const localX = x - template.x;
		const localY = y - template.y;
	  
		if (template.shape.contains(localX, localY)) {
		  token.targeted.add(game.user);
		  game.user.targets.add(token);
		}
	  }
	}	  
  }

  function selectToken(event) {

	canvas.tokens.releaseAll();

	for (const template of canvas.templates.objects.children) {
		for (const token of canvas.tokens.placeables) {
		  const { x, y } = token.center;

		  const localX = x - template.x;
		  const localY = y - template.y;

		  if (template.shape.contains(localX, localY)) {
			token.control({ releaseOthers: false });
		  }
		}
	}
  }

});
