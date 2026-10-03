---
title: 자주 사용하는 Git 명령어
slug: useful-git-commands
tags:
  - git
  - terminal
  - development
date: 2026-10-03
summary: 변경 사항 확인부터 커밋과 브랜치 관리까지 자주 쓰는 Git 명령어
---

Git을 매일 사용해도 명령어를 자주 검색하게 됩니다. 아래 명령어만 익혀두면 기본적인 작업은 대부분 처리할 수 있습니다.

## 변경 사항 확인

```bash
git status
git diff
```

`git status`는 수정된 파일과 현재 브랜치를 보여주고, `git diff`는 아직 커밋하지 않은 변경 내용을 확인할 때 사용합니다.

## 커밋 만들기

```bash
git add src/routes/+page.svelte
git commit -m "Add search input"
```

모든 변경 파일을 추가하려면 `git add .`을 사용할 수 있지만, 커밋 전에 `git status`로 포함될 파일을 한 번 확인하는 습관이 좋습니다.

## 브랜치 작업

```bash
git switch -c feature/search
git switch main
git log --oneline --decorate -10
```

새 기능은 별도 브랜치에서 작업하고, `git log --oneline`으로 최근 커밋을 간단히 확인할 수 있습니다.

## 마지막 커밋 메시지 수정

아직 원격 저장소에 push하지 않았다면 다음 명령어로 마지막 커밋 메시지를 수정할 수 있습니다.

```bash
git commit --amend -m "Correct commit message"
```

이미 공유한 커밋을 수정할 때는 다른 사람이 해당 커밋을 사용하고 있지 않은지 먼저 확인해야 합니다.
