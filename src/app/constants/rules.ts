interface Rule {
  id: number;
  title: string;
  content: string;
  category:
    | "fee"
    | "member"
    | "meeting"
    | "drinking"
    | "relationship"
    | "join"
    | "age"
    | "chat"
    | "hobby"
    | "leave"
    | "guest";
  important: boolean;
  article: string;
}

const rules: Rule[] = [
  {
    id: 1,
    title: "회비",
    content:
      "회원은 매월 2,000원의 회비를 납부하여야 한다.(매달 20일 벙1회 이상 참석자) 회비는 소모임 정기 결제 및 무제한 모임시 사용된다.",
    category: "fee",
    important: true,
    article: "제1조",
  },
  {
    id: 2,
    title: "신입회원 의무",
    content:
      "신입회원은 가입 후 2주 이내에 오프라인 모임에 참석하여야 한다. 정당한 사유가 있는 경우 운영진에게 사전 통지하여야 한다. 신입회원의 첫 번째 모임(이하 '첫 벙')은 선불로 결제 한다.",
    category: "member",
    important: true,
    article: "제2조 제1항",
  },
  {
    id: 3,
    title: "신입단톡 운영",
    content:
      "달달 본 단체채팅방의 채팅량이 많아 신입회원의 초기 적응이 어려운 점을 고려하여, 신입회원 전용 단체채팅방(이하 '신입단톡')을 운영한다. 신입회원은 가입 시 신입단톡에 우선 입장하며, 오프라인 모임(벙)에 1회 이상 참석한 이후 달달 본 단톡방 입장이 가능하다.",
    category: "member",
    important: true,
    article: "제2조 제1항",
  },
  {
    id: 4,
    title: "신입단톡 입장 제한",
    content:
      "첫 모임 참석 후 운영진이 적절하지 않다고 판단할 경우, 본방 입장을 제한하거나 강제 퇴장 조치할 수 있다. 신입단톡에는 운영진과 각 취미모임의 방장, 부방장 1명까지 입장할 수 있으며, 이 외 기존회원의 입장은 제한한다.",
    category: "member",
    important: true,
    article: "제2조 제1항",
  },
  {
    id: 5,
    title: "기존회원 의무",
    content:
      "기존회원은 최소 한 달에 한 번 이상 모임에 참석하여야 한다. 부득이한 사정이 있는 경우 운영진에게 사전 통지하여야 한다. 정당한 사유 없이 한 달간 모임에 참석하지 않을 경우 모임에서 나가야 한다.",
    category: "member",
    important: true,
    article: "제2조 제2항",
  },
  {
    id: 6,
    title: "별도 모임 금지",
    content:
      "소모임에서 벙이 아닌 3인 이상의 별도 모임 및 단체 채팅방 개설을 금지한다. 이를 위반할 경우 강제 탈퇴 조치한다. (필요한 경우 운영진에게 사전 공지하면 가능)",
    category: "member",
    important: true,
    article: "제2조 제3항",
  },
  {
    id: 7,
    title: "뒷담화 금지",
    content:
      "회원 간 뒷담화를 금지하며, 허위사실 유포로 인해 피해가 발생할 경우 책임은 본인에게 있다.",
    category: "member",
    important: true,
    article: "제2조 제3항",
  },
  {
    id: 8,
    title: "사전 확정 금지",
    content:
      "모든 모임(벙개) 진행 시, 총 정원의 절반 이상을 사전에 특정 인원으로 확정(미리 짜고)하는 것을 금지한다. 단, 모임 정원이 6인 이하일 경우 예외로 한다.",
    category: "member",
    important: true,
    article: "제2조 제3항",
  },
  {
    id: 9,
    title: "강퇴자 및 블랙리스트",
    content:
      "강퇴자와 블랙리스트는 모임 게스트로 참여 할 수 없다. 블랙리스트 지정 사유는 운영진 판단에 따라 결정하며, 명단은 운영진 내부에서만 공유한다.",
    category: "member",
    important: true,
    article: "제2조 제3항",
  },
  {
    id: 10,
    title: "게스트 참여 제한",
    content:
      "게스트(비회원)는 동일인이 월 2회 이상 모임에 참여할 수 없다. (단, 운영진 판단으로 허용할 수 있다.)",
    category: "guest",
    important: true,
    article: "제2조 제3항",
  },
  {
    id: 11,
    title: "인원 무제한 모임",
    content: "무제한 모임은 월 1회 개최한다. 월 회비는 무제한 모임에 사용한다.",
    category: "meeting",
    important: false,
    article: "제3조",
  },
  {
    id: 12,
    title: "오프라인 모임 개설",
    content:
      "오프라인 모임(이하 '벙')은 모임에 1회 이상 참석한 회원이 개설할 수 있다. 모임 비용은 1/N로 정산하며, 모든 내역을 투명하게 공개하여야 한다.",
    category: "meeting",
    important: false,
    article: "제4조",
  },
  {
    id: 13,
    title: "정산 규정",
    content:
      "벙 이후 하루 내 정산을 완료하여야 하며, 벙 개설자는 최소 2차까지 정산 책임을 진다.",
    category: "meeting",
    important: false,
    article: "제4조",
  },
  {
    id: 14,
    title: "참석 규정",
    content:
      "원칙적으로 정참(정시 참석)을 기준으로 하며, 지각할 경우 사전에 벙 개설자에게 통보하여야 한다. 늦게 참석하는 경우 다음 차수(2차)에 참여하는 것을 권장한다.",
    category: "meeting",
    important: false,
    article: "제4조",
  },
  {
    id: 15,
    title: "정산 참여 규정",
    content:
      "1, 2차 참석 여부와 관계없이 해당 차수에 참여한 경우 1/N 정산하여야 한다. (비음주자가 있다면 술값을 같이 1/N할지 여부는 벙 개설자 자유)",
    category: "meeting",
    important: false,
    article: "제4조",
  },
  {
    id: 16,
    title: "인원 마감 규정",
    content:
      "벙 인원이 마감되었을 경우 추가 인원 모집은 금지되며, 벙 개설자의 허락이 있을 경우에만 예외로 한다. 같은 날 기존 벙이 열려 있을 경우, 추가 벙 개설은 기존 벙이 마감된 경우에 한하여 가능하다. 단, 성격이 다른 모임일 경우 예외로 한다.",
    category: "meeting",
    important: false,
    article: "제4조",
  },
  {
    id: 17,
    title: "운영진 참석 권한",
    content:
      "모임장 및 운영진은 인원 마감 여부와 관계없이 모든 모임에 참석할 수 있다.",
    category: "meeting",
    important: false,
    article: "제4조",
  },
  {
    id: 18,
    title: "반복 참여 금지",
    content:
      "특정 회원들만 반복적으로 참여하는 벙 개설을 금지하며, 모임의 지속성을 고려하여 다양한 조합의 모임을 장려한다.",
    category: "meeting",
    important: false,
    article: "제4조",
  },
  {
    id: 19,
    title: "음주 규정",
    content:
      "회원은 자신의 주량을 초과하여 음주하지 않도록 주의하여야 한다. 술에 취한 경우 즉시 귀가하는 것을 원칙으로 한다. 술 강요, 욕설, 폭력, 시비 등의 행위를 금지하며, 이를 위반할 경우 즉시 제재한다.",
    category: "drinking",
    important: true,
    article: "제5조",
  },
  {
    id: 20,
    title: "신체 접촉 금지",
    content:
      "술자리에서 이성에게 과도한 신체 접촉을 하거나 불쾌감을 주는 행동을 금지한다. 본 조 위반 시 1회 구두경고 후 강제 탈퇴 조치한다.",
    category: "drinking",
    important: true,
    article: "제5조",
  },
  {
    id: 21,
    title: "이성 간 교류",
    content:
      "모임 내 연애는 자유이나, 과도한 플러팅 및 분위기 저해 행위를 금지한다. 이성 문제로 불편함을 느낀 회원은 언제든지 운영진에게 신고할 수 있다. 운영진은 신고 접수 후 객관적으로 상황을 판단하여 조치를 취할 수 있다.",
    category: "relationship",
    important: false,
    article: "제6조",
  },
  {
    id: 22,
    title: "가입 제한",
    content:
      "회원은 동종 사교 소모임에 최대 2개까지만 가입할 수 있다. 기혼자는 가입할 수 없으나, 가입 후 결혼한 경우에는 모임 참여가 가능하다.",
    category: "join",
    important: true,
    article: "제7조 제1항",
  },
  {
    id: 23,
    title: "재가입 규정",
    content:
      "탈퇴 후 재가입은 운영진의 논의를 거쳐 결정한다. 재가입 이후에는 달달 외 타 소모임 활동이 제한된다. (※ 동종 소모임 2개까지 가능하던 일반 회원과 달리, 재가입자는 달달 단일 활동만 허용됨)",
    category: "join",
    important: true,
    article: "제7조 제2항",
  },
  {
    id: 24,
    title: "재가입 시 회비",
    content:
      "재가입 시 월회비 2,000원을 즉시 납부해야 하며, 회비 미납 시 가입이 취소된다. 기존에 강퇴 또는 운영진 판단에 따라 문제 소지가 있었던 인물은 재가입이 불가하며, 예외적 판단은 운영진 회의를 통해 결정한다.",
    category: "join",
    important: true,
    article: "제7조 제2항",
  },
  {
    id: 25,
    title: "자소설 작성",
    content:
      "가입 후 1시간 이내 자기소개서를 작성하여야 하며, 이후에도 삭제해서는 안 된다.",
    category: "join",
    important: true,
    article: "제7조 제1항",
  },
  {
    id: 26,
    title: "연령 제한",
    content:
      "본 모임의 가입 연령 제한은 89년생(1989년 출생)까지로 한다. [회칙 개정 전 기존 가입자는 예외]",
    category: "age",
    important: true,
    article: "제8조",
  },
  {
    id: 27,
    title: "단체 채팅방 운영",
    content:
      "가입 후 자기소개 글을 작성한 회원에 한하여 단체 채팅방 초대 링크를 제공한다. 운영진을 제외한 모든 회원은 오픈 프로필을 설정하여야 한다.",
    category: "chat",
    important: false,
    article: "제9조",
  },
  {
    id: 28,
    title: "회칙 개정",
    content:
      "회칙 개정은 운영진 회의를 통해 개정한다. 개정 전에 일어난 일은 소급해서 적용하지 않는다.",
    category: "member",
    important: false,
    article: "제10조",
  },
  {
    id: 29,
    title: "취미 모임 운영",
    content:
      "달달 모임 내에서 취미에 따라 다양한 소모임(이하 '취미모임')을 운영할 수 있다. 취미모임 가입은 자율이며, 복수 가입도 가능하다. 취미 모임과는 별개로, 회원은 달달 모임에 월 1회 이상 참석하여야 한다. (취미 모임을 참여하고 달달모임 월1회 미참여시 제제)",
    category: "hobby",
    important: false,
    article: "제11조",
  },
  {
    id: 30,
    title: "취미모임 운영자",
    content:
      "취미모임은 오픈채팅방으로 운영하며, 각 모임별로 운영자를 지정한다. 운영자는 해당 취미모임을 관리하고, 월 1회 이상 모임을 주최해야 한다. 신입회원은 달달방 외 1개 이상의 취미모임 가입을 권장한다. (달달방 인원이 많아 친목 유도를 위한 목적)",
    category: "hobby",
    important: false,
    article: "제11조",
  },
  {
    id: 31,
    title: "취미모임 개설",
    content:
      "회원 누구나 새로운 취미를 주제로 모임 개설을 제안할 수 있으며, 모임 개설은 달달 운영진이 진행한다.(EX 여행, 제테크, 운동, 독서 등) 달달 운영진은 모든 취미모임에 가입해야 한다.",
    category: "hobby",
    important: false,
    article: "제11조",
  },
  {
    id: 32,
    title: "취미모임 운영자 제한",
    content:
      "취미모임의 운영자는 '달달' 단일 모임 소속자여야 하며, 다른 소모임과 병행할 수 없다.(단 운영진 판단으로 예외 가능)",
    category: "hobby",
    important: false,
    article: "제11조",
  },
  {
    id: 33,
    title: "달달헬스 참여",
    content: "취미모임에 달달헬스 회원이 참여할 수 있다.",
    category: "hobby",
    important: false,
    article: "제11조",
  },
  {
    id: 34,
    title: "외출 규정",
    content:
      "회원은 최대 1년 중 1개월 이내 범위에서 외출(임시 활동 중단)을 신청할 수 있다. [소모임은 가입 유지, '단톡방 나가기'] 외출 신청 시 사전에 운영진에게 외출 사유 및 기간을 반드시 전달하여야 한다.",
    category: "leave",
    important: false,
    article: "제12조",
  },
  {
    id: 35,
    title: "외출 연장 및 탈퇴",
    content:
      "불가피한 사정이 있는 경우에 한하여, 운영진 논의를 거쳐 최대 6개월 범위 내에서 외출 연장이 가능하다. 외출 기간이 1개월을 초과하는 경우 원칙적으로 탈퇴 처리한다. 외출자는 달달 본 모임 단체채팅방에서는 퇴장 처리되나, 취미모임에는 계속 참여할 수 있다.",
    category: "leave",
    important: false,
    article: "제12조",
  },
  {
    id: 36,
    title: "게스트 참여",
    content:
      "게스트(비회원)의 참여는 벙 주최자(벙주)의 사전 허락을 받아야 한다. 성비가 심하게 불균형하지 않은 범위 내에서 자유롭게 게스트를 받을 수 있다. (예: 남초면 여성 게스트, 여초면 남성 게스트 우선 허용)",
    category: "guest",
    important: false,
    article: "제13조",
  },
  {
    id: 37,
    title: "게스트 제한",
    content:
      "강퇴된 회원은 어떤 방식으로도 참여할 수 없다. 탈퇴 회원의 참여는 운영진의 동의를 필요로 한다. 벙주는 자율적으로 게스트 여부를 판단하고, 참여 후 전체 참여자가 불편함을 느끼지 않도록 책임을 진다.",
    category: "guest",
    important: false,
    article: "제13조",
  },
];

export default rules;
