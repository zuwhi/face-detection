import React, { useRef, useEffect, useState } from "react";
import "./App.css";
import * as faceapi from "face-api.js";
import Background from "./ParticleBackground";

function App() {
  const [umur, setUmur] = useState("");
  const [ekspresi, setEkspresi] = useState("");
  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    startVideo();
    loadModels();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((currentStream) => {
        videoRef.current.srcObject = currentStream;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const loadModels = async () => {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      faceapi.nets.ageGenderNet.loadFromUri("/models"),
    ]);
    faceMyDetect();
  };

  const faceMyDetect = () => {
    setInterval(async () => {
      if (videoRef.current) {
        const detection = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withAgeAndGender();
        const context = canvasRef.current.getContext("2d");

        if (context) {
          context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          faceapi.matchDimensions(canvasRef.current, {
            width: 640,
            height: 480,
          });

          const resized = faceapi.resizeResults(detection, {
            width: 640,
            height: 480,
          });

          faceapi.draw.drawDetections(canvasRef.current, resized);
          faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);
          faceapi.draw.drawFaceExpressions(canvasRef.current, resized);

          resized.forEach((detection) => {
            setUmur(Math.round(detection.age));
            const box = detection.detection.box;
            const label = `Umur: ` + Math.round(detection.age) + "tahun," + "Gender:" + detection.gender;

            const expressions = detection.expressions;
            // console.log(expressions);
            setEkspresi(expressions);
            // setEkspresi(getDominantExpression(expressions));
            const drawBox = new faceapi.draw.DrawBox(box, { label });
            drawBox.draw(canvasRef.current);
          });
        }
      }
    }, 1000);
  };
  const getDominantExpression = (expressions) => {
    console.log(expressions);
    let dominantExpression = "";
    let maxConfidence = 0;

    Object.entries(expressions).forEach(([expression, confidence]) => {
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        dominantExpression = expression;
      }
    });

    return dominantExpression;
  };

  function handleClick() {
    alert("ok");
  }

  return (
    <div className="myapp">
      <Background />
      <div className="grid grid-cols-12 w-full h-screen">
        <div className="col-span-7 flex justify-center items-center">
          <div className="appvideo">
            <video crossOrigin="anonymous" ref={videoRef} autoPlay></video>
          </div>
          <canvas ref={canvasRef} width="640" height="480" className="appcanvas absolute" />
        </div>
        <div className="col-span-5 flex  justify-center items-center flex-col">
          <div className="">
            <h1 className="text-5xl"> umur anda : {umur}</h1>
          </div>
          <br />
          <div className="">
            <h1 className="text-4xl font-bold"> Ekspresi Anda :</h1>
            <table className="text-3xl">
              <thead></thead>
              <tbody>
                <tr className="text-yellow-500">
                  <td>Netral</td>
                  <td> 😐:</td>
                  <td>{Math.floor(ekspresi.neutral * 100) || "0"}%</td>
                </tr>
                <tr className="text-green-500">
                  <td>Bahagia</td>
                  <td> 😊:</td>
                  <td>{Math.floor(ekspresi.happy * 100) || "0"}%</td>
                </tr>
                <tr className="text-blue-500">
                  <td>Sedih</td>
                  <td> 😢:</td>
                  <td>{Math.floor(ekspresi.sad * 100) || "0"}%</td>
                </tr>
                <tr className="text-red-500">
                  <td>Marah</td>
                  <td> 😡:</td>
                  <td>{Math.floor(ekspresi.angry * 100) || "0"}%</td>
                </tr>
                <tr className="text-orange-500">
                  <td>Kaget</td>
                  <td> 😱:</td>
                  <td>{Math.floor(ekspresi.surprised * 100) || "0"}%</td>
                </tr>
              </tbody>
            </table>
            {/* <h1 className="text-6xl font-bold text-yellow-400"> Netral 😐:{Math.floor(ekspresi.neutral * 100) || ""}%</h1>
            <h1 className="text-6xl font-bold text-green-500"> {Math.floor(ekspresi.happy * 100) || ""}%</h1>
            <h1 className="text-6xl font-bold text-blue-400"> Sedih 😢:{Math.floor(ekspresi.sad * 100) || ""}%</h1>
            <h1 className="text-6xl font-bold text-orange-500"> Kaget 😱 :{Math.floor(ekspresi.surprised * 100) || ""}%</h1> */}
          </div>
          {/* <button type="submit" className="p-3 rounded-lg bg-blue-500" onClick={handleClick}>
            Ambil gambar
          </button> */}
        </div>
      </div>
    </div>
  );
}

export default App;
