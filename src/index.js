import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom/client";
import Papa from "papaparse";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import JSZip from "jszip";
import FileSaver from "file-saver";
import "./index.css";

function formatData(fileRow) {
    let dataTemp = {
        "description": fileRow.description,
        "action": fileRow.action,
        "module": fileRow.module,
        "data": {}
    };

    if (fileRow["data/pestCategory"]) {
        dataTemp.data.pestCategory = parseInt(fileRow["data/pestCategory"]);
    }

    if (fileRow["data/crew"]) {
        dataTemp.data.crew = parseInt(fileRow["data/crew"]);
    }

    if (fileRow["data/crop"]) {
        dataTemp.data.cropVariety = parseInt(fileRow["data/crop"]);
    }

    if (fileRow["data/equipment"]) {
        dataTemp.data.equipment = parseInt(fileRow["data/equipment"]);
    }

    if (fileRow["data/locations/level"] && fileRow["data/locations/id"]) {
        dataTemp.data.locations = [{
            level: fileRow["data/locations/level"],
            id: parseInt(fileRow["data/locations/id"]),
        }];
    }

    if (fileRow["data/questions/code"] && fileRow["data/questions/answer"]) {
        dataTemp.data.questions = [{
            code: parseInt(fileRow["data/questions/code"]),
            answer: fileRow["data/questions/answer"],
        }];
    }

    let i = 1;
    for (const [key, value] of Object.entries(fileRow)) {
        if (key === "data/questions/code_" + i && value) {
            dataTemp.data.questions.push({
                code: parseInt(fileRow[key]),
                answer: fileRow["data/questions/answer_" + i],
            });
            i++;
        }
    }

    return dataTemp;
}

function Home() {
    const [qrCodes, setQrCodes] = useState([]);
    const qrRef = useRef();

    const downloadQRCode = async (e) => {
        e.preventDefault();
        const zip = new JSZip();

        // Generate a QR code for each item in the array and add it to the zip
        for (let i = 0; i < qrCodes.length; i++) {
            const canvas = qrRef.current.querySelector("#qrCode" + i);
            const blob = await new Promise(resolve => canvas.toBlob(resolve));
            const fileName = `qrcode-${i + 1}.png`;
            zip.file(fileName, blob);
        }

        // Generate the zip file
        const zipBlob = await zip.generateAsync({ type: "blob" });

        // Save the zip file
        FileSaver.saveAs(zipBlob, "QR Codes.zip");

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
            },
        });
    };

    return (
        <div>
            <div>
                Upload CSV to generate Scan and Go QR Codes
            </div>
            <input
                type="file"
                name="file"
                accept=".csv"
                onChange={onFileUploaded}
                style={{ display: "block", margin: "10px auto" }}
            />

            <button onClick={downloadQRCode}>
                Download
            </button>

            <div ref={qrRef} className="displany-non">
                {qrCodes.map((qrCode, index) => (
                    <div key={index}>
                        {/* {qrCode["description"]} */}
                        <QRCodeCanvas
                            value={qrCode["data"]}
                            id={"qrCode" + index}
                            size={512}
                            // bgColor={"#00ff00"}
                            level={"H"}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Home />);
