# 💼 PRD: 연금저축·IRP·ISA 과세이연계좌 연말 세미나 안내 웹페이지

## 1. 📍 프로젝트 개요
- **프로젝트명:** 연금저축·IRP·ISA 과세이연계좌 연말 세미나 안내 페이지  
- **목적:**  
  개인 고객 및 지인 대상 세미나의  
  - 행사 일정 안내  
  - 신청 접수 및 질문 수집  
  - Google 스프레드시트 자동 저장  
  을 지원하는 단일 웹페이지 개발  
- **형태:** 정적 단일 페이지 (SPA 아님)  
- **배포:** GitHub 저장 → Cloudflare Pages 자동 배포  

---

## 2. ⚙️ 기술 스택
| 구분 | 사용 기술 |
|------|-------------|
| **Frontend** | HTML5 + TailwindCSS |
| **Form Handling** | Google Apps Script (Google Sheets 연동) |
| **Hosting** | Cloudflare Pages (GitHub 연동 배포) |
| **Font** | Noto Sans KR (Google Fonts) |
| **Repository 구조** | `/index.html`, `/assets/`, `/styles.css`, `/scripts/` |

---

## 3. 🧱 주요 섹션 구성

### 3.1 Hero 섹션 (상단)
- **목적:** 방문자에게 신뢰감과 행사의 핵심 정보를 전달  
- **구성 요소:**
  - 비정형 도형 패턴 배경 (부드러운 그라디언트 + 블루 톤 추상 패턴)
  - 제목:  
    ```
    연금저축·IRP·ISA  
    과세이연계좌 연말 세미나
    ```
  - 부제:  
    “미래를 준비하는 가장 현명한 방법을 함께 이야기합니다”
  - CTA 버튼: **“지금 신청하기”**  
    → 클릭 시 페이지 내 신청 폼으로 부드럽게 스크롤 이동  

---

### 3.2 행사 일정 섹션
| 항목 | 내용 |
|------|------|
| 📅 **일시** | 2025년 12월 10일 (수) 오후 7시 |
| 📍 **장소** | 서울시 강남구 ○○빌딩 3층 세미나룸 *(또는 Zoom 온라인)* |
| 👥 **대상** | Gia의 고객 및 지인 |
| 🎯 **주제** | 연금저축·IRP·ISA의 세제혜택과 절세 전략 |
| 🎁 **혜택** | 참석자 전원 세금 리포트 PDF 제공 |

- **디자인:** Card 또는 Table 형태, Tailwind `shadow-lg rounded-xl bg-white p-6` 스타일  
- **색상 포인트:** 주요 아이콘은 `#004AAD`, 포인트 라벨은 `#FFD166`

---

### 3.3 신청 폼 섹션
- **필드 구성:**
  | 필드명 | 타입 | 설명 |
  |---------|------|------|
  | 이름 | text | 필수 입력 |
  | 연락처 | tel | 휴대전화 번호 |
  | 궁금한 사항 | textarea | 선택 입력 |
- **버튼:**  
  “신청 완료” → 클릭 시 Google Apps Script를 통해 데이터 전송  
- **전송 완료 메시지:**  
  “신청이 접수되었습니다. 행사 전 안내문을 발송드릴 예정입니다.”

- **연동 구조:**
  ```
  [웹페이지 form] 
       ↓ (POST)
  [Google Apps Script Web App]
       ↓
  [Google Spreadsheet 자동 기록]
  ```

- **예상 스프레드시트 구조:**
  | Timestamp | 이름 | 연락처 | 궁금한 사항 |
  |------------|------|--------|--------------|

---

### 3.4 안내 배너 및 FAQ (옵션)
- “세미나는 무료로 진행됩니다.”  
- “현장 참석이 어려운 분은 온라인 링크를 통해 참여 가능합니다.”  
- **디자인:** 파란 배경 + 흰색 텍스트, `rounded-lg p-4 mt-6`

---

### 3.5 푸터
- **내용 예시:**
  ```
  © 2025 Gia Financial Seminar  
  문의: pension@yourdomain.com
  ```
- **아이콘:** 이메일 / 카카오채널 / SNS 선택 삽입  

---

## 4. 🎨 디자인 가이드

| 요소 | 기준 |
|------|------|
| **메인 컬러** | `#004AAD` (신뢰) |
| **보조 컬러** | `#F6F9FF`, `#FFD166` (따뜻함) |
| **폰트** | Noto Sans KR |
| **버튼 스타일** | 파란색 버튼 + 둥근 모서리 + hover 시 약간의 음영 |
| **배경** | 그라디언트 + 비정형 도형 (SVG 패턴 or CSS radial-gradient) |
| **레이아웃** | 세로 스크롤형 단일 페이지, 각 섹션 간 여백 충분히 확보 (`py-20` 수준) |
| **전체 톤앤매너** | 금융/세제 세미나에 맞는 신뢰, 안정, 전문성 중심 |

---

## 5. 🔐 Google Sheets 연동 설계

- **구조 요약:**
  1. Google Sheets 생성 → “응답 시트” 시트명 지정  
  2. Google Apps Script 코드 작성:
     - `doPost(e)` 함수로 데이터 수신  
     - 시트에 `appendRow([Timestamp, name, phone, question])`  
  3. `Deploy → New Deployment → Web App`  
     - Access: “Anyone”  
     - URL 복사 → HTML form `action` 속성에 삽입

- **예상 코드 개요:**
  ```js
  function doPost(e) {
    var sheet = SpreadsheetApp.openById('SHEET_ID').getSheetByName('응답 시트');
    var data = JSON.parse(e.postData.contents);
    sheet.appendRow([new Date(), data.name, data.phone, data.question]);
    return ContentService.createTextOutput('Success');
  }
  ```

---

## 6. ☁️ 배포 및 버전 관리

| 단계 | 설명 |
|------|------|
| 1 | GitHub 저장소 생성 (`seminar-landing`) |
| 2 | `index.html`, `tailwind.css`, `form.js` 등 커밋 |
| 3 | Cloudflare Pages 연결 (`main` 브랜치 자동 빌드) |
| 4 | 커스텀 도메인 연결 (선택) |
| 5 | Google Sheets URL을 `.env` 대신 직접 form action에 삽입 |

---

## 7. 🚀 향후 확장 방향
- ✅ 참석자 이메일 자동 회신 (Apps Script MailApp 이용)  
- ✅ 세미나 종료 후 만족도 설문 자동 발송  
- ✅ 접수된 질문 자동 요약 후 FAQ 업데이트  
- ✅ 관리자용 대시보드 (Google Data Studio 연결)
