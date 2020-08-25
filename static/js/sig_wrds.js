const resultTableBody = document.getElementById("resultTableBody");
const contextMenu = document.getElementById("contextMenu");
const $contextMenu = $("#contextMenu");

//context menu buttons
const newBtn = document.getElementById("newBtn");
const editBtn = document.getElementById("editBtn");
const delBtn = document.getElementById("delBtn");
const cancelBtn = document.getElementById("cancelBtn");

let contextMenuVisible;
let old_sig_word;
let signal_words;
let mode;

document.onload = initialze();

async function initialze() {
  countryCodeOfRow = -1;

  signal_words = await get_signal_words();
  fill_table(signal_words);

  // on click hide context menu
  window.addEventListener("click", function () {
    if (contextMenuVisible) {
      $contextMenu.hide();
      contextMenuVisible = false;
    }
  });

  //context menu buttons
  editBtn.addEventListener("click", onEditBtn);
  newBtn.addEventListener("click", onNewtBtn);
  delBtn.addEventListener("click", onDeltBtn);
  editModalBtn.addEventListener("click", onSaveBtn);
  //delBtn.addEventListener('click', onDelBtn);
  cancelBtn.addEventListener("click", function () {
    countryCodeOfRow = -1;
  });
}

async function get_signal_words() {
  const response = await fetch("/get_signal_words");
  // 200 means "ok".
  if (response.status !== 200) {
    console.log("Problem with api: " + response.status);
  }

  const sig_word = await response.json();
  return sig_word;
}

function fill_table(data) {
  resultTableBody.innerHTML = ""; // clear table

  // create table body
  i = 1;
  for (const word of data) {
    let row = document.createElement("tr");
    row.innerHTML = `<th scope="row">${i++}</th>
                    <td>${word}</td>`;
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
  old_sig_word = event.target.parentElement.getElementsByTagName("td")[0]
    .innerHTML;

  return false;
}

function onEditBtn() {
  mode = "edit";
  showEditModal(old_sig_word, "edit");
}

function onNewtBtn() {
  mode = "new";
  showEditModal("Neues Wort", "new");
}

async function onDeltBtn() {
  const response = await fetch(`del_sig_word?w=${old_sig_word}`);
  if (response.status !== 200) {
    console.log("Problem with api: " + response.status);
  } else {
    old_sig_word = -1;
    initialze();
    console.log("supi");
  }
}

function showEditModal(data) {
  const editModalBody = document.getElementById("editModalBody");

  //clear table
  editModalBody.innerHTML = "";

  editModalBody.innerHTML = `
    Signalwort: <input type="text" id="sig_word" value="${data}"> <br>
    `;
  $("#editModal").modal();
}

async function onSaveBtn() {
  let new_sig_word = document.getElementById("sig_word").value;

  let url =
    mode == "new"
      ? `new_sig_word?n=${new_sig_word}`
      : `change_sig_word?o=${old_sig_word}&n=${new_sig_word}`;

  const response = await fetch(url);
  if (response.status !== 200) {
    console.log("Problem with api: " + response.status);
  } else {
    old_sig_word = -1;
    initialze();
    console.log("supi");
  }
  $("#editModal").modal("hide");
}

function goBack() {
  window.history.back();
}
