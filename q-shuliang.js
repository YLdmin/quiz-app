// 数量关系题库（数学运算+数字推理）
const SHULIANG_QUESTIONS = [
  // === 数字推理 ===
  {id:"sl001",type:"shuliang",subtype:"数字推理",question:"2, 5, 10, 17, 26, （ ）",options:["A.35","B.36","C.37","D.38"],answer:"C",explanation:"规律：差数列。5-2=3，10-5=5，17-10=7，26-17=9，差依次为3,5,7,9（等差数列，公差为2），下一个差为11，所以26+11=37。故选C。",year:2023},
  {id:"sl002",type:"shuliang",subtype:"数字推理",question:"1, 1, 2, 3, 5, 8, 13, （ ）",options:["A.18","B.19","C.20","D.21"],answer:"D",explanation:"斐波那契数列：每个数等于前两个数之和。1+1=2，1+2=3，2+3=5，3+5=8，5+8=13，8+13=21。故选D。",year:2022},
  {id:"sl003",type:"shuliang",subtype:"数字推理",question:"2, 6, 12, 20, 30, （ ）",options:["A.40","B.42","C.44","D.45"],answer:"B",explanation:"规律：n(n+1)。2=1×2，6=2×3，12=3×4，20=4×5，30=5×6，下一项=6×7=42。故选B。",year:2023},
  {id:"sl004",type:"shuliang",subtype:"数字推理",question:"3, 9, 27, 81, （ ）",options:["A.162","B.243","C.324","D.256"],answer:"B",explanation:"等比数列，公比为3。81×3=243。故选B。",year:2021},
  {id:"sl005",type:"shuliang",subtype:"数字推理",question:"1, 4, 9, 16, 25, （ ）",options:["A.30","B.35","C.36","D.49"],answer:"C",explanation:"完全平方数数列：1²=1，2²=4，3²=9，4²=16，5²=25，6²=36。故选C。",year:2021},
  {id:"sl006",type:"shuliang",subtype:"数字推理",question:"2, 3, 5, 9, 17, （ ）",options:["A.31","B.33","C.35","D.37"],answer:"B",explanation:"规律：从第三项起，每项=前两项之和-1（或每项乘2减1递推）。3+5-1=7? 不对。重新分析：差为1,2,4,8（倍增），下一个差为16，所以17+16=33。故选B。",year:2022},
  {id:"sl007",type:"shuliang",subtype:"数字推理",question:"1, 2, 4, 7, 11, 16, （ ）",options:["A.21","B.22","C.23","D.24"],answer:"B",explanation:"差数列：2-1=1，4-2=2，7-4=3，11-7=4，16-11=5，差为1,2,3,4,5（逐次加1），下一个差为6，16+6=22。故选B。",year:2022},
  {id:"sl008",type:"shuliang",subtype:"数字推理",question:"0, 1, 3, 6, 10, 15, （ ）",options:["A.18","B.19","C.20","D.21"],answer:"D",explanation:"差数列：1-0=1，3-1=2，6-3=3，10-6=4，15-10=5，差为1,2,3,4,5，下一个差为6，15+6=21。故选D。",year:2022},
  // === 数学运算 ===
  {id:"sl009",type:"shuliang",subtype:"数学运算",question:"某工程队有工人40名，完成一项工程需要30天。如果将工人增加到60名，则完成同样工程需要多少天？",options:["A.15天","B.18天","C.20天","D.24天"],answer:"C",explanation:"工作量=40×30=1200（工日）。60人完成同样工作量：1200÷60=20天。故选C。",year:2023},
  {id:"sl010",type:"shuliang",subtype:"数学运算",question:"某商品原价100元，先涨价20%，再降价20%，最终售价是多少元？",options:["A.96元","B.98元","C.100元","D.102元"],answer:"A",explanation:"先涨20%：100×(1+20%)=120元。再降20%：120×(1-20%)=120×0.8=96元。故选A。",year:2022},
  {id:"sl011",type:"shuliang",subtype:"数学运算",question:"甲、乙两车同时从A城出发向B城行驶，甲车速度为60km/h，乙车速度为40km/h，甲车到达B城后立即返回，途中与乙车相遇，此时乙车已行驶了多少路程（设A、B两城相距100km）？",options:["A.60km","B.70km","C.75km","D.80km"],answer:"D",explanation:"设相遇时间为t小时。甲车行驶距离：60t；乙车行驶距离：40t。甲到B城返回与乙相遇时：甲走了100+(100-40t)=200-40t，也等于60t。60t=200-40t，100t=200，t=2小时。乙车行驶距离：40×2=80km。故选D。",year:2023},
  {id:"sl012",type:"shuliang",subtype:"数学运算",question:"一个班级有45名学生，喜欢数学的有30名，喜欢语文的有25名，两者都喜欢的有15名，两者都不喜欢的有几名？",options:["A.3名","B.5名","C.7名","D.10名"],answer:"B",explanation:"两者至少喜欢一项：30+25-15=40名。都不喜欢：45-40=5名。故选B。",year:2022},
  {id:"sl013",type:"shuliang",subtype:"数学运算",question:"一件商品打八折后售价为80元，原价是多少元？",options:["A.96元","B.100元","C.104元","D.108元"],answer:"B",explanation:"原价×80%=80元，原价=80÷0.8=100元。故选B。",year:2021},
  {id:"sl014",type:"shuliang",subtype:"数学运算",question:"某人存款100万元，年利率为4%，按单利计算，5年后共有多少钱？",options:["A.118万元","B.120万元","C.121.67万元","D.122万元"],answer:"B",explanation:"单利：本金×利率×年数=100×4%×5=20万元（利息）。本利合计=100+20=120万元。故选B。",year:2022},
  {id:"sl015",type:"shuliang",subtype:"数学运算",question:"从1到100的自然数中，能被3整除的数有多少个？",options:["A.31个","B.32个","C.33个","D.34个"],answer:"C",explanation:"能被3整除：3,6,9,...,99，共99÷3=33个。故选C。",year:2021},
  {id:"sl016",type:"shuliang",subtype:"数学运算",question:"某次考试，甲得了78分，乙得了82分，丙得了90分，三人平均分是多少？",options:["A.82分","B.83.3分","C.83分","D.84分"],answer:"B",explanation:"平均分=(78+82+90)÷3=250÷3≈83.3分。故选B。",year:2021},
  {id:"sl017",type:"shuliang",subtype:"数学运算",question:"一项工程，甲单独完成需要12天，乙单独完成需要18天，两人合作完成需要多少天？",options:["A.6天","B.7天","C.7.2天","D.8天"],answer:"C",explanation:"甲效率：1/12，乙效率：1/18。合作效率：1/12+1/18=3/36+2/36=5/36。所需天数：1÷(5/36)=36/5=7.2天。故选C。",year:2022},
  {id:"sl018",type:"shuliang",subtype:"数学运算",question:"某地区2023年GDP为500亿元，2024年GDP为550亿元，2024年相比2023年增长了多少？",options:["A.5%","B.8%","C.10%","D.12%"],answer:"C",explanation:"增长率=(550-500)÷500×100%=50÷500×100%=10%。故选C。",year:2024},
  {id:"sl019",type:"shuliang",subtype:"数学运算",question:"一个正方形的边长增加20%，面积增加了多少？",options:["A.20%","B.40%","C.44%","D.48%"],answer:"C",explanation:"设原边长为a，原面积a²。新边长=1.2a，新面积=(1.2a)²=1.44a²。增加44%。故选C。",year:2022},
  {id:"sl020",type:"shuliang",subtype:"数学运算",question:"某单位有100名员工，其中男性60人，女性40人。男性平均工资为6000元，女性平均工资为5000元，全体员工平均工资是多少元？",options:["A.5400元","B.5500元","C.5600元","D.5800元"],answer:"C",explanation:"总工资=60×6000+40×5000=360000+200000=560000元。平均工资=560000÷100=5600元。故选C。",year:2022},
  {id:"sl021",type:"shuliang",subtype:"数字推理",question:"1, 8, 27, 64, 125, （ ）",options:["A.196","B.216","C.225","D.256"],answer:"B",explanation:"完全立方数：1³=1，2³=8，3³=27，4³=64，5³=125，6³=216。故选B。",year:2021},
  {id:"sl022",type:"shuliang",subtype:"数字推理",question:"2, 6, 18, 54, 162, （ ）",options:["A.486","B.324","C.512","D.540"],answer:"A",explanation:"等比数列，公比为3。162×3=486。故选A。",year:2021},
  {id:"sl023",type:"shuliang",subtype:"数学运算",question:"某城市今年人口为200万，计划年增长率为1.5%，三年后人口约为多少万（保留整数）？",options:["A.208万","B.209万","C.210万","D.211万"],answer:"B",explanation:"三年后人口=200×(1+1.5%)³=200×1.015³≈200×1.0457≈209.1≈209万。故选B。",year:2023},
  {id:"sl024",type:"shuliang",subtype:"数学运算",question:"某人骑车从A地到B地，去时速度为15km/h，返回时速度为10km/h，则全程平均速度是多少km/h？",options:["A.11km/h","B.12km/h","C.12.5km/h","D.13km/h"],answer:"B",explanation:"设A到B距离为d。全程时间=d/15+d/10=2d/30+3d/30=5d/30=d/6。全程距离=2d。平均速度=2d÷(d/6)=12km/h。故选B。",year:2022},
  {id:"sl025",type:"shuliang",subtype:"数学运算",question:"某项目投资100万元，第一年盈利10万元，第二年盈利12万元，第三年亏损5万元，三年合计投资回报率是多少？",options:["A.15%","B.17%","C.18%","D.20%"],answer:"B",explanation:"三年总盈利=10+12-5=17万元。总投资回报率=17÷100×100%=17%。故选B。",year:2023}
];
