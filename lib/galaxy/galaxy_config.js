"use strict";

var galaxy = 

{
	"randomSeed":123456789,
	"starCount":2000,
	"dimensions": {
		"x":1000,
		"y":1000,
		"z":0,
	},
	"coreSize":100,

	"spirals":{
		"count":3,
		"openingRate":2.5,
		"arcLength":2.0,
	},

	"stars": {
		"classes":{
			"o":{
				"chance": 0.0000003,
				"mass": {"min":16.0, "max":16.0},
				"color": "#9BB0FF",
			},
			"b":{
				"chance": 0.0013,
				"mass": {"min":2.1, "max":16.0},
				"color": "#AABFFF",
			},
			"a":{
				"chance": 0.006,
				"mass": {"min":1.4, "max":2.1},
				"color": "#CAD7FF",
			},
			"f":{
				"chance": 0.03,
				"mass": {"min":1.04, "max":1.4},
				"color": "#F8F7FF",
			},
			"g":{
				"chance": 0.076,
				"mass": {"min":0.8, "max":1.04},
				"color": "#FFF4EA",
			},
			"k":{
				"chance": 0.121,
				"mass": {"min":0.45, "max":0.8},
				"color": "#FFD2A1",
			},
			"m":{
				"chance": 0.7645,
				"mass": {"min":0.08, "max":0.45},
				"color": "#FFCC6F",
			},
		},
	},

	"resources": {
		"classes":{
			"fuel": {
				"name": "Fuels",
			},
			"organics": {
				"name": "Organics",
			},
			"equipment": {
				"name": "Production Materials",
			},
		},
		"types":{
			"helium":{
				"name": "Helium",
				"class": "fuel",
			},
			"hydrogen":{
				"name": "Hydrogen",
				"class": "fuel",
			},
			"uranium":{
				"name": "Uranium",
				"class": "fuel",
			},
			"plutonium":{
				"name": "Plutonium",
				"class": "fuel",
			},
			"oxygen":{
				"name": "Oxygen",
				"class": "organics",
			},
			"water":{
				"name": "Water",
				"class": "organics",
			},
			"animals":{
				"name": "Live Stock",
				"class": "organics",
			},
			"plants":{
				"name": "Fruits and Vegtables",
				"class": "organics",
			},
			"silicon":{
				"name": "Silicon",
				"class": "equipment",
			},
			"iron":{
				"name": "Iron",
				"class": "equipment",
			},
			"titanium":{
				"name": "Titanium",
				"class": "equipment",
			},
		},
	},

	"planets": {
		"count": {"min":2, "max":15},
		"classes":{
			"h":{
				"name": "Volcanic",
				"orbitalRange": {"min":0.2, "max":0.4},
				"sizeRange": {"min":0.5, "max":10.0},
				"resources": {
					"iron": {"min":10, "max":100},
					"uranium": {"min":10, "max":100},
				},
			},
			"k":{
				"name": "Desert",
				"orbitalRange": {"min":0.4, "max":0.8},
				"sizeRange": {"min":0.5, "max":10.0},
				"resources": {
					"silicon": {"min":10, "max":100},
				},
			},
			"m":{
				"name": "Terran",
				"orbitalRange": {"min":0.8, "max":2.0},
				"sizeRange": {"min":0.8, "max":5.0},
				"resources": {
					"water": {"min":10, "max":100},
					"oxygen": {"min":10, "max":100},
					"animals": {"min":10, "max":100},
					"plants": {"min":10, "max":100},
				},
			},
			"o":{
				"name": "Oceanic",
				"orbitalRange": {"min":0.8, "max":1.5},
				"sizeRange": {"min":0.8, "max":5.0},
				"resources": {
					"water": {"min":10, "max":100},
					"oxygen": {"min":10, "max":100},
				},
			},
			"l":{
				"name": "Mountain",
				"orbitalRange": {"min":2.0, "max":10.0},
				"sizeRange": {"min":0.5, "max":10},
				"resources": {
					"iron": {"min":10, "max":100},
					"uranium": {"min":10, "max":100},
					"silicon": {"min":10, "max":100},
				},
			},
			"u":{
				"name": "Gas Giant",
				"orbitalRange": {"min":10.0, "max":30.0},
				"sizeRange": {"min":10.0, "max":1000.0},
				"resources": {
					"helium": {"min":10, "max":100},
					"hydrogen": {"min":10, "max":100},
				},
			},
			"c":{
				"name": "Glacial",
				"orbitalRange": {"min":20.0, "max":35.0},
				"sizeRange": {"min":0.5, "max":5},
			},
		}
	}

};

exports.galaxy = galaxy;