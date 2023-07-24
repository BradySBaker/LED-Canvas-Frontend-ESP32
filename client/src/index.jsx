import React, {useState, useEffect, useRef} from "react";

import {handleSendRequests, sendData} from './helperFunctions/handleSendGet';
import {handleSave, handleDelete} from './helperFunctions/handleSaveDelete';
import connectToBle from './helperFunctions/setupBluetooth';

import { createRoot } from "react-dom/client";
import MatrixButtons from "./matrixButtons.jsx";
import FrameChoices from "./frameChoices.jsx";
import RainController from "./rainController.jsx";
import DrawMode from "./drawMode.jsx";
import AVController from "./avController.jsx";

window.rainColorsSent = 0;

window.color = "#FF0000";

window.ledConnected = false;

window.modeRunning = true;

window.framePlayed = false;

window.turnedOn = false;

const App = function() {
	const [isConnected, setIsConnected] = useState(false);
	const [mouseDown, setMouseDown] = useState(false);
	const [pixelSending, setPixelSending] = useState(false);
	const [modeDataSending, setModeDataSending] = useState(true);
	const [frames, setFrames] = useState([]);
	const [curFrame, setCurFrame] = useState([]);
	const [drawMode, setDrawMode] = useState(false);
	const [audioVisualizer, setAudioVisualizer] = useState(false);
	const [rainMode, setRainMode] = useState(false);
	const [prevFrameNames, setPrevFrameNames] = useState(null);
	const [inputError, setInputError] = useState(false);
	const [anims, setAnims] = useState([]);
	const [animPlaying, setAnimPlaying] = useState(false);

  const [colorChoices, setColorChoices] = useState([]);
	const [curChosenColor, setCurChosenColor] = useState(color);

	useEffect(() => handleSendRequests(setPixelSending, pixelSending), []); //On start
	useEffect(() => {if (isConnected === true) {handleModeStartStop()}}, [isConnected]) //On connect

	function turnOn() {
		setTimeout(() => {sendData("names");}, 100);
	}

	function turnOff(e, save = false) {
		for (var x = 0; x < 16; x++) {
			for (var y = 0; y < 16; y++) {
				document.getElementById(`${x},${y}`).style.backgroundColor = 'black';
			}
		}
		sendRequests["off"] = true;
	}


	const handleFrameChoice = (frameName, animation) => {
		if (modeRunning && !framePlayed) {
			setModeDataSending(true);
			sendData(`F${frameName}`);
			setTimeout(() => {handleFrameChoice(frameName)}, 400);
			return;
		} else if (modeRunning) {
			framePlayed = false;
			setModeDataSending(false);
			return;
		}
		if (animation) {
			setAnimPlaying(true);
			sendData(`I${frameName}`);
			return;
		}
		sendData(`F${frameName}`);
	};


	const handleStop = () => {
		sendData('STOP');
		setAnimPlaying(false);
	};


	const callSave = (e, animation, animName = document.getElementById('animName').value) => {
		handleSave(sendData, setFrames, frames, anims, setAnims, setInputError, e, animation, animName);
	};

	const callDelete = (frameName, idx, type) => {
		handleDelete(setFrames, frames, setPrevFrameNames, prevFrameNames, anims, setAnims, sendData, frameName, idx, type);
	};

	//Rain/Audio Visaulizer handler for off and on
	const handleModeStartStop = (e, rain, startMode, rainAmount) => {
		if (modeRunning && !startMode) {
			sendData("SM");
			setTimeout(handleModeStartStop, 400);
		} else if (e) {
			if (!modeRunning && rain) {
				if (!rainAmount) {
					rainAmount = document.getElementById('rainAmount').value
				}
				if (isNaN(Number(rainAmount)) || rainAmount.length < 1 || rainColorsSent === 0) {
					setInputError("Please input a number value and a color");
					return;
				}
				sendData("R" + rainAmount);
				setTimeout(() => {handleModeStartStop(true, true, true, rainAmount)}, 400);
			}
		} else {
      setColorChoices([]);
    }
	};

  const handleModeChooseColor = () => {
		var colors = JSON.parse(JSON.stringify(colorChoices));
		colors.push(curChosenColor);
		setColorChoices(colors);
		sendData("CM" + curChosenColor.slice(1));
		setModeDataSending(true);
		rainColorsSent++;
	};

	return (
		<div id='colorApp'>
			<div>Version 2.0</div>
			{isConnected ? <h1 style={{'color': 'blue', 'fontSize': '15px'}}>Connected</h1> : <h1 style={{'color': 'red', 'fontSize': '20px'}}>Not connected</h1>}
			{!isConnected ? <button onClick={() => connectToBle(setIsConnected, turnOn, setAnims, setPrevFrameNames, setModeDataSending)}>Connect</button> : null}
			<h1 id='title'>
			<div id='title-line'></div>
				LED Canvas
			</h1>
			{drawMode || audioVisualizer || rainMode ? <button style={{'position': 'absolute', 'right': '2%', 'fontSize': '20px'}} onClick={() => {setDrawMode(false); setAudioVisualizer(false); setRainMode(false);}}>Back</button> : null}
			{(pixelSending || modeDataSending) && isConnected ? <img id='loading' src='./icons/loading.gif'></img> : null}
			<div id='app' onMouseDown={() => {setMouseDown(true);}} onMouseUp={() => setMouseDown(false)}>
			{!drawMode && !audioVisualizer && !rainMode && isConnected && !pixelSending && !modeDataSending ?
			<div id='modeChoices'>
				<button onClick={() => setDrawMode(true)}>Draw Mode</button>
				<button onClick={() => {setAudioVisualizer(true); sendData('AV')}}>Audio Visualizer</button>
				<button onClick={() => {setRainMode(true);}}>Rain Mode</button>
			</div> : null}
			{drawMode ? <DrawMode inputError={inputError} turnOff={turnOff} callSave={callSave} handleStop={handleStop} animPlaying={animPlaying} pixelSending={pixelSending}/> : null}
			{drawMode || rainMode && !modeDataSending ? <FrameChoices handleSave={callSave} anims={anims} prevFrameNames={prevFrameNames} frames={frames} handleFrameChoice={handleFrameChoice} handleDelete={callDelete}/> : null}
			{rainMode ? <RainController sendData={sendData} modeDataSending={modeDataSending} curChosenColor={curChosenColor} handleChooseColor={handleModeChooseColor} colorChoices={colorChoices} setCurChosenColor={setCurChosenColor} modeDataSending={modeDataSending} setInputError={setInputError} handleModeStartStop={handleModeStartStop}/> : null}
			{drawMode ? <MatrixButtons mouseDown={mouseDown} sendRequests={sendRequests}/> : null}
      {audioVisualizer ? <AVController setModeDataSending={setModeDataSending} handleChooseColor={handleModeChooseColor} modeDataSending={modeDataSending}/> : null}
			{inputError ? <div style={{"color": "red"}}>{inputError}</div>: null}
		</div>
		</div>
	)
}

const container = document.getElementById('root');
const root = createRoot(container);

  root.render(
    <App />
  );
