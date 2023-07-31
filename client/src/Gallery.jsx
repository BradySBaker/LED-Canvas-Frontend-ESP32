import React, {useState, useEffect, useRef} from 'react';

import styles from './cssModules/gallery.module.css';

const Gallery = ({frames, handleFrameChoice, prevFrameNames, handleDelete, anims, handleSave}) => {
  prevFrameNames = ['Rose', 'Biter', 'Tree'];
  anims = ['Biter', 'Jake'];
	const [frameElements, setFrameElements] = useState([]);

	const createFrames = () => {
		var newFrames = [];
		frames.forEach((curFrame, idx) => {
			var canvas = document.createElement('canvas');
			canvas.width = 128;
			canvas.height = 128;
			var c = canvas.getContext("2d");
			for (var y = 0; y < 16; y++) {
				var curColumn = curFrame[y];
				for (var x = 0; x < 16; x++) {
					var yPos = x * canvas.width/16;
					var xPos = y * canvas.height/16;

					var curSquare = curColumn[x];
					c.fillStyle = curSquare;
					c.fillRect(xPos, yPos, 16, 16);
				}
			}
			newFrames.push(canvas);
		});
		setFrameElements(newFrames)
	}

	useEffect(createFrames,[frames]);

	return (
		<div id={styles['widget']}>
			<h1 className={styles['title']}>Drawings</h1>
      <div className={styles['line']} />
      <h2 className={styles['title']}>Current</h2>
      {frameElements.map((curElem, idx) => {
				return(
				<div className='frameBox'>
					<canvas onClick={() => {handleFrameChoice(frames[idx][16])/* 16 contains name */}} className='frame' ref={(canvas) => {canvas && canvas.getContext("2d").drawImage(curElem, 0, 0);}} width={128} height={128}></canvas>
					<button style={{'color': 'red'}} onClick={() => {handleDelete(frames[idx][16], idx);}}>delete</button>
				</div>
				)
			})}
      <h2 className={styles['title']}>Saved</h2>
			{prevFrameNames.map((curName, idx) => {
			return(
			<div className='prevFrameBox'>
				<button style={{'color': 'blue', 'fontSize': '15px'}} onClick={() => {handleFrameChoice(curName)}}>{curName}</button>
				<button style={{'color': 'red'}} onClick={() => {handleDelete(curName, idx, 'prev');}}>delete</button>
			</div>
			)
			})}
      <div className={styles['line']} />
      <h1 className={styles['title']} style={{marginTop: '80px'}}>Animations</h1>
      <div className={styles['line']} />
			<div>Saved Animations</div>
			{anims.map((curName, idx) => {
				return(
					<div className='prevFrameBox'>
						<button style={{'color': 'blue', 'fontSize': '15px'}} onClick={() => {handleFrameChoice(curName, true)}}>{curName}</button>
						<button onClick={(e) => handleSave(e, true, curName)}>Add</button>
						<button style={{'color': 'red'}} onClick={() => {handleDelete(curName, idx, 'animation');}}>delete</button>
					</div>
				)
			})}
		</div>
	)
}

export default Gallery;