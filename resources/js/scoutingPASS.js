// ScoutingPASS.js
// Optimized for 2026 Offseason - Prematch, Auton, Postmatch only
// Written by Team 2451 - PWNAGE

// ==================== 全局变量 ====================
var skipValidation = false;
var initialX = null;
var xThreshold = 0.3;
var slide = 0;
var enableGoogleSheets = false;
var pitScouting = false;
var checkboxAs = 'YN';
var ColWidth = '200px';
var dataFormat = 'tsv';
var requiredFields = [];

// QR Code 选项
var options = {
  correctLevel: QRCode.CorrectLevel.L,
  quietZone: 15,
  quietZoneColor: '#FFFFFF'
};

// ==================== 触摸事件 ====================
document.addEventListener("touchstart", startTouch, false);
document.addEventListener("touchend", moveTouch, false);

function startTouch(e) {
  initialX = e.touches[0].screenX;
}

function moveTouch(e) {
  if (initialX === null) return;
  var currentX = e.changedTouches[0].screenX;
  var diffX = initialX - currentX;
  if (diffX / screen.width > xThreshold) {
    swipePage(1);   // 左滑 -> 下一页
  } else if (diffX / screen.width < -xThreshold) {
    swipePage(-1);  // 右滑 -> 上一页
  }
  initialX = null;
}

// ==================== 表单元素生成函数 ====================

/**
 * 添加计数器
 */
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
  if (data.hasOwnProperty('tooltip')) cell1.setAttribute("title", data.tooltip);
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
  inp.setAttribute("style", "background-color: black; color: white; border: none; text-align: center;");
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

  if (data.hasOwnProperty('defaultValue')) {
    var def = document.createElement("input");
    def.setAttribute("id", "default_" + data.code);
    def.setAttribute("type", "hidden");
    def.setAttribute("value", data.defaultValue);
    cell2.appendChild(def);
  }
  return idx + 1;
}

/**
 * 添加文本输入
 */
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
  if (data.hasOwnProperty('tooltip')) cell1.setAttribute("title", data.tooltip);
  cell2.classList.add("field");

  var inp = document.createElement("input");
  inp.setAttribute("id", "input_" + data.code);
  inp.setAttribute("type", "text");
  if (enableGoogleSheets && data.hasOwnProperty('gsCol')) {
    inp.setAttribute("name", data.gsCol);
  } else {
    inp.setAttribute("name", data.code);
  }
  if (data.hasOwnProperty('size')) inp.setAttribute("size", data.size);
  if (data.hasOwnProperty('maxSize')) inp.setAttribute("maxLength", data.maxSize);
  if (data.hasOwnProperty('defaultValue')) {
    if (data.type == 'event') data.defaultValue = data.defaultValue.toLowerCase();
    inp.setAttribute("value", data.defaultValue);
  }
  if (data.hasOwnProperty('required')) inp.setAttribute("required", "");
  if (data.hasOwnProperty('disabled')) inp.setAttribute("disabled", "");
  cell2.appendChild(inp);

  if (data.hasOwnProperty('defaultValue')) {
    var def = document.createElement("input");
    def.setAttribute("id", "default_" + data.code);
    def.setAttribute("type", "hidden");
    def.setAttribute("value", data.defaultValue);
    cell2.appendChild(def);
  }
  return idx + 1;
}

/**
 * 添加数字输入
 */
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
  if (data.hasOwnProperty('tooltip')) cell1.setAttribute("title", data.tooltip);
  cell2.classList.add("field");

  var inp = document.createElement("input");
  inp.setAttribute("id", "input_" + data.code);
  inp.setAttribute("type", "number");
  if (enableGoogleSheets && data.hasOwnProperty('gsCol')) {
    inp.setAttribute("name", data.gsCol);
  } else {
    inp.setAttribute("name", data.code);
  }
  if (data.type == 'team' || data.type == 'match') {
    inp.setAttribute("onchange", "updateMatchStart(event)");
  }
  if (data.hasOwnProperty('min')) inp.setAttribute("min", data.min);
  if (data.hasOwnProperty('max')) inp.setAttribute("max", data.max);
  if (data.hasOwnProperty('defaultValue')) inp.setAttribute("value", data.defaultValue);
  if (data.hasOwnProperty('disabled')) inp.setAttribute("disabled", "");
  if (data.hasOwnProperty('required')) inp.setAttribute("required", "");
  cell2.appendChild(inp);

  if (data.hasOwnProperty('defaultValue')) {
    var def = document.createElement("input");
    def.setAttribute("id", "default_" + data.code);
    def.setAttribute("type", "hidden");
    def.setAttribute("value", data.defaultValue);
    cell2.appendChild(def);
  }

  if (data.type == 'team') {
    idx += 1;
    row = table.insertRow(idx);
    cell1 = row.insertCell(0);
    cell1.setAttribute("id", "teamname-label");
    cell1.setAttribute("colspan", 2);
    cell1.setAttribute("style", "text-align: center;");
  }
  return idx + 1;
}

/**
 * 添加单选按钮组
 */
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
  if (data.hasOwnProperty('tooltip')) cell1.setAttribute("title", data.tooltip);
  cell2.classList.add("field");
  if (data.type == 'level' || data.type == 'robot') {
    cell2.setAttribute("onchange", "updateMatchStart(event)");
  }

  var checked = data.hasOwnProperty('defaultValue') ? data.defaultValue : null;
  if (data.hasOwnProperty('choices')) {
    Object.keys(data.choices).forEach(c => {
      var inp = document.createElement("input");
      inp.setAttribute("id", "input_" + data.code + "_" + c);
      inp.setAttribute("type", "radio");
      if (enableGoogleSheets && data.hasOwnProperty('gsCol')) {
        inp.setAttribute("name", data.gsCol);
      } else {
        inp.setAttribute("name", data.code);
      }
      inp.setAttribute("value", c);
      if (checked == c) inp.setAttribute("checked", "");
      cell2.appendChild(inp);
      cell2.innerHTML += data.choices[c];
    });
  }

  var displayInp = document.createElement("input");
  displayInp.setAttribute("id", "display_" + data.code);
  displayInp.setAttribute("hidden", "");
  displayInp.setAttribute("value", "");
  cell2.appendChild(displayInp);

  if (data.hasOwnProperty('defaultValue')) {
    var def = document.createElement("input");
    def.setAttribute("id", "default_" + data.code);
    def.setAttribute("type", "hidden");
    def.setAttribute("value", data.defaultValue);
    cell2.appendChild(def);
  }
  return idx + 1;
}

/**
 * 添加复选框
 */
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
  if (data.hasOwnProperty('tooltip')) cell1.setAttribute("title", data.tooltip);
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
  if (data.type == 'bool') cell2.innerHTML += "(checked = Yes)";

  if (data.hasOwnProperty('defaultValue')) {
    var def = document.createElement("input");
    def.setAttribute("id", "default_" + data.code);
    def.setAttribute("type", "hidden");
    def.setAttribute("value", data.defaultValue);
    cell2.appendChild(def);
  }
  return idx + 1;
}

/**
 * 根据类型分发到对应的添加函数
 */
function addElement(table, idx, data) {
  var type = data.type || null;
  var name = data.name || 'Default Name';
  if (!type) {
    console.log("No type specified", data);
    idx = addText(table, idx, name, { code: "err", defaultValue: "No type specified: " + data });
    return idx;
  }

  if (type == 'counter') {
    idx = addCounter(table, idx, name, data);
  } else if (type == 'scouter' || type == 'event' || type == 'text') {
    idx = addText(table, idx, name, data);
  } else if (type == 'level' || type == 'radio' || type == 'robot') {
    idx = addRadio(table, idx, name, data);
  } else if (type == 'match' || type == 'team' || type == 'number') {
    idx = addNumber(table, idx, name, data);
  } else if (type == 'bool' || type == 'checkbox' || type == 'pass_fail') {
    idx = addCheckbox(table, idx, name, data);
  } else {
    console.log(`Unrecognized type: ${type}`);
  }
  return idx;
}

/**
 * 收集必填字段
 */
function buildRequiredElementList(element) {
  if (element.required == "true") {
    requiredFields.push(element.code);
  }
}

// ==================== 配置与初始化 ====================

function configure() {
  try {
    var mydata = JSON.parse(config_data);
  } catch (err) {
    console.error('Error parsing configuration file', err);
    var table = document.getElementById("prematch_table");
    var row = table.insertRow(0);
    var cell = row.insertCell(0);
    cell.style.width = ColWidth;
    cell.innerHTML = `Error parsing configuration file: ${err.message}<br><br>Use a tool like <a href="http://jsonlint.com/">http://jsonlint.com/</a> to help you debug your config file`;
    return -1;
  }

  if (mydata.hasOwnProperty('dataFormat')) dataFormat = mydata.dataFormat;
  if (mydata.hasOwnProperty('title')) document.title = mydata.title;
  if (mydata.hasOwnProperty('page_title')) {
    for (let pgtitle of document.getElementsByClassName("page_title")) {
      pgtitle.innerHTML = mydata.page_title;
    }
  }

  if (mydata.hasOwnProperty('enable_google_sheets')) {
    if (mydata.enable_google_sheets.toUpperCase() == 'TRUE') enableGoogleSheets = true;
  }
  if (mydata.hasOwnProperty('pitConfig')) {
    if (mydata.pitConfig.toUpperCase() == 'TRUE') pitScouting = true;
  }
  if (mydata.hasOwnProperty('checkboxAs')) {
    if (['YN','TF','10'].includes(mydata.checkboxAs)) {
      checkboxAs = mydata.checkboxAs;
    } else {
      checkboxAs = 'YN';
    }
  }

  // --- Prematch ---
  var pmc = mydata.prematch;
  var pmt = document.getElementById("prematch_table");
  var idx = 0;
  pmc.forEach(element => {
    idx = addElement(pmt, idx, element);
    buildRequiredElementList(element);
  });

  // --- Auton ---
  var ac = mydata.auton;
  var at = document.getElementById("auton_table");
  idx = 0;
  ac.forEach(element => {
    idx = addElement(at, idx, element);
  });

  // --- Postmatch ---
  pmc = mydata.postmatch;
  pmt = document.getElementById("postmatch_table");
  idx = 0;
  pmc.forEach(element => {
    idx = addElement(pmt, idx, element);
  });

  // 隐藏提交按钮（如果未启用 Google Sheets）
  if (!enableGoogleSheets) {
    document.getElementById("submit").style.display = "none";
  }

  // 移除多余的 Teleop 和 Endgame 面板
  var teleopPanel = document.getElementById("teleop");
  if (teleopPanel) teleopPanel.remove();
  var endgamePanel = document.getElementById("endgame");
  if (endgamePanel) endgamePanel.remove();

  // 确保滑动索引有效
  if (slide >= document.getElementById("main-panel-holder").children.length) {
    slide = 0;
    goToSlide(0);
  }

  return 0;
}

// ==================== 页面导航与表单逻辑 ====================

function goToSlide(targetIndex) {
  var holder = document.getElementById("main-panel-holder");
  if (!holder) return;
  var slides = holder.children;
  if (targetIndex < 0 || targetIndex >= slides.length) return;

  slides[slide].style.display = "none";
  slide = targetIndex;
  window.scrollTo(0, 0);
  slides[slide].style.display = "table";

  var dataDiv = document.getElementById("data");
  if (dataDiv) dataDiv.innerHTML = "";
  var copyBtn = document.getElementById("copyButton");
  if (copyBtn) copyBtn.setAttribute("value", "Copy Data");
}

function swipePage(increment) {
  if (qr_regenerate() == true) {
    var slides = document.getElementById("main-panel-holder").children;
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

function validateData() {
  if (skipValidation) return true;
  var ret = true;
  var errStr = "";
  for (let rf of requiredFields) {
    var thisRF = document.forms.scoutingForm[rf];
    if (thisRF.value == "[]" || thisRF.value.length == 0) {
      var rftitle;
      if (rf == "as") {
        rftitle = "Auto Start Position";
      } else {
        var thisInputEl = thisRF instanceof RadioNodeList ? thisRF[0] : thisRF;
        rftitle = thisInputEl.parentElement.parentElement.children[0].innerHTML.replace("&nbsp;","");
      }
      errStr += rf + ": " + rftitle + "\n";
      ret = false;
    }
  }
  if (!ret) alert("Enter all required values\n" + errStr);
  return ret;
}

function getData() {
  var Form = document.forms.scoutingForm;
  var UniqueFieldNames = [];
  var fd = new FormData();
  var str = [];

  var checkedChar = 'Y', uncheckedChar = 'N';
  if (checkboxAs === 'TF') { checkedChar = 'T'; uncheckedChar = 'F'; }
  else if (checkboxAs === '10') { checkedChar = '1'; uncheckedChar = '0'; }

  var fieldnames = Array.from(Form.elements, el => el.name);
  fieldnames.forEach(name => {
    if (name != "" && !UniqueFieldNames.includes(name)) UniqueFieldNames.push(name);
  });

  UniqueFieldNames.forEach(name => {
    var field = Form[name];
    var value;
    if (field.type == 'checkbox') {
      value = field.checked ? checkedChar : uncheckedChar;
    } else {
      value = field.value ? field.value.replace(/"/g, '').replace(/;/g,"-") : "";
    }
    fd.append(name, value);
  });

  if (dataFormat == "kvs") {
    Array.from(fd.keys()).forEach(key => str.push(key + "=" + fd.get(key)));
    return str.join(";");
  } else if (dataFormat == "tsv") {
    Array.from(fd.keys()).forEach(key => str.push(fd.get(key)));
    return str.join("\t");
  }
  return "unsupported dataFormat";
}

function updateQRHeader() {
  const getVal = (id) => {
    const el = document.getElementById(id);
    return el ? (el.value ?? el.textContent ?? "") : "";
  };
  let str;
  if (!pitScouting) {
    const ev = getVal("input_e");
    const match = getVal("input_m");
    const robot = getVal("display_r");
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
  if (!pitScouting && !validateData()) return false;
  data = getData();
  qr.makeCode(data);
  updateQRHeader();
  return true;
}

function qr_clear() {
  qr.clear();
}

function displayData() {
  var dataDiv = document.getElementById('data');
  if (dataDiv) {
    dataDiv.innerHTML = getData();
  }
}

function copyData() {
  navigator.clipboard.writeText(getData()).then(() => {
    var copyBtn = document.getElementById('copyButton');
    if (copyBtn) copyBtn.setAttribute('value', 'Copied');
  }).catch(err => {
    console.error('Copy failed:', err);
  });
}

function clearForm() {
  var match = 0;
  if (pitScouting) {
    goToSlide(0);
  } else {
    goToSlide(0);
    match = parseInt(document.getElementById("input_m").value);
    if (isNaN(match)) {
      document.getElementById("input_m").value = "";
    } else {
      document.getElementById("input_m").value = match + 1;
    }
    // 重置机器人选择
    for (let rb of document.getElementsByName('r')) rb.checked = false;
  }

  // 清除所有输入字段（保留关键字段）
  var inputs = document.querySelectorAll("[id*='input_']");
  for (let e of inputs) {
    var code = e.id.substring(6);
    if (code == "m" || code == "e" || code == "s") continue;
    if (code.substring(0, 2) == "r_" || code.substring(0, 2) == "l_") continue;

    var radio = code.indexOf("_");
    if (radio > -1) {
      var baseCode = code.substr(0, radio);
      if (e.checked) {
        e.checked = false;
        document.getElementById("display_" + baseCode).value = "";
      }
      var defaultValue = document.getElementById("default_" + baseCode)?.value;
      if (defaultValue && defaultValue == e.value) {
        e.checked = true;
        document.getElementById("display_" + baseCode).value = defaultValue;
      }
    } else {
      if (e.type == "number" || e.type == "text" || e.type == "hidden") {
        if (e.className == "counter") {
          e.value = 0;
        } else {
          e.value = "";
        }
      } else if (e.type == "checkbox") {
        e.checked = false;
      }
    }
  }
}

// ==================== 计数器操作 ====================
function counter(element, step) {
  let target = event.target;
  let base = target.id.substring(target.id.indexOf("_"));
  var ctr = element.getElementsByClassName("counter")[0];
  var result = parseInt(ctr.value) + step;
  if (isNaN(result)) result = 0;
  ctr.value = result >= 0 ? result : 0;
}

// ==================== TBA 辅助函数 ====================
function getRobot() {
  return document.forms.scoutingForm.r.value;
}

function getLevel() {
  return document.forms.scoutingForm.l.value;
}

function getTeamName(teamNumber) {
  if (teamNumber !== undefined && teams) {
    var teamKey = "frc" + teamNumber;
    var ret = "";
    Array.from(teams).forEach(team => ret = team.key == teamKey ? team.nickname : ret);
    return ret;
  }
  return "";
}

function getMatch(matchKey) {
  if (matchKey !== undefined && schedule) {
    var ret = "";
    Array.from(schedule).forEach(match => ret = match.key == matchKey ? match.alliances : ret);
    return ret;
  }
  return "";
}

function getCurrentTeamNumberFromRobot() {
  if (getRobot() != "" && typeof getRobot() !== 'undefined' && getCurrentMatch() != "") {
    if (getRobot().charAt(0) == "r") {
      return getCurrentMatch().red.team_keys[parseInt(getRobot().charAt(1)) - 1];
    } else if (getRobot().charAt(0) == "b") {
      return getCurrentMatch().blue.team_keys[parseInt(getRobot().charAt(1)) - 1];
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
  if (getCurrentMatch() == "" || !teams) return;
  if (event.target.id.startsWith("input_r")) {
    document.getElementById("input_t").value = getCurrentTeamNumberFromRobot().replace("frc", "");
    onTeamnameChange();
  }
  if (event.target.id == "input_m") {
    if (getRobot() != "") {
      document.getElementById("input_t").value = getCurrentTeamNumberFromRobot().replace("frc", "");
      onTeamnameChange();
    }
  }
}

function onTeamnameChange() {
  var newNumber = document.getElementById("input_t").value;
  var teamLabel = document.getElementById("teamname-label");
  if (newNumber != "") {
    teamLabel.innerText = getTeamName(newNumber) != "" ? "You are scouting " + getTeamName(newNumber) : "That team isn't playing this match, please double check to verify correct number";
  } else {
    teamLabel.innerText = "";
  }
}

// ==================== 页面加载初始化 ====================
window.onload = function () {
  let ret = configure();
  if (ret != -1) {
    let ece = document.getElementById("input_e");
    let ec = ece ? ece.value : null;
    if (ec) {
      getTeams(ec);
      getSchedule(ec);
    }

    // 绑定 Team # 变化事件
    var teamInput = document.getElementById("input_t");
    if (teamInput) {
      teamInput.addEventListener("input", onTeamnameChange);
      teamInput.addEventListener("change", onTeamnameChange);
    }

    if (enableGoogleSheets) {
      console.log("Enabling Google Sheets.");
      setUpGoogleSheets();
    }
  }
};