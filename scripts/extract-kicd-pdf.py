import PyPDF2
import sys

reader = PyPDF2.PdfReader("docs/kicd-lower-primary-volume-2.pdf")
print(f"Total pages: {len(reader.pages)}")

for i, page in enumerate(reader.pages):
    text = page.extract_text()
    if text and ("mathematics" in text.lower() or "math" in text.lower() or "number" in text.lower()):
        print(f"\n=== PAGE {i+1} ===")
        print(text[:5000])
