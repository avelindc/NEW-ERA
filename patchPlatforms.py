import sys
import re

file_path = 'src/components/UploadForm.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

new_platforms = """const STREAMING_PLATFORMS = [
  { id: "spotify", name: "Spotify", logo: "https://www.google.com/s2/favicons?domain=spotify.com&sz=128" },
  { id: "apple_music", name: "Apple Music", logo: "https://www.google.com/s2/favicons?domain=music.apple.com&sz=128" },
  { id: "youtube_music", name: "YouTube Music", logo: "https://www.google.com/s2/favicons?domain=music.youtube.com&sz=128" },
  { id: "tiktok", name: "TikTok", logo: "https://www.google.com/s2/favicons?domain=tiktok.com&sz=128" },
  { id: "instagram", name: "Instagram Music", logo: "https://www.google.com/s2/favicons?domain=instagram.com&sz=128" },
  { id: "facebook", name: "Facebook Stories", logo: "https://www.google.com/s2/favicons?domain=facebook.com&sz=128" },
  { id: "amazon_music", name: "Amazon Music", logo: "https://www.google.com/s2/favicons?domain=music.amazon.com&sz=128" },
  { id: "deezer", name: "Deezer", logo: "https://www.google.com/s2/favicons?domain=deezer.com&sz=128" },
  { id: "tidal", name: "Tidal", logo: "https://www.google.com/s2/favicons?domain=tidal.com&sz=128" },
  { id: "boomplay", name: "Boomplay", logo: "https://www.google.com/s2/favicons?domain=boomplay.com&sz=128" },
  { id: "audiomack", name: "Audiomack", logo: "https://www.google.com/s2/favicons?domain=audiomack.com&sz=128" },
  { id: "jiosaavn", name: "JioSaavn", logo: "https://www.google.com/s2/favicons?domain=jiosaavn.com&sz=128" },
  { id: "wynk", name: "Wynk Music", logo: "https://www.google.com/s2/favicons?domain=wynk.in&sz=128" },
  { id: "kkbox", name: "KKBOX", logo: "https://www.google.com/s2/favicons?domain=kkbox.com&sz=128" },
  { id: "anghami", name: "Anghami", logo: "https://www.google.com/s2/favicons?domain=anghami.com&sz=128" },
  { id: "netease", name: "NetEase Cloud Music", logo: "https://www.google.com/s2/favicons?domain=music.163.com&sz=128" },
  { id: "tencent", name: "Tencent Music (QQ)", logo: "https://www.google.com/s2/favicons?domain=y.qq.com&sz=128" },
  { id: "resso", name: "Resso", logo: "https://www.google.com/s2/favicons?domain=resso.com&sz=128" },
  { id: "pandora", name: "Pandora", logo: "https://www.google.com/s2/favicons?domain=pandora.com&sz=128" },
  { id: "iheartradio", name: "iHeartRadio", logo: "https://www.google.com/s2/favicons?domain=iheart.com&sz=128" },
  { id: "napster", name: "Napster", logo: "https://www.google.com/s2/favicons?domain=napster.com&sz=128" },
  { id: "qobuz", name: "Qobuz", logo: "https://www.google.com/s2/favicons?domain=qobuz.com&sz=128" },
  { id: "yandex", name: "Yandex Music", logo: "https://www.google.com/s2/favicons?domain=music.yandex.ru&sz=128" },
  { id: "soundcloud", name: "SoundCloud Go", logo: "https://www.google.com/s2/favicons?domain=soundcloud.com&sz=128" },
  { id: "claro", name: "Claro Música", logo: "https://www.google.com/s2/favicons?domain=claromusica.com&sz=128" },
  { id: "kuack", name: "Kuack Media", logo: "https://www.google.com/s2/favicons?domain=kuackmedia.com&sz=128" },
  { id: "joox", name: "JOOX", logo: "https://www.google.com/s2/favicons?domain=joox.com&sz=128" },
  { id: "snapchat", name: "Snapchat Sounds", logo: "https://www.google.com/s2/favicons?domain=snapchat.com&sz=128" }
];"""

pattern = re.compile(r'const STREAMING_PLATFORMS = \[.*?\];', re.DOTALL)
if pattern.search(code):
    code = pattern.sub(new_platforms, code)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(code)
    print("Patched Platforms Array!")
else:
    print("Not found.")
