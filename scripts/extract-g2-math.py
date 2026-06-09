import PyPDF2

reader = PyPDF2.PdfReader("docs/kicd-lower-primary-volume-2.pdf")

# Extract pages 20-45 (Grade 2 Mathematics section)
output = []
for i in range(19, 45):
    if i >= len(reader.pages):
        break
    text = reader.pages[i].extract_text()
    if text:
        output.append(f"=== PAGE {i+1} ===\n{text}")

with open("docs/g2-math-kicd-raw.txt", "w", encoding="utf-8") as f:
    f.write("\n\n".join(output))

print(f"Extracted {len(output)} pages to docs/g2-math-kicd-raw.txt")
