/**
 * ============================================================================
 * TASY LOG SEARCH & SQL FORMATTER
 * Desenvolvido por: Átila Soares Cunha
 * Especialista ERP Bionexo Tasy | Gestão de TI & Projetos | Ciência de Dados
 * Contato: https://www.linkedin.com/in/atilasoares
 * Projeto: https://github.com/atilasc/tasy-log-search
 * ============================================================================
 * Extensão de auditoria para otimização de leitura de logs e requisições.
 */

const init = () => {
    // 1. Limpeza do Layout Original
    const cleanupLayout = () => {
        const topo = document.getElementById('topo');
        if (topo) topo.remove();
        const conteudoEsq = document.getElementById('conteudoEsq');
        if (conteudoEsq) {
            conteudoEsq.style.top = 'auto';
            conteudoEsq.style.left = 'auto';
            conteudoEsq.style.padding = '8px 10px';
        }
    };
    cleanupLayout();

    // 2. Criar o painel de busca
    const searchDiv = document.createElement('div');
    searchDiv.style.cssText = 'padding: 10px 15px; background: #004b87; color: white; display: flex; gap: 10px; align-items: center; font-family: Arial; flex-wrap: wrap; position: sticky; top: 0; z-index: 999; width: 100%; box-sizing: border-box;';

    // Logo do Tasy
    const logoImg = document.createElement('img');
    logoImg.src = chrome.runtime.getURL('logo-Tasy.png');
    logoImg.style.cssText = 'height: 38px; margin-right: 5px; object-fit: contain;';

    const dateStartInput = document.createElement('input');
    dateStartInput.type = 'datetime-local';
    dateStartInput.step = '1';
    dateStartInput.style.cssText = 'padding: 8px; border-radius: 4px; border: none; cursor: pointer; color: black;';

    const spanAte = document.createElement('span');
    spanAte.innerText = 'até';
    spanAte.style.fontWeight = 'bold';

    const dateEndInput = document.createElement('input');
    dateEndInput.type = 'datetime-local';
    dateEndInput.step = '1';
    dateEndInput.style.cssText = 'padding: 8px; border-radius: 4px; border: none; cursor: pointer; color: black;';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Digite o nome da tabela, variável ou procedure...';
    input.style.cssText = 'width: 400px; padding: 8px; border-radius: 4px; border: none; color: black;';

    const button = document.createElement('button');
    button.innerText = 'Buscar nos Arquivos';
    button.style.cssText = 'padding: 8px 15px; cursor: pointer; border-radius: 4px; border: none; background: #00b0f0; color: white; font-weight: bold; transition: 0.2s;';

    const status = document.createElement('span');
    status.style.fontWeight = 'bold';

    // Assinatura Visual com LinkedIn e GitHub
    const devSignature = document.createElement('span');
    devSignature.innerHTML = '<a href="https://www.linkedin.com/in/atilasoares" target="_blank" style="color: #b3e0ff; text-decoration: none; font-size: 11px;">Dev by Átila Soares</a> <span style="color: #b3e0ff; font-size: 11px; margin: 0 5px;">|</span> <a href="https://github.com/atilasc/tasy-log-search" target="_blank" style="color: #b3e0ff; text-decoration: none; font-size: 11px; font-weight: bold;">GitHub</a>';
    devSignature.style.cssText = 'margin-left: auto; display: flex; align-items: center;';

    searchDiv.appendChild(logoImg);
    searchDiv.appendChild(document.createTextNode('Período: '));
    searchDiv.appendChild(dateStartInput);
    searchDiv.appendChild(spanAte);
    searchDiv.appendChild(dateEndInput);
    searchDiv.appendChild(input);
    searchDiv.appendChild(button);
    searchDiv.appendChild(status);
    searchDiv.appendChild(devSignature);
    document.body.insertBefore(searchDiv, document.body.firstChild);

    // 3. Criar o Modal
    const modalOverlay = document.createElement('div');
    modalOverlay.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1000; justify-content: center; align-items: center;';
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = 'background: white; width: 90%; height: 90%; border-radius: 8px; display: flex; flex-direction: column; overflow: hidden;';
    
    const modalHeader = document.createElement('div');
    modalHeader.style.cssText = 'padding: 10px 20px; background: #004b87; color: white; display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-family: Arial;';
    
    const modalTitle = document.createElement('span');
    modalTitle.innerText = 'Visualizador de Arquivo';
    
    const closeBtn = document.createElement('button');
    closeBtn.innerText = 'Fechar [X]';
    closeBtn.style.cssText = 'background: #dc3545; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px; font-weight: bold;';
    closeBtn.onclick = () => modalOverlay.style.display = 'none';

    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeBtn);
    
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width: 100%; height: 100%; border: none; flex-grow: 1;';

    modalContent.appendChild(modalHeader);
    modalContent.appendChild(iframe);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // 4. Funções de conversão e busca
    const parseTasyDate = (dateStr) => {
        if (!dateStr) return null;
        const parts = dateStr.trim().split(' ');
        if (parts.length < 2) return null; 
        const dateParts = parts[0].split('/');
        if (dateParts.length !== 3) return null;
        const timeParts = parts[1].split(':');
        const secondsParts = timeParts[2] ? timeParts[2].split('.') : ['0', '0'];
        return new Date(
            parseInt(dateParts[2], 10), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[0], 10),
            parseInt(timeParts[0], 10) || 0, parseInt(timeParts[1], 10) || 0,
            parseInt(secondsParts[0], 10) || 0, parseInt(secondsParts[1], 10) || 0
        );
    };

    const performSearch = async () => {
        const keyword = input.value.trim().toLowerCase();
        const startDateStr = dateStartInput.value; 
        const endDateStr = dateEndInput.value;

        if (!keyword && !startDateStr && !endDateStr) return;
        status.innerText = 'Buscando... aguarde.';

        let startDate = startDateStr ? new Date(startDateStr) : null;
        let endDate = endDateStr ? new Date(endDateStr) : null;
        
        const links = document.querySelectorAll('a[href$=".html"]');
        let foundCount = 0;
        let processedCount = 0;
        let linksToFetch = [];

        document.querySelectorAll('.btn-visualizar').forEach(btn => btn.remove());

        for (let link of links) {
            const row = link.closest('tr');
            if(row) {
                row.style.display = 'none';
                row.style.backgroundColor = ''; 
                
                const cells = row.querySelectorAll('td');
                let rowDateText = cells.length >= 4 ? cells[3].innerText.trim() : "";
                let rowDate = parseTasyDate(rowDateText);

                if (rowDate) {
                    if (startDate && rowDate < startDate) continue;
                    if (endDate && rowDate > endDate) continue;
                }
                linksToFetch.push({link, row});
            }
        }
        
        if (!keyword) {
             linksToFetch.forEach(item => { item.row.style.display = ''; foundCount++; });
             status.innerText = `Filtro concluído! ${foundCount} arquivo(s).`;
             return;
        }

        const fetchPromises = linksToFetch.map(async (item) => {
            try {
                const response = await fetch(item.link.href);
                const text = await response.text();
                
                if (text.toLowerCase().includes(keyword)) {
                    item.row.style.display = ''; 
                    item.row.style.backgroundColor = '#d4edda';
                    foundCount++;

                    const safeKeyword = keyword.replace(/"/g, '&quot;').replace(/\\/g, '\\\\');
                    
                    const magicScript = `
                        <script>
                            setTimeout(() => {
                                const formatWalk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
                                let sqlNode;
                                const nodesToFormat = [];
                                
                                while(sqlNode = formatWalk.nextNode()) { 
                                    if(sqlNode.parentNode.nodeName !== 'SCRIPT' && sqlNode.parentNode.nodeName !== 'STYLE' && sqlNode.nodeValue.trim().length > 30) {
                                        if(/SELECT|UPDATE|INSERT|DELETE/i.test(sqlNode.nodeValue)) {
                                            nodesToFormat.push(sqlNode);
                                        }
                                    }
                                }
                                
                                nodesToFormat.forEach(textNode => {
                                    let content = textNode.nodeValue;
                                    content = content.replace(/([a-zA-Z0-9_])(WHERE|FROM|AND|OR|ORDER BY|GROUP BY|INNER JOIN|LEFT JOIN)\\b/gi, '$1 $2');
                                    content = content.replace(/\\b(SELECT|FROM|WHERE|AND|OR|ORDER BY|GROUP BY|INNER JOIN|LEFT JOIN)\\b/gi, '<br><br><b style="color: #004b87;">$1</b> ');
                                    content = content.replace(/,/g, ',<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
                                    
                                    const span = document.createElement('span');
                                    span.innerHTML = content;
                                    textNode.replaceWith(...span.childNodes);
                                });

                                const searchTerms = "${safeKeyword}";
                                if (!searchTerms) return;
                                
                                const escaped = searchTerms.replace(/[.*+?^\\$\\{\\}()|[\\]\\\\\\/]/g, '\\\\$&');
                                const regex = new RegExp("(" + escaped + ")", "gi");
                                
                                const highlightWalk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
                                let highlightNode;
                                const nodesToHighlight = [];
                                
                                while(highlightNode = highlightWalk.nextNode()) { 
                                    if(highlightNode.parentNode.nodeName !== 'SCRIPT' && highlightNode.parentNode.nodeName !== 'STYLE' && regex.test(highlightNode.nodeValue)) {
                                        nodesToHighlight.push(highlightNode);
                                    }
                                }
                                
                                nodesToHighlight.forEach(textNode => {
                                    const span = document.createElement('span');
                                    span.innerHTML = textNode.nodeValue.replace(regex, '<mark style="background-color: #ffeb3b; color: black; font-weight: bold; border-radius: 2px; padding: 0 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">$1</mark>');
                                    textNode.replaceWith(...span.childNodes);
                                });
                                
                                const firstMark = document.querySelector('mark');
                                if(firstMark) {
                                    firstMark.scrollIntoView({behavior: 'smooth', block: 'center'});
                                }
                            }, 150);
                        </script>
                    `;

                    const openViewer = (e) => {
                        e.preventDefault();
                        modalTitle.innerText = `Visualizando: ${item.link.innerText}`;
                        iframe.srcdoc = text + magicScript;
                        modalOverlay.style.display = 'flex';
                    };

                    item.link.onclick = openViewer;

                    const viewBtn = document.createElement('button');
                    viewBtn.innerText = '👁️ Visualizar';
                    viewBtn.className = 'btn-visualizar';
                    viewBtn.style.cssText = 'margin-left: 10px; background: #28a745; color: white; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;';
                    viewBtn.onclick = openViewer;
                    item.link.parentNode.appendChild(viewBtn);
                }
            } catch (e) {
                console.error('Erro ao ler', item.link.href);
            }
            processedCount++;
            status.innerText = `Analisando: ${processedCount}/${linksToFetch.length}...`;
        });

        await Promise.all(fetchPromises);
        status.innerText = `Busca concluída! ${foundCount} arquivo(s) encontrados.`;
    };

    button.addEventListener('click', performSearch);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });
};

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }