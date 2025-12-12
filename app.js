// Aplicativo SIMPLES e FUNCIONAL de controle de gastos
document.addEventListener('DOMContentLoaded', function() {
    
    // ========== ELEMENTOS DO DOM ==========
    const elements = {
        // Navegação de mês
        currentMonth: document.getElementById('currentMonth'),
        prevMonth: document.getElementById('prevMonth'),
        nextMonth: document.getElementById('nextMonth'),
        
        // Meta
        metaValue: document.getElementById('metaValue'),
        gastoAtual: document.getElementById('gastoAtual'),
        disponivel: document.getElementById('disponivel'),
        progressFill: document.getElementById('progressFill'),
        progressText: document.getElementById('progressText'),
        setMetaBtn: document.getElementById('setMetaBtn'),
        
        // Fatura
        fechamentoDay: document.getElementById('fechamentoDay'),
        vencimentoDay: document.getElementById('vencimentoDay'),
        closeInvoiceBtn: document.getElementById('closeInvoiceBtn'),
        configBtn: document.getElementById('configBtn'),
        viewHistoryBtn: document.getElementById('viewHistoryBtn'),
        
        // Formulário
        expenseForm: document.getElementById('expenseForm'),
        descricao: document.getElementById('descricao'),
        valor: document.getElementById('valor'),
        categoria: document.getElementById('categoria'),
        data: document.getElementById('data'),
        parcelas: document.getElementById('parcelas'),
        
        // Lista
        expensesList: document.getElementById('expensesList'),
        clearBtn: document.getElementById('clearBtn'),
        
        // Gráfico
        categoriasChart: document.getElementById('categoriasChart'),
        chartMessage: document.getElementById('chartMessage'),
        
        // Modal Config
        configModal: document.getElementById('configModal'),
        newMeta: document.getElementById('newMeta'),
        newFechamento: document.getElementById('newFechamento'),
        newVencimento: document.getElementById('newVencimento'),
        cancelConfig: document.getElementById('cancelConfig'),
        saveConfig: document.getElementById('saveConfig'),
        
        // Modal Histórico
        historyModal: document.getElementById('historyModal'),
        closeHistory: document.getElementById('closeHistory'),
        closeHistoryBtn: document.getElementById('closeHistoryBtn'),
        historyList: document.getElementById('historyList'),
        historySummary: document.getElementById('historySummary')
    };
    
    // ========== ESTADO DO APLICATIVO ==========
    const state = {
        currentYear: new Date().getFullYear(),
        currentMonth: new Date().getMonth(),
        metaMensal: 1500,
        diaFechamento: 5,
        diaVencimento: 10,
        despesas: []
    };
    
    // ========== FUNÇÕES AUXILIARES ADICIONAIS ==========
    function getNomeMes(mes) {
        const meses = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        return meses[mes];
    }
    
    function isMesFechado(ano, mes) {
        const historico = JSON.parse(localStorage.getItem('historicoFaturas') || '[]');
        return historico.some(f => f.mes === mes + 1 && f.ano === ano);
    }
    
    // FUNÇÕES PARA LIDAR COM DATAS (CORRIGIDO FUSO HORÁRIO)
    function parseDateLocal(dateStr) {
        // Converte string "YYYY-MM-DD" para Date (local)
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    }
    
    function formatDateForInput(date) {
        // Converte Date para string "YYYY-MM-DD" (local)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // ========== INICIALIZAÇÃO ==========
    function init() {
        console.log("Iniciando aplicativo...");
        
        // Configurar data atual no formulário (corrigido fuso horário)
        const hoje = new Date();
        elements.data.value = formatDateForInput(hoje);
        elements.data.max = formatDateForInput(hoje);
        
        // Carregar dados salvos
        loadFromStorage();
        
        // Configurar eventos
        setupEventListeners();
        
        // Atualizar interface
        updateUI();
    }
    
    // ========== CARREGAR DADOS ==========
    function loadFromStorage() {
        console.log("Carregando dados do localStorage...");
        
        // Meta
        const meta = localStorage.getItem('metaMensal');
        if (meta) state.metaMensal = parseFloat(meta);
        
        // Datas da fatura
        const fechamento = localStorage.getItem('diaFechamento');
        const vencimento = localStorage.getItem('diaVencimento');
        if (fechamento) state.diaFechamento = parseInt(fechamento);
        if (vencimento) state.diaVencimento = parseInt(vencimento);
        
        // Despesas
        const despesas = localStorage.getItem('despesas');
        if (despesas) {
            try {
                state.despesas = JSON.parse(despesas);
                console.log("Despesas carregadas:", state.despesas.length);
            } catch (e) {
                console.error("Erro ao carregar despesas:", e);
                state.despesas = [];
            }
        }
        
        // Mês atual
        const savedMonth = localStorage.getItem('currentMonth');
        const savedYear = localStorage.getItem('currentYear');
        if (savedMonth) state.currentMonth = parseInt(savedMonth);
        if (savedYear) state.currentYear = parseInt(savedYear);
        
        // Configurar inputs do modal
        elements.newMeta.value = state.metaMensal;
        elements.newFechamento.value = state.diaFechamento;
        elements.newVencimento.value = state.diaVencimento;
    }
    
    // ========== SALVAR DADOS ==========
    function saveToStorage() {
        console.log("Salvando dados no localStorage...");
        localStorage.setItem('metaMensal', state.metaMensal.toString());
        localStorage.setItem('diaFechamento', state.diaFechamento.toString());
        localStorage.setItem('diaVencimento', state.diaVencimento.toString());
        localStorage.setItem('despesas', JSON.stringify(state.despesas));
        localStorage.setItem('currentMonth', state.currentMonth.toString());
        localStorage.setItem('currentYear', state.currentYear.toString());
    }
    
    // ========== CONFIGURAR EVENTOS ==========
    function setupEventListeners() {
        console.log("Configurando eventos...");
        
        // Navegação de mês
        elements.prevMonth.addEventListener('click', () => changeMonth(-1));
        elements.nextMonth.addEventListener('click', () => changeMonth(1));
        
        // Botões
        elements.setMetaBtn.addEventListener('click', showConfigModal);
        elements.configBtn.addEventListener('click', showConfigModal);
        elements.closeInvoiceBtn.addEventListener('click', fecharFatura);
        elements.clearBtn.addEventListener('click', limparDespesasMes);
        elements.viewHistoryBtn.addEventListener('click', mostrarHistoricoModal);
        
        // Formulário de despesa
        elements.expenseForm.addEventListener('submit', salvarDespesa);
        
        // Modal de configuração
        elements.cancelConfig.addEventListener('click', hideConfigModal);
        elements.saveConfig.addEventListener('click', salvarConfiguracoes);
        
        // Modal de histórico
        elements.closeHistory.addEventListener('click', esconderHistoricoModal);
        elements.closeHistoryBtn.addEventListener('click', esconderHistoricoModal);
        
        // Fechar modais ao clicar fora
        elements.configModal.addEventListener('click', function(e) {
            if (e.target === this) hideConfigModal();
        });
        
        elements.historyModal.addEventListener('click', function(e) {
            if (e.target === this) esconderHistoricoModal();
        });
    }
    
    // ========== FUNÇÕES PRINCIPAIS ==========
    function updateUI() {
        console.log("Atualizando interface...");
        updateMonthDisplay();
        updateMetaDisplay();
        updateFaturaDisplay();
        updateDespesasList();
        criarGraficoCategorias();
    }
    
    function updateMonthDisplay() {
        elements.currentMonth.textContent = `${getNomeMes(state.currentMonth)} ${state.currentYear}`;
    }
    
    function updateMetaDisplay() {
        const despesasMes = getDespesasMesAtual();
        const totalGasto = despesasMes.reduce((total, d) => total + d.valorParcela, 0);
        const disponivel = Math.max(0, state.metaMensal - totalGasto);
        const percentual = state.metaMensal > 0 ? (totalGasto / state.metaMensal) * 100 : 0;
        
        elements.metaValue.textContent = formatCurrency(state.metaMensal);
        elements.gastoAtual.textContent = formatCurrency(totalGasto);
        elements.disponivel.textContent = formatCurrency(disponivel);
        elements.progressFill.style.width = `${Math.min(percentual, 100)}%`;
        elements.progressText.textContent = `${percentual.toFixed(1)}% utilizado`;
        
        if (percentual >= 100) {
            elements.progressFill.style.background = "linear-gradient(90deg, #dc3545, #e35d6a)";
        } else if (percentual >= 80) {
            elements.progressFill.style.background = "linear-gradient(90deg, #ffc107, #ffd054)";
        } else {
            elements.progressFill.style.background = "linear-gradient(90deg, #667eea, #764ba2)";
        }
    }
    
    function updateFaturaDisplay() {
        elements.fechamentoDay.textContent = state.diaFechamento;
        elements.vencimentoDay.textContent = state.diaVencimento;
    }
    
    function updateDespesasList() {
        const despesas = getDespesasMesAtual();
        
        if (despesas.length === 0) {
            elements.expensesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>Nenhuma despesa registrada este mês</p>
                </div>
            `;
            return;
        }
        
        elements.expensesList.innerHTML = despesas.map(despesa => `
            <div class="expense-item" data-id="${despesa.id}">
                <div class="expense-info">
                    <h3>${despesa.descricao}</h3>
                    <div class="expense-details">
                        <span><i class="fas fa-tag"></i> ${despesa.categoria}</span>
                        <span><i class="fas fa-calendar"></i> ${formatDate(despesa.data)}</span>
                        ${despesa.parcelas > 1 ? 
                            `<span><i class="fas fa-credit-card"></i> ${despesa.parcelaAtual}/${despesa.parcelas}</span>` : ''
                        }
                    </div>
                </div>
                <div class="expense-amount">
                    R$ ${formatCurrency(despesa.valorParcela)}
                    <div class="expense-actions">
                        <button class="edit" onclick="editarDespesa(${despesa.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete" onclick="excluirDespesa(${despesa.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // ========== FUNÇÕES DE DESPESAS (CORRIGIDAS) ==========
    function salvarDespesa(e) {
        e.preventDefault();
        
        if (!elements.descricao.value.trim() || !elements.valor.value || !elements.categoria.value) {
            alert("Preencha todos os campos obrigatórios!");
            return;
        }
        
        // VERIFICAÇÃO DO MÊS FECHADO - CORRIGIDO
        let dataDespesa = parseDateLocal(elements.data.value);
        const anoDespesa = dataDespesa.getFullYear();
        const mesDespesa = dataDespesa.getMonth();
        
        let despesaMovida = false;
        let mesDespesaMovida = null;
        let anoDespesaMovida = null;
        
        // Se o mês está fechado, pergunta se quer mover para o próximo mês
        if (isMesFechado(anoDespesa, mesDespesa)) {
            const resposta = confirm(
                `O mês de ${getNomeMes(mesDespesa)}/${anoDespesa} já foi fechado.\n` +
                `Deseja lançar esta despesa no próximo mês (${getNomeMes(mesDespesa + 1)}/${mesDespesa === 11 ? anoDespesa + 1 : anoDespesa})?`
            );
            
            if (resposta) {
                // Move para o próximo mês CORRETAMENTE
                dataDespesa.setMonth(dataDespesa.getMonth() + 1);
                elements.data.value = formatDateForInput(dataDespesa);
                
                despesaMovida = true;
                mesDespesaMovida = dataDespesa.getMonth();
                anoDespesaMovida = dataDespesa.getFullYear();
                
                alert(`Despesa será lançada em ${getNomeMes(mesDespesaMovida)}/${anoDespesaMovida}`);
            } else {
                return; // Usuário cancelou
            }
        }
        
        // Criar despesa com a data CORRETA
        const despesa = {
            id: Date.now(),
            descricao: elements.descricao.value.trim(),
            valorTotal: parseFloat(elements.valor.value),
            valorParcela: parseFloat(elements.valor.value) / parseInt(elements.parcelas.value),
            parcelas: parseInt(elements.parcelas.value),
            parcelaAtual: 1,
            categoria: elements.categoria.value,
            data: elements.data.value, // Já está no formato correto
            dataRegistro: new Date().toISOString(),
            status: "ativa"
        };
        
        console.log("Despesa a ser salva:", despesa);
        
        // Adicionar à lista
        state.despesas.push(despesa);
        
        // Se for parcelada, criar parcelas futuras CORRETAMENTE
        if (despesa.parcelas > 1) {
            for (let i = 2; i <= despesa.parcelas; i++) {
                const dataParcela = parseDateLocal(despesa.data);
                dataParcela.setMonth(dataParcela.getMonth() + (i - 1));
                
                const parcela = {
                    ...despesa,
                    id: despesa.id + i,
                    parcelaAtual: i,
                    data: formatDateForInput(dataParcela)
                };
                
                console.log(`Parcela ${i} criada para:`, parcela.data);
                state.despesas.push(parcela);
            }
        }
        
        saveToStorage();
        updateUI();
        
        // Limpar formulário
        elements.expenseForm.reset();
        elements.data.value = formatDateForInput(new Date());
        elements.parcelas.value = "1";
        elements.categoria.value = "";
        
        // Se a despesa foi movida, perguntar se quer ver no mês dela
        if (despesaMovida) {
            const verNoMes = confirm(
                `Despesa salva com sucesso para ${getNomeMes(mesDespesaMovida)}/${anoDespesaMovida}!\n\n` +
                `Deseja ir para esse mês agora para visualizá-la?`
            );
            
            if (verNoMes) {
                state.currentMonth = mesDespesaMovida;
                state.currentYear = anoDespesaMovida;
                saveToStorage();
                updateUI();
            } else {
                alert("Despesa salva! Você pode visualizá-la navegando para o mês correspondente.");
            }
        } else {
            alert("Despesa salva com sucesso!");
        }
    }
    
    function editarDespesa(id) {
        const despesa = state.despesas.find(d => d.id === id);
        if (!despesa) return;
        
        elements.descricao.value = despesa.descricao;
        elements.valor.value = despesa.valorTotal;
        elements.categoria.value = despesa.categoria;
        elements.data.value = despesa.data;
        elements.parcelas.value = despesa.parcelas;
        
        excluirDespesa(id, false);
        elements.descricao.focus();
    }
    
    function excluirDespesa(id, confirmar = true) {
        if (confirmar && !confirm("Tem certeza que deseja excluir esta despesa?")) {
            return;
        }
        
        const despesa = state.despesas.find(d => d.id === id);
        if (!despesa) return;
        
        if (despesa.parcelas > 1) {
            state.despesas = state.despesas.filter(d => 
                !(d.descricao === despesa.descricao && d.valorTotal === despesa.valorTotal)
            );
        } else {
            state.despesas = state.despesas.filter(d => d.id !== id);
        }
        
        saveToStorage();
        updateUI();
        
        if (confirmar) {
            alert("Despesa excluída com sucesso!");
        }
    }
    
    function limparDespesasMes() {
        if (!confirm("Limpar TODAS as despesas deste mês?\nEsta ação não pode ser desfeita.")) {
            return;
        }
        
        state.despesas = state.despesas.filter(d => {
            const dataDespesa = parseDateLocal(d.data);
            return !(dataDespesa.getMonth() === state.currentMonth &&
                    dataDespesa.getFullYear() === state.currentYear);
        });
        
        saveToStorage();
        updateUI();
        
        alert("Despesas do mês removidas!");
    }
    
    // ========== FUNÇÕES DO MÊS ==========
    function changeMonth(delta) {
        let novoMes = state.currentMonth + delta;
        let novoAno = state.currentYear;
        
        if (novoMes < 0) {
            novoMes = 11;
            novoAno--;
        } else if (novoMes > 11) {
            novoMes = 0;
            novoAno++;
        }
        
        state.currentMonth = novoMes;
        state.currentYear = novoAno;
        
        saveToStorage();
        updateUI();
    }
    
    function getDespesasMesAtual() {
        return state.despesas.filter(d => {
            const dataDespesa = parseDateLocal(d.data);
            return dataDespesa.getMonth() === state.currentMonth &&
                   dataDespesa.getFullYear() === state.currentYear &&
                   d.status === "ativa";
        });
    }
    
    // ========== FUNÇÕES DA FATURA ==========
    function fecharFatura() {
        if (!confirm("Fechar a fatura deste mês?\nAs despesas à vista serão removidas e as parceladas mantidas.")) {
            return;
        }
        
        const despesasMes = getDespesasMesAtual();
        const totalFatura = despesasMes.reduce((total, d) => total + d.valorParcela, 0);
        
        // Criar registro no histórico
        const historico = JSON.parse(localStorage.getItem('historicoFaturas') || '[]');
        historico.push({
            mes: state.currentMonth + 1,
            ano: state.currentYear,
            nomeMes: getNomeMes(state.currentMonth),
            valor: totalFatura,
            dataFechamento: formatDateForInput(new Date()),
            despesas: despesasMes.length
        });
        
        if (historico.length > 12) {
            historico.splice(0, historico.length - 12);
        }
        
        localStorage.setItem('historicoFaturas', JSON.stringify(historico));
        
        // Remover despesas à vista do mês
        state.despesas = state.despesas.filter(d => {
            const dataDespesa = parseDateLocal(d.data);
            const mesmoMes = dataDespesa.getMonth() === state.currentMonth;
            const mesmoAno = dataDespesa.getFullYear() === state.currentYear;
            
            return d.parcelas > 1 || !(mesmoMes && mesmoAno);
        });
        
        // Marcar parcelas como pagas
        state.despesas.forEach(d => {
            const dataDespesa = parseDateLocal(d.data);
            if (dataDespesa.getMonth() === state.currentMonth && 
                dataDespesa.getFullYear() === state.currentYear) {
                d.status = "paga";
            }
        });
        
        saveToStorage();
        updateUI();
        
        alert(`Fatura de ${getNomeMes(state.currentMonth)}/${state.currentYear} fechada!\nValor: R$ ${formatCurrency(totalFatura)}\nDespesas à vista removidas.`);
    }
    
    // ========== GRÁFICO DE CATEGORIAS ==========
    function criarGraficoCategorias() {
        const despesasMes = getDespesasMesAtual();
        
        if (despesasMes.length === 0) {
            elements.chartMessage.textContent = "Adicione despesas para ver o gráfico";
            elements.chartMessage.style.display = "block";
            
            if (window.graficoCategorias instanceof Chart) {
                window.graficoCategorias.destroy();
                window.graficoCategorias = null;
            }
            return;
        }
        
        const categorias = {};
        despesasMes.forEach(d => {
            categorias[d.categoria] = (categorias[d.categoria] || 0) + d.valorParcela;
        });
        
        const labels = Object.keys(categorias);
        const valores = Object.values(categorias);
        const total = valores.reduce((a, b) => a + b, 0);
        
        elements.chartMessage.textContent = `${despesasMes.length} despesas • Total: R$ ${formatCurrency(total)}`;
        elements.chartMessage.style.display = "block";
        
        const cores = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
            '#9966FF', '#FF9F40', '#8AC926', '#1982C4',
            '#6A4C93', '#FF595E'
        ];
        
        if (window.graficoCategorias instanceof Chart) {
            window.graficoCategorias.destroy();
        }
        
        const ctx = elements.categoriasChart.getContext('2d');
        window.graficoCategorias = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: valores,
                    backgroundColor: cores.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const percentage = Math.round((value / total) * 100);
                                return `${context.label}: R$ ${formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // ========== FUNÇÕES DO HISTÓRICO ==========
    function mostrarHistoricoModal() {
        carregarHistoricoNoModal();
        elements.historyModal.classList.add('active');
    }
    
    function esconderHistoricoModal() {
        elements.historyModal.classList.remove('active');
    }
    
    function carregarHistoricoNoModal() {
        const historico = JSON.parse(localStorage.getItem('historicoFaturas') || '[]');
        
        if (historico.length === 0) {
            elements.historyList.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-file-invoice"></i>
                    <p>Nenhuma fatura fechada ainda</p>
                    <small style="color: #999; font-size: 0.9rem;">As faturas fechadas aparecerão aqui</small>
                </div>
            `;
            elements.historySummary.innerHTML = '';
            return;
        }
        
        historico.sort((a, b) => {
            if (a.ano !== b.ano) return b.ano - a.ano;
            return b.mes - a.mes;
        });
        
        let historicoHTML = '';
        let totalGeral = 0;
        let totalDespesas = 0;
        
        historico.forEach((fatura) => {
            totalGeral += fatura.valor;
            totalDespesas += fatura.despesas || 0;
            
            historicoHTML += `
                <div class="history-item">
                    <div class="history-header">
                        <span class="history-month">${fatura.nomeMes || getNomeMes(fatura.mes - 1)} ${fatura.ano}</span>
                        <span class="history-value">R$ ${formatCurrency(fatura.valor)}</span>
                    </div>
                    <div class="history-details">
                        <span><i class="fas fa-receipt"></i> ${fatura.despesas || 0} despesas</span>
                        <span><i class="fas fa-calendar"></i> ${fatura.dataFechamento || 'Data não registrada'}</span>
                    </div>
                </div>
            `;
        });
        
        elements.historyList.innerHTML = historicoHTML;
        
        const mediaMensal = totalGeral / historico.length;
        const mesesComDados = historico.length;
        
        elements.historySummary.innerHTML = `
            <div class="summary-item">
                <span>Período analisado:</span>
                <span>${mesesComDados} ${mesesComDados === 1 ? 'mês' : 'meses'}</span>
            </div>
            <div class="summary-item">
                <span>Total de despesas:</span>
                <span>${totalDespesas}</span>
            </div>
            <div class="summary-item">
                <span>Total gasto:</span>
                <span>R$ ${formatCurrency(totalGeral)}</span>
            </div>
            <div class="summary-item">
                <span>Média mensal:</span>
                <span>R$ ${formatCurrency(mediaMensal)}</span>
            </div>
            <div class="summary-item summary-total">
                <span>Total geral:</span>
                <span>R$ ${formatCurrency(totalGeral)}</span>
            </div>
        `;
    }
    
    // ========== CONFIGURAÇÕES ==========
    function showConfigModal() {
        elements.newMeta.value = state.metaMensal;
        elements.newFechamento.value = state.diaFechamento;
        elements.newVencimento.value = state.diaVencimento;
        elements.configModal.classList.add('active');
    }
    
    function hideConfigModal() {
        elements.configModal.classList.remove('active');
    }
    
    function salvarConfiguracoes() {
        const novaMeta = parseFloat(elements.newMeta.value);
        const novoFechamento = parseInt(elements.newFechamento.value);
        const novoVencimento = parseInt(elements.newVencimento.value);
        
        if (!novaMeta || novaMeta <= 0) {
            alert("Digite uma meta válida!");
            return;
        }
        
        if (!novoFechamento || novoFechamento < 1 || novoFechamento > 31) {
            alert("Dia de fechamento inválido!");
            return;
        }
        
        if (!novoVencimento || novoVencimento < 1 || novoVencimento > 31) {
            alert("Dia de vencimento inválido!");
            return;
        }
        
        state.metaMensal = novaMeta;
        state.diaFechamento = novoFechamento;
        state.diaVencimento = novoVencimento;
        
        saveToStorage();
        hideConfigModal();
        updateUI();
        
        alert("Configurações salvas com sucesso!");
    }
    
    // ========== FUNÇÕES AUXILIARES ==========
    function formatCurrency(value) {
        return value.toFixed(2).replace('.', ',');
    }
    
    function formatDate(dateStr) {
        const date = parseDateLocal(dateStr);
        return date.toLocaleDateString('pt-BR');
    }
    
    // ========== INICIAR APLICATIVO ==========
    console.log("DOM carregado, iniciando app...");
    init();
    
    // ========== FUNÇÕES GLOBAIS (para onclick) ==========
    window.editarDespesa = editarDespesa;
    window.excluirDespesa = excluirDespesa;
});