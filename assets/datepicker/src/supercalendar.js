DP.define(['Booking::common/calendarmodel', 'event/live'], function (D, require) {
    var CalendarModel = require('Booking::common/calendarmodel'),
    LIVE = require('event/live'),
    $ = D.DOM,

    DEFAULT_OPTIONS = {
        disable: false
    }

    var SuperCalendar = D.Class({
        Implements: 'events',
        initialize: function (year, month, options) {
            if (D.isObject(year)) {
                options = year
                year = null
            }
            options = options || {}
            this.options = D.mix(D.clone(DEFAULT_OPTIONS), options)
            year = year || 1700
            month = month || 1
            this.model = new CalendarModel(year, month)
            this.ensureElement()
            this.bindEvent()
        },
        ensureElement: function () {
            this.el = $.create('div', {
                'class': 'mth-bx'
            })
        },
        setYearMonth: function (year, month) {
            this.model.setYear(year)
            this.model.setMonth(month)
        },
        bindEvent: function () {
            var that = this
            LIVE.on(this.el, 'click', 'a.inMonth', function (evt) {
                var date = new Date(that.model.getYear(), that.model.getMonth() - 1, $(this).attr('data-day'))
                that.fire('select', date)
            })
            this.model.on('change', function () {
                that.render()
            })
        },
        render: function () {
            var html = [],
            days,
            i
            days = this.model.getDays()
            html.push('<h6>' + this.model.getMonthString() + '</h6>')
            html.push('<table width="100%" border="0" cellpadding="0" cellspacing="0"> <tr> <th scope="col">一</th> <th scope="col">二</th> <th scope="col">三</th> <th scope="col">四</th> <th scope="col">五</th> <th scope="col"><strong>六</strong></th> <th scope="col"><strong>日</strong></th> </tr>')
            for (i = 0; i < days.length; i = i + 7) {
                html.push('<tr>')
                html.push(this.dayToHTML(days[i]))
                html.push(this.dayToHTML(days[i + 1]))
                html.push(this.dayToHTML(days[i + 2]))
                html.push(this.dayToHTML(days[i + 3]))
                html.push(this.dayToHTML(days[i + 4]))
                html.push(this.dayToHTML(days[i + 5]))
                html.push(this.dayToHTML(days[i + 6]))
                html.push('</tr>')
            }
            html.push('</table>')
            this.el.html(html.join(''))
            return this.el
        },
        nextMonth: function () {
            this.model.nextMonth()
            this.render()
        },
        preMonth: function () {
            this.model.preMonth()
            this.render()
        },
        dayToHTML: function (day) {
            if (day.at != 'thisMonth') {
                return '<td><a href="javascript:void(0)" class="outday"></a></td>'
            } else {
                if (this.isDisableDay(day)) {
                    return '<td><a href="javascript:void(0)" class="outday" data-day="' + day.getDate() + '">' + day.getDate() + '</a></td>'
                }
                if (this.isInSelectRange(day)) {
                    return '<td><a href="javascript:void(0)" class="inMonth onday" data-day="' + day.getDate() + '">' + day.getDate() + '</a></td>'
                } else {
                    return '<td><a href="javascript:void(0)" class="inMonth" data-day="' + day.getDate() + '">' + day.getDate() + '</a></td>'
                }
            }
        },
        isDisableDay: function (day) {
            if ( !! this.options.disable) {
                if (this.options.disable.begin.getTime() > day.getTime() || this.options.disable.end.getTime() < day.getTime()) {
                    return true
                }
            }
            return false
        },
        isInSelectRange: function (day) {
            if (this.rangeBegin && this.rangeEnd) {
                if (!(this.rangeBegin.getTime() > day.getTime() || this.rangeEnd.getTime() < day.getTime())) {
                    return true
                }
            }
            return false
        },
        getYear: function () {
            return this.model.year
        },
        getMonth: function () {
            return this.model.month
        },
        setSelectRange: function (rangeBegin, rangeEnd) {
            // console.log(rangeBegin, rangeEnd)  
            this.rangeBegin = rangeBegin              
            this.rangeEnd = rangeEnd
            this.model.fire('change')
        }
    })

    return SuperCalendar
});

