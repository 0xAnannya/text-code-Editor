import * as esbuild from "esbuild-wasm"
import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";
import ReactDOM from "react-dom";
import { useState ,useEffect, useRef} from "react";

const App:React.FC= () => {

    const ref = useRef<any>();    
const [input, setinput] = useState("");
const [code, setcode] = useState("");
    
const startService = async () => {
    ref.current = await esbuild.startService({
        worker: true,
        wasmURL: "/esbuild.wasm"
    });

    }
    
    useEffect(() => {
        startService();
    },[])
//wants to access service here therefore using refs
//we can also useRefs to keep a reference to any kind of js value inside of a component
//
const onClick =async () => {
    if (!ref.current) {
        return;
    }
    const result = await ref.current.build({
       
        entryPoints: ['index.js'],
        bundle: true,
        write: false,
        plugins: [unpkgPathPlugin()],
        define: {
            'process.env.NODE_ENV': '"production"',
            global:'window', 
            
        }
         
    }) 
    
    setcode(result.outputFiles[0].text)
   
}


    return (
        <div>
            <textarea value={input} onChange={(e)=> setinput(e.target.value)}></textarea>
            <button onClick={onClick}>Submit</button>
            <pre>{ code}</pre>
        </div>
    )
};


ReactDOM.render(<App/>, document.querySelector("#root"))