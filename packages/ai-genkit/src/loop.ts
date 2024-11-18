export function loop(generate) {
  
  
  const lfn = async function(params) {
    console.log('genkit loop...');
    console.log(params);
    
    return await generate(params);
    
    
  }
  return lfn;
}
