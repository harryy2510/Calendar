const CalendarHeader = (header) => (
    `<div class="calendar-header">
        <button data-value="-1" class="calendar-header-button calendar-back-arrow"></button>
        ${header}
        <button data-value="1" class="calendar-header-button calendar-next-arrow"></button>
    </div>`
)
const CalendarWeekDates = (dates, value) => (
    `<div class="calendar-weekdates">
        ${dates.map(date => `<button ${date ? 'data-value="' + date.toISOString() + '"' : 'disabled'} class="calendar-date ${date && value.valueOf() === date.valueOf() ? 'active' : ''}">${date ? date.getDate() : ''}</button>`).join('')}
    </div>`
)
const CalendarWeekDays = (weekdays) => (
    `<div class="calendar-week calendar-weekdays">
        ${weekdays.map(day => `<div class="calendar-day">${day}</div>`).join('')}
    </div>`
)
const Calendar = ({ weekdays, dates, header, value }) => (
    `<div class="calendar">
        ${CalendarHeader(header)}
        ${CalendarWeekDays(weekdays)}
        ${CalendarWeekDates(dates, value)}
    </div>`
)

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const currentDate = new Date()
currentDate.setHours(0,0,0,0)

class CalendarPicker extends HTMLElement {
  static get observedAttributes() {
    return ['value'];
  }

  constructor() {
    super();
  }

  _value = currentDate
  get value() {
    return this._value
  }
  set value(newValue) {
    this._value = newValue
    this.month = new Date(newValue.getFullYear(), newValue.getMonth(), 1)
    this.setAttribute('value', newValue.toISOString());
  }

  _month = new Date(this.value.getFullYear(), this.value.getMonth(), 1)
  get month() {
    return this._month
  }
  set month(newMonth) {
    this._month = newMonth
    this.render()
  }

  get weekdays() {
    return ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  }
  get header() {
    return `${monthNames[this.month.getMonth()]}, ${this.month.getFullYear()}`
  }
  get dates() {
    const year = this.month.getFullYear()
    const month = this.month.getMonth()
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)
    const startIndex = startDate.getDay()
    const daysInMonth = endDate.getDate()
    const endIndex = daysInMonth + startIndex - 1
    const weeksInMonth = Math.ceil((daysInMonth + startIndex) / 7)
    const dates = []
    for (let i = 0; i < (weeksInMonth * 7); i ++) {
      if (i >= startIndex && i <= endIndex) {
        dates.push(new Date(year, month, (i - startIndex) + 1))
      } else {
        dates.push(null)
      }
    }
    return dates
  }

  get state() {
    return {
      weekdays: this.weekdays,
      dates: this.dates,
      header: this.header,
      value: this.value
    }
  }

  handleClick(event) {
    const el = event.target
    if (el.nodeName === 'BUTTON') {
      if (el.classList.contains('calendar-date')) {
        const date = el.getAttribute('data-value')
        this.value = new Date(date)
      } else if (el.classList.contains('calendar-header-button')) {
        const offset = parseInt(el.getAttribute('data-value'))
        let nextMonth = this.month.getMonth() + offset
        let nextYear = this.month.getFullYear()
        if (nextMonth < 0) {
          nextMonth = 11
          nextYear = nextYear - 1
        }
        if (nextMonth > 11) {
          nextMonth = 0
          nextYear = nextYear + 1
        }
        this.month = new Date(nextYear, nextMonth, 1)
      }
    }
  }

  addEventListeners() {
    this.addEventListener('click', this.handleClick, true)
  }

  removeEventListeners() {
    this.removeEventListener('click', this.handleClick, true)
  }

  render() {
    if (this.innerHTML) {
      this.destroy()
    }
    this.innerHTML = Calendar(this.state)
    this.addEventListeners()
  }

  destroy() {
    this.removeEventListeners()
    this.innerHTML = ''
  }

  connectedCallback() {
    this.render()
  }

  disconnectedCallback() {
    this.destroy()
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    if (oldVal !== newVal) {
      this.value = new Date(newVal)
    }
  }
}

window.customElements.define('calendar-picker', CalendarPicker);
