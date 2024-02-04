import React, { useRef, useEffect, useState } from "react";
import "./App.css";
import * as faceapi from "face-api.js";
import ParticleBackground from "./ParticleBackground";

function App() {
  const [umur, setUmur] = useState("");
  const [newUmur, setNewUmur] = useState("");
  const [ekspresiUtama, setEkspresiUtama] = useState("");
  const [ekspresi, setEkspresi] = useState("");
  const videoRef = useRef();
  const canvasRef = useRef();

  const [opsi, setOpsi] = useState();

  useEffect(() => {
    startVideo();
    loadModels();
    setOpsi(emoticonTexts);
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

            const foundEmotion = Object.entries(expressions).find(([key, value]) => value > 0.5);

            if (foundEmotion) {
              const [key, value] = foundEmotion;
              setEkspresiUtama({ key: foundEmotion[0], value: foundEmotion[1] });
            }

            // const ekspresiMain = Object.keys(expressions).filter((key) => expressions[key] > 0.5);
            // setEkspresi(ekspresiMain);

            setEkspresi(expressions);
            const drawBox = new faceapi.draw.DrawBox(box, { label });
            drawBox.draw(canvasRef.current);
          });
        }
      }
    }, 1000);
  };

  const emoticonTexts = {
    angry: "😠",
    disgusted: "😒",
    fearful: "😨",
    happy: "😊",
    neutral: "😐",
    sad: "😢",
    surprised: "😲",
  };

  const cat = {
    angry: "public/assets/angry.jpeg",
    disgusted: "public/assets/jijik.jpeg",
    fearful: "public/assets/takut.jpeg",
    happy: "public/assets/happy.jpeg",
    neutral: "public/assets/netral.jpeg",
    sad: "public/assets/sad1.jpeg",
    surprised: "public/assets/kaget.jpeg",
  };

  const persentase = {};

  // console.log(ekspresi);

  return (
    <div className="myapp">
      <ParticleBackground />
      <div className="absolute top-8 w-full h-20 flex justify-center">
        <h1 className="text-2xl font-bold">Lihat Kamera</h1>
      </div>
      <div className="grid grid-cols-12 w-full h-screen">
        <div className="col-span-7 flex justify-center items-center">
          <div className="appvideo ">
            <video crossOrigin="anonymous" ref={videoRef} autoPlay className="rounded-2xl"></video>
          </div>
          <canvas ref={canvasRef} width="640" height="480" className="appcanvas absolute " />
        </div>
        <div className="col-span-5 flex  justify-center items-center flex-col">
          <div className="w-72 ">
            <h1 className="text-4xl text-center">
              {" "}
              umur anda kemungkinan : <span className=" font-bold text-slate-600">{umur}</span>
            </h1>
          </div>
          <br />
          <div className="">
            {JSON.stringify(opsi) === JSON.stringify(persentase) ? (
              <table className="text-4xl">
                <thead></thead>
                <tbody>
                  <tr className="text-yellow-500 mb-10">
                    <td>Netral</td>
                    <td> : </td>
                    <td> </td>
                    <td>{Math.floor(ekspresi.neutral * 100) || "0"}%</td>
                  </tr>
                  <tr className="text-green-500 mb-3">
                    <td>Bahagia</td>
                    <td> : </td>
                    <td> </td>
                    <td>{Math.floor(ekspresi.happy * 100) || "0"}%</td>
                  </tr>
                  <tr className="text-blue-500 mb-3">
                    <td>Sedih</td>
                    <td> : </td>
                    <td> </td>
                    <td>{Math.floor(ekspresi.sad * 100) || "0"}%</td>
                  </tr>
                  <tr className="text-red-500 mb-3">
                    <td>Marah</td>
                    <td> : </td>
                    <td> </td>
                    <td>{Math.floor(ekspresi.angry * 100) || "0"}%</td>
                  </tr>
                  <tr className="text-orange-500 mb-3">
                    <td>Kaget</td>
                    <td> : </td>
                    <td> </td>
                    <td>{Math.floor(ekspresi.surprised * 100) || "0"}%</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <div className="">
                <h1 className="text-2xl font-bold font-poppins text-center"> Ekspresi Mu :</h1>
                <div className="w-full  flex flex-col  items-center ">
                  {JSON.stringify(opsi) === JSON.stringify(emoticonTexts)
                    ? emoticonTexts[ekspresiUtama.key] && <p className="text-[14rem] "> {emoticonTexts[ekspresiUtama.key] || "😐"}</p>
                    : cat[ekspresiUtama.key] && <img src={cat[ekspresiUtama.key]} className="my-8 w-[18rem] h-[18rem] object-cover" />}

                  <p className="text-[2rem] ">{ekspresiUtama.key}</p>
                  <p className="text-[1rem]">{Math.floor(ekspresiUtama.value * 100) || "0"}%</p>
                </div>
              </div>
            )}

            <button className="btn py-1 rotate-90 absolute top-5 right-5" onClick={() => document.getElementById("my_modal_2").showModal()}>
              <svg width="18" height="4" viewBox="0 0 18 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 2C4 3.10457 3.10457 4 2 4C0.89543 4 0 3.10457 0 2C0 0.89543 0.89543 0 2 0C3.10457 0 4 0.89543 4 2Z" fill="black" />
                <path d="M11 2C11 3.10457 10.1046 4 9 4C7.89543 4 7 3.10457 7 2C7 0.89543 7.89543 0 9 0C10.1046 0 11 0.89543 11 2Z" fill="black" />
                <path d="M18 2C18 3.10457 17.1046 4 16 4C14.8954 4 14 3.10457 14 2C14 0.89543 14.8954 0 16 0C17.1046 0 18 0.89543 18 2Z" fill="black" />
              </svg>
            </button>
            <dialog id="my_modal_2" className="modal">
              <div className="modal-box w-96">
                <h3 className="font-bold text-lg mb-5">Pilih Ekspresi :</h3>
                <div className="flex justify-around">
                  <button
                    className={`btn ${JSON.stringify(opsi) === JSON.stringify(emoticonTexts) ? `btn-primary text-white` : ``}`}
                    onClick={() => {
                      setOpsi(emoticonTexts);
                    }}
                  >
                    Emoticon
                  </button>
                  <button
                    className={`btn ${JSON.stringify(opsi) === JSON.stringify(cat) ? `btn-primary text-white` : ``}`}
                    onClick={() => {
                      setOpsi(cat);
                    }}
                  >
                    Cat Meme
                  </button>
                  <button
                    className={`btn ${JSON.stringify(opsi) === JSON.stringify(persentase) ? `btn-primary text-white` : ``}`}
                    onClick={() => {
                      setOpsi(persentase);
                    }}
                  >
                    Percen
                  </button>
                </div>
              </div>
              <form method="dialog" className="modal-backdrop">
                <button>close</button>
              </form>
            </dialog>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
