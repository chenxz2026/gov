/**
 * main.js — Centralized UI for ggzyjy.sc.gov.cn mirror
 * Features: live clock (HH:MM:SS), banner carousel, tab switching, nav highlight
 */
(function () {
  'use strict';

  /* ==================================================
   * 1. DATE & TIME FORMATTERS
   * ================================================== */
  function pad(n) { return n < 10 ? '0' + n : n; }
  function getWeekDay(date) {
    return ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][date.getDay()];
  }
  function formatDate(date) {
    return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
  }
  function formatTime(date) {
    return pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  }

  /* ==================================================
   * 2. LIVE CLOCK — updating every second
   *    Target format: YYYY年MM月DD日 星期X HH:MM:SS
   *    Updates elements with id: liveClock, tody, headerDate, headerWeek
   * ================================================== */
  function initLiveClock() {
    function update() {
      var now = new Date();
      var str = formatDate(now) + ' ' + getWeekDay(now) + ' ' + formatTime(now);
      // primary live clock element
      setText('liveClock', str);
      // legacy support for original ids
      setText('tody', str);
      setText('headerDate', formatDate(now));
      setText('headerWeek', getWeekDay(now));
    }
    update();
    return setInterval(update, 1000);
  }

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  /* ==================================================
   * 3. BANNER CAROUSEL (CSS fade)
   * ================================================== */
  function initBanner() {
    var slides = document.querySelectorAll('.banner-slide');
    if (slides.length < 2) return;
    var current = 0;
    var interval = 4000;
    var timer;

    function show(idx) {
      slides[current].classList.remove('active');
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('active');
      var dots = document.querySelectorAll('.banner-dot');
      dots.forEach(function(d, i) { d.classList.toggle('active', i === current); });
    }

    function next() { show(current + 1); }
    timer = setInterval(next, interval);

    var swiper = document.querySelector('.banner-swiper');
    if (swiper) {
      swiper.addEventListener('mouseenter', function() { clearInterval(timer); });
      swiper.addEventListener('mouseleave', function() { timer = setInterval(next, interval); });
    }

    document.querySelectorAll('.banner-dot').forEach(function(dot, i) {
      dot.addEventListener('click', function(e) {
        e.stopPropagation(); clearInterval(timer); show(i);
        timer = setInterval(next, interval);
      });
    });
  }

  /* ==================================================
   * 4. NAV HIGHLIGHT
   * ================================================== */
  function initNavHighlight() {
    var currentPage = document.documentElement.getAttribute('data-page') || 'index';
    var navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(function (item) {
      if (item.getAttribute('data-page') === currentPage) {
        item.classList.add('current');
      }
    });
  }

  /* ==================================================
   * 5. AREA TABS
   * ================================================== */
  function initAreaTabs(containerSelector) {
    var container = document.querySelector(containerSelector || '#areaTabs');
    if (!container) return;
    var tabs = container.querySelectorAll('.area-item');
    if (!tabs.length) return;

    var panels = {};
    var panelAttr = containerSelector === '#queryAreaTabs' ? 'data-query-panel' : 'data-area-panel';
    document.querySelectorAll('[' + panelAttr + ']').forEach(function(p) {
      panels[p.getAttribute(panelAttr)] = p;
    });

    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        tabs.forEach(function(t) { t.classList.remove('active'); });
        this.classList.add('active');
        var id = this.getAttribute('data-area');
        Object.keys(panels).forEach(function(k) { panels[k].classList.add('hidden'); });
        if (panels[id]) panels[id].classList.remove('hidden');
      });
    });
  }

  /* random stats per category */
  var statsData = [
    [128,56,12,8],   /* 代理机构比选 */
    [320,89,23,15],  /* 工程建设 */
    [256,67,18,9],   /* 政府采购 */
    [98,34,8,3],     /* 国有资产 */
    [45,22,5,2],     /* 土地使用权 */
    [15,8,3,1],      /* 矿业权 */
    [34,19,4,2],     /* 农村产权 */
    [67,28,6,3],     /* 国企采购 */
    [41,15,5,2]      /* 其它类别 */
  ];
  function updateStats(idx) {
    var s = statsData[idx] || statsData[0];
    var ids = ['stat1','stat2','stat3','stat4'];
    ids.forEach(function(id, i) { setText(id, s[i] + '条'); });
  }

  /* ==================================================
   * 6. SUB-CATEGORY TABS (left sidebar .sub-tab)
   * ================================================== */
  function initSubTabs() {
    document.querySelectorAll('.sub-tab').forEach(function(subTab) {
      var items = subTab.querySelectorAll('.tab-hd > .sub-item');
      var bds = subTab.querySelectorAll('> .tab-bd');
      if (!items.length || !bds.length) return;
      items.forEach(function(item, idx) {
        item.addEventListener('click', function() {
          items.forEach(function(si) { si.classList.remove('active'); });
          this.classList.add('active');
          bds.forEach(function(bd) { bd.classList.remove('active'); });
          var dataSub = parseInt(this.getAttribute('data-sub'));
          if (dataSub >= 0 && bds[dataSub]) bds[dataSub].classList.add('active');
          else if (bds[idx]) bds[idx].classList.add('active');
          /* update stats counters */
          updateStats(idx);
        });
      });
    });
  }

  /* ==================================================
   * 7. THREE-LEVEL CHIP TABS
   * ================================================== */
  function initThreeLevelTabs() {
    document.querySelectorAll('.three-tab').forEach(function(tt) {
      var chips = tt.querySelectorAll('.tab-hd-item');
      chips.forEach(function(chip) {
        chip.addEventListener('click', function() {
          chips.forEach(function(c) { c.classList.remove('active'); });
          this.classList.add('active');
        });
      });
    });
  }

  /* ==================================================
   * 8. NOTICE COUNTS (homepage)
   * ================================================== */
  var noticeData = [
    {ggName:'代理机构比选公告',ggCount:128,zzName:'代理机构比选结果',zzCount:56},
    {ggName:'工程建设公告',    ggCount:320,zzName:'工程建设中止',    zzCount:12},
    {ggName:'政府采购公告',    ggCount:256,zzName:'政府采购中止',    zzCount:8},
    {ggName:'国有资产公告',    ggCount:98, zzName:'国有资产中止',    zzCount:3},
    {ggName:'土地使用权公告',  ggCount:45, zzName:'土地使用权结束',  zzCount:22},
    {ggName:'矿业权公告',      ggCount:15, zzName:'矿业权结束',      zzCount:8},
    {ggName:'农村产权公告',    ggCount:34, zzName:'农村产权结束',    zzCount:19},
    {ggName:'国企采购公告',    ggCount:67, zzName:'国企采购结束',    zzCount:28},
    {ggName:'其他类别公告',    ggCount:41, zzName:'其他类别结束',    zzCount:15}
  ];
  var idMap = [
    ['dlggname','dlggcount','dljgname','dljgcount'],
    ['gcggname','gcggcount','gczzname','gczzcount'],
    ['zfggname','zfggcount','zfzzname','zfzzcount'],
    ['gyggname','gyggcount','gyzzname','gyzzcount'],
    ['tdggname','tdggcount','tdjsname','tdjscount'],
    ['kyggname','kyggcount','kyjsname','kyjscount'],
    ['ncggname','ncggcount','ncjsname','ncjscount'],
    ['gqggname','gqggcount','gqjsname','gqjscount'],
    ['qtggname','qtggcount','qtjsname','qtjscount']
  ];
  function populateNoticeCounts() {
    idMap.forEach(function(ids, i) {
      var d = noticeData[i];
      setText(ids[0], d.ggName); setText(ids[1], d.ggCount);
      setText(ids[2], d.zzName); setText(ids[3], d.zzCount);
    });
  }

  /* ==================================================
   * 9. TRADE LIST POPULATION
   * ================================================== */
  var tradeData = {
    dljgbx: ['四川省2026年度招标代理机构比选项目公告（第一批）','成都市高新区学校建设项目代理机构比选结果公示','绵阳市水利枢纽工程招标代理机构比选公告','德阳市城市快速路改造项目代理机构比选结果','南充市棚户区改造工程代理机构比选公告','宜宾市交通枢纽建设工程代理机构比选中选公示','自贡市市政配套工程代理机构比选公告','泸州市新城建设项目代理机构比选结果公告','乐山市景区基础设施项目代理机构比选公告','眉山市教育园区工程代理机构比选结果公示'],
    gcjs: ['G5京昆高速公路成绵扩容项目施工招标公告','四川省某大型水库枢纽工程施工中标候选人公示','成都市第三人民医院迁建项目施工总承包招标公告','某高新技术产业园区标准厂房建设项目施工公告','成都市轨道交通18号线三期工程招标公告','四川省某全民健身中心建设项目施工中标公示','某城市供水管网改造工程监理招标公告','某大数据中心建设项目设计施工总承包招标公告','某生态修复与保护工程一期施工招标公告','某物流园区基础设施建设项目中标结果公示'],
    zfcg: ['四川省某厅局办公设备采购项目公开招标公告','省级医疗机构医疗设备采购项目中标结果公示','某市信息化建设采购项目竞争性磋商公告','省级机关公务用车采购项目询价成交公告','某高校教学仪器设备采购项目废标公告','食品安全检测设备采购项目中标公示','某市图书馆数字化改造采购项目招标公告','省级政务云服务采购项目招标公告','某消防支队应急救援装备采购项目中标公告','某市智慧交通管理系统采购项目采购意向公示'],
    gycq: ['四川省某国企固定资产处置项目公告','成都市某单位车辆拍卖项目成交公告','某国有企业股权转让项目预公告','省属事业单位闲置房产租赁项目公告','某疗养院资产转让项目竞价结果公告','某大厦商业用房招租项目公告'],
    tdsyq: ['成都市某区域国有建设用地使用权出让公告','绵阳市某地块土地使用权挂牌出让结果公示','德阳市某片区土地一级开发项目招标公告','自贡市某地块国有建设用地使用权拍卖公告','泸州市某区域土地整理项目招标公告'],
    kyq: ['四川省某地区煤矿采矿权挂牌出让公告','某市石灰岩矿采矿权出让结果公示','四川省某铜矿探矿权出让公告','某地区页岩气探矿权挂牌出让公告'],
    nccq: ['成都市某村集体资产租赁项目公告','绵阳市某农村土地流转项目公告','德阳市某村级集体经济发展项目公告','南充市某村集体林地经营权流转公告'],
    gqcg: ['某省属国企2026年度物资采购项目招标公告','某国企信息化平台建设项目中标结果公示','某国企办公用品采购项目询价公告','某国企安全生产设备采购项目招标公告','某国企物业服务采购项目中标公示','某国企车辆保险服务采购项目竞争性谈判公告'],
    qtlb: ['四川省某PPP项目社会资本采购公告','某特许经营权出让项目招标公告','某政府购买服务项目采购公告','某重点项目阶段性评估服务采购公告']
  };
  var subKeys = ['dljgbx','gcjs','zfcg','gycq','tdsyq','kyq','nccq','gqcg','qtlb'];

  function randomDate() {
    var y = 2026, m = 5, d = Math.floor(Math.random()*28)+1;
    return y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');
  }

  function populateTradeLists(panel) {
    if (!panel) { panel = document.getElementById('areaPanel0'); if (!panel) return; }
    var bds = panel.querySelectorAll('.tab-bd');
    bds.forEach(function(bd, i) {
      var listEl = bd.querySelector('.trade-items');
      if (listEl && tradeData[subKeys[i]]) {
        var items = tradeData[subKeys[i]];
        var html = '';
        items.forEach(function(title) {
          /* link first 3 items in each category to detail pages */
          html += '<li class="trade-item"><a href="#">'+title+'</a><span>'+randomDate()+'</span></li>';
        });
        listEl.innerHTML = html;
      }
    });
  }

  /* ==================================================
   * 10. BOOTSTRAP
   * ================================================== */
  var clockInterval;
  document.addEventListener('DOMContentLoaded', function() {
    clockInterval = initLiveClock();
    initBanner();
    initNavHighlight();
    initAreaTabs('#areaTabs');
    initAreaTabs('#queryAreaTabs');
    initSubTabs();
    initThreeLevelTabs();
    populateNoticeCounts();
    populateTradeLists();
  });

  window.govUtils = { formatDate: formatDate, getWeekDay: getWeekDay, pad: pad };
})();
