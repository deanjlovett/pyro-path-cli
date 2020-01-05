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

function Node(value,left,right,path,prod){
  this.value=value;
  this.path=path;
  this.prod=prod;
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
      myData = myData.map(e=>e.split(',').map(f=>parseInt(f,10)));
      let value = mydata.shift();
      let node = new Node(value,null,null,'',value);
      let root = node;
      let lowerNodes=[];
      let upperNodes=[];
      upperNodes.push(root);
      while( myData.length > 0) {
        row = myData.shift();
        for( let j=0;j<upperNodes.length;++j){
          let value = row[i];
          let node = new Node(value,null,null,'',value);
          lowerNodes.push(node);
        }
        lowerNodes=upperNodes;
      }


      let row = myData();
      for( let i=0;i<row.length;++i){
        lowerNodes.push(new Node(row[i],null,null));
      }
      while( myData.length > 0) {
        row = myData.pop();
        let upperNodes=[];
        for( let j=0;j<row.length;++j){
          let node = new Node(row[j],lowerNodes[j],lowerNodes[j+1]);
          upperNodes.push(node);
        }
        lowerNodes=upperNodes;
      }
      let ret = evalNode(lowerNodes.pop(),'',1,'');
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


