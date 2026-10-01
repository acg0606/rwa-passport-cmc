import {expandedPassports} from './expanded-passports.js';
export const checkedAt = '2026-09-13';
export const usgs2026 = 'https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-gold.pdf';
export const usgs2025 = 'https://pubs.usgs.gov/periodicals/mcs2025/mcs2025-gold.pdf';

// Stable country cohort. Coordinates are country/region label anchors, not facilities.
export const countries = [
  ['CHN','China',35.9,104.2], ['RUS','Russia',61,100], ['AUS','Australia',-25.3,133.8],
  ['CAN','Canada',56.1,-106.3], ['USA','United States',39.8,-98.6], ['GHA','Ghana',7.9,-1.0],
  ['MEX','Mexico',23.6,-102.6], ['KAZ','Kazakhstan',48,68], ['UZB','Uzbekistan',41.4,64.6],
  ['PER','Peru',-9.2,-75], ['IDN','Indonesia',-2.5,118], ['ZAF','South Africa',-30.6,22.9],
  ['BRA','Brazil',-14.2,-51.9],
].map(([id,name,lat,lng]) => ({id,name,lat,lng}));

// Transcribed from official World Mine Production tables, page 2 in each PDF.
// 2023 uses the 2025 publication; 2024 uses the revised 2026 publication.
const production = [
  {year:2023, total:3250, source:usgs2025, vintage:'January 2025', estimated:['IDN'], values:[375,313,296,198,170,126,127,133,120,100,100,104,71]},
  {year:2024, total:3280, source:usgs2026, vintage:'February 2026', estimated:['BRA','CAN','IDN','KAZ','RUS'], values:[377,310,284,200,163,149,140,130,129,108,94,90,82]},
  {year:2025, total:3300, source:usgs2026, vintage:'February 2026', estimated:countries.map(c=>c.id), values:[380,310,280,200,160,150,140,130,130,110,90,90,80]},
];
export const goldHistory = production.map(frame => ({
  ...frame, id:String(frame.year), mode:'PUBLISHED_DATA', metric:'mine_production', unit:'metric tonnes',
  rows:countries.map((country,i)=>({...country,value:frame.values[i],share:frame.values[i]/frame.total*100,estimated:frame.estimated.includes(country.id)})),
}));

export const goldTrade = {
  period:'2021–2024', source:usgs2026, metric:'Share of U.S. gold imports by origin', unit:'%',
  destination:{id:'USA',name:'United States',lat:39.8,lng:-98.6},
  rows:[
    {id:'CAN',name:'Canada',lat:56.1,lng:-106.3,value:27},
    {id:'MEX',name:'Mexico',lat:23.6,lng:-102.6,value:20},
    {id:'COL',name:'Colombia',lat:4.6,lng:-74.3,value:14},
    {id:'CHE',name:'Switzerland',lat:46.8,lng:8.2,value:9},
  ],
  otherShare:30,
  caveat:'U.S. import-source shares across 2021–2024. Commodity context only; not a token flow or a physical shipping route.',
};

export const passports = [
  {
    id:4705, symbol:'PAXG', name:'PAX Gold', slug:'pax-gold', category:'Tokenized gold', family:'gold', color:'#e6c064',
    reference:'Gold', issuer:'Paxos Trust Company', legalLink:'Issuer describes ownership of allocated gold; one fine troy ounce per PAXG.',
    description:'From a token to the gold behind it.',
    custody:{id:'GBR',name:'London region',country:'United Kingdom',lat:51.5,lng:-0.1,precision:'Region only',statement:'Paxos states that PAXG gold is stored in LBMA vaults in London. Exact vault addresses and regional balances are not provided here.',source:'https://www.paxos.com/pax-gold',sourceDate:null},
    sources:[
      {id:'paxg-overview',label:'Pax Gold overview',publisher:'Paxos',url:'https://www.paxos.com/pax-gold',kind:'Issuer statement',claim:'Allocated gold and declared London custody region.'},
      {id:'paxg-reports',label:'Reserve attestations',publisher:'Paxos',url:'https://www.paxos.com/paxg-transparency',kind:'Evidence gateway',claim:'Official reporting portal. This app has not audited every report.'},
      {id:'paxg-cmc',label:'Market listings',publisher:'CoinMarketCap',url:'https://coinmarketcap.com/currencies/pax-gold/#Markets',kind:'Market directory',claim:'Listed venues are not the location of the gold or of every buyer.'},
    ],
    events:[{date:'2026-09-13',title:'London custody statement reviewed',summary:'The current issuer page states the custody region. A statement is not an independent verification of reserves.',url:'https://www.paxos.com/pax-gold',kind:'Research checkpoint'}],
  },
  {
    id:5176, symbol:'XAUt', name:'Tether Gold', slug:'tether-gold', category:'Tokenized gold', family:'gold', color:'#80cfc3',
    reference:'Gold', issuer:'TG Commodities', legalLink:'Issuer describes one troy fine ounce of gold on a specific gold bar per token; consult current terms.',
    description:'A different issuer. A different custody story.',
    custody:{id:'CHE',name:'Switzerland',country:'Switzerland',lat:46.8,lng:8.2,precision:'Country only',statement:'Tether’s 2020 launch statement identifies storage in Switzerland. This historical statement does not identify a current vault or a current stock balance.',source:'https://tether.io/news/tether-gold-launch-meets-growing-demand-for-digital-exposure-to-worlds-most-enduring-asset/',sourceDate:'2020-01-23'},
    sources:[
      {id:'xaut-overview',label:'Tether Gold overview',publisher:'Tether Gold',url:'https://gold.tether.to/',kind:'Issuer website',claim:'Current product information and allocation lookup.'},
      {id:'xaut-launch',label:'Original custody disclosure',publisher:'Tether',url:'https://tether.io/news/tether-gold-launch-meets-growing-demand-for-digital-exposure-to-worlds-most-enduring-asset/',kind:'Historical issuer statement',claim:'Switzerland is named in the January 2020 launch statement. Not a current vault audit.'},
      {id:'xaut-cmc',label:'Market listings',publisher:'CoinMarketCap',url:'https://coinmarketcap.com/currencies/tether-gold/#Markets',kind:'Market directory',claim:'Explore reported token markets; not geographic buyer volume.'},
    ],
    events:[{date:'2020-01-23',title:'Tether Gold launch',summary:'The issuer introduced the token and described physical gold storage in Switzerland.',url:'https://tether.io/news/tether-gold-launch-meets-growing-demand-for-digital-exposure-to-worlds-most-enduring-asset/',kind:'Issuer news'},{date:'2026-06-17',title:'Alloy wind-down announced',summary:'Tether announced a wind-down of Alloy and aUSD₮. The notice distinguishes those products from XAU₮.',url:'https://tether.io/news/tether-updates-users-on-strategic-changes-to-its-product-support-offering/',kind:'Issuer news'}],
  },
  {
    id:36992, symbol:'NVDAx', name:'NVIDIA xStock', slug:'nvidia-tokenized-stock-xstock', category:'Tokenized equity', family:'equity', color:'#a6c79c',
    reference:'NVIDIA equity', issuer:'Backed Assets (JE) Limited', legalLink:'A tokenized instrument referencing equity, not ownership of a chip, a factory or direct shareholder rights. Consult the instrument terms.',
    description:'Understand the company behind the exposure.',
    origin:{id:'USA',name:'Santa Clara, California',country:'United States',lat:37.35,lng:-121.96,precision:'City context',statement:'NVIDIA lists its corporate headquarters in Santa Clara. This locates the reference company, not the token’s custody or worldwide chip production.',source:'https://www.nvidia.com/en-us/contact/'},
    sources:[
      {id:'nvdax-product',label:'xStocks product directory',publisher:'xStocks',url:'https://xstocks.com/products',kind:'Issuer product directory',claim:'NVDAx is presented as an instrument with exposure to NVIDIA equity; review the final terms.'},
      {id:'nvdax-terms',label:'Legal documentation',publisher:'Backed',url:'https://assets.backed.fi/legal-documentation',kind:'Instrument terms',claim:'Rights and restrictions must be read in the legal documentation, not inferred from the company name.'},
      {id:'nvda-company',label:'NVIDIA company locations',publisher:'NVIDIA',url:'https://www.nvidia.com/en-us/contact/',kind:'Corporate context',claim:'Corporate headquarters, not inventory or token custody.'},
    ],
    events:[],
  },
  ...expandedPassports,
];

export const hasResearch = asset => Array.isArray(asset?.sources) && asset.sources.length > 0;

export function passportFor(coin) {
  const curated = passports.find(p=>p.id===coin.id);
  return curated ? {...curated,...coin,curated:true} : {
    ...coin, family:'unknown', category:'CMC category member', reference:'Not researched', issuer:'Not researched',
    description:'A market listing is the beginning of the research.',
    legalLink:'Category membership does not establish legal rights, backing, custody or eligibility.', sources:[], events:[], curated:false,
  };
}
