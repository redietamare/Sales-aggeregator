import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
const app = express();
const PORT = 3000;

app.use(cors());
// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Interfaces
interface RowData {
  department: string;
  date: string;
  number_of_sales: string;
}

interface AggregatedData {
  department: string;
  total_sales: number;
}

// Multer error handler
const multerErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: `Multer error: ${err.message}` });
  } else if (err) {
    res.status(500).json({ error: `Unknown error during file upload: ${err.message}` });
  } else {
    next();
  }
};

// POST /api/upload
app.post('/api/upload', upload.single('file'), multerErrorHandler, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const inputPath = req.file.path;
    const outputFilename = `${uuidv4()}.csv`;
    const outputPath = path.join(__dirname, '..', 'results', outputFilename);
    const departmentSales: Record<string, number> = {};

    // Process CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(inputPath)
        .pipe(csvParser())
        .on('data', (row: RowData) => {
          console.log('Processing row:', row);
          const department = row.department;
          const sales = parseInt(row.number_of_sales, 10) || 0;
          departmentSales[department] = (departmentSales[department] || 0) + sales;
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Prepare records for output CSV
    const records: AggregatedData[] = Object.entries(departmentSales).map(([department, total_sales]) => ({
      department,
      total_sales,
    }));

    // Write to CSV
    const csvWriter = createObjectCsvWriter({
      path: outputPath,
      header: [
        { id: 'department', title: 'department' },
        { id: 'total_sales', title: 'total_sales' },
      ],
    });

    await csvWriter.writeRecords(records);

    // Return download link
    const downloadUrl = `http://localhost:${PORT}/results/${outputFilename}`;
    res.json({ downloadUrl });
  } catch (err) {
    console.error('Error processing file:', err);
    res.status(500).json({ error: `Failed to process file: ${(err as Error).message}` });
  }
});

// GET /results/:filename
app.get('/results/:filename', (req: Request, res: Response) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '..', 'results', filename);
  res.download(filePath, (err) => {
    if (err) {
      res.status(404).json({ error: 'File not found' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});