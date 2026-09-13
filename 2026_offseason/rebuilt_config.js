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
      "required": "true"
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
    { "name": "Auto start position",
      "code": "as",
      "type": "radio",
      "choices": {
        "Depot": "Depot<br>",
        "Middle": "Middle<br>",
        "Outpost": "Outpost"
      },
      "required": "true"
    },
    { "name": "Follow auto?",
      "code": "follow_auto",
      "type": "checkbox",
      "required": "true"
    },
    { "name": "Auto swipes",
      "tooltip": "Depot and outpost don't count",
      "code": "auto_swipes",
      "type": "counter"
    },
    { "name": "End auto in the middle?",
      "code": "end_middle",
      "type": "checkbox",
      "required": "true"
    }
  ],
  "postmatch": [
    { "name": "Scoring Volume (balls per second)",
      "code": "score_vol",
      "type": "radio",
      "choices": {
        "0-4": "0-4 (I can count the balls)<br>",
        "5-7": "5-7 (Consistent but not overwhelming single turret or typical double shooter)<br>",
        "8-11": "8-11 (Fast and consistent single turret or typical triple shooter)<br>",
        "12-15": "12-15 (slow drum or extremely fast single stream)<br>",
        "16+": "16+ (efficient drum)"
      },
      "required": "true"
    },
    { "name": "Accuracy",
      "code": "accu",
      "type": "radio",
      "choices": {
        "0-50%": "0-50%<br>",
        "51-70%": "51-70%<br>",
        "71-90%": "71-90%<br>",
        "91%+": "91%+"
      },
      "required": "true"
    },
    { "name": "Robot broke?",
      "code": "broke",
      "type": "checkbox",
      "required": "true"
    },
    { "name": "Bump?",
      "code": "bump",
      "type": "checkbox",
      "required": "true"
    },
    { "name": "Trench?",
      "code": "trench",
      "type": "checkbox",
      "required": "true"
    },
    { "name": "Vibes Power Index",
      "code": "vpi",
      "type": "number",
      "min": 1,
      "max": 100,
      "defaultValue": 50,
      "required": "true"
    },
    { "name": "Shooting positions",
      "tooltip": "Where did they shoot from? Did they only shoot from one area? Do they have a preferred area or a safe space when they get defended?",
      "code": "shoot_pos",
      "type": "text",
      "size": 50,
      "maxSize": 250,
      "required": "true"
    },
    { "name": "Playstyle",
      "tooltip": "Did they clean up, full field cycle, pass, defend, steal, or some combination of them all?",
      "code": "playstyle",
      "type": "text",
      "size": 50,
      "maxSize": 250,
      "required": "true"
    },
    { "name": "Driver quality",
      "tooltip": "Look for decisiveness, driving into empty areas with an empty hopper, defense quality and driving under defense.",
      "code": "driver_quality",
      "type": "text",
      "size": 50,
      "maxSize": 250,
      "required": "true"
    },
    { "name": "Other comments",
      "code": "other_comments",
      "type": "text",
      "size": 50,
      "maxSize": 250,
      "required": "true"
    }
  ]
}`;