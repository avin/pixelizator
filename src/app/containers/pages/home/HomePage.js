import React from "react";
import _ from 'lodash';
import nearestColor from 'nearest-color';

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

        // const colors = {
        //     red: '#f00',
        //     yellow: '#ff0',
        //     blue: '#00f'
        // };

        const colors = {
            black: '#000',
            white: '#fff',

        };

        let colorDetector = nearestColor.from(colors);

        const imageData = ctx.getImageData(0, 0, width, height);

        const pix = imageData.data;

        //Процессия каждого пикселя
        for (let i = 0, n = pix.length; i < n; i += 4) {
            //Инверсия цвета
            // pix[i  ] = 255 - pix[i  ]; // red
            // pix[i+1] = 255 - pix[i+1]; // green
            // pix[i+2] = 255 - pix[i+2]; // blue


            //Цветовой шум
            // pix[i  ] = pix[i  ] + _.random(0,50) - 25; // red
            // pix[i+1] = pix[i+1] + _.random(0,50) - 25; // green
            // pix[i+2] = pix[i+2] + _.random(0,50) - 25; // blue


            //4 битность цвета
            // pix[i  ] = Math.round(pix[i  ]/255) * 255;
            // pix[i+1] = Math.round(pix[i+1  ]/255) * 255;
            // pix[i+2] = Math.round(pix[i+2  ]/255) * 255;
        }

        //Составляем матрицу цвета по болшим пикселям
        for (let h = 0; h < height; h++) {
            for (let w = 0; w < width; w++) {

                const wI = Math.floor((w / bigPixelSize));
                const hI = Math.floor((h / bigPixelSize));

                //Create array cell in matrix
                if (colorMatrix[hI] === undefined) {
                    colorMatrix[hI] = [];
                }
                if (colorMatrix[hI][wI] === undefined) {
                    colorMatrix[hI][wI] = [];
                }

                const pixel = {
                    r: pix[(width * h + w) * 4],
                    g: pix[(width * h + w) * 4 + 1],
                    b: pix[(width * h + w) * 4 + 2],
                    a: pix[(width * h + w) * 4 + 3]
                };

                colorMatrix[hI][wI].push(pixel);
            }
        }

        for (let hI = 0; hI < colorMatrix.length; hI++) {
            for (let wI = 0; wI < colorMatrix[hI].length; wI++) {

                //Вычисляем единый цвет для пикселя
                //TODO

                const color = colorDetector(colorMatrix[hI][wI][0]);

                colorMatrix[hI][wI] = [
                    color.rgb.r,
                    color.rgb.g,
                    color.rgb.b,
                ];

            }
        }

        let step = 0;

        //Составляем финальную картку
        for (let h = 0; h < height; h++) {
            for (let w = 0; w < width; w++) {

                const wI = Math.floor((w / bigPixelSize));
                const hI = Math.floor((h / bigPixelSize));

                pix[(width * h + w) * 4] = colorMatrix[hI][wI][0];
                pix[(width * h + w) * 4 + 1] = colorMatrix[hI][wI][1];
                pix[(width * h + w) * 4 + 2] = colorMatrix[hI][wI][2];

                // let color = [
                //     pix[(width * h + w) * 4],
                //     pix[(width * h + w) * 4 + 1],
                //     pix[(width * h + w) * 4 + 2],
                //     pix[(width * h + w) * 4 + 3],
                // ]

                //8 битность цвета
                // pix[(width*h + w)*4] = Math.round(color[0]/128)*128;
                // pix[(width*h + w)*4 + 1] = Math.round(color[1]/128)*128;
                // pix[(width*h + w)*4 + 2] = Math.round(color[2]/128)*128;

                //Картинка только в альфа слое
                // pix[(width*h + w)*4 + 3] = 255 - pix[(width*h + w)*4]
                // pix[(width*h + w)*4] = 255
                // pix[(width*h + w)*4 + 1] = 255
                // pix[(width*h + w)*4 + 2] = 255

                //Боковая засветка
                // pix[(width*h + w)*4] = pix[(width*h + w)*4] + w/10;
                // pix[(width*h + w)*4 + 1] = pix[(width*h + w)*4 + 1] + w/10;
                // pix[(width*h + w)*4 + 2] = pix[(width*h + w)*4 + 2] + w/10;
                // pix[(width*h + w)*4 + 3] = pix[(width*h + w)*4 + 3] + w/10;

            }
        }

        //Возвращаем данные обратно в канву
        ctx.putImageData(imageData, 0, 0);
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