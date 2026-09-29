import { rankCoins,categoryPayload,RANKING_SCOPE } from '../src/lib/domain.js';
const KEYLESS = 'https://pro-api.coinmarketcap.com/public-api';
const KEYED = 'https://pro-api.coinmarketcap.com';
const allowedCategory = 'Tokenized Assets';
export class ProviderError extends Error {
  constructor(message,status=502,retryAfter=60) { super(message); this.status=status; this.retryAfter=retryAfter; }
}
export function createMarketService({fetcher=fetch,now=()=>Date.now(),key='',storage=null,refreshMs=15*60*1000,maxPages=5}={}) {
  let cached=null, pending=null, cooldownUntil=0, failures=0, category=null, history=[];
  let restored=false;
  const endpoint = key ? KEYED : KEYLESS;
  async function restore() {
    if (restored) return; restored=true;
    if (!storage) return;
    try {
      const saved=await storage.load();
      if(saved?.schemaVersion===1 && Array.isArray(saved.history)) {history=saved.history;cached=saved.cached;}
    } catch { /* A cache miss must not prevent a fresh provider call. */ }
  }
  async function save() {
    if (storage) await storage.save({schemaVersion:1,cached,history});
  }
  async function get(path,params={}) {
    const url=`${endpoint}${path}?${new URLSearchParams(params)}`;
    let response;
    try { response=await fetcher(url,{headers:{Accept:'application/json',...(key?{'X-CMC_PRO_API_KEY':key}:{})},signal:AbortSignal.timeout(18000)}); }
    catch {throw new ProviderError('CMC could not be reached. Try again after the cooldown.',502,60);}
    let body;
    try {body=await response.json();} catch {throw new ProviderError('CMC returned an unreadable response.',502,60);}
    if (!response.ok || (body.status?.error_code && String(body.status.error_code)!=='0')) {
      const seconds=Number(response.headers?.get('retry-after')) || (response.status===429?300:60);
      throw new ProviderError(response.status===429?'CMC access limit reached. A free server-side API key can provide a separate quota.':response.status===401||response.status===403?'CMC credentials or endpoint entitlement need attention.':'CMC did not return usable market data.',response.status,Math.min(3600,Math.max(60,seconds)));
    }
    return {body,url};
  }
  async function collect() {
    if (!category || now()-category.checkedAt>24*3600000) {
      const {body}=await get('/v1/cryptocurrency/categories',{limit:'5000'});
      const found=body.data?.find(c=>c.name?.trim()===allowedCategory);
      if (!found || !/^[a-f0-9]{24}$/i.test(found.id)) throw new ProviderError('The exact CMC Tokenized Assets category could not be resolved.');
      category={id:found.id,checkedAt:now()};
    }
    let all=[],totalExpected=Infinity, complete=false,pages=0,latestUrl='';
    for (let page=0;page<maxPages;page++) {
      const {body,url}=await get('/v1/cryptocurrency/category',{id:category.id,start:String(page*1000+1),limit:'1000',convert:'USD'});
      const value=categoryPayload(body); latestUrl=url; pages++;
      if (value.name?.trim()!==allowedCategory) throw new ProviderError('CMC category identity mismatch.');
      if(page===0) totalExpected=value.num_tokens;
      if(value.num_tokens!==totalExpected) throw new ProviderError('CMC category membership changed during pagination. Refresh later.');
      all.push(...value.coins);
      if(all.length>=totalExpected){complete=true;break;}
      if(value.coins.length<1000) break;
    }
    const uniqueCount=new Set(all.map(c=>c.id)).size;
    complete=complete && uniqueCount>=totalExpected;
    const ranked=rankCoins(all,10,now());
    if (!ranked.eligibleCount) throw new ProviderError('No fresh positive market-cap observations are available. Missing values are not ranked as zero.');
    const capturedAt=new Date(now()).toISOString();
    cached={capturedAt,scope:RANKING_SCOPE,categoryId:category.id,complete,totalExpected,scannedCount:uniqueCount,pages,total:ranked.total,eligibleCount:ranked.eligibleCount,excluded:ranked.excluded,rows:ranked.all,source:latestUrl};
    // Complete membership only. Records top 50 + the full eligible denominator at that observation.
    if (complete) history=[...history,{id:capturedAt,capturedAt,total:ranked.total,eligibleCount:ranked.eligibleCount,scope:RANKING_SCOPE,rows:ranked.all.slice(0,50)}].slice(-168);
    failures=0; cooldownUntil=0;
    await save();
  }
  function snapshot(limit,error=null) {
    const age=cached?now()-Date.parse(cached.capturedAt):Infinity;
    const stale=age>refreshMs;
    return {mode:cached?(stale||error?'STALE':'LIVE'):'HOLD',transport:key?'KEYED':'KEYLESS',scope:RANKING_SCOPE,rankLabel:cached?.complete?`Top ${limit} eligible tokens`:'Observed research coverage',...cached,rows:(cached?.rows||[]).slice(0,limit),history,stale,error:error?{message:error.message,status:error.status}:null,retryAt:cooldownUntil?new Date(cooldownUntil).toISOString():null,nextRefreshAt:cached?new Date(Date.parse(cached.capturedAt)+refreshMs).toISOString():null};
  }
  return {
    async getRanking(limit=3) {
      if (![3,10].includes(Number(limit))) throw new ProviderError('Choose a limit of 3 or 10.',400);
      await restore();
      if(cached && now()-Date.parse(cached.capturedAt)<refreshMs) return snapshot(Number(limit));
      if(now()<cooldownUntil) return snapshot(Number(limit),new ProviderError('CMC is in cooldown. The app will not retry before the displayed time.',429));
      if(!pending) pending=collect().catch(error=>{
        failures++; cooldownUntil=now()+Math.min(3600000,(error.retryAfter||60)*1000*2**Math.min(failures-1,3));
        return error;
      }).finally(()=>{pending=null;});
      const error=await pending;
      return snapshot(Number(limit),error instanceof Error?error:null);
    },
    async getRwaAssets(limit=3) {
      if (![3,10].includes(Number(limit))) throw new ProviderError('Choose a limit of 3 or 10.',400);
      if(!key) return {mode:'HOLD',reason:'Dedicated RWA asset-level ranking requires a server-side CMC key. Token rankings are never silently substituted.',rows:[]};
      const {body,url}=await get('/v5/real-world-assets/assets/list',{start:'1',limit:String(limit),sort:'tokenized_market_cap',sort_dir:'desc',convert:'USD'});
      return {mode:'LIVE',scope:'CMC real-world assets, grouped by underlying asset',source:url,data:body.data};
    },
  };
}
