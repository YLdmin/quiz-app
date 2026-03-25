// 题库整合文件 - 汇总所有分类题库
// 数据格式保持与原 questions-data.js 兼容

const QUESTIONS_DB = {
  changshi: {
    name: "常识判断",
    description: "政治、法律、经济、历史、科技、安徽省情",
    icon: "📚",
    time: 45,
    questions: typeof CHANGSHI_QUESTIONS !== 'undefined' ? CHANGSHI_QUESTIONS : []
  },
  yanyu: {
    name: "言语理解与表达",
    description: "选词填空、片段阅读、语句排序",
    icon: "📝",
    time: 35,
    questions: typeof YANYU_QUESTIONS !== 'undefined' ? YANYU_QUESTIONS : []
  },
  shuliang: {
    name: "数量关系",
    description: "数学运算、数字推理",
    icon: "🔢",
    time: 40,
    questions: typeof SHULIANG_QUESTIONS !== 'undefined' ? SHULIANG_QUESTIONS : []
  },
  panduan: {
    name: "判断推理",
    description: "图形推理、定义判断、逻辑判断、类比推理",
    icon: "🧩",
    time: 35,
    questions: typeof PANDUAN_QUESTIONS !== 'undefined' ? PANDUAN_QUESTIONS : []
  },
  ziliao: {
    name: "资料分析",
    description: "增长率、比重、平均数等",
    icon: "📊",
    time: 25,
    questions: typeof ZILIAO_QUESTIONS !== 'undefined' ? ZILIAO_QUESTIONS : []
  },
  zonghe: {
    name: "综合应用能力",
    description: "概念分析、材料分析、写作",
    icon: "✍️",
    time: 120,
    questions: typeof ZONGHE_QUESTIONS !== 'undefined' ? ZONGHE_QUESTIONS : []
  }
};

// 统计总题量
function getTotalCount() {
  return Object.values(QUESTIONS_DB).reduce((sum, db) => sum + db.questions.length, 0);
}

// 获取随机题目
function getRandomQuestions(type, count) {
  const questions = QUESTIONS_DB[type]?.questions || [];
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// 按子类型获取题目
function getBySubtype(type, subtype) {
  const questions = QUESTIONS_DB[type]?.questions || [];
  return questions.filter(q => q.subtype === subtype);
}

console.log('题库加载完成，总题量：', getTotalCount(), '题');
