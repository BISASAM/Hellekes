const resultTableBody = document.getElementById("resultTableBody");
const contextMenu = document.getElementById("contextMenu");
const $contextMenu = $("#contextMenu");

//context menu buttons
const editBtn = document.getElementById("editBtn");
const cancelBtn = document.getElementById("cancelBtn");

let contextMenuVisible;
let countryCodeOfRow;
let cpi_score;

document.onload = initialze();

async function initialze() {
  countryCodeOfRow = -1;

  cpi_scores = await get_cpi_scores();
  fill_table(cpi_scores);

  // on click hide context menu
  window.addEventListener("click", function () {
    if (contextMenuVisible) {
      $contextMenu.hide();
      contextMenuVisible = false;
    }
  });

  //context menu buttons
  editBtn.addEventListener("click", onEditBtn);
  editModalBtn.addEventListener("click", onSaveBtn);
  //delBtn.addEventListener('click', onDelBtn);
  cancelBtn.addEventListener("click", function () {
    countryCodeOfRow = -1;
  });
}

async function get_cpi_scores() {
  const response = await fetch("/get_cpi_scores");
  // 200 means "ok".
  if (response.status !== 200) {
    console.log("Problem with api: " + response.status);
  }

  const cpi_scores = await response.json();
  return cpi_scores;
}

function fill_table(data) {
  resultTableBody.innerHTML = ""; // clear table

  // create table body
  i = 1;
  for (const country in data) {
    let row = document.createElement("tr");
    row.innerHTML = `<th scope="row">${i++}</th>
                         <td>${country}</td>
                         <td>${data[country]["country_name"]}</td>
                         <td>${data[country]["cpi_score"]}</td>`;
    row.addEventListener("contextmenu", showContextMenu);
    resultTableBody.appendChild(row);
  }
}

function showContextMenu(event) {
  event.preventDefault();
  $contextMenu.css({
    display: "block",
    left: event.pageX,
    top: event.pageY,
  });
  contextMenuVisible = true;
  countryCodeOfRow = event.target.parentElement.getElementsByTagName("td")[0]
    .innerHTML;

  return false;
}

function onEditBtn() {
  // find correct entry in schedule
  const data = cpi_scores[countryCodeOfRow];

  showEditModal(data);
}

function showEditModal(data) {
  const editModalBody = document.getElementById("editModalBody");

  //clear table
  editModalBody.innerHTML = "";

  editModalBody.innerHTML = `
    Code: <span id="cc">${countryCodeOfRow}</span><br>
    Name: ${data["country_name"]}<br>
    CPI Score: <input type="text" id="cpi_score" value="${data["cpi_score"]}"> <br>
    `;
  countryCodeOfRow = -1;
  $("#editModal").modal();
}

async function onSaveBtn() {
  let cc = document.getElementById("cc").innerHTML;
  let score = document.getElementById("cpi_score").value;

  const response = await fetch(`change_cpi_score?cc=${cc}&score=${score}`);
  if (response.status !== 200) {
    console.log("Problem with api: " + response.status);
  } else {
    initialze();
    console.log("supi");
  }
  $("#editModal").modal("hide");
}

function goBack() {
  window.history.back();
}
