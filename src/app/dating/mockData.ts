export interface DatingCard {
  id: string;
  user_name: string;
  user_age: number;
  user_gender: "male" | "female";
  location: string;
  mbti?: string;
  photos: string[];
  introduction: string;
  interests: string[];
  createdAt: string;
  smoke: string;
  alcohol: string;
  charm_appeal: string;
  hobbies: string;
  special_skills: string;
  ideal_physical_type: string;
  ideal_personality_type: string;
  dating_style: string;
}

// 임시 예시 데이터
export const mockDatingCards: DatingCard[] = [
  {
    id: "1",
    user_name: "민수",
    user_age: 28,
    user_gender: "male",
    location: "서울 강남구",
    mbti: "ENFP",
    photos: [],
    introduction:
      "안녕하세요! 활발하고 긍정적인 성격의 28세 남성입니다. 여행과 음악을 좋아하고, 새로운 사람들과의 만남을 즐깁니다.",
    interests: ["여행", "음악", "독서", "영화"],
    createdAt: "2024-01-15",
    smoke: "비흡연",
    alcohol: "가끔 마셔요",
    charm_appeal: "밝은 에너지와 리액션, 먼저 다가가는 성격",
    hobbies: "주말마다 새로운 카페 탐방, 공연/페스티벌 가기",
    special_skills: "분위기 살리는 농담, 사람들 챙기는 리더십",
    ideal_physical_type: "웃는 모습이 예쁘고 캐주얼한 스타일을 선호",
    ideal_personality_type: "긍정적이고 대화가 잘 통하는 사람",
    dating_style: "자주 만나고 연락도 자주 하는 타입",
  },
  {
    id: "2",
    user_name: "지은",
    user_age: 26,
    user_gender: "female",
    location: "서울 서초구",
    mbti: "INFJ",
    photos: [],
    introduction:
      "조용하지만 깊이 있는 대화를 좋아합니다. 카페에서 책 읽는 것을 즐기고, 가끔 전시회나 공연을 보러 다닙니다.",
    interests: ["독서", "전시회", "요리", "산책"],
    createdAt: "2024-01-14",
    smoke: "비흡연",
    alcohol: "거의 안 마셔요",
    charm_appeal: "섬세한 배려와 공감 능력",
    hobbies: "에세이 읽기, 전시회/뮤지컬 관람, 브런치 요리",
    special_skills: "상대 이야기를 잘 들어주고 정리해주는 편",
    ideal_physical_type: "깔끔하고 단정한 이미지, 편안한 눈빛",
    ideal_personality_type: "성실하고 책임감 있으면서도 다정한 사람",
    dating_style: "천천히 알아가면서 깊게 이어가는 스타일",
  },
  {
    id: "3",
    user_name: "현우",
    user_age: 30,
    user_gender: "male",
    location: "서울 송파구",
    mbti: "ISTJ",
    photos: [],
    introduction:
      "체계적이고 계획적인 것을 좋아합니다. 운동과 독서를 즐기며, 안정적인 관계를 추구합니다.",
    interests: ["운동", "독서", "게임", "요리"],
    createdAt: "2024-01-13",
    smoke: "비흡연",
    alcohol: "가끔 마셔요",
    charm_appeal: "말은 적지만 약속은 꼭 지키는 타입",
    hobbies: "헬스, 추리 소설 읽기, 요리 레시피 따라 하기",
    special_skills: "계획 세우기, 일정/가계부 관리",
    ideal_physical_type: "편안한 캐주얼 룩, 건강한 이미지",
    ideal_personality_type: "차분하고 예의 바르며 신뢰감 있는 사람",
    dating_style: "자주 흔들리지 않고 꾸준하게 연락하는 스타일",
  },
  {
    id: "4",
    user_name: "수진",
    user_age: 27,
    user_gender: "female",
    location: "서울 마포구",
    mbti: "ESFP",
    photos: [],
    introduction:
      "밝고 에너지 넘치는 성격입니다! 맛집 탐방과 사진 찍는 것을 좋아하고, 친구들과의 모임을 즐깁니다.",
    interests: ["맛집", "사진", "쇼핑", "여행"],
    createdAt: "2024-01-12",
    smoke: "비흡연",
    alcohol: "주로 모임에서 마셔요",
    charm_appeal: "잘 웃고 리액션이 풍부한 점",
    hobbies: "신상 카페/맛집 가보기, 인생샷 찍기",
    special_skills: "분위기 메이커, 사진 잘 찍어주기",
    ideal_physical_type: "캐주얼하면서도 센스 있는 패션",
    ideal_personality_type: "편하게 웃고 떠들 수 있는 친구 같은 사람",
    dating_style: "데이트 코스를 알차게 챙기는 활동적인 스타일",
  },
  {
    id: "5",
    user_name: "준호",
    user_age: 29,
    user_gender: "male",
    location: "서울 강동구",
    mbti: "ENTP",
    photos: [],
    introduction:
      "호기심 많고 창의적인 것을 좋아합니다. 새로운 아이디어를 떠올리는 것을 즐기고, 다양한 분야에 관심이 많습니다.",
    interests: ["기술", "스타트업", "독서", "여행"],
    createdAt: "2024-01-11",
    smoke: "비흡연",
    alcohol: "분위기 있을 때 즐겨요",
    charm_appeal: "유머러스하면서도 생각이 깊은 편",
    hobbies: "사이드 프로젝트, 팟캐스트/유튜브로 공부하기",
    special_skills: "아이디어 브레인스토밍, 문제를 다른 각도에서 보기",
    ideal_physical_type: "깔끔한 캐주얼/비즈니스 캐주얼 스타일",
    ideal_personality_type: "대화가 잘 통하고 호기심 많은 사람",
    dating_style: "즉흥적인 데이트도 즐기는 자유로운 스타일",
  },
  {
    id: "6",
    user_name: "예린",
    user_age: 25,
    user_gender: "female",
    location: "서울 종로구",
    mbti: "ISFP",
    photos: [],
    introduction:
      "조용하지만 따뜻한 마음을 가진 사람입니다. 그림 그리기와 음악 감상을 좋아하고, 자연을 사랑합니다.",
    interests: ["그림", "음악", "자연", "요리"],
    createdAt: "2024-01-10",
    smoke: "비흡연",
    alcohol: "거의 안 마셔요",
    charm_appeal: "편안한 분위기와 따뜻한 말투",
    hobbies: "일러스트 그리기, 플레이리스트 만들기, 공원 산책",
    special_skills: "손재주가 좋아 DIY/소품 만들기",
    ideal_physical_type: "부드러운 이미지, 꾸안꾸 스타일",
    ideal_personality_type: "배려심 많고 감정 표현에 솔직한 사람",
    dating_style: "잔잔하게 함께 시간을 보내는 힐링 스타일",
  },
];


