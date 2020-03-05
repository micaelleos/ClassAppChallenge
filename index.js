const fs = require("fs");
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

const dadoscvs = fs.readFileSync('Data/data.csv').toString().split('\r\n');
const commaPattenr = new RegExp(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
const [cabecalho, ...dados] = dadoscvs;
let banco=[]; //array onde ficará os dados organizados dos alunos.

//organiza cabeçalho do cvs, divide em arrays e refina formatação.
const cbcalho = cabecalho.split(commaPattenr).map(e => e.replace(/"/g,''));

dados.forEach(e=>{
    //organiza informações dos alunos.
    var ppessoa = e.split(commaPattenr).map(b => b.replace(/"/g,''));
    //Função que formata os dados como solicitado.
    let dadoAluno = estrutura(cbcalho,ppessoa);
    banco.push(dadoAluno);
});


//Formatação dos dados
function estrutura(header,pessoa){

    //formatações das classes e endereços são não triviais
    let classe =[];
    let address=[];
    let dadosAluno={};
    for(var i = 0 ; i < header.length; i ++ ){
        
        //Se hover no vetor cabeçalho a string "Email" ou "Phone", 
        // então é informação de contato ("address") e possui formatação especial.
        // Fazendo desta forma, qualque outra categoria que possua "Email" ou "Phone"
        //("Email, Tio"), também é formatada como endereço.

        if((/[e|E]mail/).test(cbcalho[i])|(/[p|P]hone/).test(cbcalho[i])){
            
            if(pessoa[i]!=''){
                let ender ={};
            
                if((/[e|E]mail/).test(cbcalho[i])){

                    //acessa nome do contato
                    var nome=(/\S*$/).exec(cbcalho[i]).toString();

                    ender.type="email";
                    ender.tags= nome;   
                    ender.address=pessoa[i];

                }
                else if ((/[p|P]hone/).test(cbcalho[i])&(/[\d]/).test(pessoa[i])){

                    //formata número de telefone
                    var numero = phoneUtil.parseAndKeepRawInput(pessoa[i], 'BR');
                    pessoa[i]=numero.getCountryCode().toString() + numero.getNationalNumber();
                    
                    //acessa nome do contato
                    var nome=(/\S*$/).exec(cbcalho[i]).toString();

                    ender.type="phone";
                    ender.tags= nome;   
                    ender.address=pessoa[i];
                }
                address.push(ender);
            }
        }
        // Da mesma forma como em "adress", "class" tem que tratamento específico
        // pois pode haver mais colunas com informações sobre as aulas no arq svc. 
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

//Conversão para arq .json
fs.writeFile('Data/output.json', JSON.stringify(banco), function(err, result) {
    if(err) console.log('error', err);
  });
