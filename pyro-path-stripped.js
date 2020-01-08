const fs = require('fs');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage')

const optionDefinitions = [
  { name: 'input', alias:'i', type: String, typeLabel: '{underline file}', description: 'The pyramid input file.' },
  { name: 'help', alias:'h', type: Boolean, defaultOption: false, description: 'Display this usage guide.' },
];
const options = commandLineArgs(optionDefinitions);

if( options['help']){
  const usage = commandLineUsage([
    { header: 'Pyramid Descent Puzzle app',content: 'An Initial Programming Puzzle' },
    { header: 'Options', optionList: optionDefinitions },
  ]);
  console.log(usage);
  return;
}

let fileName='pyramid_sample_input.txt';
if( options['input'] ){
  fileName = options['input'];
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
    } else {
      let myData = data.split('\n').map(e=>e.replace('\n','').replace('\r',''));
      let target = parseInt(myData.shift().split(' ').pop());
      myData = myData.filter(e=>e.length>0);

      // split the string into integers
      myData = myData.map(e=>e.split(',').map(f=>parseInt(f,10)));

      // work from the bottom up of the pyramid
      // fill in row of nodes with empty left, right children
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
      // the lowerNodes array should have only one element
      // added assert for testing, commented out submission 
      // assert(lowerNodes.length === 1,'lowerNodes should have one and only one element.')

      // evaluate the node tree, to get a list of paths and values
      let ret = evalNode(lowerNodes.pop(),'',1,'');

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

