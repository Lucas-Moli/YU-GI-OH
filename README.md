# Yu-Gi-Oh! 



Projeto front-end em HTML, CSS e JavaScript puro. O visual foi reconstruído com inspiração em portais oficiais de card games, mas reinterpretado com linguagem gráfica de anime dos anos 90: cabeçalho editorial, navegação em faixas, molduras douradas, painéis de pergaminho, cores azul-marinho/vermelho/dourado e tipografia condensada.

## API
Utiliza YGOPRODeck API v7, consultando o arquétipo Blue-Eyes em português, com até 24 cartas:
`https://db.ygoprodeck.com/api/v7/cardinfo.php?archetype=Blue-Eyes&language=pt&num=24&offset=0`

## Executar
Abra a pasta no VS Code e execute `index.html` com Live Server. A página precisa de conexão com a internet para carregar a API e as imagens das cartas. As fontes usadas são as do próprio sistema (sem links externos).

## Arquivos
- `index.html`: estrutura da página.
- `style.css`: identidade visual retrô.
- `script.js`: fetch, criação dinâmica dos cards via DOM e tela de detalhes (status + descrição completa).
- `assets/duel-assets/AAAABaX6fO6bcyGg6UfiYM3CmCVupQkExfe4veC2dBlxEIhK9770N8LP2ZYBKra5tDXIYPs0NySq8FLxSwVDTCFJx2aWKF13u0XW_MNG.jpg`: imagem conceitual do banner.

Projeto acadêmico independente, sem vínculo oficial com a Konami.
