# Tasy Log Search & SQL Formatter

Uma extensão para navegadores (Chrome/Edge/Brave) desenvolvida para otimizar a auditoria e a busca de falhas na tela de logs e requisições do sistema Bionexo Tasy (tela `wheb_arquivo.jsp`).

Esta ferramenta elimina a necessidade de abrir múltiplos arquivos manualmente, permitindo buscas em lote, leitura rápida com visualizador integrado e formatação automática de queries SQL.

## 🚀 Funcionalidades

* **Busca Textual em Lote:** Digite o nome de uma tabela, variável ou procedure e a extensão fará o download de todos os links em segundo plano, destacando os arquivos que contêm o termo.
* **Filtro de Período Preciso:** Filtre os arquivos exibidos por Data e Hora antes de executar a busca textual, economizando requisições.
* **Visualizador Integrado (Modal):** Leia os logs através de um botão "👁️ Visualizar" que abre o arquivo em uma janela flutuante, sem perder a sua tela principal de busca.
* **Formatador de SQL Automático:** Organiza queries bagunçadas, aplicando quebras de linha em cláusulas importantes (SELECT, FROM, WHERE, AND) e separando campos por vírgula.
* **Auto-Scroll e Marca-texto:** A palavra pesquisada é destacada em amarelo dentro do log, e a tela rola automaticamente até a primeira ocorrência.
* **Limpeza de Layout:** Oculta elementos desnecessários do cabeçalho original para melhor aproveitamento do espaço da tela.

## ⚙️ Como configurar para o seu Hospital

Por padrão, esta extensão restringe seu funcionamento para garantir segurança. Para utilizá-la no ambiente Tasy da sua instituição, você precisa alterar a URL no arquivo de configuração.

1. Abra o arquivo `manifest.json` em um editor de texto.
2. Localize as chaves `"matches"` dentro de `"content_scripts"` e `"web_accessible_resources"`.
3. Substitua o domínio de exemplo (`dominio.com.br`) pela URL ou IP do seu servidor Tasy (TasyAppServer).

**Exemplo de como deve ficar o seu `manifest.json`:**

```json
  "content_scripts": [
    {
      "matches": ["*://tasy.meuhospital.com.br/*wheb_arquivo.jsp*"],
      "js": ["content.js"]
    }
  ],
  "web_accessible_resources": [
    {
      "resources": ["logo-Tasy.png"],
      "matches": ["*://tasy.meuhospital.com.br/*"]
    }
  ]
```

## 📦 Como Instalar (Modo Desenvolvedor)

1. Faça o download ou clone este repositório para o seu computador.
2. Abra o seu navegador e acesse a página de extensões: `chrome://extensions/` (Chrome) ou `edge://extensions/` (Edge).
3. Ative a chave **"Modo do desenvolvedor"** no canto superior da tela.
4. Clique no botão **"Carregar sem compactação"** (ou *Load unpacked*).
5. Selecione a pasta onde você salvou os arquivos desta extensão.
6. Acesse a tela de logs no seu Tasy e atualize a página (F5).

## 👨‍💻 Autor

**Átila Soares Cunha**  
Especialista ERP Bionexo Tasy | Gestão de TI | Ciência de Dados 
**LinkedIn:** [linkedin.com/in/atilasoares](https://www.linkedin.com/in/atilasoares)

---
*Este projeto não possui vínculo oficial com a BIONEXO TASY. Ferramenta de código aberto desenvolvida para a comunidade de TI da área da saúde.*
