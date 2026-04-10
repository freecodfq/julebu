import json
import re

text = """
情绪英语单词大全
学习31个常见情绪的英语单词，包括积极情绪、消极情绪、中性情绪和复杂情绪词汇，每个单词附有美式音标、中文翻译和实用例句，帮助你用英语准确表达各种情感。
31 个单词
4 个分组
水果英语单词大全
学习38个常见水果的英语单词
38 个单词
5 个分组
四季英语单词大全
35 个单词
5 个分组
国家英语单词大全
28 个单词
5 个分组
工具英语单词大全
31 个单词
4 个分组
房间英语单词大全
33 个单词
4 个分组
饮料英语单词大全
34 个单词
4 个分组
办公室英语单词大全
29 个单词
4 个分组
自然英语单词大全
38 个单词
4 个分组
食物英语单词大全
52 个单词
5 个分组
家庭成员英语单词大全
32 个单词
5 个分组
颜色英语单词大全
30 个单词
3 个分组
交通工具英语单词大全
26 个单词
5 个分组
音乐英语单词大全
29 个单词
4 个分组
爱好英语单词大全
26 个单词
4 个分组
旅行英语单词大全
32 个单词
4 个分组
健康英语单词大全
35 个单词
5 个分组
天气英语单词大全
33 个单词
5 个分组
学校英语单词大全
38 个单词
5 个分组
动物英语单词大全
50 个单词
5 个分组
数字英语单词大全
38 个单词
5 个分组
衣服英语单词大全
33 个单词
5 个分组
时间英语单词大全
32 个单词
4 个分组
运动英语单词大全
28 个单词
5 个分组
厨房英语单词大全
34 个单词
5 个分组
蔬菜英语单词大全
34 个单词
5 个分组
身体部位英语单词大全
43 个单词
5 个分组
花英语单词大全
32 个单词
4 个分组
职业英语单词大全
36 个单词
6 个分组
家具英语单词大全
32 个单词
4 个分组
"""

categories = []
lines = [l.strip() for l in text.split('\n') if l.strip()]

i = 0
while i < len(lines):
    if "英语单词大全" in lines[i]:
        title = lines[i]
        
        # Look ahead for words count
        word_count = 10
        j = i + 1
        while j < len(lines) and "英语单词大全" not in lines[j]:
            if "个单词" in lines[j]:
                match = re.search(r'(\d+)', lines[j])
                if match:
                    word_count = int(match.group(1))
            j += 1
        
        categories.append({"title": title, "count": word_count})
        i = j
    else:
        i += 1

courses = []
for idx, cat in enumerate(categories):
    words = []
    # Generate 1 realistic record, then pad with placeholders
    if cat["title"] == "情绪英语单词大全":
        words.append({
            "en": "happy", "zh": "快乐的", "ipa": "/ˈhæpi/", 
            "sentenceEn": "I feel happy.", "sentenceZh": "我感到快乐。"
        })
        words.append({
            "en": "sad", "zh": "悲伤的", "ipa": "/sæd/", 
            "sentenceEn": "He is sad.", "sentenceZh": "他很悲伤。"
        })
    elif cat["title"] == "水果英语单词大全":
        words.append({
            "en": "apple", "zh": "苹果", "ipa": "/ˈæpl/", 
            "sentenceEn": "This is an apple.", "sentenceZh": "这是一个苹果。"
        })
    else:
        words.append({
            "en": "example", "zh": "例子", "ipa": "/ɪɡˈzæmpl/", 
            "sentenceEn": "This is an example.", "sentenceZh": "这是一个例子。"
        })
        
    for _ in range(cat["count"] - len(words)):
        words.append({
            "en": "placeholder", "zh": "占位符", "ipa": "/ˈpleɪshəʊldər/", 
            "sentenceEn": "Please update this word.", "sentenceZh": "请更新这个词汇。"
        })

    courses.append({
        "id": f"course-{idx}",
        "category": "主题库",
        "title": cat["title"],
        "words": words
    })

with open("src/assets/courses.json", "w", encoding="utf-8") as f:
    json.dump(courses, f, ensure_ascii=False, indent=2)

print(f"Generated {len(courses)} courses.")
