# 달달 - 데이팅 앱

Next.js와 Supabase를 활용한 현대적인 데이팅 웹 애플리케이션입니다.

## 🚀 주요 기능

### 🔐 인증 시스템

- 이메일/비밀번호 기반 회원가입 및 로그인
- Supabase Auth를 활용한 안전한 인증
- 로그인 상태에 따른 조건부 UI

### 📝 자소설 시스템

- 개인화된 자소설 작성 및 관리
- 사진 업로드 (최대 6장)
- 관심사 태그 시스템
- 실시간 검색 및 필터링
- 성별, 관심사별 필터링

### 💕 슈퍼 데이트 신청

- 마음에 드는 상대방에게 특별한 데이트 제안
- 진심 어린 메시지와 함께 신청
- 신청 상태 관리 (대기/수락/거절)

### 💬 달달톡 (익명 채팅)

- 실시간 익명 채팅 시스템
- 닉네임 설정 후 채팅방 입장
- 실시간 접속자 수 표시
- 타이핑 중인 사용자 표시 애니메이션
- Enter 키로 빠른 메시지 전송

### 🎨 사용자 경험

- 반응형 디자인 (모바일/데스크톱)
- 로딩 상태 및 에러 처리
- 직관적인 네비게이션
- 실시간 데이터 동기화

## 🛠 기술 스택

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI Components**: Lucide React Icons
- **State Management**: React Context API
- **Styling**: Tailwind CSS

## 📦 설치 및 실행

### 1. 저장소 클론

```bash
git clone <repository-url>
cd daldal
```

### 2. 의존성 설치

```bash
npm install
# 또는
yarn install
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabase 데이터베이스 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트를 생성하세요.
2. SQL Editor에서 `supabase-schema.sql` 파일의 내용을 실행하세요.
3. 프로젝트 설정에서 URL과 anon key를 복사하여 환경 변수에 설정하세요.

### 5. 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 🗄 데이터베이스 스키마

### self_introductions 테이블

- 사용자 기본 정보 (이름, 나이, 성별, 거주지)
- 자소설 내용 (제목, 내용, 관심사 태그)
- 사진 업로드 및 통계 (좋아요, 조회수)

### super_date_requests 테이블

- 슈퍼 데이트 신청 정보
- 신청자 및 대상자 정보
- 메시지 및 상태 관리

### chat_messages 테이블

- 익명 채팅 메시지 저장
- 닉네임, 메시지 내용, 생성 시간

### typing_status 테이블

- 실시간 타이핑 상태 관리
- 사용자별 타이핑 시작/종료 시간

### online_users 테이블

- 실시간 접속자 관리
- 사용자별 마지막 활동 시간

### chat_messages 테이블

- 익명 채팅 메시지 저장
- 닉네임, 메시지 내용, 생성 시간

### typing_status 테이블

- 실시간 타이핑 상태 관리
- 사용자별 타이핑 시작/종료 시간

### online_users 테이블

- 실시간 접속자 관리
- 사용자별 마지막 활동 시간

## 🔒 보안

- Row Level Security (RLS) 활성화
- 사용자별 데이터 접근 제어
- 인증된 사용자만 데이터 수정 가능
- SQL 인젝션 방지

## 📱 페이지 구조

- `/` - 홈페이지
- `/introductions` - 자소설 목록
- `/introductions/write` - 자소설 작성
- `/super-date` - 슈퍼 데이트 신청
- `/daldalChat` - 달달톡 (익명 채팅)
- `/profile` - 내 정보 (로그인 필요)
- `/rules` - 모임회칙
- `/announcements` - 공지사항

## 🎯 주요 컴포넌트

- `Navigation.tsx` - 메인 네비게이션
- `LoginModal.tsx` - 로그인 모달
- `SignupModal.tsx` - 회원가입 모달
- `AuthContext.tsx` - 인증 상태 관리
- `SelfIntroductionForm.tsx` - 자소설 작성 폼

## 🔧 API 함수

### 자소설 관련

- `selfIntroductionAPI.getAll()` - 모든 자소설 조회
- `selfIntroductionAPI.create()` - 자소설 생성
- `selfIntroductionAPI.update()` - 자소설 수정
- `selfIntroductionAPI.delete()` - 자소설 삭제

### 슈퍼 데이트 관련

- `superDateAPI.create()` - 슈퍼 데이트 신청 생성
- `superDateAPI.updateStatus()` - 신청 상태 업데이트
- `superDateAPI.getReceivedByUserId()` - 받은 신청 조회
- `superDateAPI.getSentByUserId()` - 보낸 신청 조회

## 🚀 배포

### Vercel 배포

1. GitHub에 코드를 푸시하세요.
2. [Vercel](https://vercel.com)에서 새 프로젝트를 생성하세요.
3. 환경 변수를 설정하세요.
4. 배포를 완료하세요.

### Supabase 설정

- 프로덕션 환경에서 RLS 정책이 올바르게 설정되었는지 확인하세요.
- Storage 버킷 권한을 설정하세요 (사진 업로드용).

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.
