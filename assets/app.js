const countries = ["印度","美国","印度尼西亚","巴西","埃及","俄罗斯","墨西哥","巴基斯坦","土耳其","泰国","菲律宾","越南","孟加拉","伊朗","日本","南非","哥伦比亚","马来西亚","波兰","英国","沙特阿拉伯","西班牙","法国","德国","阿根廷","加拿大","澳大利亚","秘鲁","阿尔及利亚","尼日利亚","摩洛哥","韩国","乌兹别克斯坦","哈萨克斯坦","伊拉克","缅甸","以色列","厄瓜多尔"];
const chips = document.getElementById("countryChips");
const detail = document.getElementById("countryDetail");
const search = document.getElementById("countrySearch");
let selected = "印度";
function renderCountries(query=""){
  chips.innerHTML = "";
  countries.filter(c=>c.toLowerCase().includes(query.toLowerCase())).forEach(country=>{
    const button=document.createElement("button");
    button.className="country-chip"+(country===selected?" selected":"");
    button.textContent=country;
    button.addEventListener("click",()=>{selected=country;renderCountries(search.value);renderDetail();});
    chips.appendChild(button);
  });
}
const countrySnapshots = {
  "印度尼西亚": {
    date: "2026-11-02",
    lines: ["肉鸡生产者价：Rp 23,017/kg", "商品鸡蛋生产者价：Rp 24,416/kg", "鸭蛋生产者价：Rp 2,326/kg"],
    note: "农业部市场信息系统公开样本；当前仅有印尼盾原币报价，尚未接入汇率折算。",
    url: "https://simponiternak-v1.pertanian.go.id/harga-daerah.php"
  }
};
function renderDetail(){
  detail.replaceChildren();
  const snapshot=countrySnapshots[selected];
  const copy=document.createElement("div");
  const eyebrow=document.createElement("small");eyebrow.textContent="当前选择 · COUNTRY PROFILE";
  const heading=document.createElement("h3");heading.textContent=selected;
  const paragraph=document.createElement("p");
  const status=document.createElement("span");status.className="detail-status";
  copy.append(eyebrow,heading);
  if(snapshot){
    paragraph.textContent="真实价格样本（"+snapshot.date+"）";
    const list=document.createElement("ul");
    snapshot.lines.forEach(line=>{const li=document.createElement("li");li.textContent=line;list.appendChild(li);});
    const note=document.createElement("p");note.textContent=snapshot.note;
    const link=document.createElement("a");link.href=snapshot.url;link.target="_blank";link.rel="noopener noreferrer";link.textContent="查看官方数据源 ↗";
    copy.append(paragraph,list,note,link);
    status.textContent="已录入公开样本 · 非实时";
  }else{
    paragraph.textContent="该市场已列入监测范围，但本期尚无完成来源核验的价格样本。接入后将展示禽肉、禽蛋、饲料、雏禽及当地货币 / USD / CNY 折算价格。";
    copy.appendChild(paragraph);
    status.textContent="数据待接入 / 核验";
  }
  detail.append(copy,status);
}
search.addEventListener("input",e=>renderCountries(e.target.value));
renderCountries();renderDetail();
document.getElementById("year").textContent=new Date().getFullYear();
document.getElementById("menuToggle").addEventListener("click",()=>document.getElementById("mainNav").classList.toggle("open"));
const navLinks=[...document.querySelectorAll("#mainNav a")];
navLinks.forEach(a=>a.addEventListener("click",()=>document.getElementById("mainNav").classList.remove("open")));
if("IntersectionObserver" in window){
  const sections=navLinks.map(a=>document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      navLinks.forEach(link=>{
        const active=link.getAttribute("href")==="#"+entry.target.id;
        link.classList.toggle("active",active);
        if(active)link.setAttribute("aria-current","location");else link.removeAttribute("aria-current");
      });
    });
  },{rootMargin:"-25% 0px -65% 0px"});
  sections.forEach(section=>observer.observe(section));
}
const languageToggle=document.getElementById("languageToggle");
languageToggle.addEventListener("click",()=>{
  languageToggle.textContent="中文优先";
  languageToggle.title="英文完整页面正在建设中";
  languageToggle.setAttribute("aria-label","英文完整页面正在建设中，当前为中文版本");
});


async function loadCompetitorNews(){
  const status=document.getElementById("competitorNewsStatus");
  const list=document.getElementById("competitorNewsList");
  if(!status||!list)return;
  try{
    const response=await fetch("data/competitor-news.json",{cache:"no-store"});
    if(!response.ok)throw new Error("HTTP "+response.status);
    const archive=await response.json();
    const items=Array.isArray(archive.items)?archive.items:[];
    status.textContent="监测企业 "+(archive.watchlist_count||0)+" 家 · 新增 "+(archive.new_items_count||0)+" 条";
    list.replaceChildren();
    if(!items.length){
      const empty=document.createElement("p");
      empty.textContent="当前尚无采集记录。自动任务首次运行后，有新线索时将在此显示。";
      list.appendChild(empty);
      return;
    }
    items.slice(0,8).forEach(item=>{
      const article=document.createElement("article");
      article.className="competitor-news-item";
      const heading=document.createElement("h4");
      const link=document.createElement("a");
      link.href=item.url;
      link.target="_blank";
      link.rel="noopener noreferrer";
      link.textContent=item.title||"未命名资讯";
      heading.appendChild(link);
      const meta=document.createElement("p");
      meta.textContent=[item.company,item.publisher,item.published_at,item.verification||"待核实"].filter(Boolean).join(" · ");
      article.append(heading,meta);
      list.appendChild(article);
    });
  }catch(error){
    status.textContent="资讯档案暂不可用";
    list.textContent="暂时无法读取公开资讯档案，请稍后再试。";
    console.error("Competitor news load failed:",error);
  }
}
loadCompetitorNews();


async function loadCustomerProjects(){
  const status=document.getElementById("customerProjectStatus");
  const list=document.getElementById("customerProjectList");
  if(!status||!list)return;
  try{
    const response=await fetch("data/customer-projects.json",{cache:"no-store"});
    if(!response.ok)throw new Error("HTTP "+response.status);
    const archive=await response.json();
    const items=Array.isArray(archive.items)?archive.items:[];
    status.textContent="公开项目样本 "+items.length+" 条 · 更新 "+(archive.updated_at||"");
    list.replaceChildren();
    items.forEach(item=>{
      const article=document.createElement("article");
      article.className="project-card";
      const top=document.createElement("div");
      top.className="project-card-top";
      const country=document.createElement("span");
      country.className="project-country";
      country.textContent=item.country||"国家待核";
      const stage=document.createElement("span");
      stage.className="project-stage";
      stage.textContent=item.verification||"待核实";
      top.append(country,stage);
      const title=document.createElement("h4");
      title.textContent=item.company||"企业待核";
      const project=document.createElement("p");
      project.className="project-name";
      project.textContent=item.project||"";
      const facts=document.createElement("dl");
      [[ "项目类型",item.category ],[ "产能 / 配置",item.capacity ],[ "投资",item.investment ],[ "项目阶段",item.stage ],[ "设备供应商",item.competitor||"未披露" ]].forEach(([label,value])=>{
        if(!value)return;
        const row=document.createElement("div");
        const dt=document.createElement("dt");dt.textContent=label;
        const dd=document.createElement("dd");dd.textContent=value;
        row.append(dt,dd);facts.appendChild(row);
      });
      const assessment=document.createElement("p");
      assessment.className="project-assessment";
      assessment.textContent="兴仪视角："+(item.opportunity_assessment||"持续跟踪公开动态。");
      const source=document.createElement("a");
      source.href=item.source_url;
      source.target="_blank";
      source.rel="noopener noreferrer";
      source.textContent="查看来源原文 ↗";
      const foot=document.createElement("div");
      foot.className="project-foot";
      const meta=document.createElement("span");
      meta.textContent=(item.source_type||"公开来源")+" · "+(item.published_at||"日期未注明");
      foot.append(meta,source);
      article.append(top,title,project,facts,assessment,foot);
      list.appendChild(article);
    });
  }catch(error){
    status.textContent="项目档案暂不可用";
    list.textContent="暂时无法读取项目档案，请稍后再试。";
    console.error("Customer projects load failed:",error);
  }
}
loadCustomerProjects();


async function loadTenderWatch(){
  const status=document.getElementById("tenderWatchStatus");
  const list=document.getElementById("tenderWatchList");
  if(!status||!list)return;
  try{
    const response=await fetch("data/tender-watch.json",{cache:"no-store"});
    if(!response.ok)throw new Error("HTTP "+response.status);
    const archive=await response.json();
    const items=Array.isArray(archive.items)?archive.items:[];
    status.textContent="公开招标 "+items.length+" 条 · 更新 "+(archive.updated_at||"");
    list.replaceChildren();
    items.forEach(item=>{
      const article=document.createElement("article");
      article.className="tender-card";
      const head=document.createElement("div");head.className="tender-card-head";
      const country=document.createElement("span");country.className="project-country";country.textContent=item.country||"国家待核";
      const stage=document.createElement("span");stage.className="project-stage";stage.textContent=item.status||"状态待核";
      head.append(country,stage);
      const title=document.createElement("h4");title.textContent=item.title||"招标项目";
      const authority=document.createElement("p");authority.className="tender-authority";authority.textContent=item.authority||"采购机构待核";
      const facts=document.createElement("dl");
      [["招标编号",item.tender_id],["公告编号",item.reference],["采购范围",item.scope],["投标截止",item.deadline],["开标时间",item.opening],["工期 / 保证金",[item.period,item.emd].filter(Boolean).join(" · ")]].forEach(([label,value])=>{
        if(!value)return;
        const row=document.createElement("div");
        const dt=document.createElement("dt");dt.textContent=label;
        const dd=document.createElement("dd");dd.textContent=value;
        row.append(dt,dd);facts.appendChild(row);
      });
      const assessment=document.createElement("p");assessment.className="project-assessment";assessment.textContent="兴仪视角："+(item.opportunity||"持续跟踪公告进展。");
      const verify=document.createElement("p");verify.className="tender-verification";verify.textContent="核实状态："+(item.verification||"待核实");
      const links=document.createElement("div");links.className="tender-links";
      const primary=document.createElement("a");primary.href=item.source_url;primary.target="_blank";primary.rel="noopener noreferrer";primary.textContent="政府采购入口 ↗";links.appendChild(primary);
      (item.secondary_sources||[]).forEach(source=>{const a=document.createElement("a");a.href=source.url;a.target="_blank";a.rel="noopener noreferrer";a.textContent=source.label+" ↗";links.appendChild(a);});
      article.append(head,title,authority,facts,assessment,verify,links);
      list.appendChild(article);
    });
    if(!items.length)list.textContent="当前没有已归档的公开招标记录。";
  }catch(error){
    status.textContent="招标档案暂不可用";
    list.textContent="暂时无法读取招标档案，请稍后再试。";
    console.error("Tender watch load failed:",error);
  }
}
loadTenderWatch();

async function loadHatcheryPipeline(){
  const status=document.getElementById("hatcheryPipelineStatus");
  const list=document.getElementById("hatcheryPipelineList");
  if(!status||!list)return;
  try{
    const response=await fetch("data/hatchery-project-pipeline.json",{cache:"no-store"});
    if(!response.ok)throw new Error("HTTP "+response.status);
    const archive=await response.json();
    const items=Array.isArray(archive.records)?archive.records:[];
    status.textContent=items.length+" 条项目线索 · 更新 "+(archive.updated_at||"");
    list.replaceChildren();
    items.forEach(item=>{
      const article=document.createElement("article");article.className="tender-card";
      const head=document.createElement("div");head.className="tender-card-head";
      const country=document.createElement("span");country.className="project-country";country.textContent=item.country||"国家待核";
      const stage=document.createElement("span");stage.className="project-stage";stage.textContent=item.status||"状态待核";
      head.append(country,stage);
      const title=document.createElement("h4");title.textContent=item.project||"项目待核";
      const authority=document.createElement("p");authority.className="tender-authority";authority.textContent=item.organization||"机构待核";
      const facts=document.createElement("dl");
      [["项目编号",item.reference],["项目类别",item.category],["采购/合作范围",item.equipment_scope],["截止日期",item.deadline],["合同金额",item.contract_value],["供应商",item.awarded_supplier],["设备容量",item.capacity||"尚未披露"]].forEach(([label,value])=>{
        if(!value)return;const row=document.createElement("div");const dt=document.createElement("dt");dt.textContent=label;const dd=document.createElement("dd");dd.textContent=value;row.append(dt,dd);facts.appendChild(row);
      });
      const assessment=document.createElement("p");assessment.className="project-assessment";assessment.textContent="兴仪视角："+(item.commercial_assessment||"持续跟踪公开进展。");
      const verify=document.createElement("p");verify.className="tender-verification";verify.textContent="核实口径："+(item.verification||"待核实")+" · 最后核实："+(item.last_checked||"未注明");
      const links=document.createElement("div");links.className="tender-links";
      (item.sources||[]).forEach((url,index)=>{const a=document.createElement("a");a.href=url;a.target="_blank";a.rel="noopener noreferrer";a.textContent=(index===0?"项目来源":"补充来源")+" ↗";links.appendChild(a);});
      article.append(head,title,authority,facts,assessment,verify,links);list.appendChild(article);
    });
  }catch(error){status.textContent="项目池暂不可用";list.textContent="暂时无法读取项目池，请稍后再试。";console.error("Hatchery pipeline load failed:",error);}
}
loadHatcheryPipeline();
