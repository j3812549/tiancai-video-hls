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
  isPlay = true
  isLoading = true
  isError = false
  showContainer = false
  #watchData = {} // 管理监听属性

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
  constructor(options = {}) {
    this.#box = options.box || document.getElementById('tiancai9-video')
    this.#sources = options.sources
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
    })

    watchSetFnc('isFullscreen', v => {
      if (this.#isMobile) {
        if (v) {
          const width = window.innerHeight
          const height = window.innerWidth
          this.#warp.style.width = width + 'px'
          this.#warp.style.height = height + 'px'
          this.#box.classList.add('tiancai9-video-fullscreen')
        } else {
          this.#warp.style.width = ''
          this.#warp.style.height = ''
          this.#box.classList.remove('tiancai9-video-fullscreen')
        }
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
    })
  }

  #createVideo(url) {
    this.#instance = new Hls({
      el: this.#video,
      url: url,
      handle: {
        error: v => this.#onError(v),
        succee: v => this.#onSuccee(v),
        onPlaying: v => this.#onPlaying(v),
        onProgress: v => this.#onProgress(v),
        onPlay: v => this.#onPlay(v),
        onPause: v => this.#onPause(v),
        onEnded: v => this.#onEnded(v),
      }
    })

    this.#instance.setCurrentTime(this.#currentTime || 0)
  }

  #checkedStatus() {
    console.log('this.isLoading', this.isLoading)
    return !this.isLoading
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
    this.#duration = duration
    this.isLoading = false
  }

  #onSuccee() {

  }

  #onError() {
    if (this.#index >= this.#sources.length - 1) {
      this.isError = true
      this.isLoading = false
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
    this.#container.toggle = createElement(['toggle', 'btn'], 'div', this.#container.warp)
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
      console.log(3333333)
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
        self.isFullscreen = true
      } else {
        self.isFullscreen = false
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
      e.stopPropagation() && e.preventDefault()
    }

    // 滑动进度条 slideProcessbar
    let diff_x = null
    let start_x = null
    this.#container.process.length.addEventListener("touchstart", function (e) {
      diff_x = e.changedTouches[0].clientX
      console.log('e', e)
      start_x = self.#container.process.markLength.clientWidth
    }, false)
    this.#container.process.length.addEventListener("touchend", function (e) {
      console.log('e', e)
      console.log('2222')
    }, false)
    this.#container.process.length.addEventListener("touchmove", function (e) {
      console.log('33')
      const x = e.changedTouches[0].clientX - start_x + start_x
      console.log('x', x)
      self.#slideProcess(x)
    }, false)

  }

  #slideProcess(x, triggerStatus = false) {
    const max = this.#container.process.backgroundLength.clientWidth
    const ratio = x / max
    const value = ratio * this.#duration
    this.#container.process.markLength.style.width = x + 'px'
    if (!triggerStatus) return
    this.isLoading = true
    Utils.debounce(() => {
      this.#instance.setCurrentTime(value)
    }, 200)
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
}

export default Main
