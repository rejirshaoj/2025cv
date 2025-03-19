// 游戏关卡设计
const gameLevels = [
    {
        level: 1,
        wordPairs: 10,
        timeLimit: 60, // 秒
        bubbleSize: { min: 80, max: 100 },
        speed: { min: 30, max: 50 },
        difficulty: "easy"
    },
    {
        level: 2,
        wordPairs: 15,
        timeLimit: 90,
        bubbleSize: { min: 75, max: 95 },
        speed: { min: 40, max: 60 },
        difficulty: "easy"
    },
    {
        level: 3,
        wordPairs: 20,
        timeLimit: 120,
        bubbleSize: { min: 70, max: 90 },
        speed: { min: 50, max: 70 },
        difficulty: "medium"
    },
    {
        level: 4,
        wordPairs: 25,
        timeLimit: 150,
        bubbleSize: { min: 65, max: 85 },
        speed: { min: 60, max: 80 },
        difficulty: "medium"
    },
    {
        level: 5,
        wordPairs: 35,
        timeLimit: 180,
        bubbleSize: { min: 60, max: 80 },
        speed: { min: 70, max: 90 },
        difficulty: "medium"
    },
    {
        level: 6,
        wordPairs: 45,
        timeLimit: 210,
        bubbleSize: { min: 55, max: 75 },
        speed: { min: 80, max: 100 },
        difficulty: "hard"
    },
    {
        level: 7,
        wordPairs: 55,
        timeLimit: 240,
        bubbleSize: { min: 50, max: 70 },
        speed: { min: 90, max: 110 },
        difficulty: "hard"
    },
    {
        level: 8,
        wordPairs: 65,
        timeLimit: 270,
        bubbleSize: { min: 45, max: 65 },
        speed: { min: 100, max: 120 },
        difficulty: "hard"
    },
    {
        level: 9,
        wordPairs: 70,
        timeLimit: 300,
        bubbleSize: { min: 40, max: 60 },
        speed: { min: 110, max: 130 },
        difficulty: "expert"
    },
    {
        level: 10,
        wordPairs: 80,
        timeLimit: 330,
        bubbleSize: { min: 35, max: 55 },
        speed: { min: 120, max: 150 },
        difficulty: "expert"
    }
];

// 预设的单词对（简单到复杂）
const wordPairsByDifficulty = {
    easy: [
        { english: "apple", chinese: "苹果" },
        { english: "book", chinese: "书" },
        { english: "cat", chinese: "猫" },
        { english: "dog", chinese: "狗" },
        { english: "egg", chinese: "鸡蛋" },
        { english: "fish", chinese: "鱼" },
        { english: "girl", chinese: "女孩" },
        { english: "house", chinese: "房子" },
        { english: "ice", chinese: "冰" },
        { english: "juice", chinese: "果汁" },
        { english: "king", chinese: "国王" },
        { english: "love", chinese: "爱" },
        { english: "milk", chinese: "牛奶" },
        { english: "name", chinese: "名字" },
        { english: "orange", chinese: "橙子" },
        { english: "pen", chinese: "钢笔" },
        { english: "queen", chinese: "女王" },
        { english: "rice", chinese: "米饭" },
        { english: "sun", chinese: "太阳" },
        { english: "tree", chinese: "树" },
        { english: "umbrella", chinese: "雨伞" },
        { english: "water", chinese: "水" },
        { english: "box", chinese: "盒子" },
        { english: "yellow", chinese: "黄色" },
        { english: "zoo", chinese: "动物园" }
    ],
    medium: [
        { english: "airplane", chinese: "飞机" },
        { english: "birthday", chinese: "生日" },
        { english: "computer", chinese: "电脑" },
        { english: "dictionary", chinese: "字典" },
        { english: "elephant", chinese: "大象" },
        { english: "family", chinese: "家庭" },
        { english: "garden", chinese: "花园" },
        { english: "hospital", chinese: "医院" },
        { english: "internet", chinese: "互联网" },
        { english: "journey", chinese: "旅行" },
        { english: "kitchen", chinese: "厨房" },
        { english: "library", chinese: "图书馆" },
        { english: "mountain", chinese: "山" },
        { english: "notebook", chinese: "笔记本" },
        { english: "office", chinese: "办公室" },
        { english: "parents", chinese: "父母" },
        { english: "question", chinese: "问题" },
        { english: "restaurant", chinese: "餐厅" },
        { english: "student", chinese: "学生" },
        { english: "teacher", chinese: "老师" },
        { english: "university", chinese: "大学" },
        { english: "vacation", chinese: "假期" },
        { english: "weather", chinese: "天气" },
        { english: "exercise", chinese: "锻炼" },
        { english: "yesterday", chinese: "昨天" }
    ],
    hard: [
        { english: "achievement", chinese: "成就" },
        { english: "beautiful", chinese: "美丽的" },
        { english: "celebration", chinese: "庆祝" },
        { english: "development", chinese: "发展" },
        { english: "environment", chinese: "环境" },
        { english: "friendship", chinese: "友谊" },
        { english: "government", chinese: "政府" },
        { english: "happiness", chinese: "幸福" },
        { english: "important", chinese: "重要的" },
        { english: "knowledge", chinese: "知识" },
        { english: "leadership", chinese: "领导力" },
        { english: "management", chinese: "管理" },
        { english: "necessary", chinese: "必要的" },
        { english: "opportunity", chinese: "机会" },
        { english: "psychology", chinese: "心理学" },
        { english: "relationship", chinese: "关系" },
        { english: "successful", chinese: "成功的" },
        { english: "technology", chinese: "技术" },
        { english: "understand", chinese: "理解" },
        { english: "vocabulary", chinese: "词汇" },
        { english: "wonderful", chinese: "精彩的" },
        { english: "experience", chinese: "经验" },
        { english: "yourself", chinese: "你自己" },
        { english: "zoology", chinese: "动物学" },
        { english: "adventure", chinese: "冒险" }
    ],
    expert: [
        { english: "accomplishment", chinese: "成就" },
        { english: "breakthrough", chinese: "突破" },
        { english: "collaboration", chinese: "合作" },
        { english: "determination", chinese: "决心" },
        { english: "extraordinary", chinese: "非凡的" },
        { english: "fundamental", chinese: "基本的" },
        { english: "globalization", chinese: "全球化" },
        { english: "humanitarian", chinese: "人道主义的" },
        { english: "implementation", chinese: "实施" },
        { english: "jurisprudence", chinese: "法理学" },
        { english: "kaleidoscope", chinese: "万花筒" },
        { english: "linguistics", chinese: "语言学" },
        { english: "metropolitan", chinese: "大都市的" },
        { english: "neuroscience", chinese: "神经科学" },
        { english: "overwhelming", chinese: "压倒性的" },
        { english: "philosophical", chinese: "哲学的" },
        { english: "qualification", chinese: "资格" },
        { english: "revolutionary", chinese: "革命性的" },
        { english: "sophisticated", chinese: "复杂的" },
        { english: "transformation", chinese: "转变" },
        { english: "unprecedented", chinese: "前所未有的" },
        { english: "visualization", chinese: "可视化" },
        { english: "wholeheartedly", chinese: "全心全意地" },
        { english: "xenophobia", chinese: "仇外心理" },
        { english: "youthfulness", chinese: "青春" },
        { english: "zealousness", chinese: "热情" },
        { english: "biodiversity", chinese: "生物多样性" },
        { english: "cryptocurrency", chinese: "加密货币" },
        { english: "entrepreneurship", chinese: "创业精神" },
        { english: "infrastructure", chinese: "基础设施" }
    ]
};

// 获取指定关卡的单词对
function getWordPairsForLevel(level) {
    const levelConfig = gameLevels[level - 1];
    const difficulty = levelConfig.difficulty;
    const count = levelConfig.wordPairs;
    
    // 根据难度选择单词池
    let wordPool = [];
    if (difficulty === "easy") {
        wordPool = wordPairsByDifficulty.easy;
    } else if (difficulty === "medium") {
        wordPool = [...wordPairsByDifficulty.easy, ...wordPairsByDifficulty.medium];
    } else if (difficulty === "hard") {
        wordPool = [...wordPairsByDifficulty.medium, ...wordPairsByDifficulty.hard];
    } else if (difficulty === "expert") {
        wordPool = [...wordPairsByDifficulty.hard, ...wordPairsByDifficulty.expert];
    }
    
    // 随机选择指定数量的单词对
    const shuffled = [...wordPool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}