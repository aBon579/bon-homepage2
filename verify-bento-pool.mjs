/* 便当盒轮换池算法验证：模拟未来数据规模
   （独立脚本，不碰站点文件；从 Portfolio.jsx 原样抽出核心逻辑） */

function buildBatches(WORKS, featuredWorks) {
  const featuredSet = new Set(featuredWorks.map((w) => w.link));
  const batches = [featuredWorks];
  for (let i = 0; i < WORKS.length; i += 5) {
    let b = WORKS.slice(i, i + 5);
    if (b.length < 5) {
      const need = 5 - b.length;
      b = [...b, ...WORKS.slice(0, need)];
    }
    batches.push(b);
  }
  return batches.filter(
    (b, i) => b.length === 5 && (i === 0 || b.some((w) => !featuredSet.has(w.link)))
  );
}

// 造 N 条假作品
function mockWorks(n, offset = 0) {
  return Array.from({ length: n }, (_, i) => ({
    title: `作品 ${i + 1 + offset}`,
    link: `https://example.com/w/${i + 1 + offset}`,
    desc: "",
    keywords: [],
    category: i % 3 === 0 ? "视频" : "文章",
  }));
}

// 当前真实规模：30 条 + 5 精选
const featuredNow = mockWorks(5, 1000); // 精选用独立链接段
const now = buildBatches(mockWorks(30), featuredNow);

// 未来规模
const future60 = buildBatches(mockWorks(60), featuredNow);
const future100 = buildBatches(mockWorks(100), featuredNow);
const future500 = buildBatches(mockWorks(500), featuredNow);

// 精选恰好等于前 5 条的边界场景
const featuredEdge = mockWorks(5); // 前5条 = 精选
const edge = buildBatches(mockWorks(30), featuredEdge);

function audit(name, works, batches) {
  const all = batches.flat();
  const unique = new Set(all.map((w) => w.link));
  // 每批必须 5 条
  const bad = batches.filter((b) => b.length !== 5).length;
  // 轮换一轮的时长
  const cycleMin = ((batches.length * 15) / 60).toFixed(1);
  console.log(
    `${name}: 作品${works.length}条 → ${batches.length}批(每批5张) ` +
    `| 覆盖链接${unique.size}/${works.length} ` +
    `| 尾批${batches[batches.length - 1].length}张 ` +
    `| 全批5张校验${bad === 0 ? "PASS" : "FAIL"} ` +
    `| 一轮${cycleMin}分钟`
  );
}

audit("现在(30条)  ", mockWorks(30), now);
audit("未来(60条)  ", mockWorks(60), future60);
audit("未来(100条) ", mockWorks(100), future100);
audit("未来(500条) ", mockWorks(500), future500);
audit("精选=前5边界", mockWorks(30), edge);

// 新作品进轮换验证：30→32 条后，新增两条应出现在池中
const grown = [...mockWorks(30), ...mockWorks(2, 500)]; // 追加2条新作品
const grownBatches = buildBatches(grown, featuredNow);
const inPool = grownBatches.flat().some((w) => w.link.includes("/w/501")) &&
               grownBatches.flat().some((w) => w.link.includes("/w/502"));
console.log(`新增2条作品后: 池子${grownBatches.length}批，新作品出现在轮换中: ${inPool ? "PASS ✓" : "FAIL"}`);

// 尾批不足 5 条的场景（33条：33%5=3 → 补2条头部成整批）
// 覆盖断言：池中唯一链接数 ≥ 作品数（含精选5条）即视为全覆盖；重复展示头部条目为设计预期
const odd = buildBatches(mockWorks(33), featuredNow);
const oddCover = new Set(odd.flat().map((w) => w.link)).size;
console.log(`33条(尾批3条环形补齐): 池子${odd.length}批，全批5张: ${odd.every(b => b.length === 5) ? "PASS ✓" : "FAIL"}，覆盖${oddCover}/${33 + 5}(含精选) ${oddCover >= 33 ? "PASS ✓" : "FAIL"}`);
