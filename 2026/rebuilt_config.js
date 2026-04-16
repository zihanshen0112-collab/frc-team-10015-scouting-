var config_data = `
{
  "dataFormat": "tsv",
  "title": "Scouting PASS 2026",
  "page_title": "REBUILT",
  "checkboxAs": "10",
  "prematch": [
    { "name": "Event",
      "code": "e",
      "type": "event",
      "defaultValue": "2026ONNOB",
      "required": "true"
    },
    { "name": "Scouter Name",
      "code": "s",
      "type": "scouter",
      "size": 15,
      "maxSize": 30,
      "required": "true"
    },
    { "name": "Match #",
      "code": "m",
      "type": "match",
      "min": 1,
      "max": 150,
      "required": "true"
    },
    { "name": "Match Type",
      "code": "l",
      "type": "level",
      "choices": {
        "qm": "Quals<br>",
        "sf": "Semifinals<br>",
        "f": "Finals"
      },
      "defaultValue": "qm",
      "required": "true"
    },
    { "name": "Driver Station Pos.",
      "code": "r",
      "type": "robot",
      "choices": {
        "r1": "Red-1",
        "b1": "Blue-1<br>",
        "r2": "Red-2",
        "b2": "Blue-2<br>",
        "r3": "Red-3",
        "b3": "Blue-3"
      },
      "required":"true"
    },
    { "name": "Team #",
      "code": "t",
      "type": "team",
      "min": 1,
      "max": 99999,
      "required": "true"
    }
  ],
  "auton": [
    { "name": "Have Working Auto?",
      "code": "auto_working",
      "type": "checkbox",
      "required": "true"
    },
    { "name": "Pickup from Depot",
      "code": "auto_depot",
      "type": "checkbox"
    },
    { "name": "Pickup from Outpost",
      "code": "auto_outpost",
      "type": "checkbox"
    },
    { "name": "Pickup from Neutral Zone",
      "code": "auto_neutral",
      "type": "checkbox"
    },
    { "name": "Shooting Cycle Number",
      "code": "auto_cycle_num",
      "type": "number",
      "min": 0,
      "max": 99,
      "defaultValue": 0
    },
    { "name": "Any comments",
      "code": "auto_comments",
      "type": "text",
      "size": 50,
      "maxSize": 250
    }
  ],
  "teleop": [
    { "name": "Times of Scoring",
      "code": "tc1",
      "type": "counter"
    },
    { "name": "ACTIVE passes from middle",
      "code": "tc2",
      "type": "counter"
    },
    { "name": "ACTIVE passes from far",
      "code": "tc3",
      "type": "counter"
    },
    { "name": "ACTIVE bump crosses",
      "code": "tc4",
      "type": "counter"
    },
    { "name": "ACTIVE trench crosses",
      "code": "tc5",
      "type": "counter"
    },
    { "name": "INACTIVE passes middle",
      "code": "tc6",
      "type": "counter"
    },
    { "name": "INACTIVE passes from far",
      "code": "tc7",
      "type": "counter"
    },
    { "name": "INACTIVE bump crosses",
      "code": "tc8",
      "type": "counter"
    },
    { "name": "INACTIVE trench crosses",
      "code": "tc9",
      "type": "counter"
    },
    { "name": "Number of cycles for Shift 1",
      "code": "cycles_shift1",
      "type": "counter"
    },
    { "name": "Number of cycles for Shift 2",
      "code": "cycles_shift2",
      "type": "counter"
    },
    { "name": "Number of cycles for Endgame",
      "code": "cycles_endgame",
      "type": "counter"
    }
  ],
  "postmatch": [
    { "name": "Vibes Power Index",
      "code": "vpi",
      "type": "number",
      "min": 1,
      "max": 100,
      "defaultValue": 50,
      "required": "true"
    },
    { "name": "Broke?",
      "code": "broke",
      "type": "checkbox",
      "required": "true"
    },
    { "name": "Accuracy?",
      "code": "accu",
      "type": "radio",
      "choices": {
        "0.0": "0",
        "0.2": "0.2",
        "0.4": "0.4",
        "0.6": "0.6",
        "0.8": "0.8",
        "1.0": "1"
      },
      "required": "true"
    },
    { "name": "Intake Quality",
      "code": "is",
      "type": "radio",
      "choices": {
        "Low": "Low<br>",
        "Average": "Average<br>",
        "High": "High"
      },
      "required": "true"
    },
    { "name": "SCORING LOCATION Hub?",
      "code": "huby",
      "type": "checkbox",
      "required": "true"
    },
    { "name": "SCORING LOCATION Tower?",
      "code": "tow",
      "type": "checkbox",
      "required": "true"
    },
    { "name": "SCORING LOCATION Far Corner?",
      "code": "cor",
      "type": "checkbox",
      "required": "true"
    },
    { "name": "SCORING LOCATION Trench?",
      "code": "tret",
      "type": "checkbox",
      "required": "true"
    },
    { "name": "SCORING LOCATION Other?",
      "code": "oth",
      "type": "checkbox",
      "required": "true"
    },
    { "name": "PLAYSTYLE Cleanup Bot?",
      "code": "clean",
      "type": "checkbox",
      "required": "true"
    },
    { "name": "PLAYSTYLE Passing Bot?",
      "code": "passing",
      "type": "checkbox",
      "required": "true"
    },
    { "name": "PLAYSTYLE Full Field Cycler?",
      "code": "fullfield",
      "type": "checkbox",
      "required": "true"
    },
    { "name": "PLAYSTYLE Defense?",
      "code": "defbot",
      "type": "checkbox",
      "required": "true"
    },
    { "name": "PLAYSTYLE  Other (describe in comments)?",
      "code": "otherpla",
      "type": "checkbox",
      "required": "true"
    },
    { "name": "Teleop Playstyle",
      "tooltip": "preferred intaking locations, preferred scoring locations, driving paths, etc.",
      "code": "wdt",
      "type": "text",
      "size": 50,
      "maxSize": 250,
      "required": "true"
    },
    { "name": "Reliability",
      "tooltip": "Describe what broke, nothing broke but looked shaky, very solid, etc.",
      "code": "rel",
      "type": "text",
      "size": 50,
      "maxSize": 250,
      "required": "true"
    },
    { "name": "Drive Quality",
      "tooltip": "Beached? Quality of Defense? Penalties?",
      "code": "drq",
      "type": "text",
      "size": 50,
      "maxSize": 250,
      "required": "true"
    },
    { "name": "Silly Comments",
      "code": "silly",
      "type": "text",
      "size": 50,
      "maxSize": 250,
      "required": "true"
    }
  ]
}`;