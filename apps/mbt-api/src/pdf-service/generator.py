#!/usr/bin/env python3
"""
PDF Generator for MB Transfer Service
Uses WeasyPrint to generate driver vouchers from HTML templates
"""

import sys
import json
import os
from pathlib import Path
import datetime
from weasyprint import HTML
import base64

# Determine the base directory
SCRIPT_DIR = Path(__file__).parent
IMAGES = SCRIPT_DIR.parent.parent / "assets" / "images" / "pdf_generation"
OUTPUT_DIR = SCRIPT_DIR / "output"

def remove_tildes(name: str) -> str:
    cases = {"á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u",
             "Á": "A", "É": "E", "Í": "I", "Ó": "O", "Ú": "U"}
    new_name = name
    for ch in name:
        if ch in cases:
            new_name = new_name.replace(ch, cases[ch])
    return new_name.upper()
def image_to_base64(image_path: Path) -> str:
    """Load image file and convert to base64 string for embedding"""
    try:
        with open(image_path, "rb") as img_file:
            return base64.b64encode(img_file.read()).decode('utf-8')
    except FileNotFoundError:
        print(f"Warning: Image file {image_path} not found.", file=sys.stderr)
        return ""

# Load all images as base64
def load_images():
    """Load all required images from the assets directory"""
    images = {}

    image_files = {
        "at_logo": "AT_LOGO.png",
        "departure": "SALIDA.png",
        "st_logo": "ST_LOGO.png",
        "id_img": "ID.png",
        "bg": "BG.png",
        "arrival": "LLEGADA.png",
        "top_right": "TOP_RIGHT.png",
        "bottom_left": "BOTTOM_LEFT.png",
    }

    for key, filename in image_files.items():
        path = IMAGES / filename
        base64_data = image_to_base64(path)
        if base64_data:
            images[key] = f'<img class="logo-img" src="data:image/png;base64,{base64_data}"/>'
        else:
            images[key] = f'<!-- {filename} not found -->'

    # Override specific classes
    if images.get("departure"):
        images["departure"] = images["departure"].replace("logo-img", "clock-icon")
    if images.get("st_logo"):
        images["st_logo"] = images["st_logo"].replace("logo-img", "logo-st")
    if images.get("id_img"):
        images["id_img"] = images["id_img"].replace("logo-img", "id-st")
    if images.get("bg"):
        images["bg"] = images["bg"].replace("logo-img", "wave-bg")
    if images.get("arrival"):
        images["arrival"] = images["arrival"].replace("logo-img", "clock-icon")

    return images

def generate_html(name: list, hotel: str, pax: int, time: str, date: str,
                  company: str = "at", service_type: str = "arrivals",
                  flight_code: str = None) -> str:
    """
    Generate HTML string for the voucher

    Args:
        name: List where [0] is first name, [1:] is surname parts
        hotel: Hotel name
        pax: Number of passengers
        time: Pickup/dropoff time
        date: Service date
        company: "at", "st", or "mbt"
        service_type: "arrivals" or "departures"
        flight_code: Flight code (optional)

    Returns:
        HTML string ready for PDF conversion
    """

    # Load images
    imgs = load_images()

    # Read and modify styles
    styles_path = SCRIPT_DIR / "styles.css"
    with open(styles_path, "r", encoding="utf-8") as f:
        styles = f.read()

    # Modify styles based on service type and company
    if service_type == "departures":
        styles = styles.replace("flex;  /*collapse*/", "none;")

    if company == "st":
        styles = styles.replace("hidden", "visible")

    # Process name
    surname = ' '.join([part for part in name[1:]]) if len(name) > 1 else ""
    first_name = remove_tildes(name[0])
    surname = remove_tildes(surname) if surname else ""

    # Select appropriate logo and service icon
    logo = imgs["at_logo"] if company in ("at", "mbt") else imgs["st_logo"]
    service_icon = imgs["arrival"] if service_type == "arrivals" else imgs["departure"]

    # Handle missing flight code
    flight_display = flight_code if flight_code else "N/A"

    html_string = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Driver Voucher - {first_name} {surname}</title>
    <style>
    {styles}
    </style>
</head>
<body>
    <div class="voucher-container">

        <div class="corner-top-right">
            {imgs["top_right"]}
        </div>

        <div class="corner-bottom-left">
            {imgs["bottom_left"]}
        </div>

        <div>
            {imgs["bg"]}
        </div>

        <div class="logo-container">
            <div class="logo">
                {logo}
            </div>
        </div>

        <div class="name-container">
            <h1 class="first-name">{first_name}</h1>
            <h1 class="last-name">{surname}</h1>
        </div>

        <div class="divider"></div>

        <div class="info-container">
            <div class="left-info">
               {imgs["id_img"]}
            </div>

            <div class="right-info">
                <div class="info-details">
                    <div class="info-row">
                        <div class="info-label">HOTEL:</div>
                        <div class="info-value">{hotel}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">PAX:</div>
                        <div class="info-value">{pax}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">HOUR:</div>
                        <div class="info-value">{time}</div>
                    </div>
                    <div class="info-row-flight">
                        <div class="info-label">FLIGHT:</div>
                        <div class="info-value">{flight_display}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">DATE:</div>
                        <div class="info-value">{date}</div>
                    </div>
                </div>
                <div class="arrival-container">
                    {service_icon}
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    """
    return html_string

def generate_pdf(data: dict, output_path: str = None) -> tuple:
    """
    Generate PDF from data dictionary

    Args:
        data: Dictionary with keys: name, hotel, pax, time, date, company, service_type, flight_code
        output_path: Optional custom output path

    Returns:
        Tuple of (success: bool, message: str, pdf_path: str)
    """
    try:
        # Extract and validate data
        name_str = data.get("name", "")
        if isinstance(name_str, str):
            name = name_str.split()
        else:
            name = name_str

        if not name:
            return (False, "Name is required", None)

        hotel = data.get("hotel", "N/A").upper()
        pax = int(data.get("pax", 1))
        time = data.get("time", "00:00").upper()
        date_str = data.get("date", datetime.datetime.now().strftime("%Y-%m-%d"))

        # Format date from YYYY-MM-DD to DD/MM/YYYY for display
        try:
            date_obj = datetime.datetime.strptime(date_str, "%Y-%m-%d")
            date = date_obj.strftime("%d/%m/%Y")
        except ValueError:
            # If already in different format or invalid, use as-is
            date = date_str

        company = data.get("company", "at").lower()
        service_type = data.get("service_type", "arrivals").lower()
        flight_code = data.get("flight_code")

        # Generate HTML
        html = generate_html(
            name=name,
            hotel=hotel,
            pax=pax,
            time=time,
            date=date,
            company=company,
            service_type=service_type,
            flight_code=flight_code
        )

        # Determine output path
        if not output_path:
            OUTPUT_DIR.mkdir(exist_ok=True)
            safe_name = "_".join(name).replace(" ", "_")
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            output_path = OUTPUT_DIR / f"voucher_{safe_name}_{timestamp}.pdf"

        # Generate PDF
        HTML(string=html, base_url=str(SCRIPT_DIR)).write_pdf(str(output_path))

        return (True, "PDF generated successfully", str(output_path))

    except Exception as e:
        return (False, f"Error generating PDF: {str(e)}", None)

def main():
    """
    Main entry point - can be called from command line or Node.js
    Expects JSON input via stdin or command line argument
    """

    # Check if running in test mode
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        print("Running in test mode...")

        # Create test data
        test_cases = [
            {
                "name": "Juan Pérez",
                "hotel": "Gran Bahia Principe Punta Cana",
                "pax": 4,
                "time": "14:30",
                "date": "2026-02-15",
                "company": "at",
                "service_type": "arrivals",
                "flight_code": "AA 1234"
            },
            {
                "name": "María González",
                "hotel": "Hard Rock Hotel & Casino",
                "pax": 2,
                "time": "09:15",
                "date": "2026-02-16",
                "company": "st",
                "service_type": "departures",
                "flight_code": "UA 567"
            },
            {
                "name": "Robert Smith",
                "hotel": "Barceló Bávaro Palace",
                "pax": 6,
                "time": "16:45",
                "date": "2026-02-17",
                "company": "at",
                "service_type": "arrivals",
                "flight_code": None
            }
        ]

        results = []
        for i, test_data in enumerate(test_cases, 1):
            print(f"\nGenerating test PDF {i}/{len(test_cases)}...")
            success, message, path = generate_pdf(test_data)
            results.append({"test": i, "success": success, "message": message, "path": path})
            if success:
                print(f"✓ {message}")
                print(f"  Location: {path}")
            else:
                print(f"✗ {message}")

        print(f"\n{'='*50}")
        print(f"Test completed: {sum(1 for r in results if r['success'])}/{len(results)} successful")
        return 0

    # Normal mode - expect JSON from stdin
    try:
        if len(sys.argv) > 1:
            # JSON passed as command line argument
            json_data = sys.argv[1]
        else:
            # JSON from stdin
            json_data = sys.stdin.read()

        data = json.loads(json_data)
        success, message, path = generate_pdf(data)

        # Output result as JSON for Node.js to parse
        result = {
            "success": success,
            "message": message,
            "path": path
        }
        print(json.dumps(result))

        return 0 if success else 1

    except json.JSONDecodeError as e:
        error_result = {
            "success": False,
            "message": f"Invalid JSON input: {str(e)}",
            "path": None
        }
        print(json.dumps(error_result))
        return 1

    except Exception as e:
        error_result = {
            "success": False,
            "message": f"Unexpected error: {str(e)}",
            "path": None
        }
        print(json.dumps(error_result))
        return 1

if __name__ == "__main__":
    sys.exit(main())
