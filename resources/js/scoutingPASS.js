// ScoutingPASS.js
//
// The guts of the ScountingPASS application
// Written by Team 2451 - PWNAGE
var skipValidation = false;
document.addEventListener("touchstart", startTouch, false);
document.addEventListener("touchend", moveTouch, false);

// Swipe Up / Down / Left / Right
var initialX = null;
var xThreshold = 0.3;
var slide = 0;
var enableGoogleSheets = false;
var pitScouting = false;
var checkboxAs = 'YN';
var ColWidth = '200px';

// Options
var options = {
  correctLevel: QRCode.CorrectLevel.L,
  quietZone: 15,
  quietZoneColor: '#FFFFFF'
};

// The team prompts the data source configuration
// Replace the GOOGLE_SHEETS_CSV_URL below with the CSV link you actually published
var TEAM_HINTS_URL_GOOGLE = 
"https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5XR3XlWu4oScOnxO7h8dx_0vcVw4Q7mBNHfYspO5eeOkEL1sExhcN11vi1J5nRJnzX20iC2XeixOL/pub?output=csv";
var TEAM_HINTS_URL_LOCAL = "team_hints.json";  // Local backup JSON file

// Data source selection: 'google' or 'local'. If Google cannot access the site, you can manually change it to 'local'.
var TEAM_HINTS_SOURCE = 'local';  // local is used by default

// The team prompts for data storage
var teamHints = {};
var teamHintsLoaded = false;

// Built from the JSON
var requiredFields = []; //["e", "m", "l", "r", "s", "as"];
// Shift rotation configuration
var shiftConfig = { period: null, states: [] };
var shiftLoaded = false;

function loadShiftSchedule() {
    fetch("shift_schedule.json")
        .then(response => {
            if (!response.ok) throw new Error("HTTP " + response.status);
            return response.json();
        })
        .then(data => {
            shiftConfig = { period: data.period || 6, states: data.states || [] };
            shiftLoaded = true;
            updateShiftHint();
            console.log("The shift scheduling configuration has been loaded successfully", shiftConfig);
        })
        .catch(err => {
            console.error("Failed to load the shift scheduling configuration", err);
            shiftConfig = { period: 6, states: ["The shift schedule failed to load. Please ask the Stand Manager"] };
            shiftLoaded = true;
            updateShiftHint();
        });
}

function getShiftIndex(matchNum) {
    if (!shiftConfig.period || shiftConfig.states.length === 0) return -1;
    var cycleIndex = Math.floor((matchNum - 1) / shiftConfig.period);
    return cycleIndex % shiftConfig.states.length;
}

function updateShiftHint() {
    var matchInput = document.getElementById("input_m");
    if (!matchInput) return;
    var matchNum = parseInt(matchInput.value.trim());
    var hintText = "";
    if (isNaN(matchNum) || matchNum < 1) {
        hintText = "Please enter a valid session number";
    } else if (!shiftLoaded) {
        hintText = "The shift schedule is loading...";
    } else {
        var idx = getShiftIndex(matchNum);
        if (idx >= 0 && idx < shiftConfig.states.length) {
            hintText = shiftConfig.states[idx];
        } else {
            hintText = "The shift scheduling configuration is incorrect.";
        }
    }
    var hintCell = document.getElementById("shift-hint");
    if (hintCell) {
        hintCell.style.backgroundColor = "black";
        hintCell.style.color = "white";
        hintCell.style.fontWeight = "normal";
        hintCell.innerHTML = "Shift scheduling:" + hintText.replace(/\n/g, "<br>");
    }
}

function addTimer(table, idx, name, data) {
  var row = table.insertRow(idx);
  var cell1 = row.insertCell(0);
  cell1.setAttribute("colspan", 2);
  cell1.setAttribute("style", "text-align: center;");
  cell1.classList.add("title");
  if (!data.hasOwnProperty('code')) {
    cell1.innerHTML = `Error: No code specified for ${name}`;
    return idx + 1;
  }
  cell1.innerHTML = name;
  if (data.hasOwnProperty('tooltip')) {
    cell1.setAttribute("title", data.tooltip);
  }

  idx += 1
  row = table.insertRow(idx);
  cell = row.insertCell(0);
  cell.setAttribute("colspan", 2);
  cell.setAttribute("style", "text-align: center;");

  if (data.type == 'cycle') {
    var ct = document.createElement('input');
    ct.setAttribute("type", "hidden");
    ct.setAttribute("id", "cycletime_" + data.code);
    if (enableGoogleSheets && data.hasOwnProperty('gsCol')) {
      ct.setAttribute("name", data.gsCol);
    } else {
      ct.setAttribute("name", data.code);
    }
    ct.setAttribute("value", "[]");
    cell.appendChild(ct);
    ct = document.createElement('input');
    ct.setAttribute("type", "text");
    ct.setAttribute("id", "display_" + data.code);
    ct.setAttribute("value", "");
    ct.setAttribute("disabled", "");
    cell.appendChild(ct);
    var lineBreak = document.createElement("br");
    cell.appendChild(lineBreak);
  }
  var button1 = document.createElement("input");
  button1.setAttribute("id", "start_" + data.code);
  button1.setAttribute("type", "button");
  button1.setAttribute("onclick", "timer(this.parentElement)");
  button1.setAttribute("value", "Start");
  cell.appendChild(button1);

  var inp = document.createElement("input");
  if (data.type == 'timer') {
    inp.classList.add("timer");
  } else {
    inp.classList.add("cycle");
  }
  inp.setAttribute("id", "input_" + data.code);
  inp.setAttribute("type", "text");
  if (data.type != 'cycle') {
    if (enableGoogleSheets && data.hasOwnProperty('gsCol')) {
      inp.setAttribute("name", data.gsCol);
    } else {
      inp.setAttribute("name", data.code);
    }
  }
  inp.setAttribute("style", "background-color: black; color: white;border: none; text-align: center;");
  inp.setAttribute("disabled", "");
  inp.setAttribute("value", 0);
  inp.setAttribute("size", 7);
  inp.setAttribute("maxLength", 7);
  cell.appendChild(inp);

  var button2 = document.createElement("input");
  button2.setAttribute("id", "clear_" + data.code);
  button2.setAttribute("type", "button");
  button2.setAttribute("onclick", "resetTimer(this.parentElement)");
  button2.setAttribute("value", "Reset");
  cell.appendChild(button2);
  var lineBreak = document.createElement("br");
  cell.appendChild(lineBreak);

  if (data.type == 'cycle') {
    var button3 = document.createElement("input");
    button3.setAttribute("id", "cycle_" + data.code);
    button3.setAttribute("type", "button");
    button3.setAttribute("onclick", "newCycle(this.parentElement)");
    button3.setAttribute("value", "New Cycle");
    cell.appendChild(button3);
    var button4 = document.createElement("input");
    button4.setAttribute("id", "undo_" + data.code);
    button4.setAttribute("type", "button");
    button4.setAttribute("onclick", "undoCycle(this.parentElement)");
    button4.setAttribute("value", "Undo");
    button4.setAttribute('style', "margin-left: 20px;");
    cell.appendChild(button4);
  }

  idx += 1
  row = table.insertRow(idx);
  row.setAttribute("style", "display:none");
  cell = row.insertCell(0);
  cell.setAttribute("colspan", 2);
  cell.setAttribute("style", "text-align: center;");
  var inp = document.createElement('input');
  inp.setAttribute("type", "hidden");
  inp.setAttribute("id", "status_" + data.code);
  inp.setAttribute("value", "stopped");
  cell.appendChild(inp);
  inp = document.createElement('input');
  inp.setAttribute("hidden", "");
  inp.setAttribute("id", "intervalId_" + data.code);
  inp.setAttribute("value", "");
  cell.appendChild(inp);

  if (data.hasOwnProperty('defaultValue')) {
    var def = document.createElement("input");
    def.setAttribute("id", "default_" + data.code)
    def.setAttribute("type", "hidden");
    def.setAttribute("value", data.defaultValue);
    cell2.appendChild(def);
  }

  return idx + 1;
}

function goToSlide(targetIndex) {
  var holder = document.getElementById("main-panel-holder");
  if (!holder) return;

  var slides = holder.children;
  if (targetIndex < 0 || targetIndex >= slides.length) return;

  // hide current slide
  slides[slide].style.display = "none";

  // set new slide index
  slide = targetIndex;

  // show new slide
  window.scrollTo(0, 0);
  slides[slide].style.display = "table";

  // reset data display on QR page
  var dataDiv = document.getElementById("data");
  if (dataDiv) dataDiv.innerHTML = "";
  var copyBtn = document.getElementById("copyButton");
  if (copyBtn) copyBtn.setAttribute("value", "Copy Data");
}

function addCounter(table, idx, name, data) {
  var row = table.insertRow(idx);
  var cell1 = row.insertCell(0);
  cell1.style.width = ColWidth;
  cell1.classList.add("title");
  if (!data.hasOwnProperty('code')) {
    cell1.innerHTML = `Error: No code specified for ${name}`;
    return idx + 1;
  }
  var cell2 = row.insertCell(1);
  cell2.style.width = ColWidth;
  cell1.innerHTML = name + '&nbsp;';
  if (data.hasOwnProperty('tooltip')) {
    cell1.setAttribute("title", data.tooltip);
  }
  cell2.classList.add("field");

  var button1 = document.createElement("input");
  button1.setAttribute("type", "button");
  button1.setAttribute("id", "minus_" + data.code);
  button1.setAttribute("onclick", "counter(this.parentElement, -1)");
  button1.setAttribute("value", "-");
  cell2.appendChild(button1);

  var inp = document.createElement("input");
  inp.classList.add("counter");
  inp.setAttribute("id", "input_" + data.code);
  inp.setAttribute("type", "text");
  if (enableGoogleSheets && data.hasOwnProperty('gsCol')) {
    inp.setAttribute("name", data.gsCol);
  } else {
    inp.setAttribute("name", data.code);
  }
  inp.setAttribute("style", "background-color: black; color: white;border: none; text-align: center;");
  inp.setAttribute("disabled", "");
  inp.setAttribute("value", 0);
  inp.setAttribute("size", 2);
  inp.setAttribute("maxLength", 2);
  cell2.appendChild(inp);

  var button2 = document.createElement("input");
  button2.setAttribute("type", "button");
  button2.setAttribute("id", "plus_" + data.code);
  button2.setAttribute("onclick", "counter(this.parentElement, 1)");
  button2.setAttribute("value", "+");
  cell2.appendChild(button2);

  if (data.hasOwnProperty('cycleTimer')) {
    if (data.cycleTimer != "") {
      inp = document.createElement('input');
      inp.setAttribute("hidden", "");
      inp.setAttribute("id", "cycleTimer_" + data.code);
      inp.setAttribute("value", data.cycleTimer);
      cell.appendChild(inp);
    }
  }

  if (data.hasOwnProperty('defaultValue')) {
    var def = document.createElement("input");
    def.setAttribute("id", "default_" + data.code)
    def.setAttribute("type", "hidden");
    def.setAttribute("value", data.defaultValue);
    cell2.appendChild(def);
  }

  return idx + 1;
}

function addClickableImage(table, idx, name, data) {
  var row = table.insertRow(idx);
  var cell = row.insertCell(0);
  cell.setAttribute("colspan", 2);
  cell.setAttribute("style", "text-align: center;");
  cell.classList.add("title");
  if (!data.hasOwnProperty('code')) {
    cell1.innerHTML = `Error: No code specified for ${name}`;
    return idx + 1;
  }
  cell.innerHTML = name;
  if (data.hasOwnProperty('tooltip')) {
    cell.setAttribute("title", data.tooltip);
  }

  let showFlip = true;
  if (data.hasOwnProperty('showFlip')) {
    if (data.showFlip.toLowerCase() == 'false') {
      showFlip = false;
    }
  }

  let showUndo = true;
  if (data.hasOwnProperty('showUndo')) {
    if (data.showUndo.toLowerCase() == 'false') {
      showUndo = false;
    }
  }

  if (showFlip || showUndo) {
    idx += 1
    row = table.insertRow(idx);
    cell = row.insertCell(0);
    cell.setAttribute("colspan", 2);
    cell.setAttribute("style", "text-align: center;");

    if (showUndo) {
      // Undo button
      let undoButton = document.createElement("input");
      undoButton.setAttribute("type", "button");
      undoButton.setAttribute("onclick", "undo(this.parentElement)");
      undoButton.setAttribute("value", "Undo");
      undoButton.setAttribute("id", "undo_" + data.code);
      undoButton.setAttribute("class", "undoButton");
      cell.appendChild(undoButton);
    }

    if (showFlip) {
      // Flip button
      let flipButton = document.createElement("input");
      flipButton.setAttribute("type", "button");
      flipButton.setAttribute("onclick", "flip(this.parentElement)");
      flipButton.setAttribute("value", "Flip Image");
      flipButton.setAttribute("id", "flip_" + data.code);
      flipButton.setAttribute("class", "flipButton");
      if (showUndo) {
        flipButton.setAttribute("margin-left", '8px');
      }
      cell.appendChild(flipButton);
    }
  }

  idx += 1;
  row = table.insertRow(idx);
  cell = row.insertCell(0);
  cell.setAttribute("colspan", 2);
  cell.setAttribute("style", "text-align: center;");
  var canvas = document.createElement('canvas');
  //canvas.onclick = onFieldClick;
  canvas.setAttribute("onclick", "onFieldClick(event)");
  canvas.setAttribute("class", "field-image-src");
  canvas.setAttribute("id", "canvas_" + data.code);
  canvas.innerHTML = "No canvas support";
  cell.appendChild(canvas);

  idx += 1;
  row = table.insertRow(idx);
  row.setAttribute("style", "display:none");
  cell = row.insertCell(0);
  cell.setAttribute("colspan", 2);
  var inp = document.createElement('input');
  inp.setAttribute("type", "hidden");
  inp.setAttribute("id", "XY_" + data.code);
  inp.setAttribute("value", "[]");
  cell.appendChild(inp);
  inp = document.createElement('input');
  inp.setAttribute("hidden", "");
  if (enableGoogleSheets && data.hasOwnProperty('gsCol')) {
    inp.setAttribute("name", data.gsCol);
  } else {
    inp.setAttribute("name", data.code);
  }
  inp.setAttribute("id", "input_" + data.code);
  inp.setAttribute("value", "[]");
  inp.setAttribute("class", "clickableImage");

  cell.appendChild(inp);

  // TODO: Make these more efficient/elegant
  inp = document.createElement('input');
  inp.setAttribute("hidden", "");
  inp.setAttribute("id", "clickRestriction_" + data.code);
  inp.setAttribute("value", "none");
  if (data.hasOwnProperty('clickRestriction')) {
    if ((data.clickRestriction == "one") ||
      (data.clickRestriction == "onePerBox")) {
      inp.setAttribute("value", data.clickRestriction);
    }
  }
  cell.appendChild(inp);

  inp = document.createElement('input');
  inp.setAttribute("hidden", "");
  inp.setAttribute("id", "allowableResponses_" + data.code);
  inp.setAttribute("value", "none");
  if (data.hasOwnProperty('allowableResponses')) {
    let responses = data.allowableResponses.split(' ').map(Number)
    inp.setAttribute("value", responses);
  }
  cell.appendChild(inp);

  inp = document.createElement('input');
  inp.setAttribute("hidden", "");
  inp.setAttribute("id", "dimensions_" + data.code);
  inp.setAttribute("value", "12 6");
  if (data.hasOwnProperty('dimensions')) {
    if (data.dimensions != "") {
      // TODO: Add validation for "X Y" format
      inp.setAttribute("value", data.dimensions);
    }
  }
  cell.appendChild(inp);

  inp = document.createElement('input');
  inp.setAttribute("hidden", "");
  inp.setAttribute("id", "shape_" + data.code);
  // Default shape: white circle of size 5 not filled in
  inp.setAttribute("value", "circle 5 white white true");
  if (data.hasOwnProperty('shape')) {
    if (data.shape != "") {
      // TODO: Add validation for "shape size color fill" format
      inp.setAttribute("value", data.shape);
    }
  }
  cell.appendChild(inp);

  inp = document.createElement('input');
  inp.setAttribute("hidden", "");
  inp.setAttribute("id", "toggleClick_" + data.code);
  inp.setAttribute("value", "false");
  if (data.hasOwnProperty('toggleClick')) {
    if (data.toggleClick != "") {
      // TODO: Add validation for true/false format
      inp.setAttribute("value", data.toggleClick);
    }
  }
  cell.appendChild(inp);

  if (data.hasOwnProperty('cycleTimer')) {
    if (data.cycleTimer != "") {
      inp = document.createElement('input');
      inp.setAttribute("hidden", "");
      inp.setAttribute("id", "cycleTimer_" + data.code);
      inp.setAttribute("value", data.cycleTimer);
      cell.appendChild(inp);
    }
  }

  idx += 1
  row = table.insertRow(idx);
  row.setAttribute("style", "display:none");
  cell = row.insertCell(0);
  cell.setAttribute("colspan", 2);
  var img = document.createElement('img');
  img.src = data.filename;
  img.setAttribute("id", "img_" + data.code);
  img.setAttribute("class", "field-image-src");
  img.setAttribute("onload", "drawFields()");
  img.setAttribute("hidden", "");
  cell.appendChild(img);

  return idx + 1
}

function addText(table, idx, name, data) {
  var row = table.insertRow(idx);
  var cell1 = row.insertCell(0);
  cell1.style.width = ColWidth;
  cell1.classList.add("title");
  if (!data.hasOwnProperty('code')) {
    cell1.innerHTML = `Error: No code specified for ${name}`;
    return idx + 1;
  }
  var cell2 = row.insertCell(1);
  cell2.style.width = ColWidth;
  cell1.innerHTML = name + '&nbsp;';
  if (data.hasOwnProperty('tooltip')) {
    cell1.setAttribute("title", data.tooltip);
  }
  cell2.classList.add("field");
  var inp = document.createElement("input");
  inp.setAttribute("id", "input_" + data.code);
  inp.setAttribute("type", "text");
  if (enableGoogleSheets && data.hasOwnProperty('gsCol')) {
    inp.setAttribute("name", data.gsCol);
  } else {
    inp.setAttribute("name", data.code);
  }
  if (data.hasOwnProperty('size')) {
    inp.setAttribute("size", data.size);
  }
  if (data.hasOwnProperty('maxSize')) {
    inp.setAttribute("maxLength", data.maxSize);
  }
  if (data.hasOwnProperty('defaultValue')) {
    if (data.type == 'event') {
      data.defaultValue = data.defaultValue.toLowerCase();
    }
    inp.setAttribute("value", data.defaultValue);
  }
  if (data.hasOwnProperty('required')) {
    inp.setAttribute("required", "");
  }
  if (data.hasOwnProperty('disabled')) {
    inp.setAttribute("disabled", "");
  }
  cell2.appendChild(inp);

  if (data.hasOwnProperty('defaultValue')) {
    var def = document.createElement("input");
    def.setAttribute("id", "default_" + data.code)
    def.setAttribute("type", "hidden");
    def.setAttribute("value", data.defaultValue);
    cell2.appendChild(def);
  }

  return idx + 1
}

function addNumber(table, idx, name, data) {
  var row = table.insertRow(idx);
  var cell1 = row.insertCell(0);
  cell1.style.width = ColWidth;
  cell1.classList.add("title");
  if (!data.hasOwnProperty('code')) {
    cell1.innerHTML = `Error: No code specified for ${name}`;
    return idx + 1;
  }
  var cell2 = row.insertCell(1);
  cell2.style.width = ColWidth;
  cell1.innerHTML = name + '&nbsp;';
  if (data.hasOwnProperty('tooltip')) {
    cell1.setAttribute("title", data.tooltip);
  }
  cell2.classList.add("field");
  var inp = document.createElement("input");
  inp.setAttribute("id", "input_" + data.code);
  inp.setAttribute("type", "number");
  if (enableGoogleSheets && data.hasOwnProperty('gsCol')) {
    inp.setAttribute("name", data.gsCol);
  } else {
    inp.setAttribute("name", data.code);
  }
  if ((data.type == 'team') ||
    (data.type == 'match')) {
    inp.setAttribute("onchange", "updateMatchStart(event)");
  }
  if (data.hasOwnProperty('min')) {
    inp.setAttribute("min", data.min);
  }
  if (data.hasOwnProperty('max')) {
    inp.setAttribute("max", data.max);
  }
  if (data.hasOwnProperty('defaultValue')) {
    inp.setAttribute("value", data.defaultValue);
  }
  if (data.hasOwnProperty('disabled')) {
    inp.setAttribute("disabled", "");
  }
  if (data.hasOwnProperty('required')) {
    inp.setAttribute("required", "");
  }
  cell2.appendChild(inp);

  if (data.hasOwnProperty('defaultValue')) {
    var def = document.createElement("input");
    def.setAttribute("id", "default_" + data.code)
    def.setAttribute("type", "hidden");
    def.setAttribute("value", data.defaultValue);
    cell2.appendChild(def);
  }

  if (data.type == 'team') {
    idx += 1
    row = table.insertRow(idx);
    cell1 = row.insertCell(0);
    cell1.setAttribute("id", "teamname-label");
    cell1.setAttribute("colspan", 2);
    cell1.setAttribute("style", "text-align: center;");
  }

  return idx + 1;
}

function addRadio(table, idx, name, data) {
  var row = table.insertRow(idx);
  var cell1 = row.insertCell(0);
  cell1.style.width = ColWidth;
  cell1.classList.add("title");
  if (!data.hasOwnProperty('code')) {
    cell1.innerHTML = `Error: No code specified for ${name}`;
    return idx + 1;
  }
  var cell2 = row.insertCell(1);
  cell2.style.width = ColWidth;
  cell1.innerHTML = name + '&nbsp;';
  if (data.hasOwnProperty('tooltip')) {
    cell1.setAttribute("title", data.tooltip);
  }
  cell2.classList.add("field");
  if ((data.type == 'level') ||
    (data.type == 'robot')
  ) {
    cell2.setAttribute("onchange", "updateMatchStart(event)");
  }
  var checked = null
  if (data.hasOwnProperty('defaultValue')) {
    checked = data.defaultValue;
  }
  if (data.hasOwnProperty('choices')) {
    keys = Object.keys(data.choices);
    keys.forEach(c => {
      var inp = document.createElement("input");
      inp.setAttribute("id", "input_" + data.code + "_" + c);
      inp.setAttribute("type", "radio");
      if (enableGoogleSheets && data.hasOwnProperty('gsCol')) {
        inp.setAttribute("name", data.gsCol);
      } else {
        inp.setAttribute("name", data.code);
      }
      inp.setAttribute("value", c);
      if (checked == c) {
        inp.setAttribute("checked", "");
      }
      cell2.appendChild(inp);
      cell2.innerHTML += data.choices[c];
    });
  }
  var inp = document.createElement("input");
  inp.setAttribute("id", "display_" + data.code);
  inp.setAttribute("hidden", "");
  inp.setAttribute("value", "");
  cell2.appendChild(inp);

  if (data.hasOwnProperty('defaultValue')) {
    var def = document.createElement("input");
    def.setAttribute("id", "default_" + data.code)
    def.setAttribute("type", "hidden");
    def.setAttribute("value", data.defaultValue);
    cell2.appendChild(def);
  }

  return idx + 1;
}

function addCheckbox(table, idx, name, data) {
  var row = table.insertRow(idx);
  var cell1 = row.insertCell(0);
  cell1.style.width = ColWidth;
  cell1.classList.add("title");
  if (!data.hasOwnProperty('code')) {
    cell1.innerHTML = `Error: No code specified for ${name}`;
    return idx + 1;
  }
  var cell2 = row.insertCell(1);
  cell1.innerHTML = name + '&nbsp;';
  cell2.style.width = ColWidth;
  if (data.hasOwnProperty('tooltip')) {
    cell1.setAttribute("title", data.tooltip);
  }
  cell2.classList.add("field");
  var inp = document.createElement("input");
  inp.setAttribute("id", "input_" + data.code);
  inp.setAttribute("type", "checkbox");
  if (enableGoogleSheets && data.hasOwnProperty('gsCol')) {
    inp.setAttribute("name", data.gsCol);
  } else {
    inp.setAttribute("name", data.code);
  }
  cell2.appendChild(inp);

  if (data.type == 'bool') {
    cell2.innerHTML += "(checked = Yes)";
  }

  if (data.hasOwnProperty('defaultValue')) {
    var def = document.createElement("input");
    def.setAttribute("id", "default_" + data.code)
    def.setAttribute("type", "hidden");
    def.setAttribute("value", data.defaultValue);
    cell2.appendChild(def);
  }

  return idx + 1;
}

function addElement(table, idx, data) {
  var type = null;
  var name = 'Default Name';
  if (data.hasOwnProperty('name')) {
    name = data.name
  }
  if (data.hasOwnProperty('type')) {
    type = data.type
  } else {
    console.log("No type specified");
    console.log("Data: ")
    console.log(data);
    err = { code: "err", defaultValue: "No type specified: " + data };
    idx = addText(table, idx, name, err);
    return
  }
  if (type == 'counter') {
    idx = addCounter(table, idx, name, data);
  } else if ((data.type == 'scouter') ||
    (data.type == 'event') ||
    (data.type == 'text')
  ) {
    idx = addText(table, idx, name, data);
  } else if ((data.type == 'level') ||
    (data.type == 'radio') ||
    (data.type == 'robot')
  ) {
    idx = addRadio(table, idx, name, data);
  } else if ((data.type == 'match') ||
    (data.type == 'team') ||
    (data.type == 'number')
  ) {
    idx = addNumber(table, idx, name, data);
  } else if ((data.type == 'field_image') ||
    (data.type == 'clickable_image')) {
    idx = addClickableImage(table, idx, name, data);
  } else if ((data.type == 'bool') ||
    (data.type == 'checkbox') ||
    (data.type == 'pass_fail')
  ) {
    idx = addCheckbox(table, idx, name, data);
  } else if (data.type == 'counter') {
    idx = addCounter(table, idx, name, data);
  } else if ((data.type == 'timer') ||
    (data.type == 'cycle')) {
    idx = addTimer(table, idx, name, data);
  } else {
    console.log(`Unrecognized type: ${data.type}`);
  }
  return idx
}

function buildRequiredElementList(element) {
	if (element.required == "true") {
		requiredFields.push(element.code);
	}
}

function configure() {
  try {
    var mydata = JSON.parse(config_data);
  } catch (err) {
    console.log(`Error parsing configuration file`)
    console.log(err.message)
    console.log('Use a tool like http://jsonlint.com/ to help you debug your config file')
    var table = document.getElementById("prematch_table")
    var row = table.insertRow(0);
    var cell1 = row.insertCell(0);
	cell1.style.width = ColWidth;
    cell1.innerHTML = `Error parsing configuration file: ${err.message}<br><br>Use a tool like <a href="http://jsonlint.com/">http://jsonlint.com/</a> to help you debug your config file`
    return -1
  }

  if(mydata.hasOwnProperty('dataFormat')) {
    dataFormat = mydata.dataFormat;
  }
  
  if (mydata.hasOwnProperty('title')) {
    document.title = mydata.title;
  }

  if (mydata.hasOwnProperty('page_title')) {
    for (pgtitle of document.getElementsByClassName("page_title")) {
      pgtitle.innerHTML = mydata.page_title;
    }
  }

  if (mydata.hasOwnProperty('enable_google_sheets')) {
    if (mydata.enable_google_sheets.toUpperCase() == 'TRUE') {
      enableGoogleSheets = true;
    }
  }

  if (mydata.hasOwnProperty('pitConfig')) {
    if (mydata.pitConfig.toUpperCase() == 'TRUE') {
      pitScouting = true;
    }
  }

  if (mydata.hasOwnProperty('checkboxAs')) {
    // Supported modes
    // YN - Y or N
    // TF - T or F
    // 10 - 1 or 0
    if (['YN','TF','10'].includes(mydata.checkboxAs)) {
      console.log("Setting checkboxAs to " + mydata.checkboxAs);
      checkboxAs = mydata.checkboxAs;
    } else {
      console.log("unrecognized checkboxAs setting.  Defaulting to YN.")
      checkboxAs = 'YN';
    }
  }

  // Configure prematch screen
  var pmc = mydata.prematch;
  var pmt = document.getElementById("prematch_table");
  var idx = 0;
  pmc.forEach(element => {
    idx = addElement(pmt, idx, element);
	buildRequiredElementList(element);
  });

  // Configure auton screen
  var ac = mydata.auton;
  var at = document.getElementById("auton_table");
  idx = 0;
  ac.forEach(element => {
    idx = addElement(at, idx, element);
  });

  // Configure teleop screen
  buildTeleopLayout(mydata.teleop);

  // Configure endgame screen(Removed)
if (mydata.endgame && document.getElementById("endgame_table")) {
  // intentionally left empty since we do not use endgame
}

  // Configure postmatch screen
  pmc = mydata.postmatch;
  pmt = document.getElementById("postmatch_table");
  var idx = 0;
  pmc.forEach(element => {
    idx = addElement(pmt, idx, element);
  });

  // prematch_table bottom prompt
  var pmtPre = document.getElementById("prematch_table");
  var shiftRow = pmtPre.insertRow(pmtPre.rows.length);
  var shiftCell = shiftRow.insertCell(0);
  shiftCell.setAttribute("colspan", 2);
  shiftCell.id = "shift-hint";
  shiftCell.style.textAlign = "center";
  shiftCell.style.backgroundColor = "#ffffcc";
  shiftCell.style.fontWeight = "bold";
  shiftCell.style.padding = "8px";
  updateShiftHint();

  // 在 postmatch_table 底部添加队伍提示行
  var postTable = document.getElementById("postmatch_table");
  var teamHintRow = postTable.insertRow(postTable.rows.length);
  var teamHintCell = teamHintRow.insertCell(0);
  teamHintCell.setAttribute("colspan", 2);
  teamHintCell.id = "team-hint";
  teamHintCell.style.textAlign = "center";
  teamHintCell.style.padding = "8px";
  updateTeamHint();

  if (!enableGoogleSheets) {
    document.getElementById("submit").style.display = "none";
  }

  // 彻底移除 Endgame 页面（隐藏并从 DOM 中删除，调整滑动计数）
  var endgamePanel = document.getElementById("endgame");
  if (endgamePanel) {
    endgamePanel.remove(); // 直接移除元素
  }

  // 如果当前 slide 索引指向了被移除的页面之后（不会发生），但重置一下确保安全
  if (slide >= document.getElementById("main-panel-holder").children.length) {
    slide = 0;
    goToSlide(0);
  }

  return 0
}

// ========== Teleop 自定义布局 ==========
function buildTeleopLayout(teleopFields) {
  var container = document.getElementById("teleop_table");
  if (!container) return;
  
  // 清空原有内容
  container.innerHTML = "";
  
  // 动态插入样式（保证黑色边框等外观）
  if (!document.getElementById("teleop-custom-style")) {
    var style = document.createElement("style");
    style.id = "teleop-custom-style";
    style.textContent = `
      .teleop-main-row {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        justify-content: center;
        margin-bottom: 20px;
      }
      .teleop-large-box {
        flex: 1;
        min-width: 250px;
        border: 2px solid black;
        border-radius: 8px;
        padding: 12px;
        background-color: #f9f9f9;
      }
      .teleop-large-box > h3 {
        text-align: center;
        margin-top: 0;
        margin-bottom: 12px;
        font-size: 1.2em;
      }
      .teleop-sub-row {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
        margin-bottom: 15px;
      }
      .teleop-small-box {
        flex: 1;
        border: 2px solid black;
        border-radius: 6px;
        padding: 10px;
        background-color: #ffffff;
      }
      .teleop-small-box > h4 {
        text-align: center;
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 1em;
      }
      .teleop-counter-group {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        padding: 4px;
      }
      .teleop-counter-label {
        flex: 2;
        font-weight: bold;
      }
      .teleop-counter-controls {
        flex: 1;
        display: flex;
        gap: 5px;
        justify-content: flex-end;
      }
      .teleop-counter-controls input {
        width: 40px;
        text-align: center;
      }
      .teleop-bottom-row {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        justify-content: space-between;
        margin-top: 15px;
        border-top: 1px solid #ccc;
        padding-top: 15px;
      }
      .teleop-bottom-item {
        flex: 1;
        min-width: 180px;
      }
      @media (max-width: 700px) {
        .teleop-main-row { flex-direction: column; }
        .teleop-sub-row { flex-direction: column; }
      }
    `;
    document.head.appendChild(style);
  }
  
  // 辅助函数：创建单个 counter 控件（复用队伍版风格）
  function createCounterWidget(code, displayName, defaultValue = 0) {
    var wrapper = document.createElement("div");
    wrapper.className = "teleop-counter-group";
    
    var labelSpan = document.createElement("span");
    labelSpan.className = "teleop-counter-label";
    labelSpan.textContent = displayName;
    wrapper.appendChild(labelSpan);
    
    var controlsDiv = document.createElement("div");
    controlsDiv.className = "teleop-counter-controls";
    
    var minusBtn = document.createElement("input");
    minusBtn.type = "button";
    minusBtn.value = "-";
    minusBtn.onclick = (function(c) { return function() { counter(c, -1); }; })(wrapper);
    controlsDiv.appendChild(minusBtn);
    
    var inputField = document.createElement("input");
    inputField.type = "text";
    inputField.className = "counter";
    inputField.id = "input_" + code;
    inputField.name = code;
    inputField.disabled = true;
    inputField.value = defaultValue;
    inputField.style.width = "40px";
    inputField.style.textAlign = "center";
    inputField.style.backgroundColor = "black";
    inputField.style.color = "white";
    controlsDiv.appendChild(inputField);
    
    var plusBtn = document.createElement("input");
    plusBtn.type = "button";
    plusBtn.value = "+";
    plusBtn.onclick = (function(c) { return function() { counter(c, 1); }; })(wrapper);
    controlsDiv.appendChild(plusBtn);
    
    wrapper.appendChild(controlsDiv);
    return wrapper;
  }
  
  // 将 teleopFields 数组转为对象映射，便于按 code 查找名称
  var fieldMap = {};
  teleopFields.forEach(f => { fieldMap[f.code] = f; });
  
  // 定义布局映射
  var groups = {
    trench: { codes: ["tc5", "tc9"], title: "Trench", labels: ["ACTIVE trench crosses", "INACTIVE trench crosses"] },
    bump:   { codes: ["tc4", "tc8"], title: "Bump",   labels: ["ACTIVE bump crosses", "INACTIVE bump crosses"] },
    neutral:{ codes: ["tc2", "tc6"], title: "Neutral",labels: ["ACTIVE passes from middle", "INACTIVE passes middle"] },
    opp:    { codes: ["tc3", "tc7"], title: "Opposite",labels: ["ACTIVE passes from far", "INACTIVE passes from far"] }
  };
  
  // 创建主行（Transport 和 Passing 两大列）
  var mainRow = document.createElement("div");
  mainRow.className = "teleop-main-row";
  
  // ---- Transport 列 ----
  var transportBox = document.createElement("div");
  transportBox.className = "teleop-large-box";
  transportBox.innerHTML = "<h3>Transport</h3>";
  var transportSubRow = document.createElement("div");
  transportSubRow.className = "teleop-sub-row";
  
  // Trench 小盒
  var trenchBox = document.createElement("div");
  trenchBox.className = "teleop-small-box";
  trenchBox.innerHTML = "<h4>Trench</h4>";
  trenchBox.appendChild(createCounterWidget("tc5", groups.trench.labels[0]));
  trenchBox.appendChild(createCounterWidget("tc9", groups.trench.labels[1]));
  transportSubRow.appendChild(trenchBox);
  
  // Bump 小盒
  var bumpBox = document.createElement("div");
  bumpBox.className = "teleop-small-box";
  bumpBox.innerHTML = "<h4>Bump</h4>";
  bumpBox.appendChild(createCounterWidget("tc4", groups.bump.labels[0]));
  bumpBox.appendChild(createCounterWidget("tc8", groups.bump.labels[1]));
  transportSubRow.appendChild(bumpBox);
  
  transportBox.appendChild(transportSubRow);
  
  // ---- Passing 列 ----
  var passingBox = document.createElement("div");
  passingBox.className = "teleop-large-box";
  passingBox.innerHTML = "<h3>Passing</h3>";
  var passingSubRow = document.createElement("div");
  passingSubRow.className = "teleop-sub-row";
  
  // Neutral 小盒
  var neutralBox = document.createElement("div");
  neutralBox.className = "teleop-small-box";
  neutralBox.innerHTML = "<h4>Neutral</h4>";
  neutralBox.appendChild(createCounterWidget("tc2", groups.neutral.labels[0]));
  neutralBox.appendChild(createCounterWidget("tc6", groups.neutral.labels[1]));
  passingSubRow.appendChild(neutralBox);
  
  // Opposite 小盒
  var oppBox = document.createElement("div");
  oppBox.className = "teleop-small-box";
  oppBox.innerHTML = "<h4>Opposite</h4>";
  oppBox.appendChild(createCounterWidget("tc3", groups.opp.labels[0]));
  oppBox.appendChild(createCounterWidget("tc7", groups.opp.labels[1]));
  passingSubRow.appendChild(oppBox);
  
  passingBox.appendChild(passingSubRow);
  
  mainRow.appendChild(transportBox);
  mainRow.appendChild(passingBox);
  container.appendChild(mainRow);
  
  // ---- 底部区域：Times of Scoring + 新加的三个 counter ----
  var bottomRow = document.createElement("div");
  bottomRow.className = "teleop-bottom-row";
  
  // Times of Scoring (tc1)
  var activeScoresDiv = document.createElement("div");
  activeScoresDiv.className = "teleop-bottom-item";
  activeScoresDiv.appendChild(createCounterWidget("tc1", "Times of Scoring"));
  bottomRow.appendChild(activeScoresDiv);
  
  // 新加的三个 counter
  var newCodes = ["cycles_shift1", "cycles_shift2", "cycles_endgame"];
  var newNames = ["Number of cycles for Shift 1", "Number of cycles for Shift 2", "Number of cycles for Endgame"];
  for (var i = 0; i < newCodes.length; i++) {
    var div = document.createElement("div");
    div.className = "teleop-bottom-item";
    div.appendChild(createCounterWidget(newCodes[i], newNames[i]));
    bottomRow.appendChild(div);
  }
  
  container.appendChild(bottomRow);
}

function getRobot(){
  return document.forms.scoutingForm.r.value;
}


function resetRobot() {
for ( rb of document.getElementsByName('r')) { rb.checked = false };
}


function getLevel(){
return document.forms.scoutingForm.l.value
}


function validateData() {
  if (skipValidation) {
    return true;
  }

  var ret = true;
  var errStr = "";
  for (rf of requiredFields) {
    var thisRF = document.forms.scoutingForm[rf];
    if (thisRF.value == "[]" || thisRF.value.length == 0) {
      if (rf == "as") {
        rftitle = "Auto Start Position"
      } else {
        thisInputEl = thisRF instanceof RadioNodeList ? thisRF[0] : thisRF;
        rftitle = thisInputEl.parentElement.parentElement.children[0].innerHTML.replace("&nbsp;","");
      }
      errStr += rf + ": " + rftitle + "\n";
      ret = false;
    }
  }
  if (ret == false) {
    alert("Enter all required values\n" + errStr);
  }
  return ret
}


function getData(dataFormat) {
  var Form = document.forms.scoutingForm;
  var UniqueFieldNames = [];
  var fd = new FormData();
  var str = [];

  switch(checkboxAs) {
    case 'TF':
      checkedChar = 'T';
      uncheckedChar = 'F';
      break;
    case '10':
      checkedChar = '1';
      uncheckedChar = '0';
      break;
    default:
      var checkedChar = 'Y';
      var uncheckedChar = 'N';
  }

  // collect the names of all the elements in the form
  var fieldnames = Array.from(Form.elements, formElmt => formElmt.name);

  // make sure to add the name attribute only to elements from which you want to collect values.  Radio button groups all share the same name
  // so those element names need to be de-duplicated here as well.
  fieldnames.forEach((fieldname) => { if (fieldname != "" && !UniqueFieldNames.includes(fieldname)) { UniqueFieldNames.push(fieldname) } });

  UniqueFieldNames.forEach((fieldname) => {
    var thisField = Form[fieldname];

    if (thisField.type == 'checkbox') {
      var thisFieldValue = thisField.checked ? checkedChar : uncheckedChar;
    } else {
      var thisFieldValue = thisField.value ? thisField.value.replace(/"/g, '').replace(/;/g,"-") : "";
    }
    fd.append(fieldname, thisFieldValue)
  })

  if (dataFormat == "kvs") {
    Array.from(fd.keys()).forEach(thisKey => {
      str.push(thisKey + "=" + fd.get(thisKey))
    });
    return str.join(";")
  } else if (dataFormat == "tsv") {
    Array.from(fd.keys()).forEach(thisKey => {
      str.push(fd.get(thisKey))
    });
    return str.join("\t")
  } else {
    return "unsupported dataFormat"
  }
}

function updateQRHeader() {
  const getVal = (id) => {
    const el = document.getElementById(id);
    return el ? (el.value ?? el.textContent ?? "") : "";
  };

  let str;
  if (!pitScouting) {
    // safely read the fields
    const ev = getVal("input_e");
    const match = getVal("input_m");
    const robot = getVal("display_r");  // exists only if you have a radio with code "r"
    const team = getVal("input_t");

    str = `Event: ${ev} Match: ${match} Robot: ${robot} Team: ${team}`;
  } else {
    const team = getVal("input_t");
    str = `Pit Scouting - Team ${team}`;
  }

  const info = document.getElementById("display_qr-info");
  if (info) info.textContent = str;
}



function qr_regenerate() {
  // Validate required pre-match date (event, match, level, robot, scouter)
  if (!pitScouting) {  
    if (validateData() == false) {
      // Don't allow a swipe until all required data is filled in
      return false
    }
  }

  // Get data
  data = getData(dataFormat)

  // Regenerate QR Code
  qr.makeCode(data)

  updateQRHeader()
  return true
}

function qr_clear() {
  qr.clear()
}

function clearForm() {
  var match = 0;
  var e = 0;

  if (pitScouting) {
    // whatever slide index you use for pit, often 0
    goToSlide(0);
  } else {
    // send back to prematch page, usually slide 0
    goToSlide(0);

    // Increment match
    match = parseInt(document.getElementById("input_m").value);
    if (isNaN(match)) {
      document.getElementById("input_m").value = "";
    } else {
      document.getElementById("input_m").value = match + 1;
    }
    updateShiftHint();   // 新增

    // Robot
    resetRobot();
  }

  // Clear XY coordinates
  inputs = document.querySelectorAll("[id*='XY_']");
  for (e of inputs) {
    code = e.id.substring(3)
    e.value = "[]"
  }

  inputs = document.querySelectorAll("[id*='input_']");
  for (e of inputs) {
    code = e.id.substring(6)

    // Don't clear key fields
    if (code == "m") continue
    if (code.substring(0, 2) == "r_") continue
    if (code.substring(0, 2) == "l_") continue
    if (code == "e") continue
    if (code == "s") continue

    if (e.className == "clickableImage") {
      e.value = "[]";
      continue;
    }

    radio = code.indexOf("_")
    if (radio > -1) {
      var baseCode = code.substr(0, radio)
      if (e.checked) {
        e.checked = false
        document.getElementById("display_" + baseCode).value = ""
      }
      var defaultValue = document.getElementById("default_" + baseCode).value
      if (defaultValue != "") {
        if (defaultValue == e.value) {
          e.checked = true
          document.getElementById("display_" + baseCode).value = defaultValue
        }
      }
    } else {
      if (e.type == "number" || e.type == "text" || e.type == "hidden") {
        if ((e.className == "counter") ||
          (e.className == "timer") ||
          (e.className == "cycle")) {
          e.value = 0
          if (e.className == "timer" || e.className == "cycle") {
            // Stop interval
            timerStatus = document.getElementById("status_" + code);
            startButton = document.getElementById("start_" + code);
            intervalIdField = document.getElementById("intervalId_" + code);
            var intervalId = intervalIdField.value;
            timerStatus.value = 'stopped';
            startButton.innerHTML = "Start";
            if (intervalId != '') {
              clearInterval(intervalId);
            }
            intervalIdField.value = '';
            if (e.className == "cycle") {
              document.getElementById("cycletime_" + code).value = "[]"
              document.getElementById("display_" + code).value = ""
            }
          }
        } else {
          e.value = ""
        }
      } else if (e.type == "checkbox") {
        if (e.checked == true) {
          e.checked = false
        }
      } else {
        console.log("unsupported input type")
      }
    }
  }
  drawFields()
}

function startTouch(e) {
  initialX = e.touches[0].screenX;
};

function moveTouch(e) {
  if (initialX === null) {
    return;
  }

  var currentX = e.changedTouches[0].screenX;
  var diffX = initialX - currentX;

  // sliding horizontally
  if (diffX / screen.width > xThreshold) {
    // swiped left
    swipePage(1);
  } else if (diffX / screen.width < -xThreshold) {
    // swiped right
    swipePage(-1);
  }
  initialX = null;
};

function swipePage(increment) {
  if (qr_regenerate() == true) {
    slides = document.getElementById("main-panel-holder").children
    if (slide + increment < slides.length && slide + increment >= 0) {
      slides[slide].style.display = "none";
      slide += increment;
      window.scrollTo(0, 0);
      slides[slide].style.display = "table";
      document.getElementById('data').innerHTML = "";
      document.getElementById('copyButton').setAttribute('value','Copy Data');
    }
  }
}

function drawFields(name) {
  var fields = document.querySelectorAll("[id*='canvas_']");

  for (f of fields) {
    code = f.id.substring(7);
    var img = document.getElementById("img_" + code);
    var shape = document.getElementById("shape_" + code);
    let shapeArr = shape.value.split(' ');
    var ctx = f.getContext("2d");
    var imgWidth = img.width;
    var imgHeight = img.height;
    let scale_factor = Math.min(ctx.canvas.width / img.width, ctx.canvas.height / img.height);
    let newWidth = img.width * scale_factor;
    let newHeight = img.height * scale_factor;
    if (newWidth > 0) {
      ctx.canvas.width = newWidth
    }
    if (newHeight > 0) {
      ctx.canvas.height = newHeight
    }
    ctx.clearRect(0, 0, newWidth, newHeight);
    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    var xyStr = document.getElementById("XY_" + code).value
    if (JSON.stringify(xyStr).length > 2) {
      pts = Array.from(JSON.parse(xyStr))
      for (p of pts) {
        var coord = p.split(",")
        var centerX = coord[0];
        var centerY = coord[1];
        var radius = 5;
        ctx.beginPath();
        if (shapeArr[0].toLowerCase() == 'circle') {
          ctx.arc(centerX, centerY, shapeArr[1], 0, 2 * Math.PI, false);
        } else {
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        }
        ctx.lineWidth = 2;
        if (shapeArr[2] != "") {
          ctx.strokeStyle = shapeArr[2];
        } else {
          ctx.strokeStyle = '#FFFFFF';
        }
        if (shapeArr[4].toLowerCase() == 'true') {
          ctx.fillStyle = shapeArr[3];
        }
        ctx.stroke();
        if (shapeArr[4].toLowerCase() == 'true') {
          ctx.fill();
        }
      }
    }
  }
}

function onFieldClick(event) {
  let target = event.target;
  let base = getIdBase(target.id);

  //Resolution height and width (e.g. 52x26)
  let resX = 12;
  let resY = 6;

  let dimensions = document.getElementById("dimensions" + base);
  if (dimensions.value != "") {
    let arr = dimensions.value.split(' ');
    resX = arr[0];
    resY = arr[1];
  }

  //Turns coordinates into a numeric box
  let box = ((Math.ceil(event.offsetY / target.height * resY) - 1) * resX) + Math.ceil(event.offsetX / target.width * resX);
  let coords = event.offsetX + "," + event.offsetY;

  let allowableResponses = document.getElementById("allowableResponses" + base).value;

  if(allowableResponses != "none"){
    allowableResponsesList = allowableResponses.split(',').map(Number);
    if (allowableResponsesList.indexOf(box)==-1){
      return;
    }
  }

  //Cumulating values
  let changingXY = document.getElementById("XY" + base);
  let changingInput = document.getElementById("input" + base);
  let clickRestriction = document.getElementById("clickRestriction" + base).value;
  let toggleClick = document.getElementById("toggleClick" + base).value;
  let cycleTimer = document.getElementById("cycleTimer" + base);
  let boxArr = Array.from(JSON.parse(changingInput.value));
  let xyArr = Array.from(JSON.parse(changingXY.value));

  if ((toggleClick.toLowerCase() == 'true') &&
    (boxArr.includes(box))) {
    // Remove it
    let idx = boxArr.indexOf(box);
    boxArr.splice(idx, 1);
    xyArr.splice(idx, 1);
    changingInput.value = JSON.stringify(boxArr);
    changingXY.value = JSON.stringify(xyArr);
  } else {
    if (JSON.stringify(changingXY.value).length <= 2) {
      changingXY.value = JSON.stringify([coords]);
      changingInput.value = JSON.stringify([box]);
    } else if (clickRestriction == "one") {
      // Replace box and coords
      changingXY.value = JSON.stringify([coords]);
      changingInput.value = JSON.stringify([box]);
    } else if (clickRestriction == "onePerBox") {
      // Add if box already not in box list/Array
      if (!boxArr.includes(box)) {
        boxArr.push(box);
        changingInput.value = JSON.stringify(boxArr);

        coords = findMiddleOfBox(box, target.width, target.height, resX, resY);
        xyArr.push(coords);
        changingXY.value = JSON.stringify(xyArr);
      }
    } else {
      // No restrictions - add to array
      xyArr.push(coords);
      changingXY.value = JSON.stringify(xyArr);

      boxArr.push(box);
      changingInput.value = JSON.stringify(boxArr);
    }
    // If associated with cycleTimer - send New Cycle EVENT
    if (cycleTimer != null) {
      document.getElementById("cycle_" + cycleTimer.value).click();
    }
  }

  drawFields()
}

function findMiddleOfBox(boxNum, width, height, resX, resY) {
  let boxHeight = height / resY;
  let boxWidth = width / resX;
  let boxX = (boxNum % resX) - 1;
  if (boxX == -1) { boxX = resX - 1 }
  let boxY = Math.floor((boxNum - boxX + 1) / resX);
  let x = Math.round((boxWidth * boxX) + (Math.floor(boxWidth / 2)));
  let y = Math.round((boxHeight * boxY) + (Math.floor(boxHeight / 2)));
  return x+","+y
}

function getIdBase(name) {
  return name.slice(name.indexOf("_"), name.length)
}

function getTeamName(teamNumber) {
  if (teamNumber !== undefined) {
    if (teams) {
      var teamKey = "frc" + teamNumber;
      var ret = "";
      Array.from(teams).forEach(team => ret = team.key == teamKey ? team.nickname : ret);
      return ret;
    }
  }
  return "";
}

function getMatch(matchKey) {
  //This needs to be different than getTeamName() because of how JS stores their data
  if (matchKey !== undefined) {
    if (schedule) {
      var ret = "";
      Array.from(schedule).forEach(match => ret = match.key == matchKey ? match.alliances : ret);
      return ret;
    }
  }
  return "";
}

function getCurrentTeamNumberFromRobot() {
  if (getRobot() != "" && typeof getRobot() !== 'undefined' && getCurrentMatch() != "") {
    if (getRobot().charAt(0) == "r") {
      return getCurrentMatch().red.team_keys[parseInt(getRobot().charAt(1)) - 1]
    } else if (getRobot().charAt(0) == "b") {
      return getCurrentMatch().blue.team_keys[parseInt(getRobot().charAt(1)) - 1]
    }
  }
}

function getCurrentMatchKey() {
  return document.getElementById("input_e").value + "_" + getLevel() + document.getElementById("input_m").value;
}

function getCurrentMatch() {
  return getMatch(getCurrentMatchKey());
}

function updateMatchStart(event) {
  if ((getCurrentMatch() == "") ||
    (!teams)) {
    console.log("No match or team data.");
    return;
  }
  if (event.target.id.startsWith("input_r")) {
    document.getElementById("input_t").value = getCurrentTeamNumberFromRobot().replace("frc", "");
    updateTeamHint();
    onTeamnameChange();
  }
  if (event.target.id == "input_m") {
    if (getRobot() != "" && typeof getRobot()) {
      document.getElementById("input_t").value = getCurrentTeamNumberFromRobot().replace("frc", "");
      updateTeamHint();
      onTeamnameChange();
    }
  }
}

function onTeamnameChange(event) {
  var newNumber = document.getElementById("input_t").value;
  var teamLabel = document.getElementById("teamname-label");
  if (newNumber != "") {
    teamLabel.innerText = getTeamName(newNumber) != "" ? "You are scouting " + getTeamName(newNumber) : "That team isn't playing this match, please double check to verify correct number";
  } else {
    teamLabel.innerText = "";
  }
}

// Auxiliary function: Parse the CSV text into the {team number: hint} object
function parseCSV(csvText) {
    var lines = csvText.split(/\r?\n/);
    if (lines.length < 2) return {};
    var headers = lines[0].split(",");
    var teamIdx = -1, hintIdx = -1;
    for (var i = 0; i < headers.length; i++) {
        var h = headers[i].trim().toLowerCase();
        if (h === "team_number" || h === "team" || h === "team#") teamIdx = i;
        if (h === "hint" || h === "notes" || h === "comment") hintIdx = i;
    }
    if (teamIdx === -1 || hintIdx === -1) {
        console.error("CSV format error: Missing team number or prompt bar");
        return {};
    }
    var result = {};
    for (var i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        var cols = lines[i].split(",");
        if (cols.length <= teamIdx || cols.length <= hintIdx) continue;
        var teamNum = cols[teamIdx].trim();
        var hint = cols[hintIdx].trim();
        if (teamNum) result[teamNum] = hint;
    }
    return result;
}

function loadTeamHints() {
    var url = (TEAM_HINTS_SOURCE === 'google') ? TEAM_HINTS_URL_GOOGLE : TEAM_HINTS_URL_LOCAL;
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("HTTP " + response.status);
            if (url.endsWith('.csv')) {
                return response.text().then(csvText => parseCSV(csvText));
            } else {
                return response.json();
            }
        })
        .then(data => {
            teamHints = data;
            teamHintsLoaded = true;
            updateTeamHint();
            console.log("Team prompt: Loading successful. Data source:", TEAM_HINTS_SOURCE, teamHints);
        })
        .catch(err => {
            console.error(`The team prompted a loading failure (${TEAM_HINTS_SOURCE})`, err);
            if (TEAM_HINTS_SOURCE === 'google') {
                console.log("Automatically switch to the local data source...");
                TEAM_HINTS_SOURCE = 'local';
                loadTeamHints();
            } else {
                teamHints = {};
                teamHintsLoaded = true;
                updateTeamHint();
            }
        });
}

function updateTeamHint() {
    var teamInput = document.getElementById("input_t");
    if (!teamInput) return;
    var teamNum = teamInput.value.trim();
    var hintText = "";
    if (!teamHintsLoaded) {
        hintText = "Team prompt loading...";
    } else if (teamNum === "") {
        hintText = "Please enter the team number";
    } else if (teamHints.hasOwnProperty(teamNum)) {
        hintText = teamHints[teamNum];
    } else {
        hintText = "There are no special instructions for this team";
    }
    var hintCell = document.getElementById("team-hint");
    if (hintCell) {
        hintCell.style.backgroundColor = "#6385A5";
        hintCell.style.color = "white";
        hintCell.style.fontWeight = "normal";
        hintCell.innerHTML = hintText.replace(/\n/g, "<br>");
    }
}

/**
 * adds to the number in innerHTML of the value tag.
 *
 * @param {element} element the <div> tag element (parent to the value tag).
 * @param {number} step the amount to add to the value tag.
 */
function counter(element, step) {
  let target = event.target;
  let base = getIdBase(target.id);

  var ctr = element.getElementsByClassName("counter")[0];
  let cycleTimer = document.getElementById("cycleTimer" + base);
  var result = parseInt(ctr.value) + step;

  if (isNaN(result)) {
    result = 0;
  }

  if (result >= 0 || ctr.hasAttribute('data-negative')) {
    ctr.value = result;
  } else {
    ctr.value = 0;
  }

  // If associated with cycleTimer - send New Cycle EVENT
  if (step >= 0 && cycleTimer != null) {
    document.getElementById("cycle_" + cycleTimer.value).click();
  }
}

function newCycle(event)
{
  let timerID = event.firstChild;
  let base = getIdBase(timerID.id);
  let inp = document.getElementById("input" + base)
  let cycleTime = inp.value
  inp.value = 0

  if (cycleTime > 0) {
    let cycleInput = document.getElementById("cycletime" + base);
    var tempValue = Array.from(JSON.parse(cycleInput.value));
    tempValue.push(cycleTime);
    cycleInput.value = JSON.stringify(tempValue);
    let d = document.getElementById("display" + base);
    d.value = cycleInput.value.replace(/\"/g,'').replace(/\[/g, '').replace(/\]/g, '').replace(/,/g, ', ');
  }
}

function undoCycle(event) {
  let undoID = event.firstChild;
  let uId = getIdBase(undoID.id);
  //Getting rid of last value
  let cycleInput = document.getElementById("cycletime" + uId);
  var tempValue = Array.from(JSON.parse(cycleInput.value));
  tempValue.pop();
  cycleInput.value = JSON.stringify(tempValue);
  let d = document.getElementById("display" + uId);
  d.value = cycleInput.value.replace(/\"/g,'').replace(/\[/g, '').replace(/\]/g, '').replace(/,/g, ', ');
}

function resetTimer(event) {
  let timerID = event.firstChild;
  let tId = getIdBase(timerID.id);
  let inp = document.getElementById("input" + tId)
  inp.value = 0

  // stop timer
  timerStatus = document.getElementById("status" + tId);
  startButton = document.getElementById("start" + tId);
  intervalIdField = document.getElementById("intervalId" + tId);
  var intervalId = intervalIdField.value;
  timerStatus.value = 'stopped';
  startButton.setAttribute("value", "Start");
  if (intervalId != '') {
    clearInterval(intervalId);
  }
  intervalIdField.value = '';
}

function timer(event) {
  let timerID = event.firstChild;
  let tId = getIdBase(timerID.id)
  timerStatus = document.getElementById("status" + tId);
  startButton = document.getElementById("start" + tId);
  intervalIdField = document.getElementById("intervalId" + tId);
  var statusValue = timerStatus.value;
  var intervalId = intervalIdField.value;
  if (statusValue == 'stopped') {
    timerStatus.value = 'started';
    startButton.setAttribute("value", "Stop");

    var intId = setInterval(() => {
      if (document.getElementById("status" + tId).value == 'started') {
        inp = document.getElementById("input" + tId);
        var t = parseFloat(inp.value);
        t += 0.1;
        tTrunc = t.toFixed(1)
        inp.value = tTrunc;
      }
    }, 100);
    intervalIdField.value = intId;
  } else {
    timerStatus.value = 'stopped';
    startButton.setAttribute("value", "Start");

    clearInterval(intervalId);
    intervalIdField.value = '';
  }
  drawFields();
}

function undo(event) {
  let undoID = event.firstChild;
  //Getting rid of last value
  changingXY = document.getElementById("XY" + getIdBase(undoID.id));
  changingInput = document.getElementById("input" + getIdBase(undoID.id));
  var tempValue = Array.from(JSON.parse(changingXY.value));
  tempValue.pop();
  changingXY.value = JSON.stringify(tempValue);

  tempValue = Array.from(JSON.parse(changingInput.value));
  tempValue.pop();
  changingInput.value = JSON.stringify(tempValue);
  drawFields();
}

function flip(event) {
  let flipID = event.firstChild;
  var flipImg = document.getElementById("canvas" + getIdBase(flipID.id));
  if (flipImg.style.transform == "") {
    flipImg.style.transform = 'rotate(180deg)';
  } else {
    flipImg.style.transform = '';
  }
  drawFields();
}

function displayData(){
  document.getElementById('data').innerHTML = getData(dataFormat);
}

function copyData(){
  navigator.clipboard.writeText(getData(dataFormat));
  document.getElementById('copyButton').setAttribute('value','Copied');
}

window.onload = function () {
  let ret = configure();
  if (ret != -1) {
    let ece = document.getElementById("input_e");
    let ec = null;
    if (ece != null) {
      ec = ece.value;
    }
    if (ec != null) {
      getTeams(ec);
      getSchedule(ec);
    }
    this.drawFields();

    // 绑定 Team # 输入事件
    var teamInputElem = document.getElementById("input_t");
    if (teamInputElem) {
        teamInputElem.addEventListener("input", updateTeamHint);
        teamInputElem.addEventListener("change", updateTeamHint);
    }
    // 加载队伍提示
    loadTeamHints();

    // Bind the Match # input event and load the schedule
    var matchInputElem = document.getElementById("input_m");
    if (matchInputElem) {
        matchInputElem.addEventListener("input", updateShiftHint);
        matchInputElem.addEventListener("change", updateShiftHint);
    }
    loadShiftSchedule();
    if (enableGoogleSheets) {
      console.log("Enabling Google Sheets.");
      setUpGoogleSheets();
    }
  }
};
