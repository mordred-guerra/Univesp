import wixLocation from 'wix-location';
import wixWindow from 'wix-window';
import wixData from 'wix-data';

let dadosCarregados = false;

$w.onReady(function () {
    // FORÇA RELOAD APENAS UMA VEZ (Solução definitiva para navegação SPA)
    if (!wixWindow.rendering.env === "browser") return;

    const currentUrl = wixLocation.url;
    if (!currentUrl.includes("?reload=true")) {
        wixLocation.to(`${currentUrl}?reload=true`);
        return;
    }

    $w('#totalText').hide();

    carregarDropdowns();

    $w("#button1").onClick(() => {
        $w('#totalText').show();

        const selectedServiceId = $w("#dropdown1").value;
        const selectedToothId = $w("#dropdown2").value;

        if (!selectedServiceId || !selectedToothId) {
            $w("#totalText").text = "Por favor, selecione um item em cada dropdown.";
            return;
        }

        Promise.all([
            wixData.get("Services", selectedServiceId),
            wixData.get("TeethPrices", selectedToothId)
        ])
        .then(([service, tooth]) => {
            const nomeServico = service.title || "Serviço";
            const nomeDente = tooth.title || tooth.toothName || "Dente";

            const precoServico = Number(service.price) || 0;
            const precoDente = Number(tooth.price2 || tooth.price) || 0;

            const total = precoServico + precoDente;

            const resultado = 
                `Serviço: ${nomeServico} (R$ ${precoServico.toFixed(2)})\n` +
                `Dente: ${nomeDente} (R$ ${precoDente.toFixed(2)})\n` +
                `Total: R$ ${total.toFixed(2)}`;

            $w("#totalText").text = resultado;
        })
        .catch((err) => {
            console.error("Erro ao calcular orçamento:", err);
            $w("#totalText").text = "Erro ao calcular orçamento.";
        });
    });
});

function carregarDropdowns() {
    dadosCarregados = false;

    wixData.query("Services")
        .find()
        .then((results) => {
            const options = results.items.map(item => ({
                label: item.title,
                value: item._id
            }));
            $w("#dropdown1").options = options;
            $w("#dropdown1").selectedIndex = undefined;
        })
        .catch((err) => {
            console.error("Erro ao carregar serviços:", err);
        });

    wixData.query("TeethPrices")
        .find()
        .then((results) => {
            const options = results.items.map(item => ({
                label: item.title || item.toothName,
                value: item._id
            }));
            $w("#dropdown2").options = options;
            $w("#dropdown2").selectedIndex = undefined;
            dadosCarregados = true;
        })
        .catch((err) => {
            console.error("Erro ao carregar dentes:", err);
        });
}
