import json
import os

files = [
  ("ChuZhong_2.json", "初中大纲"),
  ("PEPGaoZhong_6.json", "高中大纲"),
  ("CET4_2.json", "四级精选")
]
base_dir = r"D:\Desktop\新建文件夹 (3)"
output_file = "src/assets/dictation_courses.json"

SCENARIOS = {
    "🎓 校园与教育": ["学校", "教育", "学习", "考试", "学生", "老师", "课程", "大学", "知识", "阅读", "学科", "作业", "书本", "学期", "教授", "黑板", "测验", "分数"],
    "💼 职场与经济": ["公司", "工作", "商业", "经济", "管理", "办公", "老板", "市场", "职业", "业务", "会议", "工资", "客户", "企业", "金融", "价值", "价格", "产品"],
    "🏥 医疗与健康": ["医院", "医生", "健康", "疾病", "生病", "药", "治疗", "身体", "疼痛", "护士", "症状", "手术", "医学", "感染", "血液", "呼吸"],
    "🌲 自然与科学": ["自然", "环境", "动物", "植物", "气候", "科学", "物理", "化学", "星球", "天空", "森林", "天气", "太阳", "月亮", "河", "山", "研究", "实验", "生物"],
    "🌍 社会与文化": ["社会", "文化", "艺术", "历史", "国家", "政府", "法律", "政治", "传统", "人口", "城市", "国际", "民族", "信仰", "警察", "犯罪"],
    "🏠 日常生活": ["家", "生活", "食物", "衣服", "睡觉", "洗澡", "购物", "家具", "做饭", "交通", "房间", "电视", "电影", "休闲", "旅行", "吃", "喝", "穿"],
    "❤️ 情感与心理": ["爱", "恨", "高兴", "快乐", "悲伤", "生气", "感觉", "心理", "害怕", "希望", "情绪", "思考", "紧张", "期待", "记忆", "精神", "想", "喜欢"],
    "🎬 动作行为": ["跑", "走", "跳", "说", "听", "放", "拿", "制作", "发生", "使用", "获得", "保持", "导致", "创造", "增加", "减少", "继续", "做", "行"],
    "📌 高频功能词": [] # Fallback
}

def get_scenario(meaning):
    for scene, keywords in SCENARIOS.items():
        if scene == "📌 高频功能词": continue
        for kw in keywords:
            if kw in meaning:
                return scene
    return "📌 高频功能词"

all_words = {} 
for s in SCENARIOS:
    all_words[s] = {"初中大纲": [], "高中大纲": [], "四级精选": []}

for filename, tag in files:
    filepath = os.path.join(base_dir, filename)
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
                        scenario = get_scenario(meanings)
                        all_words[scenario][tag].append({
                            "en": word,
                            "zh": meanings,
                            "ipa": f"/{usphone}/" if usphone else ""
                        })
                except Exception as e:
                    pass

courses = []
idx = 0
for scene, tag_dict in all_words.items():
    for tag, words in tag_dict.items():
        if not words: continue
        # Chunk words to max 50 per category piece
        chunk_size = 50
        # Prevent completely blowing up UI, if a very large category reaches more than 10 chunks, cap it.
        # But user wanted ALL words. So we don't cap! We just make sure React can handle pagination.
        for i in range(0, len(words), chunk_size):
            chunk = words[i:i+chunk_size]
            part_suffix = f" P{i//chunk_size + 1}" if len(words) > chunk_size else ""
            courses.append({
                "id": f"scenario_{idx}",
                "category": tag,  # This will be "初中大纲" or "高中大纲", which visually classifies them beautifully!
                "title": f"{scene}{part_suffix}",
                "words": chunk
            })
            idx += 1

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(courses, f, ensure_ascii=False, indent=2)

print(f"Generated {len(courses)} scenario-based dictation chunks across primary scenes.")
