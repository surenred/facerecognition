import { Component, AfterViewInit, ViewChild, ElementRef } from "@angular/core";
declare var faceapi: any;
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})

export class AppComponent implements AfterViewInit {
  title = "face-apiDemo";
  @ViewChild("image", { static: true }) image: ElementRef;
  @ViewChild("video", { static: true }) video: ElementRef; //canvas
  @ViewChild("canvas", { static: true }) canvas: ElementRef;

  public input = document.getElementById('myImg');
  public imageUpload;

  model: any;
  isDataLoading = true;

  async ngAfterViewInit() {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("assets/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("assets/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("assets/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("assets/models"),
      faceapi.nets.ssdMobilenetv1.loadFromUri('assets/models')
    ]).then(this.start)

    
  }

  startVideo() {
    const vid = this.video.nativeElement; // feeding everytime in case firsttime it didn't worked
    if (navigator.mediaDevices.getUserMedia) {
      // this is only working for the local host if the ip is changed to the new one it will not work, see an alternative for this from     somewhere
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(stream => {
          vid.srcObject = stream;
        })
        .catch(error => {
          alert("No media device Found, please connect a camera!!!");
          console.log("Something went wrong!");
        });
    } else {
      alert("No media device Found, please connect a camera!!!");
    }
  }

  selectImage(event){
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.imageUpload = file;
      console.log(this.imageUpload);
    }
  }

  async start() {
    const container = document.createElement('div')
    container.style.position = 'relative'
    document.body.append(container)
    console.log("Called");
    const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark']
    console.log(labels);

    
    const labeledFaceDescriptors = await Promise.all(
      labels.map(async label => {
        const descriptions = [];
        for (let i = 1; i <= 2; i++) {
          const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/${label}/${i}.jpg`)
          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
          descriptions.push(detections.descriptor)
        }
          return new faceapi.LabeledFaceDescriptors(label, descriptions)
      })
      )
      console.log(labeledFaceDescriptors);
  
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
  //let image=this.image.nativeElement;
    //console.log(this.image.nativeElement);
    //console.log(image);
    //let canvas=this.canvas.nativeElement;
    let image1
    let canvas1
    document.body.append('Loaded')
    console.log('Loaded')
    console.log(this.imageUpload.files[0]);
   // this.imageUpload.addEventListener('change', async () => {
    //  if(this.imageUpload)
    //  {
    //   if (image1) image1.remove()
    //   if (canvas1) canvas1.remove()
    //   image1 = await faceapi.bufferToImage(this.imageUpload)
    //   container.append(image1)
    //   canvas1 = faceapi.createCanvasFromMedia(image1)
    //   container.append(canvas1)
    //   const displaySize = { width: image1.width, height: image1.height }
    //   faceapi.matchDimensions(canvas1, displaySize)
    //   const detections = await faceapi.detectAllFaces(image1).withFaceLandmarks().withFaceDescriptors()
    //   const resizedDetections = faceapi.resizeResults(detections, displaySize)
    //   const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    //   results.forEach((result, i) => {
    //     const box = resizedDetections[i].detection.box
    //     const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
    //     drawBox.draw(canvas1)
      
    // })}
  }

  onPlay() {
    alert("Starting predictions!!");
    const video = this.video.nativeElement;
    const can = this.canvas.nativeElement;
    const canvas = faceapi.createCanvasFromMedia(video);
    can.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);
    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
      if (resizedDetections.length == 0) {
        console.log(
          "No human face found : it may be due to low camera quality"
        );
      }
    }, 2000);
  }
}
