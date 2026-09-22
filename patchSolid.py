import sys

file_path = 'src/app/globals.css'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('border: 2px dashed rgba(74, 222, 128, 0.7) !important;', 'border: 2px solid rgba(74, 222, 128, 0.7) !important;')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)
print("Patched globals.css to use solid border!")
