/*
 * A javascript SDK for capturing image from device's camera(works on all the browser and mobile devices)
 * Author: Pratim Sarangi<https://github.com/pratims091>
 * Version: vanilla
*/

exprt default class Camera {
  constructor(element, elementHeight=240, elementWidth=320, elementClassName='', cameraProps={}) {
    this.element = element
    this.elementHeight = elementHeight
    this.elementWidth = elementWidth
    this.elementClassName = elementClassName
    this.camera = {
      facingMode: 'user',
      resolution: {
        height: elementHeight,
        width: elementWidth
      }
    }
  }

  renderStream(cameraFacingMode='rear') {
    switch(cameraFacingMode) {
      case 'front':
        this.cameraFacingMode = { exact: "environment" }
        break
      case 'rear':
        this.cameraFacingMode = "user"
        break
      default:
        this.cameraFacingMode = "user"
    }
    this.clear()
    let container = this.element.appendChild(document.createElement("div"))
    container.setAttribute('id', 'cameraContainer')

    let stream = container.appendChild(document.createElement("video"))
    stream.setAttribute('id', 'stream')
    stream.height = this.elementHeight
    stream.width = this.elementWidth
    if(this.elementClassName.length > 0)
      stream.classList.add(this.element.elementClassName)

    let that = this

    this.initialize().then(localMediaStream => {
      if ("srcObject" in stream) {
        stream.srcObject = localMediaStream;
      } else {
        // Avoid using this in new browsers, as it is going away.
        stream.src = window.URL.createObjectURL(localMediaStream);
      }
      stream.onloadedmetadata = function(e) {
        stream.play();
      };

      let canvas = container.appendChild(document.createElement('canvas'))
      canvas.setAttribute('id', 'snapShotContainer')
      canvas.style.display = 'none'
      canvas.height = that.elementHeight
      canvas.width = that.elementWidth

      let image = container.appendChild(document.createElement('img'))
      image.setAttribute('id', 'snapShot')
      image.style.marginLeft  = 'auto'
      image.style.marginRight = 'auto'
      image.style.height = that.elementHeight
      image.style.width = that.elementWidth
      image.style.display = 'none'
    }).catch(err => {
      console.error(err)
      container.innerHTML = '<span style="color: red;">' + err + '</span>'
    })
  }

  takeSnapshot(){

    let canvas = document.getElementById('snapShotContainer')
    let stream = document.getElementById('stream')
    let image  = document.getElementById('snapShot')
    let imageDataURL = ''

    // Draw a copy of the current frame from the video on the canvas.
    if(canvas) {
      let context = canvas.getContext('2d');
      context.drawImage(stream, 0, 0, this.elementWidth, this.elementHeight);

      // Get an image dataURL from the canvas.
      imageDataURL = canvas.toDataURL('image/png');

      // Set the dataURL as source of an image element, showing the captured photo.
      image.setAttribute('src', imageDataURL);

      stream.style.display = 'none'
      image.style.display  = 'block'
    }

    return imageDataURL
  }

  initialize() {
    let that = this

    return new Promise(function(resolve, reject) {

      if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
      }

      // Some browsers partially implement mediaDevices. We can't just assign an object
      // with getUserMedia as it would overwrite existing properties.
      // Here, we will just add the getUserMedia property if it's missing.
      if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function(constraints) {

          // First get ahold of the legacy getUserMedia, if present
          var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

          // Some browsers just don't implement it - return a rejected promise with an error
          // to keep a consistent interface
          if (!getUserMedia) {
            return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
          }

          // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
          return new Promise(function(resolve, reject) {
            getUserMedia.call(navigator, constraints, resolve, reject);
          });
        }
      }

      navigator.mediaDevices.getUserMedia({
        video: {
          width: that.camera.resolution.width,
          height: that.camera.resolution.height,
          facingMode: that.camera.facingMode
        }
      }).then(localMediaStream => {
        resolve(localMediaStream)
      }).catch( err => {
        console.error(err)
        reject("The following error occurred when trying to use access device camera" + err);
      })
    })
  }

  clear() {
    if(document.contains(document.getElementById('cameraContainer'))) {
      document.getElementById('cameraContainer').remove()
    }
  }
}
