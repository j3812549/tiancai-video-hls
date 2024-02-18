import './index.css'
import * as Utils from './utils.js'
import Hls from './hls'

const formatterTime = v => {
  if (typeof v === 'string') return v
  const time = new Date(v * 1000)
  const pad = (timeEl, total = 2, str = '0') => {
    return timeEl.toString().padStart(total, str)
  }
  const hours = time.getUTCHours()
  const minutes = time.getUTCMinutes()
  const seconds = time.getSeconds()
  if (hours === 0) return `${pad(minutes)}:${pad(seconds)}`
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

function checkedMobile() {
  if (window.navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)) {
    return true // 移动端
  } else {
    return false // PC端
  }
}



class Main {
  isFullscreen = false
  isPlay = false
  isLoading = true
  isError = false
  showContainer = false
  #watchData = {} // 管理监听属性

  #onShowContainerTime = null
  #isMobile = checkedMobile()
  #box = null
  #warp = null
  #instance = null
  #video = null
  #sources = []
  #index = 0
  #processAutoStatus = true
  #processMark = {
    start: 0,
    end: 0
  }
  #autoPlay = false
  #duration // 总时长
  #currentTime // 播放的进度时长
  #container = { // dom容器
    warp: null,
    error: null,
    loading: null,
    fullscreen: null,
    loudness: null, // 音量键
    toggle: null, // 播放暂停
    process: {
      warp: null,
      length: null,
      backgroundLength: null,
      markLength: null,
      mark: null,
      duration: null,
      currentTime: null
    } // 进度条
  }
  #onHandle = {
    onError: () => { },
    onSuccee: () => { },
    onProgress: () => { },
    onPlaying: () => { },
    onEnded: () => { },
    onPause: () => { },
    onPlay: () => { },
    onCanplay: () => { }
  }
  constructor(options = {}) {
    this.#box = options.box || document.getElementById('tiancai9-video')
    this.#sources = options.sources
    this.#autoPlay = options.autoPlay
    this.#onHandle = { ...this.#onHandle, ...options.onHandle }
    this.#init()
    this.#watch()
  }

  #watch() {
    const watchSetFnc = (key, callback) => {
      this.#watchData[key] = this[key]
      Object.defineProperty(this, key, {
        set(value) {
          callback(value)
          this.#watchData[key] = value
        },
        get() {
          return this.#watchData[key]
        }
      })
    }

    watchSetFnc('isPlay', v => {
      if (v) {
        this.#container.toggle.classList.add('pause-icon')
        this.#container.toggle.classList.remove('play-icon')
      } else {
        this.#container.toggle.classList.remove('pause-icon')
        this.#container.toggle.classList.add('play-icon')
      }
    })

    watchSetFnc('isLoading', v => {
      this.#container.loading.style.display = v ? 'block' : 'none'
    })

    watchSetFnc('isError', v => {
      this.#container.error.style.display = v ? 'block' : 'none'
    })

    watchSetFnc('showContainer', v => {
      this.#container.warp.style.display = v ? 'block' : 'none'
      v ? this.#setTimeoutByShowContainer() : this.#clearTimeoutByShowContainer()
    })
  }

  #createVideo(url) {
    this.#instance = new Hls({
      el: this.#video,
      url: url,
      handle: {
        error: v => this.#onError(v),
        succee: v => this.#onSuccee(v),
        onPlaying: v => this.#onPlaying(v) & this.#onHandle.onPlaying(v),
        onProgress: v => this.#onProgress(v) & this.#onHandle.onProgress(v),
        onPlay: v => this.#onPlay(v) & this.#onHandle.onPlay(v),
        onPause: v => this.#onPause(v) & this.#onHandle.onPause(v),
        onEnded: v => this.#onEnded(v) & this.#onHandle.onEnded(v),
        onCanplay: v => this.#onCanplay(v) & this.#onHandle.onCanplay(v) & this.#onSuccee(v),
      }
    })

    this.#instance.setCurrentTime(this.#currentTime || 0)
  }

  #checkedStatus() {
    return !this.isLoading
  }

  #onCanplay({ duration, currentTime }) {
    if (this.#autoPlay) {
      this.#instance.play()
      this.isPlay = true
      this.#container.toggle.classList.add('pause-icon')
    }
    this.isLoading = false
    this.showContainer = true
    this.#currentTime = currentTime
    this.#duration = duration
    this.#container.process.duration.innerText = formatterTime(this.#duration)
    this.#container.process.currentTime.innerText = formatterTime(currentTime)
  }

  #onPause() {
    this.isPlay = false
  }

  #onPlay() {
    this.isPlay = true
  }

  #onEnded() {

  }

  #onProgress({ currentTime }) {
    if (!this.#checkedStatus()) return
    if (!this.#processAutoStatus) return
    this.#currentTime = currentTime
    this.#container.process.currentTime.innerText = formatterTime(currentTime)
    this.#container.process.duration.innerText = formatterTime(this.#duration)
    this.#container.process.markLength.style.width = `${this.#currentTime * 100 / this.#duration}%`
  }

  #onPlaying({ duration }) {
  }

  #onSuccee() {

  }

  #onError() {
    if (this.#index >= this.#sources.length - 1) {
      this.isError = true
      this.isLoading = false
      this.#onHandle.onError()
      return
    }
    this.#instance.destroy()
    this.#index ++
    this.#createVideo(this.#sources[this.#index])
  }

  #init() {
    this.#initContainer()
    this.#createVideo(this.#sources[this.#index])
    this.#initContainerHandle()
  }

  #initContainer() {
    const createElement = (className, tag = 'div', parent = this.#warp) => Utils.createElement(tag, el => {
      Array.isArray(className) ? className.forEach(v => el.classList.add(v)) : el.classList.add(className)

      parent.append(el)
      return el
    })

    this.#warp = createElement('tiancai9-video-warp', 'div', this.#box)

    this.#box.classList.add('tiancai9-video-box')

    this.#video = createElement('tiancai9-video-main', 'video')

    this.#container.warp = createElement('container', 'div', this.#warp)
    this.#container.fullscreen = createElement(['fullscreen', 'btn', 'fullscreen-icon'], 'div', this.#container.warp)
    this.#container.toggle = createElement(['toggle', 'btn', 'play-icon'], 'div', this.#container.warp)
    this.#container.loading = createElement('loading', 'div', this.#warp)
    createElement('loading-icon', 'div', this.#container.loading)

    this.#container.error = createElement('error', 'div', this.#warp)
    createElement('error-icon', 'div', this.#container.error)

    this.#container.process.warp = createElement('process', 'div', this.#container.warp)
    this.#container.process.length = createElement('length', 'div', this.#container.process.warp)
    this.#container.process.markLength = createElement('markLength', 'div', this.#container.process.length)
    this.#container.process.backgroundLength = createElement('backgroundLength', 'div', this.#container.process.length)
    this.#container.process.mark = createElement('mark', 'div', this.#container.process.length)
    this.#container.process.currentTime = createElement('currentTime', 'div', this.#container.process.warp)
    createElement('secondary', 'div', this.#container.process.warp).innerText = '/'
    this.#container.process.duration = createElement('duration', 'div', this.#container.process.warp)
    this.#container.process.currentTime.innerText = '00'
    this.#container.process.duration.innerText = '00'
  }

  #initContainerHandle() {
    const self = this

    // 错误重试
    this.#container.error.onclick = function (e) {
      self.replay()
      e.stopPropagation()
    }

    // 唤起控件盒子-open container
    this.#warp.onclick = function (e) {
      if (!self.#checkedStatus()) return
      if (self.showContainer === false) {
        self.showContainer = true
        e.stopPropagation()
      }
    }

    // 关闭控件盒子-close container
    this.#container.warp.onclick = function (e) {
      if (!self.#checkedStatus()) return
      if (self.showContainer === true) {
        self.showContainer = false
        e.stopPropagation()
      }
    }

    // 播放暂停-play pause video
    this.#container.toggle.onclick = function (e) {
      if (!self.#checkedStatus()) return
      self.isPlay ? self.#instance.pause() : self.#instance.play()
      self.isPlay = !self.isPlay
      e.stopPropagation()
    }

    // 唤起全屏-open fullscreen
    this.#container.fullscreen.onclick = function (e) {
      if (!self.#checkedStatus()) return
      if (self.isFullscreen === false) {
        self.openFullscreen()
      } else {
        self.exitFullscreen()
      }
      e.stopPropagation()
    }

    // // 点击调控进度条
    this.#container.process.length.onclick = function (e) {
      e.stopPropagation() && e.preventDefault()
    }

    this.#container.process.length.onmousedown = function (e) {
      self.#processAutoStatus = false
      const x = e.layerX
      console.log('=========onmousedown')
      self.#processMark.start = x
      self.#processMark.end = x
      self.#slideProcess(x)
      self.#clearTimeoutByShowContainer()
      e.stopPropagation() && e.preventDefault()
    }

    this.#container.process.length.onmousemove = function (e) {
      if (self.#processAutoStatus) return
      const x = e.layerX
      self.#processMark.end = x
      self.#slideProcess(x)
      e.stopPropagation() && e.preventDefault()
    }

    this.#container.process.length.onmouseup = function (e) {
      console.log('=========onmouseup')
      self.#processAutoStatus = true
      const x = self.#processMark.end
      self.#slideProcess(x, true)
      self.#setTimeoutByShowContainer()
      e.stopPropagation() && e.preventDefault()
    }

    // 滑动进度条 slideProcessbar
    let pre_x = null
    let next_x = null
    this.#container.process.length.addEventListener("touchstart", function (e) {
      console.log('touchstart')
      self.#processAutoStatus = false
      self.#clearTimeoutByShowContainer()
      pre_x = e.changedTouches[0].clientX
      next_x = e.changedTouches[0].clientX - self.#container.process.warp.offsetLeft
    }, false)
    this.#container.process.length.addEventListener("touchend", function (e) {
      console.log('touchend')
      self.#slideProcess(next_x, true)
      self.#processAutoStatus = true
    }, false)
    this.#container.process.length.addEventListener("touchmove", function (e) {
      console.log('touchmove')
      const x = e.changedTouches[0].clientX
      const diff_x = x - pre_x - self.#container.process.warp.offsetLeft
      pre_x = x
      next_x = x + diff_x
      self.#slideProcess(next_x)
      self.#setTimeoutByShowContainer()
    }, false)

  }

  #slideProcess(x, triggerStatus = false) {
    const max = this.#container.process.backgroundLength.clientWidth
    const ratio = x / max
    const value = ratio * this.#duration
    this.#container.process.markLength.style.width = x >= max ? max : x + 'px'
    if (!triggerStatus) return
    this.isLoading = true
    Utils.debounce(() => {
      this.#instance.setCurrentTime(value)
    }, 200)
  }

  openFullscreen() {
    this.isFullscreen = true
    if (this.#isMobile) {
      const width = window.innerHeight
      const height = window.innerWidth
      this.#warp.style.width = width + 'px'
      this.#warp.style.height = height + 'px'
      this.#box.classList.add('tiancai9-video-fullscreen')
    } else {
      const el = this.#video
      var rfs =
        el.requestFullScreen ||
        el.webkitRequestFullScreen ||
        el.mozRequestFullScreen ||
        el.msRequestFullScreen,
        wscript
      if (typeof rfs != "undefined" && rfs) {
        rfs.call(el)
        return
      }
      if (typeof window.ActiveXObject != "undefined") {
        wscript = new ActiveXObject("WScript.Shell")
        if (wscript) {
          wscript.SendKeys("{F11}")
        }
      }
    }
  }

  exitFullscreen() {
    this.isFullscreen = false
    if (this.#isMobile) {
      this.#warp.style.width = ''
      this.#warp.style.height = ''
      this.#box.classList.remove('tiancai9-video-fullscreen')
    } else {
      var el = document,
        cfs =
          el.cancelFullScreen ||
          el.webkitCancelFullScreen ||
          el.mozCancelFullScreen ||
          el.exitFullScreen,
        wscript
      if (typeof cfs != "undefined" && cfs) {
        cfs.call(el)
        return
      }
      if (typeof window.ActiveXObject != "undefined") {
        wscript = new ActiveXObject("WScript.Shell")
        if (wscript != null) {
          wscript.SendKeys("{F11}")
        }
      }
    }
  }

  destroy() {
    this.#index = 0
    this.isError = false
    this.isLoading = false
    this.#instance.destroy()
    this.#box.innerHTML = ''
  }

  play() {
    this.isPlay = true
    this.#instance.play()
  }

  pause() {
    this.isPlay = false
    this.#instance.pause()
  }

  reinit() {
    this.#index = 0
    this.isError = false
    this.isLoading = true
    this.#instance.destroy()
    this.#init()
    this.#watch()
  }

  replay() {
    this.#index = 0
    this.isError = false
    this.isLoading = true
    this.#instance.destroy()
    this.#createVideo(this.#sources[this.#index])
  }

  #setTimeoutByShowContainer() {
    if (this.#onShowContainerTime) clearTimeout(this.#onShowContainerTime)
    this.#onShowContainerTime = setTimeout(() => {
      this.showContainer = false
    }, 10000)
  }
  #clearTimeoutByShowContainer() {
    if (this.#onShowContainerTime) clearTimeout(this.#onShowContainerTime)
  }
}

export default Main
