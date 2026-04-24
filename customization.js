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
		console.log("LoEGutils | loaded.");

		Hooks.on("init", function() {
			console.log("LoEGutils | initialized.");
			if (!game.LoEGutils) {
				game.LoEGutils = new LoEGutils();
			}
		});
	}

}

Hooks.once('ready', () => {
	const BETTER_ROLLS_GLOBAL_ACTIONS = [
		{
			"id": "HALFDAMAGENORMAL",
			"name": "Half Damage from Normal Attacks",
			"button_name": "Half Damage/Normal",
			"multiplyDmgMod": "0.5",
			"and_selector": [
				{
					"selector_type": "target_has_effect",
					"selector_value": "Half Damage"
				},
				{
					not_selector: [
						{
							"selector_type": "item_type",
							"selector_value": "power"
						}
					],
				}
			],
			"group": "BRSW.Target",
			"defaultChecked": "on"
		},
		{
			"id": "LASERPARRY",
			"name": "Laser Parry",
			"button_name": "has Laser Parry",
			"skillMod": "-2",
			"and_selector": [
				{
					"selector_type": "target_has_effect",
					"selector_value": "Laser Parry"
				},
				{
					"or_selector": [
						{
							"selector_type": "item_name",
							"selector_value": "Bolt"
						},
						{
							"selector_type": "skill",
							"selector_value": "Shooting"
						}
					]
				}
			],
			"group": "BRSW.Target",
			"defaultChecked": "on"
		},
		{
			"id": "ARCANERESISTANCE",
			"name": "Arcane Resistance",
			"button_name": "has Arcane Resistance",
			"skillMod": "-2",
			"dmgMod": -2,
			"and_selector": [
				{
					"selector_type": "target_has_edge",
					"selector_value": "Arcane Resistance"
				},
				{
					not_selector: [
						{ selector_type: "target_has_edge", selector_value: "Improved Arcane Resistance" },
					],
				},
				{
					"or_selector": [
						{
							"selector_type": "item_type",
							"selector_value": "power"
						},
						{
							"selector_type": "item_value",
							"selector_value": "system.isArcaneDevice=1"
						}
					]
				}
			],
			"group": "BRSW.Target",
			"defaultChecked": "on"
		},
		{
			"id": "ARCANEPROTECTION",
			"name": "Arcane Protection",
			"button_name": "has Arcane Protection",
			"skillMod": "-2",
			"dmgMod": -2,
			"and_selector": [
				{
					"selector_type": "target_has_effect",
					"selector_value": "Arcane Protection"
				},
				{
					not_selector: [
						{ selector_type: "target_has_effect", selector_value: "Arcane Protection (-4)" }
					],
				},
				{
					not_selector: [
						{ selector_type: "target_has_effect", selector_value: "Arcane Protection (-6)" }
					],
				},
				{
					"or_selector": [
						{
							"selector_type": "item_type",
							"selector_value": "power"
						},
						{
							"selector_type": "item_value",
							"selector_value": "system.isArcaneDevice=1"
						}
					]
				}
			],
			"group": "BRSW.Target",
			"defaultChecked": "on"
		},
		{
			"id": "IMPROVEDARCANERESISTANCE",
			"name": "Improved Arcane Resistance",
			"button_name": "has Improved Arcane Resistance",
			"skillMod": "-4",
			"dmgMod": -4,
			"and_selector": [
				{
					"selector_type": "target_has_edge",
					"selector_value": "Improved Arcane Resistance"
				},
				{
					"or_selector": [
						{
							"selector_type": "item_type",
							"selector_value": "power"
						},
						{
							"selector_type": "item_value",
							"selector_value": "system.isArcaneDevice=1"
						}
					]
				}
			],
			"group": "BRSW.Target",
			"defaultChecked": "on"
		},
		{
			"id": "ARCANEPROTECTION-4",
			"name": "Arcane Protection (-4)",
			"button_name": "has Arcane Protection (-4)",
			"skillMod": "-4",
			"dmgMod": -4,
			"and_selector": [
				{
					"selector_type": "target_has_effect",
					"selector_value": "Arcane Protection (-4)"
				},
				{
					"or_selector": [
						{
							"selector_type": "item_type",
							"selector_value": "power"
						},
						{
							"selector_type": "item_value",
							"selector_value": "system.isArcaneDevice=1"
						}
					]
				}
			],
			"group": "BRSW.Target",
			"defaultChecked": "on"
		},
		{
			"id": "ARCANEPROTECTION-6",
			"name": "Arcane Protection (-6)",
			"button_name": "has Arcane Protection (-6)",
			"skillMod": "-6",
			"dmgMod": -6,
			"and_selector": [
				{
					"selector_type": "target_has_effect",
					"selector_value": "Arcane Protection (-6)"
				},
				{
					"or_selector": [
						{
							"selector_type": "item_type",
							"selector_value": "power"
						},
						{
							"selector_type": "item_value",
							"selector_value": "system.isArcaneDevice=1"
						}
					]
				}
			],
			"group": "BRSW.Target",
			"defaultChecked": "on"
		},
		{
			"id": "DOUBLETAP",
			"name": "Double Tap",
			"button_name": "Double Tap",
			"skillMod": "+1",
			"dmgMod": "+1",
			"and_selector": [
				{
					"selector_type": "actor_has_edge",
					"selector_value": "Double Tap"
				},
				{
					"selector_type": "skill",
					"selector_value": "Shooting"
				}
			],
			"shotsUsed": 2,
			"group": "BRSW.Edges"
		},
		{
			"id": "3RB",
			"name": "3RB",
			"button_name": "3RB",
			"skillMod": "+6",
			"dmgMod": "+2",
			"and_selector": [
				{
					"selector_type": "actor_has_edge",
					"selector_value": "Double Tap"
				},
				{
					"selector_type": "skill",
					"selector_value": "Shooting"
				}
			],
			"shotsUsed": 6,
			"group": "BRSW.Edges"
		},
		{
			"id": "CHARACTER_HAS_HEALER",
			"name": "Healer",
			"button_name": "Healer",
			"skillMod": "+2",
			"and_selector": [
				{
					"selector_type": "actor_has_edge",
					"selector_value": "Healer"
				},
				{
					"selector_type": "item_name",
					"selector_value": "Healing"
				}
			],
			"group": "BRSW.Edges",
			"defaultChecked": "on"
		},
		{
			"id": "ISINVISIBLE",
			"name": "Is Invisible",
			"button_name": "Is Invisible",
			"skillMod": "-6",
			"and_selector": [
				{
					"or_selector": [
						{
							"selector_type": "target_has_effect",
							"selector_value": "Stealthed"
						},
						{
							"selector_type": "target_has_effect",
							"selector_value": "Invisible"
						},
					]
				},
				{
					"or_selector": [
						{
							"selector_type": "item_name",
							"selector_value": "Bolt"
						},
						{
							"selector_type": "skill",
							"selector_value": "Fighting"
						},
						{
							"selector_type": "skill",
							"selector_value": "Shooting"
						}
					]
				}
			],
			"group": "BRSW.Target",
			"defaultChecked": "on"
		},
		{
			"id": "unspecskill",
			"name": "Unspecialized Skill Use",
			"button_name": "Unspecialized Skill Use (-2)",
			"skillMod": "-2",
			"selector_type": "item_type",
			"selector_value": "skill",
			"group": "BRSW.SituationalModifiers"
		},
		{
			"id": "COMBATACROBAT",
			"name": "Combat Acrobat",
			"button_name": "has Combat Acrobat",
			"skillMod": "-1",
			"and_selector": [
				{
					"selector_type": "target_has_edge",
					"selector_value": "Combat Acrobat"
				},
				{
					"or_selector": [
						{
							"selector_type": "item_name",
							"selector_value": "Bolt"
						},
						{
							"selector_type": "skill",
							"selector_value": "Fighting"
						},
						{
							"selector_type": "skill",
							"selector_value": "Shooting"
						}
					]
				}
			],
			"group": "BRSW.Target",
			"defaultChecked": "on"
		},
		{
			"id": "DestroyUndead3d6",
			"name": "3d6 Damage",
			"button_name": "3d6 Damage",
			"dmgOverride": "3d6",
			"selector_type": "item_name",
			"selector_value": "Destroy Undead",
			"shotsUsed": "+1",
			"group": "Destroy Undead"
		},
		{
			id: "POWERGREATERBOOSTLOWERTRAIT",
			name: "Greater Boost/Lower Trait (+2)",
			button_name: "Greater (+2)",
			shotsUsed: "+2",
			and_selector: [
			  { selector_type: "item_type", selector_value: "power" },
			  { selector_type: "item_name", selector_value: "Boost/Lower Trait" }
			],
			group: "BRSW.PowerModifiersBoostLower"
		},
		{
			"id": "MARKSMAN",
			"name": "Marksman",
			"button_name": "has Marksman",
			"skillMod": "+1",
			"and_selector": [
				{
					"selector_type": "actor_has_edge",
					"selector_value": "Marksman"
				},
				{
					"or_selector": [
						{
							"selector_type": "skill",
							"selector_value": "Athletics"
						},
						{
							"selector_type": "skill",
							"selector_value": "Shooting"
						}
					]
				}
			],
			"group": "BRSW.Edges"
		},
		{
			id: "ATTSMALLOBJECT",
			name: "Attack Small Object",
			button_name: "Small",
			avoid_exploding_damage: "true",
			skillMod: -4,
			or_selector: [
			  { selector_type: "item_type", selector_value: "power" },
			  { selector_type: "item_type", selector_value: "weapon" },
			],
			group: "Attack Object",
			group_single: true
		},
		{
			id: "ATTTINYOBJECT",
			name: "Attack Tiny Object",
			button_name: "Tiny",
			avoid_exploding_damage: "true",
			skillMod: -6,
			or_selector: [
			  { selector_type: "item_type", selector_value: "power" },
			  { selector_type: "item_type", selector_value: "weapon" },
			],
			group: "Attack Object",
			group_single: true
		},
		{
			id: "ATTMEDIUMOBJECT",
			name: "Attack Medium Objct",
			button_name: "Medium",
			avoid_exploding_damage: "true",
			skillMod: -2,
			or_selector: [
			  { selector_type: "item_type", selector_value: "power" },
			  { selector_type: "item_type", selector_value: "weapon" },
			],
			group: "Attack Object",
			group_single: true
		},
		{
			id: "TRAITMODP1",
			name: "+1",
			button_name: "+1",
			skillMod: "+1",
			group: "Trait Modifiers (Generic)",
			or_selector: [
			  { selector_type: "item_type", selector_value: "power" },
			  { selector_type: "item_type", selector_value: "skill" },
			  { selector_type: "item_type", selector_value: "weapon" },
			]
		},
		{
			id: "TRAITMODP2",
			name: "+2",
			button_name: "+2",
			skillMod: "+2",
			group: "Trait Modifiers (Generic)",
			or_selector: [
			  { selector_type: "item_type", selector_value: "power" },
			  { selector_type: "item_type", selector_value: "skill" },
			  { selector_type: "item_type", selector_value: "weapon" },
			]
		}
		
	];

	if (game.modules.get("betterrolls-swade2")?.active) {
	  game.brsw.add_actions(BETTER_ROLLS_GLOBAL_ACTIONS);
	} else {
	  ui.notifications.error("Activate Better Rolls module for custom actions.");
	}  
});
