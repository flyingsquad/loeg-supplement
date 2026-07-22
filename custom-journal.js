/* CUSTOMIZE
 * Add any extra themes here: just copy-paste the whole block, changing only the class
 * name for the theme's name that will appear in the drop-down, and the name in single
 * quotes (here, dark-slate-journal) with whatever name you gave your theme in the .css
 * file
 */
 
class TalamascaJournal extends foundry.appv1.sheets.JournalSheet {
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push('talamasca-journal');
		return options;
	}
}

class LoEGJournal extends foundry.appv1.sheets.JournalSheet {
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push('loeg-journal');
		return options;
	}
}

class NebenweltJournal extends foundry.appv1.sheets.JournalSheet {
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push('nebenwelt-journal');
		return options;
	}
}


Hooks.on("init", (documentTypes) => {

console.log("Custom Journals | Registering the module's sheets.");

foundry.documents.collections.Journal.registerSheet("journals", TalamascaJournal, {
	label: "Talamasca",
	types: ["base"],
	makeDefault: false
});

foundry.documents.collections.Journal.registerSheet("journals", LoEGJournal, {
	label: "LoEG",
	types: ["base"],
	makeDefault: false
});

foundry.documents.collections.Journal.registerSheet("journals", NebenweltJournal, {
	label: "Nebenwelt",
	types: ["base"],
	makeDefault: false
});

console.log("Custom Journals | Ready.")
});