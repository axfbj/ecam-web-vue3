import moment from 'moment'

export function dateFormat(date, formatStr = 'YYYY-MM-DD HH:mm:ss') {
  return moment(date).format(formatStr)
}
