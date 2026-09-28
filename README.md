# Resume Builder Pro

A polished, browser-based resume builder designed for students, freshers, and professionals.

## Features

- Live A4 resume preview
- 3 professional templates: Modern, Classic, Minimal
- Personal information
- Professional summary
- Work experience with multiple entries
- Education with multiple entries
- Skills with add/remove chips
- Projects with technologies and links
- Certifications
- Languages and proficiency
- Resume completeness progress
- Local autosave using browser LocalStorage
- Manual Save
- JSON Export / Import
- Print / Save as PDF using the browser print dialog
- Responsive editor UI
- No backend or database required
- No API keys required

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- LocalStorage
- Browser Print API

## Run

### Option 1: Direct
Open `index.html` in Chrome or Edge.

### Option 2: VS Code Live Server
Install the **Live Server** extension in VS Code, then right-click `index.html` and select **Open with Live Server**.

### Option 3: Python local server

```bash
cd "Resume Builder Pro"
python -m http.server 5500
```

Then open:

```text
http://localhost:5500
```

## How to create a PDF

1. Fill in the resume.
2. Select a template.
3. Click **Print / PDF**.
4. In the browser print dialog choose **Save as PDF**.
5. Use A4 paper size and default margins.

## Data

Your resume is automatically stored in your browser's LocalStorage. Use **Export JSON** to create a backup. Use **Import JSON** to restore a backup.

## Project Structure

```text
Resume Builder Pro/
├── index.html
├── README.md
└── assets/
    ├── app.js
    └── style.css
```

## Notes

This version is intentionally dependency-free, so it can run offline after the fonts are cached or without the external font connection. It is suitable as a strong frontend portfolio project and can be extended with a backend, accounts, cloud storage, AI suggestions, ATS scoring, and authentication.
