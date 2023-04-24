import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom/client";
import Papa from "papaparse";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import "./index.css";

function formatData(fileRow) {
    let dataTemp = {
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
    console.log(i);
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
    const [qrCodeValue, setQrCodeValue] = useState("");
    const qrRef = useRef();
    const isFirstRender = useRef(true);
    // setQrCodeValue(valuesArray);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return; // 👈️ return early if initial render
        }

        console.log("useEffect ran. count is: ", qrCodeValue);
        downloadQRCode();
    }, [qrCodeValue]);

    const downloadQRCode = () => {
        console.log(qrCodeValue);
        // e.preventDefault();
        let canvas = qrRef.current.querySelector("canvas");
        console.log(canvas);
        let image = canvas.toDataURL("image/png");
        let anchor = document.createElement("a");
        anchor.href = image;
        anchor.download = `qr-code.png`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        // setUrl("");
    };

    const onFileUploaded = (e) => {
        Papa.parse(e.target.files[0], {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                const aaa = formatData(results.data[0]);
                console.log(aaa);
                setQrCodeValue(JSON.stringify(aaa));
                console.log("Foi...");
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

            {/* <QRCodeSVG value="https://reactjs.org/" /> */}

            <button onClick={downloadQRCode}>
                Download
            </button>

            <div ref={qrRef} className="displany-non">
                <QRCodeCanvas
                    value={qrCodeValue}
                    id="qrCode"
                    size={512}
                    // bgColor={"#00ff00"}
                    level={"H"}
                />
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Home />);
