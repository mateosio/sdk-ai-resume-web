import { pipeline, env } from "@xenova/transformers";

// Skip local model check.
env.allowLocalModels = false;

const task = "summarization";
const model = "Xenova/t5-small";
let instance = null;


// Use the Singleton pattern to enable lazy construction of the pipeline.
const getInstance = async (progress_callback = null) => {
  if (instance === null) {
    instance = await pipeline(task, model, { progress_callback });
    console.log("Modelo cargado exitosamente.", instance);
  }
  return instance;
};

const resumeModelInstance = getInstance((progress) => {
  // We also add a progress callback to the pipeline so that we can
  // track model loading in the main thread.
  self.postMessage(progress);
});


// Listen for messages from the main thread
self.addEventListener("message", async (event) => {
  // Retrieve the classification pipeline. When called for the first time,
  // this will load the pipeline and save it for future use.
  console.log("Llego el mensaje al web worker", event.data);
  const modelInstance = await resumeModelInstance;
  if(typeof modelInstance === 'function'){
    let output = await modelInstance(event.data, {
      min_length: 70,
      max_length: 180
    });
    console.log("este es el resumen", output);
  
    // Send the output back to the main thread
    self.postMessage({
      status: "complete",
      output: output,
    });
  } else{
    console.log("modelo aun no ha cargado y no puede ejecutar la peticion");
    
  }

});
