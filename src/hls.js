import Hls from 'hls.js'

class Instance {
  #hls = null
  #video = null
  #url = ''
  #handle = {
    error: () => { },
    succee: () => { },
    onProgress: () => { },
    onPlaying: () => { }
  }
  constructor(options = {}) {
    this.#video = options.el
    this.#url = options.url
    this.#handle.error = options.handle?.error
    this.#handle.succee = options.handle?.succee
    this.#handle.onProgress = options.handle?.onProgress
    this.#handle.onPlaying = options.handle?.onPlaying
    this.#init()
  }

  play() {
    return this.#video.play()
  }

  pause() {
    return this.#video.pause()
  }

  destroy() {
    this.#hls.destroy()
  }

  fullscreen() {
    this.#video.requestFullscreen()
  }

  #init() {
    if (!Hls.isSupported()) {
      throw new Error('设备不支持hls播放方式')
    }
    this.#hls = new Hls()
    this.#hls.loadSource(this.#url)
    this.#hls.attachMedia(this.#video)
    const self = this
    this.#hls.on(Hls.Events.MANIFEST_PARSED, () => {
      self.#handle.succee && self.#handle.succee({ video: this })
      self.#video.play()
      self.onHandle()
    })

    this.#hls.on(Hls.Events.ERROR, () => {
      self.#handle.error && self.#handle.error({ video: this })
    })
  }

  setCurrentTime(time) {
    this.#video.currentTime = time
  }

  onHandle() {
    const self = this
    this.#video.addEventListener("playing", function () {
      // do something
      console.log('duration', this.duration, self.#handle.onPlaying)
      self.#handle.onPlaying({ duration: this.duration, video: this })
    })

    this.#video.addEventListener("timeupdate", function () {
      self.#handle.onProgress({ currentTime: this.currentTime, video: this })
    })
  }
}

export default Instance