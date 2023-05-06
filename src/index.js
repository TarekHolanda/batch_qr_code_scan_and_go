import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom/client";
import Papa from "papaparse";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import JSZip from "jszip";
import FileSaver from "file-saver";
import "./index.css";
import { formatData } from "./formatData";

function Home() {
    const [qrCodes, setQrCodes] = useState([{data: '{\"description\":\"Fertilizer 23SB-1002\",\"action\":\"START_REPORT\",\"module\":\"INSPECTOR\",\"data\":{\"pestCategory\":602,\"locations\":[{\"level\":\"block\",\"id\":32098}],\"questions\":[{\"code\":22884,\"answer\":\"5\"},{\"code\":22886,\"answer\":\"56\"}', description: "Fertilizer 23SB-1002"}]);
    // const [qrCodes, setQrCodes] = useState([]);
    const [zipDownloaded, setZipDownloaded] = useState(false);
    const qrRef = useRef();

    const downloadQRCode = async (e) => {
        e.preventDefault();
        const zip = new JSZip();

        // Generate a QR code for each item in the array and add it to the zip
        for (let i = 0; i < qrCodes.length; i++) {
            const canvas = qrRef.current.querySelector("#qrCode" + i);

            const canvasWithMargin = document.createElement("canvas");
            const marginContext = canvasWithMargin.getContext("2d");

            canvasWithMargin.width = canvas.width + 32;
            canvasWithMargin.height = canvas.height + 96;
            marginContext.fillStyle = "#fff";
            
            marginContext.fillRect(0, 0, canvasWithMargin.width, canvasWithMargin.height);
            // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
            marginContext.drawImage(canvas, 16, 16);

            // Draw the QR Code description
            const labelContext = canvasWithMargin.getContext("2d");

            labelContext.font = "56px Arial";
            labelContext.textBaseline = "bottom";
            labelContext.fillStyle = "#000000";
            labelContext.lineWidth = 20;

            // labelContext.strokeRect(0, 0, canvasWithMargin.width, canvasWithMargin.height);
            labelContext.fillText(qrCodes[i]["description"], 12, 600);

            // const canvasWithLabel = document.createElement("canvas");
            // const labelContext = canvasWithLabel.getContext("2d");
            // canvasWithLabel.width = canvasWithMargin.width + margin;
            // canvasWithLabel.height = canvasWithMargin.height + margin;
            // labelContext.font = "48px Arial";
            // labelContext.textAlign = "start";
            // labelContext.textBaseline = "bottom";
            // labelContext.fillStyle = "#000000";
            // labelContext.lineWidth = 24;
            // labelContext.strokeRect(0, 0, canvasWithLabel.width, canvasWithLabel.height);
            // labelContext.fillText(label, labelX, labelY);
            // labelContext.drawImage(canvasWithMargin, 16, 16);

            const blob = await new Promise((resolve) => canvasWithMargin.toBlob(resolve));
            const fileName = qrCodes[i]["description"] + ".png";
            zip.file(fileName, blob);
        }

        // Generate the zip file
        const zipBlob = await zip.generateAsync({ type: "blob" });

        // Save the zip file
        FileSaver.saveAs(zipBlob, "QR Codes.zip");

        setZipDownloaded(true);
        // setQrCodes([]);

        // Download Individual QR Code Image
        // qrCodes.forEach((qrCode, index) => {
        //     let canvas = qrRef.current.querySelector("#qrCode" + index);
        //     console.log(canvas);
        //     let image = canvas.toDataURL("image/png");
        //     let anchor = document.createElement("a");
        //     anchor.href = image;
        //     anchor.download = `qr-code.png`;
        //     document.body.appendChild(anchor);
        //     anchor.click();
        //     document.body.removeChild(anchor);
        //     // setUrl("");
        // });
    };

    const onFileUploaded = (e) => {
        Papa.parse(e.target.files[0], {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                let dataFormatted = [];

                for (let i = 0; i < results.data.length; i++) {
                    const aux = formatData(results.data[i]);
                    dataFormatted.push({
                        description: aux.description,
                        data: JSON.stringify(aux),
                    });
                }

                setQrCodes(dataFormatted);
                setZipDownloaded(false);
            },
        });
    };

    return (
        <div>
            <div>
                Upload CSV to generate Scan and Go QR Codes
            </div>

            <label htmlFor="file">Enviar arquivo</label>
            <input
                type="file"
                name="file"
                id="file"
                accept=".csv"
                onChange={onFileUploaded}
                className="display-none"
            />

            <button onClick={downloadQRCode} disabled={qrCodes.length < 1}>
                Download
            </button>

            {qrCodes.length > 0 && (
                <div>
                    File uploaded successfully!
                </div>
            )}

            {zipDownloaded && (
                <div>
                    QR Codes downloaded successfully!
                </div>
            )}

            <div ref={qrRef} className="display-non">
                {qrCodes.map((qrCode, index) => (
                    <div key={index}>
                        {/* {qrCode["description"]} */}
                        <QRCodeCanvas
                            value={qrCode["data"]}
                            id={"qrCode" + index}
                            size={512}
                            // className="qr-code"
                            // src="asdasdasd"
                            level={"H"} // L, M, Q, H
                            // bgColor={"rgb(240, 240, 240)"}
                            // fgColor={"#fff"}
                            // marginSize={150}
                            // includeMargin={true}
                            imageSettings={{
                                src: "./hc-icon-black.png",
                                // x: undefined,
                                // y: undefined,
                                // height: 81,
                                // width: 192,
                                height: 128,
                                width: 128,
                                excavate: true,
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Home />);
