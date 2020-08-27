const createBtn = document.getElementById("create_export");
const downloadBtn = document.getElementById("download_export");
const passwordCheck = document.getElementById("password_check");
//const linesCheck = document.getElementById("limit_lines");
const filterCheck = document.getElementById("include_filter");
const hide_columnsCheck = document.getElementById("include_hidden")
const inp_password = document.getElementById("password");
//const inp_lines = document.getElementById("selected_lines");

document.onload = initialze();

async function initialze() {
  createBtn.addEventListener("click", export_to_excel);
}


function export_to_excel() {
  let data = {};
  data["table"] = sessionStorage.getItem("resultTable");
  if (passwordCheck.checked) {
    data["password"] = inp_password.value;
  }
  /* if (linesCheck.checked) {
    data["lines"] = inp_lines.value;
  } */
  data["filter"] = filterCheck.checked;
  data["hide_columns"] = include_hidden.checked;
  postData(data).then(function(response) {
    if(response.ok) {
      downloadBtn.classList.remove("hidden");
    }
  });
}

async function postData(data = {}) {
  const response = await fetch("/export_to_excel", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response;
}

function goBack() {
  window.history.back();
}
