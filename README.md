
# ObraReport - API Gateway com Fallback e Deploy via Minikube

A **ObraReport API** é um gateway de envio e rastreamento de Relatórios Diários de Obra (RDO), que interage com múltiplos provedores externos. A API foi construída com **Node.js** e **MongoDB**, e implementa fallback automático caso o provedor principal falhe.

O projeto está preparado para ser executado localmente com **Minikube** e Kubernetes, com automação via `Makefile`.

---

## Requisitos

Antes de rodar o projeto, certifique-se de que as seguintes dependências estão instaladas:

- [`make`](https://www.gnu.org/software/make/)
- [`docker`](https://docs.docker.com/get-docker/) (utilizando o driver Docker no Minikube)
- [`minikube`](https://minikube.sigs.k8s.io/docs/start/)
- [`kubectl`](https://kubernetes.io/docs/tasks/tools/)

Versões recomendadas:
- Node.js `>=18` -> utilizada nos containers do docker
- Docker `>=20.10`
- Minikube `>=1.31`
---

## Estrutura do Projeto

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
├── Docker-compose          # Descrição dos containers
├── .env.example           # Define exemplos de configuração
└── README.md

```

segue abaixo uma reprodução do .env.example para registro de como estão configuradas as variáveis de controle do servidor
```
PORT=3000

# Provedor principal e secundário (pode alternar a ordem para testar fallback)
PRIMARY_PROVIDER=argelor
SECONDARY_PROVIDER=vate

# Endpoints dos provedores externos
PROVIDER_VATE_URL=http://localhost:3001
PROVIDER_ARGELOR_URL=http://localhost:3002

```
---

## Volumes e Persistência

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
## Testando os Endpoints

### POST `/reports`

Cria um novo Relatório Diário de Obra (RDO) em um dos provedores disponíveis. A API tenta o provedor primário; se falhar, realiza o fallback automaticamente para o secundário.

#### Corpo da requisição
```json
{
  "obra_id": "OBRA-001",
  "data": "2025-05-09",
  "clima": "ensolarado",
  "descricao": "Etapa de fundação iniciada",
  "equipe": ["João", "Ana"]
}
```
#### Resposta de sucesso
```json
{
  "id": "local-uuid",
  "externalId": "id-no-provedor",
  "provider": "vate"
}
```
#### Erro
```json
{
  "error": "Nenhum provedor disponível no momento."
}
```
#### CURL para testes

```bash
curl -X POST http://localhost:3000/reports   -H "Content-Type: application/json"   -d '{
    "obra_id": "OBRA-001",
    "data": "2025-05-09",
    "clima": "ensolarado",
    "descricao": "Fundação iniciada",
    "equipe": ["João", "Ana"]
  }'
```

### GET `/reports/:id` -> /reports/:localId`

Retorna o mapeamento de um RDO previamente criado, mostrando qual provedor foi utilizado e qual é o ID externo.

#### Resposta de sucesso
```json
{
  "id": "local-uuid",
  "externalId": "id-no-provedor",
  "provider": "argelor"
}
```
#### Erro
```json
{
  "error": "Relatório não encontrado"
}
```
#### CURL para testes

```bash
curl http://localhost:3000/reports/<localId>
```

### PUT `/reports/:id`

Atualiza um relatório existente diretamente no provedor original onde ele foi criado.

#### Corpo da requisição
```json
{
  "descricao": "Atualização da etapa de fundação",
  "clima": "nublado",
  "data": "2025-05-10",
  "equipe": ["João", "Ana", "Carlos"]
}
```
#### Resposta de sucesso
```json
{
  "status": "updated",
  "id": "id-no-provedor"
}
```
#### Erro

```json
{
  "error": "Relatório não encontrado"
}
```
#### CURL para testes

```bash
curl -X PUT http://localhost:3000/reports/<localId>   -H "Content-Type: application/json"   -d '{
    "descricao": "Etapa concluída",
    "clima": "nublado"
  }'
```
---

## 🧪 Simulação de falhas

Para simular falha no provedor primário, envie o cabeçalho HTTP:

```
X-Fail: true
```
A API retornará erro 500 simulado, acionando o fallback para o segundo provedor. O primário e secundário estão configurados no arquivo .env da api.  

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

## Rodando os Testes

Os testes automatizados estão localizados em src/tests.
Execute os testes a partir da pasta src com:
```
npx jest
```
---

## Autoria

Caio Souza Pimentel
[LinkedIn](https://www.linkedin.com/in/caiosouzapimentel/)
---
