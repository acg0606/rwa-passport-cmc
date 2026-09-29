// Product-level research. Documented terms are not a live verification of reserves.
export const expandedResearchDate = '2026-09-29';
const reviewedAt = expandedResearchDate;
const xLegal = 'https://docs.xstocks.fi/docs/product-legal-overview';
const ondoLegal = 'https://docs.ondo.finance/ondo-stocks/legal-and-regulatory';
const ondoCash = 'https://docs.ondo.finance/ondo-stocks/investing-and-redeeming.md';
const ondoAddresses = 'https://docs.ondo.finance/addresses';
const ondoContracts = 'https://docs.ondo.finance/api-reference/smart-contracts';
const termsUrl = isin => `https://sppdownloaddocumentservice.l-p-a.com/api/DownloadDocument/UPI/${isin}/BF%20Final%20Terms%20AND%20Summary%20%28PDF%29`;
const source = (id,label,publisher,url,publishedAt,kind,claim) => ({id,label,publisher,url,publishedAt,reviewedAt,kind,claim});
const facet = (label,value,shortLabel,detail,sourceId,section,status='DOCUMENTED_TERMS') => ({label,value,shortLabel,detail,sourceId,section,status});
const address = (id,name,country,lat,lng,statement,url,date,kind='Reference-company address') => ({id,name,country,lat,lng,precision:'City context',kind,statement,source:url,sourceDate:date});
const circleAddress = (url,date) => address('USA-NYC','New York, United States','United States',40.71,-74.01,'The product document identifies Circle Internet Group at One World Trade Center, New York. This is company-address context, not the location of token collateral or USDC reserves.',url,date);
const strategyAddress = (url,date) => address('USA-TYSONS','Tysons Corner, United States','United States',38.92,-77.23,'The final terms give a Strategy reference-company address in Tysons Corner, Virginia. This city marker does not locate securities accounts or the company’s operating assets.',url,date);

function xStock({id,symbol,documentSymbol,name,slug,isin,underlying,underlyingIsin,ticker,preferred=false}) {
  const url=termsUrl(isin),date='2026-05-08',sid=`${symbol.toLowerCase()}-terms`;
  return {
    id,symbol,name,slug,documentSymbol,isin,category:preferred?'Tokenized preferred equity':'Tokenized equity',family:'equity',color:'#a6c79c',
    reference:underlying,issuer:'Backed Assets (JE) Limited',reviewedAt,
    legalLink:'A collateralized tracker certificate with creditor rights under the product terms. It does not confer direct shareholder voting rights.',
    description:preferred?'Follow the preferred share behind this tracker.':'Follow the share exposure through the issuing instrument.',
    origin:ticker==='CRCL'?circleAddress(url,date):strategyAddress(url,date),
    sources:[source(sid,`${documentSymbol} final terms`, 'Backed Assets (JE) Limited',url,date,'Product final terms',`Identifies the issuer, ${ticker} underlying, collateral and service providers.`),source('xstocks-legal','xStocks legal structure','xStocks',xLegal,null,'Issuer documentation','Explains tracker certificates, collateral segregation and the security agent.')],
    events:[{date,title:`${documentSymbol} final terms dated`,summary:`The reviewed terms identify ${ticker} as the underlying and describe the certificate’s collateral and rights.`,url,kind:'Product document'}],
    research:{status:'DOCUMENTED',reviewedAt,summary:preferred?'STRC is preferred stock. The token is a separate tracker certificate; it is not MSTR common stock.':'The reference is a company share. The certificate does not give ownership of particular company assets.',
      facets:{
        issuer:facet('Token issuer','Backed Assets (JE) Limited','Backed Assets\n(JE) Limited','The named issuer is a Jersey company, distinct from the company issuing the referenced share.',sid,'Cover; Part A'),
        instrument:facet('Instrument','Open-ended tracker certificate','Tracker\ncertificate',`${documentSymbol} · ISIN ${isin}. The certificate tracks the underlying subject to its terms and adjustments.`,sid,'Part A 1.1; Terms I'),
        reference:facet('Reference asset',`${underlying} (${ticker})`,`${ticker}\n${preferred?'Preferred share':'Common share'}`,`Underlying ISIN ${underlyingIsin}. ${preferred?'The underlying is Strategy’s Series A variable-rate perpetual preferred stock.':'The underlying is common stock, not direct ownership of the company’s property.'}`,sid,'Part A 1.2'),
        backing:facet('Disclosed collateral',`${ticker} underlying securities`,`${ticker} shares\nCollateral`,'The terms designate the underlying as standard collateral and permit lending of underlyings. Current holdings are not audited here.',sid,'Part A 1.2–1.3; Terms IV'),
        custody:facet('Named custodians','Alpaca Securities; InCore Bank; Maerki Baumann','Alpaca · InCore\nMaerki Baumann','The terms list these providers using alternatives. They do not establish the current allocation among providers. Office addresses are not reserve locations.',sid,'Part A 1.1, Custodian(s)'),
        rights:facet('Holder rights','Creditor rights; no shareholder vote','Creditor\nrights','The legal overview describes economic exposure without shareholder voting rights; a security agent represents collateral interests. Product terms govern recovery.', 'xstocks-legal','Legal classification; safeguarding','ISSUER_STATEMENT'),
      },gaps:['Current collateral quantities and allocation by custodian are not independently verified.','Read the base prospectus and supplements together with these dated final terms.'],
    },
  };
}

function bStock({id,symbol,name,slug,isin,underlying,ticker,date,url}) {
  const sid=`${symbol.toLowerCase()}-prospectus`;
  return {
    id,symbol,name,slug,isin,category:'Tokenized equity certificate',family:'equity',color:'#b5aac6',reference:underlying,issuer:'BTech Holdings Ltd',reviewedAt,
    legalLink:'A certificate representing a beneficial interest in disclosed share backing. Holders do not receive direct shareholder voting rights.',
    description:'Trace the certificate to its disclosed share backing.',
    origin:address('ARE-ADGM','Abu Dhabi, United Arab Emirates','United Arab Emirates',24.45,54.38,'The prospectus identifies the certificate issuer as an ADGM company with a registered address in Abu Dhabi. This marker locates issuer jurisdiction, not the underlying company or the custody of its shares.',url,date,'Issuer jurisdiction'),
    sources:[source(sid,`${symbol} prospectus`,'BTech Holdings · ADGM publication',url,date,'Regulator-hosted issuer prospectus',`Identifies ${ticker} share backing, Alpaca custody and certificate-holder rights. Publication by a regulator is not a guarantee of backing.`)],
    events:[{date,title:`${symbol} prospectus dated`,summary:`The reviewed prospectus describes certificates over ${ticker} shares and the issuer’s service-provider arrangements.`,url,kind:'Issuer prospectus'}],
    research:{status:'DOCUMENTED',reviewedAt,summary:`${symbol} is issued by BTech. Its reference is ${ticker} shares; the underlying company does not issue this token.`,
      facets:{
        issuer:facet('Token issuer','BTech Holdings Ltd','BTech\nHoldings Ltd','ADGM company 36283, incorporated on 17 April 2026; a separate certificate issuer.',sid,'Cover; 2.1'),
        instrument:facet('Instrument','Certificate over shares','Share-backed\ncertificate',`${symbol} · ISIN ${isin}. The prospectus describes a beneficial interest in underlying shares.`,sid,'Definitions; 3.1'),
        reference:facet('Reference asset',`${underlying} (${ticker})`,`${ticker}\nCommon share`,'The prospectus identifies the referenced share. This is not ownership of particular facilities, cash reserves or other company property.',sid,'Cover; definition of Underlying'),
        backing:facet('Disclosed collateral',`${ticker} shares, 1:1 certificate entitlement`,`${ticker} shares\n1:1 entitlement`,'Shares are credited to the issuer’s segregated custody account. The 1:1 arrangement is disclosed in the document, not audited here.',sid,'Definitions; 3.1'),
        custody:facet('Named custodian','Alpaca Securities LLC','Alpaca\nSecurities','Alpaca is the underlying-share custodian and broker. Binance NCCL maintains the certificate title ledger; these are different roles.',sid,'Definitions: Alpaca, Custodian, CSD'),
        rights:facet('Holder rights','Beneficial interest; no direct shareholder vote','Beneficial\ninterest','Share redemption uses the documented account and agent process. Cash dividends are reinvested through the multiplier rather than paid directly.',sid,'3.2'),
      },gaps:['Current share balances, token supply reconciliation and custody-account statements are not independently verified.','Eligibility and redemption remain subject to the prospectus and platform procedures.',...(symbol==='MSTRB'?['The prospectus uses different settlement-currency wording in its definitions and securities summary; no single currency is asserted here.']:[])],
    },
  };
}

const ondoCircleUrl='https://www.lb.lt/uploads/prospectuses/docs/62702_27aa32fbbbab06b72927b9cdedf6890a.pdf';
export const expandedPassports = [
  xStock({id:39711,symbol:'STRCX',documentSymbol:'STRCx',name:'Strategy PP Variable xStock',slug:'strategy-pp-variable-tokenized-stock-xstock',isin:'CH1500008482',underlying:'Strategy Series A variable-rate perpetual preferred stock',underlyingIsin:'US5949728530',ticker:'STRC',preferred:true}),
  bStock({id:40213,symbol:'CRCLB',name:'Circle Internet Group bStocks',slug:'circle-internet-group-tokenized-bstocks',isin:'AE000A4AU3B0',underlying:'Circle Internet Group common stock',ticker:'CRCL',date:'2026-06-11',url:'https://www.adgm.com/globalassets/market-disclosure/content/prospectus/btech-holdings-prospectus----11-june---circle-internet-group-bstocks_06_11_2026_16-36-41.pdf'}),
  xStock({id:37003,symbol:'MSTRX',documentSymbol:'MSTRx',name:'Strategy xStock',slug:'microstrategy-tokenized-stock-xstock',isin:'CH1436219633',underlying:'Strategy common stock',underlyingIsin:'US5949724083',ticker:'MSTR'}),
  {
    id:38056,symbol:'CRCLon',name:'Circle Internet Group Tokenized Stock (Ondo)',slug:'circle-internet-group-tokenized-stock-ondo',isin:'VGG7001AAD69',category:'Tokenized equity note',family:'equity',color:'#9fc6bd',reference:'Circle Internet Group common stock',issuer:'Ondo Global Markets (BVI) Limited',reviewedAt,
    legalLink:'A structured debt note tracking total return. It does not confer shareholder voting or information rights.',description:'The Circle share, through an Ondo debt instrument.',origin:circleAddress(ondoCircleUrl,'2025-11-11'),
    sources:[source('crclon-terms','CRCLon final terms','Ondo · Bank of Lithuania publication',ondoCircleUrl,'2025-11-11','Regulator-hosted final terms','Identifies the Circle reference, total-return tracking, issuer and named service providers.'),source('ondo-legal','Ondo legal structure','Ondo',ondoLegal,null,'Issuer documentation','Describes the structured note, security interest and absence of shareholder rights.')],
    events:[{date:'2025-11-11',title:'CRCLon final terms dated',summary:'The reviewed final terms describe a total-return debt instrument referencing Circle shares.',url:ondoCircleUrl,kind:'Product document'}],
    research:{status:'DOCUMENTED',reviewedAt,summary:'CRCLon references Circle shares through an Ondo note. It is distinct from the CRCLX and CRCLB instruments.',
      facets:{
        issuer:facet('Token issuer','Ondo Global Markets (BVI) Limited','Ondo Global\nMarkets (BVI)','The named issuer is a BVI company. Tokenholder obligations and rights are governed by the applicable offering terms.','crclon-terms','Cover; Parties to the series'),
        instrument:facet('Instrument','Structured debt note / total-return tracker','Total-return\ndebt note','CRCLon · ISIN VGG7001AAD69. Reinvested income can change the number of shares represented by each token.','crclon-terms','Part A: Manner of Tracking'),
        reference:facet('Reference asset','Circle Internet Group common stock (CRCL)','CRCL\nCommon share','Underlying ISIN US1725731079; the same reference share does not make different issuers’ tokens interchangeable.','crclon-terms','Information concerning the underlying'),
        backing:facet('Disclosed collateral','Underlying securities and cash in transit','Shares + cash\nin transit','Ondo describes matching security backing plus a buffer and a first-priority security interest for tokenholders. This is a published claim, not our audit.','ondo-legal','Legal structure','ISSUER_STATEMENT'),
        custody:facet('Named custodians','Alpaca Securities; BitGo Trust Company','Alpaca + BitGo\nNamed in terms','The dated terms name both providers; they do not establish current allocation. Ankura is named as security and verification agent.','crclon-terms','Parties: Custodians, Security Agent'),
        rights:facet('Holder rights','Value redemption; no shareholder vote','Value-redemption\nrights','Ondo describes redemption for the value of the underlying, subject to terms, without the underlying company’s voting or information rights.','ondo-legal','Tokenholder ownership and rights','ISSUER_STATEMENT'),
      },gaps:['Current collateral balances and allocation between service providers are not independently verified.','The reviewed final terms are dated 11 November 2025; subsequent supplements and current offering materials also matter.'],
    },
  },
  bStock({id:40217,symbol:'SPCXB',name:'SpaceX bStocks',slug:'spacex-tokenized-bstocks',isin:'AE000A4AVAW6',underlying:'Space Exploration Technologies common stock',ticker:'SPCX',date:'2026-06-12',url:'https://www.adgm.com/globalassets/market-disclosure/content/prospectus/btech-holdings-prospectus---12-june-2026---spacex-bstocks_06_12_2026_17-32-11.pdf'}),
  bStock({id:40536,symbol:'MSTRB',name:'Strategy bStocks',slug:'strategy-tokenized-bstocks',isin:'AE000A4AU3A2',underlying:'Strategy common stock',ticker:'MSTR',date:'2026-06-22',url:'https://www.adgm.com/globalassets/market-disclosure/content/prospectus/btech-holdings-prospectus---strategy-bstocks_06_23_2026_09-00-54.pdf'}),
  {
    id:38273,symbol:'USDon',name:'Ondo U.S. Dollar Token',slug:'us-dollar-tokenized-currency-ondo',category:'USD settlement token',family:'cash',color:'#b9c99b',reference:'U.S. dollar cash or equivalents',issuer:'Ondo Stocks (platform attribution)',reviewedAt,
    legalLink:'Published documentation describes a USD-backed settlement token. Standalone USDon legal-issuer and recovery terms were not established by the public materials reviewed.',description:'Trace the settlement token to the published cash-backing mechanism.',
    sources:[source('usdon-mechanism','USDon backing and conversion','Ondo',ondoCash,null,'Platform documentation','Describes dollar cash or equivalents, the stablecoin swapper and its access/liquidity limits.'),source('usdon-addresses','Official token addresses','Ondo',ondoAddresses,null,'Contract directory','Identifies USDon separately from USDY and the stock tokens.'),source('usdon-contracts','Settlement contract documentation','Ondo',ondoContracts,null,'Technical documentation','Describes USDon in the GMTokenManager mint and redemption flow.')],events:[],
    research:{status:'PARTIAL',reviewedAt,issuerRole:'Platform attribution',issuerEdge:'operates platform',summary:'USDon is a cash-settlement token. Its documented mechanism is researched; standalone legal-issuer and recovery terms remain unresolved.',
      facets:{
        issuer:facet('Platform / legal issuer','Ondo Stocks; legal issuer unresolved','Ondo Stocks\nPlatform','The public docs call USDon the platform’s native stablecoin. They do not establish its separate legal-issuer terms in this review.','usdon-mechanism','Forms of payment','PARTIAL'),
        instrument:facet('Instrument','USD settlement token','USD settlement\ntoken','The official contract directory identifies USDon as the token used for swaps into and out of Ondo Stocks. It is a different token from USDY.','usdon-addresses','Ondo Stocks / USDon','ISSUER_STATEMENT'),
        reference:facet('Reference asset','U.S. dollar value','U.S. dollar','The documented unit is dollar value, rather than a company share.','usdon-mechanism','Forms of payment','ISSUER_STATEMENT'),
        backing:facet('Disclosed backing','Cash or equivalents at an Ondo Stocks brokerage account','USD cash\nor equivalents','Ondo states that each USDon has one dollar of cash or equivalents in a brokerage account. No account-level balance is verified here.','usdon-mechanism','Forms of payment','ISSUER_STATEMENT'),
        custody:facet('Custody detail','Brokerage account; provider allocation unresolved','Brokerage account\nProvider unresolved','The reviewed USDon-specific text does not identify the account-level custodian or jurisdiction. Custodians from equity-note terms are not automatically assigned to USDon.','usdon-mechanism','Forms of payment','PARTIAL'),
        rights:facet('Conversion / legal rights','1:1 swap mechanism; legal recovery unresolved','USDon ↔ USDC\nConditional swap','Docs describe 1:1 swaps subject to available swapper liquidity and whitelisting. This mechanism does not establish unconditional redemption or insolvency rights.','usdon-mechanism','Forms of payment; Redeeming','PARTIAL'),
      },gaps:['A USDon-specific legal-issuer document and insolvency/recovery terms were not established in the public sources reviewed.','The account-level custodian, jurisdiction and live balances remain unverified.','USDC conversion depends on whitelist access and swapper liquidity; no universal instant-redemption promise is made.'],
    },
  },
  xStock({id:37005,symbol:'CRCLX',documentSymbol:'CRCLx',name:'Circle xStock',slug:'circle-tokenized-stock-xstock',isin:'CH1436219773',underlying:'Circle Internet Group common stock',underlyingIsin:'US1725731079',ticker:'CRCL'}),
];
