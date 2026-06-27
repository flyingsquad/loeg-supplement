class AttackSequenceDialog extends foundry.applications.api.DialogV2 {
	async _onRender(context, options) {
		await super._onRender(context, options);
	}
}

export class AttackSequence {
	async attackSequence() {
		function compareNoCase(a, b) {
			const nameA = a.name.toUpperCase(); // ignore upper and lowercase
			const nameB = b.name.toUpperCase(); // ignore upper and lowercase
			if (nameA < nameB)
				return -1;
			if (nameA > nameB)
				return 1;

			// names must be equal
			return 0;
		}		

		/// Macro to start attack sequence - shows quick list of weapons/powers for actor and roll main skill

		let actoratc=canvas.tokens.controlled[0]?.actor

		let swadeTools=game.modules.get('swade-tools')
		let br2=game.modules.get('betterrolls-swade2')

		if (!swadeTools.active && ! br2.active) {
			ui.notifications.warn("Integration modules not active neither SwadeTools nor Better Rolls 2 loaded and active")
			return;
		}

		//let swadeTools=false
		if (!actoratc){
			ui.notifications.warn(swadeTools.active?game.i18n.localize('SWADETOOLS.NoActorFound'):'NoSelectedActor');
			return;
		}

		//let items=actoratc.items.filter(el=>(el.type=="power" || ( el.type=="weapon" && el.system.equipStatus>1)));
		let powers = actoratc.items.filter(el => el.type=="power");
		let weapons = actoratc.items.filter(el => el.type=="weapon" && el.system.equipStatus>1);
		
		weapons.sort(compareNoCase);
		powers.sort(compareNoCase);
		let items = weapons;
		for (let p of powers)
			items.push(p);

		if (!items.length){
			ui.notifications.warn(swadeTools.active?game.i18n.localize('SWADETOOLS.NoItemEquipped'):'NoEquippedItemOrPower');
			return;
		}

		let buttons = [];

		let content=`<style>
		  .vertical-buttons {
			display: flex;
			flex-direction: column;
			gap: 8px;
		  }
		  .vertical-buttons button {
			width: 100%;
			padding: 4px;
			font-size: 14px;
		  }
		</style>

		<div class="vertical-buttons">`;
	
		let checked = ' checked';
		items.map((item)=>{
			content += `<label><input type="radio" name="choice" value="${item.id}"${checked}> ${item.name}</label>`;
			checked = '';
		});
		
		content += `</div>`;
/*
		items.map((item)=>{
			buttons.push({
				action: 'ok',
				style: [
					{"display": "block"}
				],
				label: "OK",
				callback: async (event, button, dialog) => {
					const message = await game.brsw.create_item_card(actoratc, button.form.elements.choice.value, true);
					await game.brsw.roll_item(message, "", false, true);
				}
			});
		});

*/
		new AttackSequenceDialog({
			window: {
				title: actoratc.name+': '+game.i18n.localize("SWADE.QuickAccess")
			},
			content: content,
			buttons: [
				{
					action: 'ok',
					label: "OK",
					callback: async (event, button, dialog) => {
						// Problem: shift doesn't work to allow user to select modifiers.
						const message = await game.brsw.create_item_card(actoratc, button.form.elements.choice.value, true);
						await game.brsw.roll_item(message, "", false, true);
					}
				}
			],
			classes: ['vertical-buttons'],
			submit: result => {
				console.log('Submit');
			}
		}).render(true);
	}
	
	static {
		console.log("AttackSequence | loaded.");

		Hooks.on("init", function() {
			console.log("AttackSequence | initialized.");
			if (!game.swadeAttackSequence) {
				game.swadeAttackSequence = new AttackSequence();
			}
		});
	}
	
}