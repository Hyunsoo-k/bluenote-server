## BlueNote-server
BlueNote 프로젝트(https://github.com/Hyunsoo-k/BlueNote) 의 RESTful-api 서버

## 기술 스택
- express
- mongoose

## 배포
Vercel기반 serverless function

## 설치
```
npm install
```

### 개발환경 실행
```
npm run dev
```

## 폴더 구조


```
bluenote-server
├─ app.js
├─ middleWare
│  ├─ auth
│  ├─ bbs
│  ├─ photoNews
│  ├─ recommendedNews
│  └─ user
├─ model
├─ package-lock.json
├─ package.json
├─ public
│  └─ images
├─ routes
├─ utils
├─ variable
└─ vercel.json

```

## 특징
프론트엔드와 api서버를 1인 개발하여 클라이언트, 서버간의 이슈의 원인을 빠르게 파악할 수 있었던 프로젝트 입니다.
