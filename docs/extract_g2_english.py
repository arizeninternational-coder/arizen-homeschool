import PyPDF2
import json
import re

reader = PyPDF2.PdfReader('kicd-lower-primary-volume-1.pdf')

# Extract Grade 2 English section (pages 157-~210 based on the structure)
# We'll extract from page 157 to the end of Grade 2 (before Grade 3 starts)
grade2_text = []
in_grade2 = False

for i in range(156, len(reader.pages)):  # 0-indexed, page 157 = index 156
    text = reader.pages[i].extract_text()
    if text:
        # Check if we've reached Grade 3
        if 'GRADE THREE' in text or ('GRADE 3' in text and 'STRAND' in text.upper()):
            if in_grade2:
                print(f'Grade 2 English ends at page {i} (before Grade 3)')
                break
        if 'GRADE TWO' in text:
            in_grade2 = True
        if in_grade2:
            grade2_text.append(f'--- Page {i+1} ---\n{text}')

full_text = '\n\n'.join(grade2_text)
print(f'Total pages extracted: {len(grade2_text)}')
print(f'Total chars: {len(full_text)}')

# Save raw text
with open('g2-english-kicd-raw.txt', 'w', encoding='utf-8') as f:
    f.write(full_text)

print('Saved to g2-english-kicd-raw.txt')
