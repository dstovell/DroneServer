"use strict";

var config = 

{
	"attribs": {
		"ftlSpeed": {"name":"FTL Speed", "type":"float", "units":"lightyear", "per":"hour"},
		"slSpeed": {"name":"FTL Speed", "type":"float", "units":"au", "per":"hour"},
		"hull": {"name":"Hull Armour", "type":"float", "default":1.0},
		"shield": {"name":"Shields", "type":"float"},
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
			"attribs": {
				"ftlSpeed":30.0,
			}
		},
		"shield1": {
			"attribs": {
				"shield":10.0,
			}
		},
		"armour1": {
			"attribs": {
				"hull":10.0,
			}
		}
	},
};

exports.config = config;
