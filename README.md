# HC - Scan & Go

This project will serve the purpose of internal usage to generate the QR Codes for the Scan & Go feature

## CSV Structure
The first row of the CSV file will define what object that column will be.

| Column Name               | Type                | Value                                        |
| ------------------------- | ------------------- | -------------------------------------------- |
| `description`             | `string` (required) | Label below the QR Code and image file name  |
| `action`                  | `string` (required) | "START_REPORT" (only accepted value for now) |
| `module`                  | `number` (required) | "INSPECTOR" (only accepted value for now)    |
| `data/pestCategory`       | `number` (required) | Pest Category ID / Checklist ID              |
| `data/locations/level`    | `string` (optional) | "grower", "field", "section", "block"        |
| `data/locations/id`       | `number` (optional) | Location ID                                  |
| `data/questions/code`     | `number` (optional) | Question Code / Question First Version ID    |
| `data/questions/answer`   | `string` (optional) | Question Answer                              |

## To run the project locally

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

## The project is available on Vercel

[https://scan-and-go-qr-code-generator.vercel.app/]