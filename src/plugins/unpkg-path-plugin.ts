// all this is hijacking the natural process of esbuild ...(dont look in the files)
//onResolve and onLoad are overriding the natural process of esBuild
import axios from 'axios';
import * as esbuild from 'esbuild-wasm';
 //function declaration that  returns an object
export const unpkgPathPlugin = () => {
 
    //object is a plugin that works inside esbuild
    return {
        
    //name will be used to identify the plugin for debugging
    name: 'unpkg-path-plugin',
    
    //SETUP --> will be called automatically by esbuild with single arg called build
    // (representing bundling process) and process is.
    //finding file -->loading it -->parsing it -->joining diff files together
    //we will interact with build to infere its stuff
    //we interact using event listeners to listen to onLoad and onResolve events    
      
    setup(build: esbuild.PluginBuild) {
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        //figuring out where is index.js is ...onResolve is used (it finds the path of entry point)
        //filter--> is used bcoz there are diffrent versions of onResolve that should run with diff kind of files 
        console.log('onResolve', args);  

        if (args.path === 'index.js') {
          return { path: args.path, namespace: 'a' };   //path of the file is returned
        }

        if (args.path.includes('./') || args.path.includes('../')) {
          return {
            namespace: 'a',
            path: new URL(args.path, 'https://unpkg.com'+ args.resolveDir + '/').href,
          };
        }

        return {
          namespace: 'a',
          path: `https://unpkg.com/${args.path}`,
        }
        
      });
        //NAMESPACE -it allows us to say here's a set of files and we want to apply onLoad function to those files...
          //basicallly onResolve se namespace add hokar aata hai and if onLoad mein namespace match nhi karta to nhi chalega
      
        //FILTER - we might have another onResolve and that should run with diff kind of file
          //so we control when those onResolves and onLoads are executed using these filter expressions 

      build.onLoad({ filter: /.*/, namespace:'a' }, async (args: any) => {   //attempt tto load hte entry point vala file
          console.log('onLoad',args)

        if (args.path === 'index.js') {  //we are giving the code instead
          return {
            loader: 'jsx',// if it finds any import ,require, export ..ehich it will toh ek baar aur onResolve will run and that will return the path and then again onLoad will run
            contents: `   
             import React, {useState} from 'react'; 
              console.log(React, useState);
            `,
          }
          };

          const { data, request } = await axios.get(args.path);
          
          return {
            loader: 'jsx',
            contents: data,
            resolveDir: new URL("./", request.responseURL).pathname,

            //RESOLVEDIR--> is going to be provided to the next file that we try to require...
                          //and its going to escribe where we found the the original file ..i.e.->where did we find nested-test-pkg
          }
        
          //importing a pkg directly from npm        
        
      });
    },
  };
};