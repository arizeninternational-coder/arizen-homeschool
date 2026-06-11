import PyPDF2

reader = PyPDF2.PdfReader('docs/kicd-lower-primary-volume-1.pdf')
print('Total pages:', len(reader.pages))

# Check pages 180-190 for Grade 2 content
for i in range(180, min(195, len(reader.pages))):
    text = reader.pages[i].extract_text()
    if text:
        first_lines = '\n'.join(text.split('\n')[:5])
        print(f'\n--- Page {i+1} ---')
        print(first_lines[:300])
