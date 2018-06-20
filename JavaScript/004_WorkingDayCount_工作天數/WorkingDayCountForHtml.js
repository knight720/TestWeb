function doAlert() {
    alert("alert!");
}

function calculate() {
    //doAlert();
    var month = $("#month").val();
    var day = $("#day").val();

    printMessage(month);
    printMessage(day);
}

function printMessage(msg) {
    $(".message").text(msg);
}