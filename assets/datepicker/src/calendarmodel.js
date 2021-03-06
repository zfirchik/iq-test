DP.define(function (D, require) {

    var CalendarModel = D.Class({
        Implements: 'events',
        initialize: function (year, month, options) {
            // Mix otions
            this.year = year
            this.month = month
            this.days = []
            this.caculateDays()

        },
        setMonth: function (month) {
            if (month >= 13) {
                month = 1
                this.nextYear()
            }
            if (month <= 0) {
                month = 12
                this.preYear()
            }
            this.month = month
            this.caculateDays()
            this.fire('change')
        },
        getMonth: function () {
            return this.month
        },
        getMonthString: function () {
            return this.year + '年' + this.month + '月'
        },
        setYear: function (year) {
            this.year = year
            this.caculateDays()
            this.fire('change')
        },
        getYear: function () {
            return this.year
        },
        setDays: function (days) {
            this.days = days
        },
        getDays: function () {
            return this.days
        },
        preMonth: function () {
            var prevMonth = this.getMonth() - 1
            if (prevMonth < 1) {
                this.prevYear()
            } else {
                this.setMonth(prevMonth)
            }
            this.caculateDays()
            this.fire('change')
        },
        nextMonth: function () {
            var nextMonth = this.getMonth() + 1
            if (nextMonth > 12) {
                this.nextYear()
            } else {
                this.setMonth(nextMonth)
            }
            this.caculateDays()
            this.fire('change')
        },
        nextYear: function () {
            this.setMonth(1)
            this.setYear(this.getYear() + 1);
        },
        prevYear: function () {
            this.setMonth(12)
            this.setYear(this.getYear() - 1);
        },
        caculateDays: function () {
            var date = new Date(this.getYear(), this.getMonth() - 1, 1),
            day = date.getDay(),
            month = date.getMonth(),
            days = [],
            tempDate,
            i
            while (date.getMonth() === month) {
                tempDate = new Date(date.getTime())
                tempDate.at = 'thisMonth'
                days.push(tempDate)
                date.setDate(date.getDate() + 1)
            }
            day = day || 7
            date = new Date(days[0].getTime())
            for (i = day - 1; i > 0; i--) {
                date.setDate(date.getDate() - 1)
                tempDate = new Date(date.getTime())
                tempDate.at = 'lastMonth'
                days.unshift(tempDate)
            }
            if (days.length < 42) {
                date = new Date(days[days.length - 1].getTime())
                for (i = days.length; i < 42; i++) {
                    date.setDate(date.getDate() + 1)
                    tempDate = new Date(date.getTime())
                    tempDate.at = 'nextMonth'
                    days.push(tempDate)

                }
            }
            this.setDays(days)
        }
    })
    
    return CalendarModel
});

