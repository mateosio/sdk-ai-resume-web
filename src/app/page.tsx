'use client';


export default function Chat() {
 
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      

      <form >
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          
          placeholder="Ask something..."
         
        />
      </form>
    </div>
  );
}
