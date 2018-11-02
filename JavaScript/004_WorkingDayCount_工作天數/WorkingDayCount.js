var sYear = 2018;
var sMonth = 11;
var sDay = 2;
//var nMonth = 2;
//var nDay = nMonth * 30;

//		30d		60d
// WD	22		44
// Max	109		336
// Min	58		285


var oneWayTicket = 28;
var easyCardOff = 0.9;
var oneMonthTicketOff = 0.85;
var towMonthTicketOff = 0.8;

var holiday = new Array(0);
holiday.push(new CDate(2018, 1, 1));
holiday.push(new CDate(2018, 2, 15));
holiday.push(new CDate(2018, 2, 16));
holiday.push(new CDate(2018, 2, 19));
holiday.push(new CDate(2018, 2, 20));
holiday.push(new CDate(2018, 2, 28));
holiday.push(new CDate(2018, 4, 4));
holiday.push(new CDate(2018, 4, 5));
holiday.push(new CDate(2018, 4, 6));
holiday.push(new CDate(2018, 5, 1));
holiday.push(new CDate(2018, 6, 18));
holiday.push(new CDate(2018, 9, 24));
holiday.push(new CDate(2018, 10, 10));
holiday.push(new CDate(2018, 12, 31));
//2019
holiday.push(new CDate(2019, 1, 1));
holiday.push(new CDate(2019, 2, 4));
holiday.push(new CDate(2019, 2, 5));
holiday.push(new CDate(2019, 2, 6));
holiday.push(new CDate(2019, 2, 7));
holiday.push(new CDate(2019, 2, 8));
holiday.push(new CDate(2019, 2, 28));

var workingDay = new Array(0);
workingDay.push(new CDate(2018, 3, 31));
workingDay.push(new CDate(2018, 12, 22));
//2019
workingDay.push(new CDate(2019, 1, 19));
workingDay.push(new CDate(2019, 2, 23));

function CDate(year, month, day) {
    this.year = year;
    this.month = month;
    this.day = day;

    this.toDate = function() {
        return new Date(this.year, this.month - 1, this.day, 0, 0, 0, 0);
    }

    this.toString = function() {
        var date = this.toDate();
        return date.getFullYear() + ", " + (date.getMonth() + 1) + ", " + date.getDate();

    }

    this.addDay = function(nDay) {
        var cDate = new CDate(this.year, this.month, this.day + nDay - 1);
        var date = cDate.toDate();
        return new CDate(date.getFullYear(), date.getMonth() + 1, date.getDate(), 0, 0, 0, 0);
    }

    this.countDays = function(eDate) {
        var ms = eDate.toDate() - this.toDate();
        //console.log(ms);
        var days = ms / 1000 / 60 / 60 / 24;
        days += 1;
        return days;
    }

    this.isHoliday = function() {

        //console.log(holiday);
        //console.log(holiday.length);
        //return holiday.includes(this);
        for (var i = 0; i < holiday.length; i++) {
            //console.log(i);
            var iCDay = holiday[i];
            //console.log(iCDay);
            //console.log(this);
            if (this.equal(iCDay)) {
                //console.log("*** Holiday Day: " + iCDay.toString());


                return true;
            }
        }
        return false;
    }

    this.isWorkingDay = function() {
        for (var i = 0; i < workingDay.length; i++) {

            var iCDay = workingDay[i];
            if (this.equal(iCDay)) {
                //console.log("Working Day: " + iCDay.toString());
                return true;
            }
        }
        return false;
    }

    this.getWeek = function() {
        var iDay = this.toDate();
        var week = iDay.getDay();
        return week;
    }

    this.countWorkingDays = function(eDate) {
        var workingDays = 0;

        var workday = 0;
        var holiday = 0;
        var weekend = 0;
        var days = this.countDays(eDate);
        //console.log(days);

        for (var i = 0; i < days; i++) {
            var iCDay = this.addDay(i);
            //console.log(iCDay.toString());
            var week = iCDay.getWeek();
            //console.log(week);
            if (iCDay.isWorkingDay() == true) {
                //console.log("Weekend: " + iCDay.toString());
                workday++;
                workingDays++;
            } else if (iCDay.isHoliday() == true) {
                //console.log("***Holiday: " + iCDay.toString());
                holiday++;
            } else if (week == 0 || week == 6) {
                //console.log("Weekend: " + iCDay.toString());
                weekend++;
            } else {
                workingDays++;
            }
        }
        //console.log("Holiday Count: " + holiday);
        //console.log("Weekend Count: " + weekend);
        //console.log("Working Day Count: " + workingDays + "(" + workday + ")");
        return workingDays;
    }

    this.equal = function(date) {
        //console.log(this.year + ", " + date.year);
        return this.year == date.year && this.month == date.month && this.day == date.day;
    }
};

//計算30日,60日票價
function TrainPrice(sCDate) {
    this.sDate = sCDate;
    this.eDate = new Array(0);

    this.days = new Array(0);
    this.workingDays = new Array(0);
    this.monthTicketPrice = new Array(0);
    this.easyCardPrice = new Array(0);
    this.differencePrice = new Array(0);

    this.calculate = function() {
        for (var i = 0; i < 2; i++) {
            var nMonth = i + 1;
            this.days.push(nMonth * 30);
            this.eDate.push(this.sDate.addDay(this.days[i]));
            this.workingDays.push(this.sDate.countWorkingDays(this.eDate[i]));

            var monthTicketOff = oneMonthTicketOff;
            if (nMonth == 2) monthTicketOff = towMonthTicketOff;
            this.monthTicketPrice.push(Math.round(nMonth * 21 * oneWayTicket * 2 * monthTicketOff));
            this.easyCardPrice.push(Math.round(this.workingDays[i] * oneWayTicket * 2 * easyCardOff));
            this.differencePrice.push(this.easyCardPrice[i] - this.monthTicketPrice[i]);
        }
    }

    this.print = function() {
        for (var i = 0; i < 2; i++) {
            var nMonth = i + 1;
            console.log("======");
            console.log("Month Count: " + nMonth);
            console.log("Start Day: " + this.sDate.toString());
            console.log("End Day: " + this.eDate[i].toString());
            console.log("Days: " + this.days[i]);
            console.log("WorkingDays: " + this.workingDays[i]);
            console.log("Month Ticket Price: " + this.monthTicketPrice[i]);
            console.log("Easy Card Price: " + this.easyCardPrice[i]);
            console.log("Different Price: " + this.differencePrice[i]);
        }
    }
}

//找出30日 = 22 工作日,60日 = 44 工作日
function BestDay(sCDate) {
    this.sDate = sCDate;
    //this.eDate = new CDate(this.sDate.year, 12, 31);
    this.eDate = sDate.addDay(100);
    this.days = this.sDate.countDays(this.eDate);

    this.find = function() {
        for (var i = 0; i < this.days; i++) {
            var sd = this.sDate.addDay(i);

            var ed60 = sd.addDay(60);
            var wd60 = sd.countWorkingDays(ed60)
            if (wd60 > 39) {
                console.log("Best 60 Day: " + sd.toString() + "- " + wd60);
            }

            var ed30 = sd.addDay(30);
            var wd30 = sd.countWorkingDays(ed30)
            if (wd30 > 21) {
                console.log("Best 30 Day: " + sd.toString() + "- " + wd30);
            }
        }
    }
}


var sDate = new CDate(sYear, sMonth, sDay);

var bestDay = new BestDay(sDate);
var bDay = bestDay.find();

var bDate = new CDate(sYear, 11, 2);
var trainPrice = new TrainPrice(bDate);
trainPrice.calculate();
trainPrice.print();