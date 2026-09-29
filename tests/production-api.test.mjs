import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorker} from '../worker/index.js';
const time=Date.parse('2026-09-29T10:00:00Z');
const coin={id:4705,symbol:'PAXG',name:'Pax Gold',quote:{USD:{market_cap:100,price:10,last_updated:new Date(time).toISOString()}}};
const response=data=>new Response(JSON.stringify({data,status:{error_code:0}}));
const req=(path='/api/market?limit=10')=>new Request('https://rwa.test'+path);

test('production API returns live CMC data, protects the key and shares selectors cache',async()=>{
  const calls=[];const secret='test-only-not-a-real-key';
  const worker=createWorker({now:()=>time,fetcher:async(url,options)=>{
    calls.push({url,key:options.headers['X-CMC_PRO_API_KEY']});
    return response(url.includes('/categories?')?[{id:'68638d58358e0763b448b3ca',name:'Tokenized Assets'}]:{name:'Tokenized Assets',num_tokens:1,coins:[coin]});
  }});
  const first=await worker.fetch(req(),{CMC_API_KEY:secret});const body=await first.json();
  assert.equal(body.mode,'LIVE');assert.equal(body.complete,true);assert.equal(body.rows[0].symbol,'PAXG');
  assert.equal(JSON.stringify(body).includes(secret),false);assert.equal(first.headers.get('cache-control'),'no-store');
  await worker.fetch(req('/api/market?limit=3'),{CMC_API_KEY:secret});
  assert.equal(calls.length,2);assert.ok(calls.every(c=>new URL(c.url).origin==='https://pro-api.coinmarketcap.com'&&c.key===secret));
});
test('production boundary rejects writes, arbitrary endpoints, invalid limits and private cache routes without provider calls',async()=>{
  let calls=0;const worker=createWorker({fetcher:async()=>{calls++;throw Error('unexpected');}});
  for(const [request,status] of [[req('/api/market?limit=1000'),400],[req('/api/rwa-assets'),404],[req('/__internal/market-state-v1'),404],[new Request('https://rwa.test/api/market',{method:'POST'}),405]]){
    assert.equal((await worker.fetch(request,{})).status,status);
  }
  assert.equal(calls,0);
});
test('a new production worker restores a recent shared snapshot without new API calls',async()=>{
  const saved=new Map();const cache={match:async r=>saved.get(r.url)?.clone(),put:async(r,s)=>{saved.set(r.url,s.clone());}};
  const fetcher=async url=>response(url.includes('/categories?')?[{id:'68638d58358e0763b448b3ca',name:'Tokenized Assets'}]:{name:'Tokenized Assets',num_tokens:1,coins:[coin]});
  await createWorker({now:()=>time,cache,fetcher}).fetch(req(),{});
  const restarted=createWorker({now:()=>time+1000,cache,fetcher:async()=>{throw Error('must use cache');}});
  const result=await (await restarted.fetch(req(),{})).json();
  assert.equal(result.mode,'LIVE');assert.equal(result.rows[0].id,4705);
});
test('production keeps an expired snapshot explicitly STALE when CMC fails',async()=>{
  let now=time,failed=false;
  const worker=createWorker({now:()=>now,fetcher:async url=>{
    if(failed) return new Response(JSON.stringify({status:{error_code:1008}}),{status:429});
    return response(url.includes('/categories?')?[{id:'68638d58358e0763b448b3ca',name:'Tokenized Assets'}]:{name:'Tokenized Assets',num_tokens:1,coins:[coin]});
  }});
  await worker.fetch(req(),{});now+=16*60*1000;failed=true;
  const result=await (await worker.fetch(req(),{})).json();
  assert.equal(result.mode,'STALE');assert.equal(result.rows.length,1);assert.ok(result.retryAt);
});
