// Pyramid Descent Puzzle app, CLI version
//
// to build:
// (1) install node.js
// (2) install npm
// (3) copy this file to that folder
// (4) run this command to get the helpers:
//     npm i command-line-args command-line-usage
//
// (5) use node to run this file
//
//
// to run and see usage:
// run this command:
//     node pyro-path.js -h
//
//
// to create a sample input file and then run with it:
// run this command:
//     node pyro-path.js -c
//
//
// to run using default input file pyramid_sample_input.txt:
// run this command:
//     node pyro-path.js
//
//
// to run with a specific file:
// run this command:
//     node pyro-path.js -i fileName
//
//
// to run and display a bit more information:
// run this command:
//     node pyro-path.js -v
//
//
// to run and print out the developer's debug statements:
// run this command:
//     node pyro-path.js -d
//
//
// to run even if the pyramid data is wonky:
// run this command:
//     node pyro-path.js -f
//


const fs = require('fs');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

/////////////////////////////////
//
// Handle command line arguements
//

const defaultFileName='pyramid_sample_input.txt'
let fileName = defaultFileName;

const optionDefinitions = [
  { name: 'help',     alias:'h', type: Boolean, defaultOption: false, description: 'Display this usage guide.' },
  { name: 'create',   alias:'c', type: Boolean, description: `Create a sample input file: ${defaultFileName}` },
  { name: 'input',    alias:'i', type: String, defaultOption: true, typeLabel: '{underline file}', description: 'The pyramid data input file.' },
  { name: 'force',    alias:'f', type: Boolean, description: 'Attempt to run even if the data is bit wonky.' },
  { name: 'verbose',  alias:'v', type: Boolean, description: 'Display a bit more information as program runs.' },
  { name: 'debug',    alias:'d', type: Boolean, description: 'Display debug information as program runs.' },  
];
const options = commandLineArgs(optionDefinitions);

/* example of content of pyramid_sample_input.txt
Target: 720
2
4,3
3,2,6
2,9,5,2
10,5,2,15,5
*/

let sampleInputFileContent = 'Target: 720\n2\n4,3\n3,2,6\n2,9,5,2\n10,5,2,15,5';
let contentNote = `If no input file name is given,\nthen app will try to open this file: ${defaultFileName}`;
const usage = commandLineUsage([
  { header: 'Pyramid Descent Puzzle app',
    content:  'An Initial Programming Puzzle\n\n'+
              'Print Left-Right path through pyramid whose product results in target value.' },
  { header: 'Options', optionList: optionDefinitions },
  { header: 'Note', content: contentNote },
  { header: 'Example input file format', content: sampleInputFileContent}
]);

if( options['help']){
  console.log(usage);
  return 0;
}

let debug = false;
if( options['debug']) {
  debug = true;
}

let verbose = false;
if( options['verbose'] ) {
  verbose = true;
}

let force = false;
if( options['force'] ) {
  force = true;
}

let create = false
if( options['create'] ) {
  create = true;
}

if(debug){
  console.log(
    '\n'+'******************************'+
    '\n'+'***                        ***'+
    '\n'+'***  log debug informaton  ***'+
    '\n'+'***                        ***'+
    '\n'+'***  when it is available  ***'+
    '\n'+'***                        ***'+
    '\n'+'******************************'+
    '\n'
  );
}

if( create ) {
  try{
    if (fs.existsSync(fileName)) {
      console.log('');
      console.log(`Cannot create a new file: ${fileName}`);
      console.log('That file already exists.')
      console.log('');
      console.log('Now using that data file.');
      console.log('');
    }
    else{
      fs.writeFileSync(fileName, sampleInputFileContent);

      console.log(`Create a new input file: ${fileName}`);
      console.log('That file has the following content:')
      console.log('');
      console.log(sampleInputFileContent);
      console.log('');
      console.log('Now using that data file.');
      console.log('');
    }
  }
  catch(err){
    console.log(err);
    return 2;
  }
}
else if( options['input'] ){ // ignore --input if they used --create
  fileName = options['input'];
}

try{
  if (!fs.existsSync(fileName)) {
    console.log('');
    console.log(`Cannot open input data file: ${fileName}`);
    console.log('That file does not exist.')
    console.log('');
    if( fileName == defaultFileName){
      console.log('Run again with the arg: \'-c\'');
      console.log(`to create a new sample input file: ${fileName}`);
      console.log('');  
      console.log('Run again with the arg: \'-h\' or --help');
      console.log('for a more complete list of command line options.');
      console.log('');  
    }
    return 3;
  }
}
catch(err){
  console.log(err);
  return 4;
}
//////////////////////////////////
//
// Data Structure used in the main
//

/**
 * Node to hold value and ref to child nodes.
 * 
 * @property {integer}  value     integer value.
 * @property {Object}   left      ref to left node child.
 * @property {Object}   rightThe  ref to right node child.
 *
 */

function Node(value,left,right){
  this.value = value;
  this.left  = left; 
  this.right = right;
}

///////////////////////////////////////////////////////////////
//
// The Main Event
//

// read in the file

let data = fs.readFileSync(fileName,'utf-8');

debugLog('Below is raw data read from file:',fileName);
debugLog('');
debugLog(data);
debugLog('');

// split string based on newline, strip out extra characters

let myData = data.split('\n').map(e=>e.replace('\n','').replace('\r',''));

debugLog('after parsing the data:');
debugLog(myData);

// grab the target value from the top

let targetRow = myData.shift().split(/[\s,:;]+/);

if( (targetRow[0].toLowerCase() != 'target') || (targetRow.length < 2) ){
  console.log('Target value must be preceeded by the word \'Target\'.');
  console.log('');
  return 5;
}
let target = parseInt(targetRow[1]);
if( isNaN(target) ){
  console.log(`Target value must be an integer. ${targetRow[1]} is not an integer.`);
  console.log('');
  return 6;
}

// remove any empty strings

myData = myData.filter(e=>e.length>0);

// split the string into integers

myData = myData.map(e=>e.split(/[\s,]+/).map(f=>parseInt(f,10)));
let depth=myData.length;

debugLog('after repackaging the data as arrays of ints:');
debugLog(myData);

// data validation: trim the tree

let myDepth = 1;
let myTreeValid = true;
let max;
myData.forEach(e=>{
  if( e.length > myDepth){
    if(debug){
      debugLog('');
      debugLog('original row:',e);
    }
    e.length=myDepth;
    if(debug){
      debugLog(' trimmed row:',e);
      debugLog('');
    }
    myTreeValid = false;
  }else if(e.length < myDepth){
    if(debug){
      debugLog('');
      debugLog('short row:',e);
      debugLog(`expected ${myDepth} elements, only had ${e.length}`);
      debugLog('');
    }
    myTreeValid = false;
  }
  ++myDepth;
});
if( !myTreeValid ){
  console.log('');
  console.log('Data in pyramid is bit wonky.')
  if( !force ){
    console.log('Giving up.');
    console.log('');        
    return 7;
  } 
  console.log('');
  console.log('Will trundle on since you said to force it.')
  console.log('No guarantee that all possible paths will be evaluated with wonky data.');
  console.log('');
}

if(debug && !myTreeValid){
  debugLog('after trimming the data tree:');
  debugLog(myData);
  debugLog('');
}

// work from the bottom up of the pyramid
// initialize the process by popping off the bottom row
// and pre-loading the lowerNode array.
let lowerNodes=[];
let row = myData.pop();
for( let i=0;i<row.length;++i){
  lowerNodes.push(new Node(row[i],null,null));
}
// next loop through the array of arrays, from the bottom
while( myData.length > 0) {
  row = myData.pop();
  let upperNodes=[];
  for( let j=0;j<row.length;++j){
    let node = new Node(row[j],lowerNodes[j],lowerNodes[j+1]);
    upperNodes.push(node);
  }
  lowerNodes=upperNodes;
}

let root = lowerNodes.pop();

// a pause in the code to explain what is happening
//
// we now have a tree.  Hanging off the root node.
// the nodes are not unique
//        1
//       / \
//      2   3
//     / \ / \
//    4   5   6
//
//  node(2)'s right node is the same as node(3)'s left node.
//  both those point to the same node: node(5).
//  Don't Panic.
//  When we walk the tree using the recursive function evalNode()
//  we will end up with 4 unique paths through the tree, even though 
//  there is node sharing.
//
//  the above tree would give
//  { path: 'LL', prod: ( 1 -> 2 -> 4 ) },
//  { path: 'LR', prod: ( 1 -> 2 -> 5 ) },
//  { path: 'RL', prod: ( 1 -> 3 -> 5 ) },
//  { path: 'RL', prod: ( 1 -> 3 -> 6 ) },
//
//  if you ran this code with the debug output turned on, 
//  with the following input file:
// 
//  Target: 8
//  1
//  2,3
//  4,5,6
// 
//  you would see something like this
//  in the mix of debug output
//    before: filtering...
//    ProdNode { path: 'LL', prod: 8 }
//    ProdNode { path: 'LR', prod: 10 }
//    ProdNode { path: 'RL', prod: 15 }
//    ProdNode { path: 'RR', prod: 18 }
//  
//  the show must go on...
//  on with the code

// evaluate the node tree, to get a list of paths and values

let ret = evalNode(root,'',1,'');

debugLog('All the paths and their products:');
ret.forEach(el=>{debugLog(el)});
debugLog('');

// filter array to only include paths that add up to target value

ret = ret.filter(e=>e.prod===target);

if(debug || verbose){
  console.log('');
  console.log('tree as evaluated...');
  prodPath(root,'',depth,allpaths);

  ret.forEach(el=>{
    if(debug) console.log(el);
    console.log('path that gives target product of :', target );
    prodPath(root,el.path,depth,truepath);
  });
  console.log('');
}      

if( ret.length < 1 ) {
  console.log('No path through the pyramid has a product of :', target);
  console.log('');
}
ret.forEach(el=>{console.log(el.path)});
return 0;

///////////////////////////////////////////////////////////////
//
// End of The Main Event
//

///////////////////////////////////////////////////////////////
//
// Helper Functions and their data structures
//


/**
 * Prints out args to screen if debug is true
 * 
 * @param {...any}  args    almost any number of args
 *
 * @return nothing
 *         
 */

function debugLog(...args) {
  if(debug){
    console.log(...args);
  }
}

/**
 * Yet another node object.
 * 
 * This object holds the LR path, the current product, the numeric path.
 * 
 * @property {string}   path    A string that represents the left-right path.
 * @property {integer}  prod    The multiplcation product of the nodes above this node.
 * @property {string}   ds      String of the values of nodes visited to get the above product.
 *
 */

function ProdNode(path,prod,ds){
  this.path=path;
  this.prod=prod;
  this.ds=ds;
}

/**
 * Calculates the path and products for all possible path from the this node and below
 * 
 * Walks the tree from this node down.
 * Recursively calls itself on any children. 
 * Creates an array that contains all possible paths and their associated product
 * 
 * @param {Node}      nd          node in the tree.
 * @param {string}    path        Left-Right (LR) path through tree that got us here.
 * @param {integer}   prod        The product of the values we walked to get here.
 * @param {string}    ds          String of the values of nodes visited to get the above product.
 *
 * @return {Object}   [ProdNodes] Array of ProdNodes that represents all possible paths 
 *                                from this Node and below.         
 */

function evalNode( nd, path, prod, ds ){
  let ret =[];
  if( nd ){
    if( nd.left ){
      ret = evalNode( nd.left,  path+'L', prod * nd.value, ds+nd.value+' ' );
    }
    if( nd.right ){
      ret = ret.concat( evalNode( nd.right, path+'R', prod * nd.value, ds+nd.value+' ' ) );
    }
    if( !(nd.left) && !(nd.right) ) {
      ret = [new ProdNode( path, prod * nd.value, ds+nd.value)];
    }
  }
  return ret;
}

/**
 * Print out product pyramid.
 * 
 * Walks the tree, starting at root, 
 * printing value of nodes at the same depth.
 * Uses depth to try to make the tree display 
 * as a two sided tree.
 * 
 * Example:
 *            2
 *          4   3
 *        3   2   6
 *      2   9   5   2
 *   10   5   2  15   5
 *
 * 
 * @param {Node}      root     Root node of tree.
 * @param {string}    path     Left-Right (LR) path through tree.
 * @param {integer}   depth    How long is the longest branch of the tree.
 * @param {function}  spcFunc  Helper function.
 *                             call with allpaths function to display the whole tree
 *                             call with truepath function to display the product path only
 *
 * @return nothing
 */
function prodPath(root,path,depth,spcFunc){
  console.log('');
  ipath=path.split('').map( e => ((e === 'R') ? 1 : 0 ) );  // 0 is left path, 1 is right path.
  let offset=0;
  let arr=[];
  let nextArr=[];
  let dep=depth;
  arr.push(root);
  while(arr.length>0){
    --dep;
    //
    // when offset and i are the same value then e (the element) is on the LR path.
    // when offset and i are NOT the same value that off the path LR path
    //
    // we can use that to then print out only the nodes on the LR path
    //
    console.log( arr.reduce((a,e,i)=> a+(''+spcFunc(i,offset,e.value)).padStart(6,' '),''.padStart(dep*3,' ')) );
    offset += ipath.shift();
    nextArr=[];
    let first = arr.shift();
    let last = null;
    if( first ){
      if( first.left ){
        nextArr.push(first.left);
      } 
      if( first.right ){
        last = first.right;
        nextArr.push(first.right);
      } 
    }
    while( arr.length > 0 ){
      let next = arr.shift();
      if( next ){
        // todo: add clever assertion for last === next.left being the same object
        if( next.right ){
          nextArr.push(next.right);
        } 
      }
    }
    arr = nextArr;
  }
  console.log('');
}

/**
 * prodPath helper
 * 
 * Returns string when offset and index are equal.
 * Otherwise return a string with spaces of the same length.
 * 
 * Used when display the path through the tree that gives the desired target.
 * 
 * @param {integer}  index    index in the array
 * @param {integer}  offset   calcuate offset in the array dictated by the LR path
 * @param {string}   str      String to display
 *
 * @return {string}           As described above
 */

function truepath(index,offset,str){
  return index===offset ? str : ''.padStart(str.length);
}

/**
 * yet another prodPath helper
 * 
 * Always just returns string that was passed in.
 * 
 * Used when display the whole tree.
 * 
 * @param {integer}  index    index in the array
 * @param {integer}  offset   calcuate offset in the array dictated by the LR path
 * @param {string}   str      string to display
 *
 * @return {string}           As described above
 */

function allpaths(index,offset,str){
  return str;
}
