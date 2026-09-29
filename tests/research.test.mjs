import test from 'node:test';
import assert from 'node:assert/strict';
import {expandedPassports} from '../src/data/expanded-passports.js';
import {passports,passportFor,hasResearch,goldHistory,goldTrade} from '../src/data/research.js';
import {selectContext} from '../src/lib/domain.js';
import {buildEvidenceGraph} from '../src/lib/evidence-graph.js';
const bySymbol=symbol=>expandedPassports.find(p=>p.symbol===symbol);

test('all eight selected CMC identities have source-linked research',()=>{
  assert.deepEqual(expandedPassports.map(p=>p.id).sort((a,b)=>a-b),[37003,37005,38056,38273,39711,40213,40217,40536]);
  assert.equal(new Set(passports.map(p=>p.id)).size,11);
  for(const asset of expandedPassports){assert.ok(hasResearch(asset));assert.equal(asset.reviewedAt,'2026-09-29');}
});

test('every displayed claim and relationship resolves to its own reviewed source',()=>{
  for(const asset of expandedPassports){
    const {nodes,links}=buildEvidenceGraph(asset);
    assert.equal(nodes.length,6);
    for(const node of nodes){assert.ok(node.evidence,`${asset.symbol}/${node.id} needs a source`);assert.match(node.evidence.url,/^https:\/\//);assert.ok(node.section);assert.equal(node.evidence.reviewedAt,asset.reviewedAt);}
    for(const link of links){assert.ok(nodes.some(n=>n.id===link.source));assert.ok(nodes.some(n=>n.id===link.target));assert.equal(link.sourceId,asset.research.facets[link.claimId].sourceId);}
  }
});

test('Strategy preferred and common share instruments stay separate',()=>{
  assert.match(bySymbol('STRCX').reference,/preferred/);
  assert.match(bySymbol('STRCX').research.facets.reference.detail,/US5949728530/);
  assert.match(bySymbol('MSTRX').research.facets.reference.detail,/US5949724083/);
  assert.match(bySymbol('MSTRB').reference,/common stock/);
  assert.notEqual(bySymbol('MSTRX').issuer,bySymbol('MSTRB').issuer);
});

test('Circle wrappers share a reference company but not issuer or instrument identities',()=>{
  const assets=['CRCLX','CRCLon','CRCLB'].map(bySymbol);
  assert.equal(new Set(assets.map(p=>p.issuer)).size,3);
  assert.equal(new Set(assets.map(p=>p.isin)).size,3);
  for(const p of assets)assert.match(p.reference,/Circle/);
});

test('USDon preserves unresolved legal and account-level claims after research',()=>{
  const asset=bySymbol('USDon'),graph=buildEvidenceGraph(asset);
  assert.equal(asset.research.status,'PARTIAL');
  assert.equal(asset.family,'cash');
  assert.match(asset.research.facets.issuer.value,/unresolved/);
  assert.equal(graph.links.find(l=>l.claimId==='issuer').name,'operates platform');
  assert.equal(graph.links.find(l=>l.claimId==='custody').status,'PARTIAL');
  assert.match(asset.research.facets.rights.detail,/liquidity and whitelisting/);
  assert.equal(asset.origin,undefined);
  assert.equal(asset.custody,undefined);
});

test('named financial custodians and issuer addresses never become reserve-location pins',()=>{
  for(const asset of expandedPassports){
    const context=selectContext(asset,'custody',goldHistory[2],goldTrade);
    assert.equal(context.kind,'unknown');assert.deepEqual(context.points,[]);
    if(asset.origin){const company=selectContext(asset,'production',goldHistory[2],goldTrade);assert.equal(company.kind,'qualitative');assert.equal(company.points[0].share,null);}
  }
  assert.equal(bySymbol('CRCLB').origin.kind,'Issuer jurisdiction');
});

test('prospectus publication dates are not copied from URL upload dates',()=>{
  assert.equal(bySymbol('MSTRB').sources[0].publishedAt,'2026-06-22');
  assert.match(bySymbol('MSTRB').sources[0].url,/_06_23_2026/);
  assert.equal(bySymbol('CRCLon').sources[0].publishedAt,'2025-11-11');
  assert.equal(bySymbol('USDon').sources[0].publishedAt,null);
});

test('a new market entry cannot inherit research just by reusing a ticker',()=>{
  const unknown=passportFor({id:999999,symbol:'STRCX',name:'Different token',marketCap:123});
  assert.equal(hasResearch(unknown),false);assert.deepEqual(buildEvidenceGraph(unknown),{nodes:[],links:[]});
});

test('live quotes update researched passports without replacing evidence or inventing balances',()=>{
  const enriched=passportFor({id:39711,symbol:'STRCX',marketCap:100,price:99});
  assert.equal(enriched.marketCap,100);assert.equal(enriched.research.facets.reference.value,bySymbol('STRCX').research.facets.reference.value);
  assert.equal(bySymbol('STRCX').marketCap,undefined);assert.equal(bySymbol('STRCX').custody,undefined);
});
