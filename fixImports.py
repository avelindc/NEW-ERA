import sys

file_path = 'src/components/UploadForm.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('import { Calendar, Loader2', 'import { Clock, Info, Calendar, Loader2')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)
print("Imports fixed!")
