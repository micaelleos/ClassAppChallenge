const fs = require("fs");
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

const dadoscvs = fs.readFileSync('Data/data.csv').toString().split('\r\n');
const commaPattenr = new RegExp(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
const [cabecalho, ...dados] = dadoscvs;
let banco=[];

const cbcalho = cabecalho.split(commaPattenr).map(e => e.replace(/"/g,''));

dados.forEach(e=>{
    var ppessoa = e.split(commaPattenr).map(b => b.replace(/"/g,''));
    let dadoAluno = estrutura(cbcalho,ppessoa);
    banco.push(dadoAluno);
});

function estrutura(header,pessoa){

    let classe =[];
    let address=[];
    let dadosAluno={};
    for(var i = 0 ; i < header.length; i ++ ){
    
        if((/[e|E]mail/).test(cbcalho[i])|(/[p|P]hone/).test(cbcalho[i])){
            
            if(pessoa[i]!=''){
                let ender ={};
            
                if((/[e|E]mail/).test(cbcalho[i])){

                    var nome=(/\S*$/).exec(cbcalho[i]).toString();

                    ender.type="email";
                    ender.tags= nome;   
                    ender.address=pessoa[i];

                }
                else if ((/[p|P]hone/).test(cbcalho[i])&(/[\d]/).test(pessoa[i])){

                    var numero = phoneUtil.parseAndKeepRawInput(pessoa[i], 'BR');
                    pessoa[i]=numero.getCountryCode().toString() + numero.getNationalNumber();
                    var nome=(/\S*$/).exec(cbcalho[i]).toString();

                    ender.type="phone";
                    ender.tags= nome;   
                    ender.address=pessoa[i];
                }
                address.push(ender);
            }
        }
        else if((/[c|C]lass/).test(cbcalho[i])){
            if(pessoa[i]!=''){
            pessoa[i]=pessoa[i].replace(/[/]/,',').split(',');
            classe.push(pessoa[i]);
        } 
        }
        else{
            dadosAluno[header[i]]=pessoa[i];
        }

    }
      
    classe=classe.toString().split(',');
    dadosAluno.classes=classe;
    dadosAluno.addresses=address;
    return dadosAluno; 
} 

fs.writeFile('Data/output.json', JSON.stringify(banco), function(err, result) {
    if(err) console.log('error', err);
  });
