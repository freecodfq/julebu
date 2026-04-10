import json
import os
import glob

source_dir = r"D:\Desktop\yinyuxuexi\earthworm-main\packages\xingrong-courses\data\courses"
output_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src", "assets", "xingrong_courses.json")

courses = []

# Get all JSON files sorted numerically
json_files = sorted(glob.glob(os.path.join(source_dir, "*.json")), key=lambda x: int(os.path.basename(x).replace('.json', '')))

for filepath in json_files:
    filename = os.path.basename(filepath)
    course_num = int(filename.replace('.json', ''))
    
    with open(filepath, 'r', encoding='utf-8') as f:
        items = json.load(f)
    
    words = []
    for item in items:
        en = item.get("english", "").strip()
        zh = item.get("chinese", "").strip()
        soundmark = item.get("soundmark", "").strip()
        
        if en and zh:
            words.append({
                "en": en,
                "zh": zh,
                "ipa": soundmark if soundmark else ""
            })
    
    if words:
        courses.append({
            "id": f"xingrong-{course_num:02d}",
            "category": "星荣课程",
            "title": f"第 {course_num} 课",
            "words": words
        })

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(courses, f, ensure_ascii=False, indent=2)

print(f"Successfully generated {len(courses)} xingrong courses to {output_file}")
print(f"Total items: {sum(len(c['words']) for c in courses)}")
