# tiancai-video-hls

基于原生js实现的hls视频播放器，可播放m3u8视频

使用示例：

```
  import TiancaiVideoHls from '/src/main.js'
  // import TiancaiVideoHls from './dist/tiancai-video-hls.js'
  // import './dist/style.css'
  const video = new TiancaiVideoHls({
    box: document.getElementById('tiancai9-video'),
    sources: ['https://c3.monidai.com/20231119/JqT4DANw/index.m3u8', 'https://c3.monid43ai.com/202', 'https://c354.mon424idai.com/202']
  })
```



功能介绍：

* ~~视频播放~~
* ~~播放暂停~~
* ~~进度条控件~~
* H5
  * ~~H5伪全屏~~
  * 左滑亮度
  * 右滑音量
  * 长按2倍速
* PC
  * 全屏
  * 小窗播放
  * 音量键按钮

* 弹幕功能
  * 
