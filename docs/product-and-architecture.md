# Tipmini 제품 및 아키텍처 문서

## 1. 제품 개요

Tipmini는 유용한 꿀팁을 저장하고 검색하는 정적 웹사이트다.

핵심 기능은 다음과 같다.

- 꿀팁 게시글 열람
- 제목과 본문을 포함한 Markdown 기반 콘텐츠
- 게시글별 태그
- 태그와 키워드 검색
- 게시글별 댓글
- 방문자의 꿀팁 제보
- 이미지 첨부

## 2. 운영 방향

Tipmini는 서버와 데이터베이스 없이 GitHub 저장소와 GitHub Pages를 기반으로 운영한다.

게시글은 저장소의 Markdown 파일을 원본 데이터로 사용한다. 빌드할 때 Markdown을 게시글 HTML로 변환하고, 브라우저 검색에 사용할 정적 검색 인덱스도 함께 생성한다.

댓글과 제보는 콘텐츠 파일과 성격이 다르므로 GitHub Discussions를 사용한다.

## 3. 권장 아키텍처

```text
Markdown 게시글 + 이미지
          |
          | GitHub Actions 빌드
          v
정적 HTML + 검색 인덱스
          |
          v
GitHub Pages

게시글 상세 페이지 -- giscus --> GitHub Discussions 댓글
사이트의 제보 버튼 -----------> GitHub Discussions 제보 카테고리
```

### 기술 구성

- 애플리케이션: SvelteKit
- 배포 형태: 정적 사이트
- 콘텐츠 원본: Git 저장소의 Markdown 파일
- 이미지: 저장소 내 정적 이미지 파일
- 배포: GitHub Pages
- 댓글: giscus + GitHub Discussions
- 제보: GitHub Discussions의 `꿀팁 제보` 카테고리
- 검색: 빌드 시 생성한 JSON 인덱스를 이용한 클라이언트 검색

## 4. 콘텐츠 모델

게시글은 예를 들어 다음과 같은 frontmatter를 가진다.

```md
---
title: 터미널에서 자주 쓰는 Git 명령어
slug: useful-git-commands
tags:
  - git
  - terminal
  - productivity
date: 2026-10-03
summary: 자주 사용하는 Git 명령어를 빠르게 확인하는 방법
---

본문을 Markdown으로 작성한다.

![설명 이미지](/images/example.png)
```

필수 필드:

- `title`: 게시글 제목
- `slug`: URL에 사용할 고유 식별자
- `tags`: 검색과 분류에 사용할 태그 목록
- `date`: 게시일 또는 정렬 기준일

선택 필드:

- `summary`: 목록과 검색 결과에 표시할 요약
- `image`: 대표 이미지
- `updated`: 수정일

예상 디렉터리 구조:

```text
content/tips/
  useful-git-commands.md
  mac-screenshot.md

static/images/
  example.png
```

## 5. 검색과 태그

빌드 과정에서 각 게시글의 제목, 요약, 본문 일부, 태그, URL을 포함하는 검색 인덱스를 생성한다.

```json
[
  {
    "title": "터미널에서 자주 쓰는 Git 명령어",
    "summary": "자주 사용하는 Git 명령어",
    "tags": ["git", "terminal"],
    "url": "/tips/useful-git-commands/"
  }
]
```

메인 페이지에서는 이 JSON을 불러와 다음 기능을 제공한다.

- 제목, 요약, 본문, 태그 검색
- 태그 클릭으로 필터링
- 여러 조건을 조합한 검색
- 검색 결과에서 게시글 상세 페이지로 이동

게시글 수가 크게 늘어나기 전까지는 별도 검색 서버 없이 브라우저 검색으로 처리한다.

## 6. 댓글

게시글 상세 페이지 하단에 giscus 댓글 영역을 표시한다.

giscus는 페이지의 경로 또는 URL을 기준으로 게시글과 GitHub Discussion을 연결한다. 댓글 데이터는 GitHub Discussions에 저장되므로 Tipmini 서버나 댓글 데이터베이스가 필요하지 않다.

댓글 정책:

- 댓글 작성에는 GitHub 로그인이 필요하다.
- 댓글은 게시글별 Discussion에 연결한다.
- 댓글 관리, 삭제, 신고, 스팸 대응은 GitHub Discussions에서 한다.
- 댓글이 없는 게시글도 정상적으로 열람할 수 있어야 한다.

## 7. 꿀팁 제보

사이트의 `꿀팁 제보하기` 버튼은 GitHub Discussions의 `꿀팁 제보` 카테고리로 연결한다.

제보 템플릿은 다음 항목을 포함한다.

```md
## 꿀팁 내용

## 사용 상황

## 관련 링크 또는 이미지

## 출처
```

제보 처리 흐름:

1. 방문자가 GitHub Discussions에 제보를 작성한다.
2. 운영자가 내용과 출처를 검토한다.
3. 게시할 내용을 Markdown 게시글로 정리한다.
4. 태그와 이미지를 추가한 뒤 저장소에 commit한다.
5. GitHub Actions가 사이트를 다시 빌드하고 GitHub Pages에 배포한다.

제보를 자동으로 게시글로 반영하지 않는 이유는 스팸, 중복, 출처 확인, 문서 품질 검토가 필요하기 때문이다.

## 8. 게시글 자체를 Discussions로 만들지 않는 이유

GitHub Discussions는 댓글과 제보에는 적합하지만, 정식 게시글 저장소로 사용하면 다음 문제가 생긴다.

- 사이트의 검색과 태그 화면을 직접 구성하기가 복잡해진다.
- Discussion 데이터를 API나 빌드 자동화로 가져와야 한다.
- 정식 콘텐츠와 제보, 자유로운 대화가 섞일 수 있다.
- 사이트의 URL, 레이아웃, SEO, 콘텐츠 버전을 통제하기 어렵다.
- GitHub 계정과 GitHub 서비스에 대한 의존성이 커진다.

따라서 정식으로 선별된 지식은 Markdown으로 관리하고, 상호작용이 필요한 부분만 Discussions에 맡긴다.

## 9. 배포 및 작성 흐름

```text
Markdown 또는 이미지 추가
          |
          v
Git commit / push
          |
          v
GitHub Actions에서 정적 사이트 빌드
          |
          v
GitHub Pages 배포
```

현재 구조에서는 사이트 내부에 관리자 로그인이나 게시글 작성 기능을 만들지 않는다. 운영자는 GitHub 웹 UI 또는 로컬 개발 환경에서 Markdown을 수정한다.

## 10. 단계별 구현 계획

### 1단계: 콘텐츠 기반

- 게시글 타입과 frontmatter 정의
- Markdown 로딩 및 HTML 렌더링
- 게시글 목록과 상세 페이지
- 태그 표시
- GitHub Pages 정적 배포

### 2단계: 검색과 탐색

- 검색 인덱스 생성
- 제목/본문/태그 검색
- 태그 필터
- 검색 결과 빈 상태와 오류 상태

### 3단계: 커뮤니티 기능

- giscus 댓글 영역
- GitHub Discussions 제보 카테고리와 템플릿
- `꿀팁 제보하기` 버튼
- 커뮤니티 이용 안내와 간단한 운영 정책

### 4단계: 품질 개선

- 중복 태그 정리
- 게시글 수정일 표시
- 이미지 최적화
- Open Graph 메타데이터
- RSS 또는 sitemap

## 11. 주요 제약

- GitHub 계정이 없는 사용자는 giscus 댓글과 GitHub Discussions 제보를 이용하기 어렵다.
- GitHub Actions가 실패하면 새 콘텐츠가 사이트에 배포되지 않는다.
- 브라우저 검색은 게시글이 매우 많아질 경우 성능을 점검해야 한다.
- 이미지 파일이 지나치게 커지면 저장소와 배포 용량 관리가 필요하다.
- 익명 댓글이나 사이트 내부 로그인은 별도의 외부 서비스 또는 서버가 필요하다.
