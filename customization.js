export class LoEGutils {
	
	showDialog = false;
	
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
		} else {
			//let swadeTools=false
			if (!actoratc){
				ui.notifications.warn(swadeTools.active?game.i18n.localize('SWADETOOLS.NoActorFound'):'NoSelectedActor');
				
			} else {

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
				} else {
					let buttons={}

					let content=`<label style="font-size:14px;display:flex;align-items:center;margin-bottom: 5px;">
					</label>`
					if(swadeTools.active) {
					  content = `<label style="font-size:14px;display:flex;align-items:center;margin-bottom: 5px;"><input type="checkbox" ${this.showDialog?' checked':''} style="margin:0;vertical-align:middle;margin-right: 3px;" id="showmore"/> ${game.i18n.localize('SWADETOOLS.ShowDialogCheck')}</label>`
					}

					items.map((item)=>{
						buttons[item.id]={
							label: item.name,
							callback: async (html)=> {
								if (swadeTools.active) {
									let dialog=false;
									if (html.find("#showmore")[0].checked)
										dialog=true;
									this.showDialog = dialog;
									game.swade.swadetoolsAttack(actoratc,item,dialog)
								} else {
									const message = await game.brsw.create_item_card(actoratc,item.id,true);
									await game.brsw.roll_item(message, "", false, true);
								}
							}
						}
					})


					new Dialog({
						title: actoratc.name+': '+game.i18n.localize("SWADE.QuickAccess"),
						content: content,
						buttons: buttons,
					classes: 'horizontal-dialog'
					},{classes:["vertical-buttons"]}).render(true);
				}
			}
		}
	}
	
	addFatigue(fatigue) {
		if (game.keyboard.isModifierActive(KeyboardManager.MODIFIER_KEYS.SHIFT))
			fatigue = -fatigue;
		for (const token of game.canvas.tokens.controlled) {
			let actor = token.actor;
			const currentFatigue = actor.system.fatigue.value;
			let newFatigue = currentFatigue + fatigue;
			if (newFatigue < 0)
				newFatigue = 0;
			actor.update({"system.fatigue.value": Math.min(newFatigue, actor.system.fatigue.max)});

			if (newFatigue > actor.system.fatigue.max && !actor.system.status.isIncapacitated) {
				const incap = game.swade.util.getStatusEffectDataById('incapacitated', {active: true});
				actor.toggleActiveEffect(incap);
			} else if (actor.system.status.isIncapacitated) {
				const incap = game.swade.util.getStatusEffectDataById('incapacitated', {active: true});
				actor.toggleActiveEffect(incap);
			}
		}
	}
	
	static {
		//console.log("LoEGutils | loaded.");

		Hooks.on("init", function() {
			console.log("LoEGutils | initialized.");
			if (!game.LoEGutils) {
				game.LoEGutils = new LoEGutils();
			}
		});
	}

}
