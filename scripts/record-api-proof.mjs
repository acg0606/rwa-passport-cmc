import {mkdir,writeFile} from 'node:fs/promises';
import {loadEnv} from 'vite';
import {createMarketService} from '../server/market-service.mjs';
const key=loadEnv('development',process.cwd(),'CMC_').CMC_API_KEY||process.env.CMC_API_KEY||'';
const calls=[];
const fetcher=async(url,options)=>{
  const response=await fetch(url,options);
  const body=await response.clone().json();
  const category=body.data?.coins?body.data:Object.values(body.data||{}).find(value=>value?.coins);
  calls.push({requestedAt:new Date().toISOString(),url,status:response.status,providerStatus:body.status,
    responseExcerpt:category?{name:category.name,num_tokens:category.num_tokens,firstCoin:category.coins[0]}:{category:(body.data||[]).find(value=>value.name==='Tokenized Assets')}});
  return response;
};
const snapshot=await createMarketService({persist:false,key,fetcher}).getRanking(10);
const receipt={observedAt:new Date().toISOString(),purpose:'Fresh, uncached CMC provider verification; not a hackathon submission receipt.',calls,snapshot};
const serialized=JSON.stringify(receipt,null,2);
if(key&&serialized.includes(key)) throw Error('Secret detected in proof; refusing to save.');
await mkdir('public/evidence',{recursive:true});
await writeFile('public/evidence/cmc-live.json',serialized);
console.log(JSON.stringify({mode:snapshot.mode,transport:snapshot.transport,complete:snapshot.complete,scanned:snapshot.scannedCount,eligible:snapshot.eligibleCount,calls:calls.length,path:'public/evidence/cmc-live.json'}));
if(snapshot.mode!=='LIVE'||!snapshot.complete) process.exitCode=1;
