const goBtn = document.getElementById("goBtn");
const resultTable = document.getElementById("resultTable");
const fileInput = document.getElementById("fileInput");
var jsonData;


document.onload = initialze();

function initialze() {
    goBtn.addEventListener("click", on_go_btn);
}


async function on_go_btn() {
    let file = fileInput.files[0];
    let reader = new FileReader();
    reader.onload = function(){
        let dataURL = reader.result;
        jsonData = JSON.parse(dataURL).transfers;
        fill_table(jsonData);
        resultTable.classList.remove("hidden");
    };
    reader.readAsText(file);
}

function fill_table(data) {
    tableBody.innerHTML = "";  // clear table
    i = 1;
    for (const entry of data) {
        let row = document.createElement('tr');
        row.innerHTML = `<th scope="row">${i++}</th>
                         <td>${entry.createdDate}</td>
                         <td>${entry.lastModifiedDate}</td>
                         <td>${entry.lockVersion}</td>
                         <td>${entry.organizationId}</td>
                         <td>${entry.bankTransferReportItemId}</td>
                         <td>${entry.bankTransferId}</td>
                         <td>${entry.financialAccountId}</td>
                         <td>${entry.amount}</td>
                         <td>${entry.bankTransferDate}</td>
                         <td>${entry.recipientIban}</td>
                         <td>${entry.recipientBic}</td>
                         <td>${entry.recipientName}</td>
                         <td>${entry.purpose}</td>
                         <td>${entry.accountHolder}</td>
                         <td>${entry.accountSystem}</td>
                         <td>${entry.accountType}</td>
                         <td>${entry.bankName}</td>
                         <td>${entry.iban}</td>
                         <td>${entry.bic}</td>`;
        tableBody.appendChild(row);
    }
}

