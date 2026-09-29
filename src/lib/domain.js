export const MAX_AGE_MS = 45 * 60 * 1000;
export const RANKING_SCOPE = 'CMC Tokenized Assets category · token-level market capitalization';
export const finite = value => typeof value === 'number' && Number.isFinite(value);
export const safeUrl = value => { try { const url = new URL(value); return url.protocol==='https:' ? url.href : null; } catch { return null; } };

export function normalizeCoin(coin, now=Date.now()) {
  const quote = coin?.quote?.USD;
  const stamp = Date.parse(quote?.last_updated || '');
  if (!Number.isSafeInteger(coin?.id) || coin.id<=0) return {reason:'invalid_id'};
  if (coin.is_active===0) return {reason:'inactive'};
  if (!quote || !finite(quote.market_cap) || quote.market_cap<=0) return {reason:'unknown_market_cap'};
  if (!Number.isFinite(stamp) || now-stamp>MAX_AGE_MS || stamp>now+5*60*1000) return {reason:'stale_quote'};
  return {coin:{id:coin.id,name:String(coin.name||coin.symbol).slice(0,140),symbol:String(coin.symbol||'').slice(0,32),slug:String(coin.slug||'').slice(0,160),marketCap:quote.market_cap,volume:finite(quote.volume_24h)&&quote.volume_24h>=0?quote.volume_24h:null,price:finite(quote.price)&&quote.price>=0?quote.price:null,change:finite(quote.percent_change_24h)?quote.percent_change_24h:null,quoteAt:new Date(stamp).toISOString()}};
}

export function rankCoins(coins, limit=3, now=Date.now()) {
  if (![3,10].includes(Number(limit))) throw new Error('limit must be 3 or 10');
  const byId = new Map(); const excluded = {};
  for (const raw of coins) {
    const result = normalizeCoin(raw, now);
    if (result.reason) { excluded[result.reason]=(excluded[result.reason]||0)+1; continue; }
    const existing = byId.get(result.coin.id);
    if (!existing || result.coin.quoteAt>existing.quoteAt) byId.set(result.coin.id,result.coin);
  }
  const eligible = [...byId.values()].sort((a,b)=>b.marketCap-a.marketCap||a.id-b.id);
  const total = eligible.reduce((s,c)=>s+c.marketCap,0);
  const rows = eligible.map((c,i)=>({...c,rank:i+1,share:total>0?c.marketCap/total*100:null}));
  return {rows:rows.slice(0,Number(limit)),all:rows,total,eligibleCount:rows.length,excluded};
}

export function sortRows(rows,limit=10) {
  return rows.filter(r=>finite(r.value)&&r.value>=0).slice().sort((a,b)=>b.value-a.value||String(a.id).localeCompare(String(b.id))).slice(0,limit);
}

export function categoryPayload(payload) {
  const data = payload?.data;
  const value = data?.coins ? data : data && Object.values(data).find(x=>Array.isArray(x?.coins));
  if (!value || !Array.isArray(value.coins) || !Number.isFinite(value.num_tokens)) throw new Error('Unexpected CMC category response');
  return value;
}

export function selectContext(passport,layer,frame,trade) {
  if (layer==='production' && passport.family==='gold') return {kind:'quantitative',mode:'PUBLISHED_DATA',points:frame.rows,source:frame.source,unit:'metric tonnes',note:'Global gold mine production. Not the origin of this token’s reserves.'};
  if (layer==='trade' && passport.family==='gold') return {kind:'trade',mode:'PUBLISHED_DATA',points:trade.rows,source:trade.source,unit:'% of U.S. imports',note:trade.caveat};
  const place = layer==='custody'?passport.custody:layer==='production'?passport.origin:null;
  if (place) return {kind:'qualitative',mode:'ISSUER_STATEMENT',points:[{...place,value:null,share:null}],source:place.source,unit:null,note:place.statement};
  return {kind:'unknown',mode:'UNKNOWN',points:[],source:null,unit:null,note:layer==='trade'?'No verified geographic trading flows. Venue listings do not reveal buyer locations.':'No verified location data for this layer. Missing is not zero.'};
}

export function compareRows(current,previous) {
  const lookup = new Map(previous.map(row=>[row.id,row]));
  return current.map(row=>({...row,delta:lookup.has(row.id)&&finite(lookup.get(row.id).value)&&finite(row.value)?row.value-lookup.get(row.id).value:null}));
}
