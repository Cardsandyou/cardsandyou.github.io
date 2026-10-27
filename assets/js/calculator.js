/* 卡點遊實算：哩程累積速度計算機
 * 兌換比例資料：pts 點 → miles 哩（整理自各銀行公告，2026/10；每個點數系統的 note 註明來源）
 * 每 X 元 = 1 哩 的算法：X = (pts / miles) ÷ 回饋率 ÷ (1 + 加成)
 * 例：小樹點 360 點換 1,000 哩長榮，回饋率 3% → 0.36 ÷ 0.03 = 每 12 元 1 哩
 * earn 型點數系統（匯豐旅遊積分、星展飛行積金、凱基哩程點）：依卡別「每幾元累積 1 點」，
 *   X = 每幾元 1 點 × (pts / miles) ÷ (1 + 加成)
 */
const SYSTEMS = [
  { id: 'cube', name: '小樹點（現行制度）', short: '小樹點', unit: '點', alt: 'cube2027',
    holder: { tag: '世界卡身分', label: '我也持有國泰世界卡', hint: '兌換長榮航空、亞洲萬里通、中華航空可享優惠比例（2026/12/31 前）' },
    note: '依國泰世華 2026 年小樹點(信用卡)權益公告，適用至 2026/12/31；持有國泰世界卡者，長榮航空與亞洲萬里通為 300 點、中華航空為 720 點換 1,000 哩。',
    programs: [
    { name: '長榮航空', short: '長榮航空', pts: 360, miles: 1000, holderPts: 300 },
    { name: '亞洲萬里通', short: '亞洲萬里通', pts: 360, miles: 1000, holderPts: 300 },
    { name: '中華航空', short: '中華航空', pts: 840, miles: 1000, holderPts: 720 },
    { name: '日本航空', short: '日本航空', pts: 480, miles: 1000 },
    { name: '法航荷航', short: '法航荷航', pts: 340, miles: 1000 },
    { name: '新加坡航空', short: '新加坡航空', pts: 620, miles: 1000 },
    { name: '阿聯酋航空', short: '阿聯酋航空', pts: 550, miles: 1000 },
    { name: '聯合航空', short: '聯合航空', pts: 510, miles: 1000 },
    { name: '加拿大航空', short: '加拿大航空', pts: 510, miles: 1000 },
    { name: '阿提哈德航空', short: '阿提哈德', pts: 420, miles: 1000 },
    { name: '卡達航空', short: '卡達航空', pts: 480, miles: 1000 },
    { name: '英國航空', short: '英國航空', pts: 450, miles: 1000 },
    { name: '泰國航空', short: '泰國航空', pts: 450, miles: 1000 },
    { name: '亞洲航空', short: '亞洲航空', pts: 250, miles: 1000 },
    { name: '萬豪旅享家', short: '萬豪旅享家', pts: 340, miles: 1000, unit: '點' },
    { name: 'IHG 優悅會', short: 'IHG 優悅會', pts: 250, miles: 1000, unit: '點' },
    { name: '雅高心悅界', short: '雅高心悅界', pts: 600, miles: 1000, unit: '點' },
    { name: '香格里拉會', short: '香格里拉會', pts: 550, miles: 250, unit: '點' },
  ]},
  { id: 'cube2027', name: '小樹點（2027新制）', short: '小樹點 2027 新制', unit: '點',
    note: '依國泰世華 2027 年小樹點(信用卡)權益公告，2027/1/1 起適用；新制不再區分世界卡，所有卡片同一比例。',
    programs: [
    { name: '長榮航空', short: '長榮航空', pts: 380, miles: 1000 },
    { name: '亞洲萬里通', short: '亞洲萬里通', pts: 390, miles: 1000 },
    { name: '中華航空', short: '中華航空', pts: 1000, miles: 1000 },
    { name: '日本航空', short: '日本航空', pts: 480, miles: 1000 },
    { name: '法航荷航', short: '法航荷航', pts: 500, miles: 1000 },
    { name: '阿聯酋航空', short: '阿聯酋航空', pts: 550, miles: 1000 },
    { name: '萬豪旅享家', short: '萬豪旅享家', pts: 340, miles: 1000, unit: '點' },
    { name: 'IHG 優悅會', short: 'IHG 優悅會', pts: 250, miles: 1000, unit: '點' },
    { name: '雅高心悅界', short: '雅高心悅界', pts: 600, miles: 1000, unit: '點' },
  ]},
  { id: 'openpoint', name: 'OPENPOINT', short: 'OPENPOINT', unit: '點',
    note: '亞洲萬里通／長榮航空金點賞比例由卡點遊提供，其餘依卡點遊整理資料。',
    programs: [
    { name: '亞洲萬里通', short: '亞洲萬里通', pts: 68, miles: 100 },
    { name: '亞洲萬里通金點賞（30,000 點換 52,000 哩）', short: '亞洲萬里通金點賞', pts: 30000, miles: 52000 },
    { name: '長榮航空', short: '長榮航空', pts: 135, miles: 200 },
    { name: '長榮航空金點賞（66,700 點換 100,000 哩）', short: '長榮航空金點賞', pts: 66700, miles: 100000 },
    { name: '全日空', short: '全日空', pts: 188, miles: 200 },
  ]},
  { id: 'hsbc', name: '匯豐旅遊積分', short: '旅遊積分', unit: '旅遊積分', earn: true,
    note: '依滙豐銀行官網，旅人系列旅遊積分兌換 16 家航空與 3 家飯店皆為 1:1（適用 2026/10/1–2026/12/31），每次最低 3,000 點、以 500 點為單位；中華航空含華信航空，長榮航空含立榮航空。',
    programs: [
    { name: '中華航空', short: '中華航空', pts: 1, miles: 1 },
    { name: '長榮航空', short: '長榮航空', pts: 1, miles: 1 },
    { name: '亞洲萬里通', short: '亞洲萬里通', pts: 1, miles: 1 },
    { name: '新加坡航空', short: '新加坡航空', pts: 1, miles: 1 },
    { name: '日本航空', short: '日本航空', pts: 1, miles: 1 },
    { name: '亞洲航空', short: '亞洲航空', pts: 1, miles: 1 },
    { name: '阿聯酋航空', short: '阿聯酋航空', pts: 1, miles: 1 },
    { name: '加拿大航空', short: '加拿大航空', pts: 1, miles: 1 },
    { name: '哥倫比亞航空', short: '哥倫比亞航空', pts: 1, miles: 1 },
    { name: '法航荷航', short: '法航荷航', pts: 1, miles: 1 },
    { name: '海南航空', short: '海南航空', pts: 1, miles: 1 },
    { name: '澳洲航空', short: '澳洲航空', pts: 1, miles: 1 },
    { name: '卡達航空', short: '卡達航空', pts: 1, miles: 1 },
    { name: '聯合航空', short: '聯合航空', pts: 1, miles: 1 },
    { name: '越南航空', short: '越南航空', pts: 1, miles: 1 },
    { name: '土耳其航空', short: '土耳其航空', pts: 1, miles: 1 },
    { name: '雅高心悅界', short: '雅高心悅界', pts: 1, miles: 1, unit: '點' },
    { name: '萬豪旅享家', short: '萬豪旅享家', pts: 1, miles: 1, unit: '點' },
    { name: 'IHG 優悅會', short: 'IHG 優悅會', pts: 1, miles: 1, unit: '點' },
  ]},
  { id: 'hsbccash', name: '匯豐現金積點', short: '匯豐現金積點', unit: '點',
    note: '匯鑽卡、現金回饋御璽卡、Live+ 現金回饋卡適用；滙豐官網只列出長榮的比例，其餘三家依第三方整理。',
    programs: [
    { name: '長榮航空', short: '長榮航空', pts: 1, miles: 2 },
    { name: '亞洲萬里通', short: '亞洲萬里通', pts: 1, miles: 2 },
    { name: '中華航空', short: '中華航空', pts: 1, miles: 2 },
    { name: '新加坡航空', short: '新加坡航空', pts: 1, miles: 2 },
  ]},
  { id: 'dbs', name: '星展現金積點／現金紅利', short: '星展現金積點', unit: '點',
    note: '現金積點與現金紅利兌換比例相同；依星展銀行官網，兌換適用期間至 2027/6/30。',
    programs: [
    { name: '長榮航空', short: '長榮航空', pts: 50, miles: 100 },
    { name: '亞洲萬里通', short: '亞洲萬里通', pts: 50, miles: 100 },
    { name: '中華航空', short: '中華航空', pts: 90, miles: 100 },
  ]},
  { id: 'dbsfly', name: '星展飛行積金', short: '飛行積金', unit: '飛行積金', earn: true,
    note: '依星展銀行官網，兌換適用期間至 2027/6/30；單筆最低兌換 6,000 哩，並以 1,000 哩為單位。',
    programs: [
    { name: '亞洲萬里通', short: '亞洲萬里通', pts: 1, miles: 1 },
    { name: '長榮航空', short: '長榮航空', pts: 1, miles: 1 },
    { name: '新加坡航空', short: '新加坡航空', pts: 1, miles: 1 },
    { name: '中華航空', short: '中華航空', pts: 2, miles: 1 },
  ]},
  { id: 'kgi', name: '凱基哩程點', short: '凱基哩程點', unit: '哩程點', earn: true,
    holder: { tag: '財管會員', label: '我是凱基財管會員', hint: '勾選後國內每 18 元、國外每 12 元累積 1 點（一般為國內外每 22 元）' },
    note: '雙幣哩程卡一般消費每 22 元 1 點（國內外相同），財管會員國內每 18 元、國外每 12 元 1 點；哩程點可 1:1 轉中華航空、長榮航空、亞洲萬里通；依凱基銀行官網。',
    programs: [
    { name: '中華航空', short: '中華航空', pts: 1, miles: 1 },
    { name: '長榮航空', short: '長榮航空', pts: 1, miles: 1 },
    { name: '亞洲萬里通', short: '亞洲萬里通', pts: 1, miles: 1 },
  ]},
  { id: 'rakuten', name: '樂天樂翔積分', short: '樂翔積分', unit: '樂翔積分', earn: true,
    note: '樂翔積分可 1:1 轉亞洲萬里通、長榮航空；依台灣樂天信用卡官網，樂翔無限卡每月回饋上限 60,000 點、樂翔御璽卡 5,000 點。',
    programs: [
    { name: '亞洲萬里通', short: '亞洲萬里通', pts: 1, miles: 1 },
    { name: '長榮航空', short: '長榮航空', pts: 1, miles: 1 },
  ]},
  { id: 'taishin', name: '台新 Point', short: '台新 Point', unit: '點',
    note: '依台新銀行 Richart Life 兌換頁；亞洲萬里通限台新 Point(信用卡)；2,000 點換 4,000 哩限環球無限卡累積的點數。',
    programs: [
    { name: '中華航空', short: '中華航空', pts: 11, miles: 14 },
    { name: '長榮航空', short: '長榮航空', pts: 11, miles: 13 },
    { name: '亞洲萬里通', short: '亞洲萬里通', pts: 10, miles: 18 },
    { name: '中華航空（環球無限卡專屬）', short: '中華航空', pts: 2000, miles: 4000, only: 'ts-gi' },
    { name: '長榮航空（環球無限卡專屬）', short: '長榮航空', pts: 2000, miles: 4000, only: 'ts-gi' },
  ]},
  { id: 'esun', name: '玉山 e point', short: '玉山 e point', unit: '點',
    note: '一般兌換比例，限時加碼活動未計入。',
    programs: [
    { name: '長榮航空', short: '長榮航空', pts: 200, miles: 300 },
    { name: '亞洲萬里通', short: '亞洲萬里通', pts: 200, miles: 300 },
    { name: '中華航空', short: '中華航空', pts: 200, miles: 180 },
  ]},
  { id: 'rove', name: 'ROVE Miles', short: 'ROVE Miles', unit: 'ROVE Miles', currency: 'USD',
    rateHint: '每 1 美元可得幾倍，例：5 倍輸入 5',
    note: '依 ROVE 官網，21 家航空皆為 1:1；雅高心悅界為 1.5 ROVE Miles 換 1 點。以美元計價，臺幣成本依臺灣銀行即期匯率換算。提醒：在 ROVE Miles 平台用信用卡付款時，信用卡本身的回饋未計入，實際成本應該更低。',
    programs: [
    { name: '亞洲萬里通', short: '亞洲萬里通', pts: 1, miles: 1 },
    { name: '日本航空', short: '日本航空', pts: 1, miles: 1 },
    { name: '法航荷航', short: '法航荷航', pts: 1, miles: 1 },
    { name: '加拿大航空', short: '加拿大航空', pts: 1, miles: 1 },
    { name: '卡達航空', short: '卡達航空', pts: 1, miles: 1 },
    { name: '阿提哈德航空', short: '阿提哈德', pts: 1, miles: 1 },
    { name: '泰國航空', short: '泰國航空', pts: 1, miles: 1 },
    { name: '越南航空', short: '越南航空', pts: 1, miles: 1 },
    { name: '土耳其航空', short: '土耳其航空', pts: 1, miles: 1 },
    { name: '澳洲航空', short: '澳洲航空', pts: 1, miles: 1 },
    { name: '海南航空', short: '海南航空', pts: 1, miles: 1 },
    { name: '漢莎航空', short: '漢莎航空', pts: 1, miles: 1 },
    { name: '芬蘭航空', short: '芬蘭航空', pts: 1, miles: 1 },
    { name: '北歐航空', short: '北歐航空', pts: 1, miles: 1 },
    { name: '印度航空', short: '印度航空', pts: 1, miles: 1 },
    { name: '維珍航空', short: '維珍航空', pts: 1, miles: 1 },
    { name: 'Virgin Red', short: 'Virgin Red', pts: 1, miles: 1 },
    { name: '墨西哥航空', short: '墨西哥航空', pts: 1, miles: 1 },
    { name: '巴拿馬航空', short: '巴拿馬航空', pts: 1, miles: 1 },
    { name: '捷藍航空', short: '捷藍航空', pts: 1, miles: 1 },
    { name: '邊疆航空', short: '邊疆航空', pts: 1, miles: 1 },
    { name: '雅高心悅界', short: '雅高心悅界', pts: 1.5, miles: 1, unit: '點' },
  ]},
];

/* ---------- 卡片清單（「用卡片選」模式） ----------
   sys：這張卡累積的點數系統；earn 型系統另外寫 dom／ovs＝國內／國外每幾元累積 1 點。
   holderLock：選這張卡時，該系統的持卡身分（例：世界卡）自動成立。
   custom：其他卡片，由使用者自行填寫回饋率（earn 型則填每幾元累積 1 點）。 */
const CARDS = [
  { group: '國泰世華', items: [
    { id: 'cube', name: 'CUBE 卡', sys: 'cube' },
    { id: 'cathay-world', name: '國泰世界卡', sys: 'cube', holderLock: true },
  ]},
  { group: '中國信託', items: [
    { id: 'uniopen', name: 'uniopen 聯名卡', sys: 'openpoint' },
  ]},
  { group: '滙豐', items: [
    { id: 'hsbc-ti', name: '旅人無限卡', sys: 'hsbc', dom: 18, ovs: 10 },
    { id: 'hsbc-ts', name: '旅人御璽卡', sys: 'hsbc', dom: 18, ovs: 15 },
    { id: 'hsbc-tl', name: '旅人輕旅卡', sys: 'hsbc', dom: 20, ovs: 20 },
    { id: 'hsbc-pre', name: '匯鑽卡', sys: 'hsbccash' },
    { id: 'hsbc-cb', name: '現金回饋御璽卡', sys: 'hsbccash' },
    { id: 'hsbc-live', name: 'Live+ 現金回饋卡', sys: 'hsbccash' },
    { id: 'hsbc-other', name: '其他滙豐卡片（現金積點）', sys: 'hsbccash', custom: true },
  ]},
  { group: '星展', items: [
    { id: 'dbs-eco', name: 'eco 永續卡', sys: 'dbs' },
    { id: 'dbs-aov', name: '傳說對決聯名卡', sys: 'dbs' },
    { id: 'dbs-other', name: '其他星展卡片（現金積點／現金紅利）', sys: 'dbs', custom: true },
    { id: 'dbs-elite', name: '飛行世界之極卡', sys: 'dbsfly', dom: 18, ovs: 15 },
    { id: 'dbs-biz', name: '飛行世界商務卡', sys: 'dbsfly', dom: 22, ovs: 18 },
    { id: 'dbs-ti', name: '飛行鈦金卡', sys: 'dbsfly', dom: 35, ovs: 20 },
    { id: 'dbsfly-other', name: '其他星展飛行卡（自行填寫累積比例）', sys: 'dbsfly', custom: true },
  ]},
  { group: '凱基', items: [
    { id: 'kgi-dual', name: '雙幣哩程卡', sys: 'kgi', dom: 22, ovs: 22, holderDom: 18, holderOvs: 12 },
  ]},
  { group: '台灣樂天', items: [
    { id: 'rakuten-inf', name: '樂翔無限卡', sys: 'rakuten', dom: 18, ovs: 6 },
    { id: 'rakuten-sig', name: '樂翔御璽卡', sys: 'rakuten', dom: 18, ovs: 12 },
  ]},
  { group: '台新', items: [
    { id: 'ts-richart', name: 'Richart 卡', sys: 'taishin' },
    { id: 'ts-family', name: '全家 Richart 聯名卡', sys: 'taishin' },
    { id: 'ts-gi', name: '環球無限卡', sys: 'taishin' },
    { id: 'ts-other', name: '其他台新卡片', sys: 'taishin', custom: true },
  ]},
  { group: '玉山', items: [
    { id: 'esun-uni', name: 'Unicard', sys: 'esun' },
    { id: 'esun-biz', name: '商務御璽卡', sys: 'esun' },
    { id: 'esun-chungyo', name: '中友百貨悠遊聯名卡', sys: 'esun' },
    { id: 'esun-hanshin', name: '漢神巨蛋聯名卡', sys: 'esun' },
    { id: 'esun-other', name: '其他玉山卡片', sys: 'esun', custom: true },
  ]},
  { group: '其他點數來源', items: [
    { id: 'op-other', name: 'OPENPOINT（其他累積方式，如綁定 icash Pay）', sys: 'openpoint', custom: true,
      info: '累積：<b>OPENPOINT</b>　·　例如綁定 icash Pay、OPEN 錢包的回饋，回饋率請自行填寫' },
    { id: 'rove', name: 'ROVE Miles', sys: 'rove', info: '在 ROVE Miles 平台以美元消費，累積 <b>ROVE Miles</b>' },
  ]},
];
const ALL_CARDS = CARDS.flatMap(g => g.items);

const PLAN = {
  '長榮航空': '無限萬哩遊', '中華航空': '華夏哩程酬賓計劃', '亞洲萬里通': '國泰航空 亞洲萬里通', '日本航空': 'JAL 哩程儲蓄專案',
  '法航荷航': '藍天飛行 Flying Blue', '新加坡航空': 'KrisFlyer', '阿聯酋航空': 'Skywards', '聯合航空': '前程萬里 MileagePlus',
  '加拿大航空': 'Aeroplan', '阿提哈德航空': 'Etihad Guest', '卡達航空': 'Privilege Club（Avios）', '英國航空': 'British Airways Club（Avios）',
  '泰國航空': 'Royal Orchid Plus', '全日空': 'ANA Mileage Club', '越南航空': 'Lotusmiles', '土耳其航空': 'Miles&Smiles',
  '澳洲航空': 'Qantas Frequent Flyer', '海南航空': '金鵬俱樂部 Fortune Wings Club', '漢莎航空': 'Miles & More', '芬蘭航空': 'Finnair Plus',
  '北歐航空': 'EuroBonus', '印度航空': 'Maharaja Club', '維珍航空': 'Flying Club', '墨西哥航空': 'Aeromexico Rewards',
  '巴拿馬航空': 'ConnectMiles', '哥倫比亞航空': 'LifeMiles', '亞洲航空': 'AirAsia Rewards', '捷藍航空': 'TrueBlue', '邊疆航空': 'Frontier Miles',
  '萬豪旅享家': 'Marriott Bonvoy', 'IHG 優悅會': 'IHG One Rewards', '雅高心悅界': 'ALL - Accor Live Limitless', '香格里拉會': 'Shangri-La Circle',
};
const planOf = p => p ? (PLAN[p.short] || PLAN[p.name.replace(/（.*?）|金點賞.*$/g, '')] || '') : '';
const MAX = 5, KEY = 'cardsandyou-compare-v1';
// 每日匯率檔網址（上線後填入 fx-updater 產生的 fx.json 網址；空白時使用 assets/fx.js 的內建值）
const FX_URL = window.CY_FX_URL || '';   // 由主題設定「每日匯率檔網址」帶入
let FX = window.CY_FX || { buy: 32.43, sell: 32.58, mid: 32.505, posted: '2026/10/24 09:25', source: '臺灣銀行即期匯率' };
const memo = { NTD: { spend: '90,000', rate: '3' }, USD: { spend: '1,000', rate: '5' }, EARN: { rate: '' } };
let mode = 'NTD';
const $ = id => document.getElementById(id);
const fmt = (n, d = 0) => new Intl.NumberFormat('zh-TW', { maximumFractionDigits: d }).format(n);
const fmt2 = n => (n >= 100 ? fmt(n, 0) : fmt(n, n >= 10 ? 1 : 2));
const num = id => +String($(id).value).replace(/[^\d.]/g, '') || 0;
let compare = [];
try { compare = JSON.parse(localStorage.getItem(KEY) || '[]').slice(0, MAX); } catch (e) { compare = []; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(compare)); } catch (e) {} };

/* ---------- 下拉選單 ----------
   第一層有兩種選法：用卡片選（預設，新手）／用點數系統選（熟手）。
   兩種選法最後都對應到同一組 SYSTEMS 資料，計算方式完全相同。 */
const PICK_KEY = 'cardsandyou-pick-mode';
const NOTICE = '兌換比例與規則可能依銀行或點數平台公告而變動，請以該公告為準。';   // 每個點數系統的資料來源後都會加上
let pickMode = 'card', scheme = 'now', lastLock = false;
try { if (localStorage.getItem(PICK_KEY) === 'sys') pickMode = 'sys'; } catch (e) {}
const sysById = id => SYSTEMS.find(s => s.id === id);
const cardById = id => ALL_CARDS.find(c => c.id === id);
function fillSystems() {
  $('system').innerHTML = pickMode === 'card'
    ? CARDS.map(g => `<optgroup label="${g.group}">${g.items.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</optgroup>`).join('')
    : SYSTEMS.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  $('pickLabel').textContent = pickMode === 'card' ? '信用卡' : '點數系統';
  $('pickHint').textContent = pickMode === 'card' ? '選擇你刷的卡片' : '選擇你的點數來源';
  document.querySelectorAll('#pickSeg button').forEach(b => b.classList.toggle('on', b.dataset.m === pickMode));
}
// 「用點數系統選」時，earn 型系統要另外選卡別（最後一個選項為自行填寫）
function fillEarnCards(sys) {
  const list = ALL_CARDS.filter(c => c.sys === sys.id && !c.custom);
  $('earnCard').innerHTML = list.map(c => `<option value="${c.id}">${c.name}</option>`).join('')
    + `<option value="custom">其他卡片（自行填寫累積比例）</option>`;
}
const pickedCard = () => pickMode === 'card' ? cardById($('system').value) || ALL_CARDS[0] : null;
function currentSystem() {
  if (pickMode === 'sys') return sysById($('system').value) || SYSTEMS[0];
  const s = sysById(pickedCard().sys);
  return s.alt && scheme === '2027' ? sysById(s.alt) : s;
}
// 目前使用的卡片：用卡片選＝所選卡片；用點數系統選＝earn 型系統的卡別（自行填寫時為 custom 卡）
function currentCard() {
  if (pickMode === 'card') return pickedCard();
  const sys = currentSystem();
  if (!sys.earn) return null;
  const v = $('earnCard').value;
  return v === 'custom' ? { id: 'custom', name: '其他卡片', sys: sys.id, custom: true } : cardById(v);
}
const currentProgram = () => currentSystem().programs[+$('program').value] || null;
// 持卡身分（世界卡、凱基財管會員）
const holderOn = () => { const s = currentSystem(), c = currentCard(); return !!s.holder && (!!(c && c.holderLock) || $('holder').checked); };
const ptsOf = p => (holderOn() && p.holderPts) || p.pts;
// earn 型：目前消費地區每幾元累積 1 點（自行填寫時讀回饋率欄位）
function earnPer() {
  const c = currentCard(); if (!c) return 0;
  if (c.custom) return Math.max(0, num('rate'));
  const h = holderOn() && c.holderDom;
  return region === 'overseas' ? (h ? c.holderOvs : c.ovs) : (h ? c.holderDom : c.dom);
}
const customEarn = () => { const s = currentSystem(), c = currentCard(); return !!(s.earn && c && c.custom); };
// 顯示用名稱：比較區、結果區都用這個，兩種選法加入比較時也看得懂是同一件事
function pickLabel() {
  const sys = currentSystem(), c = currentCard(), h = holderOn() && !(c && c.holderLock) ? '＋' + sys.holder.tag : '';
  if (pickMode === 'card') {
    const nm = c.name.replace(/（[^（）]*）$/, '');               // 「其他○○卡片（…）」去掉括號說明
    return nm === sys.short ? nm : `${nm}${h}（${sys.short}）`;
  }
  return `${sys.name}${h}${c && !c.custom ? '・' + c.name : ''}`;
}
function fillPrograms(keepShort) {
  const sys = currentSystem(), card = currentCard();
  if (sys.earn && pickMode === 'sys') { const v = $('earnCard').value; fillEarnCards(sys); if ([...$('earnCard').options].some(o => o.value === v)) $('earnCard').value = v; }
  const opt = ([p, i]) => `<option value="${i}">${p.name}</option>`;
  const items = sys.programs.map((p, i) => [p, i]).filter(([p]) => !p.only || pickMode === 'sys' || (card && card.id === p.only));
  const air = items.filter(([p]) => p.unit !== '點'), hotel = items.filter(([p]) => p.unit === '點');
  $('program').innerHTML = hotel.length
    ? `<optgroup label="航空公司">${air.map(opt).join('')}</optgroup><optgroup label="飯店計畫">${hotel.map(opt).join('')}</optgroup>`
    : items.map(opt).join('');
  if (keepShort) { const hit = items.find(([p]) => p.short === keepShort && !p.only) || items.find(([p]) => p.short === keepShort); if (hit) $('program').value = String(hit[1]); }
  else alignToTicket();
  $('srcNote').textContent = [sys.note, card && card.note, NOTICE].filter(Boolean).join(' ');
  applyMode(sys);
  $('opExtra').hidden = sys.id !== 'openpoint';
  syncPickUI();
}
// 卡別、制度、持卡身分、卡片說明、回饋率欄位的顯示狀態
function syncPickUI() {
  const sys = currentSystem(), card = currentCard(), pc = pickedCard();
  $('earnCardField').hidden = !(pickMode === 'sys' && sys.earn);
  $('schemeField').hidden = !(pc && sysById(pc.sys).alt);
  document.querySelectorAll('#schemeSeg button').forEach(b => b.classList.toggle('on', b.dataset.s === scheme));
  $('holderField').hidden = !sys.holder;
  if (sys.holder) {
    const lock = !!(card && card.holderLock);
    $('holderLabel').textContent = sys.holder.label; $('holderHint').textContent = sys.holder.hint;
    $('holder').disabled = lock; $('holderField').classList.toggle('locked', lock);
    if (lock) $('holder').checked = true;
    else if (lastLock) $('holder').checked = false;   // 從國泰世界卡換成 CUBE 卡時，取消自動勾選
    lastLock = lock;
  }
  const info = $('cardInfo');
  info.hidden = !pc;
  if (pc) {
    const base = sysById(pc.sys);
    let t = pc.info || `這張卡累積：<b>${base.short === pc.name ? base.name : base.short}</b>`;
    if (pc.dom && !pc.custom) {
      const h = holderOn() && pc.holderDom, d = h ? pc.holderDom : pc.dom, o = h ? pc.holderOvs : pc.ovs;
      t += d === o ? `　·　國內外每 ${d} 元累積 1 點` : `　·　國內每 ${d} 元、國外每 ${o} 元累積 1 點`;
    }
    if (pc.custom && !pc.info) t += sys.earn ? '　·　請在下方填寫累積比例' : '　·　回饋率請依你的卡片填寫';
    info.innerHTML = t;
  }
  const fixed = !!sys.earn && !customEarn();
  $('rateField').classList.toggle('is-off', fixed);
  $('rate').disabled = fixed;
  if (customEarn()) {
    $('rateLabel').textContent = '累積比例'; $('rateUnit').textContent = '元';
    $('rateHintTxt').textContent = `每幾元累積 1 點（${region === 'overseas' ? '國外' : '國內'}消費）`;
  } else if (sys.currency !== 'USD') {
    $('rateLabel').textContent = '消費回饋率'; $('rateUnit').textContent = '%';
    $('rateHintTxt').textContent = sys.earn ? '依卡別自動帶入，不需填寫' : (sys.rateHint || '例：3% 輸入 3');
  } else $('rateHintTxt').textContent = sys.rateHint;
}
// 切換選法：保留目前的點數系統、卡別與兌換目標
function setPickMode(m, persist) {
  if (m === pickMode) return;
  const sys = currentSystem(), card = currentCard(), prog = currentProgram();
  pickMode = m;
  if (persist) { try { localStorage.setItem(PICK_KEY, m); } catch (e) {} }
  fillSystems();
  if (m === 'sys') {
    $('system').value = sys.id;
    if (sys.earn) { fillEarnCards(sys); $('earnCard').value = card && !card.custom ? card.id : 'custom'; }
  } else {
    const base = SYSTEMS.find(s => s.alt === sys.id) || sys;     // 2027 新制 → 回到 CUBE 卡＋新制
    if (base !== sys) scheme = '2027'; else if (sys.alt) scheme = 'now';
    const pick = (card && !card.custom && card.sys === base.id && card)
      || (card && card.custom && ALL_CARDS.find(c => c.sys === base.id && c.custom))
      || ALL_CARDS.find(c => c.sys === base.id && !c.custom) || ALL_CARDS[0];
    $('system').value = pick.id;
  }
  fillPrograms(prog && prog.short);
}
/* ---------- OPENPOINT 加贈活動 ---------- */
const opMode = { 1: 'each', 2: 'each' };   // each：每滿 A 元送 B 點；once：單筆滿 A 元送 B 點（只送一次）
function opExtraPoints(sys, spend) {
  if (sys.id !== 'openpoint') return { total: 0, r1: 0, r2: 0 };
  const calc = (n, a, b) => {
    const A = num(a), B = num(b);
    if (A <= 0 || B <= 0 || spend < A) return 0;
    return opMode[n] === 'each' ? Math.floor(spend / A) * B : B;
  };
  const r1 = calc(1, 'opA', 'opB'), r2 = calc(2, 'opC', 'opD');
  return { total: r1 + r2, r1, r2 };
}
function applyMode(sys) {
  // 三種輸入模式：NTD（回饋率 %）、USD（ROVE 回饋倍數）、EARN（自行填寫每幾元累積 1 點），各自記住輸入值
  const next = sys.currency === 'USD' ? 'USD' : customEarn() ? 'EARN' : 'NTD';
  const cur = k => k === 'USD' ? 'USD' : 'NTD';
  if (next !== mode) {
    // ROVE（美元）：付款卡片預設「臺灣信用卡」＝國外消費；離開時恢復原本的消費地區
    if (next === 'USD') { memo.region = region; setRegion('overseas', false); }
    else if (mode === 'USD') setRegion(memo.region || 'domestic', false);
    memo[mode].rate = $('rate').value;
    if (cur(next) !== cur(mode)) { memo[cur(mode)].spend = $('spend').value; $('spend').value = memo[cur(next)].spend; }
    $('rate').value = memo[next].rate;
    mode = next;
  }
  const usd = mode === 'USD';
  $('spendCur').textContent = usd ? 'USD' : 'NTD';
  $('spendSym').textContent = usd ? 'US$' : '$';
  $('spendUnit').textContent = usd ? '美元' : '元';
  $('rateLabel').textContent = usd ? '回饋倍數' : '消費回饋率';
  $('rateUnit').textContent = usd ? '倍' : '%';
  $('rate').step = usd ? '1' : mode === 'EARN' ? '1' : '.1';
  // 付款卡片（ROVE）／消費地區（其他點數系統）：同一組按鈕，文字依模式切換
  $('regionLabel').textContent = usd ? '付款卡片' : '消費地區';
  $('regionHint').textContent = usd ? '臺灣卡刷美元視同國外消費' : '國外消費會加計手續費';
  const bd = document.querySelector('#regionSeg [data-r="domestic"]'), bo = document.querySelector('#regionSeg [data-r="overseas"]');
  bd.textContent = usd ? '美國信用卡' : '國內消費';
  bo.textContent = usd ? '臺灣信用卡' : '國外消費';
  $('regionSeg').classList.toggle('swap', usd);   // ROVE 時把「臺灣信用卡」排在前面
}
/* ---------- 計算 ---------- */
/* ---------- 消費地區（國內／國外）與國外手續費 ----------
   earn 型卡片（匯豐旅人、星展飛行、凱基）依這裡的消費地區自動套用國內／國外累積比例。 */
let region = 'domestic';
function setRegion(r, fromUser) {
  region = r;
  document.querySelectorAll('#regionSeg button').forEach(b => b.classList.toggle('on', b.dataset.r === r));
  $('feeField').hidden = r !== 'overseas';
  if (fromUser) syncPickUI();
}
function compute() {
  const r = computeBase();
  if (!r.ok) return r;
  const fee = region === 'overseas' ? Math.max(0, num('fee')) : 0;
  const k = 1 + fee / 100;              // 實際付出 = 消費金額 ×（1＋手續費），點數／哩程仍以消費金額計算
  r.region = region; r.fee = fee;
  r.perMile *= k; if (r.perMileUSD) r.perMileUSD *= k;
  return r;
}
function computeBase() {
  const sys = currentSystem(), prog = currentProgram();
  const spend = Math.max(0, num('spend')), rate = Math.max(0, num('rate')), bonus = Math.max(0, num('bonus'));
  if (!prog) return { ok: false, msg: `${sys.name} 的兌換比例還沒有資料，補上後就能計算。` };
  const unit = prog.unit || '哩', label = pickLabel();
  if (sys.earn) {                                             // 依卡別每幾元累積 1 點，再依兌換比例轉哩程
    const per = earnPer();
    if (per <= 0) return { ok: false, msg: '請填寫累積比例（每幾元累積 1 點，例：每 18 元輸入 18）。' };
    const points = spend / per;
    const miles = points / prog.pts * prog.miles * (1 + bonus / 100);
    const perMile = per * (prog.pts / prog.miles) / (1 + bonus / 100);
    return { ok: true, sys, prog, unit, label, spend, rate: null, earn: per, bonus, points, miles, perMile,
      ratio: earnRatio(sys, prog, per) };
  }
  if (sys.currency === 'USD') {
    if (rate <= 0) return { ok: false, msg: '請輸入回饋倍數（例：每 1 美元 5 倍輸入 5）。' };
    const pts = spend * rate;                                   // 取得的 ROVE Miles
    const miles = pts / prog.pts * prog.miles * (1 + bonus / 100);
    const perMileUSD = (prog.pts / prog.miles) / rate / (1 + bonus / 100);
    return { ok: true, sys, prog, unit, label, spend, rate, bonus, points: pts, miles, usd: true,
      perMileUSD, perMile: perMileUSD * FX.mid, fx: FX.mid,
      ratio: `${fmt(prog.pts, 2)} ROVE Miles → ${fmt(prog.miles, 2)} ${unit}` };
  }
  if (rate <= 0) return { ok: false, msg: '請輸入消費回饋率（例：3% 輸入 3）。' };
  const extra = opExtraPoints(sys, spend);                    // OPENPOINT 滿額／iCashPay 加贈點數
  const pts = ptsOf(prog);                                    // 世界卡身分：長榮、亞萬、華航套用優惠比例
  const points = spend * rate / 100 + extra.total;
  const miles = points / pts * prog.miles * (1 + bonus / 100);
  const perMile = extra.total > 0 && spend > 0 && miles > 0
    ? spend / miles                                           // 有加贈點數：以實際總點數回推
    : (pts / prog.miles) / (rate / 100) / (1 + bonus / 100);
  return { ok: true, sys, prog, unit, label, spend, rate, bonus, points, miles, perMile, extra: extra.total,
    ratio: `${fmt(pts, 2)} ${sys.unit} → ${fmt(prog.miles, 2)} ${unit}` };
}
function earnRatio(sys, prog, per) {
  const conv = prog.pts === prog.miles ? `1:1 轉${prog.unit === '點' ? '換' : '哩程'}` : `${fmt(prog.pts, 2)} 點 → ${fmt(prog.miles, 2)} ${prog.unit || '哩'}`;
  return `每 ${per ? fmt(per, 2) : '?'} 元 → 1 點，${conv}`;
}

function render() { renderCore(); renderTicket(); }
function renderCore() {
  const r = compute(), msg = $('calcMsg');
  const prog = currentProgram();
  const csys = currentSystem();
  $('ratioOut').textContent = prog
    ? (csys.earn ? earnRatio(csys, prog, earnPer()) : `${fmt(ptsOf(prog), 2)} ${csys.unit || '點'} → ${fmt(prog.miles, 2)} ${prog.unit || '哩'}`)
    : '資料待補';
  const pl = planOf(prog); $('planOut').hidden = !pl; $('planOut').textContent = pl ? '哩程計畫：' + pl : '';
  $('ratioHint').textContent = csys.earn ? '依卡別累積比例與兌換比例自動帶入' : '依兌換比例表自動帶入';
  const isUSD = currentSystem().currency === 'USD';
  $('fxNote').hidden = !isUSD;
  if (isUSD) $('fxNote').textContent = FX.buy
    ? `匯率 1 美元 = NT$ ${fmt(FX.mid, 3)}（${FX.source}，買入 ${FX.buy}／賣出 ${FX.sell} 平均，${FX.posted} 掛牌）`
    : `匯率 1 美元 = NT$ ${fmt(FX.mid, 3)}（${FX.source}，${FX.posted} 更新）`;
  $('speedSub').hidden = true;
  if (!r.ok) {
    msg.textContent = r.msg; msg.hidden = false;
    ['milesOut', 'perMileOut'].forEach(id => $(id).textContent = '—');
    $('pointsOut').textContent = '—'; $('targetOut').textContent = pickLabel();
    $('spendOut').textContent = (isUSD ? 'US$ ' : 'NT$ ') + fmt(num('spend'));
    $('addCompare').disabled = true; return;
  }
  msg.hidden = true;
  $('milesOut').textContent = fmt(Math.floor(r.miles));
  $('unitOut').textContent = r.unit === '哩' ? 'miles' : 'points';
  $('unitOut2').textContent = r.unit;
  $('perMileOut').textContent = fmt2(r.perMile);
  $('targetOut').textContent = `${r.label} → ${r.prog.short}`;
  if (r.extra > 0) $('pointsOut').innerHTML = `${fmt(r.points, 2)} 點<small class="sub-val">含活動加贈 ${fmt(r.extra)} 點</small>`;
  else $('pointsOut').textContent = r.points == null ? '不適用' : fmt(r.points, 2) + (r.usd ? ' ROVE Miles' : ' ' + (r.sys.earn ? r.sys.unit : '點'));
  if (r.sys.id === 'openpoint') {
    const e = opExtraPoints(r.sys, r.spend);
    $('opSum').textContent = e.total > 0
      ? `加贈合計 ${fmt(e.total)} 點（滿額 ${fmt(e.r1)} 點＋iCashPay ${fmt(e.r2)} 點），已計入每哩成本。`
      : '目前沒有加贈點數。';
  }
  if (r.usd) $('spendOut').innerHTML = `US$ ${fmt(r.spend)}<small class="sub-val">約 NT$ ${fmt(r.spend * r.fx)}</small>`;
  else $('spendOut').textContent = 'NT$ ' + fmt(r.spend);
  if (r.fee > 0) $('spendOut').insertAdjacentHTML('beforeend', `<small class="sub-val">含國外手續費 ${fmt(r.fee, 2)}%：實付 ${r.usd ? 'US$ ' + fmt(r.spend * (1 + r.fee / 100), 2) : 'NT$ ' + fmt(r.spend * (1 + r.fee / 100))}</small>`);
  if (r.usd) { $('speedSub').hidden = false; $('speedSub').textContent = `約 US$ ${fmt(r.perMileUSD, 3)} = 1 ${r.unit}，依當日匯率換算成臺幣`; }
  $('addCompare').disabled = compare.length >= MAX;
}

/* ---------- 比較區 ---------- */
function addCompare() {
  const r = compute();
  if (!r.ok || compare.length >= MAX) return;
  compare.push({
    sys: r.label, prog: r.prog.short, unit: r.unit, ratio: r.ratio, earn: r.earn || null,
    rate: r.rate, bonus: r.bonus, spend: r.spend, miles: r.miles, perMile: r.perMile,
    usd: !!r.usd, perMileUSD: r.perMileUSD || null, extra: r.extra || 0, fee: r.fee || 0, fixed: !!r.prog.any, plan: planOf(r.prog),
    tk: ticket ? { id: ticket.award.id, match: ticket.award.match, miles: ticket.miles, tax: ticket.tax, label: ticket.label } : null,
  });
  save(); renderCompare(); render();
  document.getElementById('compare').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
/* 比較區排序：依總花費（有任何一列算出換票總成本時的預設）／依累積速度。字母 A、B、C 代表加入順序，排序後不變。 */
const SORT_KEY = 'cardsandyou-cmp-sort';
let cmpSort = null;                             // null＝自動：有總花費就依總花費，否則依累積速度
try { cmpSort = localStorage.getItem(SORT_KEY); } catch (e) {}
function costOf(c) {                            // 這一列換自己那張機票的總成本；沒有機票或兌換目標不符時為 null
  const t = c.tk; if (!t) return null;
  if (!(t.id === 'custom' || c.fixed || t.match.some(k => c.prog.includes(k)))) return null;
  const spend = Math.ceil(t.miles * c.perMile - 1e-6), tax = t.tax || 0;
  return { spend, tax, total: spend + tax };
}
function renderCompare() {
  const ct = $('cmpTicket');                    // 還沒有任何一列記錄機票時，提示可以先選目標機票
  if (ct) { ct.hidden = !compare.length || compare.some(c => c.tk);
    ct.textContent = '想看換票總成本？在上方選好目標機票，再把方案加入比較。'; }
  $('slotCount').textContent = `${compare.length} / ${MAX}`;
  $('compareEmpty').hidden = compare.length > 0;
  $('clearCompare').hidden = compare.length === 0;
  const rows = compare.map((c, i) => ({ c, i, cost: costOf(c) }));
  const costRows = rows.filter(r => r.cost);
  const mode = costRows.length ? (cmpSort === 'speed' ? 'speed' : 'cost') : 'speed';
  $('cmpSort').hidden = !costRows.length;
  $('cmpSort').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.s === mode));
  $('cmpDesc').textContent = mode === 'cost'
    ? '依換票總成本由低到高排列，長條為換票總成本（消費金額＋稅金與燃油附加費），越短越省。'
    : '每消費幾元可換 1 哩，數字越小代表累積越快。長條為每消費 1 萬元可得的哩程。';
  $('cmpNote').hidden = costRows.length < 2;
  const per10k = c => 10000 / c.perMile;
  const maxSpeed = Math.max(...compare.map(per10k), 1), maxCost = Math.max(...costRows.map(r => r.cost.total), 1);
  const fastest = compare.length > 1 ? Math.min(...compare.map(c => c.perMile)) : null;
  const mostMiles = compare.length > 1 ? Math.max(...compare.map(c => Math.floor(c.miles))) : null;   // 「累積最多哩程」：可得哩程最多的一列
  const cheapest = costRows.length > 1 ? Math.min(...costRows.map(r => r.cost.total)) : null;
  if (mode === 'cost') rows.sort((a, b) => (a.cost ? a.cost.total : Infinity) - (b.cost ? b.cost.total : Infinity) || a.i - b.i);
  else rows.sort((a, b) => a.c.perMile - b.c.perMile || a.i - b.i);
  $('compareList').innerHTML = rows.map(({ c, i, cost }) => {
    const cond = [c.usd ? (c.fee ? `臺灣卡付款 · 手續費 ${fmt(c.fee, 2)}%` : '美國卡付款 · 免手續費') : (c.fee ? `國外消費 · 手續費 ${fmt(c.fee, 2)}%` : ''),c.usd ? `每 1 美元 ${fmt(c.rate, 2)} 倍` : (c.rate != null ? `回饋 ${fmt(c.rate, 2)}%` : ''),
      c.extra ? `活動加贈 ${fmt(c.extra)} 點` : '', c.bonus ? `加成 ${fmt(c.bonus, 1)}%` : '', c.usd ? `消費 US$ ${fmt(c.spend)}` : `消費 NT$ ${fmt(c.spend)}`].filter(Boolean).join('　·　');
    const isFast = fastest != null && c.perMile === fastest, isCheap = cheapest != null && cost && cost.total === cheapest;
    const hi = mode === 'cost' ? isCheap : isFast;
    const isMost = mostMiles != null && Math.floor(c.miles) === mostMiles;
    const canRedeem = cost && c.miles >= c.tk.miles;                // 這組消費累積的哩程已經夠換這張機票
    const tags = (isCheap ? '<em class="tag-cheap">總花費最低</em>' : '') + (isMost ? '<em>累積最多哩程</em>' : '')
      + (canRedeem ? '<em class="tag-ok">恭喜！已經可換機票</em>' : '');
    const bar = mode === 'cost'
      ? (cost ? `<div class="cmp-bar"><div class="track"><i style="width:${(cost.total / maxCost * 100).toFixed(1)}%"></i></div><span>換票總成本 NT$ ${fmt(cost.total)}</span></div>`
              : '<div class="cmp-bar none"><div class="track"></div><span>未算出總成本</span></div>')
      : `<div class="cmp-bar"><div class="track"><i style="width:${(per10k(c) / maxSpeed * 100).toFixed(1)}%"></i></div><span>每消費 NT$ 1 萬 ≈ ${fmt(per10k(c))} ${c.unit}</span></div>`;
    return `<li class="cmp${hi ? ' best' : ''}${mode === 'cost' && !cost ? ' nocost' : ''}">
      <span class="cmp-no">${String.fromCharCode(65 + i)}</span>
      <div class="cmp-info"><b>${c.sys} → ${c.prog}${tags}</b><small>${c.plan ? c.plan + '　·　' : ''}${c.ratio}　·　${cond}</small>
        ${ticketLine(c, cost, cheapest)}${bar}</div>
      <div class="cmp-speed"><small>每消費</small><strong>${fmt2(c.perMile)}</strong><small>元 = 1 ${c.unit}</small>${c.usd ? `<small class="cmp-usd">約 US$ ${fmt(c.perMileUSD, 3)}</small>` : ''}</div>
      <div class="cmp-miles"><small>可得</small><strong>${fmt(Math.floor(c.miles))}</strong><small>${c.unit}</small></div>
      <button class="cmp-del" type="button" data-i="${i}" aria-label="移除 ${String.fromCharCode(65 + i)}">×</button></li>`;
  }).join('');
}
function resetCalc() {
  setRegion('domestic', false); $('fee').value = '1.5';
  scheme = 'now'; $('holder').checked = false; memo.EARN.rate = '';
  $('system').value = $('system').options[0].value; fillPrograms();
  $('spend').value = ''; $('rate').value = ''; $('bonus').value = '0';
  memo.USD = { spend: '', rate: '' };
  ['opA', 'opB', 'opC', 'opD'].forEach(id => $(id).value = '');
  render(); $('spend').focus();
}

/* ---------- 綁定事件 ---------- */
fillSystems(); fillPrograms();
$('system').addEventListener('change', () => { const p = currentProgram(); fillPrograms(p && p.short); render(); });
$('program').addEventListener('change', render);
$('earnCard').addEventListener('change', () => { fillPrograms((currentProgram() || {}).short); render(); });
$('holder').addEventListener('change', () => { syncPickUI(); render(); });
$('pickSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; setPickMode(b.dataset.m, true); render(); });
$('schemeSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b || b.dataset.s === scheme) return;
  const p = currentProgram(); scheme = b.dataset.s; fillPrograms(p && p.short); render(); });
$('regionSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; setRegion(b.dataset.r, true); render(); });
$('fee').addEventListener('input', render);
['rate', 'bonus', 'opA', 'opB', 'opC', 'opD'].forEach(id => $(id).addEventListener('input', render));
$('opClear').addEventListener('click', () => { ['opA', 'opB', 'opC', 'opD'].forEach(id => $(id).value = '0'); render(); });
document.querySelectorAll('.op-seg').forEach(seg => seg.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  opMode[seg.dataset.row] = b.dataset.m;
  seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
  render();
}));
$('addCompare').addEventListener('click', addCompare);
$('cmpSort').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return;
  cmpSort = b.dataset.s; try { localStorage.setItem(SORT_KEY, cmpSort); } catch (err) {} renderCompare(); });
$('resetCalc').addEventListener('click', resetCalc);
$('clearCompare').addEventListener('click', () => { compare = []; save(); renderCompare(); render(); });
$('compareList').addEventListener('click', e => {
  const b = e.target.closest('.cmp-del'); if (!b) return;
  compare.splice(+b.dataset.i, 1); save(); renderCompare(); render();
});
// 消費金額：輸入時自動加上千分位逗號（滿千一個逗號、滿百萬兩個逗號）
(function () {
  const el = $('spend');
  el.addEventListener('input', () => {
    const pos = el.selectionStart || 0;
    const digitsBefore = el.value.slice(0, pos).replace(/\D/g, '').length;
    const digits = el.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
    el.value = digits ? Number(digits).toLocaleString('en-US') : '';
    let i = 0, c = 0;
    while (i < el.value.length && c < digitsBefore) { if (/\d/.test(el.value[i])) c++; i++; }
    el.setSelectionRange(i, i);
    render();
  });
})();
renderCompare(); render();

// 有設定 FX_URL 時，讀取每日更新的匯率檔（失敗就沿用內建值）
if (FX_URL) {
  fetch(FX_URL, { cache: 'no-store' }).then(r => r.ok ? r.json() : Promise.reject())
    .then(d => { if (d && d.mid > 0) { FX = Object.assign({}, FX, d); render(); } })
    .catch(() => {});
}

/* ---------- 換算成機票 ----------
   需要消費 = 所需哩程 × 每哩成本（每消費幾元換 1 哩）；稅金另外以現金支付。 */
const AWARDS = [
  { id: 'none', name: '請選擇', match: [], routes: [] },   // 預設不帶入機票，避免比較區被預設航線綁住
  { id: 'eva', name: '無限萬哩遊（長榮航班）', match: ['長榮'], base: 'rt',
    src: '長榮／立榮航班、臺灣出發，依長榮航空官網兌換表（2026 年 8 月）；單程為來回的一半。',
    routes: [
      { name: '臺灣－香港／澳門', y: 20000, pe: null, c: 50000 },
      { name: '亞洲區域內（日韓、東南亞、中國等）', y: 35000, pe: 40000, c: 50000 },
      { name: '歐洲', y: 100000, pe: 110000, c: 150000 },
      { name: '美洲（美西等）', y: 100000, pe: 110000, c: 150000 },
      { name: '美洲（芝加哥、紐約、休士頓、達拉斯、華盛頓、多倫多）', y: 110000, pe: 120000, c: 160000 },
      { name: '大洋洲', y: 100000, pe: null, c: 150000 },
    ]},
  { id: 'asia', name: '亞洲萬里通（國泰航班）', match: ['亞洲萬里通', '國泰'], base: 'ow',
    src: '國泰航空航班，依 2026/5/1 起的兌換標準（國泰官方未公布完整表，整理自公開資料）；來回為單程的兩倍。',
    routes: [
      { name: '臺北－香港', y: 7000, pe: 11000, c: 16000 },
      { name: '臺北－日本', y: 13000, pe: 23000, c: 33000 },
      { name: '臺北－歐洲（經香港，如倫敦、巴黎）', y: 27000, pe: 52000, c: 91000 },
      { name: '臺北－北美西岸（經香港，如溫哥華、舊金山）', y: 27000, pe: 52000, c: 91000 },
    ]},
  // 華航：2026/9/16 新制，同一航段依座位供需分三級（陣列依序為 充足／有限／稀少（候補）），表為來回
  { id: 'ci', name: '華夏哩程（華航航班）', match: ['中華航空'], base: 'rt',
    tiers: ['充足', '有限', '稀少（候補）'], tierHint: '依開票時的座位供需而定',
    tierNote: '華航依座位供需分為充足、有限、稀少（候補）三級，實際所需哩程以開票時為準。',
    src: '華航及華信航班，依 2026/9/16 起的新制兌換標準（依開票日適用）；單程為來回的一半。',
    routes: [
      { name: '臺灣－亞洲（一）：香港、廈門、福州', y: [18000, 19000, 20000], pe: null, c: [50000, 50000, 60000] },
      { name: '臺灣－亞洲（二）：福岡、沖繩、新加坡、上海等', y: [30000, 32000, 35000], pe: [40000, 50000, 60000], c: [55000, 70000, 80000] },
      { name: '臺灣－亞洲（三）：東京、大阪、首爾、曼谷等', y: [35000, 38000, 40000], pe: [40000, 50000, 60000], c: [60000, 75000, 90000] },
      { name: '亞洲－紐澳', y: [80000, 90000, 105000], pe: [110000, 120000, 130000], c: [150000, 170000, 190000] },
      { name: '亞洲－北美（紐約以外）', y: [80000, 90000, 105000], pe: [120000, 135000, 150000], c: [160000, 180000, 200000] },
      { name: '亞洲－紐約', y: [90000, 100000, 110000], pe: [120000, 145000, 160000], c: [160000, 190000, 210000] },
      { name: '亞洲－歐洲', y: [90000, 105000, 110000], pe: [120000, 130000, 140000], c: [160000, 190000, 210000] },
    ]},
  // 新航：Saver／Advantage 為固定兌換表，Access 為動態計價（商務艙觀察到四級，這裡取最低級），表為單程
  { id: 'sq', name: 'KrisFlyer（新航航班）', match: ['新加坡航空'], base: 'ow',
    tiers: ['Saver', 'Advantage', 'Access'], tierHint: 'Saver、Advantage 為固定價格，Access 為動態計價',
    src: '新加坡航空航班，依 KrisFlyer 2025/11 改制後的兌換表（單程，來回為兩倍）；Access 為 2026/3 調整後觀察到的價格，新航可能隨時調整。經新加坡轉機到其他地區請用「自行輸入」。',
    routes: [
      { name: '臺北－新加坡', y: [15500, 33000, 47500], pe: null, c: [35500, 57500, 74500],
        accessNote: { c: 'Access 為動態計價，商務艙可能為 74,500／89,000／107,000／118,500 哩（單程），這裡以最低級計算。' } },
    ]},
  { id: 'custom', name: '自行輸入（其他航空／航段）', match: [], routes: [] },
];
const CABINS = [['y', '經濟艙'], ['pe', '豪華（特選）經濟艙'], ['c', '商務艙']];
var tkTrip = 1, tkTier = 0, ticket = null;   // 用 var：比較區在初始化前就會呼叫 ticketLine
// 航段某艙等的所需哩程：有價格等級的計畫（華航、新航）是陣列，依目前選的等級取值
const tkVal = (r, cab) => { const v = r && r[cab]; return Array.isArray(v) ? v[tkTier] : v; };
// 價格等級的顯示名稱（比較表、機票名稱用）；新航 Access 商務艙有多級，標示為最低級
function tkTierLabel(a, r, cab) {
  if (!a.tiers) return '';
  const t = a.tiers[tkTier];
  return r && r.accessNote && r.accessNote[cab] && t === 'Access' ? 'Access（最低級）' : t;
}
function tkFillTiers() {
  const a = tkAward(), f = $('tkTierField');
  f.hidden = !a.tiers;
  if (!a.tiers) return;
  if (tkTier >= a.tiers.length) tkTier = 0;
  $('tkTier').style.gridTemplateColumns = `repeat(${a.tiers.length},1fr)`;
  $('tkTier').innerHTML = a.tiers.map((t, i) => `<button type="button" data-i="${i}"${i === tkTier ? ' class="on"' : ''}>${t}</button>`).join('');
  $('tkTierHint').textContent = a.tierHint || '';
}
const tkAward = () => AWARDS.find(a => a.id === $('tkProg').value) || AWARDS[0];
function tkFillProg() { $('tkProg').innerHTML = AWARDS.map(a => `<option value="${a.id}">${a.name}</option>`).join(''); }
function tkFillRoutes() {
  const a = tkAward(), custom = a.id === 'custom', none = a.id === 'none';
  $('tkRoute').innerHTML = none ? '<option value="">請先選擇哩程計畫</option>' : custom ? '<option value="">自行輸入哩程</option>' : a.routes.map((r, i) => `<option value="${i}">${r.name}</option>`).join('');
  $('tkRoute').disabled = custom || none;
  $('tkRouteBox').hidden = custom; $('tkRouteTxtBox').hidden = !custom; $('tkAirField').hidden = !custom;   // 自行輸入：航空公司、航段自己寫
  tkFillTiers();
  tkFillCabins();
}
function tkFillCabins() {
  const a = tkAward(), r = a.routes[+$('tkRoute').value];
  const keep = $('tkCabin').value;
  $('tkCabin').innerHTML = CABINS.map(([k, n]) => `<option value="${k}"${r && r[k] == null ? ' disabled' : ''}>${n}${r && r[k] == null ? '（無此艙等）' : ''}</option>`).join('');
  $('tkCabin').value = r && r[keep] != null ? keep : (r && r.c != null ? 'c' : 'y');
  if (a.id === 'custom') $('tkCabin').value = keep || 'c';
  $('tkCabin').disabled = a.id === 'none';
  tkAutoMiles();
}
function tkAutoMiles() {
  const a = tkAward(), r = a.routes[+$('tkRoute').value], cab = $('tkCabin').value;
  if (a.id === 'none') {
    $('tkMiles').value = ''; $('tkMiles').readOnly = true; $('tkMilesHint').textContent = '請先選擇哩程計畫';
    $('tkSrc').textContent = '選好哩程計畫與航線後，下方算出每哩成本，就會告訴你換這張機票要花多少。'; return;
  }
  $('tkMiles').readOnly = a.id !== 'custom';
  $('tkMilesHint').textContent = a.id === 'custom' ? '請輸入兌換所需哩程' : '依兌換表自動帶入';
  if (a.id !== 'custom' && r && r[cab] != null) {
    const base = tkVal(r, cab);
    const miles = a.base === 'rt' ? base / 2 * tkTrip : base * tkTrip;   // 長榮表為來回、亞萬表為單程
    $('tkMiles').value = fmt(miles);
  }
  $('tkSrc').textContent = a.src || '自行輸入的哩程請依各計畫實際開票時的需求填寫。';
}
function renderTicket() {
  if (!window.__tkReady) return;
  const r = compute(), a = tkAward();
  const miles = num('tkMiles'), tax = num('tkTax');
  const cabin = (CABINS.find(c => c[0] === $('tkCabin').value) || [, ''])[1];
  const trip = tkTrip === 2 ? '來回' : '單程';
  const label = a.id === 'custom'
    ? [$('tkAir').value.trim() || '其他航空', $('tkRouteTxt').value.trim() || '自訂航段', cabin, trip].join('・')
    : [a.name, $('tkRoute').selectedOptions[0]?.text || '', cabin, trip, tkTierLabel(a, a.routes[+$('tkRoute').value], $('tkCabin').value)].filter(Boolean).join('・');
  ticket = a.id !== 'none' && miles > 0 ? { award: a, miles, tax, label } : null;
  // 提醒：計算機的兌換目標與機票所屬哩程計畫不同
  const warn = $('tkWarn');
  if (r.ok && a.match.length && !r.prog.any && !a.match.some(k => (r.prog.name + r.prog.short).includes(k))) {
    warn.hidden = false; warn.textContent = `提醒：下方計算機目前是換「${r.prog.short}」，跟這張機票的「${a.name}」不同，算出來的金額僅供參考。`;
  } else warn.hidden = true;
  if (!r.ok || !ticket) {
    $('tkResult').innerHTML = `<div class="tk-empty">${a.id === 'none' ? '請先選擇哩程計畫與航線（選填）。' : !r.ok ? '請在下方哩程計算機算出每哩成本。' : '請選擇航線或輸入所需哩程。'}</div>`;
  } else {
    const spend = miles * r.perMile;
    $('tkResult').innerHTML = `<div class="tk-main"><small>換這張機票需要消費</small><strong>NT$ ${fmt(Math.ceil(spend - 1e-6))}</strong>
      <span>${fmt(miles)} 哩 × 每 ${fmt2(r.perMile)} 元 1 哩</span>${tkNote(a) ? `<em class="tk-note">${tkNote(a)}</em>` : ''}</div>
      <div class="tk-side"><div><small>另付稅金與燃油附加費</small><b>${tax > 0 ? 'NT$ ' + fmt(tax) : '未填寫'}</b></div>
      <div><small>機票</small><b class="tk-label">${label}</b></div></div>`;
  }
  renderCompare();
}
// 價格等級的補充說明（華航三級、新航 Access 的級距）
function tkNote(a) {
  if (!a.tiers) return '';
  const r = a.routes[+$('tkRoute').value], cab = $('tkCabin').value;
  if (a.tiers[tkTier] === 'Access' && r && r.accessNote && r.accessNote[cab]) return r.accessNote[cab];
  return a.tierNote || '';
}
// 每一列使用「加入比較當下」選的機票（c.tk），換了上方機票也不影響已加入的列
function ticketLine(c, cost, cheapest) {
  const t = c.tk; if (!t) return '';
  if (cost === undefined) cost = costOf(c);
  if (!cost) return `<small class="cmp-ticket off">目標機票：${t.label}・所需 ${fmt(t.miles)} 哩　·　兌換目標不同，不適用</small>`;
  const diff = cheapest != null && cost.total > cheapest ? `<span class="cmp-diff">比最低多 NT$ ${fmt(cost.total - cheapest)}</span>` : '';
  return `<small class="cmp-ticket"><span class="cmp-tk-label">目標機票：${t.label}・所需 ${fmt(t.miles)} 哩</span>換這張機票的總成本 <b>NT$ ${fmt(cost.total)}</b>${diff}<span class="cmp-ticket-sub">（消費金額 NT$ ${fmt(cost.spend)}＋稅金與燃油附加費 ${cost.tax ? 'NT$ ' + fmt(cost.tax) : '未填寫'}）</span></small>`;
}
(function initTicket() {
  window.__tkReady = true;
  tkFillProg(); tkFillRoutes();
  $('tkProg').addEventListener('change', () => {
    tkTier = 0;                                                     // 換哩程計畫：價格等級回到預設（華航充足、新航 Saver）
    if (tkAward().id === 'custom') ['tkAir', 'tkRouteTxt', 'tkMiles'].forEach(id => $(id).value = '');   // 切到自行輸入：不沿用上一條航線的哩程
    tkFillRoutes(); alignToTicket(); render(); });
  $('tkRoute').addEventListener('change', () => { tkFillCabins(); render(); });
  $('tkCabin').addEventListener('change', () => { tkAutoMiles(); render(); });
  $('tkTier').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return;
    tkTier = +b.dataset.i; $('tkTier').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); tkAutoMiles(); render(); });
  $('tkTrip').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return;
    tkTrip = +b.dataset.t; $('tkTrip').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); tkAutoMiles(); render(); });
  // 清空：自行輸入時航空公司、航段、哩程、稅金全部清空；內建航線只清稅金，所需哩程回到該航線的數字
  $('tkClear').addEventListener('click', () => {
    $('tkTax').value = '';
    if (tkAward().id === 'custom') { ['tkAir', 'tkRouteTxt', 'tkMiles'].forEach(id => $(id).value = ''); $('tkAir').focus(); } else tkAutoMiles();
    render();
  });
  ['tkAir', 'tkRouteTxt'].forEach(id => $(id).addEventListener('input', render));
  ['tkMiles', 'tkTax'].forEach(id => $(id).addEventListener('input', () => {
    const el = $(id), d = el.value.replace(/\D/g, ''); el.value = d ? Number(d).toLocaleString('en-US') : ''; render(); }));
  render();
})();

/* ---------- 選好目標機票後，計算機自動對齊兌換目標 ----------
   例：機票選長榮 → 小樹點自動切到「長榮航空（其他卡）」；之後換點數系統也優先選長榮。
   使用者自己在第二層選單改選，則以使用者的選擇為準。 */
function alignToTicket() {
  if (!window.__tkReady) return;
  const a = tkAward(); if (!a.match.length) return;
  const sys = currentSystem(), cur = currentProgram();
  const hit = p => a.match.some(k => (p.name + p.short).includes(k));
  if (cur && hit(cur)) return;
  const shown = new Set([...$('program').options].map(o => o.value));   // 只挑選單上有的選項（環球無限卡專屬等）
  const cands = sys.programs.map((p, i) => [p, i]).filter(([p, i]) => hit(p) && shown.has(String(i)));
  if (!cands.length) return;
  const pick = cands.find(([p]) => !/世界卡|環球/.test(p.name)) || cands[0];
  $('program').value = String(pick[1]);
}

/* ---------- 網址預設情境（首頁「熱門情境」使用） ----------
   用卡片選：?card=卡片 id　用點數系統選：?sys=點數系統 id（earn 型可加 &earn=卡片 id）
   其他參數：&to=兌換目標（例：長榮航空）&scheme=2027 &holder=1（世界卡／財管會員）&region=overseas &rate=回饋率
   &tk=哩程計畫:航線序號:艙等（y／pe／c）:價格等級序號（選填，華航／新航用）。舊網址的 ?sys=…&prog=序號 仍可使用。網址參數不會改變讀者記住的選法。
   分享連結另外會帶：&spend=消費金額 &bonus=加成 &fee=國外手續費 &opA～opD／&opm=each,once（OPENPOINT 加贈）
   &trip=2（來回）&tax=稅金 &tkmiles／&tkair／&tkroute（自行輸入的機票）&from=share（開啟後捲到計算機） */
(function applyPreset() {
  const q = new URLSearchParams(location.search); if (![...q.keys()].length) return;
  const tk = (q.get('tk') || '').split(':');
  if (q.get('trip') === '2') {                                  // 來回：要在自動帶入哩程之前設定
    tkTrip = 2; $('tkTrip').querySelectorAll('button').forEach(x => x.classList.toggle('on', x.dataset.t === '2'));
  }
  if (tk[0] && AWARDS.some(a => a.id === tk[0])) {
    $('tkProg').value = tk[0]; tkTier = +tk[3] || 0; tkFillRoutes();
    if (tk[1]) { $('tkRoute').value = tk[1]; tkFillCabins(); }
    if (tk[2]) { $('tkCabin').value = tk[2]; tkAutoMiles(); }
    if (tk[0] === 'custom') {
      const n = v => { const d = String(v || '').replace(/\D/g, ''); return d ? Number(d).toLocaleString('en-US') : ''; };
      $('tkMiles').value = n(q.get('tkmiles'));
      $('tkAir').value = (q.get('tkair') || '').slice(0, 30);
      $('tkRouteTxt').value = (q.get('tkroute') || '').slice(0, 40);
    }
    if (q.get('tax')) $('tkTax').value = Number(String(q.get('tax')).replace(/\D/g, '') || 0).toLocaleString('en-US');
  }
  const qc = q.get('card'), qs = q.get('sys') === 'kgiwm' ? 'kgi' : q.get('sys');
  if (q.get('scheme') === '2027') scheme = '2027';
  if (q.get('holder') === '1' || q.get('sys') === 'kgiwm') $('holder').checked = true;
  if (q.get('region') === 'overseas' || q.get('region') === 'domestic') setRegion(q.get('region'), false);
  if (qc && cardById(qc)) { setPickMode('card', false); $('system').value = qc; fillPrograms(); }
  else if (qs && sysById(qs)) {
    setPickMode('sys', false); $('system').value = qs; fillPrograms();
    if (q.get('earn') && [...$('earnCard').options].some(o => o.value === q.get('earn'))) { $('earnCard').value = q.get('earn'); fillPrograms(); }
  }
  const sys = currentSystem(), to = q.get('to'), pi = q.get('prog');
  const shown = v => [...$('program').options].some(o => o.value === String(v));
  if (to) { const i = sys.programs.findIndex((p, k) => (p.short === to || p.name === to) && shown(k)); if (i >= 0) $('program').value = String(i); }
  else if (pi != null && shown(pi)) $('program').value = pi;
  if (q.get('rate')) $('rate').value = q.get('rate');
  // 分享連結帶的其他欄位（要在 fillPrograms 之後設定，避免被切換模式時的記憶值蓋掉）
  if (q.get('region') === 'overseas' || q.get('region') === 'domestic') setRegion(q.get('region'), false);
  if (q.get('spend')) { const d = String(q.get('spend')).replace(/[^\d]/g, ''); $('spend').value = d ? Number(d).toLocaleString('en-US') : ''; }
  if (q.get('bonus')) $('bonus').value = q.get('bonus');
  if (q.get('fee')) $('fee').value = q.get('fee');
  ['opA', 'opB', 'opC', 'opD'].forEach(id => { if (q.get(id)) $(id).value = q.get(id); });
  (q.get('opm') || '').split(',').forEach((m, i) => {
    if (m !== 'each' && m !== 'once') return;
    opMode[i + 1] = m;
    document.querySelectorAll(`.op-seg[data-row="${i + 1}"] button`).forEach(b => b.classList.toggle('on', b.dataset.m === m));
  });
  syncPickUI(); render();
  if (q.get('from') === 'share') setTimeout(() => { const el = $('calc-main'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 350);
})();

/* ---------- 分享：參數連結與分享圖 ----------
   分享連結：把目前所有欄位寫成網址參數（applyPreset 會讀回來），朋友打開就是同一組試算。
   分享圖：用 canvas 畫一張 1080 寬的直式圖卡（IG／Threads 適用），手機可直接叫出分享選單，電腦則下載。
   不需要任何外部套件；按鈕與樣式都由這段程式加到頁面上。
   開關與文字在 Publii「主題設定 → 計算機」，由 page-calculator.hbs 寫進 window.CY_SHARE；沒有設定時全部開啟。 */
(function initShare() {
  const CFG = Object.assign({ link: true, image: true, compare: true, site: 'cardsandyou.com/calculator', note: '試算僅供參考，以官方公告為準' }, window.CY_SHARE || {});
  if (!CFG.link && !CFG.image && !CFG.compare) return;
  const SITE = String(CFG.site || '').trim() || 'cardsandyou.com/calculator';
  const NOTE = String(CFG.note || '').trim();
  const C = { green: '#123d32', green2: '#245744', cream: '#f6f2df', gold: '#c7a45a', goldlite: '#e5d4a3', soft: '#c3d2c4' };
  const TC = '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif';
  const NUM = '"DM Sans", ' + TC;

  /* ---- 樣式 ---- */
  const css = document.createElement('style');
  css.textContent = `
.share-bar{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px;position:relative;z-index:1}
.share-bar.one{grid-template-columns:1fr}
.share-bar button{display:flex;justify-content:center;gap:6px;cursor:pointer;margin:0;padding:12px 10px;border:1px solid rgba(229,212,163,.5);background:rgba(255,255,255,.06);color:${C.cream};font:700 14px "Noto Sans TC",sans-serif}
.share-bar button:hover{background:rgba(255,255,255,.13);border-color:${C.goldlite}}
.cmp-acts{display:flex;gap:10px;flex-shrink:0}
.compare button.cmp-img{white-space:nowrap}
.cy-share{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(10,30,24,.72)}
.cy-share[hidden]{display:none}
.cy-share-box{position:relative;width:min(440px,100%);max-height:calc(100vh - 32px);overflow:auto;background:#f7f6ef;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.35)}
.cy-share-box h4{margin:0 0 12px;color:${C.green};font:700 18px "Noto Sans TC",sans-serif}
.cy-share-box img{display:block;width:100%;height:auto;border:1px solid #dce4d9;background:${C.green}}
.cy-share-load{display:flex;align-items:center;justify-content:center;aspect-ratio:4/5;background:${C.green};color:${C.goldlite};font:600 14px "Noto Sans TC",sans-serif}
.cy-share-acts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}
.cy-share-acts button{cursor:pointer;margin:0;padding:12px 10px;border:1px solid ${C.green};background:${C.green};color:#fff;font:700 14px "Noto Sans TC",sans-serif;display:flex;justify-content:center}
.cy-share-acts button.alt{background:transparent;color:${C.green}}
.cy-share-acts button[hidden]{display:none}
.cy-share-acts button:only-child,.cy-share-acts .wide{grid-column:1/-1}
.cy-share-tip{margin:12px 0 0;color:#738176;font-size:12px;line-height:1.6}
.cy-x{position:absolute;top:10px;right:10px;width:34px!important;height:34px;margin:0!important;padding:0!important;border:0!important;background:transparent!important;color:${C.green}!important;font:400 26px/1 sans-serif!important;cursor:pointer;justify-content:center}
.cy-toast{position:fixed;left:50%;bottom:28px;z-index:1001;transform:translateX(-50%);padding:11px 18px;background:${C.green};color:${C.cream};border:1px solid ${C.gold};font:600 14px "Noto Sans TC",sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25);transition:opacity .25s}
.cy-toast[hidden]{display:none}
@media (max-width:640px){.compare-head{flex-wrap:wrap}.cmp-acts{width:100%}.cmp-acts button{flex:1}}`;
  document.head.appendChild(css);

  /* ---- 按鈕 ---- */
  if (CFG.link || CFG.image) {
    const bar = document.createElement('div');
    bar.className = 'share-bar' + (CFG.link && CFG.image ? '' : ' one');
    bar.innerHTML = (CFG.link ? '<button type="button" id="shareLink">🔗 分享這組試算</button>' : '')
      + (CFG.image ? '<button type="button" id="shareImg">🖼 產生分享圖</button>' : '');
    document.querySelector('.results').appendChild(bar);
  }
  if (CFG.compare) {
    const acts = document.createElement('div');
    acts.className = 'cmp-acts';
    const clr = $('clearCompare');
    clr.parentNode.insertBefore(acts, clr);
    acts.innerHTML = '<button type="button" class="ghost cmp-img" id="shareCmp">🖼 產生比較圖</button>';
    acts.appendChild(clr);
    // 比較區重畫時，順便更新「產生比較圖」按鈕（至少 2 組才有比較的意義）
    const baseRenderCompare = renderCompare;
    renderCompare = function () { baseRenderCompare(); $('shareCmp').hidden = compare.length < 2; };
    $('shareCmp').hidden = compare.length < 2;
  }

  /* ---- 小工具 ---- */
  const toastEl = document.createElement('div');
  toastEl.className = 'cy-toast'; toastEl.hidden = true; toastEl.setAttribute('role', 'status');
  document.body.appendChild(toastEl);
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2200);
  }
  async function copyText(t) {
    try { await navigator.clipboard.writeText(t); return true; } catch (e) {}
    const ta = document.createElement('textarea');
    ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
    ta.remove(); return ok;
  }
  const touch = () => window.matchMedia && matchMedia('(pointer: coarse)').matches;
  const ticketFits = r => !!(ticket && r.ok && (ticket.award.id === 'custom' || r.prog.any
    || ticket.award.match.some(k => (r.prog.name + r.prog.short).includes(k))));

  /* ---- 分享連結 ---- */
  function shareURL() {
    const q = new URLSearchParams();
    const sys = currentSystem(), card = currentCard(), pc = pickedCard();
    if (pickMode === 'card') {
      q.set('card', pc.id);
      if (scheme === '2027' && sysById(pc.sys).alt) q.set('scheme', '2027');
    } else {
      q.set('sys', $('system').value);
      if (sys.earn) q.set('earn', $('earnCard').value);
    }
    if (sys.holder && $('holder').checked && !(card && card.holderLock)) q.set('holder', '1');
    if ($('program').value !== '') q.set('prog', $('program').value);
    const spend = num('spend'); if (spend) q.set('spend', String(spend));
    if (!$('rate').disabled && $('rate').value !== '') q.set('rate', $('rate').value);
    if (sys.currency === 'USD' ? region === 'domestic' : region === 'overseas') q.set('region', region);
    if (region === 'overseas' && $('fee').value !== '1.5') q.set('fee', $('fee').value);
    if (num('bonus') > 0) q.set('bonus', $('bonus').value);
    if (sys.id === 'openpoint') {
      ['opA', 'opB', 'opC', 'opD'].forEach(id => { if (num(id) > 0) q.set(id, String(num(id))); });
      if (opMode[1] !== 'each' || opMode[2] !== 'each') q.set('opm', `${opMode[1]},${opMode[2]}`);
    }
    const a = tkAward();
    if (a.id !== 'none') {
      q.set('tk', a.id === 'custom' ? `custom::${$('tkCabin').value}`
        : `${a.id}:${$('tkRoute').value}:${$('tkCabin').value}${a.tiers && tkTier ? ':' + tkTier : ''}`);   // 華航／新航另外帶價格等級
      if (tkTrip === 2) q.set('trip', '2');
      if (a.id === 'custom') {
        if (num('tkMiles')) q.set('tkmiles', String(num('tkMiles')));
        if ($('tkAir').value.trim()) q.set('tkair', $('tkAir').value.trim());
        if ($('tkRouteTxt').value.trim()) q.set('tkroute', $('tkRouteTxt').value.trim());
      }
      if (num('tkTax')) q.set('tax', String(num('tkTax')));
    }
    q.set('from', 'share');
    return `${location.origin}${location.pathname}?${q.toString()}`;
  }
  function shareText(r) {
    return r && r.ok
      ? `我用卡點遊實算算了一下：${r.label} → ${r.prog.short}，每消費 ${fmt2(r.perMile)} 元 = 1 ${r.unit}。你也來算算看 👉`
      : '卡點遊實算：算出每消費幾元換 1 哩 👉';
  }
  if (CFG.link) $('shareLink').addEventListener('click', async () => {
    const r = compute(), url = shareURL();
    if (navigator.share && touch()) {
      try { await navigator.share({ title: '卡點遊實算', text: shareText(r), url }); return; }
      catch (e) { if (e && e.name === 'AbortError') return; }
    }
    toast(await copyText(url) ? '已複製分享連結，貼給朋友就能看到同一組試算' : '複製失敗，請長按網址列手動複製');
  });

  /* ---- canvas 繪圖工具 ---- */
  function rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  // 斷行：英數字整個單字不拆開；「 → 」前後優先分行；行尾附近有「・」「）」「 」就在那裡斷，避免只剩一兩個字掉到下一行
  function wrap(ctx, text, maxW) {
    text = String(text);
    const arrow = text.indexOf(' → ');
    if (arrow > 0 && ctx.measureText(text).width > maxW)
      return [...wrap(ctx, text.slice(0, arrow), maxW), ...wrap(ctx, text.slice(arrow + 1), maxW)];
    const tokens = text.match(/[A-Za-z0-9$.,%+\-]+|\s+|./gu) || [];
    const lines = []; let line = '';
    for (const tk of tokens) {
      if (line && ctx.measureText(line + tk).width > maxW) {
        let cut = -1;
        for (let i = line.length - 1; i >= Math.max(1, line.length - 8); i--) if ('・）、， '.includes(line[i])) { cut = i + 1; break; }
        if (cut > 0 && cut < line.length) { lines.push(line.slice(0, cut).trimEnd()); line = line.slice(cut).trimStart() + tk; }
        else { lines.push(line.trimEnd()); line = /^\s+$/.test(tk) ? '' : tk; }
      } else line += tk;
    }
    if (line.trim()) lines.push(line.trimEnd());
    return lines;
  }
  // 依可用寬度自動縮字，最多 maxLines 行，超過就加「…」
  function fitText(ctx, text, maxW, maxLines, size, minSize, weight, family) {
    let s = size, lines;
    for (; s >= minSize; s -= 2) {
      ctx.font = `${weight} ${s}px ${family}`;
      lines = wrap(ctx, text, maxW);
      if (lines.length <= maxLines) return { lines, size: s };
    }
    s = minSize; ctx.font = `${weight} ${s}px ${family}`;
    lines = wrap(ctx, text, maxW).slice(0, maxLines);
    let last = lines[maxLines - 1];
    while (last && ctx.measureText(last + '…').width > maxW) last = last.slice(0, -1);
    lines[maxLines - 1] = last + '…';
    return { lines, size: s };
  }
  function spaced(ctx, px) { if ('letterSpacing' in ctx) ctx.letterSpacing = px + 'px'; }
  async function loadFonts(text) {
    if (!document.fonts || !document.fonts.load) return;
    const jobs = [
      document.fonts.load(`700 40px "Noto Sans TC"`, text), document.fonts.load(`900 40px "Noto Sans TC"`, text),
      document.fonts.load(`500 40px "Noto Sans TC"`, text),
      document.fonts.load(`700 40px "DM Sans"`, '0123456789,.$NTUS ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
      document.fonts.load(`500 40px "DM Sans"`, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
    ];
    await Promise.race([Promise.all(jobs).catch(() => {}), new Promise(res => setTimeout(res, 2500))]);
  }
  let logoImg = null;
  function loadLogo() {
    const src = (document.querySelector('.brand-logo') || {}).src;
    if (!src) return Promise.resolve(null);
    if (logoImg) return Promise.resolve(logoImg);
    return new Promise(res => {
      const img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = () => { logoImg = img; res(img); }; img.onerror = () => res(null);
      img.src = src;
      setTimeout(() => res(null), 3000);
    });
  }
  // 先畫在高畫布上，算出實際內容高度後再裁切（最矮 1350＝IG 4:5）
  function makeCanvas() { const c = document.createElement('canvas'); c.width = 1080; c.height = 2200; return c; }
  function drawFrame(ctx, H) {
    ctx.fillStyle = C.green; ctx.fillRect(0, 0, 1080, H);
    const g = ctx.createRadialGradient(980, 120, 10, 980, 120, 620);
    g.addColorStop(0, 'rgba(199,164,90,.20)'); g.addColorStop(1, 'rgba(199,164,90,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, H);
    ctx.strokeStyle = 'rgba(229,212,163,.35)'; ctx.lineWidth = 2;
    rrect(ctx, 36, 36, 1008, H - 72, 6); ctx.stroke();
  }
  function drawHeader(ctx, logo) {
    let x = 90;
    if (logo) {
      ctx.save(); ctx.beginPath(); ctx.arc(132, 132, 42, 0, Math.PI * 2); ctx.clip();
      const s = Math.min(logo.naturalWidth, logo.naturalHeight);
      ctx.drawImage(logo, (logo.naturalWidth - s) / 2, (logo.naturalHeight - s) / 2, s, s, 90, 90, 84, 84);
      ctx.restore();
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(132, 132, 42, 0, Math.PI * 2); ctx.stroke();
      x = 196;
    }
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    ctx.fillStyle = C.cream; ctx.font = `900 42px ${TC}`; spaced(ctx, 2); ctx.fillText('卡點遊', x, 130);
    ctx.fillStyle = C.goldlite; ctx.font = `700 18px ${NUM}`; spaced(ctx, 5); ctx.fillText('CARDS AND YOU', x, 162);
    spaced(ctx, 0);
  }
  function drawFooter(ctx, H, line1) {
    ctx.strokeStyle = 'rgba(199,164,90,.35)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(90, H - 168); ctx.lineTo(990, H - 168); ctx.stroke();
    ctx.textAlign = 'left'; ctx.fillStyle = C.soft; ctx.font = `500 26px ${TC}`;
    ctx.fillText(line1, 90, H - 116);
    ctx.fillStyle = C.goldlite; ctx.font = `700 34px ${NUM}`; spaced(ctx, 1);
    ctx.fillText(SITE, 90, H - 70); spaced(ctx, 0);
    ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(195,210,196,.7)'; ctx.font = `400 20px ${TC}`;
    if (NOTE) ctx.fillText(NOTE, 990, H - 74);
    ctx.textAlign = 'left';
  }
  function crop(src, H) {
    const out = document.createElement('canvas'); out.width = 1080; out.height = H;
    out.getContext('2d').drawImage(src, 0, 0, 1080, H, 0, 0, 1080, H);
    return out;
  }
  // 先畫內容（量出高度），再把背景＋內容一起重畫到正確高度
  async function render2(texts, paint, footer) {
    await loadFonts(texts.join('') + '卡點遊每消費元哩程累積速度估計稅金燃油附加費機票試算僅供參考以官方公告為準…');
    const logo = await loadLogo();
    const measure = makeCanvas().getContext('2d');
    const end = paint(measure);
    const H = Math.max(1350, Math.ceil(end + 210));
    const big = makeCanvas(), ctx = big.getContext('2d');
    drawFrame(ctx, H); drawHeader(ctx, logo); paint(ctx); drawFooter(ctx, H, footer);
    const out = crop(big, H);
    try { out.toDataURL(); return out; }               // 確認畫布沒有被跨網域圖片汙染
    catch (e) { const b2 = makeCanvas(), c2 = b2.getContext('2d'); drawFrame(c2, H); drawHeader(c2, null); paint(c2); drawFooter(c2, H, footer); return crop(b2, H); }
  }

  /* ---- 試算結果圖 ---- */
  function resultImage() {
    const r = compute(); if (!r.ok) return null;
    const title = `${r.label} → ${r.prog.short}`;
    const cond = [
      r.usd ? `每 1 美元 ${fmt(r.rate, 2)} 倍` : (r.rate != null ? `回饋 ${fmt(r.rate, 2)}%` : (r.earn ? `每 ${fmt(r.earn, 2)} 元累積 1 點` : '')),
      r.region === 'overseas' ? (r.usd ? `臺灣卡付款・手續費 ${fmt(r.fee, 2)}%` : `國外消費・手續費 ${fmt(r.fee, 2)}%`) : (r.usd ? '美國卡付款' : '國內消費'),
      r.bonus ? `轉點加成 ${fmt(r.bonus, 1)}%` : '', r.extra ? `活動加贈 ${fmt(r.extra)} 點` : '',
      r.ratio,
    ].filter(Boolean).join('　·　');
    const fits = ticketFits(r);
    const tkSpend = fits ? Math.ceil(ticket.miles * r.perMile - 1e-6) : 0;
    const spendTxt = r.usd ? `US$ ${fmt(r.spend)}` : `NT$ ${fmt(r.spend)}`;
    const texts = [title, cond, fits ? ticket.label : '', planOf(r.prog)];
    const paint = ctx => {
      let y = 262;
      ctx.textAlign = 'left'; ctx.fillStyle = C.goldlite; ctx.font = `700 22px ${NUM}`; spaced(ctx, 6);
      ctx.fillText('MY MILES RESULT', 90, y); spaced(ctx, 0);
      // 方案名稱
      const t = fitText(ctx, title, 900, 2, 54, 38, 700, TC);
      ctx.fillStyle = '#ffffff'; y += 28;
      t.lines.forEach(l => { y += t.size * 1.25; ctx.fillText(l, 90, y); });
      const pl = planOf(r.prog);
      if (pl) { y += 44; ctx.fillStyle = C.soft; ctx.font = `500 24px ${TC}`; ctx.fillText('哩程計畫：' + pl, 90, y); }
      // 每哩成本（主數字）
      y += 76; ctx.fillStyle = C.goldlite; ctx.font = `700 26px ${TC}`; spaced(ctx, 3); ctx.fillText('哩程累積速度', 90, y); spaced(ctx, 0);
      const n = fmt2(r.perMile), unit = `元 = 1 ${r.unit}`;
      let ns = fits ? 168 : 196;
      const widthAt = s => { ctx.font = `500 40px ${TC}`; const a = ctx.measureText('每消費 ').width, c = ctx.measureText(' ' + unit).width;
        ctx.font = `700 ${s}px ${NUM}`; return a + ctx.measureText(n).width + c; };
      while (ns > 90 && widthAt(ns) > 900) ns -= 6;
      y += ns * 0.92;
      ctx.font = `500 40px ${TC}`; ctx.fillStyle = C.cream; ctx.fillText('每消費', 90, y);
      let x = 90 + ctx.measureText('每消費 ').width;
      ctx.font = `700 ${ns}px ${NUM}`; ctx.fillStyle = C.goldlite; spaced(ctx, -3); ctx.fillText(n, x, y); x += ctx.measureText(n).width + 10; spaced(ctx, 0);
      ctx.font = `500 40px ${TC}`; ctx.fillStyle = C.cream; ctx.fillText(unit, x, y);
      y += 52; ctx.fillStyle = C.soft; ctx.font = `400 24px ${TC}`; ctx.fillText('數字越小，代表累積越快', 90, y);
      // 消費金額／預估哩程
      y += 46; ctx.strokeStyle = 'rgba(199,164,90,.3)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(90, y); ctx.lineTo(990, y); ctx.stroke();
      y += 56; ctx.fillStyle = C.goldlite; ctx.font = `600 24px ${TC}`;
      ctx.fillText('消費金額', 90, y); ctx.fillText(r.unit === '哩' ? '預估累積哩程' : '預估累積點數', 560, y);
      y += 64; ctx.fillStyle = C.cream; ctx.font = `700 54px ${NUM}`;
      ctx.fillText(spendTxt, 90, y); ctx.fillText(`${fmt(Math.floor(r.miles))} ${r.unit}`, 560, y);
      // 條件
      const cl = fitText(ctx, cond, 900, 2, 24, 20, 400, TC);
      y += 18; ctx.fillStyle = 'rgba(246,242,223,.72)';
      cl.lines.forEach(l => { y += cl.size * 1.5; ctx.fillText(l, 90, y); });
      // 目標機票
      if (fits) {
        y += 40; const top = y;
        const tl = (() => { ctx.font = `500 24px ${TC}`; return fitText(ctx, ticket.label, 820, 2, 24, 20, 500, TC); })();
        const h = 162 + tl.lines.length * 34 + (ticket.tax ? 38 : 0);
        ctx.fillStyle = 'rgba(255,255,255,.07)'; rrect(ctx, 90, top, 900, h, 4); ctx.fill();
        ctx.strokeStyle = 'rgba(199,164,90,.55)'; ctx.lineWidth = 2; rrect(ctx, 90, top, 900, h, 4); ctx.stroke();
        let ty = top + 52; ctx.fillStyle = C.goldlite; ctx.font = `700 24px ${TC}`; ctx.fillText('換這張機票需要消費', 130, ty);
        ty += 70; ctx.fillStyle = C.cream; ctx.font = `700 60px ${NUM}`; ctx.fillText(`NT$ ${fmt(tkSpend)}`, 130, ty);
        ctx.fillStyle = 'rgba(246,242,223,.8)'; ctx.font = `500 ${tl.size}px ${TC}`;
        ty += 12; tl.lines.forEach(l => { ty += 34; ctx.fillText(l, 130, ty); });
        if (ticket.tax) { ty += 38; ctx.fillStyle = C.soft; ctx.font = `400 22px ${TC}`; ctx.fillText(`另付稅金與燃油附加費 NT$ ${fmt(ticket.tax)}・所需 ${fmt(ticket.miles)} 哩`, 130, ty); }
        y = top + h;
      }
      return y;
    };
    return render2(texts, paint, '用「卡點遊實算」算出你的每哩成本');
  }

  /* ---- 比較圖 ---- */
  function compareImage() {
    if (compare.length < 2) return null;
    const rows = compare.map((c, i) => ({ c, i, cost: costOf(c) }));
    const costRows = rows.filter(r => r.cost);
    const mode = costRows.length >= 2 && cmpSort !== 'speed' ? 'cost' : 'speed';
    if (mode === 'cost') rows.sort((a, b) => (a.cost ? a.cost.total : Infinity) - (b.cost ? b.cost.total : Infinity) || a.i - b.i);
    else rows.sort((a, b) => a.c.perMile - b.c.perMile || a.i - b.i);
    const per10k = c => 10000 / c.perMile;
    const maxSpeed = Math.max(...compare.map(per10k), 1), maxCost = Math.max(...costRows.map(r => r.cost.total), 1);
    const best = rows[0];
    const tkLabel = mode === 'cost' ? (costRows[0].c.tk.label) : '';
    const title = mode === 'cost' ? '換同一張機票，哪個方案最省？' : '同樣刷卡，哪個方案累積最快？';
    const texts = [title, tkLabel, ...rows.map(r => `${r.c.sys} → ${r.c.prog}`)];
    const paint = ctx => {
      let y = 262;
      ctx.textAlign = 'left'; ctx.fillStyle = C.goldlite; ctx.font = `700 22px ${NUM}`; spaced(ctx, 6);
      ctx.fillText('MILES COMPARISON', 90, y); spaced(ctx, 0);
      const t = fitText(ctx, title, 900, 2, 54, 40, 700, TC);
      ctx.fillStyle = '#ffffff'; y += 28; t.lines.forEach(l => { y += t.size * 1.25; ctx.fillText(l, 90, y); });
      if (tkLabel) {
        const s = fitText(ctx, '目標機票：' + tkLabel, 900, 2, 26, 22, 500, TC);
        ctx.fillStyle = C.soft; y += 12; s.lines.forEach(l => { y += s.size * 1.45; ctx.fillText(l, 90, y); });
      }
      y += 34;
      rows.forEach((row, k) => {
        const c = row.c, isBest = row === best && (mode === 'speed' || row.cost);
        const top = y, name = `${c.sys} → ${c.prog}`;
        const nm = fitText(ctx, name, 520, 2, 30, 24, 700, TC);
        const h = 70 + nm.lines.length * nm.size * 1.3 + 30;
        if (isBest) { ctx.fillStyle = 'rgba(199,164,90,.14)'; rrect(ctx, 70, top - 6, 940, h + 12, 4); ctx.fill();
          ctx.strokeStyle = 'rgba(199,164,90,.7)'; ctx.lineWidth = 2; rrect(ctx, 70, top - 6, 940, h + 12, 4); ctx.stroke(); }
        // 字母（加入順序）
        ctx.fillStyle = isBest ? C.gold : 'rgba(229,212,163,.18)'; ctx.beginPath(); ctx.arc(122, top + 44, 26, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = isBest ? C.green : C.goldlite; ctx.font = `700 26px ${NUM}`; ctx.textAlign = 'center';
        ctx.fillText(String.fromCharCode(65 + row.i), 122, top + 53); ctx.textAlign = 'left';
        // 名稱
        ctx.fillStyle = '#ffffff'; ctx.font = `700 ${nm.size}px ${TC}`;
        let ny = top + 18; nm.lines.forEach(l => { ny += nm.size * 1.3; ctx.fillText(l, 172, ny); });
        // 右側數字
        ctx.textAlign = 'right';
        if (mode === 'cost') {
          ctx.fillStyle = isBest ? C.goldlite : C.cream; ctx.font = `700 40px ${NUM}`;
          ctx.fillText(row.cost ? `NT$ ${fmt(row.cost.total)}` : '—', 990, top + 56);
          ctx.fillStyle = C.soft; ctx.font = `400 20px ${TC}`; ctx.fillText(row.cost ? `每 ${fmt2(c.perMile)} 元 = 1 ${c.unit}` : '兌換目標不同', 990, top + 88);
        } else {
          ctx.font = `500 22px ${TC}`; ctx.fillStyle = C.soft; const u = ` 元 = 1 ${c.unit}`; ctx.fillText(u, 990, top + 56);
          const uw = ctx.measureText(u).width;
          ctx.fillStyle = isBest ? C.goldlite : C.cream; ctx.font = `700 46px ${NUM}`; ctx.fillText(fmt2(c.perMile), 990 - uw - 4, top + 56);
          const nw = ctx.measureText(fmt2(c.perMile)).width;
          ctx.fillStyle = C.soft; ctx.font = `500 22px ${TC}`; ctx.fillText('每消費 ', 990 - uw - 8 - nw, top + 56);
        }
        ctx.textAlign = 'left';
        // 長條
        const by = top + h - 22, frac = mode === 'cost' ? (row.cost ? row.cost.total / maxCost : 0) : per10k(c) / maxSpeed;
        ctx.fillStyle = 'rgba(255,255,255,.08)'; rrect(ctx, 172, by - 14, 560, 14, 7); ctx.fill();
        if (frac > 0) { ctx.fillStyle = isBest ? C.gold : 'rgba(229,212,163,.55)'; rrect(ctx, 172, by - 14, Math.max(14, 560 * frac), 14, 7); ctx.fill(); }
        ctx.fillStyle = 'rgba(246,242,223,.7)'; ctx.font = `400 20px ${TC}`;
        ctx.fillText(mode === 'cost' ? (row.cost ? '換票總成本' : '') : `每消費 1 萬 ≈ ${fmt(per10k(c))} ${c.unit}`, 748, by);
        y = top + h + (k < rows.length - 1 ? 26 : 0);
      });
      y += 34; ctx.fillStyle = C.soft; ctx.font = `400 22px ${TC}`;
      ctx.fillText(mode === 'cost' ? '長條為換票總成本（消費金額＋稅金與燃油附加費），越短越省' : '長條為每消費 1 萬元可得的哩程，越長累積越快', 90, y);
      return y;
    };
    return render2(texts, paint, '用「卡點遊實算」把不同點數放上同一個天平');
  }

  /* ---- 預覽視窗 ---- */
  const modal = document.createElement('div');
  modal.className = 'cy-share'; modal.hidden = true;
  modal.innerHTML = `<div class="cy-share-box" role="dialog" aria-modal="true" aria-labelledby="cyShareT">
    <button type="button" class="cy-x" aria-label="關閉">×</button>
    <h4 id="cyShareT">分享圖</h4><div class="cy-share-view"></div>
    <div class="cy-share-acts"><button type="button" data-a="share">分享圖片</button><button type="button" data-a="dl">下載圖片</button>${CFG.link ? '<button type="button" data-a="link" class="alt wide">複製這組試算的連結</button>' : ''}</div>
    <p class="cy-share-tip"></p></div>`;
  document.body.appendChild(modal);
  let cur = null, lastFocus = null;
  function closeModal() {
    modal.hidden = true; document.body.style.overflow = '';
    if (cur && cur.url) URL.revokeObjectURL(cur.url); cur = null;
    if (lastFocus) lastFocus.focus();
  }
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('.cy-x')) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
  async function openImage(kind) {
    lastFocus = document.activeElement;
    const view = modal.querySelector('.cy-share-view');
    modal.querySelector('#cyShareT').textContent = kind === 'cmp' ? '比較圖' : '試算結果分享圖';
    view.innerHTML = '<div class="cy-share-load">圖片產生中…</div>';
    modal.hidden = false; document.body.style.overflow = 'hidden';
    modal.querySelector('.cy-x').focus();
    const canvas = await (kind === 'cmp' ? compareImage() : resultImage());
    if (!canvas || modal.hidden) { if (!canvas) { closeModal(); toast('請先在計算機算出結果'); } return; }
    const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
    if (!blob) { closeModal(); toast('圖片產生失敗，請稍後再試'); return; }
    const d = new Date(), stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const file = new File([blob], `cardsandyou-${kind === 'cmp' ? 'compare' : 'miles'}-${stamp}.png`, { type: 'image/png' });
    cur = { file, url: URL.createObjectURL(blob), link: shareURL(), text: kind === 'cmp' ? '我把幾種點數方案放在一起比了一下 👉' : shareText(compute()) };
    view.innerHTML = `<img src="${cur.url}" alt="${kind === 'cmp' ? '方案比較圖' : '試算結果圖'}">`;
    const canShare = !!(navigator.canShare && navigator.canShare({ files: [file] }));
    modal.querySelector('[data-a="share"]').hidden = !canShare;
    modal.querySelector('.cy-share-tip').textContent = canShare
      ? (CFG.link ? '可以直接分享到 IG、Threads、LINE；連結請另外貼在貼文或留言裡。' : '可以直接分享到 IG、Threads、LINE。')
      : (CFG.link ? '下載後就能上傳到 IG、Threads 或 FB；記得附上試算連結，朋友點開就是同一組數字。' : '下載後就能上傳到 IG、Threads 或 FB。');
  }
  modal.querySelector('.cy-share-acts').addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b || !cur) return;
    if (b.dataset.a === 'share') {
      try { await navigator.share({ files: [cur.file], title: '卡點遊實算', text: CFG.link ? `${cur.text} ${cur.link}` : cur.text.replace(/\s*👉$/, '') }); }
      catch (err) { if (!err || err.name !== 'AbortError') toast('這個瀏覽器無法直接分享，請改用下載'); }
    } else if (b.dataset.a === 'dl') {
      const a = document.createElement('a'); a.href = cur.url; a.download = cur.file.name;
      document.body.appendChild(a); a.click(); a.remove(); toast('圖片已下載');
    } else if (b.dataset.a === 'link') {
      toast(await copyText(cur.link) ? '已複製試算連結' : '複製失敗，請稍後再試');
    }
  });
  if (CFG.image) $('shareImg').addEventListener('click', () => openImage('result'));
  if (CFG.compare) $('shareCmp').addEventListener('click', () => openImage('cmp'));
})();
