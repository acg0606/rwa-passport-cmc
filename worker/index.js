import {createMarketService} from '../server/market-core.mjs';

const json=(body,status=200)=>new Response(JSON.stringify(body),{
  status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'},
});

export function createWorker({fetcher=fetch,cache=null,now=()=>Date.now()}={}) {
  let service,activeKey;
  return {
    async fetch(request,env) {
      const url=new URL(request.url);
      if(url.pathname.startsWith('/api/')) {
        if(request.method!=='GET') return json({error:'Read-only API'},405);
        if(url.pathname==='/api/health') return json({ok:true,product:'RWA Passport',readOnly:true});
        if(url.pathname!=='/api/market') return json({error:'Not found'},404);
        const limit=Number(url.searchParams.get('limit')||3);
        if(![3,10].includes(limit)) return json({error:'Choose a limit of 3 or 10.'},400);
        const key=env.CMC_API_KEY||'';
        if(!service||key!==activeKey) {
          const cacheKey=new Request(new URL('/__internal/market-state-v1',url.origin));
          const storage=cache?{
            async load(){const saved=await cache.match(cacheKey);return saved?await saved.json():null;},
            async save(value){try {await cache.put(cacheKey,new Response(JSON.stringify(value),{headers:{'Content-Type':'application/json','Cache-Control':'public, max-age=86400'}}));} catch {}},
          }:null;
          activeKey=key;
          service=createMarketService({key,fetcher,now,storage});
        }
        try {return json(await service.getRanking(limit));}
        catch {return json({mode:'HOLD',rows:[],error:{message:'Market service temporarily unavailable.'}},503);}
      }
      if(url.pathname.startsWith('/__internal/')) return json({error:'Not found'},404);
      const response=await env.ASSETS.fetch(request);
      const acceptsHtml=request.headers.get('accept')?.includes('text/html');
      if(response.status!==404||!acceptsHtml||!['GET','HEAD'].includes(request.method)) return response;
      const indexUrl=new URL(request.url);indexUrl.pathname='/index.html';indexUrl.search='';
      return env.ASSETS.fetch(new Request(indexUrl,request));
    },
  };
}

let runtime;
export default {
  fetch(request,env){runtime ||= createWorker({cache:globalThis.caches?.default});return runtime.fetch(request,env);},
};
