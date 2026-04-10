import json
import os

files = [
  ("ChuZhong_2.json", "初中核心词"),
  ("PEPGaoZhong_6.json", "高中核心词"),
  ("CET4_2.json", "四级核心词")
]
base_dir = r"D:\Desktop\新建文件夹 (3)"
output_file = "src/assets/dictation_courses.json"

courses = []

for idx, (filename, title) in enumerate(files):
    filepath = os.path.join(base_dir, filename)
    words = []
    if os.path.exists(filepath):
        print(f"Parsing {filename}...")
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                if not line.strip(): continue
                try:
                    item = json.loads(line)
                    word = item.get("headWord", "")
                    content = item.get("content", {}).get("word", {}).get("content", {})
                    trans = content.get("trans", [])
                    usphone = content.get("usphone", "") or content.get("ukphone", "") or content.get("phone", "")
                    
                    meanings = "; ".join([t.get("tranCn", "") for t in trans if t.get("tranCn")])
                    
                    if word and meanings:
                        words.append({
                            "en": word,
                            "zh": meanings,
                            "ipa": f"/{usphone}/" if usphone else ""
                        })
                except Exception as e:
                    pass
    
    if words:
        # To avoid massive React rendering freezing, chunk the words.
        chunk_size = 50
        max_words = 200 # First 4 parts
        for i in range(0, min(len(words), max_words), chunk_size):
            chunk = words[i:i+chunk_size]
            courses.append({
                "id": f"dictation-{idx}-{i//chunk_size}",
                "category": f"{title}库",
                "title": f"{title} Part{i//chunk_size + 1}",
                "words": chunk
            })

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(courses, f, ensure_ascii=False, indent=2)

print(f"Generated {len(courses)} dictation chunks from {len(files)} local databases.")
