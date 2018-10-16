var size = 3;

$(function() {
    console.log(this);

    var log = document.getElementById('console');

    tableCreate();

    window.addEventListener('keydown', function(e) {
        let valid = false;

        let code = e.keyCode ? e.keyCode : e.which;
        log.innerHTML = code;

        let elements = this.document.getElementsByClassName('current');
        let current = elements[0];
        let index = parseInt(current.id);
        let currentValue = current.innerHTML;

        log.innerHTML = '';
        if (code == 37 && (index % size != 1)) { //left arrow
            valid = true;
            log.innerHTML = 'left arrow';
            index = index - 1;
        } else if (code == 39 && (index % size != 0)) { //right arrow
            valid = true;
            log.innerHTML = 'right arrow';
            index = index + 1;
        } else if (code == 38 && (index > size)) { //up arrow 
            valid = true;
            log.innerHTML = 'up arrow';
            index = index - 3;
        } else if (code == 40 && (index <= (size * (size - 1)))) { //down arrow
            valid = true;
            log.innerHTML = 'down arrow';
            index = index + 3;
        }

        if (valid) {
            current.classList.remove("current");
            let next = document.getElementById(index);
            next.classList.add("current");
            let nextValue = next.innerHTML;
            current.innerHTML = nextValue;
            next.innerHTML = currentValue;

            isFinish();
        }

        //log.innerHTML = code + '-' + index;
    });
});

function tableCreate() {
    var body = document.getElementById('puzzle');
    var tbl = document.createElement('table');
    tbl.id = "puzzleTable"
    tbl.style.width = '100%';
    tbl.setAttribute('border', '1');
    var tbdy = document.createElement('tbody');
    let value = 0;
    let last = size * size;
    for (var i = 0; i < size; i++) {
        var tr = document.createElement('tr');
        for (var j = 0; j < size; j++) {
            var td = document.createElement('td');
            td.appendChild(document.createTextNode(++value))
            td.id = value;
            td.classList.add('button');
            if (value === last) {
                td.classList.add('current');
            }
            tr.appendChild(td)
        }
        tbdy.appendChild(tr);
    }
    tbl.appendChild(tbdy);
    body.appendChild(tbl)
}

function isFinish() {
    let valid = true;
    let buttons = document.getElementsByClassName('button');

    buttons.forEach(i => {
        console.log(i.id);
        valid = i.innerHTML == i.id;
        if (!valid) break;
    });

    if (valid) alert('Finish!');
}