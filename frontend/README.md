# kari_SuperHeroAi

スーパーヒーローのレポジトリだよ！

## 環境構築

### Docker

Mac: [Docker](https://matsuand.github.io/docs.docker.jp.onthefly/desktop/mac/install/)

windows: [Docker](https://matsuand.github.io/docs.docker.jp.onthefly/desktop/windows/install/)

## インストール手順

リポジトリを落としてきます。

```
git clone git@github.com:sora-japan/kari_superheroAI.git
```

## Dockerを立ち上げる

```
cd SuperHeroAi

cp .env.example .env

docker compose up -d
```

## コンテナの入り方

```
docker exec -it superhero-frontend sh
docker exec -it superhero-backend sh
```

## 起動後にアクセスできるURL

| サービス    | URL                        |
| ----------- | -------------------------- |
| Frontend    | http://localhost:3000      |
| Backend API | http://localhost:8000      |
| Swagger UI  | http://localhost:8000/docs |
