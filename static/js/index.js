const goBtn = document.getElementById("goBtn");
const resultTable = document.getElementById("resultTable");
const fileInput = document.getElementById("fileInput");
const colSelectDiv = document.getElementById("col_select");

const inp_minBetrag = document.getElementById("minBetrag");
const inp_minAnzahl = document.getElementById("minAnzahl");
const inp_varianz = document.getElementById("varianz");
const inp_minKorrIdx = document.getElementById("minKorrIdx");
const smurfingAnalysisCheck = document.getElementById("smurphingCheck");
const signalWordCheck = document.getElementById("signalWordCheck");
const corruptionIndexCheck = document.getElementById("corruptionIndexCheck");
var jsonData;
var cpi_scores;
var signalWordList;

var markMap = { purpose: "mark_purpose", iban: "mark_iban" }; // defines what classes to add to table cell, if suspicious attr is found
var smurfingRows = null;

document.onload = initialze();

function initialze() {
  goBtn.addEventListener("click", on_go_btn);
  smurfingAnalysisCheck.addEventListener("change", () => {
    fill_table(jsonData);
  });
  signalWordCheck.addEventListener("change", () => {
    fill_table(jsonData);
  });
  corruptionIndexCheck.addEventListener("change", () => {
    fill_table(jsonData);
  });
  cpi_scores = get_cpi_scores();
  signalWordList = get_signal_words();
}

function get_cpi_scores() {
  fetch("/get_cpi_scores").then((response) => {
    if (response.ok) {
      response.json().then((data) => (cpi_scores = data));
    } else {
      console.log("Problem with api: " + response.status);
    }
  });
}

function get_signal_words() {
  fetch("/get_signal_words").then((response) => {
    if (response.ok) {
      response.json().then((data) => (signalWordList = data));
    } else {
      console.log("Problem with api: " + response.status);
    }
  });
}

function fill_table(data) {
  resultTable.innerHTML = ""; // clear table

  // create table header
  let header = document.createElement("thead");
  let row = document.createElement("tr");
  row.innerHTML = `<th>#</th> 
                     <th>suspicious</th>`;
  for (attr in data[0]) {
    let th = document.createElement("th");
    th.classList.add(attr);
    th.innerHTML = attr;
    row.appendChild(th);
  }
  header.appendChild(row);

  // create table body
  let body = document.createElement("tbody");
  i = 1;
  if (smurfingAnalysisCheck.checked) {
    smurfingRows = SmurfingAnalysis(data);
  }
  for (const transaction of data) {
    var suspicious = false;
    let row = document.createElement("tr");
    row.innerHTML = `<th scope="row">${i++}</th>
                         <td>TBD</td>`;

    // fill cells
    cells_to_mark = getSingleTransactionMarks(transaction);
    for (attr in transaction) {
      let td = document.createElement("td");
      td.classList.add(attr); //needed to hide/unhide column
      td.innerHTML = transaction[attr];
      if (cells_to_mark.has(attr)) {
        td.classList.add(markMap[attr]);
        suspicious = true;
      }
      if (smurfingRows != null && smurfingRows.has(i) && attr == "amount") {
        td.classList.add("mark_transactionAmount");
        suspicious = true;
      }
      row.appendChild(td);

      if(suspicious)
      {
        //Change suspicious column to Yes/No TODO!!!
      }
    }
    body.appendChild(row);
  }

  resultTable.appendChild(header);
  resultTable.appendChild(body);

  SyncSelectedColumns();
}

function SyncSelectedColumns()
{
  let selColButtons = colSelectDiv.getElementsByTagName("button");
  for( var i = 0; i < selColButtons.length; i++)
  {
    if(selColButtons[i].classList.contains("pressed"))
    {
      var column = document.getElementsByClassName(selColButtons[i].id);

      for(var j = 0; j < column.length; j++)
      {
        column[j].classList.add("hidden");
      }
    }
  }
}

async function on_go_btn() {
  // read json file and fill table
  let file = fileInput.files[0];
  let reader = new FileReader();
  reader.onload = function () {
    let dataURL = reader.result;
    jsonData = JSON.parse(dataURL).transfers;
    fill_col_select(jsonData[0]);
    fill_table(jsonData);
    resultTable.classList.remove("hidden");
  };
  reader.readAsText(file);
}

function fill_col_select(header) {
  // This function creates the section above the results table,
  // that contains all the togglable columns

  colSelectDiv.innerHTML = ""; // clear first
  for (attr in header) {
    let btn = document.createElement("button");
    btn.type = "button";
    btn.name = attr;
    btn.innerHTML = attr;
    btn.id = attr;
    btn.classList.add("col_select");
    btn.addEventListener("click", toggleCol);
    colSelectDiv.appendChild(btn);
  }
}

function toggleCol(event) {
  // hide/unhide column
  event.target.classList.toggle("pressed");
  let elements_to_hide = document.getElementsByClassName(event.target.name);
  for (const element of elements_to_hide) {
    element.classList.toggle("hidden");
  }
}

function getSingleTransactionMarks(transaction) {
  "This function takes a transaction as input, applies filter and returns a set, that defines which table cells to mark";
  "output example: {iban, purpose, amount}";

  var markedCells = new Set();

  if (signalWordCheck.checked) {
    //check if signal words should be filtered
    for (let word of signalWordList) { //see if purpose of transaction has any signal words
      if (transaction.purpose.includes(word)) {
        markedCells.add("purpose");
        break;
      }
    }
  }

  if (corruptionIndexCheck.checked) {
    //check if corruption index should be filtered
    let transactionCountry = transaction.iban.substring(0, 2); //get country code from iban
    let corruptionIndex = cpi_scores[transactionCountry]["cpi_score"];
    if (corruptionIndex <= parseInt(inp_minKorrIdx.value)) markedCells.add("iban");
  }
  return markedCells;
}

function SmurfingAnalysis(data) {
  //returns a Set of Row Numbers to mark because of smurfing
  var index = 2; //Set First Row Number
  var eligibleTransactions = new Set([]);
  var indexesToMark = new Set();

  for (let transaction of data) { //Get Transactions with amounts that are valid for analysis
    if (Math.round(transaction.amount) <= parseInt(inp_minBetrag.value)) {
      eligibleTransactions.add([index, Math.round(transaction.amount)]);
    }
    index++;
  }

  for (let suspect of eligibleTransactions) { //check for each valid transaction
    var checkedSuspect = SmurfingCheck(suspect, eligibleTransactions);

    if (checkedSuspect != null) {
      for (let smurphIndex of checkedSuspect) {
        indexesToMark.add(smurphIndex); //add row to set
      }
    }
  }
  return indexesToMark;
}

function SmurfingCheck(check, allTransactions) {
  //Check Smurfing Parameters for one suspect
  var smurphIndexes = new Set();
  var occurences = 0; //number of similar transactions
  for (let elAmount of allTransactions) {
    if (check[0] != elAmount[0]) {
      //don't count suspect transaction
      if (VarianceCheck(check[1], elAmount[1])) {
        smurphIndexes.add(elAmount[0]); //add every row number that matches with suspect by parameters
        occurences++;
      }
    }
  }

  if (occurences >= parseInt(inp_minAnzahl.value)) {
    //check if minimum amount of similar transactions has been met
    smurphIndexes.add(check[0]); //add index of suspect itself
    return smurphIndexes;
  } else {
    return null; //return null to signal that no smurfing has been detected
  }
}

function VarianceCheck(amount, checkSum) {
  //analyse similarities based on given variance and amount
  lowestAmount = amount - amount * (parseInt(inp_varianz.value) / 100);
  highestAmount = amount + amount * (parseInt(inp_varianz.value) / 100);

  if (checkSum >= lowestAmount && checkSum <= highestAmount) return true;

  return false;
}
