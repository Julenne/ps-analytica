const express = require('express');
const app = express()
const port = 1313

const url_bairros = 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios/{municipio}/distritos'
const url_municipios = 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios'
app.use(express.json());

/*
Ou seja, recebe o nome de uma pessoa (name), sua data de nascimento (birthdate) e
uma data qualquer no futuro (date) e retorna uma frase no formato indicado, com a
idade X que a pessoa tem no momento da requisi¸c˜ao e a idade Y que ela ter´a na data
do futuro. Lembre-se de adicionar verifica¸c˜oes para garantir que o body est´a completo
e que a data date ´e realmente no futuro. Caso contr´ario, retorne um erro detalhado.
*/

function idade_futuro(birth, date_future){
    const today = new Date();
    const birthday = new Date(birth)
    const future = new Date(date_future);

    const todayTime = today.getTime();
    const futureTime = future.getTime();

    if(todayTime > futureTime)
        return {error: true, message: "Esta data já passou! Tente novamente"}

    if(today=='Invalid Date' || birthday=='Invalid Date' || future=='Invalid Date')
        return {error: true, message: "Data Inválida"}

    ageNow = today.getFullYear() - birthday.getFullYear();
    
    if(today.getMonth() < birthday.getMonth() ||( today.getMonth() == birthday.getMonth() && today.getDate() <= birthday.getDate()))
        ageNow -=1; 
    
    ageThen = (today.getFullYear() - birthday.getFullYear()) + (future.getFullYear() - today.getFullYear())

    if(future.getMonth() < birthday.getMonth() ||( future.getMonth() == birthday.getMonth() && future.getDate() <= birthday.getDate()))
        ageThen -= 1;
    
    return {error: false, ageNow, ageThen}

}

async function lista_bairros(municipio){
    
    const municipios = await fetch(url_municipios);
    if(municipios.status == 200){
        const list_municipios = await municipios.json(); 
        const municipios = list_municipios.find(m => m.nome.toLowerCase() === municipio.toLowerCase());
    
        if (!municipios) {
            return {error: true, message: `Município ${municipio} não encontrado.` };
        }

        const bairros = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${municipios.id}/distritos`);
        if(bairros.status == 200){
            const list_bairros = await bairros.json()
            bairros = list_bairros.map(bairro => bairro.nome);
            return {error: false, bairros}
        }

        return {error: true, message:'Não foi possível buscar informações do IBGE'}
        
    }else{
        return {error: true, message:'Não foi possível buscar informações do IBGE'}
    }
}

async function teste(){
    const municipios = await fetch(url_municipios);
    return municipios.json();
}

app.post('/age', (req, res) => {
    const data = req.body
    date = new Date(data.date)

    if(!data){
        return res.status(400).json({
            message: "Informe os dados no body"
        });
    }

    const idade = idade_futuro(data.birthdate, data.date)
    if(idade.error){
        return res.status(400).json({
            message: idade.message
        });
    }

    res.json({
        message:`Olá, ${data.name}! Você tem ${idade.ageNow} anos e em ${date.getDate()+1}/${date.getMonth()+1}/${date.getFullYear()} você terá ${idade.ageThen} anos. `
    })
});

app.get('/municipio-bairros',(req, res) => {
    const municipio = req.query;

    const bairros = lista_bairros(municipio)

    if(!municipio){
        return res.status(400).json({
            message: "Informe o municipio na query."
        });
    }

    if(bairros.error){
        return res.status(400).json({
            message: bairros.message
        });
    }

    res.json({
        message:municipio,
        bairros: teste()
    })
});

app.listen(port, () => {
    console.log(`Rodando em http://localhost:${port}`);
});