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

class Main {
  #box = null
  #warp = null
  #instance = null
  #video = null
  #sources = []
  #index = 0
  #showContainer = false
  #isFullscreen = false
  #isPlay = true
  #isLoading = true
  #duration // 总时长
  #currentTime // 播放的进度时长
  #container = { // dom容器
    warp: null,
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
  }

  #createVideo(url) {
    this.#instance = new Hls({
      el: this.#video,
      url: url,
      handle: {
        error: v => this.#onError(v),
        succee: v => this.#onSuccee(v),
        onPlaying: v => this.#onPlaying(v),
        onProgress: v => this.#onProgress(v)
      }
    })
  }

  #checkedStatus() {
    return !this.#isLoading
  }

  #onProgress({ currentTime }) {
    if (!this.#checkedStatus()) return
    this.#currentTime = currentTime
    this.#container.process.currentTime.innerText = formatterTime(currentTime)
    this.#container.process.duration.innerText = formatterTime(this.#duration)
    this.#container.process.markLength.style.width = `${this.#currentTime * 100 / this.#duration}%`
  }

  #onPlaying({ duration }) {
    console.log('xxx')
    this.#duration = duration
    this.#isLoading = false
  }

  #onSuccee() {

  }

  #onError() {
    if (this.#index >= this.#sources.length) {
      console.log('播放视频失败')
      alert('失败')
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
    this.#container.fullscreen = createElement(['fullscreen', 'btn'], 'div', this.#container.warp)
    this.#container.toggle = createElement(['toggle', 'btn'], 'div', this.#container.warp)

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

    // 唤起控件盒子-open container
    this.#warp.onclick = function (e) {
      if (!self.#checkedStatus()) return
      if (self.#showContainer === false) {
        self.#container.warp.style.display = 'block'
        self.#showContainer = true
        e.stopPropagation()
      }
    }

    // 关闭控件盒子-close container
    this.#container.warp.onclick = function (e) {
      if (!self.#checkedStatus()) return
      if (self.#showContainer === true) {
        self.#container.warp.style.display = 'none'
        self.#showContainer = false
        e.stopPropagation()
      }
    }

    // 播放暂停-play pause video
    this.#container.toggle.onclick = function (e) {
      if (!self.#checkedStatus()) return
      self.#isPlay ? self.#instance.pause() : self.#instance.play()
      self.#isPlay = !self.#isPlay
      e.stopPropagation()
    }

    // 唤起全屏-open fullscreen
    this.#container.fullscreen.onclick = function (e) {
      if (!self.#checkedStatus()) return
      if (self.#isFullscreen === false) {
        const width = window.innerHeight
        const height = window.innerWidth
        self.#warp.style.width = width + 'px'
        self.#warp.style.height = height + 'px'
        self.#isFullscreen = true
        self.#box.classList.add('tiancai9-video-fullscreen')
      } else {
        self.#warp.style.width = ''
        self.#warp.style.height = ''
        self.#isFullscreen = false
        self.#box.classList.remove('tiancai9-video-fullscreen')
      }
      e.stopPropagation()
    }

    // // 点击调控进度条
    // this.#container.process.length.onclick = function (e) {
    //   if (!self.#checkedStatus()) return
    //   const x = e.layerX
    //   self.#slideProcess(x, true)
    //   e.stopPropagation()
    // }

    this.#container.process.length.onmouseup = function (e) {
      console.log('onmousedown', e)
    }

    this.#container.process.length.onmousedown = function (e) {
      console.log('onmousedown', e)
    }

    // 滑动进度条 slideProcessbar
    let diff_x = null
    let start_x = null
    this.#container.process.length.addEventListener("touchstart", function(e) {
      diff_x = e.changedTouches[0].clientX
      console.log('e', e)
      start_x = self.#container.process.markLength.clientWidth
    }, false);
    this.#container.process.length.addEventListener("touchend", function(e) {
      console.log('e', e)
      console.log('2222')
    }, false);
    this.#container.process.length.addEventListener("touchmove", function(e) {
      console.log('33')
      const x = e.changedTouches[0].clientX - start_x + start_x
      console.log('x', x)
      self.#slideProcess(x)
    }, false);
  }

  #slideProcess(x, triggerStatus = false) {
    const max = this.#container.process.backgroundLength.clientWidth
    const ratio = x / max
    const value = ratio * this.#duration
    this.#container.process.markLength.style.width = x + 'px'
    if (!triggerStatus) return
    this.#isLoading = true
    Utils.debounce(() => {
      this.#instance.setCurrentTime(value)
    }, 200)
  }
}

export default Main
