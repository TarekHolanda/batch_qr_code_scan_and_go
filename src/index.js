import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom/client";
import Papa from "papaparse";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import JSZip from "jszip";
import FileSaver from "file-saver";
import "./index.css";
import { formatData } from "./formatData";

function Home() {
    const [qrCodes, setQrCodes] = useState([]);
    const [zipDownloaded, setZipDownloaded] = useState(false);
    const qrRef = useRef();

    const downloadQRCode = async (e) => {
        e.preventDefault();
        const zip = new JSZip();

        // Generate a QR code for each item in the array and add it to the zip
        for (let i = 0; i < qrCodes.length; i++) {
            const canvas = qrRef.current.querySelector("#qrCode" + i);
            
            // Add margin to the QR Code
            const canvasWithMargin = document.createElement("canvas");
            const marginContext = canvasWithMargin.getContext("2d");
            canvasWithMargin.width = canvas.width + 32;
            canvasWithMargin.height = canvas.height + 96;
            marginContext.fillStyle = "#fff";
            marginContext.fillRect(0, 0, canvasWithMargin.width, canvasWithMargin.height);
            marginContext.drawImage(canvas, 16, 16);

            // Draw the QR Code description
            const labelContext = canvasWithMargin.getContext("2d");
            labelContext.font = "56px Arial";
            labelContext.textBaseline = "bottom";
            labelContext.fillStyle = "#000000";
            labelContext.lineWidth = 20;
            labelContext.fillText(qrCodes[i]["description"], 12, 600);

            const blob = await new Promise((resolve) => canvasWithMargin.toBlob(resolve));
            const fileName = qrCodes[i]["description"] + ".png";
            zip.file(fileName, blob);
        }

        // Generate the zip file
        const zipBlob = await zip.generateAsync({ type: "blob" });

        // Save the zip file
        FileSaver.saveAs(zipBlob, "QR Codes.zip");

        setZipDownloaded(true);
        setQrCodes([]);
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

            <div ref={qrRef} className="display-none">
                {qrCodes.map((qrCode, index) => (
                    <div key={index}>
                        <QRCodeCanvas
                            value={qrCode["data"]}
                            id={"qrCode" + index}
                            size={512}
                            level={"H"}
                            imageSettings={{
                                src: "./hc-icon-black.png",
                                height: 103,
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
