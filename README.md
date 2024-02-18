# tiancai-video-hls

```
npm i tiancai-video-hls --save
```

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



#### 功能介绍：

* ~~视频播放~~
* ~~播放暂停~~
* ~~进度条控件~~
* ~~多源播放-传入url数组，递归链接可用，遇到可用源进行播放~~
* H5
  * ~~H5伪全屏~~
  * 左滑亮度
  * 右滑音量
  * 长按2倍速
* PC
  * ~~全屏~~
  * 小窗播放
  * 音量键按钮

* 弹幕功能


#### 参数说明：

| 名称     | 参数                                                         | 描述                |
| -------- | ------------------------------------------------------------ | ------------------- |
| autoPlay | false(默认)、true                                            | 是否自动播放        |
| box      | document.getElementById('tiancai9-video')（默认）、HTMLDivElement | 需要实例化的div容器 |
| sources  | Array<String>                                                | 视频资源地址的数组  |
| onHandle |                                                              | 详见监听事件示例    |



#### 事件：

|      名称      | 参数 |    描述    |
| :------------: | :--: | :--------: |
|      play      |  无  |    播放    |
|     pause      |  无  |    暂停    |
|     reinit     |  无  | 重新初始化 |
|     replay     |  无  |  重新播放  |
|    destroy     |  无  |    销毁    |
| exitFullscreen |  无  |  退出全屏  |
| openFullscreen |  无  |  唤起全屏  |

#### 监听事件：

```
  const video = new TiancaiVideoHls({
    autoPlay: ....,
    onHandle: {
      onError: () => { console.log('onError') },
      onSuccee: () => { console.log(`onSuccee`) },
      onProgress: () => { console.log(`onProgress`) },
      onPlaying: () => { console.log(`onPlaying`) },
      onEnded: () => { console.log(`onEnded`) },
      onPause: () => { console.log(`onPause`) },
      onPlay: () => { console.log(`onPlay`) },
      onCanplay: () => { console.log(`onCanplay`) }
    },
    box: ....,
    sources: ....
  })
```

|    名称    |                   描述                   |
| :--------: | :--------------------------------------: |
|  onError   |       所有视频源加载错误失败时触发       |
|  onSuccee  |          视频源加载成功时候触发          |
| onProgress | 实时进度，返回 { currentTime: 播放进度 } |
| onPlaying  |              播放成功时触发              |
|  onEnded   |              播放结束时触发              |
|  onPause   |                暂停时触发                |
|   onPlay   |              开始播放时触发              |
| onCanplay  |          视频源加载成功时候触发          |

