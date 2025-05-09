
# ObraReport - Gerenciamento com Makefile e Minikube

A **ObraReport API** é um sistema gateway para envio e rastreamento de Relatórios Diários de Obra (RDO) que interage com provedores externos. A API foi construída com Node.js e mongoDB, e está preparada para fallback entre múltiplos provedores.

Este projeto utiliza um `Makefile` para automatizar o processo de build e deploy local com **Minikube + Kubernetes**. Com apenas um comando, você consegue subir todo o ambiente e acessar a API.

---

## Requisitos

Antes de rodar o projeto, certifique-se de que as seguintes dependências estão instaladas:

- `make`
- `minikube`
- `kubectl`
- `docker` (utilizando o driver Docker no Minikube)

---

## 📁 Estrutura do Projeto

```
ObraReportAPI/
├── src/                    # API Gateway principal
│   ├── controllers/
│   ├── adapters/
│   ├── services/
│   ├── routes/
│   ├── tests/
│   ├── utils/
│   ├── storage/            # Armazena o db.json para rastreamento
│   └── server.js
├── provider-vate/          # Provedor externo Vate (Express + MongoDB)
├── provider-argelor/       # Provedor externo Argelor (Express + MongoDB)
├── k8s/                    # Manifests Kubernetes
├── Makefile                # Automação de build e deploy
├── Docker-compose/         # Descrição dos containers
└── README.md

```
---

## ⚙️ Volumes e Persistência

- A API usa `lowdb` para rastrear onde cada RDO foi armazenado.
- O arquivo `db.json` é persistido dentro do container, na pasta `src/storage/`.

---

## Comandos disponíveis

### `make up`

Inicia todo o ambiente local:

1. Inicia o Minikube (se ainda não estiver rodando)
2. Configura o Docker local para usar o do Minikube
3. Constrói as imagens locais:
   - `api-gateway`
   - `provider-vate`
   - `provider-argelor`
4. Aplica os manifests Kubernetes da pasta `k8s/`
5. Cria o port-forward para acessar a API em `http://localhost:3000`

```bash
make up
```

---

### `make down`

Encerra o ambiente:

- Deleta os recursos do Kubernetes (deployments e services)
- Encerra o Minikube

```bash
make down
```
---

## Configuração dos Provedores

### provider-vate

- Porta: `3001`
- Banco: `mongodb://mongo-vate:27017/vate-db`
- Rota principal: `POST /reports`, `GET /reports/:id`, `PUT /reports/:id`

### provider-argelor

- Porta: `3002`
- Banco: `mongodb://mongo-argelor:27017/argelor-db`
- Rota principal: `POST /daily-reports`, `GET /daily-reports/:id`, `PUT /daily-reports/:id`

Os dois provedores são simulados com Express e persistem dados via MongoDB. O fallback da API funciona automaticamente caso o provedor principal falhe.

---
## Testando os Endpoints

### POST `/reports`

Cria um novo RDO em um dos provedores:

```bash
curl -X POST http://localhost:3000/reports   -H "Content-Type: application/json"   -d '{
    "obra_id": "OBRA-001",
    "data": "2025-05-09",
    "clima": "ensolarado",
    "descricao": "Fundação iniciada",
    "equipe": ["João", "Ana"]
  }'
```

### GET `/reports/:id`

Recupera o mapeamento local + provedor do RDO:

```bash
curl http://localhost:3000/reports/<localId>
```

### PUT `/reports/:id`

Atualiza o conteúdo de um RDO no provedor:

```bash
curl -X PUT http://localhost:3000/reports/<localId>   -H "Content-Type: application/json"   -d '{
    "descricao": "Etapa concluída",
    "clima": "nublado"
  }'
```

---

## Limpando imagens locais (opcional)

```bash
docker image prune -f
```

---
