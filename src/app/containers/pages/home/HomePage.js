import React from "react";
import _ from "lodash";
import nearestColor from "nearest-color";
import {parseColor} from "../../../helpers/color";
import Select from "react-select";
import classNames from "classnames";
import shortid from 'shortid';
import {rgbToHex} from "../../../helpers/color";


export default class HomePage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            imageProcessed: false,
            removeAlonePixels: true,
            inProgress: false,
            outputPixelSize: 5,
            colors: {
                black: '#000000',
                brown: '#AB5236',
                darkGray: '#5F574F',
                peach: '#FFCCAA',
            },
            pixelImageSize: {
                width: 128,
                height: 128,
            }
        }
    }

    componentDidMount() {
        //Выставить демо картинку
        const canvasElement = this.refs.canvas;
        const ctx = canvasElement.getContext("2d");
        canvasElement.width = 600;
        canvasElement.height = 600;
        var img = new Image;
        img.onload = function () {
            ctx.drawImage(img, 0, 0);
        };
        img.src = '/assets/img/demo/house.jpeg';
    }

    /**
     * Load image from input tag
     */
    loadImage() {
        const {pixelImageSize} = this.state;
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

                    this.handleChangePixelImageSize({width: pixelImageSize.width});
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
        const {removeAlonePixels, colors, pixelImageSize, outputPixelSize} = this.state;

        const canvasElement = this.refs.canvas;
        const width = canvasElement.width;
        const height = canvasElement.height;
        const ctx = canvasElement.getContext("2d");

        //Определяем размер одного пикселя по ширине (высота всегда пропорциональна)
        let pixelSize = width / pixelImageSize.width;

        //Размер пикселя не может быть нелевым
        pixelSize = pixelSize || 1;

        const processedCanvasElement = this.refs.processedCanvas;
        processedCanvasElement.height = pixelImageSize.height * outputPixelSize;
        processedCanvasElement.width = pixelImageSize.width * outputPixelSize;
        const processedCtx = processedCanvasElement.getContext("2d");
        const outputImageData = ctx.getImageData(0, 0, processedCanvasElement.width, processedCanvasElement.height);


        let colorMatrix = [];

        //Преобразуем цвета в нужный формат
        _.each(colors, (color, name) => {
            colors[name] = parseColor(color)
        });

        //Инициализация определятора цветов
        let colorDetector = nearestColor.from(colors);

        //Данные о цветах из картинки канвы
        const imageData = ctx.getImageData(0, 0, width, height);
        const pix = imageData.data;

        //Предварительная процессия каждого пикселя
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

                const wI = Math.floor((w / pixelSize));
                const hI = Math.floor((h / pixelSize));

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

                const colorMass = {};

                //Приводим все цвета в ячейке к шаблонным
                for (let i = 0; i < colorMatrix[hI][wI].length; i++) {
                    colorMatrix[hI][wI][i] = colorDetector(colorMatrix[hI][wI][i]);
                    colorMass[colorMatrix[hI][wI][i]['name']] = colorMass[colorMatrix[hI][wI][i]['name']] || 0;
                    colorMass[colorMatrix[hI][wI][i]['name']]++;
                }

                //Определяем доминирующий цвет в пикселе
                let maxColorName = '';
                let maxColorMass = 0;
                _.each(colorMass, (mass, colorName) => {
                    if (mass > maxColorMass) {
                        maxColorMass = mass;
                        maxColorName = colorName;
                    }
                });

                const color = colors[maxColorName];

                colorMatrix[hI][wI] = [
                    color.r,
                    color.g,
                    color.b,
                ];

            }
        }

        //Убираем одиночные пиксели
        if (removeAlonePixels) {
            for (let h = 0; h < colorMatrix.length; h++) {
                for (let w = 0; w < colorMatrix[h].length; w++) {
                    const pixel = colorMatrix[h][w];

                    //Есть соседи по кругу
                    const hasNeighbors = (h > 0 && h < colorMatrix.length - 1) && (w > 0 && w < colorMatrix[0].length - 1);

                    if (hasNeighbors) {
                        //Есть 1 такойже сосед
                        const hasSameNeighbors =
                            _.isEqual(pixel, colorMatrix[h - 1][w - 1]) ||
                            _.isEqual(pixel, colorMatrix[h - 1][w]) ||
                            _.isEqual(pixel, colorMatrix[h - 1][w + 1]) ||
                            _.isEqual(pixel, colorMatrix[h][w - 1]) ||
                            _.isEqual(pixel, colorMatrix[h][w + 1]) ||
                            _.isEqual(pixel, colorMatrix[h + 1][w - 1]) ||
                            _.isEqual(pixel, colorMatrix[h + 1][w]) ||
                            _.isEqual(pixel, colorMatrix[h + 1][w + 1]);

                        if (!hasSameNeighbors) {
                            colorMatrix[h][w] = _.clone(colorMatrix[h - 1][w - 1]);
                        }
                    }
                }
            }
        }

        //Составляем финальную картку
        for (let h = 0; h < pixelImageSize.height * outputPixelSize; h++) {
            for (let w = 0; w < pixelImageSize.width * outputPixelSize; w++) {

                const wI = Math.floor((w / outputPixelSize));
                const hI = Math.floor((h / outputPixelSize));

                outputImageData.data[(pixelImageSize.width * outputPixelSize * h + w) * 4] = colorMatrix[hI][wI][0];
                outputImageData.data[(pixelImageSize.width * outputPixelSize * h + w) * 4 + 1] = colorMatrix[hI][wI][1];
                outputImageData.data[(pixelImageSize.width * outputPixelSize * h + w) * 4 + 2] = colorMatrix[hI][wI][2];
                outputImageData.data[(pixelImageSize.width * outputPixelSize * h + w) * 4 + 3] = 255;
            }
        }

        console.log(outputImageData);

        //Возвращаем данные обратно в канву
        processedCtx.putImageData(outputImageData, 0, 0);
        this.setState({imageProcessed: true, inProgress: false})
    }

    addColor(color) {
        let {colors} = this.state;

        colors = _.clone(colors);
        colors[shortid.generate()] = color || '#fff';

        this.setState({colors: colors})
    }

    removeColor(colorName) {

        let {colors} = this.state;

        colors = _.clone(colors);
        delete colors[colorName];

        this.setState({colors: colors})
    }

    renderPalette() {
        const {colors} = this.state;

        const brickClassName = classNames({
            'small': _.size(colors) > 10
        }, 'colorBrick');


        const colorCells = _.map(colors, (color, colorName) => {
            return (
                <div key={colorName} className={brickClassName} style={{backgroundColor: color}}>
                    <div className="removeColor"
                         onClick={(e) => {
                             e.stopPropagation();
                             this.removeColor(colorName)
                         }}>
                        <i className="fa fa-remove"/>
                    </div>
                </div>
            )
        });

        return (
            <div>
                <div>
                    {colorCells}
                </div>

                <button className="btn btn-info"
                        onClick={() => this.addColor()}>
                    <i className="fa fa-fw fa-plus"/>
                    Add color
                </button>
            </div>
        )

    }

    pickColor(e) {
        const canvas = this.refs.canvas;

        const x = e.pageX - canvas.offsetLeft;
        const y = e.pageY - canvas.offsetTop;

        const ctx = canvas.getContext("2d");

        var imgData = ctx.getImageData(x, y, 1, 1).data;
        var R = imgData[0];
        var G = imgData[1];
        var B = imgData[2];

        const colorHex = rgbToHex(R, G, B);

        this.addColor(colorHex);
    }

    renderPalettePresets() {
        const rgbColors = {
            red: '#f00',
            yellow: '#ff0',
            blue: '#00f'
        };

        const bwColors = {
            black: '#000',
            white: '#fff',
        };

        const pico8colors = {
            black: '#000000',
            darkBlue: '#1D2B53',
            darkPurple: '#7E2553',
            darkGreen: '#008751',
            brown: '#AB5236',
            darkGray: '#5F574F',
            lightGray: '#C2C3C7',
            white: '#FFF1E8',
            red: '#FF004D',
            orange: '#FFA300',
            yellow: '#FFEC27',
            green: '#00E436',
            blue: '#29ADFF',
            indigo: '#83769C',
            pink: '#FF77A8',
            peach: '#FFCCAA',
        };

        const nesPalette = {
            c01: '#7C7C7C',
            c02: '#0000FC',
            c03: '#0000BC',
            c04: '#4428BC',
            c05: '#940084',
            c06: '#A80020',
            c07: '#A81000',
            c08: '#881400',
            c09: '#503000',
            c10: '#007800',
            c11: '#006800',
            c12: '#005800',
            c13: '#004058',
            c14: '#000000',
            c15: '#BCBCBC',
            c16: '#0078F8',
            c17: '#0058F8',
            c18: '#6844FC',
            c19: '#D800CC',
            c20: '#E40058',
            c21: '#F83800',
            c22: '#E45C10',
            c23: '#AC7C00',
            c24: '#00B800',
            c25: '#00A800',
            c26: '#00A844',
            c27: '#008888',
            c28: '#F8F8F8',
            c29: '#3CBCFC',
            c30: '#6888FC',
            c31: '#9878F8',
            c32: '#F878F8',
            c33: '#F85898',
            c34: '#F87858',
            c35: '#FCA044',
            c36: '#F8B800',
            c37: '#B8F818',
            c38: '#58D854',
            c39: '#58F898',
            c40: '#00E8D8',
            c41: '#787878',
            c42: '#FCFCFC',
            c43: '#A4E4FC',
            c44: '#B8B8F8',
            c45: '#D8B8F8',
            c46: '#F8B8F8',
            c47: '#F8A4C0',
            c48: '#F0D0B0',
            c49: '#FCE0A8',
            c50: '#F8D878',
            c51: '#D8F878',
            c52: '#B8F8B8',
            c53: '#B8F8D8',
            c54: '#00FCFC',
            c55: '#F8D8F8',
        };


        return (
            <div style={{paddingTop: 5, paddingBottom: 5}}>
                <button className="btn btn-default margin-right-5"
                        onClick={() => this.getAutoPalette()}>
                    <i className="fa fa-fw fa-magic"/>
                    <strong>
                        Auto palette
                    </strong>
                </button>
                <button className="btn btn-default margin-right-5"
                        onClick={() => this.setState({colors: {}})}>
                    No colors
                </button>
                <button className="btn btn-default margin-right-5"
                        onClick={() => this.setState({colors: bwColors})}>
                    Black/White
                </button>
                <button className="btn btn-default margin-right-5"
                        onClick={() => this.setState({colors: rgbColors})}>
                    Red+Green+Blue
                </button>
                <button className="btn btn-default margin-right-5"
                        onClick={() => this.setState({colors: pico8colors})}>
                    Pico-8
                </button>
                <button className="btn btn-default margin-right-5"
                        onClick={() => this.setState({colors: nesPalette})}>
                    NES
                </button>
            </div>
        )
    }

    getAutoPalette() {

        const canvasElement = this.refs.canvas;


        const colors = {};


        var colorThief = new ColorThief();
        const res = colorThief.getPalette(canvasElement, 8);
        _.each(res, colorArray => {
            colors[shortid.generate()] = rgbToHex(colorArray[0], colorArray[1], colorArray[2])
        });


        this.setState({colors})
    }


    handleChangePixelImageSize({width, height}) {
        const canvasElement = this.refs.canvas;

        if (width !== undefined){
            height = Math.floor(width/canvasElement.width * canvasElement.height)
        } else if (height !== undefined){
            width = Math.floor(height/canvasElement.height * canvasElement.width)
        }

        this.setState({
            pixelImageSize: {
                height, width
            }
        })
    }

    handleChangeOutputPixelSize(size){
        size = _.toNumber(size);
        if (isNaN(size)){
            size = 1;
        }
        this.setState({outputPixelSize: size})
    }

    render() {
        const {removeAlonePixels, pixelSize, imageProcessed, inProgress, pixelImageSize, colors, outputPixelSize} = this.state;

        var pixelSizeOptions = [
            {value: 5, label: '5px'},
            {value: 10, label: '10px'}
        ];

        return (
            <div className="container">
                <h2>Settings</h2>

                <div className="">
                    <div className="form-group">
                        <label className="">Real pixel image size</label>
                        <div>
                            width:
                            <input type="text" placeholder="width" value={pixelImageSize.width} onChange={(e) => this.handleChangePixelImageSize({width: e.target.value})}/>
                            height:
                            <input type="text" placeholder="height" value={pixelImageSize.height} onChange={(e) => this.handleChangePixelImageSize({height: e.target.value})}/>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="">Output pixel size</label>

                        <div>
                            <input type="text" value={outputPixelSize}
                                   onChange={(e) => this.handleChangeOutputPixelSize(e.target.value)}/>
                        </div>

                    </div>


                    <div className="form-group">
                        <label className="">Remove alone pixels</label>

                        <div>
                            <input type="checkbox"
                                   checked={removeAlonePixels}
                                   onChange={(e) => this.setState({removeAlonePixels: e.target.checked})}/>
                        </div>

                    </div>
                </div>

                <h2>Palette</h2>

                {this.renderPalettePresets()}

                <div>
                    {this.renderPalette()}
                </div>

                <hr/>

                <label className="btn btn-primary btn-file margin-right-5">
                    <i className="fa fa-fw fa-file-image-o"/>
                    Select image file...
                    <input
                        ref="fileInput"
                        type="file"
                        style={{display: 'none'}}
                        onChange={() => {
                            this.loadImage();
                            this.setState({imageProcessed: false})
                        }}/>
                </label>

                <button className="btn btn-success margin-right-5"
                        disabled={inProgress || !_.size(colors)}
                        onClick={() => {
                            this.setState({inProgress: true});
                            setTimeout(() => {
                                this.processImage()
                            }, 100)
                        }}>
                    <strong>
                        {inProgress ?
                            <i className="fa fa-fw fa-spinner fa-spin"/>
                            :
                            <i className="fa fa-fw fa-paint-brush"/>
                        }
                        Process image!
                    </strong>
                </button>

                <button className="btn btn-danger margin-right-5"
                        onClick={() => this.setState({imageProcessed: false})}>
                    <i className="fa fa-fw fa-remove"/>
                    Reset
                </button>

                <hr/>

                <canvas ref="canvas" style={{ display: imageProcessed ? 'none' : 'block'}}
                        onClick={(e) => this.pickColor(e)}/>
                <canvas ref="processedCanvas" style={{ display: imageProcessed ? 'block' : 'none'}}/>

            </div>
        )
    }

}