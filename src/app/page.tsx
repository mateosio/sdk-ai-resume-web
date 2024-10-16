'use client';

import { useState, useEffect, useRef } from "react";
import { urlSchema } from "@/schemas/inputUrlSchema";
import { scrapUrl } from "@/features/scrapUrl";
import 'animate.css';

export default function InputURL() {
  const [input, setInput] = useState("");
  const [error, setError] = useState<false | string>(false);
  const [summary, setSummary] = useState<false | string>(false);
  const [modelComplete, setModelComplete] = useState(false);
  const [messageComplete, setMessageModelComplete] = useState("Aguarda un instante, estamos preparando todo para ti..");
  const worker = useRef<Worker | null>(null);

  useEffect(() => {
      // Create a web worker if not exists.
      if (!worker.current) {
          worker.current = new Worker(new URL('./worker.js', import.meta.url));
          

          // Listen message from Web Worker
          worker.current.onmessage = (event) => {
              if (event.data.status === 'complete') {
                console.log("ingrese al complete del mensaje", event.data.output[0].summary_text);
                
                  setSummary(event.data.output[0].summary_text); 
              } else {
                  console.log("Progreso de carga del modelo: ", event.data);
                  if (event.data.status === "ready"){
                    setModelComplete(true);
                  }
              }
          };

          // No destruir el Web Worker al desmontar
      }

      return () => {
         
      };
  }, []);

  const handleResume = async (e: React.FormEvent) => {
    e.preventDefault();
    setSummary("");
    const urlValidate = urlSchema.safeParse({inputUrl: input});
    
    if(!urlValidate.success){
      console.log("invalid schema");
      
      setError(urlValidate.error.errors[0].message);
      setTimeout(()=>{
        setError(false)
      }, 2000);
      return;
    };
    // const generateText =  async (input : string)=>{
    //   const response = await fetch('http://127.0.0.1:8000/generate', {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify({prompt: input})
    //   })
    //   const data = await response.json();
    //   return data.generated_text;
    // }
    // const text = await generateText("Que es la primavera?");
    // setText(text);

    // Llamar a la funcion de scraping
    console.log("no debería hacer scraping");
    const content = await scrapUrl(input);
    
    if (worker.current) {
        console.log("existe worker.current");
           // Enviar texto al Web Worker para resumirlo
           worker.current.postMessage(content);
        }
      setInput("");
  };

 
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {summary && 
      <div>{summary}</div>
      }
      {!modelComplete && 
      <>
      <div className="text-center">{messageComplete}</div>
      <div className="flex justify-center mt-10">
        <span className="loader"></span>
      </div>
      </>
      }

      {modelComplete && 
      <form onSubmit={handleResume}>
        <input
          className="animate__animated animate__bounceInUp fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          onChange={(e)=>{setInput(e.target.value)}}
          placeholder="Pega la URL de la web que queres resumir..."
          onKeyUp={(e)=>{
            if(e.key === "Enter"){
              handleResume(e)
            }
          }}
         
        />
        {error && <p>{error}</p>}
      </form>}
    </div>
  );
}
