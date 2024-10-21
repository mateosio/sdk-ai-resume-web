'use client';

import { useEffect, useState } from "react";
import { urlSchema } from "@/schemas/inputUrlSchema";
import { scrapUrl } from "@/features/scrapUrl";
import 'animate.css';
import { CohereClient } from "cohere-ai";
import { Alert, Stack } from "@mui/material";

const cohere = new CohereClient({
  token: "L6A6PtskyBFUm0T8zBw3mKSmKVW4NWC5jXMqHe77",
});

export default function InputURL() {
  const [input, setInput] = useState("");
  const [showAlertURL, setShowAlertURL] = useState<false | true>(false);
  const [summary, setSummary] = useState<false | string>(false);
  const [welcome, setWelcome] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("Welcome to resume web!");
 
  
  
  //DESCOMENTAR en el caso de querer usar un web worker para trabajar con un modelo de hugin face con transformer.js.
  
  // import { useEffect, useRef } from "react";
  // const [error, setError] = useState<false | string>(false);
  // const [messageComplete, setMessageModelComplete] = useState("Aguarda un instante, estamos preparando todo para ti..");
  // const worker = useRef<Worker | null>(null);
  // const [modelComplete, setModelComplete] = useState(false);

  // useEffect(() => {
  //     // Create a web worker if not exists.
  //     if (!worker.current) {
  //         worker.current = new Worker(new URL('./worker.js', import.meta.url));


  //         // Listen message from Web Worker
  //         worker.current.onmessage = (event) => {
  //             if (event.data.status === 'complete') {
  //               console.log("ingrese al complete del mensaje", event.data.output[0].summary_text);

  //                 setSummary(event.data.output[0].summary_text); 
  //             } else {
  //                 console.log("Progreso de carga del modelo: ", event.data);
  //                 if (event.data.status === "ready"){
  //                   setModelComplete(true);
  //                 }
  //             }
  //         };

  //         // No destruir el Web Worker al desmontar
  //     }

  //     return () => {

  //     };
  // }, []);
useEffect(()=>{
  setTimeout(() => {
    console.log("Se volvio a ejecutar el set Time out");
    
    setWelcome(true)
  }, 1500);
}, [])
  
  const handleResume = async (e: React.FormEvent) => {
    e.preventDefault();
    setSummary("");
    const urlValidate = urlSchema.safeParse({ inputUrl: input });

    if (!urlValidate.success) {
      console.log("invalid schema");

      setShowAlertURL(true);
      setTimeout(() => {
        setShowAlertURL(false)
      }, 2000);
      return;
    };

    setWelcomeMessage("We are processing the data");
    setWelcome(false);

    // Llamo a la funcion de scraping
    const content = await scrapUrl(input);

    // DESCOMENTAR en caso de querer usar la logica del modelo que se carga desde el web worker con transformer.js.
    // if (worker.current) {
    //     console.log("existe worker.current");
    //        // Enviar texto al Web Worker para resumirlo
    //        worker.current.postMessage(content);
    //     }
    const response = await cohere.generate({
      model: "command-r-08-2024",
      prompt: `Hace un resumen de lo mas importante del siguiente texto: ${content}`,
      maxTokens: 300,
      temperature: 0.9,
      k: 0,
      stopSequences: [],
      returnLikelihoods: "NONE"
    });

    setWelcome(true);
    setSummary(response?.generations[0].text)
    console.log(`Respuesta del modelo: ${response.generations[0].text}`);
    setInput("");
  };


  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {summary &&
        <div>{summary}</div>
      }

      {!welcome &&
        <>
          <div className="text-center">{welcomeMessage}</div>
          <div className="flex justify-center mt-10">
            <span className="loader"></span>
          </div>
        </>
      }

      {welcome &&
        <form onSubmit={handleResume}>
          <input
            className="animate__animated animate__bounceInUp fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
            value={input}
            onChange={(e) => { setInput(e.target.value) }}
            placeholder="Pega la URL de la web que queres resumir..."
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                handleResume(e)
              }
            }}

          />
        </form>}

        {showAlertURL && (
        <Stack className="alert_container">
          <Alert
            sx={{ maxWidth: "100%", minWidth: "100%" }}
            severity="info"
            variant="filled"
          >
            You must put a valid URL
          </Alert>
        </Stack>
      )}
    </div>
  );
}
