import {defineConfig,loadEnv} from 'vite';
import react from '@vitejs/plugin-react';
import {createApi} from './server/api.mjs';

export default defineConfig(({mode})=>{
  const env=loadEnv(mode,process.cwd(),'');
  return {
    plugins:[react(),{name:'rwa-market-api',configureServer(server){
      server.middlewares.use(createApi({key:process.env.CMC_API_KEY||env.CMC_API_KEY||'',refreshMs:15*60*1000}));
    }}],
    server:{host:'127.0.0.1',port:4317,strictPort:true},
    build:{outDir:'dist/client'},
  };
});
