import React from "react";

export default class HomePage extends React.Component {

    /**
     * Load image from input tag
     */
    loadImage() {
        let input, file, fr, img;

        if (typeof window.FileReader !== 'function') {
            console.info("The file API isn't supported on this browser yet.");
            return;
        }

        input = this.refs.fileInput;

        if (!input) {
            console.info("Um, couldn't find the imgfile element.");
        }
        else if (!input.files) {
            console.info("This browser doesn't seem to support the `files` property of file inputs.");
        }
        else if (!input.files[0]) {
            console.info("Please select a file before clicking 'Load'");
        }
        else {
            file = input.files[0];
            fr = new FileReader();
            fr.onload = () => {
                img = new Image();
                img.onload = () => {
                    const canvas = this.refs.canvas;
                    canvas.width = img.width;
                    canvas.height = img.height;

                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                };
                img.src = fr.result;
            };

            fr.readAsDataURL(file);
        }
    }

    /**
     * Process image convert
     */
    processImage() {
        const canvasElement = this.refs.canvas;
        const width = canvasElement.width;
        const height = canvasElement.height;
        const ctx = canvasElement.getContext("2d");
        const bigPixelSize = 10;
        let colorMatrix = [];

        for (let w = 0; w < width; w++) {
            for (let h = 0; h < height; h++) {
                const pixel = ctx.getImageData(w, h, 1, 1);

                const wI = Math.floor((w / width) * (width / bigPixelSize));
                const hI = Math.floor((h / height) * (height / bigPixelSize));

                //Create array cell in matrix
                if (colorMatrix[wI] === undefined){
                    colorMatrix[wI] = [];
                }
                if (colorMatrix[wI][hI] === undefined){
                    colorMatrix[wI][hI] = [];
                }

                colorMatrix[wI][hI].push(pixel);
            }
        }

        console.log(colorMatrix[0][0]);
    }

    render() {
        return (
            <div>
                <input type='file' ref="fileInput" onChange={() => this.loadImage()}/>

                <canvas ref="canvas"/>

                <button onClick={() => this.processImage()}>Make fun!</button>
            </div>
        )
    }
}