// Generate traits using the palette and object probability lists generated by traits_lists_from_parameters.js

///////////////////////////////////////////////////////////////////////////////////////////////////////
// functions
///////////////////////////////////////////////////////////////////////////////////////////////////////
seed = 780997;
increment = 1003;
nCallsRandomIntFunc = 0; // used for debugging

function randomInt() {
    nCallsRandomIntFunc++;
    // returns value between 0 and 100
    seed = (1664525 * seed + increment) % 89652912;
    return seed % 101;
}

function pickFromProbabilityArray(arr) {
    // arr is 1d array containing groups of 3 int each
    // the first int is assumed to be the probability
    if (arr.length == 3) {
        return arr;
    }
    let pick = randomInt() % (arr.length-3);
    let pickIndex = Math.floor(pick / 3) * 3;
    for (let i = 0; i < 100; i++) {
        let r = randomInt();
        let candidate = r % arr.length;
        let candidateIndex = Math.floor(candidate / 3) * 3;
        let candidateProbability = arr[candidateIndex];
        if (candidateProbability > randomInt()) {
            pickIndex = candidateIndex;
            break;
        }
    }
    let pickArray = arr.slice(pickIndex, pickIndex+3)
    return pickArray;
}

function generatePaletteTraits(probabilities) {
    // returns array of 3 integers
    // Format: [probability, index, trait name index]
    return pickFromProbabilityArray(probabilities);
}

function generateObjectTraits(probabilities) {
    /*
    returns array of integers where each 3 consecutive ones represent an object
    Format: [
       object index, material index, trait name index,
       object index 2, material index 2, trait name index 2,
       ...
    ]
    */

    let currentObjectProbability = -1;
    let currentObjectIndex = -1;
    let currentObjectMaterialProbabilities = [];
    let objects = [];
    for (let i = 0; i < probabilities.length; i++){
        let v = probabilities[i];
        if (v == 255) {
            if (currentObjectProbability > randomInt()) {
                let material = pickFromProbabilityArray(currentObjectMaterialProbabilities);
                let materialIndex = material[1];
                let materialTraitName = material[2];
                objects.push(currentObjectIndex);
                objects.push(materialIndex);
                objects.push(materialTraitName);
            }
            currentObjectProbability = -1;
            currentObjectIndex = -1;
            currentObjectMaterialProbabilities = [];
        } else if (currentObjectProbability == -1) {
            currentObjectProbability = v;
        } else if (currentObjectIndex == -1) {
            currentObjectIndex = v;
        } else {
            currentObjectMaterialProbabilities.push(v);
        }
    }
    return objects;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
// data
///////////////////////////////////////////////////////////////////////////////////////////////////////

// Text traits unicode strings. The index in this array matches the text trait index in the materials array in objectProbabilities.
// For example this object probability array [100,[1],0,[[100,21,30]]] means:
// 100% probability, axis 1, object 0, material 21, material probability 100, text trait 30
text_traits = [
    "\u2417\u0040\u0030\u2410\u004b\u0060\u0024",
    "\u002e\u2412\u2403\u0072\u006b\u0043",
    "\u240b\u005b\u006c\u0071\u004d\u0069\u007c",
    "\u2414\u0054\u240a\u240f\u2411\u0027\u241c",
    "\u240c\u0054\u2418\u2418\u0040\u007a\u240b",
    "\u241c\u0069\u0068\u007d\u0054\u2409\u0051",
    "\u0029\u2405\u0043\u0033\u0052\u0040\u0064\u2404\u0047\u0060\u007c\u002b\u240b\u003b\u0032",
    "\u0064\u002d\u2401\u0032\u2411\u0075\u006b\u0024\u0057\u0020\u0024\u002a\u0059\u240f\u0078",
    "\u0021\u003f\u241f\u0035\u0051\u007a\u0069\u006f\u0025\u0078\u2411\u241e\u0046\u004b\u0029",
    "\u0063\u0058\u2400\u002a\u002b\u0035\u0026\u0042\u0076\u0072\u0078\u002f\u0064\u0078\u0053",
    "\u0065\u2409\u0024\u241a\u0039\u0052\u241d\u2410\u003f\u0061\u0027\u002b\u0074\u007e\u0062",
    "\u2408\u0037\u0023\u0036\u0023\u0023\u007b\u241d\u005b\u240f\u0032\u0024\u002c\u004b\u241b",
    "\u0044\u2404\u0031\u0071\u0064\u0035\u240d\u0041\u007d\u004d\u2417\u0034\u004d\u002e\u0027",
    "\u0066\u2402\u2421\u003a\u2411\u0066\u007b\u0049\u241c\u004e\u0047\u0050\u006d\u2412\u005a",
    "\u2406\u0049\u004d\u2415\u2418\u241b\u0021\u002c\u240f\u003b\u0075\u0076\u0048\u0078\u005b",
    "\u0032\u0024\u240f\u004a\u003a\u0030\u0076\u0033\u0061\u0069\u0059\u0035\u0028\u0033\u2418",
    "\u2421\u240b\u0048\u0043\u005f\u0043\u0043\u2414\u0028\u0029\u0060\u241c\u0075\u240d\u241f",
    "\u007a\u2403\u0063\u0071\u0048\u2413\u0023\u2404\u007d\u0058\u0072\u0029\u0035\u0028\u0033",
    "\u007a\u0027\u0024\u2410\u0052\u0077\u004d\u007e\u0021\u2404\u0075\u0062\u240e\u0047\u0074",
    "\u0041\u0059\u2419\u0047\u005d\u0060\u0079\u241a\u0076\u0075\u0065\u0074\u2416\u0067\u0071",
    "\u0036\u2408\u0023\u005e\u241c\u0039\u006d\u240e\u0024\u002f\u0079\u0060\u0042\u007c\u2410",
    "\u0048\u006e\u240f\u241c\u0035\u007b\u2412\u002e\u0055\u007b\u0040\u0057\u240b\u2407\u002f",
    "\u002c\u005e\u006b\u0036\u0025\u0029\u002d\u0034\u0056\u2400\u240f\u003c\u0056\u0078\u0059",
    "\u0063\u0075\u240f\u002f\u007e\u2407\u2408\u003d\u0032\u0052\u0064\u0039\u240d\u0065\u2409",
    "\u0047\u2405\u003f\u005e\u2412\u007c\u0065\u0054\u0030\u0068\u0053\u0060\u0023\u0028\u005e",
    "\u2405\u0023\u240c\u003d\u0024\u002a\u0027\u006b\u241d\u005a\u0037\u0024\u0070\u002e",
    "\u002f\u2400\u002a\u241c\u003d\u0028\u0024\u004e\u004d\u2416\u2410\u005f\u0061\u0029\u0036",
    "\u240d\u0033\u0024\u0056\u0076\u0047\u003b\u007a\u0061\u2410\u003a\u0035\u002e\u2415\u002a",
    "\u007a\u2407\u004e\u0054\u2411\u240f\u2417\u0075\u007e\u0067\u003f\u0063\u0054\u2416\u0023",
    "\u2419\u0061\u0039\u0060\u0055\u0042\u0028\u003c\u0056\u241d\u006c\u006f\u0064\u0069\u0040",
    "\u0069\u0024\u0067\u0024\u241b\u0059\u2409\u0033\u002a\u0057\u0038\u006b\u0037\u007d\u0038",
    "\u007a\u0024\u240d\u002f\u2405\u0038\u0037\u004c\u003c\u0033\u241e\u0028\u2414\u007d\u0028",
    "\u0032\u0051\u004c\u0043\u0020\u003b\u0054\u0021\u0032\u0028\u241f\u003d\u002d\u005a\u241b",
    "\u2406\u241a\u0063\u0041\u0044\u0058\u007e\u0040\u0047\u0070\u004b\u0066\u0076\u0047\u005f",
    "\u0074\u0078\u0027\u0033\u2404\u002e\u0078\u0077\u0068\u0044\u003f\u0055\u0074\u004a",
    "\u0031\u0045\u0067\u241c\u2415\u241e\u240d\u007b\u2405\u2400\u0038\u007c\u241c\u002f\u0063",
    "\u0073\u2402\u0048\u0037\u2403\u0049\u0037\u0059\u004c\u0071\u0075\u0028\u241d\u240c\u0052",
    "\u0048\u241e\u003b\u0064\u005e\u0039\u005e\u002b\u004f\u0073\u0048\u0059\u0029\u0056\u0043",
    "\u240f\u004c\u2409\u0038\u0033\u002f\u240a\u002f\u0049\u241e\u0024\u240c\u2414\u0076\u004d",
    "\u2401\u2418\u0035\u003f\u003a\u2419\u0071\u0042\u241e\u002e\u0047\u0059\u003e\u0032\u0041",
    "\u0079\u0072\u2419\u0076\u240d\u0067\u0039\u003d\u0079\u0055\u0064\u0042\u002b\u0023\u007c",
    "\u0071\u0047\u0039\u003e\u0049\u0074\u2418\u0070\u0020\u0063\u0048\u0027\u0029\u0059\u0024",
    "\u2402\u0054\u007d\u0038\u005f\u2414\u007e\u004b\u002d\u241a\u0044\u003a\u2421\u0037\u006c",
    "\u0058\u2411\u0034\u0057\u0063\u240e\u003f\u0036\u241e\u241b\u2407\u0027\u005f\u2402\u2406",
    "\u0046\u0039\u0038\u0068\u0033\u2416\u0070\u005b\u005e\u0028\u002c\u005b\u0025\u240d\u2413",
    "\u0067\u0065\u007c\u0075\u0026\u004d\u0070\u240e\u0048\u0036\u0027\u0071\u002a\u0026\u2419",
    "\u0031\u2400\u240c\u2403\u006a\u005a\u0061\u0071\u2409\u0035\u005d\u0050\u0060\u240f\u006b",
    "\u0069\u2407\u0067\u004a\u0077\u0051\u0050\u2407\u0074\u0040\u0064\u002d\u003a\u0066\u2407",
    "\u0047\u0073\u2418\u2412\u0046\u003f\u2417\u005b\u006a\u0052\u2417\u0062\u0033\u0043\u2404",
    "\u240b\u002c\u0051\u006a\u003d\u007a\u007d\u007c\u2404\u0037\u003a\u0024\u0064\u240b\u006c",
    "\u0070\u0040\u003c\u2414\u0067\u2415\u002e",
    "\u0037\u2405\u2407\u004e\u0066\u2418\u2408",
    "\u0055\u2419\u2406\u0028\u0043\u0049\u0059",
    "\u0028\u0079\u240c\u0033\u0024\u2418\u0054",
    "\u0068\u0024\u005e\u240e\u2413\u0064\u0072",
    "\u0079\u005f\u0020\u005f\u007a\u005a\u0047",
    "\u002f\u2421\u004b\u004b\u240a\u0074\u0069",
    "\u2415\u0055\u005a\u0037\u007e\u0035\u0061",
    "\u003e\u006c\u2415\u2402\u2419\u0049\u2402",
    "\u0074\u006d\u240b\u003a\u003d",
    "\u0070\u0056\u241e\u2409\u0064",
    "\u0060\u006e\u003b\u004e\u240c",
    "\u241f\u0069\u0027\u0075\u2401\u0055\u2417",
    "\u0049\u0062\u240d\u0043\u241a\u0056\u241d",
    "\u241d\u0024\u0070\u0061\u0039\u0045\u2407",
    "\u0021\u2402\u004f\u0053\u006a\u0072\u0033",
    "\u2409\u0079\u0025\u0039\u002a\u003d\u0063",
    "\u2417\u240b\u240b\u2411\u241a\u240d\u2412\u2414\u2401\u2409\u2415\u2419\u2403\u2401\u241f\u240b",
    "\u2403\u2400\u240a\u240d\u2411",
    "\u2418\u2415\u2421\u240c\u240b",
    "\u2403\u240f\u241c\u2407\u2404",
    "\u2409\u2411\u2406\u241c\u2415",
    "\u2400\u241c\u2419\u241b\u2421",
    "\u240c\u2400\u240f\u240e\u2408",
    "\u240c\u2408\u241f\u240e\u240d",
    "\u2410\u2403\u2408\u2416\u241b",
    "\u240b\u2417\u2401\u2419\u2416",
    "\u2411\u2412\u2400\u2409\u2410",
    "\u2416",
    "\u2417\u2409\u240b\u241f\u240a\u240b\u2404",
    "\u2421\u2402\u2400\u241d\u2416\u2418\u240a",
    "\u240b\u2411\u2405\u241a\u2411\u2403\u2401",
    "\u2401\u240e\u240d\u2407\u2404\u241e\u2410",
    "\u240d\u2412\u2414\u2401\u2409\u2415\u2419",
    "\u240c\u2419\u2408\u2414\u240c\u240b\u2419",
    "\u240b\u2401\u2413\u2401\u2411\u2410\u2409",
    "\u240a\u241b\u241e\u240e\u2411\u240e\u240d",
    "\u005a\u007b\u006b\u0058\u2416",
    "\u003f\u2409\u0066\u0035\u0021",
    "\u0032\u0062\u2405\u0072\u0062",
    "\u004d\u2403\u0048\u241a\u241c",
    "\u2410\u0024\u005a\u0024\u0051",
    "\u2404\u0059\u2419\u005b\u0043",
    "\u2412\u240a\u2414",
    "\u0031\u0060\u0035\u003d",
    "\u0059\u0052\u0068\u0043\u240b",
    "\u0034\u240b\u006e\u0049\u0072",
    "\u0032\u2401\u002d\u0030\u2418",
    "\u002f\u0028\u0076\u2407\u002a",
    "\u0060\u007e\u003e\u005e\u0053",
    "\u2413\u003b\u0049\u0042\u0056",
    "\u0031\u0057\u0036\u0069\u0077",
    "\u2419\u007e\u0041\u003a\u004b",
    "\u2400\u003f\u0056\u004c\u003d",
    "\u006f\u0024\u2405\u0026\u003d",
    "\u0057\u241e\u0045\u0032\u0077",
    "\u0068\u004c\u0065\u003e\u0042",
    "\u240e\u004a\u0072\u0033\u240f",
    "\u2414\u0047\u006c\u2400\u0066",
    "\u2406\u004f\u0036\u004c\u2413",
    "\u2403\u0031\u0024\u0027\u002f",
    "\u007c\u0070\u241b\u2407\u2414",
    "\u0050\u003c\u003d\u002f\u0054",
    "\u0070\u2412\u0068\u0044\u0076",
    "\u005a\u003b\u0054\u2411\u0024",
    "\u0078\u0062\u002c\u240e\u0047",
    "\u2409\u0066\u0028\u003b\u0043",
    "\u006f\u002f",
    "\u0072\u0031\u007d\u0077\u0038",
    "\u2412\u241e\u0058\u240f\u2421",
    "\u0033\u2413\u007c\u002e\u0025",
    "\u0047\u002f\u002c\u0061\u0026",
    "\u2421\u240b\u2402\u2400\u241d\u2416\u2418\u240a\u240c\u2419\u2414\u240c",
    // palettes
    "\u002f\u0029\u240c\u0024\u2419\u240d",
    "\u2407\u2419\u2417\u0020\u240b\u2408",
    "\u2419\u0029\u0024\u0026\u241d\u002b",
    "\u002d\u0031\u241a\u2419\u2414\u2401",
    "\u2418\u2416\u0030\u2404\u002c",
    "\u2417\u0027\u2402\u241d\u240f\u0030",
    "\u0031\u2413\u2417\u2400\u0029\u0021",
    "\u240e\u241f\u0027\u240a\u002b\u2409",
    "\u2419\u0024\u2401\u240f\u240a\u0024",
    "\u2405\u0025\u2417\u240f\u0026\u002d",
    "\u0031\u0026\u240a\u2416\u240a\u2402",
    "\u0021\u2416\u2411\u2408\u0032\u240c",
    "\u0029\u241c\u002c\u2413\u2416\u240d",
    "\u241d\u2410\u2405\u2417\u241b\u0030",
    "\u2406\u2400\u240a\u2403\u0026\u2410",
    "\u002f\u240b\u2400\u241c\u2400\u240b",
    "\u2419\u241f\u240e\u0021\u0031",
    "\u0024\u240f\u240b\u0032\u241d\u0028",
    "\u2417\u240f\u0025\u2418\u002b\u0023",
    "\u2411\u002b\u2404\u241b\u2408\u002a",
    "\u0029\u2407\u241d\u0027\u2404\u0021",
    "\u240d\u0027\u2416\u240b\u241c\u0024",
    "\u002e\u2409\u240e\u240f\u240f\u2412",
    "\u2410\u240d\u0020\u240f\u0031\u2413",
    "\u2415\u002b\u240f\u2411\u2407\u0023",
    "\u240a\u002b\u240b\u240f\u240a\u241d\u0026",
    "\u2410\u0030\u241a\u0025\u2419\u0027",
    "\u2408\u002b\u002a\u002d\u2408\u002b\u0029",
    "\u002e\u2406\u0027\u2411\u0024\u0025",
    "\u2415\u2414\u241b\u002f\u2403\u2408",
]

// Each item is the probability of that palette, the index will be used by the JS code.
// Format: [index, probability, text trait index]
let paletteProbabilities = [4,0,123,3,1,124,3,2,125,4,3,126,4,4,127,4,5,128,4,6,129,3,7,130,3,8,131,4,9,132,3,10,133,4,11,134,4,12,135,4,13,136,4,14,137,3,15,138,2,16,139,4,17,140,3,18,141,2,19,142,2,20,143,4,21,144,2,22,145,4,23,146,4,24,147,3,25,148,2,26,149,4,27,150,4,28,151,2,29,152]

// Each array contains axis index, object index, probability materials probabilities array
// material probabilities are at the end of the group and can be more than 1
// the int 255 is used as delimiter between objects
// Format: [object probability, object index, material probability, material index, trait name..., 255,...]
let objectProbabilities = [50,0,100,21,93,255,30,1,10,14,0,10,18,1,10,20,2,50,21,3,10,1,4,10,9,5,255,100,2,100,21,122,255,50,3,10,14,68,10,18,69,10,20,70,10,3,71,10,4,72,10,5,73,10,6,74,10,7,75,10,8,76,10,9,77,255,40,4,10,0,104,10,14,105,10,18,106,10,20,107,10,21,108,10,2,109,10,9,110,10,3,111,10,5,113,10,6,114,255,30,5,13,13,79,13,19,80,13,10,81,13,11,82,13,12,83,13,15,84,13,16,85,13,17,86,255,50,6,100,0,67,255,30,7,16,14,87,16,0,88,16,9,89,16,3,90,16,4,91,16,5,92,255,100,8,25,0,55,25,14,56,25,21,57,25,4,58,255,50,9,25,0,50,25,9,51,25,3,52,25,4,53,25,5,54,255,20,10,13,0,59,13,14,60,13,18,61,13,20,62,13,21,63,13,1,64,13,9,65,13,3,66,255,100,11,100,0,78,255,30,12,10,0,94,10,14,95,10,18,96,10,20,97,10,21,98,10,1,99,10,9,100,10,3,101,10,4,102,10,5,103,255,50,13,15,0,115,15,14,116,15,18,117,15,21,118,15,3,119,15,4,120,15,5,121,255,70,14,10,14,6,10,18,7,20,20,8,10,21,9,10,1,10,10,9,11,10,3,12,10,4,13,10,5,14,255,50,15,10,14,15,10,18,16,10,20,17,20,9,18,10,21,19,10,3,20,10,4,21,10,5,22,10,6,23,255,50,16,10,14,24,20,18,25,10,20,26,10,9,27,10,21,28,10,3,29,10,4,30,10,5,31,10,6,32,255,100,17,10,14,33,10,18,34,10,21,35,10,20,36,10,9,37,20,1,38,10,3,39,10,4,40,10,5,41,255,40,18,10,14,42,10,18,43,10,21,44,20,20,45,20,9,46,10,1,47,10,4,48,10,5,49,255]

let palette_trait_name = "\u002d\u0041\u0039\u0038\u003a\u241f";
///////////////////////////////////////////////////////////////////////////////////////////////////////
// generate traits
///////////////////////////////////////////////////////////////////////////////////////////////////////

// Print palette trait name
console.log("Palette trait name:", palette_trait_name);

// Generate the palette
// The format is [palette index, palette probability, text trait index]
let paletteTraits = generatePaletteTraits(paletteProbabilities);
console.log(JSON.stringify(paletteTraits));

// Generate objects
let objectTraits = generateObjectTraits(objectProbabilities)
console.log(JSON.stringify(objectTraits));

console.log("nCallsRandomIntFunc:", nCallsRandomIntFunc)