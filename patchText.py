import sys

file_path = 'src/components/UploadForm.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('1-3 hari kerja.', '7-14 hari.')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)
print("Text updated!")
