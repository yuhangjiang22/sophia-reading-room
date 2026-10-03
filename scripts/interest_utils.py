"""Small, conservative topic matching helpers for the local discovery workflow."""

TOPIC_TERMS = {
    '睡眠与情绪': ('sleep', 'insomnia', 'circadian', 'nightmare', 'mood'),
    '心理治疗': ('psychotherapy', 'cognitive behav', 'psychological intervention', 'therapy'),
    '创伤与心理治疗': ('trauma', 'psychotherapy', 'cognitive behav'),
    '研究可信度': ('trial credibility', 'randomized trial', 'risk of bias', 'research integrity'),
    '青少年心理健康': ('adolescent', 'youth', 'young people', 'teen'),
    '创伤与精神病': ('trauma', 'post-traumatic', 'psychosis', 'psychotic'),
    '创伤与暴力': ('violence', 'trauma', 'refugee', 'survivor'),
    '孕产期与睡眠': ('pregnan', 'perinatal', 'prenatal', 'postpartum', 'sleep'),
    '孕产期心理健康': ('pregnan', 'perinatal', 'prenatal', 'postpartum', 'maternal'),
    '围产期心理健康': ('pregnan', 'perinatal', 'prenatal', 'postpartum', 'maternal'),
    '数字心理干预': ('digital', 'internet-based', 'online intervention', 'chatbot'),
    '物质使用与心理健康': ('substance use', 'addiction', 'alcohol', 'opioid'),
    '抑郁症': ('depress', 'mood disorder'),
    '焦虑': ('anxiety', 'anxious'),
    '双相情感障碍': ('bipolar', 'mania', 'mood disorder'),
    '双相障碍': ('bipolar', 'mania', 'mood disorder'),
    '抑郁症机制': ('depress', 'mechanism', 'biomarker', 'neural'),
    '抑郁症治疗': ('depress', 'treatment', 'therapy', 'antidepress'),
    '抑郁症治疗探索': ('depress', 'treatment', 'therapy', 'antidepress'),
    '心理健康预防': ('prevention', 'preventive', 'mental health promotion'),
    '精神病与睡眠': ('psychosis', 'psychotic', 'sleep', 'insomnia'),
    '老年精神医学': ('older adult', 'elderly', 'geriatric', 'dementia', 'late-life'),
}


def matching_preferences(title: str, preferred_topics: list[str]) -> list[str]:
    """Return broad soft-priority matches; unmatched topics never exclude papers."""
    text = title.casefold()
    return [
        topic for topic in preferred_topics
        if any(term in text for term in TOPIC_TERMS.get(topic, (topic.casefold(),)))
    ]
