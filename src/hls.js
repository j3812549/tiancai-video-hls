import Hls from 'hls.js'

class Instance {
  #hls = null
  #video = null
  #url = ''
  #handle = {
    error: () => { },
    succee: () => { },
    onProgress: () => { },
    onPlaying: () => { },
    onEnded: () => { },
    onPause: () => { },
    onPlay: () => { },
  }
  constructor(options = {}) {
    this.#video = options.el
    this.#url = options.url
    this.#handle.error = options.handle?.error
    this.#handle.succee = options.handle?.succee
    this.#handle.onProgress = options.handle?.onProgress
    this.#handle.onEnded = options.handle?.onEnded
    this.#handle.onPause = options.handle?.onPause
    this.#handle.onPlay = options.handle?.onPlay
    this.#handle.onPlaying = options.handle?.onPlaying
    this.#handle.onCanplay = options.handle?.onCanplay
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

    this.#video.addEventListener("canplay", function () {
      console.log('===canplay')
      self.#handle.onCanplay({ video: this, duration: this.duration, currentTime: this.currentTime })
    })


    this.#video.addEventListener("playing", function () {
      console.log('===playing')
      self.#handle.onPlaying({ duration: this.duration, video: this })
    })

    this.#video.addEventListener("timeupdate", function () {
      self.#handle.onProgress({ currentTime: this.currentTime, video: this })
    })

    this.#video.addEventListener("ended", function () {
      console.log('===ended')
      self.#handle.onEnded({ video: this })
    })

    this.#video.addEventListener("pause", function () {
      console.log('===pause')
      self.#handle.onPause({ video: this })
    })

    this.#video.addEventListener("play", function () {
      console.log('===play')
      self.#handle.onPlay({ video: this })
    })

  }
}

export default Instance
