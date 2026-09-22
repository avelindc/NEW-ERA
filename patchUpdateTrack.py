import sys

file_path = 'src/components/UploadForm.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

old_func = """  const updateTrack = (id: string, field: string, value: any) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };"""

new_func = """  const updateTrack = (id: string, field: string, value: any) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };"""

if old_func in code:
    code = code.replace(old_func, new_func)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(code)
    print("Patched updateTrack!")
else:
    print("Old func not found.")
