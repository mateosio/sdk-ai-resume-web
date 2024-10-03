'use client';

import { useState, useEffect, useRef } from "react";
import { urlSchema } from "@/schemas/inputUrlSchema";
import { scrapUrl } from "@/features/scrapUrl";

export default function InputURL() {
  const [input, setInput] = useState("");
  const [error, setError] = useState<false | string>(false);
  const [summary, setSummary] = useState(false);
  const worker = useRef<Worker | null>(null);

  useEffect(() => {
      // Create a web worker if not exists.
      if (!worker.current) {
          worker.current = new Worker(new URL('./worker.js', import.meta.url));
          

          // Escuchar mensajes del Web Worker
          worker.current.onmessage = (event) => {
              if (event.data.status === 'complete') {
                console.log("ingrese al complete del mensaje", event.data.output[0].summary_text);
                
                  setSummary(event.data.output[0].summary_text); 
              } else {
                  console.log("Progreso de carga del modelo: ", event.data);
              }
          };

          // No destruir el Web Worker al desmontar
      }

      return () => {
         
      };
  }, []);

  const handleResume = async (e: React.FormEvent) => {
    e.preventDefault();
        
    const urlValidate = urlSchema.safeParse({inputUrl: input});
    if(!urlValidate.success){
      console.log("invalid schema");
      
      
      setError(urlValidate.error.errors[0].message);
      return;
    };
    
    // Llamar a la funcion de scraping
    const content = await scrapUrl(input);
    if (worker.current) {
      console.log("existe worker.current");
         // Enviar texto al Web Worker para resumirlo
         worker.current.postMessage(content);
      }
  };

 
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {summary && 
      <div>{summary}</div>
      }

      <form onSubmit={handleResume}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          onChange={(e)=>{setInput(e.target.value)}}
          placeholder="Paste the url of the web you want resume..."
          onKeyUp={(e)=>{
            if(e.key === "Enter"){
              handleResume(e)
            }
          }}
         
        />
        {error && <p>{error}</p>}
      </form>
    </div>
  );
}
