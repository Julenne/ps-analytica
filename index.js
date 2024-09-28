const express = require('express');
const axios = require('axios')
const app = express()
const port = 1313


app.use(express.json());


function idade_futuro(birth, date_future) {
    const today = new Date();
    const birthday = new Date(birth)
    const future = new Date(date_future);

    const todayTime = today.getTime();
    const futureTime = future.getTime();

    if (todayTime > futureTime)
        return { error: true, message: "Esta data já passou! Tente novamente" }

    if (today == 'Invalid Date' || birthday == 'Invalid Date' || future == 'Invalid Date')
        return { error: true, message: "Data Inválida" }

    ageNow = today.getFullYear() - birthday.getFullYear();

    if (today.getMonth() < birthday.getMonth() || (today.getMonth() == birthday.getMonth() && today.getDate() <= birthday.getDate()))
        ageNow -= 1;

    ageThen = (today.getFullYear() - birthday.getFullYear()) + (future.getFullYear() - today.getFullYear())

    if (future.getMonth() < birthday.getMonth() || (future.getMonth() == birthday.getMonth() && future.getDate() <= birthday.getDate()))
        ageThen -= 1;

    return { error: false, ageNow, ageThen }

}


async function teste() {
    const municipios = await fetch(url_municipios);
    return municipios;
}

app.post('/age', (req, res) => {
    const data = req.body
    date = new Date(data.date)

    if (!data) {
        return res.status(400).json({
            message: "Informe os dados no body"
        });
    }

    const idade = idade_futuro(data.birthdate, data.date)
    if (idade.error) {
        return res.status(400).json({
            message: idade.message
        });
    }

    res.json({
        message: `Olá, ${data.name}! Você tem ${idade.ageNow} anos e em ${date.getDate() + 1}/${date.getMonth() + 1}/${date.getFullYear()} você terá ${idade.ageThen} anos. `
    })
});

app.get('/municipio-bairros', async (req, res) => {
    const {municipio}= req.query;

    try {
        const municipios_resp = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/municipios');
        let list_municipios = municipios_resp.data;
        municipioString = municipio.split('-').join(" ").toLowerCase()
        let find_municipio = list_municipios.find(m => m.nome.toLowerCase() === municipioString);

        if(!find_municipio){
            res.status(404).json({ 
                message: `Município ${municipioString} não encontrado.` 
            });
        }

        const bairros = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${find_municipio.id}/distritos`);
        let list_bairros = bairros.data
        const find_bairros = list_bairros.map(bairro => bairro.nome);
        
        res.json({
            municipio: municipioString,
            bairros: find_bairros
        });

    } catch (error) {
        res.status(500).json({
            message: 'Erro ao buscar informações do IBGE.',
            error: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Rodando em http://localhost:${port}`);
});