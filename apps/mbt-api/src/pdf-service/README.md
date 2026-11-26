# PDF Generation Service

This service generates driver voucher PDFs for MB Transfer using WeasyPrint for accurate HTML-to-PDF conversion.

## Overview

The PDF service consists of:

- **Python script** (`generator.py`) - Uses WeasyPrint to convert HTML to PDF
- **Node.js wrapper** (`src/utils/pdf-generator.ts`) - Calls Python script from Express
  The academic API does not expose a PDF endpoint.

## Directory Structure

```
src/pdf-service/
├── generator.py         # Python PDF generator
├── styles.css          # PDF styling
├── requirements.txt    # Python dependencies
├── output/            # Generated PDFs (created automatically)
└── README.md          # This file

assets/pdf_generation/
├── AT_LOGO.png
├── ST_LOGO.png
├── BG.png
├── LLEGADA.png
├── SALIDA.png
├── ID.png
├── TOP_RIGHT.png
└── BOTTOM_LEFT.png
```

## Setup Instructions

### 1. Install Python Dependencies

First, ensure pip is installed:

```bash
# On Arch Linux
sudo pacman -S python-pip

# On Ubuntu/Debian
sudo apt install python3-pip

# On macOS
brew install python3
```

Create a virtual environment and install dependencies:

```bash
cd "/path/to/mbt-api/src/pdf-service"

# Create virtual environment
python3 -m venv venv

# Install dependencies
./venv/bin/pip install -r requirements.txt
```

**Note**: On Arch Linux (and other externally-managed Python environments), you must use a virtual environment. The Node.js wrapper automatically uses `venv/bin/python3` if it exists.

### 2. Verify Installation

Check if WeasyPrint is installed correctly:

```bash
./venv/bin/python3 -c "import weasyprint; print('WeasyPrint version:', weasyprint.__version__)"
```

You should see output like: `WeasyPrint version: 68.x`

### 3. Test PDF Generation

Run the test mode to generate sample PDFs:

```bash
cd "/path/to/mbt-api/src/pdf-service"
./venv/bin/python3 generator.py --test
```

This will generate 3 test PDFs in the `output/` directory:

- Test 1: AT company arrival
- Test 2: ST company departure
- Test 3: AT company arrival without flight code

Check the generated PDFs to ensure everything renders correctly.

## Usage

### Standalone Python Script

You can use the Python script directly in two ways:

#### 1. Test Mode (Recommended for testing)

```bash
./venv/bin/python3 generator.py --test
```

Generates 3 sample PDFs with test data.

#### 2. JSON Input Mode

Pass JSON data to generate a custom PDF:

```bash
echo '{
  "name": "John Doe",
  "hotel": "Gran Bahia Principe",
  "pax": 4,
  "time": "14:30",
  "date": "2026-02-15",
  "company": "at",
  "service_type": "arrivals",
  "flight_code": "AA 1234"
}' | ./venv/bin/python3 generator.py
```

Or via command line argument:

```bash
./venv/bin/python3 generator.py '{"name": "John Doe", "hotel": "Gran Bahia Principe", "pax": 4, "time": "14:30", "date": "2026-02-15", "company": "at", "service_type": "arrivals", "flight_code": "AA 1234"}'
```

### Via TypeScript

```typescript
import { generatePDF } from "./utils/pdf-generator";

const result = await generatePDF(
	{
		name: "John Doe",
		hotel: "Gran Bahia Principe",
		pax: 4,
		time: "14:30",
		date: "2026-02-15",
		company: "at",
		service_type: "arrivals",
		flight_code: "AA 1234",
	},
	true,
); // true = return Buffer, false = return file path

if (result.success && result.buffer) {
	// result.buffer contains the PDF as a Buffer
	// Send it as a response, save to file, etc.
}
```

## Data Format

### Required Fields

- **name** (string): Client name (e.g., "John Doe")
- **hotel** (string): Hotel name
- **pax** (number): Number of passengers
- **time** (string): Pickup/dropoff time (e.g., "14:30")
- **date** (string): Service date in YYYY-MM-DD format
- **company** ('at' | 'st'): Company type (AT or ST)
- **service_type** ('arrivals' | 'departures'): Service type

### Optional Fields

- **flight_code** (string): Flight code (e.g., "AA 1234")

## Troubleshooting

### "Python3 not found"

Install Python 3:

- Arch: `sudo pacman -S python`
- Ubuntu: `sudo apt install python3`
- macOS: `brew install python3`

### "WeasyPrint not installed"

Install dependencies:

```bash
pip3 install -r requirements.txt
```

### "Image files not found"

The repository stores the images in `assets/pdf_generation/`. The legacy script still expects `assets/images/pdf_generation/`, so the paths must be aligned before the generator is used. The expected file names are:

- AT_LOGO.png
- ST_LOGO.png
- BG.png
- LLEGADA.png
- SALIDA.png
- ID.png
- TOP_RIGHT.png
- BOTTOM_LEFT.png

### Font issues

The CSS references `Shrikhand-Regular.ttf`. If you don't have this font:

1. Download it from Google Fonts
2. Place it in `src/pdf-service/fonts/Shrikhand-Regular.ttf`
3. Or remove the `@font-face` declaration from `styles.css`

### PDFs not rendering correctly

1. Test the Python script standalone: `./venv/bin/python3 generator.py --test`
2. Check the `output/` directory for generated PDFs
3. Verify all images are loading correctly
4. Check the console for WeasyPrint warnings

## Font Setup (Optional)

To use the Shrikhand font as intended:

```bash
# Create fonts directory
mkdir -p src/pdf-service/fonts

# Download Shrikhand font from Google Fonts
# Place Shrikhand-Regular.ttf in fonts/
```

Or download from: https://fonts.google.com/specimen/Shrikhand

## Output

PDFs are generated in `src/pdf-service/output/` with the naming format:

```
voucher_{client_name}_{timestamp}.pdf
```

Example: `voucher_John_Doe_20260210_143052.pdf`

## Notes

- The Python script uses base64-encoded images embedded directly in the HTML for reliability
- PDFs are 25cm x 19.5cm (landscape orientation)
- When called via the API, PDFs are returned as Buffer and temporary files are automatically deleted
- The service supports both AT and ST company logos
- Flight code row can be hidden for departures by modifying CSS

## Development

To modify the PDF template:

1. Edit `styles.css` for styling changes
2. Edit `generator.py` `generate_html()` function for layout changes
3. Test with `./venv/bin/python3 generator.py --test`
4. Check output PDFs for accuracy

## License

Part of the MB Transfer API project.
