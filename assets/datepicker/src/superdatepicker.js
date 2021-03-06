DP.define(['Booking::common/supercalendar', 'dom/dimension'], function (D, require) {
    var Calendar = require('Booking::common/supercalendar'),
    $ = D.DOM,
    DIM = require('dom/dimension'),

    DEFAULT_CONFIG = {
        isDouble: false,
        disable: false,
        isSelectRange: false,
        format: function (date) {
            return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate()
        }
    }

    var SuperDatePicker = D.Class({
        Implements: 'events',
        initialize: function (input, options) {
            options = options || {}
            this.options = D.mix(D.clone(DEFAULT_CONFIG), options)
            this.input = input
            this.selectRange = []
            this.selectCount = 0
            this.ensureElement()
            this.calendar = new Calendar({
                disable: this.options.disable
            })
            if (this.options.isDouble) {
                this.rightCalendar = new Calendar({
                    disable: this.options.disable
                })
                this.rightCalendar.el.addClass('mth-bxscend')
                this.rightCalendar.nextMonth()
            } else {
                this.el.css({
                    width: '182px'
                })
            }
            this.setDate()
            this.bindEvent()
            this.render()
            this.el.css({
                'display': 'none'
            })
            this.el.inject($('body'))
        },
        setDate: function () {
            var dateString = this.input.val(),
            date,
            disable,
            rangeBegin,
            rangeEnd
            if (!this.options.isSelectRange) {
                dateString = dateString || ''
                dateString = dateString.replace(/-/ig, '/')
                date = new Date(dateString)
                if (!date.getTime()) {
                    date = new Date()
                }
                // For disable test
                disable = this.options.disable
                if (disable) {
                    if (date.getTime() < disable.begin.getTime()) {
                        date = disable.begin
                    } else if (date.getTime() > disable.end.getTime()) {
                        date = disable.end
                    }
                }
                this.calendar.setYearMonth(date.getFullYear(), date.getMonth() + 1)
                this.rightCalendar && this.rightCalendar.setYearMonth(date.getFullYear(), date.getMonth() + 2)
            } else {
                dateString = dateString || ''
                dateString = dateString.trim()
                if (dateString == '') { // No value
                    date = new Date()
                    rangeBegin = null,
                    rangeEnd = null
                } else {
                    dateString = dateString.split('-')
                    rangeBegin = new Date(dateString[0])
                    rangeEnd = new Date(dateString[1])
                    date = rangeBegin
                }

                // For disable test
                disable = this.options.disable
                if (disable) {
                    if (date.getTime() < disable.begin.getTime()) {
                        date = disable.begin
                    } else if (date.getTime() > disable.end.getTime()) {
                        date = disable.end
                    }
                }
                this.calendar.setSelectRange(rangeBegin, rangeEnd)
                this.rightCalendar && this.rightCalendar.setSelectRange(rangeBegin, rangeEnd)

                this.calendar.setYearMonth(date.getFullYear(), date.getMonth() + 1)
                this.rightCalendar && this.rightCalendar.setYearMonth(date.getFullYear(), date.getMonth() + 2)
            }
        },
        ensureElement: function () {
            this.el = $.create('div', {
                'class': 't-warp'
            }).html('<div class="mth-bx-wrapper"> </div> <a href="javascript:void(0)" class="toleft" title="?????????"></a><a href="javascript:void(0)" class="toright" title="?????????"></a> <a href="javascript:void(0)" class="m-close" title="??????">??????</a>')
            this.el.css({
                'position': 'absolute'
            })
            this._calendarWrapper = this.el.one('.mth-bx-wrapper')
        },
        bindEvent: function () {
            var that = this
            $(document.body).on('click', function (evt) {
                if (evt.target != that.input.el(0)) {
                    that.close()
                }
            })
            this.el.on('click', function (evt) {
                evt.stop()
            })
            this.input.on('click', function (evt) {
                that.open()
            })
            this.el.one('.m-close').on('click', function () {
                that.close()
            })
            this.el.one('.toleft').on('click', function () {
                that.preMonth()
            })
            this.el.one('.toright').on('click', function () {
                that.nextMonth()
            })

            this.calendar.on('select', function (date) {
                that.fire('select', date)
            })
            this.rightCalendar && this.rightCalendar.on('select', function (date) {
                that.fire('select', date)
            })
            this.on('select', function (date) {
                that.onDateSelect(date)
            })
        },
        onDateSelect: function (date) {
            var format = this.options.format
            if (!this.options.isSelectRange) {
                this.input.val(format(date))
                this.close()
            } else {
                this.selectCount++
                this.selectRange[this.selectCount - 1] = date
                if (this.selectCount == 1) {
                    this.calendar.setSelectRange(date, date)
                    this.rightCalendar && this.rightCalendar.setSelectRange(date, date)
                }
                if (this.selectCount == 2) {
                    if (this.selectRange[0].getTime() > date.getTime()) {
                        this.selectRange[1] = this.selectRange[0]
                        this.selectRange[0] = date
                    }
                    this.input.val(format(this.selectRange[0]) + '-' + format(this.selectRange[1]))
                    this.fire('rangeSelect', this.selectRange[0], this.selectRange[1])
                    this.close()
                }
            }
        },
        render: function () {
            this.calendar.render().inject(this._calendarWrapper)
            if (this.options.isDouble) {
                this.rightCalendar.render().inject(this._calendarWrapper)
            }
            return this.el
        },
        open: function () {
            var offset, size
            this.setDate()
            offset = DIM.offset(this.input)
            size = DIM.size(this.input)
            this.el.css({
                left: offset.left,
                top: offset.top + size.height
            })
            this.el.css({
                'display': 'block'
            })

            // For Select Date Range
            this.selectCount = 0
        },
        close: function () {
            this.el.css({
                'display': 'none'
            })
        },
        nextMonth: function () {
            var calendar, nextMonthDay, end, endMonthDay
            if ( !! this.options.disable) {
                calendar = this.calendar
                calendar = this.rightCalendar || calendar
                nextMonthDay = new Date(calendar.getYear(), calendar.getMonth()),
                end = this.options.disable.end,
                endMonthDay = new Date(end.getFullYear(), end.getMonth())
                if (nextMonthDay.getTime() > endMonthDay.getTime()) {
                    return false
                }
            }
            this.calendar.nextMonth()
            this.rightCalendar && this.rightCalendar.nextMonth()
        },
        preMonth: function () {
            var calendar, preMonthDay, begin, beginMonthDay
            if ( !! this.options.disable) {
                calendar = this.calendar
                preMonthDay = new Date(calendar.getYear(), calendar.getMonth() - 2),
                begin = this.options.disable.begin,
                beginMonthDay = new Date(begin.getFullYear(), begin.getMonth())
                if (preMonthDay.getTime() < beginMonthDay.getTime()) {
                    return false
                }
            }
            this.calendar.preMonth()
            this.rightCalendar && this.rightCalendar.preMonth()
        },
        setInput: function (input) {
            this.input = $(input)
        },
        getInput: function () {
            return this.input
        }
    })
    return SuperDatePicker
});

