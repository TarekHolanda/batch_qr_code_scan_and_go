import React, { useState, useRef } from "react";
import ReactDOM from "react-dom/client";
import Papa from "papaparse";
import QRCodeCanvas from "qrcode.react";
import JSZip from "jszip";
import FileSaver from "file-saver";

import "./index.css";
import { formatData } from "./formatData";
import { Spacer } from "./Spacer";

import { Backdrop, CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import UploadIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import { darkTheme } from "./darkTheme";

function Home() {
    const [qrCodes, setQrCodes] = useState([]);
    const [qrCodesLoaded, setQrCodesLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const qrRef = useRef();

    const downloadQRCode = async (e) => {
        e.preventDefault();
        const zip = new JSZip();

        // Generate a QR code for each item in the array and add it to the zip
        for (let i = 0; i < qrCodes.length; i++) {
            const canvas = qrRef.current.querySelector("#qrCode" + i);

            const descriptionSize = qrCodes[i]["description"].length;
            
            // Add margin to the QR Code
            const canvasWithMargin = document.createElement("canvas");
            const marginContext = canvasWithMargin.getContext("2d");
            canvasWithMargin.width = canvas.width + 32;

            if (descriptionSize > 44) {
                canvasWithMargin.height = canvas.height + 184;
            } else if (descriptionSize > 23) {
                canvasWithMargin.height = canvas.height + 136;
            } else {
                canvasWithMargin.height = canvas.height + 88;
            }

            marginContext.fillStyle = "#fff";
            marginContext.fillRect(0, 0, canvasWithMargin.width, canvasWithMargin.height);
            marginContext.drawImage(canvas, 16, 16);

            // Draw the QR Code description
            const labelContext = canvasWithMargin.getContext("2d");
            labelContext.font = "48px Arial";
            labelContext.textBaseline = "bottom";
            labelContext.fillStyle = "#000000";
            labelContext.lineWidth = 20;
            
            labelContext.fillText(qrCodes[i]["description"].substring(0, 23), 12, 592);
            if (descriptionSize > 23) {
                labelContext.fillText(qrCodes[i]["description"].substring(23, 43), 12, 640);
            }
            if (descriptionSize > 44) {
                labelContext.fillText(qrCodes[i]["description"].substring(43, descriptionSize), 12, 688);
            }

            const blob = await new Promise((resolve) => canvasWithMargin.toBlob(resolve));
            const fileName = qrCodes[i]["description"] + ".png";
            zip.file(fileName, blob);
        }

        // Generate the zip file
        const zipBlob = await zip.generateAsync({ type: "blob" });

        // Save the zip file
        FileSaver.saveAs(zipBlob, "QR Codes.zip");
    };

    const onFileUploaded = (e) => {
        if (e.target.files.length) {
            startLoading();

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

                    setTimeout(() => {
                        setQrCodesLoaded(true);
                    }, 500);

                    setTimeout(() => {
                        stopLoading();
                    }, 1000);
                },
            });
        }
    };

    const clearQRCode = () => {
        startLoading();
        setQrCodesLoaded(false);

        setTimeout(() => {
            document.getElementById("file").value = "";
            setQrCodes([]);
            stopLoading();
        }, 1100);
    };

    const startLoading = () => {
        setLoading(true);
    };

    const stopLoading = () => {
        setLoading(false);
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            
            <main>
                <Box>
                    <h1>
                       Scan & Go - QR Code Generator (Inspector)
                    </h1>

                    <Spacer size={24} vertical />

                    <Button variant="contained" size="large" component="label" startIcon={<UploadIcon />}>
                        Upload
                        <input hidden accept=".csv" name="file" type="file" id="file" onChange={onFileUploaded} />
                    </Button>

                    <Spacer size={24} horizontal />

                    <Button variant="contained" size="large" onClick={downloadQRCode} disabled={!qrCodesLoaded} startIcon={<DownloadIcon />}>
                        Download
                    </Button>

                    <Spacer size={20} horizontal />

                    <Button variant="contained" size="large" onClick={clearQRCode} startIcon={<DeleteIcon />}>
                        Clear
                    </Button>
                </Box>

                <Box sx={{ display: "flex", marginTop: "96px" }}>
                    <Fade
                        in={qrCodesLoaded}
                        timeout={500}
                    >
                        <Grid
                            container
                            direction="row"
                            justifyContent="space-evenly"
                            alignItems="baseline"
                            className="bg-white color-black padding-bottom-32 qr-code-wrapper"
                            spacing={6}
                        >
                            {qrCodes.map((qrCode, index) => (
                                <Grid key={index} item xs={12} sm={6} md={2}>
                                    <QRCodeCanvas
                                        value={qrCode["data"]}
                                        id={"qrCode" + index}
                                        size={256}
                                        level={"H"}
                                        imageSettings={{
                                            src: "./hc-icon-black.png",
                                            height: 38,
                                            width: 48,
                                            excavate: true,
                                        }}
                                    />
                                    <span className="display-block padding-side-4 line-break-any font-size-24">
                                        {qrCode["description"]}
                                    </span>
                                </Grid>
                            ))}
                        </Grid>
                    </Fade>
                </Box>

                <Box sx={{ display: "none" }} ref={qrRef}>
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
                </Box>

                <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
                    <CircularProgress color="inherit" />
                </Backdrop>
            </main>
        </ThemeProvider>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Home />);
