// Pyramid Descent Puzzle app, CLI version
//
// to build:
// (1) install node.js
// (2) install npm
// (3) copy this file to that folder
// (4) run this command:
//     npm i command-line-args command-line-usage
//
// to run and see usage:
// (1) run this command:
//     node pyro-path.js -h
//
// *** WARNING ***
//
//  If you cannot afford an input file named 'pyramid_sample_input.txt'
//  one will be provied for you... at runtime 
//
// to run:
// (1) run this command:
//     node pyro-path.js
//
//
// to run with a specific file:
// (1) run this command:
//     node pyro-path.js -i fileName
//
//
// to run with of the developer's debug statements:
// (1) run this command:
//     node pyro-path.js -d
//


const fs = require('fs');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

const defaultFileName='pyramid_sample_input.txt'
let fileName = defaultFileName;

const optionDefinitions = [
  { name: 'input', alias:'i', type: String, typeLabel: '{underline file}', description: 'The pyramid input file.' },
  { name: 'help', alias:'h', type: Boolean, defaultOption: false, description: 'Display this usage guide.' },
  { name: 'debug', alias:'d', type: Boolean, description: 'Display debug information as program runs.' },
  { name: 'create', alias:'c', type: Boolean, description: `Create default data file: ${defaultFileName}` },
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
let contentNote = `If no input file name is given,\nthen input file: ${defaultFileName}`;
if( options['help']){
  const usage = commandLineUsage([
    { header: 'Pyramid Descent Puzzle app',content: 'An Initial Programming Puzzle' },
    { header: 'Options', optionList: optionDefinitions },
    { header: 'Note', content: contentNote },
    { header: 'Example input file format', content: sampleInputFileContent}
  ]);
  console.log(usage);
  return 0;
}

let debug = false;
if( options['debug']) {
  debug = true;
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
if( options['create']){
  try{
    if (fs.existsSync(fileName)) {
      console.log('');
      console.log(`Cannot create a new file: ${fileName}`);
      console.log('That file already exists.')
      console.log('');
      return 1;
    }
  }
  catch(err){
    console.log(err);
    return 1;
  }
  fs.writeFile(fileName, sampleInputFileContent, function(err2) {
    if(err2) {
        console.log(err2);
        return 2;
    }
  }); 
  console.log(`Create a new input file: ${fileName}`);
  console.log('That file has the following content:')
  console.log('');
  console.log(sampleInputFileContent);
  console.log('');
  console.log('Run again without the \'-c\'');
  console.log('');
  return 0;

}
if( options['input'] ){
  fileName = options['input'];
}
if (!fs.existsSync(fileName)) {
  console.log('');
  console.log(`Cannot open input data file: ${fileName}`);
  console.log('That file does not exist.')
  console.log('');
  return 3;
}

function Node(value,left,right){
  this.value=value;
  this.left=left;
  this.right=right;
}

fs.readFile(
  fileName,
  'utf-8',
  (err,data) => { 
    if(err) {
      throw err;
    } 
    else {
      function debugLog(...args) {
        if(debug){
          console.log(...args);
        }
      }
      function debugLogHeader(){
      }
      function debugLogFooter(){
      }

      debugLogHeader();
      debugLog('raw data read from file:');
      debugLog(data);
      debugLogFooter();

      // split string based on newline, strip out extra characters

      let myData = data.split('\n').map(e=>e.replace('\n','').replace('\r',''));

      debugLogHeader();
      debugLog('after parsing the data:');
      debugLog(myData);
      debugLogFooter();


      // grab the target value from the top

      let target = parseInt(myData.shift().split(' ').pop());

      debugLogHeader();
      debugLog('target product value:', target);
      debugLogFooter();

      // remove any empty strings

      myData = myData.filter(e=>e.length>0);

      // split the string into integers

      myData = myData.map(e=>e.split(',').map(f=>parseInt(f,10)));
      let depth=myData.length;

      debugLogHeader();
      debugLog('after repackaging the data as arrays of ints:');
      debugLog(myData);
      debugLogFooter();

      // data validation, trim the tree
      let myDepth = 1;
      let myTreeValid = true;
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
      if(debug && !myTreeValid){
        debugLog('after trimming the data tree:');
        debugLog(myData);
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

      // a pause to explain 
      //
      // we now have a tree.  Stored in root.
      // the nodes are not unique
      //        1
      //       / \
      //      2   3
      //     / \ / \
      //    4   5   6
      //
      //  node(2)'s right node is the same as node(3)'s left node.       
      //  but when we walk the tree using the recursive function evalNode()
      //  we will end up with 4 unique paths through the tree, even though 
      //  there is node sharing.
      //
      //  the above tree would give
      //  { path: 'LL', prod: ( 1 * 2 * 4 ) },
      //  { path: 'LR', prod: ( 1 * 2 * 5 ) },
      //  { path: 'RL', prod: ( 1 * 3 * 5 ) },
      //  { path: 'RL', prod: ( 1 * 3 * 6 ) },
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
      //    RetNode { path: 'LL', prod: 8 }
      //    RetNode { path: 'LR', prod: 10 }
      //    RetNode { path: 'RL', prod: 15 }
      //    RetNode { path: 'RR', prod: 18 }
      //  
      //  on with the code

      if(debug){
        console.log('tree as evaluated...');
        let arr=[];
        let nextArr=[];
        let dep=depth;
        arr.push(root);
        while(arr.length>0){
          --dep;
          console.log( arr.reduce((a,e)=> a+(''+e.value).padStart(4,' '),''.padStart(dep*2,' ')) );
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

      // evaluate the node tree, to get a list of paths and values

      let ret = evalNode(root,'',1);

      // filter array to only include paths that add up to target value

      ret = ret.filter(e=>e.prod===target);

      if( ret.length < 1 ) {
        console.log(`No paths through the pyramid add up to ${target}.`);
      }
      ret.forEach(el=>{console.log(el.path)});
    }
  }
);

function RetNode(path,prod){
  this.path=path;
  this.prod=prod;
}

function evalNode( nd, path, prod ){
  let ret =[];
  if( nd ){
    if( nd.left && nd.right ) {
      ret = evalNode( nd.left,  path+'L', prod * nd.value ).concat(
            evalNode( nd.right, path+'R', prod * nd.value ));
    }else{
      ret = [new RetNode( path, prod * nd.value )];        
    }
  }
  return ret;
}

