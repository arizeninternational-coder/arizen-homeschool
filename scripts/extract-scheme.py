import PyPDF2

reader = PyPDF2.PdfReader("docs/g2-math-scheme-of-work.pdf")
print(f"Total pages: {len(reader.pages)}")

output = []
for i, page in enumerate(reader.pages):
    text = page.extract_text()
    if text:
        output.append(f"=== PAGE {i+1} ===\n{text}")

with open("docs/g2-math-scheme-raw.txt", "w", encoding="utf-8") as f:
    f.write("\n\n".join(output))

print(f"Extracted {len(output)} pages")
