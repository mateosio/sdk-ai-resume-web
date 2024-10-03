"use server"
import puppeteer from "puppeteer";

export const scrapUrl =  async (url: string)=>{
const browser = await puppeteer.launch();
const page = await browser.newPage();

page.on('console', async (msg) => {
  console.log("msg", msg);
  
    const args = await Promise.all(msg.args().map(arg => arg.jsonValue())); // Obtener el valor real de los argumentos
    console.log(`Browser console log:`, ...args);
  });

await page.goto(url, { waitUntil: 'networkidle2' });

const content = await page.evaluate(()=>{
    const content = document.body.innerText;
    return content;
});

void browser.close();
return content;
}