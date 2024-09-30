'use client';

import { useState, useEffect, useRef } from "react";
import { urlSchema } from "@/schemas/inputUrlSchema";

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

  const handleResume = (e: React.FormEvent) => {
    e.preventDefault();
    
    const urlValidate = urlSchema.safeParse({inputUrl: input});
    if(!urlValidate.success){
      console.log("invalid schema");
      
      
      setError(urlValidate.error.errors[0].message);
      return;
    };
    
    if (worker.current) {
      console.log("existe worker.current");
         // Enviar texto al Web Worker para resumirlo
         worker.current.postMessage("Un cuento es un tipo de narración generalmente breve, basada en hechos reales o ficticios, en la cual un grupo de personajes desarrollan una trama relativamente sencilla. En el ámbito literario es uno de los subgéneros de la narrativa, ampliamente cultivado por escritores de muy distintas tradiciones. También existen cuentos populares, transmitidos oralmente o que pertenecen al acervo de la cultura informal.Aunque el ser humano ha sido afecto a contar historias desde sus orígenes, no siempre lo hizo bajo los paradigmas del cuento. Antiguamente se contaban leyendas y relatos orales, con algún fin pedagógico, que los hacía cercanos a la fábula.En otros casos se contaban relatos mitológicos que explicaban el origen del mundo o algún episodio de alguna deidad o algún héroe específicos. Hoy en día, en cambio, se los cultiva como una forma artística en sí misma.El cuento es un género moderno. Su nombre proviene del latín computus, “cálculo”, ya que se trata, en el fondo, de enumerar los acontecimientos que componen la trama.Por otro lado, sus tramas suelen contraponerse a las de las novelas por su extensión, ya que estas últimas suelen ser más voluminosas. Sin embargo, ese criterio es discutible, ya que la frontera entre un cuento largo y una novela breve puede ser muy estrecha.A lo largo de la historia, muchos autores han hecho del cuento su género predilecto, y lo han cultivado obteniendo así verdaderas obras de arte. Entre ellos destacan: Edgar Allan Poe (1809-1849), Guy de Maupassant (1850-1893), Jorge Luis Borges (1899-1986), Ernest Hemingway (1899-1961) y Ryonosuke Akutagawa (1892-1927) y muchos otros" );
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
