<template>
  <div id="app">


    <!-- 弹窗 -->
    <div id="myModal" class="modal">

      <!-- 弹窗内容 -->
      <div class="modal-content">
        <div class="modal-header">
          <span class="close">&times;</span>
          <h2>{{username}}你好，请选择会议</h2>
        </div>
        <div class="modal-body">
          <li v-for="(conf, index) in confs">
            <input type="checkbox" :id="'conf'+index" :value="conf.id" v-model="selectedConfs" />
            <label :for="'conf'+index">{{ index+1 +'： id: ' +conf.id + '; conference title: ' + conf.title }}</label>
          </li>
          <br>
          <span>选择的会议为: {{ selectedConfs }}</span>
        </div>
      </div>
      <div class="modal-footer">
        <h1>请选择会议后点击确定</h1>
        <div align="center">
          <a @click="SignBegin" class="button is-dark">
            <span>确定</span>
          </a>
        </div>
      </div>

    </div>

    <div class="content-cam">
      <div class="camera-wrp sec">
        <video width="640" height="480" id="video_cam" preload autoplay loop muted></video>
        <canvas width="640" height="480" id="face_detect"></canvas>
        <label v-if="trackTracking" class="checkbox activate-autocapture">
          <input type="checkbox" v-model="autoCaptureTrackTraking"> auto capture is {{autoCaptureTrackTraking ? 'activated' : 'not activated'}}
        </label>
        <div class="control-btn">
          <div class="btn-wrp">
            <a @click="onTakeCam" class="button is-dark">
              <i class="ion ion-person"></i>
              <span>{{buttonName}}</span>
            </a>
          </div>

          <!--
          <div class="btn-wrp">
            <a @click="onDownloadFile" class="button is-dark"><i class="ion ion-android-download"></i></a>
          </div>
          <div class="btn-wrp">
            <a @click="onSwitchToTrackCCV" class="button is-dark"><i
              class="ion ion-person"></i><span>Track with ccv</span></a>
          </div>
          <div class="btn-wrp">
            <a @click="onSwitchToTracking" class="button is-dark"><i
              class="ion ion-person"></i><span>Track with tracking</span></a>
          </div>
          -->


        </div>
      </div>

      <!--
      <div class="images-wrp sec">
        <p class="title is-5">Image taken</p>
        <div :class="`img-item img-item-${index}`" v-for="(image, index) in images"
             :key="`img-wrp-${index}`"
             :style="`background-image: url('${image}')`">
          <a class="button" @click="onDownloadFile(image)"><i class="ion ion-android-download"></i></a>
          <a class="button" @click="onDetectFace(image, index)",id='btn'><i class="ion ion-search"></i></a>
        </div>
      </div>
      -->

    </div>
  </div>
</template>

<script>
  import {
    isEmpty
  } from 'lodash';
  import axios from 'axios';


  export default {
    name: 'app',
    data() {
      return {
        images: [],
        trackCcv: false,
        trackTracking: true,
        autoCaptureTrackTraking: false,
        leaderConfirm: false,
        username: null,
        showConfList: false,
        beginToSignIn: false,
        buttonName: 'Sign In',
        selectedConfs: [],
        confs: {

        }
      }
    },//
    mounted() {
      // The getUserMedia interface is used for handling camera input.
      // Some browsers need a prefix so here we're covering all the options
      navigator.getMedia = (
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia
      );


      if (!navigator.getMedia) {
        alert("Your browser doesn't have support for the navigator.getUserMedia interface.");
      } else {
        const context = this;

        // Request the camera.
        navigator.getMedia({
            video: true
          },
          // Success Callback
          function (stream) {
            const video = context.$el.querySelector('#video_cam');

            // Create an object URL for the video stream and
            // set it as src of our HTLM video element.
            video.src = window.URL.createObjectURL(stream);

            // Play the video element to start the stream.
            video.play();

            context.onTrackTracking();
            video.onplay = function (e) {
              setInterval(function () {
                if (context.trackCcv) {
                  context.onTrackCCV()
                } else {
                  context.onTrackCCV(true)
                }
              }, 50)
            };

          },
          // Error Callback
          function (err) {
            alert("There was an error with accessing the camera stream: " + err.name, err);
          }
        );
      }
    },
    methods: {
      onSwitchToTrackCCV() {
        this.trackTracking = false;
        this.trackCcv = !this.trackCcv;
      },
      onSwitchToTracking() {
        this.trackCcv = false;
        this.trackTracking = !this.trackTracking;
        this.onTrackTracking();
      },
      onTrackCCV(isDisable = false) {
        const video = this.$el.querySelector('#video_cam');
        const canvasDetect = this.$el.querySelector('#face_detect');
        const canvasContext = canvasDetect.getContext('2d');

        if (isDisable) {
          canvasContext.clearRect(0, 0, canvasDetect.width, canvasDetect.height);
        } else {
          const imageOverlay = new Image();
          imageOverlay.src = "/static/images/glasses.png";

          canvasContext.drawImage(video, 0, 0, canvasDetect.width, canvasDetect.height);
          const comp = ccv.detect_objects({
            canvas: (ccv.pre(canvasDetect)),
            cascade,
            interval: 5,
            min_neighbors: 1
          });

          // Draw glasses on everyone!
          for (let i = 0; i < comp.length; i++) {
            canvasContext.drawImage(imageOverlay, comp[i].x, comp[i].y, comp[i].width, comp[i].height);
          }
        }
      },
      onTrackTracking() {
        const context = this;
        const video = this.$el.querySelector('#video_cam');
        const canvas = this.$el.querySelector('#face_detect');
        const canvasContext = canvas.getContext('2d');
        let tracker = new tracking.ObjectTracker('face');

        video.pause();
        video.src = '';
        tracker.setInitialScale(4);
        tracker.setStepSize(2);
        tracker.setEdgesDensity(0.1);
        tracking.track('#video_cam', tracker, {
          camera: true
        });
        tracker.on('track', function (event) {
          const {
            autoCaptureTrackTraking
          } = context;
          canvasContext.clearRect(0, 0, canvas.width, canvas.height);
          event.data.forEach(function ({
            x,
            y,
            width,
            height
          }) {
            canvasContext.strokeStyle = '#a64ceb';
            canvasContext.strokeRect(x, y, width, height);
            canvasContext.font = '11px Helvetica';
            canvasContext.fillStyle = "#fff";
            canvasContext.fillText('x: ' + x + 'px', x + width + 5, y + 11);
            canvasContext.fillText('y: ' + y + 'px', x + width + 5, y + 22);
          });
          /*
          canvasContext.drawImage(video, x, y, width, height,x, y, width, height);
            var snapData = canvas.toDataURL('image/png');
              var imgSrc = "data:image/png;" + snapData;

            function dataURLtoFile(dataurl, filename) {
              var arr = dataurl.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              return new File([u8arr], filename, {
                type: mime
              });
            }//? 这是截取图片的代码，暂时注释掉

            var file = dataURLtoFile(imgSrc ,'try.png');
            */
           
            // let blob = new Blob(this.images, {
            //   type: "image/png"
            // });
            // let file = new File(image, "takenFromCamera.png", {
            //   type: "DOMString"
            // });

            // let file = images[0];
            var formdata1 = new FormData(); // 创建form对象
            formdata1.append('', file); // 通过append向form对象添加数据,可以通过append继续添加数据或formdata1.append('img',file)
            let config = {

              headers: {
                'enctype': 'multipart/form-data'
              },
              processData: false,
              contentType: false,

            }; //添加请求头

            axios.post('http://localhost:4041/api/reco/user', formdata1, config).then(response => { //这里的/xapi/upimage为接口
              console.log(response.data);
            })

          if (!isEmpty(event.data) && autoCaptureTrackTraking) {
            context.onTakeCam();
          }
        });

        let gui = new dat.GUI();
        gui.add(tracker, 'edgesDensity', 0.1, 0.5).step(0.01);
        gui.add(tracker, 'initialScale', 1.0, 10.0).step(0.1);
        gui.add(tracker, 'stepSize', 1, 5).step(0.1);
      },
      onDownloadFile(item) {
        const link = document.createElement('a');
        link.href = item;
        link.download = `cahyo-${new Date().toISOString()}.png`;
        link.click();

        link.remove();
      },
      onTakeCam() {
        const canvas = document.createElement('canvas');
        const video = this.$el.querySelector('#video_cam');
        const canvasContext = canvas.getContext('2d');

        if (video.videoWidth && video.videoHeight) {
          const isBiggerW = video.videoWidth > video.videoHeight;
          const fixVidSize = isBiggerW ?
            video.videoHeight : video.videoWidth;
          let offsetLeft = 0;
          let offsetTop = 0;

          if (isBiggerW)
            offsetLeft = (video.videoWidth - fixVidSize) / 2;
          else
            offsetTop = (video.videoHeight - fixVidSize) / 2;

          // make canvas size 300px
          canvas.width = canvas.height = 300;
          const {
            width,
            height
          } = canvas;

          canvasContext.drawImage(video, offsetLeft, offsetTop, fixVidSize, fixVidSize, 0, 0, width, height);
          const image = canvas.toDataURL('image/png');
          // console.log(image);
          this.images.push(image);


          function dataURLtoFile(dataurl, filename) {
            var arr = dataurl.split(','),
              mime = arr[0].match(/:(.*?);/)[1],
              bstr = atob(arr[1]),
              n = bstr.length,
              u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], filename, {
              type: mime
            });
          }

          if (!this.beginToSignIn) {
            var file = dataURLtoFile(image, 'takenFromCamera.png');
            var formdata1 = new FormData(); // 创建form对象
            formdata1.append('', file); // 通过append向form对象添加数据,可以通过append继续添加数据或formdata1.append('img',file)
            let config = {

              headers: {
                'enctype': 'multipart/form-data'
              },
              processData: false,
              contentType: false,

            }; //添加请求头
            
            axios.post('http://localhost:4041/api/reco/user', formdata1, config).then(response => { //这里的/xapi/upimage为接口
              console.log(response.data);
              console.log('fuck')
              // const data = response.data;
              // console.log('data: ' + data);
              console.log('response.data[0]data.username: ' + response.data[0].username);
              this.username = response.data[0].username;
              this.confs = response.data[0].recentConferences;
              console.log(this.confs);
              this.showConfList = true;
              console.log(this.showConfList);
              // 获取弹窗
              var modal = document.getElementById('myModal');
              // 打开弹窗的条件为真
              var btn = document.getElementById("myBtn");
              if (this.showConfList) {
                modal.style.display = "block";
              }
              // 获取 <span> 元素，用于关闭弹窗 that closes the modal
              var span = document.getElementsByClassName("close")[0];
              // 点击 <span> (x), 关闭弹窗
              span.onclick = function () {
                modal.style.display = "none";
              }

              // 在用户点击其他地方时，关闭弹窗
              window.onclick = function (event) {
                if (event.target == modal) {
                  modal.style.display = "none";
                }
              }

            })

          } else {
            var file = dataURLtoFile(image, 'takenFromCamera.png');
            var formdata1 = new FormData(); // 创建form对象
            formdata1.append('id', this.selectedConfs[0]);
            formdata1.append('', file); // 通过append向form对象添加数据,可以通过append继续添加数据或formdata1.append('img',file)
            let config = {

              headers: {
                'enctype': 'multipart/form-data'
              },
              processData: false,
              contentType: false,

            }; //添加请求头
            axios.post('http://localhost:4041/api/reco/conf', formdata1, config).then(response => { //这里的/xapi/upimage为接口
              console.log(response.data);
            })
          }

        }
      },
      onDetectFace(param, index) {
        const imgItem = document.querySelector(`.img-item-${index}`);
        const image = new Image();
        image.src = param;

        const tracker = new tracking.ObjectTracker('face');
        tracker.setStepSize(1.7);
        tracking.track(image, tracker);

        tracker.on('track', function (event) {
          event.data.forEach(function (rect) {
            window.plot(rect.x, rect.y, rect.width, rect.height);
          });
        });

        window.plot = function (x, y, w, h) {
          const rect = document.createElement('div');
          document.querySelector(`.img-item-${index}`).appendChild(rect);
          rect.classList.add('rect');
          rect.style.width = w + 'px';
          rect.style.height = h + 'px';
          rect.style.left = (x) + 'px';
          rect.style.top = (y) + 'px';
          rect.style.border = '2px solid yellow';
          rect.style.position = 'absolute';
        };
      },
      SignBegin() {
        console.log(this.beginToSignIn);

        console.log("here");
        this.buttonName = 'Attendance';
        this.beginToSignIn = true;
        console.log(this.selectedConfs[0]);
        var modal = document.getElementById('myModal');
        modal.style.display = "none";




      }
    }
  }

</script>

<style lang="scss">
  @import "~bulma";

  .activate-autocapture {
    margin-bottom: 1.5rem;
  }

  @mixin fl_row {
    display: flex;
    flex-direction: row;
  }

  @mixin fl_col {
    display: flex;
    flex-direction: column;
  }

  #app {
    padding: 1.5rem;
    h1 {
      text-align: center;
    }
    .content-cam {
      .sec:not(:last-child) {
        margin-bottom: 1.5rem;
      }
    }
  }

  #face_detect {
    position: absolute;
  }

  .images-wrp {
    overflow: auto;
    position: relative;
    padding: 1rem;
    .img-item {
      background-size: cover;
      background-position: center;
      cursor: pointer;
      float: left;
      position: relative;
      width: 30%;
      padding-bottom: 30%;
      margin: 1.66%;
    }
  }

  .camera-wrp {
    @include fl_col;
    align-items: center;
    position: relative;
    video {
      margin-bottom: 1.5rem;
    }
    .control-btn {
      @include fl_row;
      width: 100%;
      .btn-wrp {
        a {
          span {
            margin-left: 1rem;
          }
          min-width: 150px;
        }
        text-align: center;
        flex: 1;
      }
    }
  }

  /* 弹窗 (background) */

  .modal {
    display: none;
    /* 默认隐藏 */
    position: fixed;
    z-index: 1;
    padding-top: 100px;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgb(0, 0, 100);
    background-color: rgba(0, 0, 100, 0.2);
  }

  /* 弹窗内容 */

  .modal-content {
    position: relative;
    background-color: #fefeff;
    margin: auto;
    padding: 0;
    border: 1px solid #888;
    width: 80%;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 100, 0.2), 0 6px 20px 0 rgba(0, 0, 100, 0.19);
    -webkit-animation-name: animatetop;
    -webkit-animation-duration: 0.4s;
    animation-name: animatetop;
    animation-duration: 0.4s
  }

  /* 添加动画 */

  @-webkit-keyframes animatetop {
    from {
      top: -300px;
      opacity: 0
    }
    to {
      top: 0;
      opacity: 1
    }
  }

  @keyframes animatetop {
    from {
      top: -300px;
      opacity: 0
    }
    to {
      top: 0;
      opacity: 1
    }
  }

  /* 关闭按钮 */

  .close {
    color: white;
    float: right;
    font-size: 16px;
    font-weight: bold;
  }

  .close:hover,
  .close:focus {
    color: #000;
    text-decoration: none;
    cursor: pointer;
  }

  .modal-header {
    padding: 2px 16px;
    background-color: #000000;
    color: white;
  }

  .modal-body {
    padding: 2px 16px;
  }

  .modal-footer {
    padding: 5px 16px;
    background-color: #000000;
    color: white;
  }

</style>
