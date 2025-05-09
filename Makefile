# Diretórios
K8S_DIR=k8s
API_DIR=src
VATE_DIR=provider-vate
ARGELOR_DIR=provider-argelor

# Nomes das imagens
API_IMAGE=api-gateway
VATE_IMAGE=provider-vate
ARGELOR_IMAGE=provider-argelor

.PHONY: up down build images k8s

## Inicia o cluster, configura docker e sobe tudo
up: start-minikube docker-env build images k8s
	@echo "✅ Projeto ObraReport rodando em Minikube"
	@minikube service api-gateway --url
	@make proxy

## Desliga o cluster e remove todos os recursos
down:
	@echo "⛔ Desligando Minikube e removendo recursos..."
	kubectl delete -f $(K8S_DIR) || true
	minikube stop

## Inicia Minikube se ainda não estiver rodando
start-minikube:
	@echo "🚀 Iniciando Minikube (driver padrão: docker)"
	minikube start --driver=docker

## Aponta docker para o Minikube local
docker-env:
	@echo "🔧 Configurando ambiente docker local para Minikube"
	eval $$(minikube docker-env)

## Constrói todas as imagens localmente no contexto do Minikube
build:
	@echo "🔨 Buildando imagens para API e Provedores..."
	eval $$(minikube docker-env) && \
	docker build -t $(API_IMAGE):latest $(API_DIR) && \
	docker build -t $(VATE_IMAGE):latest $(VATE_DIR) && \
	docker build -t $(ARGELOR_IMAGE):latest $(ARGELOR_DIR)

## Aplica todos os arquivos .yaml no cluster
k8s:
	@echo "📦 Aplicando recursos Kubernetes..."
	kubectl apply -f $(K8S_DIR)

## Redireciona a porta da API Gateway para localhost:3000
proxy:
	kubectl port-forward service/api-gateway 3000:3000
