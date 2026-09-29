import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {createMarketService as createCore} from './market-core.mjs';
export {ProviderError} from './market-core.mjs';

export function createMarketService({persist=true,cacheDir=new URL('../.cache/',import.meta.url),...options}={}) {
  const storage=persist?{
    async load(){return JSON.parse(await readFile(new URL('market-state.json',cacheDir),'utf8'));},
    async save(value){
      await mkdir(cacheDir,{recursive:true});
      const temp=new URL('market-state.next.json',cacheDir),target=new URL('market-state.json',cacheDir);
      await writeFile(temp,JSON.stringify(value));await rename(temp,target);
    },
  }:null;
  return createCore({...options,storage});
}
