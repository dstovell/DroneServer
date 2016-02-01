"use strict";

var config = 

{
	"attribs": {
		"ftlSpeed": {"name":"FTL Speed", "type":"float", "units":"lightyear", "per":"hour"},
		"slSpeed": {"name":"FTL Speed", "type":"float", "units":"au", "per":"hour"},
		"hull": {"name":"Hull Armour", "type":"float", "default":1.0},
		"shield": {"name":"Shields", "type":"float"},
		"slots": {"name":"Module Capacity", "type":"int"},
	},

	"assets": {
		"dsp":{
			"attribs": {
				"slSpeed":30.0,
			},
		},
	},

	"mods": {
		"ftlDrive1": {
			"name": "Dark Matter Drive - Level 1",
			"slotSize":1,
			"attribs": {
				"ftlSpeed":30.0,
			}
		},
		"shield1": {
			"name": "Shield - Level 1",
			"slotSize":1,
			"attribs": {
				"shield":10.0,
			}
		},
		"armour1": {
			"name": "Armour - Level 1",
			"slotSize":1,
			"attribs": {
				"hull":10.0,
			}
		},
		"cargoHold": {
			"name": "Extended CargoHold",
			"slotSize":0,
			"attribs": {
				"slots":3,
			}
		}
	},
};

exports.config = config;
