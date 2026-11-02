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
