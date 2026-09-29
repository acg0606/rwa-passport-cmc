import { createMarketService } from './market-service.mjs';
export function createApi(options={}) {
  const service=createMarketService(options);
  return async(req,res,next=()=>{})=>{
    const url=new URL(req.url,'http://local');
    if(!url.pathname.startsWith('/api/')) return next();
    res.setHeader('Content-Type','application/json; charset=utf-8');
    res.setHeader('Cache-Control','no-store');
    res.setHeader('X-Content-Type-Options','nosniff');
    if(req.method!=='GET'){res.statusCode=405;res.end(JSON.stringify({error:'Read-only API'}));return;}
    try {
      let result;
      if(url.pathname==='/api/health') result={ok:true,product:'RWA Passport',readOnly:true};
      else if(url.pathname==='/api/market') result=await service.getRanking(Number(url.searchParams.get('limit')||3));
      else if(url.pathname==='/api/rwa-assets') result=await service.getRwaAssets(Number(url.searchParams.get('limit')||3));
      else {res.statusCode=404;result={error:'Not found'};}
      res.end(JSON.stringify(result));
    } catch(error){res.statusCode=error.status||502;res.end(JSON.stringify({mode:'HOLD',error:error.message}));}
  };
}
