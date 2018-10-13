$(function() {
    console.log("ready!");
    var log = document.getElementById('console');

    tableCreate();

    window.addEventListener('keydown', function(e) {
        var code = e.keyCode ? e.keyCode : e.which;
        this.console.log(code);
        log.innerHTML = code;
        if (code == 78 && code == 17) { //ctrl + n
            e.preventDefault();
            alert("no new window");
            //further actions
        }
    })
});

function tableCreate() {
    var body = document.getElementById('puzzle');
    var tbl = document.createElement('table');
    tbl.id = "puzzleTable"
    tbl.style.width = '100%';
    tbl.setAttribute('border', '1');
    var tbdy = document.createElement('tbody');
    let value = 0;
    let size = 3;
    let last = size * size;
    for (var i = 0; i < size; i++) {
        var tr = document.createElement('tr');
        for (var j = 0; j < size; j++) {
            var td = document.createElement('td');
            td.appendChild(document.createTextNode(++value))
            if (value === last) {
                td.className = "current";
            }
            tr.appendChild(td)
        }
        tbdy.appendChild(tr);
    }
    tbl.appendChild(tbdy);
    body.appendChild(tbl)
}