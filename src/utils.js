let time = null
export const debounce = (fnc, delay = 500) => {
  if (time) clearTimeout(time)
  time = setTimeout(() => {
    fnc()
  }, delay)
}

export const createElement = (tag, callback) => {
  const el = document.createElement(tag)
  callback && callback(el)
  return el
}