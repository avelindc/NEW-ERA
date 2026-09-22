import sys
import re

file_path = 'src/components/UploadForm.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

# Step 2 buttons
code = re.sub(
    r'<button type="button" onClick=\{\(\) => setStep\(1\)\} className="px-6 py-3 text-gray-400 hover:text-white transition-colors flex items-center gap-2">',
    r'<button type="button" onClick={() => setStep(1)} className="px-6 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-medium transition-colors flex items-center gap-2">',
    code
)
code = re.sub(
    r'<button type="button" onClick=\{handleNextToPlatforms\} className="fundflow-btn-primary px-8 py-3 flex items-center gap-2">',
    r'<button type="button" onClick={handleNextToPlatforms} className="px-8 py-3 bg-[#166534] hover:bg-[#14532d] text-white rounded-xl font-bold transition-colors shadow-lg shadow-green-900/20 flex items-center gap-2">',
    code
)

# Step 3 buttons
code = re.sub(
    r'<button type="button" onClick=\{\(\) => setStep\(2\)\} className="px-6 py-3 text-gray-400 hover:text-white transition-colors flex items-center gap-2">',
    r'<button type="button" onClick={() => setStep(2)} className="px-6 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-medium transition-colors flex items-center gap-2">',
    code
)
code = re.sub(
    r'<button type="submit" disabled=\{selectedPlatforms.length === 0\} className="fundflow-btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">',
    r'<button type="submit" disabled={selectedPlatforms.length === 0} className="px-8 py-3 bg-[#166534] hover:bg-[#14532d] text-white rounded-xl font-bold transition-colors shadow-lg shadow-green-900/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">',
    code
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)
print("Regex replace done!")
