/**
 * 本脚本旨在获取机场流量使用详情, 链接需支持Quantumult 显示流量使用情况
 * 原作者 @Meeta
 * @author: Peng-YM
 * 修改增加多机场信息显示，以及支持多平台，图标。优化通知显示。
 * 更新地址：https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tasks/flow.js
 * 推荐使用mini图标组：https://github.com/Orz-3/mini
 */

let subscriptions = [
    {
        link: "订阅地址1",
        name: "取个名字1",
        icon: "https://raw.githubusercontent.com/Orz-3/mini/master/pudding.png"
    },
    {
        link: "订阅地址2",
        name: "取个名字2",
        icon: "https://raw.githubusercontent.com/Orz-3/mini/master/Nexitally.png"
    },
];

const $ = API("flow");
if ($.read("subscriptions") !== undefined) {
    subscriptions = JSON.parse($.read("subscriptions"));
}

Promise.all(subscriptions.map(async sub => await fetchInfo(sub)))
    .catch(err => $.error(err))
    .finally(() => $.done());

async function fetchInfo(sub) {
    const headers = {
        "User-Agent":
            "Quantumult/1.0.13 (iPhone10,3; iOS 14.0)"
    };
    $.http.get({
        url: sub.link,
        headers
    }).then(resp => {
        const headers = resp.headers;
        const subkey = Object.keys(headers).filter(k => /SUBSCRIPTION-USERINFO/i.test(k))[0];
        const userinfo = headers[subkey];
        if (!userinfo) {
            $.notify("🚀 [机场流量]", `❌ 机场：${sub.name} 未提供流量信息！`);
        }
        const KEY_o_now = "o_now" + sub.name;
        const KEY_today_flow = "today_flow" + sub.name;
        $.log(userinfo);
        const upload_k = Number(userinfo.match(/upload=(\d+)/)[1]);
        const download_k = Number(userinfo.match(/download=(\d+)/)[1]);
        const total_k = Number(userinfo.match(/total=(\d+)/)[1]);
        const expire_time = userinfo.match(/expire=(\d+)/)
        let expires = "无信息"
        if (expire_time) {
            expires = formatTime(Number(expire_time[1] * 1000));
        }

        const residue_m =
            total_k / 1048576 - download_k / 1048576 - upload_k / 1048576;
        const residue = residue_m.toFixed(2).toString();
        const dnow = new Date().getTime().toString();
        const utime = dnow - $.read(KEY_o_now);
        const todayflow = $.read(KEY_today_flow) - residue;
        $.write(residue, KEY_today_flow);
        $.write(dnow, KEY_o_now);
        const title = `🚀 [机场流量] ${sub.name}`;
        const hutime = parseInt(utime / 3600000);
        const mutime = (utime / 60000) % 60;
        const subtitle = `剩余流量: ${(residue_m / 1024).toFixed(2)} G`;
        const details = `
📌 [使用情况]
${
            hutime == 0
                ? "在过去的" +
                mutime.toFixed(1) +
                "分钟内使用了: " +
                todayflow.toFixed(2) +
                " M流量"
                : "在过去的" +
                hutime +
                "时 " +
                mutime.toFixed(1) +
                "分钟内使用了: " +
                todayflow.toFixed(2) +
                " M流量"
        }
📝 [统计]
总上传: ${(upload_k / 1073741824).toFixed(2)} G
总下载: ${(download_k / 1073741824).toFixed(2)} G
🛎 [到期时间]
${expires}`;

        if (sub.icon) {
            $.notify(title, subtitle, details, {"media-url": sub.icon});
        } else {
            $.notify(title, subtitle, details);
        }
    });
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}年${date.getMonth() +
    1}月${date.getDate()}日${date.getHours()}时`;
}


// prettier-ignore
/*********************************** API *************************************/
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!this.isLoon,o="function"==typeof require&&"undefined"!=typeof $jsbox,i="function"==typeof require&&!o,n="undefined"!=typeof $request,r="undefined"!=typeof importModule;return{isQX:e,isLoon:t,isSurge:s,isNode:i,isJSBox:o,isRequest:n,isScriptable:r}}function HTTP(e,t={}){function s(s,c){c="string"==typeof c?{url:c}:c,c.url=e?e+c.url:c.url,c={...t,...c};const h=c.timeout,l={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...c.events};let a,d;if(l.onRequest(s,c),o)a=$task.fetch({method:s,...c});else if(i||n||u)a=new Promise((e,t)=>{const o=u?require("request"):$httpClient;o[s.toLowerCase()](c,(s,o,i)=>{s?t(s):e({statusCode:o.status||o.statusCode,headers:o.headers,body:i})})});else if(r){const e=new Request(c.url);e.method=s,e.headers=c.headers,e.body=c.body,a=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}const f=h?new Promise((e,t)=>{d=setTimeout(()=>(l.onTimeout(),t(`${s} URL: ${c.url} exceeds the timeout ${h} ms`)),h)}):null;return(f?Promise.race([f,a]).then(e=>(clearTimeout(d),e)):a).then(e=>l.onResponse(e))}const{isQX:o,isLoon:i,isSurge:n,isScriptable:r,isNode:u}=ENV(),c=["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"],h={};return c.forEach(e=>h[e.toLowerCase()]=(t=>s(e,t))),h}function API(e="untitled",t=!1){const{isQX:s,isLoon:o,isSurge:i,isNode:n,isJSBox:r,isScriptable:u}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(n){const e=require("fs");return{fs:e}}return null})(),this.initCache();const s=(e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)});Promise.prototype.delay=function(e){return this.then(function(t){return s(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(o||i)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),n){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache);s&&$prefs.setValueForKey(e,this.name),(o||i)&&$persistentStore.write(e,this.name),n&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root),{flag:"w"},e=>console.log(e)))}write(e,t){this.log(`SET ${t}`),-1!==t.indexOf("#")?(t=t.substr(1),i&o&&$persistentStore.write(e,t),s&&$prefs.setValueForKey(e,t),n&&(this.root[t]=e)):this.cache[t]=e,this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),i&o?$persistentStore.read(e):s?$prefs.valueForKey(e):n?this.root[e]:void 0)}delete(e){this.log(`DELETE ${e}`),-1!==e.indexOf("#")?(e=e.substr(1),i&o&&$persistentStore.write(null,e),s&&$prefs.removeValueForKey(e),n&&delete this.root[e]):delete this.cache[e],this.persistCache()}notify(e,t="",o="",c={}){const h=c["open-url"],l=c["media-url"],a=o+(h?`\n点击跳转: ${h}`:"")+(l?`\n多媒体: ${l}`:"");if(s&&$notify(e,t,o,c),i&&$notification.post(e,t,a),this.isLoon){let s={};h&&(s.openUrl=h),l&&(s.mediaUrl=l),"{}"==JSON.stringify(s)?$notification.post(e,t,o):$notification.post(e,t,o,s)}if(n||u)if(r){const s=require("push");s.schedule({title:e,body:(t?t+"\n":"")+a})}else console.log(`${e}\n${t}\n${a}\n\n`)}log(e){this.debug&&console.log(e)}info(e){console.log(e)}error(e){console.log("ERROR: "+e)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||o||i?$done(e):n&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}}(e,t)}
/*****************************************************************************/



