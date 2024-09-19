import { pipeline, env } from "@xenova/transformers";

// Skip local model check.
env.allowLocalModels = false;

const task = "summarization";
const model = "facebook/bart-large-cnn";
let instance = null;

// Use the Singleton pattern to enable lazy construction of the pipeline.
const getInstance = (progress_callback = null) => {
  if (instance === null) {
    instance = pipeline(task, model, { progress_callback });
  }
  return instance;
};

// Listen for messages from the main thread
self.addEventListener("message", async (event) => {
  // Retrieve the classification pipeline. When called for the first time,
  // this will load the pipeline and save it for future use.
  const classifier = await getInstance((progress) => {
    // We also add a progress callback to the pipeline so that we can
    // track model loading in the main thread.
    self.postMessage(progress);
  });

  // Actually perform the classification
  let output = await classifier(event.data.text);

  // Send the output back to the main thread
  self.postMessage({
    status: "complete",
    output: output,
  });
});
