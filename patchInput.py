import sys
import re

file_path = 'src/app/globals.css'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

new_input_css = """/* ========================================================================= */
/* FUNDFLOW INPUT & FORMS */
/* ========================================================================= */
.fundflow-input {
  width: 100%;
  padding: 0.875rem 1rem;
  background-color: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 0.5rem !important;
  color: #0f172a;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.fundflow-input:focus {
  outline: none !important;
  border-color: #22c55e !important;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1) !important;
}

.dark .fundflow-input {
  background-color: #1e293b !important;
  border-color: #334155 !important;
  color: #f8fafc;
}"""

# regex to replace the old fundflow-input block
pattern = re.compile(r'/\* ========================================================================= \*/\s*/\* FUNDFLOW INPUT & FORMS \*/.*?\.dark \.fundflow-input \{.*?\}', re.DOTALL)
if pattern.search(code):
    code = pattern.sub(new_input_css, code)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(code)
    print("Patched globals.css!")
else:
    print("Not found.")
