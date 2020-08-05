const goBtn = document.getElementById("goBtn");
const dataTable = document.getElementById("dataTable");


document.onload = initialze();

function initialze() {
    goBtn.addEventListener("click", on_go_btn);
}


async function on_go_btn() {
    const response = await fetch("/get_data");
    if (response.status !== 200) {
        console.log('Problem with api: ' + response.status);
    }
    else {
        data = await response.json();
        fill_table(data);
        var tableDiv = document.getElementById("table");
        tableDiv.classList.remove("hidden");
    }
}

function fill_table(data) {
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

