# HotS Draft System

## Visão Geral

Este sistema de draft para Heroes of the Storm permite que capitães realizem um processo organizado de escolha e banimento de heróis sem necessidade de autenticação. Desenvolvido com Next.js, o sistema oferece uma interface intuitiva para criar e participar de drafts competitivos.

## Funcionalidades

- **Criação de Sala**: Qualquer jogador pode criar uma nova sala de draft
- **Configuração Flexível**: Opção de escolher entre 3 ou 4 banimentos por time
- **Compartilhamento Simples**: Link direto para convidar o capitão adversário
- **Interface Intuitiva**: Seleção visual de heróis através de ícones organizados
- **Processo Completo**: Suporte ao fluxo padrão de banimentos e escolhas competitivas

## Como Usar

### Para o Primeiro Capitão

1. Acesse o sistema e clique em "Iniciar Novo Draft"
2. Configure a quantidade de banimentos (3 ou 4 por padrão)
3. Insira seu nome na caixa de identificação
4. Compartilhe o link gerado com o capitão adversário
5. Aguarde a entrada do segundo capitão
6. Clique em "INICIAR O DRAFT AGORA" quando estiver pronto

### Para o Segundo Capitão

1. Acesse o link compartilhado pelo primeiro capitão
2. Insira seu nome na caixa de identificação
3. Aguarde o início do draft pelo primeiro capitão

## Fluxo do Draft

### Com 3 Banimentos por Time

1. **Fase de Banimento 1**: 1 ban para cada time
2. **Fase de Banimento 2**: 1 ban para cada time
4. **Fase de Escolha 1**: 
   - Time A: 1 pick
   - Time B: 2 picks
   - Time A: 2 picks
5. **Fase de Banimento Final**: 1 ban para cada time
6. **Fase de Escolha 2**:
   - Time B: 2 picks
   - Time A: 2 picks
   - Time B: 1 pick

### Com 4 Banimentos por Time

Segue o mesmo fluxo acima, com um banimento adicional após a Fase de Banimento 2.

## Tecnologias Utilizadas

- **Frontend**: Next.js, React
- **API de Heróis**: Integração com a API do Heroes Profile (https://api.heroesprofile.com/openApi/Heroes)
- **Estilização**: Tailwind CSS

## Instalação e Execução Local

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/hots-draft-system.git

# Entre na pasta do projeto
cd hots-draft-system

# Instale as dependências
npm install

# Execute em ambiente de desenvolvimento
npm run dev
```

# Estrutura de Pastas do Projeto

```
src/
├── app/
│   ├── api/
│   │   └── draft/
│   │       ├── create/
│   │       ├── join/
│   │       ├── update/
│   │       └── heroes/
│   ├── draft/
│   │   └── [id]/
│   ├── new/
│   └── page.tsx
├── components/
└── lib/
```

## Roadmap de Desenvolvimento

- [x] Implementar sistema de sala de draft
- [x] Desenvolver interface de seleção de heróis
- [x] Integrar com a API de heróis
- [x] Implementar lógica de fluxo de draft
- [x] Adicionar suporte para compartilhamento de link
- [x] Criar sistema de visualização em tempo real
- [ ] Adicionar temporizador para draft
- [ ] Adicionar validações para herois específicos

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests para melhorar o sistema.


*Este projeto não é afiliado oficialmente à Blizzard Entertainment ou Heroes of the Storm.*
