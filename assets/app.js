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
function renderDetail(){
  detail.innerHTML=`<div><small>当前选择 · COUNTRY PROFILE</small><h3>${selected}</h3><p>正式数据接入后，将在此展示${selected}的禽肉、禽蛋、饲料、雏禽行情，以及当地货币 / USD / CNY 折算价格与历史趋势。</p></div><span class="detail-status">等待接入真实行情源</span>`;
}
search.addEventListener("input",e=>renderCountries(e.target.value));
renderCountries();renderDetail();
document.getElementById("year").textContent=new Date().getFullYear();
document.getElementById("menuToggle").addEventListener("click",()=>document.getElementById("mainNav").classList.toggle("open"));
document.querySelectorAll("#mainNav a").forEach(a=>a.addEventListener("click",()=>document.getElementById("mainNav").classList.remove("open")));
document.getElementById("languageToggle").addEventListener("click",()=>alert("英文辅助内容与完整英文页面将在后续版本中完善。"));


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
