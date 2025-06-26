My Sales Aggregator
A full-stack application for uploading CSV files containing sales data, aggregating total sales by department, and downloading the processed results as a CSV file. The frontend is built with React (JavaScript, Vite), and the backend uses Node.js with Express.
Project Structure

client/: React frontend for uploading CSVs and displaying download links.
server/: Node.js backend for processing CSVs and serving results.
client/src/components/FileUploader.jsx: Handles file uploads and UI feedback.
server/src/index.js: Processes CSV files and generates aggregated output.

Setup
Prerequisites

Node.js: v20.11.1 or v18.20.4 (recommended for Vite compatibility).
Git: For cloning the repository.
GitHub Account: For repository access.

Backend Setup

Navigate to the server/ directory:cd server


Install dependencies:npm install


Create uploads/ and results/ directories:mkdir uploads results


Start the server:node src/index.js


The server runs on http://localhost:3000.



Frontend Setup

Navigate to the client/ directory:cd client


Install dependencies:npm install


Start the development server:npm run dev


Open http://localhost:5173 in your browser.



How to Run the App

Start the Backend:
Ensure the backend is running (http://localhost:3000).
Verify uploads/ and results/ directories exist in server/.


Start the Frontend:
Run the frontend dev server and access http://localhost:5173.


Upload a CSV:
Use the UI to select a CSV file with columns department, date, number_of_sales (e.g., Electronics,2023-08-01,100).
Click "Upload" to process the file.
Download the processed CSV with aggregated sales (e.g., department,total_sales).


Example Input CSV:department,date,number_of_sales
Electronics,2023-08-01,100
Clothing,2023-08-01,200
Electronics,2023-08-02,150


Example Output CSV:department,total_sales
Electronics,250
Clothing,200



How to Test

End-to-End Testing:
Start both backend (node src/index.js) and frontend (npm run dev).
Upload a CSV via http://localhost:5173.
Verify the download link appears and the downloaded CSV contains correct aggregated data.
Check server/uploads/ for the uploaded file and server/results/ for the processed file.


Backend Testing with Postman:
Method: POST
URL: http://localhost:3000/api/upload
Body: form-data, key=file, value=select a CSV file.
Expected Response: 200 OK with { "downloadUrl": "http://localhost:3000/results/<uuid>.csv" }.
Test the download URL (GET http://localhost:3000/results/<uuid>.csv).


Frontend Testing:
Open browser Developer Tools (F12 > Console/Network).
Upload a CSV and check for errors in the Console.
Verify the POST /api/upload request in the Network tab returns 200 OK.


File Validation:
Test with invalid CSVs (e.g., missing number_of_sales column) to ensure error messages display.


Command to Check Files:ls server/uploads
ls server/results



Algorithm Explanation
The application aggregates sales data from a CSV file by department, producing a new CSV with total sales per department.
Backend Algorithm (server/src/index.js)

File Upload:
Uses multer to save the uploaded CSV to uploads/ with a unique filename (UUID).


CSV Parsing:
Streams the CSV using csv-parser to read rows with department, date, and number_of_sales.
Maintains a departmentSales object to track total sales per department.
For each row:
Extracts department and number_of_sales.
Converts number_of_sales to an integer (defaults to 0 if invalid).
Adds sales to departmentSales[department].




Output Generation:
Converts departmentSales to an array of { department, total_sales }.
Uses csv-writer to write the array to a new CSV in results/ with a unique filename.


Response:
Returns a JSON object with a downloadUrl for the processed CSV.



Memory Efficiency Strategy

Streaming: Uses fs.createReadStream and csv-parser to process the CSV row-by-row, avoiding loading the entire file into memory. This is critical for large files.
In-Memory Aggregation: Stores only the running total of sales per department in a single object (departmentSales), minimizing memory usage.
No Database: Aggregates data in-memory and writes directly to a file, reducing overhead.
Unique Filenames: Uses UUIDs to prevent file conflicts, ensuring safe handling of concurrent uploads.

Estimated Big O Complexity

Time Complexity:
CSV Parsing: O(n), where n is the number of rows in the input CSV, as each row is processed exactly once.
Aggregation: O(n), as each row updates a key in the departmentSales object (hash table operations are O(1) on average).
Output Writing: O(m), where m is the number of unique departments (typically m << n).
Total: O(n) for parsing and aggregation, as m is usually much smaller than n.


Space Complexity:
Input Streaming: O(1) for streaming, as only one row is held in memory at a time.
Aggregation: O(m) for the departmentSales object, where m is the number of unique departments.
Output Array: O(m) for the records array written to the CSV.
Total: O(m), where m is the number of unique departments (typically small).


I/O Operations: File reading and writing are disk-bound, but streaming minimizes memory overhead.

Troubleshooting

CORS Errors: Ensure cors is installed in server/ (npm install cors) and app.use(cors()) is in server/src/index.js.
Vite Errors: Use Vite@4.4.9 (npm install vite@4.4.9 @vitejs/plugin-react@4.0.3) and crypto-browserify in client/vite.config.js.
Git Commands: Use rm -rf node_modules and rm -f package-lock.json in Git Bash for Windows (MINGW64).
Upload Fails: Check browser console (F12 > Console) and backend logs (node src/index.js).
File Not Found: Verify uploads/ and results/ exist in server/.

Dependencies

Frontend: react, react-dom, axios, vite@4.4.9, @vitejs/plugin-react@4.0.3, crypto-browserify.
Backend: express, multer, csv-parser, csv-writer, uuid, cors.

Contributing

Create a branch (git checkout -b feature/<name>).
Commit changes (git commit -m "Description").
Push (git push origin feature/<name>).
Open a pull request on GitHub.
