const goBtn = document.getElementById("goBtn");
const resultTable = document.getElementById("resultTable");
const fileInput = document.getElementById("fileInput");
const colSelectDiv = document.getElementById("col_select");

const inp_minBetrag = document.getElementById("minBetrag");
const inp_minAnzahl = document.getElementById("minAnzahl");
const inp_varianz = document.getElementById("varianz");
const inp_minKorrIdx = document.getElementById("minKorrIdx");
var jsonData;


document.onload = initialze();

function initialze() {
    goBtn.addEventListener("click", on_go_btn);
}


function fill_table(data) {

    resultTable.innerHTML = "";  // clear table

    // create table header
    let header = document.createElement('thead');
    let row = document.createElement('tr');
    row.innerHTML = `<th>#</th> 
                     <th>suspicious</th>`
    for (attr in data[0]) {
        let th = document.createElement('th');
        th.classList.add(attr);
        th.innerHTML = attr;
        row.appendChild(th);
    }
    header.appendChild(row);

    // create table body
    let body = document.createElement('tbody');
    i = 1;
    for (const transaction of data) {
        let row = document.createElement('tr');
        row.innerHTML = `<th scope="row">${i++}</th>
                         <td>TBD</td>`

        // fill cells
        cells_to_mark = get_attr_to_mark(transaction);
        for (attr in transaction) { 
            let td = document.createElement('td');
            td.classList.add(attr);  //needed to hide/unhide column
            td.innerHTML = transaction[attr];
            if (cells_to_mark.has(attr)) {
                // attach class to row in order to mark it
            } 
            row.appendChild(td);
        }
        
        body.appendChild(row);
    }

    resultTable.appendChild(header);
    resultTable.appendChild(body);
}


async function on_go_btn() {
    // read json file and fill table
    let file = fileInput.files[0];
    let reader = new FileReader();
    reader.onload = function(){
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

    colSelectDiv.innerHTML = "";  // clear first
    for (attr in header) {
        let btn = document.createElement("button");
        btn.type = "button";
        btn.name = attr;
        btn.innerHTML = attr;
        btn.classList.add("col_select");
        btn.addEventListener('click', toggleCol);
        colSelectDiv.appendChild(btn);
    }
};


function toggleCol(event) {
    // hide/unhide column 
    console.log(event.target.name);
    event.target.classList.toggle("pressed");
    let elements_to_hide = document.getElementsByClassName(event.target.name);
    for (const element of elements_to_hide) {
        element.classList.toggle("hidden");
    }
    console.log(elements_to_hide);

}

function get_attr_to_mark(transaction) {
    "This function takes a transaction as input, applies filter and returns a set, that defines which table cells to mark"
    "output example: {iban, purpose, amount}"

    return new Set([]);
}



