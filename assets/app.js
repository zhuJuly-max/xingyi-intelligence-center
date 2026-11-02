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
